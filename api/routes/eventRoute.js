import express from 'express';
import { getAllEvent, getEvent, createEvent, updateEvent, deleteEvent } from '../controllers/eventController.js';
import { verifyToken } from '../middleware/verifyToken.js';

const router = express.Router();

router.get('/', getAllEvent);
router.get('/:id', getEvent);
router.post('/', createEvent);
router.put('/:id', updateEvent);
router.delete('/:id', deleteEvent);

export default router;
