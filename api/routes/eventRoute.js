import express from 'express';
import { getAllEvent, getEvent, createEvent, updateEvent, deleteEvent } from '../controllers/eventController.js';
import { requestToJoinEvent, handleJoinRequest } from '../controllers/eventRequestController.js';
import { inviteToEvent, handleInvitation } from '../controllers/eventInvitationController.js';
import { verifyToken } from '../middleware/verifyToken.js';

const router = express.Router();

router.get('/', verifyToken, getAllEvent);
router.get('/:eventId', verifyToken, getEvent);
router.post('/', verifyToken, createEvent);
router.put('/:eventId', verifyToken, updateEvent);
router.delete('/:eventId', verifyToken, deleteEvent);

// TODO: Ability to cancel request/invitation, GET all requests/invitation associated with a user
router.post('/:eventId/request-join', verifyToken, requestToJoinEvent);                 // Request to join public event
router.put('/:eventId/requests/:requestId', verifyToken, handleJoinRequest);            // Organizer approve/reject join request
router.post('/:eventId/invite', verifyToken, inviteToEvent);                         // Invite to join private event
router.put('/:eventId/invitations/:invitationId', verifyToken, handleInvitation);    // Receiver accept/reject invitation

export default router;
