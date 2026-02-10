import express, { Application } from "express";
import dotenv from "dotenv"
import router from "./routes";
import { ErrorHandlerMiddleware } from "@middlewares";
import path from "path";
import { connectRedis } from "./config/redis";
import cors from "cors";
dotenv.config();

const app: Application = express();
app.use(express.json({ limit: '500mb' }));
app.use(express.urlencoded({ limit: '500mb', extended: true }));
app.use(cors())
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

app.use(router);

app.use("/*", ErrorHandlerMiddleware.errorHandlerMiddleware)

let PORT = process.env.APP_PORT || 9005
async function bootstrap() {
  await connectRedis();

  app.listen(PORT, () => console.log("server started"));
}

bootstrap();