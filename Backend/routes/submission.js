import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { authenticateToken } from "../middleware/auth.middleware.js";
import {
  createSubmission,
  getMySubmissions,
  getSubmissionById,
} from "../controllers/submissionController.js";

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = "uploads/originals";
    fs.mkdirSync(uploadDir, { recursive: true });
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${Math.round(
      Math.random() * 1e9
    )}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif/;
    const extname = allowedTypes.test(
      path.extname(file.originalname).toLowerCase()
    );
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error("Only image files are allowed!"));
    }
  },
});

// Routes
router.post(
  "/",
  authenticateToken,
  upload.fields([
    { name: "upperImage", maxCount: 1 },
    { name: "frontImage", maxCount: 1 },
    { name: "bottomImage", maxCount: 1 },
  ]),
  createSubmission
);
router.get("/my-submissions", authenticateToken, getMySubmissions);
router.get("/:id", authenticateToken, getSubmissionById);

export default router;
