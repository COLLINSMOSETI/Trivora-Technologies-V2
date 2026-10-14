const fs = require('node:fs');
const path = require('node:path');

const sourceDir = __dirname;
const outputDir = path.join(sourceDir, 'dist');
const rawApiBase = process.env.TRIVORA_API_BASE;

if (process.env.VERCEL === '1' && !rawApiBase) {
  throw new Error('Set TRIVORA_API_BASE in the Vercel project environment before deploying.');
}

const apiBase = (rawApiBase || 'http://localhost:5000/api').replace(/\/+$/, '');
let apiUrl;
try {
  apiUrl = new URL(apiBase);
} catch {
  throw new Error('TRIVORA_API_BASE must be a valid absolute API URL.');
}

if (!['http:', 'https:'].includes(apiUrl.protocol) || apiUrl.pathname !== '/api' || apiUrl.search || apiUrl.hash) {
  throw new Error('TRIVORA_API_BASE must be an HTTP(S) URL ending in /api.');
}
if (process.env.VERCEL === '1' && apiUrl.protocol !== 'https:') {
  throw new Error('TRIVORA_API_BASE must use HTTPS in Vercel deployments.');
}

fs.mkdirSync(outputDir, { recursive: true });
for (const file of ['index.html', 'admin.html', 'app.js', 'admin.js', 'styles.css']) {
  fs.copyFileSync(path.join(sourceDir, file), path.join(outputDir, file));
}
fs.cpSync(path.join(sourceDir, 'assets'), path.join(outputDir, 'assets'), { recursive: true });
fs.writeFileSync(
  path.join(outputDir, 'api-config.js'),
  `window.TRIVORA_API_BASE = ${JSON.stringify(apiBase)};\n`
);
