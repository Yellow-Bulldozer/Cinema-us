import { PrismaClient } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';
import path from 'path';

const dbUrl = process.env.DATABASE_URL || 'file:../watchlist.db';
if (dbUrl.startsWith('file:')) {
  const dbPath = dbUrl.replace('file:', '');
  const dbDir = path.dirname(dbPath);
  if (dbDir && !fs.existsSync(dbDir)) {
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
