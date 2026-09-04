import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const certsDir = path.join(rootDir, 'apps', 'mobile', 'certs');
const privateKeyPath = path.join(certsDir, 'private-key.pem');
const certificatePath = path.join(certsDir, 'certificate.pem');

if (!fs.existsSync(certsDir)) {
  fs.mkdirSync(certsDir, { recursive: true });
}

console.log('🔑 Generating RSA 2048 Keypair and Self-Signed Certificate for Expo Updates code signing...');

try {
  // Generate private key and self-signed X.509 certificate using openssl
  execSync(
    `openssl req -x509 -newkey rsa:2048 -keyout "${privateKeyPath}" -out "${certificatePath}" -nodes -days 3650 -subj "/CN=PocketPilotOTA"`,
    { stdio: 'inherit' }
  );

  console.log('✅ Keys generated successfully!');
  console.log(`   Public Certificate: ${certificatePath}`);
  console.log(`   Private Key: ${privateKeyPath}`);
  console.log('⚠️  IMPORTANT: Never commit private-key.pem to Git!');
} catch (error) {
  console.error('❌ Failed to generate keys using openssl:', error.message);
  process.exit(1);
}
