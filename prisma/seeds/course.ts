import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const createCourse = async () => {
  await prisma.course.upsert({
    where: { code: 'CSE0001' },
    update: {},
    create: {
      name: 'Nhập môn lập trình',
      avatar: 'https://picsum.photos/200/300',
      description: 'Nhập môn lập trình',
      room: '102',
      topic: 'Lập trình web',
      code: 'CSE0001',
      year: 2023,
      createdBy: {
        connect: {
          id: 1,
        },
      },
    },
  });

  await prisma.course.upsert({
    where: { code: 'CSE0002' },
    update: {},
    create: {
      name: 'Kĩ thuật lập trình',
      avatar: 'https://picsum.photos/200/300',
      description: 'Kĩ thuật lập trình',
      room: '102',
      topic: 'Lập trình web',
      code: 'CSE0002',
      year: 2023,
      createdBy: {
        connect: {
          id: 1,
        },
      },
    },
  });
};
