import { Router } from "express";
import { DirectionController } from "../controllers/direction.controller";
import { verifyAdmin, verifyToken } from "src/middlewares/verify";

const directionRoutes = Router();

directionRoutes.get("/", DirectionController.getAll);
directionRoutes.get("/:id", DirectionController.getOne);
directionRoutes.post("/", verifyToken, verifyAdmin, DirectionController.create);
directionRoutes.patch("/:id", verifyToken, verifyAdmin, DirectionController.update);
directionRoutes.delete("/:id", verifyToken, verifyAdmin, DirectionController.delete);

export { directionRoutes };
