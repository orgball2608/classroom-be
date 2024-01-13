import { PrismaClient, UserRole, VerifyStatus } from '@prisma/client';

import { generateHash } from '../../src/common/utils';

const prisma = new PrismaClient();

export const createUser = async () => {
  await prisma.user.upsert({
    where: { email: 'admin@gmail.com' },
    update: {},
    create: {
      email: 'admin@gmail.com',
      password: generateHash('password'),
      firstName: 'Nguyễn Văn',
      lastName: 'Anh',
      phoneNumber: '0914894337',
      address: 'Thành Phố Thủ Đức, Hồ Chí Minh',
      avatar:
        'https://d25ezbt2biq5zr.cloudfront.net/2c5a8d03-c6f9-4933-b99e-1eb26067083e',
      verify: VerifyStatus.VERIFY,
      role: UserRole.ADMIN,
    },
  });
};
