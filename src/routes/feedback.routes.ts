import { Router } from "express";
import { FeedbackController } from "../controllers/feedback.controller";
import { verifyAdmin, verifyToken } from "src/middlewares/verify";

const feedbackRoutes = Router();

feedbackRoutes.get("/approved", FeedbackController.getApprovedFeedback); // Public - get approved feedbacks
feedbackRoutes.get("/", verifyToken, verifyAdmin, FeedbackController.getAllFeedback); // Admin - get all feedbacks
feedbackRoutes.get("/:id", verifyToken, verifyAdmin, FeedbackController.getOneFeedback); // Admin - get one feedback
feedbackRoutes.post("/", FeedbackController.createFeedback); // Public - anyone can submit
feedbackRoutes.patch("/:id/approve", verifyToken, verifyAdmin, FeedbackController.approveFeedback); // Admin - approve feedback
feedbackRoutes.delete("/:id", verifyToken, verifyAdmin, FeedbackController.deleteFeedback); // Admin - delete feedback

export { feedbackRoutes };
