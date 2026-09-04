const os = require('os');
const fs = require('fs');

const interfaces = os.networkInterfaces();

let ip;

for (const name of Object.keys(interfaces)) {
    for (const network of interfaces[name]) {
        if (
            network.family === 'IPv4' &&
            !network.internal &&
            !network.address.startsWith('127.')
        ) {
            ip = network.address;
            break;
        }
    }

    if (ip) break;
}

if (!ip) {
    throw new Error('Could not find local IP address');
}

const envPath = '.env';

let env = '';

if (fs.existsSync(envPath)) {
    env = fs.readFileSync(envPath, 'utf8');
}

env = env.replace(/^EXPO_PUBLIC_API_URL=.*$/m, '');

env += `\nEXPO_PUBLIC_API_URL=http://${ip}:3000/api\n`;

fs.writeFileSync(envPath, env);

console.log(`API URL: http://${ip}:3000/api`);