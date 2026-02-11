import { Router } from "express";
import { GalleryController } from "../controllers/gallery.controller";
import { uploadGalleryMedia } from "../config/multer";
import { verifyAdmin, verifyToken } from "src/middlewares/verify";

const galleryRoutes = Router();

galleryRoutes.get("/", GalleryController.getAllGallery);
galleryRoutes.get("/:id", GalleryController.getOneGallery);
galleryRoutes.post("/", verifyToken, verifyAdmin, uploadGalleryMedia.single("media"), GalleryController.createGallery);
galleryRoutes.patch("/:id", verifyToken, verifyAdmin, uploadGalleryMedia.single("media"), GalleryController.updateGallery);
galleryRoutes.delete("/:id", verifyToken, verifyAdmin, GalleryController.deleteGallery);

export { galleryRoutes };
