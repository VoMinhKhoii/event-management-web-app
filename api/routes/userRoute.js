import express from 'express';
import { updateProfile, getUserProfile, updateAvatar } from '../controllers/userController.js';
// import { getUser, getUsers, updateUser, deleteUser } from '../controllers/userController.js';
import { verifyToken } from '../middleware/verifyToken.js';

const router = express.Router();
// // get all users
// router.get('/', getUsers);

//  // get user by id
//  router.get('/:id', getUser);

// // // update user
//  router.put('/:id', verifyToken, updateUser);

// // delete user
//  router.delete('/:id', verifyToken, deleteUser);

// Get user profile
router.get('/:id', verifyToken, getUserProfile);

// Update user profile
router.put('/:id', verifyToken, updateProfile);

// Update user avatar
router.put('/:id', verifyToken, updateAvatar);

export default router;
