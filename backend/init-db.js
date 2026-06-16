import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 1. Resolve all paths relative to this file's directory (backend/)
const envPath = path.join(__dirname, '.env');
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

// 2. Set a production-safe DATABASE_URL with an absolute path
if (!process.env.DATABASE_URL) {
  const dbAbsPath = path.join(__dirname, 'watchlist.db');
  process.env.DATABASE_URL = `file:${dbAbsPath}`;
  console.log(`[INIT] DATABASE_URL set to: file:${dbAbsPath}`);
}

// 3. Ensure SQLite DB directory exists (only for file: URLs)
const dbUrl = process.env.DATABASE_URL;
if (dbUrl.startsWith('file:')) {
  const dbFilePath = dbUrl.replace('file:', '');
  const dbDir = path.dirname(dbFilePath);
  if (dbDir && dbDir !== '.' && !fs.existsSync(dbDir)) {
    console.log(`[INIT] Creating SQLite directory at: ${dbDir}`);
    fs.mkdirSync(dbDir, { recursive: true });
  }
}

// 4. Run prisma db push using the correct schema path (absolute)
const schemaPath = path.join(__dirname, 'prisma', 'schema.prisma');
console.log(`[INIT] Running prisma db push with schema: ${schemaPath}`);
console.log(`[INIT] DATABASE_URL: ${process.env.DATABASE_URL}`);
try {
  execSync(`npx prisma db push --schema="${schemaPath}" --accept-data-loss`, {
    stdio: 'inherit',
    env: process.env,
    cwd: __dirname
  });
  console.log('[INIT] Database setup complete.');
} catch (error) {
  console.error('[INIT] Error running database setup:', error.message);
  // Don't crash if the DB already exists and is up-to-date
  // Check if the DB file at least exists
  const dbPath = process.env.DATABASE_URL.replace('file:', '');
  if (fs.existsSync(dbPath)) {
    console.log('[INIT] Database file exists, continuing despite push error...');
  } else {
    process.exit(1);
  }
}
