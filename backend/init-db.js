import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

// 1. Manually parse backend/.env to load env vars into process.env if not set by host
const envPath = path.resolve('backend/.env');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  envContent.split(/\r?\n/).forEach(line => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) return;
    const eqIdx = trimmed.indexOf('=');
    if (eqIdx > 0) {
      const key = trimmed.substring(0, eqIdx).trim();
      let val = trimmed.substring(eqIdx + 1).trim();
      if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
        val = val.substring(1, val.length - 1);
      }
      if (!process.env[key]) {
        process.env[key] = val;
      }
    }
  });
}

// 2. Ensure default DATABASE_URL is set
if (!process.env.DATABASE_URL) {
  process.env.DATABASE_URL = 'file:../watchlist.db';
}

// 3. Ensure SQLite directory exists
const dbUrl = process.env.DATABASE_URL;
if (dbUrl.startsWith('file:')) {
  const dbPath = dbUrl.replace('file:', '');
  const dbDir = path.dirname(dbPath);
  if (dbDir && !fs.existsSync(dbDir)) {
    console.log(`[INIT] Creating SQLite directory at: ${dbDir}`);
    fs.mkdirSync(dbDir, { recursive: true });
  }
}

// 4. Run prisma db push programmatically with inherited env variables
console.log('[INIT] Running database migrations/push...');
try {
  execSync('npx prisma db push --schema=backend/prisma/schema.prisma', {
    stdio: 'inherit',
    env: process.env
  });
  console.log('[INIT] Database setup complete.');
} catch (error) {
  console.error('[INIT] Error running database setup:', error.message);
  process.exit(1);
}
