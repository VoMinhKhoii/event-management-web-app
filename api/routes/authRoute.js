import express from 'express';

import { signup, login, logout } from '../controllers/authController.js';
import { verifyToken } from '../middleware/verifyToken.js';

const router = express.Router();

// Register route user
router.post('/signup', signup);
// Login route user
router.post('/login', login);
router.post('/logout', logout);



export default router;