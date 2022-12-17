// Modules
import Express from "express";
import { createServer } from "http";
import dotenv from "dotenv";
import cors from "cors";
import { Server, Socket } from "socket.io";
import swaggerUi from "swagger-ui-express";
import swaggerDocument from "./swagger.json";
import SocketAuth from "./middlewares/socketAuth";

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
    serveClient: true,
  });

if (process.env.NODE_ENV !== "production") {
  dotenv.config();
}

app.use(
  "/docs",
  swaggerUi.serve,
  swaggerUi.setup(swaggerDocument, { explorer: true })
);
app.use(Express.json());
app.use(Express.urlencoded({ extended: true }));
app.use(cors());
app.disable("x-powered-by");
app.use("/auth", Auth);
app.use("/mascot", Mascot);
app.set("trust proxy", 1);

io.attach(server, {
  pingInterval: 10000,
  pingTimeout: 5000,
  cookie: false,
});

io.use(SocketAuth);

io.on("connection", (socket: Socket) => {
  socket.on("join", (room: string) => {
    if(socket.rooms.size >= 1) {
      socket.disconnect();
    }

    const users: number = io.sockets.adapter.rooms.get(room)?.size || 0;

    switch (users) {
      case 2:
        socket.emit("full");
        break;
      case 1:
        socket.join(room);
        io.to(room).emit("ready");
        break;
      default:
        socket.join(room);
    }

    socket.on("create mascot", (data: object) => {
      
    });
  });
});

server.listen(PORT, () => {
  console.log(`Sever is running on http://localhost:${PORT}`);
});
