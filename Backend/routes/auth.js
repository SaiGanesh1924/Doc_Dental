import express from "express";
import { signup, logout, login, getMe } from "../controllers/authcontroller.js";
import { authenticateToken } from "../middleware/auth.middleware.js";
const router = express.Router();

router.post("/register", signup);
router.post("/logout", logout);
router.post("/login", login);
router.get("/me", authenticateToken, getMe);

export default router;
