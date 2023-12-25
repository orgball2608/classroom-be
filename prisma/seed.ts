import { PrismaClient } from '@prisma/client';
import { createCourse } from './seeds/course';
import { createUser } from './seeds/user';

const prisma = new PrismaClient();
async function main() {
  await createUser();
  await createCourse();
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
