import { Router } from "express";
import { PartnerController } from "../controllers/partner.controller";
import { uploadPartnerLogo } from "../config/multer";
import { verifyAdmin, verifyToken } from "src/middlewares/verify";

const partnerRoutes = Router();

partnerRoutes.get("/", PartnerController.getAllPartners);
partnerRoutes.get("/:id", PartnerController.getOnePartner);
partnerRoutes.post("/", verifyToken, verifyAdmin, uploadPartnerLogo.single("logo"), PartnerController.createPartner);
partnerRoutes.patch("/:id", verifyToken, verifyAdmin, uploadPartnerLogo.single("logo"), PartnerController.updatePartner);
partnerRoutes.delete("/:id", verifyToken, verifyAdmin, PartnerController.deletePartner);

export { partnerRoutes };
