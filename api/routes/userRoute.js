import express from 'express';
import { getUser, getUsers, updateUser, deleteUser } from '../controllers/userController.js';
// import { verifyToken } from '../middleware/verifyToken.js';
import { verifyToken } from '../middleware/verifyToken.js';
// import { verifyToken } from '../middleware/verifyToken.js';

const router = express.Router();

// get all users
router.get('/', getUsers);

// get user by id
router.get('/:id', getUser);

// update user
router.put('/:id', verifyToken, updateUser);

// delete user
router.delete('/:id', verifyToken, deleteUser);
export default router;