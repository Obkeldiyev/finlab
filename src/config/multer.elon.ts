import multer from "multer";
import path from "path";
import fs from "fs";

function ensureDir(dir: string) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

const UPLOAD_ROOT = path.join(process.cwd(), "uploads");
const ELON_DIR = path.join(UPLOAD_ROOT, "elon");

ensureDir(ELON_DIR);

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, ELON_DIR);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const base = path
      .basename(file.originalname, ext)
      .replace(/\s+/g, "-")
      .replace(/[^a-zA-Z0-9-_]/g, "")
      .slice(0, 50);

    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${base || "file"}-${unique}${ext}`);
  },
});

// Allow only images and videos with specific formats
function fileFilter(
  req: Express.Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback,
) {
  const allowedImageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
  const allowedVideoTypes = ['video/mp4', 'video/mpeg', 'video/quicktime', 'video/x-msvideo', 'video/webm'];
  
  const isImage = allowedImageTypes.includes(file.mimetype);
  const isVideo = allowedVideoTypes.includes(file.mimetype);
  
  if (isImage || isVideo) {
    cb(null, true);
  } else {
    cb(new Error(`Only images (JPEG, PNG, GIF, WebP) and videos (MP4, MPEG, MOV, AVI, WebM) are allowed. Received: ${file.mimetype}`));
  }
}

export const uploadElonMedia = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB per file (increased from 20MB)
    files: 10, // max 10 files
  },
});
