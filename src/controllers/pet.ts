import { PrismaClient, Pet } from "@prisma/client";

const prisma: PrismaClient = new PrismaClient();

const controls: any = {
  create: async (data: any) => {
    try {
      const pet: Pet = await prisma.pet.create({
        data: {
          name: data.name,
          owners: {
            connect: [{ id: data.user1 }, { id: data.user2 }],
          },
        },
      });

      return {
        success: true,
        pet,
      };
    } catch (e) {
      return {
        success: false,
        error: e,
      };
    }
  },
  getPet: async (data: any) => {
    try {
      const pet: Pet | null = await prisma.pet.findFirst({
        where: {
          owners: {
            some: {
              id: data.id,
            },
          },
        },
      });

      return pet;
    } catch (e) {
      return {
        success: false,
        error: e,
      };
    }
  },
};

export default controls;
