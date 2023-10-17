import express from "express";
import { Login, Register, UpdateProfile } from "../controllers/auth.js";

const router = express.Router();

router.post("/login", Login);
router.post("/register", Register);
router.post("/update-profile", UpdateProfile);

export default router;
