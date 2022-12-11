// Modules
import Express from "express";
import Prisma from "@prisma/client";

// Routes
import Auth from "./routes/auth";

const app: Express.Application = Express(),
      PORT: number = process.env.PORT ? parseInt(process.env.PORT) : 3000;

app.use("/auth", Auth);

app.listen(PORT, () => {
  console.log(`Sever is running on http://localhost:${PORT}`);
});
