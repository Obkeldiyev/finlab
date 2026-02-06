import { Router } from "express";
import { CoursesController } from "../controllers/courses.controller";
import { verifyAdmin, verifyToken } from "src/middlewares/verify";

const coursesRoutes = Router();

coursesRoutes.get("/", CoursesController.getAll);
coursesRoutes.get("/:id", CoursesController.getOne);
coursesRoutes.post("/", verifyToken, verifyAdmin, CoursesController.create);
coursesRoutes.patch("/:id", verifyToken, verifyAdmin, CoursesController.update);
coursesRoutes.delete("/:id", verifyToken, verifyAdmin, CoursesController.delete);

export { coursesRoutes };
