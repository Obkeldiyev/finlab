import { ErrorHandler } from "@errors";
import { PrismaClient } from "@prisma/client";
import { NextFunction, Request, Response } from "express";

const client = new PrismaClient();

function publicUrlForFile(filename: string) {
  return `/uploads/partners/${filename}`;
}

export class PartnerController {
  static async getAllPartners(req: Request, res: Response, next: NextFunction) {
    try {
      const partners = await client.partner.findMany({
        orderBy: { created_at: "desc" },
      });

      res.status(200).send({
        success: true,
        message: "All partners",
        data: partners,
      });
    } catch (error: any) {
      next(new ErrorHandler(error.message, error.status));
    }
  }

  static async getOnePartner(req: Request, res: Response, next: NextFunction) {
    try {
      const id = Number(req.params.id);
      if (Number.isNaN(id)) {
        return res.status(400).send({ success: false, message: "Invalid id" });
      }

      const partner = await client.partner.findUnique({
        where: { id },
      });

      if (!partner) {
        return res.status(404).send({ success: false, message: "Partner not found" });
      }

      res.status(200).send({ success: true, message: "One partner", data: partner });
    } catch (error: any) {
      next(new ErrorHandler(error.message, error.status));
    }
  }

  static async createPartner(req: Request, res: Response, next: NextFunction) {
    try {
      const { name, website_url } = req.body;

      if (!name || !website_url) {
        return res.status(400).send({
          success: false,
          message: "Name and website URL are required",
        });
      }

      const file = req.file;
      if (!file) {
        return res.status(400).send({
          success: false,
          message: "Logo file is required",
        });
      }

      const created = await client.partner.create({
        data: {
          name,
          website_url,
          logo_url: publicUrlForFile(file.filename),
        },
      });

      res.status(201).send({
        success: true,
        message: "Partner created successfully",
        data: created,
      });
    } catch (error: any) {
      next(new ErrorHandler(error.message, error.status));
    }
  }

  static async updatePartner(req: Request, res: Response, next: NextFunction) {
    try {
      const id = Number(req.params.id);
      if (Number.isNaN(id)) {
        return res.status(400).send({ success: false, message: "Invalid id" });
      }

      const exists = await client.partner.findUnique({ where: { id } });
      if (!exists) {
        return res.status(404).send({ success: false, message: "Partner not found" });
      }

      const { name, website_url } = req.body;
      const file = req.file;

      const updateData: any = {};
      if (name) updateData.name = name;
      if (website_url) updateData.website_url = website_url;
      if (file) {
        updateData.logo_url = publicUrlForFile(file.filename);
      }

      const updated = await client.partner.update({
        where: { id },
        data: updateData,
      });

      res.status(200).send({
        success: true,
        message: "Partner updated successfully",
        data: updated,
      });
    } catch (error: any) {
      next(new ErrorHandler(error.message, error.status));
    }
  }

  static async deletePartner(req: Request, res: Response, next: NextFunction) {
    try {
      const id = Number(req.params.id);
      if (Number.isNaN(id)) {
        return res.status(400).send({ success: false, message: "Invalid id" });
      }

      const partner = await client.partner.findUnique({
        where: { id },
      });

      if (!partner) {
        return res.status(404).send({ success: false, message: "Partner not found" });
      }

      await client.partner.delete({ where: { id } });

      res.status(200).send({ success: true, message: "Partner deleted successfully" });
    } catch (error: any) {
      next(new ErrorHandler(error.message, error.status));
    }
  }
}
