import { ErrorHandler } from "@errors";
import { PrismaClient } from "@prisma/client";
import { NextFunction, Request, Response } from "express";

const client = new PrismaClient();

function mediaTypeFromMime(mime: string) {
  if (mime.startsWith("image/")) return "image";
  if (mime.startsWith("video/")) return "video";
  return "file";
}

function publicElonUrl(filename: string) {
  return `/uploads/elon/${filename}`;
}

export class ElonController {
  // ✅ GET /elon
  static async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const page = Number(req.query.page || 1);
      const limit = Number(req.query.limit || 20);
      const skip = (page - 1) * limit;

      const [items, total] = await Promise.all([
        client.elon.findMany({
          skip,
          take: limit,
          orderBy: { published_at: "desc" },
          include: { medias: true },
        }),
        client.elon.count(),
      ]);

      res.status(200).send({
        success: true,
        message: "All elons",
        page,
        limit,
        total,
        data: items,
      });
    } catch (error: any) {
      next(new ErrorHandler(error.message, error.status));
    }
  }

  // ✅ GET /elon/:id
  static async getOne(req: Request, res: Response, next: NextFunction) {
    try {
      const id = Number(req.params.id);
      if (Number.isNaN(id)) {
        return res.status(400).send({ success: false, message: "Invalid id" });
      }

      const elon = await client.elon.findUnique({
        where: { id },
        include: { medias: true },
      });

      if (!elon) {
        return res.status(404).send({ success: false, message: "Elon not found" });
      }

      res.status(200).send({
        success: true,
        message: "One elon",
        data: elon,
      });
    } catch (error: any) {
      next(new ErrorHandler(error.message, error.status));
    }
  }

  // ✅ POST /elon  (multipart/form-data)
  static async create(req: Request, res: Response, next: NextFunction) {
    try {
      const {
        title_en,
        title_ru,
        title_uz,
        content_en,
        content_ru,
        content_uz,
        ends_at,
      } = req.body;

      if (
        !title_en ||
        !title_ru ||
        !title_uz ||
        !content_en ||
        !content_ru ||
        !content_uz ||
        !ends_at
      ) {
        return res.status(400).send({
          success: false,
          message: "All title_*, content_* and ends_at are required",
        });
      }

      const files = (req.files as Express.Multer.File[]) || [];

      const created = await client.elon.create({
        data: {
          title_en,
          title_ru,
          title_uz,
          content_en,
          content_ru,
          content_uz,
          ends_at: new Date(ends_at),

          medias: files.length
            ? {
                create: files.map((f) => ({
                  url: publicElonUrl(f.filename),
                  type: mediaTypeFromMime(f.mimetype),
                })),
              }
            : undefined,
        },
        include: { medias: true },
      });

      res.status(201).send({
        success: true,
        message: "Elon created successfully",
        data: created,
      });
    } catch (error: any) {
      next(new ErrorHandler(error.message, error.status));
    }
  }

  // ✅ PATCH /elon/:id  (multipart/form-data)
  static async update(req: Request, res: Response, next: NextFunction) {
    try {
      const id = Number(req.params.id);
      if (Number.isNaN(id)) {
        return res.status(400).send({ success: false, message: "Invalid id" });
      }

      const exists = await client.elon.findUnique({ where: { id } });
      if (!exists) {
        return res.status(404).send({ success: false, message: "Elon not found" });
      }

      const {
        title_en,
        title_ru,
        title_uz,
        content_en,
        content_ru,
        content_uz,
        ends_at,
      } = req.body;

      const files = (req.files as Express.Multer.File[]) || [];

      const updated = await client.elon.update({
        where: { id },
        data: {
          title_en,
          title_ru,
          title_uz,
          content_en,
          content_ru,
          content_uz,
          ends_at: ends_at ? new Date(ends_at) : undefined,

          medias: files.length
            ? {
                deleteMany: {},
                create: files.map((f) => ({
                  url: publicElonUrl(f.filename),
                  type: mediaTypeFromMime(f.mimetype),
                })),
              }
            : undefined,
        },
        include: { medias: true },
      });

      res.status(200).send({
        success: true,
        message: "Elon updated successfully",
        data: updated,
      });
    } catch (error: any) {
      next(new ErrorHandler(error.message, error.status));
    }
  }

  // ✅ DELETE /elon/:id
  static async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const id = Number(req.params.id);
      if (Number.isNaN(id)) {
        return res.status(400).send({ success: false, message: "Invalid id" });
      }

      const elon = await client.elon.findUnique({
        where: { id },
        include: { medias: true },
      });

      if (!elon) {
        return res.status(404).send({ success: false, message: "Elon not found" });
      }

      await client.elonMedia.deleteMany({ where: { elonId: id } });
      await client.elon.delete({ where: { id } });

      res.status(200).send({
        success: true,
        message: "Elon deleted successfully",
      });
    } catch (error: any) {
      next(new ErrorHandler(error.message, error.status));
    }
  }
}
