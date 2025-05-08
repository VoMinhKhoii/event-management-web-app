// routes/settingsRoute.js
import express from "express";

import { getSettings, updateSettings } from "../controllers/settingsController.js";
const router = express.Router();

// GET current settings
router.get('/', getSettings);

// PUT to update event settings
router.put('/', updateSettings);

export default router;
