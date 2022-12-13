// Modules
import Express from "express";
import { createServer } from "http";
import dotenv from "dotenv";
import cors from "cors";
import { Server } from "socket.io";
import swaggerUi from "swagger-ui-express";
import { readFileSync } from "fs";

const swaggerDocument = JSON.parse(
  readFileSync(`${__dirname}/swagger.json`, "utf8")
);

/* 
   Before I get any comments for line above, I do know that resolveJsonModule is a thing, but
   it won't update at runtime, which is a pain in the ass for using at development.

   Also, Intellisense was bitching about me not having that flag set to true, while tsconfig.json
   did have it set to true.
*/

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
    serveClient: false,
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

app.set("socket", io);

io.attach(server, {
  pingInterval: 10000,
  pingTimeout: 5000,
  cookie: false,
});

io.on("connection", (socket) => {
  console.log("A user has connected");

  socket.on("join", (room) => {
    console.log(`A user has joined ${room}`);
  });

  socket.on("disconnect", () => {
    console.log("A user has disconnected");
  });
})

server.listen(PORT, () => {
  console.log(`Sever is running on http://localhost:${PORT}`);
});
