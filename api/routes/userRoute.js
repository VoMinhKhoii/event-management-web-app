import express from 'express';
import { getUser, getUsers, updateUser, deleteUser, updateAvatar } from '../controllers/userController.js';
import { verifyToken } from '../middleware/verifyToken.js';

const router = express.Router();
// get all users
router.get('/', getUsers);

// Get user profile
router.get('/:id', verifyToken, getUser);

// Update user profile
router.put('/:id', verifyToken, updateUser);

// Update user avatar - Using a specific path to avoid conflict with the general update route
router.put('/:id/avatar', verifyToken, updateAvatar);

export default router;
