// Modules
import Express from "express";
import { createServer } from "http";
import dotenv from "dotenv";
import cors from "cors";
import { Server } from "socket.io";
import session from "express-session";
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
  session({
    secret: process.env["SESSION_SECRET"] as string,
    resave: true,
    saveUninitialized: true,
    cookie: { maxAge: 31536000000 },
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

app.get("/get-session", (req, res) => {
  res.send(req.session);
});

server.listen(PORT, () => {
  console.log(`Sever is running on http://localhost:${PORT}`);
});
