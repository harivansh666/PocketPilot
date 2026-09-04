import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

// Helper to load env variables natively
function loadEnv(envPath) {
  if (fs.existsSync(envPath)) {
    const lines = fs.readFileSync(envPath, 'utf-8').split('\n');
    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith('#') && trimmed.includes('=')) {
        const [key, ...vals] = trimmed.split('=');
        const val = vals.join('=').trim().replace(/^["']|["']$/g, '');
        if (key.trim() && !process.env[key.trim()]) {
          process.env[key.trim()] = val;
        }
      }
    }
  }
}

loadEnv(path.join(rootDir, '.env'));
loadEnv(path.join(rootDir, 'apps', 'mobile', '.env'));

const vpsUrl = (process.env.OTA_VPS_URL || 'https://pocketpilotapp.vercel.app').replace(/\/$/, '');
const otaSecret = process.env.OTA_ADMIN_SECRET || 'pocketpilot-ota-secret-key';
const mobileDir = path.join(rootDir, 'apps', 'mobile');
const distDir = path.join(mobileDir, 'dist');
const metadataPath = path.join(distDir, 'metadata.json');

console.log('🚀 Starting Self-Hosted OTA Update Process...');

// Step 1: Export JS/TS/UI bundle via Expo CLI
console.log('📦 Step 1: Exporting Android bundle with Expo CLI...');
try {
  execSync('npx expo export --platform android', {
    cwd: mobileDir,
    stdio: 'inherit',
  });
} catch (e) {
  console.error('❌ Expo export failed:', e.message);
  process.exit(1);
}

if (!fs.existsSync(metadataPath)) {
  console.error('❌ dist/metadata.json not found after expo export!');
  process.exit(1);
}

// Step 2: Parse metadata & read app configuration
console.log('🔍 Step 2: Processing exported bundle and assets...');
const metadata = JSON.parse(fs.readFileSync(metadataPath, 'utf-8'));
const appJsonPath = path.join(mobileDir, 'app.json');
const appJson = JSON.parse(fs.readFileSync(appJsonPath, 'utf-8'));
const runtimeVersion = appJson.expo?.version || '1.0.0';

const androidMetadata = metadata.fileMetadata?.android;
if (!androidMetadata) {
  console.error('❌ No android metadata found in dist/metadata.json!');
  process.exit(1);
}

function getMimeType(ext) {
  switch (ext?.toLowerCase()) {
    case 'png': return 'image/png';
    case 'jpg':
    case 'jpeg': return 'image/jpeg';
    case 'ttf': return 'font/ttf';
    case 'otf': return 'font/otf';
    case 'xml': return 'application/xml';
    case 'svg': return 'image/svg+xml';
    case 'json': return 'application/json';
    case 'hbc':
    case 'js': return 'application/javascript';
    default: return 'application/octet-stream';
  }
}

function computeBase64UrlHash(buffer) {
  return crypto.createHash('sha256').update(buffer).digest('base64url');
}

const assetFiles = [];

// 1. Process Launch Asset (JS/HBC bundle)
const bundleRelPath = androidMetadata.bundle;
const bundleAbsPath = path.join(distDir, bundleRelPath);
if (!fs.existsSync(bundleAbsPath)) {
  console.error(`❌ Bundle file not found at ${bundleAbsPath}`);
  process.exit(1);
}

const bundleBuffer = fs.readFileSync(bundleAbsPath);
const bundleHash = computeBase64UrlHash(bundleBuffer);
const bundleKey = path.basename(bundleRelPath, path.extname(bundleRelPath));

const launchAsset = {
  key: bundleKey,
  contentType: 'application/javascript',
  url: `${vpsUrl}/api/updates/assets/${bundleRelPath}`,
  hash: bundleHash,
  fileExtension: path.extname(bundleRelPath) || '.hbc',
};

assetFiles.push({
  key: bundleKey,
  path: bundleRelPath,
  ext: (path.extname(bundleRelPath) || '.hbc').replace(/^\./, ''),
  contentType: 'application/javascript',
  hash: bundleHash,
  contentBase64: bundleBuffer.toString('base64'),
});

// 2. Process Static Assets
const assets = [];
for (const asset of androidMetadata.assets || []) {
  let assetRelPath = asset.path;
  let assetAbsPath = path.join(distDir, assetRelPath);
  if (!fs.existsSync(assetAbsPath) && asset.ext) {
    assetRelPath = `${asset.path}.${asset.ext}`;
    assetAbsPath = path.join(distDir, assetRelPath);
  }

  if (!fs.existsSync(assetAbsPath)) {
    console.warn(`⚠️ Asset file missing: ${assetAbsPath}, skipping...`);
    continue;
  }

  const assetBuffer = fs.readFileSync(assetAbsPath);
  const assetHash = computeBase64UrlHash(assetBuffer);
  const assetKey = path.basename(asset.path);
  const contentType = getMimeType(asset.ext);

  assets.push({
    key: assetKey,
    contentType,
    url: `${vpsUrl}/api/updates/assets/${assetRelPath}`,
    hash: assetHash,
    fileExtension: asset.ext ? `.${asset.ext}` : '',
  });

  assetFiles.push({
    key: assetKey,
    path: assetRelPath,
    ext: asset.ext || '',
    contentType,
    hash: assetHash,
    contentBase64: assetBuffer.toString('base64'),
  });
}

const payload = {
  runtimeVersion,
  platform: 'android',
  channel: 'production',
  launchAsset,
  assets,
  assetFiles,
  metadata: {
    publishedAt: new Date().toISOString(),
    tool: 'pnpm mobile:update',
  },
};

// Step 3: Write locally to apps/server/uploads/updates for fallback/local VPS storage
const serverUploadsDir = path.join(rootDir, 'apps', 'server', 'uploads', 'updates');
const localAssetsDir = path.join(serverUploadsDir, 'assets');
const localManifestsDir = path.join(serverUploadsDir, 'manifests');

if (!fs.existsSync(localAssetsDir)) fs.mkdirSync(localAssetsDir, { recursive: true });
if (!fs.existsSync(localManifestsDir)) fs.mkdirSync(localManifestsDir, { recursive: true });

// Copy assets locally
for (const file of assetFiles) {
  const dest = path.join(localAssetsDir, file.path);
  const destDir = path.dirname(dest);
  if (!fs.existsSync(destDir)) fs.mkdirSync(destDir, { recursive: true });
  fs.writeFileSync(dest, Buffer.from(file.contentBase64, 'base64'));
}

console.log(`💾 Saved ${assetFiles.length} asset files to local VPS uploads directory.`);

// Step 4: Publish to VPS HTTP Endpoint
console.log(`📡 Step 4: Uploading assets and publishing manifest to VPS (${vpsUrl})...`);

try {
  let uploadedCount = 0;
  for (const file of assetFiles) {
    const rawBuffer = Buffer.from(file.contentBase64, 'base64');
    const uploadRes = await fetch(`${vpsUrl}/api/updates/upload-asset`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/octet-stream',
        'x-ota-secret': otaSecret,
        'x-asset-path': file.path,
      },
      body: rawBuffer,
    });
    if (!uploadRes.ok) {
      console.warn(`⚠️ Failed to upload asset ${file.path} (${uploadRes.status})`);
    } else {
      uploadedCount++;
    }
  }
  console.log(`⬆️ Uploaded ${uploadedCount}/${assetFiles.length} assets to VPS.`);

  const publishPayload = {
    runtimeVersion,
    platform: 'android',
    channel: 'production',
    launchAsset,
    assets,
    metadata: {
      publishedAt: new Date().toISOString(),
      tool: 'pnpm mobile:update',
    },
  };

  const response = await fetch(`${vpsUrl}/api/updates/publish`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-ota-secret': otaSecret,
    },
    body: JSON.stringify(publishPayload),
  });

  if (response.ok) {
    const resData = await response.json();
    console.log('\n✅ OTA UPDATE PUBLISHED SUCCESSFULLY!');
    console.log(`   Update ID: ${resData.updateId || resData.data?.updateId}`);
    console.log(`   Runtime Version: ${runtimeVersion}`);
    console.log(`   Platform: android`);
    console.log(`   Channel: production`);
    console.log(`   Target VPS URL: ${vpsUrl}\n`);
  } else {
    const errorText = await response.text();
    console.warn(`⚠️ Remote HTTP publish received status ${response.status}: ${errorText}`);
    console.log('ℹ️ Local VPS upload directory updated successfully as fallback.');
  }
} catch (err) {
  console.warn(`⚠️ Could not connect to remote VPS endpoint (${vpsUrl}): ${err.message}`);
  console.log('ℹ️ Local VPS upload directory updated successfully as fallback.');
}
