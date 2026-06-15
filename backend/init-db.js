import fs from 'fs';
import path from 'path';

const dbUrl = process.env.DATABASE_URL || 'file:../watchlist.db';
if (dbUrl.startsWith('file:')) {
  const dbPath = dbUrl.replace('file:', '');
  const dbDir = path.dirname(dbPath);
  if (dbDir && !fs.existsSync(dbDir)) {
    console.log(`[INIT] Creating SQLite directory at: ${dbDir}`);
    fs.mkdirSync(dbDir, { recursive: true });
  }
}
