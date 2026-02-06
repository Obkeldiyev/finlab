import { Router } from "express";
import { ElonController } from "../controllers/elon.controller";
import { uploadElonMedia } from "../config/multer.elon";
import { verifyAdmin, verifyToken } from "src/middlewares/verify";

const elonRoutes = Router();

elonRoutes.get("/", ElonController.getAll);
elonRoutes.get("/:id", ElonController.getOne);
elonRoutes.post("/", verifyToken, verifyAdmin, uploadElonMedia.array("medias", 10), ElonController.create);
elonRoutes.patch("/:id", verifyToken, verifyAdmin, uploadElonMedia.array("medias", 10), ElonController.update);
elonRoutes.delete("/:id", verifyToken, verifyAdmin, ElonController.delete);

export { elonRoutes };
