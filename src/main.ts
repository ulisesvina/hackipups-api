// Modules
import Express from "express";
import { createServer } from "http";
import dotenv from "dotenv";
import cors from "cors";
import { Server } from "socket.io";

// Routes
import Auth from "./routes/auth";
import Mascot from "./routes/mascot";

const app: Express.Application = Express(),
  server = createServer(app),
  PORT: number = process.env.PORT ? parseInt(process.env.PORT) : 3000,
  io: Server = new Server(server, {
    cors: {
      origin: "*",
    },
    path: "/socket",
    serveClient: false
  });

if (process.env.NODE_ENV !== "production") {
  dotenv.config();
}

app.use(Express.json());
app.use(Express.urlencoded({ extended: true }));
app.use(cors());
app.disable("x-powered-by");
app.use("/auth", Auth);
app.use("/mascot", Mascot);

app.set("socket", io);

io.attach(server, {
  pingInterval: 10000,
  pingTimeout: 5000,
  cookie: false,
});

server.listen(PORT, () => {
  console.log(`Sever is running on http://localhost:${PORT}`);
});