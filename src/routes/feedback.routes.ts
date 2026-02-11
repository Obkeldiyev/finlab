import { Router } from "express";
import { FeedbackController } from "../controllers/feedback.controller";
import { verifyAdmin, verifyToken } from "src/middlewares/verify";

const feedbackRoutes = Router();

feedbackRoutes.get("/", verifyToken, verifyAdmin, FeedbackController.getAllFeedback);
feedbackRoutes.get("/:id", verifyToken, verifyAdmin, FeedbackController.getOneFeedback);
feedbackRoutes.post("/", FeedbackController.createFeedback); // Public - anyone can submit
feedbackRoutes.delete("/:id", verifyToken, verifyAdmin, FeedbackController.deleteFeedback);

export { feedbackRoutes };
