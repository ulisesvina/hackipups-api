import { Router, Request, Response } from "express";
import Prisma from "@prisma/client";
import bcrypt from "bcrypt";
import { sign } from "jsonwebtoken";
import CheckAuth from "../middlewares/checkAuth";

const router: Router = Router();
const client: Prisma.PrismaClient = new Prisma.PrismaClient();

router.post("/register", async (req: Request, res: Response) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({
      error: "Missing fields",
    });
  }

  const user: Prisma.User | null = await client.user.findFirst({
    where: {
      OR: [
        {
          username,
        },
        {
          email,
        },
      ],
    },
  });

  if (user) {
    return res.status(400).json({
      error: "User already exists",
    });
  }

  client.user
    .create({
      data: {
        username,
        email,
        password: await bcrypt.hash(password, 10),
      },
    })
    .then(() => {
      return res.status(200).json({
        success: true,
        status: 200,
      });
    })
    .catch((err: Error) => {
      return res.status(500).json({
        error: err,
      });
    });
});

router.post("/login", async (req: Request, res: Response) => {
  const { login, password } = req.body;

  if (!login || !password) {
    return res.status(400).json({
      error: "Missing fields",
    });
  }

  const user: Prisma.User | null = await client.user.findFirst({
    where: {
      OR: [
        {
          username: login,
        },
        {
          email: login,
        },
      ],
    },
  });

  if (!user) {
    return res.status(400).json({
      error: "User not found",
    });
  }

  const match: boolean = await bcrypt.compare(password, user.password);

  if (!match) {
    return res.status(400).json({
      error: "Invalid password",
    });
  }

  return res.status(200).json({
    success: true,
    status: 200,
    token: sign(
      {
        id: user.id,
        username: user.username,
        email: user.email,
        pet: user.petId,
      },
      process.env.JWT_SECRET as string,
      {
        expiresIn: "1y",
      }
    ),  
  });
});

router.post("/change-password", CheckAuth, async (req: Request, res: Response) => {
  const { newPassword } = req.body;

  if (!newPassword) {
    return res.status(400).json({
      error: "Missing fields",
    });
  }

  client.user
    .update({
      where: {
        id: req.locals.user.id as string,
      },
      data: {
        password: await bcrypt.hash(newPassword, 10),
      },
    })
    .then(() => {
      return res.status(200).json({
        success: true,
        status: 200,
      });
    })
    .catch((err: Error) => {
      return res.status(500).json({
        error: err,
      });
    });
});

export default router;
