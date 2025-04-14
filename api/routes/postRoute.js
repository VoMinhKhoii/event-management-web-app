import express from 'express';

import { verifyToken } from '../middleware/verifyToken.js';

const router = express.Router();

// Placeholder endpoints
router.get('/', verifyToken, (req, res) => {
    res.json({ message: 'List of posts or discussions' });
});

router.post('/', verifyToken, (req, res) => {
    res.json({ message: 'Post created' });
});

export default router;