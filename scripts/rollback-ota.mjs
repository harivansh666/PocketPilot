import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

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
const targetUpdateId = process.argv[2];

const appJsonPath = path.join(rootDir, 'apps', 'mobile', 'app.json');
const appJson = JSON.parse(fs.readFileSync(appJsonPath, 'utf-8'));
const runtimeVersion = appJson.expo?.version || '1.0.0';

console.log('🔄 Initiating OTA Update Rollback...');
console.log(`   Runtime Version: ${runtimeVersion}`);
console.log(`   Platform: android`);
console.log(`   Target Update ID: ${targetUpdateId || 'Previous Version / Embedded Fallback'}`);

const payload = {
  runtimeVersion,
  platform: 'android',
  channel: 'production',
  targetUpdateId: targetUpdateId || undefined,
};

// 1. Update local storage map if running locally
const serverUploadsDir = path.join(rootDir, 'apps', 'server', 'uploads', 'updates');
const activeManifestsPath = path.join(serverUploadsDir, 'active-manifests.json');

if (fs.existsSync(activeManifestsPath)) {
  try {
    const activeMap = JSON.parse(fs.readFileSync(activeManifestsPath, 'utf-8'));
    const key = `${runtimeVersion}:android:production`;
    if (activeMap[key]) {
      if (targetUpdateId) {
        activeMap[key].activeUpdateId = targetUpdateId;
      } else if (activeMap[key].history && activeMap[key].history.length > 1) {
        activeMap[key].history.pop();
        activeMap[key].activeUpdateId = activeMap[key].history[activeMap[key].history.length - 1];
      } else {
        activeMap[key].activeUpdateId = null;
      }
      fs.writeFileSync(activeManifestsPath, JSON.stringify(activeMap, null, 2), 'utf-8');
      console.log(`💾 Local VPS active map updated: activeUpdateId = ${activeMap[key].activeUpdateId || 'null (embedded)'}`);
    }
  } catch (e) {
    console.warn('⚠️ Could not update local active map:', e.message);
  }
}

// 2. Call VPS endpoint
try {
  const response = await fetch(`${vpsUrl}/api/updates/rollback`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-ota-secret': otaSecret,
    },
    body: JSON.stringify(payload),
  });

  if (response.ok) {
    const data = await response.json();
    console.log('\n✅ OTA ROLLBACK SUCCESSFUL!');
    console.log(`   Message: ${data.message || data.data?.message || 'Rollback executed'}\n`);
  } else {
    const errText = await response.text();
    console.warn(`⚠️ VPS Rollback endpoint returned ${response.status}: ${errText}`);
  }
} catch (e) {
  console.warn(`⚠️ Could not reach VPS endpoint (${vpsUrl}): ${e.message}`);
}
