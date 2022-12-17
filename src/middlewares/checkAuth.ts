import { Request, Response, NextFunction } from "express";
import { verify } from "jsonwebtoken";
import { PrismaClient, User } from "@prisma/client";

const client: PrismaClient = new PrismaClient(),
  invalidToken = (res: Response) => {
    return res.status(401).json({
      status: 401,
      message: "Invalid token",
      success: false,
    });
  };

const check: any = (req: Request, res: Response, next: NextFunction) => {
  try {
    const token: string | undefined = req.headers.authorization?.split(/\s/)[1];

    if (!token) return invalidToken(res);

    const decoded: any = verify(token, process.env.JWT_SECRET || "");

    client.user
      .findFirst({
        where: {
          email: decoded?.email,
        },
      })
      .then((user: User | null) => {
        if (!user) return invalidToken(res);
      });

    if (Date.now() < decoded?.exp * 1000) {
      req.locals = decoded;
      next();
    }
  } catch (error) {
    console.error("[ERROR] - " + error);
    return invalidToken(res);
  }
};

export default check;