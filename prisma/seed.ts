import { PrismaClient } from '@prisma/client';
import { createUser } from './seeds/user';

const prisma = new PrismaClient();
async function main() {
  await createUser();
}
main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
