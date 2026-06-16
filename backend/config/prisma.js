import { PrismaClient } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Use absolute path for the database URL if none is set
if (!process.env.DATABASE_URL) {
  const dbAbsPath = path.join(__dirname, '..', 'watchlist.db');
  process.env.DATABASE_URL = `file:${dbAbsPath}`;
}

const dbUrl = process.env.DATABASE_URL;
if (dbUrl.startsWith('file:')) {
  const dbPath = dbUrl.replace('file:', '');
  const dbDir = path.dirname(dbPath);
  if (dbDir && dbDir !== '.' && !fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
  }
}

const prisma = new PrismaClient();

export const ensureAppSettings = async () => {
  await prisma.appSettings.upsert({
    where: { id: 'app-settings' },
    update: {},
    create: {
      id: 'app-settings',
      shareEnabled: false,
      shareToken: uuidv4(),
      theme: 'dark',
    },
  });
};

export default prisma;
