// Modules
import Express from "express";
import dotenv from "dotenv";
import cors from "cors";


// Routes
import Auth from "./routes/auth";

const app: Express.Application = Express(),
      PORT: number = process.env.PORT ? parseInt(process.env.PORT) : 3000;

if(process.env.NODE_ENV !== "production") {
  dotenv.config();
}

app.use(Express.json());
app.use(Express.urlencoded({ extended: true }));
app.use(cors());
app.disable("x-powered-by");
app.use("/auth", Auth);

app.listen(PORT, () => {
  console.log(`Sever is running on http://localhost:${PORT}`);
});
