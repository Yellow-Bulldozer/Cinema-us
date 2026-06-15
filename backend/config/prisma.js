import { PrismaClient } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';

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
