import { ErrorHandler } from "@errors";
import { PrismaClient } from "@prisma/client";
import { NextFunction, Request, Response } from "express";

const client = new PrismaClient();

export class FeedbackController {
  static async getAllFeedback(req: Request, res: Response, next: NextFunction) {
    try {
      const page = Number(req.query.page || 1);
      const limit = Number(req.query.limit || 20);
      const skip = (page - 1) * limit;

      const [items, total] = await Promise.all([
        client.feedback.findMany({
          skip,
          take: limit,
          orderBy: { created_at: "desc" },
        }),
        client.feedback.count(),
      ]);

      res.status(200).send({
        success: true,
        message: "All feedback",
        page,
        limit,
        total,
        data: items,
      });
    } catch (error: any) {
      next(new ErrorHandler(error.message, error.status));
    }
  }

  static async getApprovedFeedback(req: Request, res: Response, next: NextFunction) {
    try {
      const items = await client.feedback.findMany({
        where: { is_approved: true },
        orderBy: { created_at: "desc" },
      });

      res.status(200).send({
        success: true,
        message: "Approved feedback",
        data: items,
      });
    } catch (error: any) {
      next(new ErrorHandler(error.message, error.status));
    }
  }

  static async getOneFeedback(req: Request, res: Response, next: NextFunction) {
    try {
      const id = Number(req.params.id);
      if (Number.isNaN(id)) {
        return res.status(400).send({ success: false, message: "Invalid id" });
      }

      const feedback = await client.feedback.findUnique({
        where: { id },
      });

      if (!feedback) {
        return res.status(404).send({ success: false, message: "Feedback not found" });
      }

      res.status(200).send({ success: true, message: "One feedback", data: feedback });
    } catch (error: any) {
      next(new ErrorHandler(error.message, error.status));
    }
  }

  static async createFeedback(req: Request, res: Response, next: NextFunction) {
    try {
      const { full_name, workplace, phone_number, email, rating, message } = req.body;

      if (!full_name || !workplace || !phone_number || !email || !message) {
        return res.status(400).send({
          success: false,
          message: "Full name, workplace, phone number, email, and message are required",
        });
      }

      const created = await client.feedback.create({
        data: {
          full_name,
          workplace,
          phone_number,
          email,
          rating: rating || 5,
          message,
          is_approved: false,
        },
      });

      res.status(201).send({
        success: true,
        message: "Feedback submitted successfully. It will be shown after approval.",
        data: created,
      });
    } catch (error: any) {
      next(new ErrorHandler(error.message, error.status));
    }
  }

  static async approveFeedback(req: Request, res: Response, next: NextFunction) {
    try {
      const id = Number(req.params.id);
      if (Number.isNaN(id)) {
        return res.status(400).send({ success: false, message: "Invalid id" });
      }

      const feedback = await client.feedback.findUnique({
        where: { id },
      });

      if (!feedback) {
        return res.status(404).send({ success: false, message: "Feedback not found" });
      }

      const updated = await client.feedback.update({
        where: { id },
        data: { is_approved: true },
      });

      res.status(200).send({
        success: true,
        message: "Feedback approved successfully",
        data: updated,
      });
    } catch (error: any) {
      next(new ErrorHandler(error.message, error.status));
    }
  }

  static async deleteFeedback(req: Request, res: Response, next: NextFunction) {
    try {
      const id = Number(req.params.id);
      if (Number.isNaN(id)) {
        return res.status(400).send({ success: false, message: "Invalid id" });
      }

      const feedback = await client.feedback.findUnique({
        where: { id },
      });

      if (!feedback) {
        return res.status(404).send({ success: false, message: "Feedback not found" });
      }

      await client.feedback.delete({ where: { id } });

      res.status(200).send({ success: true, message: "Feedback deleted successfully" });
    } catch (error: any) {
      next(new ErrorHandler(error.message, error.status));
    }
  }
}
