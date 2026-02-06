import { ErrorHandler } from "@errors";
import { PrismaClient } from "@prisma/client";
import { NextFunction, Request, Response } from "express";
import path from "path";

const client = new PrismaClient();

function mediaTypeFromMimetype(mime: string) {
  if (mime.startsWith("image/")) return "image";
  if (mime.startsWith("video/")) return "video";
  return "file";
}

function publicUrlForFile(filename: string) {
  return `/uploads/news/${filename}`;
}

export class NewsController {
  static async getAllNews(req: Request, res: Response, next: NextFunction) {
    try {
      const page = Number(req.query.page || 1);
      const limit = Number(req.query.limit || 20);
      const skip = (page - 1) * limit;

      const [items, total] = await Promise.all([
        client.news.findMany({
          skip,
          take: limit,
          orderBy: { published_at: "desc" },
          include: { medias: true },
        }),
        client.news.count(),
      ]);

      res.status(200).send({
        success: true,
        message: "All news",
        page,
        limit,
        total,
        data: items,
      });
    } catch (error: any) {
      next(new ErrorHandler(error.message, error.status));
    }
  }

  static async getOneNews(req: Request, res: Response, next: NextFunction) {
    try {
      const id = Number(req.params.id);
      if (Number.isNaN(id)) {
        return res.status(400).send({ success: false, message: "Invalid id" });
      }

      const news = await client.news.findUnique({
        where: { id },
        include: { medias: true },
      });

      if (!news) {
        return res.status(404).send({ success: false, message: "News not found" });
      }

      res.status(200).send({ success: true, message: "One news", data: news });
    } catch (error: any) {
      next(new ErrorHandler(error.message, error.status));
    }
  }

  static async createNews(req: Request, res: Response, next: NextFunction) {
    try {
      const { title_en, title_ru, title_uz, content_en, content_ru, content_uz } = req.body;

      if (!title_en || !title_ru || !title_uz || !content_en || !content_ru || !content_uz) {
        return res.status(400).send({
          success: false,
          message: "All title_* and content_* fields are required",
        });
      }

      const files = (req.files as Express.Multer.File[]) || [];

      const created = await client.news.create({
        data: {
          title_en,
          title_ru,
          title_uz,
          content_en,
          content_ru,
          content_uz,
          medias: files.length
            ? {
                create: files.map((f) => ({
                  url: publicUrlForFile(f.filename),
                  type: mediaTypeFromMimetype(f.mimetype),
                })),
              }
            : undefined,
        },
        include: { medias: true },
      });

      res.status(201).send({
        success: true,
        message: "News created successfully",
        data: created,
      });
    } catch (error: any) {
      next(new ErrorHandler(error.message, error.status));
    }
  }

  static async updateNews(req: Request, res: Response, next: NextFunction) {
    try {
      const id = Number(req.params.id);
      if (Number.isNaN(id)) {
        return res.status(400).send({ success: false, message: "Invalid id" });
      }

      const exists = await client.news.findUnique({ where: { id } });
      if (!exists) {
        return res.status(404).send({ success: false, message: "News not found" });
      }

      const { title_en, title_ru, title_uz, content_en, content_ru, content_uz } = req.body;
      const files = (req.files as Express.Multer.File[]) || [];

      const updated = await client.news.update({
        where: { id },
        data: {
          title_en,
          title_ru,
          title_uz,
          content_en,
          content_ru,
          content_uz,

          medias: files.length
            ? {
                deleteMany: {},
                create: files.map((f) => ({
                  url: publicUrlForFile(f.filename),
                  type: mediaTypeFromMimetype(f.mimetype),
                })),
              }
            : undefined,
        },
        include: { medias: true },
      });

      res.status(200).send({
        success: true,
        message: "News updated successfully",
        data: updated,
      });
    } catch (error: any) {
      next(new ErrorHandler(error.message, error.status));
    }
  }

  static async deleteNews(req: Request, res: Response, next: NextFunction) {
    try {
      const id = Number(req.params.id);
      if (Number.isNaN(id)) {
        return res.status(400).send({ success: false, message: "Invalid id" });
      }

      const news = await client.news.findUnique({
        where: { id },
        include: { medias: true },
      });

      if (!news) {
        return res.status(404).send({ success: false, message: "News not found" });
      }

      await client.newsMedia.deleteMany({ where: { newsId: id } });
      await client.news.delete({ where: { id } });

      res.status(200).send({ success: true, message: "News deleted successfully" });
    } catch (error: any) {
      next(new ErrorHandler(error.message, error.status));
    }
  }
}
