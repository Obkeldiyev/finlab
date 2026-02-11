import { ErrorHandler } from "@errors";
import { PrismaClient } from "@prisma/client";
import { NextFunction, Request, Response } from "express";

const client = new PrismaClient();

function mediaTypeFromMimetype(mime: string) {
  if (mime.startsWith("image/")) return "image";
  if (mime.startsWith("video/")) return "video";
  return "file";
}

function publicUrlForFile(filename: string) {
  return `/uploads/gallery/${filename}`;
}

export class GalleryController {
  static async getAllGallery(req: Request, res: Response, next: NextFunction) {
    try {
      const page = Number(req.query.page || 1);
      const limit = Number(req.query.limit || 50);
      const skip = (page - 1) * limit;

      const [items, total] = await Promise.all([
        client.gallery.findMany({
          skip,
          take: limit,
          orderBy: { created_at: "desc" },
        }),
        client.gallery.count(),
      ]);

      res.status(200).send({
        success: true,
        message: "All gallery items",
        page,
        limit,
        total,
        data: items,
      });
    } catch (error: any) {
      next(new ErrorHandler(error.message, error.status));
    }
  }

  static async getOneGallery(req: Request, res: Response, next: NextFunction) {
    try {
      const id = Number(req.params.id);
      if (Number.isNaN(id)) {
        return res.status(400).send({ success: false, message: "Invalid id" });
      }

      const gallery = await client.gallery.findUnique({
        where: { id },
      });

      if (!gallery) {
        return res.status(404).send({ success: false, message: "Gallery item not found" });
      }

      res.status(200).send({ success: true, message: "One gallery item", data: gallery });
    } catch (error: any) {
      next(new ErrorHandler(error.message, error.status));
    }
  }

  static async createGallery(req: Request, res: Response, next: NextFunction) {
    try {
      const { title } = req.body;
      
      if (!title) {
        return res.status(400).send({
          success: false,
          message: "Title is required",
        });
      }

      const file = req.file;
      if (!file) {
        return res.status(400).send({
          success: false,
          message: "File is required",
        });
      }

      const created = await client.gallery.create({
        data: {
          title,
          url: publicUrlForFile(file.filename),
          type: mediaTypeFromMimetype(file.mimetype),
        },
      });

      res.status(201).send({
        success: true,
        message: "Gallery item created successfully",
        data: created,
      });
    } catch (error: any) {
      next(new ErrorHandler(error.message, error.status));
    }
  }

  static async updateGallery(req: Request, res: Response, next: NextFunction) {
    try {
      const id = Number(req.params.id);
      if (Number.isNaN(id)) {
        return res.status(400).send({ success: false, message: "Invalid id" });
      }

      const exists = await client.gallery.findUnique({ where: { id } });
      if (!exists) {
        return res.status(404).send({ success: false, message: "Gallery item not found" });
      }

      const { title } = req.body;
      const file = req.file;

      const updateData: any = {};
      if (title) updateData.title = title;
      if (file) {
        updateData.url = publicUrlForFile(file.filename);
        updateData.type = mediaTypeFromMimetype(file.mimetype);
      }

      const updated = await client.gallery.update({
        where: { id },
        data: updateData,
      });

      res.status(200).send({
        success: true,
        message: "Gallery item updated successfully",
        data: updated,
      });
    } catch (error: any) {
      next(new ErrorHandler(error.message, error.status));
    }
  }

  static async deleteGallery(req: Request, res: Response, next: NextFunction) {
    try {
      const id = Number(req.params.id);
      if (Number.isNaN(id)) {
        return res.status(400).send({ success: false, message: "Invalid id" });
      }

      const gallery = await client.gallery.findUnique({
        where: { id },
      });

      if (!gallery) {
        return res.status(404).send({ success: false, message: "Gallery item not found" });
      }

      await client.gallery.delete({ where: { id } });

      res.status(200).send({ success: true, message: "Gallery item deleted successfully" });
    } catch (error: any) {
      next(new ErrorHandler(error.message, error.status));
    }
  }
}
