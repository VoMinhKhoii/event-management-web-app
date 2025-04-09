import express from 'express';

import { signup, login, logout } from '../controllers/authController.js';
import { verifyToken } from '../middleware/verifyToken.js';

const router = express.Router();

// Register route
router.post('/signup', signup);

// Login route
router.post('/login', login);

// Logout route
router.post('/logout', verifyToken, logout);

export default router;