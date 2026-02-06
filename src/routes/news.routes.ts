import { Router } from "express";
import { NewsController } from "../controllers/news.controller";
import { uploadNewsMedia } from "../config/multer";
import { verifyAdmin, verifyToken } from "src/middlewares/verify";

const newsRoutes = Router();

newsRoutes.get("/", NewsController.getAllNews);
newsRoutes.get("/:id", NewsController.getOneNews);
newsRoutes.post("/", verifyToken, verifyAdmin, uploadNewsMedia.array("medias", 10), NewsController.createNews);
newsRoutes.patch("/:id", verifyToken, verifyAdmin, uploadNewsMedia.array("medias", 10), NewsController.updateNews);
newsRoutes.delete("/:id", verifyToken, verifyAdmin, NewsController.deleteNews);

export { newsRoutes };
