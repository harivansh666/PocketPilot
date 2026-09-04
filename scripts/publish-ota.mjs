import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

// Helper to load env variables natively from multiple locations
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

// Load env files in priority order
loadEnv(path.join(rootDir, '.env'));
loadEnv(path.join(rootDir, 'apps', 'mobile', '.env'));
loadEnv(path.join(rootDir, 'apps', 'server', '.env'));

// Determine mode (production vs development/local)
const mode = (
  process.env.MODE ||
  process.env.EXPO_PUBLIC_MODE ||
  process.env.EXPO_MODE ||
  'production'
).toLowerCase();

const prodUrl = process.env.PROD_API_URL || process.env.EXPO_PUBLIC_API_URL_PRODUCTION || 'https://pocketpilotapp.vercel.app';
const localUrl = process.env.LOCAL_API_URL || process.env.EXPO_PUBLIC_API_URL_LOCAL || process.env.EXPO_PUBLIC_API_URL || 'http://localhost:5000';

const rawTargetUrl = (mode === 'production' || mode === 'prod') ? prodUrl : localUrl;

function buildEndpointUrl(baseUrl, endpoint) {
  const cleanBase = baseUrl.replace(/\/$/, '');
  const cleanEndpoint = endpoint.replace(/^\//, '');

  if (cleanBase.endsWith('/api') && cleanEndpoint.startsWith('api/')) {
    return `${cleanBase}/${cleanEndpoint.slice(4)}`;
  }
  if (!cleanBase.endsWith('/api') && !cleanEndpoint.startsWith('api/')) {
    return `${cleanBase}/api/${cleanEndpoint}`;
  }
  return `${cleanBase}/${cleanEndpoint}`;
}

const vpsUrl = rawTargetUrl.replace(/\/$/, '');
const uploadAssetUrl = buildEndpointUrl(vpsUrl, '/api/updates/upload-asset');
const publishUrl = buildEndpointUrl(vpsUrl, '/api/updates/publish');
const otaSecret = process.env.OTA_ADMIN_SECRET || 'pocketpilot-ota-secret-key';

const mobileDir = path.join(rootDir, 'apps', 'mobile');
const distDir = path.join(mobileDir, 'dist');
const metadataPath = path.join(distDir, 'metadata.json');

console.log('🚀 Starting Self-Hosted OTA Update Process...');
console.log(`📌 Environment MODE: ${mode.toUpperCase()}`);
console.log(`🌐 Base Server URL: ${vpsUrl}`);

// Step 1: Export JS/TS/UI bundle via Expo CLI
console.log('\n📦 Step 1: Exporting Android bundle with Expo CLI...');
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
console.log('\n🔍 Step 2: Processing exported bundle and assets...');
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
const assetBaseUrl = buildEndpointUrl(vpsUrl, '/api/updates/assets');

const launchAsset = {
  key: bundleKey,
  contentType: 'application/javascript',
  url: `${assetBaseUrl}/${bundleRelPath}`,
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
    url: `${assetBaseUrl}/${assetRelPath}`,
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

// Step 3: Write locally to apps/server/uploads/updates for fallback/local storage
const serverUploadsDir = path.join(rootDir, 'apps', 'server', 'uploads', 'updates');
const localAssetsDir = path.join(serverUploadsDir, 'assets');
const localManifestsDir = path.join(serverUploadsDir, 'manifests');

try {
  if (!fs.existsSync(localAssetsDir)) fs.mkdirSync(localAssetsDir, { recursive: true });
  if (!fs.existsSync(localManifestsDir)) fs.mkdirSync(localManifestsDir, { recursive: true });

  for (const file of assetFiles) {
    const dest = path.join(localAssetsDir, file.path);
    const destDir = path.dirname(dest);
    if (!fs.existsSync(destDir)) fs.mkdirSync(destDir, { recursive: true });
    fs.writeFileSync(dest, Buffer.from(file.contentBase64, 'base64'));
  }
  console.log(`💾 Saved ${assetFiles.length} asset files to local server uploads directory.`);
} catch (e) {
  // Ignored if local folder write fails
}

// Step 4: Upload Assets & Publish Manifest to Server API
console.log(`\n📡 Step 4: Uploading assets and publishing manifest to server...`);
console.log(`   Upload URL: ${uploadAssetUrl}`);
console.log(`   Publish URL: ${publishUrl}`);

try {
  let uploadedCount = 0;
  for (const file of assetFiles) {
    const rawBuffer = Buffer.from(file.contentBase64, 'base64');
    try {
      const uploadRes = await fetch(uploadAssetUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/octet-stream',
          'x-ota-secret': otaSecret,
          'x-asset-path': file.path,
        },
        body: rawBuffer,
      });
      if (!uploadRes.ok) {
        console.warn(`⚠️ Asset upload notice for ${file.path} (${uploadRes.status})`);
      } else {
        uploadedCount++;
      }
    } catch (e) {
      console.warn(`⚠️ Asset upload warning for ${file.path}: ${e.message}`);
    }
  }
  console.log(`⬆️ Uploaded ${uploadedCount}/${assetFiles.length} assets.`);

  const publishPayload = {
    runtimeVersion,
    platform: 'android',
    channel: 'production',
    launchAsset,
    assets,
    metadata: {
      publishedAt: new Date().toISOString(),
      tool: 'pnpm mobile:update',
      mode,
    },
  };

  const response = await fetch(publishUrl, {
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
    console.log(`   Environment Mode: ${mode.toUpperCase()}`);
    console.log(`   Target Server URL: ${vpsUrl}\n`);
  } else {
    const errorText = await response.text();
    console.warn(`⚠️ Remote HTTP publish status ${response.status}: ${errorText}`);
  }
} catch (err) {
  console.warn(`⚠️ Could not reach server endpoint (${vpsUrl}): ${err.message}`);
}
