import express from "express";
import { getTodayWord } from "../controllers/wordlyControllers.js";

const router = express.Router();

router.get("/todayWord", getTodayWord);

export default router