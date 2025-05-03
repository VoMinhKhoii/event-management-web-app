import express from 'express';
import { serveUploads } from '../controllers/uploadsController.js';

const router = express.Router();

router.use('/', serveUploads)

export default router;
