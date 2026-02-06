import { ErrorHandler } from "@errors";
import { PrismaClient } from "@prisma/client";
import { NextFunction, Request, Response } from "express";

const client = new PrismaClient();

export class DirectionController {
  // GET /directions
  static async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const page = Number(req.query.page || 1);
      const limit = Number(req.query.limit || 20);
      const skip = (page - 1) * limit;

      const [items, total] = await Promise.all([
        client.direction.findMany({
          skip,
          take: limit,
          orderBy: { id: "desc" },
          include: {
            courses: true, // show courses list
          },
        }),
        client.direction.count(),
      ]);

      res.status(200).send({
        success: true,
        message: "All directions",
        page,
        limit,
        total,
        data: items,
      });
    } catch (error: any) {
      next(new ErrorHandler(error.message, error.status));
    }
  }

  // GET /directions/:id
  static async getOne(req: Request, res: Response, next: NextFunction) {
    try {
      const id = Number(req.params.id);
      if (Number.isNaN(id)) {
        return res.status(400).send({ success: false, message: "Invalid id" });
      }

      const dir = await client.direction.findUnique({
        where: { id },
        include: { courses: true },
      });

      if (!dir) {
        return res.status(404).send({ success: false, message: "Direction not found" });
      }

      res.status(200).send({ success: true, message: "One direction", data: dir });
    } catch (error: any) {
      next(new ErrorHandler(error.message, error.status));
    }
  }

  // POST /directions
  static async create(req: Request, res: Response, next: NextFunction) {
    try {
      const {
        title_en,
        title_ru,
        title_uz,
        description_en,
        description_ru,
        description_uz,
        ends_at,
      } = req.body;

      if (
        !title_en ||
        !title_ru ||
        !title_uz ||
        !description_en ||
        !description_ru ||
        !description_uz ||
        !ends_at
      ) {
        return res.status(400).send({
          success: false,
          message: "All fields are required",
        });
      }

      const created = await client.direction.create({
        data: {
          title_en,
          title_ru,
          title_uz,
          description_en,
          description_ru,
          description_uz,
          ends_at: new Date(ends_at),
        },
        include: { courses: true },
      });

      res.status(201).send({
        success: true,
        message: "Direction created successfully",
        data: created,
      });
    } catch (error: any) {
      next(new ErrorHandler(error.message, error.status));
    }
  }

  // PATCH /directions/:id
  static async update(req: Request, res: Response, next: NextFunction) {
    try {
      const id = Number(req.params.id);
      if (Number.isNaN(id)) {
        return res.status(400).send({ success: false, message: "Invalid id" });
      }

      const exists = await client.direction.findUnique({ where: { id } });
      if (!exists) {
        return res.status(404).send({ success: false, message: "Direction not found" });
      }

      const {
        title_en,
        title_ru,
        title_uz,
        description_en,
        description_ru,
        description_uz,
        ends_at,
      } = req.body;

      const updated = await client.direction.update({
        where: { id },
        data: {
          title_en,
          title_ru,
          title_uz,
          description_en,
          description_ru,
          description_uz,
          ends_at: ends_at ? new Date(ends_at) : undefined,
        },
        include: { courses: true },
      });

      res.status(200).send({
        success: true,
        message: "Direction updated successfully",
        data: updated,
      });
    } catch (error: any) {
      next(new ErrorHandler(error.message, error.status));
    }
  }

  // DELETE /directions/:id
  static async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const id = Number(req.params.id);
      if (Number.isNaN(id)) {
        return res.status(400).send({ success: false, message: "Invalid id" });
      }

      // direction has courses/users; protect delete
      const dir = await client.direction.findUnique({
        where: { id },
        include: { courses: true, users: true },
      });

      if (!dir) {
        return res.status(404).send({ success: false, message: "Direction not found" });
      }

      if (dir.courses.length > 0 || dir.users.length > 0) {
        return res.status(409).send({
          success: false,
          message: "Cannot delete direction because courses/users are linked",
        });
      }

      await client.direction.delete({ where: { id } });

      res.status(200).send({
        success: true,
        message: "Direction deleted successfully",
      });
    } catch (error: any) {
      next(new ErrorHandler(error.message, error.status));
    }
  }
}
