import { PrismaClient } from '@prisma/client';
import { generateHash } from '../../src/common/utils';

const prisma = new PrismaClient();

export const createUser = async () => {
  await prisma.user.upsert({
    where: { username: 'admin' },
    update: {},
    create: {
      username: 'admin',
      password: await generateHash('password'),
      firstName: 'Nguyen',
      lastName: 'Van Anh',
      status: true,
      email: '7NwDw@example.com',
      phoneNumber: '0123456789',
      address: 'address',
    },
  });
};
