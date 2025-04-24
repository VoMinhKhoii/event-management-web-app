import express from 'express';
import { getAllEvent, getEvent, createEvent, updateEvent, deleteEvent, requestToJoinEvent, handleJoinRequest } from '../controllers/eventController.js';
import { verifyToken } from '../middleware/verifyToken.js';

const router = express.Router();

router.get('/', getAllEvent);
router.get('/:eventId', getEvent);
router.post('/', verifyToken, createEvent);
router.put('/:eventId', verifyToken, updateEvent);
router.delete('/:eventId', verifyToken, deleteEvent);

router.post('/:eventId/request-join', verifyToken, requestToJoinEvent);         // Request to join public event
router.put('/:eventId/requests/:requestId', verifyToken, handleJoinRequest);    // Organizer approve/reject join request

export default router;
