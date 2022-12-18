import express from "express";
import http from "http";
import dotenv from "dotenv";
import cors from "cors";
import { Server, Socket } from "socket.io";
import swaggerUi from "swagger-ui-express";
import swaggerDocument from "./swagger.json";
import socketAuth from "./middlewares/socketAuth";
import AuthRoute from "./routes/auth";
import PetRoute from "./routes/pet";
import PetController from "./controllers/pet";

const app = express();
const server = http.createServer(app);
const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
const io = new Server(server, {
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
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.disable("x-powered-by");
app.use("/auth", AuthRoute);
app.use("/pet", PetRoute);
app.set("trust proxy", 1);

io.attach(server, {
  pingInterval: 10000,
  pingTimeout: 5000,
  cookie: false,
});

io.use(socketAuth);

const usersInRooms = new Array();

io.on("connection", (socket) => {
  const userId: string = socket.data.user.id,
    username: string = socket.data.user.username;

  let room: string = "";

  socket.on("join", (data: string) => {
    room = data;
    if (usersInRooms.includes(userId)) {
      socket.emit("error", "You are already in a room");
      socket.disconnect();
      return;
    }

    const roomUsers = io.sockets.adapter.rooms.get(room);

    if (
      (room !== username && roomUsers?.size !== 1) ||
      roomUsers?.size === 2 ||
      usersInRooms.includes(username)
    ) {
      socket.disconnect();
    }

    socket.join(room);

    if (roomUsers?.size === 2) {
      io.to(room).emit("ready");
    }

    usersInRooms.push(userId);
  });

  socket.on("create pet", async (data) => {
    console.log(JSON.stringify(data));
    const { name } = data;

    const currentRoom = io.sockets.adapter.rooms.get(room as string);

    if (currentRoom && currentRoom.size === 2) {
      const sockets: any = Array.from(currentRoom);
      let otherUserSocket = sockets[0];
      if (otherUserSocket === socket.id) {
        otherUserSocket = sockets[1];
      }

      otherUserSocket = io.sockets.sockets.get(otherUserSocket);

      const otherUserId = otherUserSocket.data.user.id;

      try {
        const response = await PetController.create({
          name,
          user1: userId,
          user2: otherUserId,
        });

        if (!response.success) {
          socket.emit("error", response.error);
          return;
        }

        io.to(room).emit("pet created", response.pet);
      } catch (error: any) {
        socket.emit("error", error.message);
      }
    }
  });
});

server.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
