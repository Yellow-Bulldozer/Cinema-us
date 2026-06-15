import { PrismaClient } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';

const prisma = new PrismaClient();

async function main() {
  const settings = await prisma.appSettings.upsert({
    where: { id: 'app-settings' },
    update: {},
    create: {
      id: 'app-settings',
      shareEnabled: false,
      shareToken: uuidv4(),
      theme: 'dark',
    },
  });
  console.log('✅ Seed completed:', settings);
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
