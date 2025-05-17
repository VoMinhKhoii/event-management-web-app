import express from 'express';
import { getAllEvent, getEvent, createEvent, updateEvent, deleteEvent } from '../controllers/eventController.js';
import { requestToJoinEvent, handleJoinRequest, getRequests } from '../controllers/eventRequestController.js';
import { inviteToEvent, handleInvitation, getInvitations } from '../controllers/eventInvitationController.js';
import { verifyToken } from '../middleware/verifyToken.js';
import { upload } from '../middleware/fileUpload.js';
import { sendPendingInvitationReminders, sendAttendeeReminders } from '../controllers/eventReminderController.js';

const router = express.Router();

router.get('/invitations-get', getInvitations);

router.get('/', verifyToken, getAllEvent);
router.get('/:eventId', verifyToken, getEvent);
router.post('/', verifyToken, upload.single('image'), createEvent);
router.put('/:eventId', verifyToken, upload.single('image'), updateEvent);
router.delete('/:eventId', verifyToken, deleteEvent);



router.get('/:eventId/requests-get', getRequests);


router.post('/:eventId/request-join', verifyToken, requestToJoinEvent);                 // Request to join public event
router.put('/:eventId/requests/:requestId', verifyToken, handleJoinRequest);            // Organizer approve/reject join request
router.post('/:eventId/invite', verifyToken, inviteToEvent);                         // Invite to join event
router.put('/:eventId/invitations/:invitationId', verifyToken, handleInvitation);    // Receiver accept/reject invitation
router.post('/:eventId/reminders/pending-invites', verifyToken, sendPendingInvitationReminders);
router.post('/:eventId/reminders/attendees', verifyToken, sendAttendeeReminders); 

export default router;
