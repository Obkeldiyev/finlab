import { Router } from "express";
import { adminRoutes } from "./admin.routes";
import { userRoutes } from "./user.routes";
import { newsRoutes } from "./news.routes";
import { elonRoutes } from "./elon.routes";
import { coursesRoutes } from "./courses.routes";
import { directionRoutes } from "./direction.routes";
import { galleryRoutes } from "./gallery.routes";

const router: Router = Router();

router.use("/admin", adminRoutes);
router.use("/user", userRoutes);
router.use("/news", newsRoutes);
router.use("/elon", elonRoutes)
router.use("/courses", coursesRoutes);
router.use("/direction", directionRoutes);
router.use("/gallery", galleryRoutes);

export default router;