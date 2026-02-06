import { Router } from "express";
import { AdminController } from "src/controllers/admin.controller";
import { verifyAdmin, verifyToken } from "src/middlewares/verify";

const adminRoutes = Router();

adminRoutes.get("/profile", verifyToken, verifyAdmin, AdminController.getAdminProfile);
adminRoutes.post("/", verifyToken, verifyAdmin, AdminController.createAdmin);
adminRoutes.post("/login", AdminController.loginAdmin);
adminRoutes.patch("/update", verifyToken, verifyAdmin, AdminController.editAdminProfile);

export {adminRoutes}