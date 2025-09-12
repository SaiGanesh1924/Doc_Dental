import express from "express";
import {
  getAllSubmissions,
  saveAnnotation,
  generateReport,
} from "../controllers/adminController.js";
import {
  authenticateToken as authMiddleware,
  adminOnly,
} from "../middleware/auth.middleware.js";

const router = express.Router();

router.get("/submissions", authMiddleware, adminOnly, getAllSubmissions);
router.post("/annotate/:id", authMiddleware, adminOnly, saveAnnotation);
router.post("/generate-pdf/:id", authMiddleware, adminOnly, generateReport);

export default router;
