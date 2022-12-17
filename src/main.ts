import express from "express";
import http from "http";
import dotenv from "dotenv";
import cors from "cors";
import { Server, Socket } from "socket.io";
import swaggerUi from "swagger-ui-express";
import swaggerDocument from "./swagger.json";
import socketAuth from "./middlewares/socketAuth";
import authRoute from "./routes/auth";
import petRoute from "./routes/pet";
import petController from "./controllers/pet";

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
app.use("/auth", authRoute);
app.use("/mascot", petRoute);
app.set("trust proxy", 1);

io.attach(server, {
  pingInterval: 10000,
  pingTimeout: 5000,
  cookie: false,
});

io.use(socketAuth);

const usersInRooms = new Array();

io.on("connection", (socket: Socket) => {
  socket.on("join", (room: string) => {
    const username = socket.data.user.username;
    if (socket.rooms.size > 1) {
      socket.disconnect();
    }

    const users = io.sockets.adapter.rooms.get(room)?.size || 0;

    if (
      (room !== username && users !== 1) ||
      users === 2 ||
      usersInRooms.includes(username)
    ) {
      socket.disconnect();
    }

    socket.join(room);
    usersInRooms.push(username);

    socket.on("create pet", async (data: any) => {
    });

    socket.on("disconnect", () => {
      io.to(room).emit("left");
      usersInRooms.splice(usersInRooms.indexOf(username), 1);
    });
  });
});

server.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
