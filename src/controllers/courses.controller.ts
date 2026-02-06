import { ErrorHandler } from "@errors";
import { PrismaClient } from "@prisma/client";
import { NextFunction, Request, Response } from "express";

const client = new PrismaClient();

function toDate(value: any) {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return null;
  return d;
}

export class CoursesController {
  // GET /courses?direction_id=1&page=1&limit=20
  static async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const page = Number(req.query.page || 1);
      const limit = Number(req.query.limit || 20);
      const skip = (page - 1) * limit;

      const direction_id = req.query.direction_id ? Number(req.query.direction_id) : null;
      const where = direction_id ? { direction_id } : {};

      const [items, total] = await Promise.all([
        client.courses.findMany({
          where,
          skip,
          take: limit,
          orderBy: { published_at: "desc" },
          include: {
            direction: true, // helpful
          },
        }),
        client.courses.count({ where }),
      ]);

      res.status(200).send({
        success: true,
        message: "All courses",
        page,
        limit,
        total,
        data: items,
      });
    } catch (error: any) {
      next(new ErrorHandler(error.message, error.status));
    }
  }

  // GET /courses/:id
  static async getOne(req: Request, res: Response, next: NextFunction) {
    try {
      const id = Number(req.params.id);
      if (Number.isNaN(id)) {
        return res.status(400).send({ success: false, message: "Invalid id" });
      }

      const course = await client.courses.findUnique({
        where: { id },
        include: {
          direction: true,
        },
      });

      if (!course) {
        return res.status(404).send({ success: false, message: "Course not found" });
      }

      res.status(200).send({
        success: true,
        message: "One course",
        data: course,
      });
    } catch (error: any) {
      next(new ErrorHandler(error.message, error.status));
    }
  }

  // POST /courses
  static async create(req: Request, res: Response, next: NextFunction) {
    try {
      const {
        title_en,
        title_ru,
        title_uz,
        description_en,
        description_ru,
        description_uz,
        start_date,
        ends_at,
        direction_id,
      } = req.body;

      if (
        !title_en ||
        !title_ru ||
        !title_uz ||
        !description_en ||
        !description_ru ||
        !description_uz ||
        !start_date ||
        !ends_at ||
        !direction_id
      ) {
        return res.status(400).send({
          success: false,
          message: "All fields are required",
        });
      }

      const start = toDate(start_date);
      const end = toDate(ends_at);
      if (!start || !end) {
        return res.status(400).send({
          success: false,
          message: "start_date, ends_at must be valid dates",
        });
      }

      const dir = await client.direction.findUnique({
        where: { id: Number(direction_id) },
      });

      if (!dir) {
        return res.status(400).send({
          success: false,
          message: "Direction not found",
        });
      }

      const created = await client.courses.create({
        data: {
          title_en,
          title_ru,
          title_uz,
          description_en,
          description_ru,
          description_uz,
          start_date: start,
          ends_at: end,
          direction: { connect: { id: dir.id } },
        },
        include: { direction: true },
      });

      res.status(201).send({
        success: true,
        message: "Course created successfully",
        data: created,
      });
    } catch (error: any) {
      next(new ErrorHandler(error.message, error.status));
    }
  }

  // PATCH /courses/:id
  static async update(req: Request, res: Response, next: NextFunction) {
    try {
      const id = Number(req.params.id);
      if (Number.isNaN(id)) {
        return res.status(400).send({ success: false, message: "Invalid id" });
      }

      const exists = await client.courses.findUnique({ where: { id } });
      if (!exists) {
        return res.status(404).send({ success: false, message: "Course not found" });
      }

      const {
        title_en,
        title_ru,
        title_uz,
        description_en,
        description_ru,
        description_uz,
        start_date,
        ends_at,
        direction_id,
      } = req.body;

      const start: any = start_date ? toDate(start_date) : undefined;
      const end: any = ends_at ? toDate(ends_at) : undefined;

      if (start_date && !start) {
        return res.status(400).send({ success: false, message: "Invalid start_date date" });
      }
      if (ends_at && !end) {
        return res.status(400).send({ success: false, message: "Invalid ends_at date" });
      }

      if (direction_id) {
        const dir = await client.direction.findUnique({
          where: { id: Number(direction_id) },
        });
        if (!dir) {
          return res.status(400).send({ success: false, message: "Direction not found" });
        }
      }

      const updated = await client.courses.update({
        where: { id },
        data: {
          title_en,
          title_ru,
          title_uz,
          description_en,
          description_ru,
          description_uz,
          start_date: start,
          ends_at: end,
          direction: direction_id ? { connect: { id: Number(direction_id) } } : undefined,
        },
        include: { direction: true },
      });

      res.status(200).send({
        success: true,
        message: "Course updated successfully",
        data: updated,
      });
    } catch (error: any) {
      next(new ErrorHandler(error.message, error.status));
    }
  }

  // DELETE /courses/:id
  static async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const id = Number(req.params.id);
      if (Number.isNaN(id)) {
        return res.status(400).send({ success: false, message: "Invalid id" });
      }

      const course = await client.courses.findUnique({
        where: { id },
        include: { users: true },
      });

      if (!course) {
        return res.status(404).send({ success: false, message: "Course not found" });
      }

      // protect deletion if users exist
      if (course.users.length > 0) {
        return res.status(409).send({
          success: false,
          message: "Cannot delete course because users are linked to it",
        });
      }

      await client.courses.delete({ where: { id } });

      res.status(200).send({
        success: true,
        message: "Course deleted successfully",
      });
    } catch (error: any) {
      next(new ErrorHandler(error.message, error.status));
    }
  }
}
