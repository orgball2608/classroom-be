import { PrismaClient, UserRole, VerifyStatus } from '@prisma/client';

import { faker } from '@faker-js/faker';
import { generateHash } from '../../src/common/utils';

const prisma = new PrismaClient();

export const createUser = async () => {
  await prisma.user.upsert({
    where: { email: 'quanghuynh@gmail.com' },
    update: {},
    create: {
      email: 'quanghuynh@gmail.com',
      password: generateHash('password'),
      firstName: faker.person.firstName(),
      lastName: faker.person.lastName(),
      phoneNumber: faker.phone.number(),
      address: faker.location.streetAddress(),
      avatar: faker.image.avatar(),
      verify: VerifyStatus.VERIFY,
      role: UserRole.TEACHER,
    },
  });

  await prisma.user.upsert({
    where: { email: 'admin@gmail.com' },
    update: {},
    create: {
      email: 'admin@gmail.com',
      password: generateHash('password'),
      firstName: faker.person.firstName(),
      lastName: faker.person.lastName(),
      phoneNumber: faker.phone.number(),
      address: faker.location.streetAddress(),
      avatar: faker.image.avatar(),
      verify: VerifyStatus.VERIFY,
      role: 'ADMIN',
    },
  });

  await prisma.user.upsert({
    where: { email: 'student@gmail.com' },
    update: {},
    create: {
      email: 'student@gmail.com',
      password: generateHash('password'),
      firstName: faker.person.firstName(),
      lastName: faker.person.lastName(),
      phoneNumber: faker.phone.number(),
      address: faker.location.streetAddress(),
      verify: VerifyStatus.VERIFY,
      avatar: faker.image.avatar(),
      role: 'STUDENT',
    },
  });
};
