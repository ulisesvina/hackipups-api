// Modules
import Express from "express";
import { createServer } from "http";
import dotenv from "dotenv";
import cors from "cors";
import { Server } from "socket.io";
import session from "express-session";
import swaggerUi from "swagger-ui-express";
import swaggerDocument from "./swagger.json";
import Redis from "ioredis";
import connectRedis from "connect-redis";

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
  }),
  RedisStore = connectRedis(session),
  redisClient = new Redis();

if (process.env.NODE_ENV !== "production") {
  dotenv.config();
}

app.use(
  session({
    secret: process.env["SESSION_SECRET"] as string,
    resave: true,
    saveUninitialized: true,
    cookie: { maxAge: 31536000000 },
    store: new RedisStore({ client: redisClient }),
  })
);
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

server.listen(PORT, () => {
  console.log(`Sever is running on http://localhost:${PORT}`);
});
