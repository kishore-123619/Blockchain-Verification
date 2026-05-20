import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configure storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Create different directories for certificates and photos
    if (file.fieldname === "certificateFile") {
      cb(null, path.join(__dirname, "../../uploads/certificates"));
    } else if (file.fieldname === "studentPhoto") {
      cb(null, path.join(__dirname, "../../uploads/photos"));
    } else {
      cb(null, path.join(__dirname, "../../uploads"));
    }
  },
  filename: (req, file, cb) => {
    // Generate unique filename
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

// File filter
const fileFilter = (req, file, cb) => {
  if (file.fieldname === "certificateFile") {
    // Only allow PDF files
    if (file.mimetype === "application/pdf") {
      cb(null, true);
    } else {
      cb(new Error("Certificate file must be PDF"), false);
    }
  } else if (file.fieldname === "studentPhoto") {
    // Only allow image files
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Student photo must be an image"), false);
    }
  } else {
    cb(null, true);
  }
};

// Create multer instance
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB limit
  },
});

export default upload;
