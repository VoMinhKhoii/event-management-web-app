import express from 'express';
import { getUser, getUsers, updateUser, updateAvatar } from '../controllers/userController.js';
import { verifyToken } from '../middleware/verifyToken.js';
import { upload } from '../middleware/fileUpload.js';

const router = express.Router();
// get all users
router.get('/', getUsers);

// Get user profile
router.get('/:id', verifyToken, getUser);

// Update user profile
router.put('/:id', verifyToken, updateUser);

// Update user avatar - Using a specific path to avoid conflict with the general update route
router.post('/:id/avatar', verifyToken, upload.single('avatar'), updateAvatar);

export default router;
