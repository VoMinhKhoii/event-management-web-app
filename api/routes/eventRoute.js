import express from 'express';
import { getAllEvent, getEvent, createEvent, updateEvent, deleteEvent, requestToJoinEvent, handleJoinRequest } from '../controllers/eventController.js';
import { verifyToken } from '../middleware/verifyToken.js';

const router = express.Router();


router.get('/', verifyToken, getAllEvent);
router.get('/:id',verifyToken, getEvent);
router.post('/',verifyToken, createEvent);
router.put('/:id',verifyToken, updateEvent);
router.delete('/:id',verifyToken, deleteEvent);

export default router;
