import { PrismaClient } from "@prisma/client";

const prisma: PrismaClient = new PrismaClient();

const controls: any = {
  create: async (data: any) => {
    const pet = await prisma.pet.create({
      data: {
        name: data.name,
        owners: {
          connect: [{ id: data.user1 }, { id: data.user2 }],
        },
      },
    });

    return pet;
  },
};

export default controls;
