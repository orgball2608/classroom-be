import { PrismaClient, VerifyStatus } from '@prisma/client';

import { generateHash } from '../../src/common/utils';

const prisma = new PrismaClient();

export const createUser = async () => {
  await prisma.user.upsert({
    where: { email: 'quanghuynh@gmail.com' },
    update: {},
    create: {
      email: 'quanghuynh@gmail.com',
      password: generateHash('password'),
      firstName: 'Nguyen',
      lastName: 'Van Anh',
      phoneNumber: '0123456789',
      address: 'address',
      verify: VerifyStatus.VERIFY,
    },
  });
};
