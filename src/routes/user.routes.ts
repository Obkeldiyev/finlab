import { Router } from "express";
import { UserController } from "src/controllers/user.controller";
import { verifyAdmin, verifyToken, verifyUser } from "src/middlewares/verify";

const userRoutes = Router();

userRoutes.get("/profile", verifyToken, verifyUser, UserController.userProfile);
userRoutes.get("/", verifyToken, verifyAdmin, UserController.getAllUsers);
userRoutes.post("/", verifyToken, verifyAdmin, UserController.createUsers);
userRoutes.post("/register/request", UserController.registerRequestCode);
userRoutes.post("/register/verify-code", UserController.verifyCodeOnly);
userRoutes.post("/register/verify", UserController.registerVerifyCode);
userRoutes.post("/register/course", verifyToken, verifyUser, UserController.registerForCourse);
userRoutes.post("/login/request", UserController.loginRequestCode);
userRoutes.post("/login/verify", UserController.loginVerifyCode);
userRoutes.patch("/update", UserController.updateProfile);
userRoutes.patch("/update/settings", UserController.updateDirectionAndCourse);

export {userRoutes}