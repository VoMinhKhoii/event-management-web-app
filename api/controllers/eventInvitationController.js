import Invitation from '../models/Invitation.js';
import Event from '../models/Event.js';
import Participation from '../models/Participation.js';
import Notification from '../models/Notification.js';
import { logActivity } from '../middleware/logActivity.js';
import mongoose from "mongoose";
import User from '../models/User.js';


// GET /api/events/:eventId/invitations/:userId
export const getInvitations = async (req, res) => {
    try {
        const { eventId } = req.query;
        const filter = {kind: 'Invitation'}; // Initialize filter object
        if (eventId) {
            filter.event = eventId; // Add eventId to filter if provided
        }


        const invitations = await Participation.find(filter).populate({
            path: 'user',
            select: 'username avatar email'
        });
        if (!invitations) {
            return res.status(404).json({ error: 'No invitations found' });
        }
        res.status(200).json({ invitations });
    } catch (err) {
        console.error('Error fetching invitations:', err);
        res.status(500).json({ error: 'Failed to fetch invitations', message: err.message });
    }
};


// POST /api/events/:eventId/invite
export const inviteToEvent = async (req, res) => {
    // Start a session for the transaction
    const session = await mongoose.startSession();

    try {
        // Begin transaction
        session.startTransaction();

        const { eventId } = req.params;
        const { username } = req.body;
        const inviterId = req.userId;

        const organizer = await User.findById(inviterId)
            .select('username email firstName lastName avatar')
            .session(session)
            .lean();

        if (!organizer) {
            await session.abortTransaction();
            session.endSession();
            return res.status(404).json({ error: 'Organizer not found' });
        }

        if (!username) {
            await session.abortTransaction();
            session.endSession();
            return res.status(400).json({ error: 'Username is required' });
        }

        // Validate input
        const invitee = await User.findOne({ username }).session(session);
        if (!invitee) {
            await session.abortTransaction();
            session.endSession();
            return res.status(404).json({ error: 'User not found' });
        }

        const inviteeId = invitee._id;

        // Check if event exists & get details - do this in a single query
        const event = await Event.findById(eventId).session(session);
        if (!event) {
            await session.abortTransaction();
            session.endSession();
            return res.status(404).json({ error: 'Event not found' });
        }

        // Additional checks for event validity
        if (event.status === 'ended') {
            await session.abortTransaction();
            session.endSession();
            return res.status(400).json({ error: 'Cannot invite to an event that has ended' });
        }

        if (event.status === 'ongoing') {
            await session.abortTransaction();
            session.endSession();
            return res.status(400).json({ error: 'Cannot invite to an event that is ongoing' });
        }

        if (event.status === 'cancelled') {
            await session.abortTransaction();
            session.endSession();
            return res.status(400).json({ error: 'Cannot invite to a cancelled event' });
        }

        // Permission & self-invite checks
        if (event.organizer.toString() !== inviterId) {
            await session.abortTransaction();
            session.endSession();
            return res.status(403).json({ error: 'Only the event organizer can invite' });
        }

        if (inviteeId === inviterId) {
            await session.abortTransaction();
            session.endSession();
            return res.status(400).json({ error: 'Cannot invite yourself' });
        }

        // Check for capacity before inviting (avoid inviting to full events)
        if (event.curAttendees >= event.maxAttendees) {
            await session.abortTransaction();
            session.endSession();
            return res.status(400).json({ error: 'Event is at maximum capacity' });
        }

        // Important change: check in the Participation collection for ANY participation type
        // This covers both invitations and requests using the base model
        const existingParticipation = await Participation.findOne({
            event: eventId,
            user: inviteeId
        }).session(session).lean();

        if (existingParticipation) {
            let errorMessage, statusDetails;

            switch (existingParticipation.status) {
                case 'approved':
                    errorMessage = 'User is already attending this event';
                    statusDetails = 'already_attending';
                    break;
                case 'invited':
                    errorMessage = 'An invitation has already been sent to this user';
                    statusDetails = 'invitation_pending';
                    break;
                case 'rejected':
                    errorMessage = 'This user has previously declined an invitation to this event';
                    statusDetails = 'previously_declined';
                    break;
                case 'pending':
                    errorMessage = 'This user has a pending request to join this event';
                    statusDetails = 'request_pending';
                    break;
                default:
                    errorMessage = 'User already has a participation record for this event';
                    statusDetails = 'existing_record';
            }

            await session.abortTransaction();
            session.endSession();
            return res.status(400).json({
                error: errorMessage,
                status: statusDetails,
                participationId: existingParticipation._id,
                participationStatus: existingParticipation.status,
                participationType: existingParticipation.kind,
                sentAt: existingParticipation.createdAt
            });
        }

        // Create and save invitation within the transaction
        const invitation = await Invitation.create([{
            event: eventId,
            user: inviteeId,
            invitedBy: inviterId,
            status: 'invited',
            customMessage: req.body.message || '' // Include custom message if provided
        }], { session }).then(invites => invites[0]);

        // Create notification for the invitee within the same transaction
        await Notification.create([{
            userId: inviteeId,
            type: 'invitation',
            message: `You've been invited to ${event.title}`,
            notificationSender: inviterId,
            relatedId: invitation._id,
            data: {

            },
            isRead: false
        }], { session });


        // Return fully populated data
        const populatedInvitation = await Invitation.findById(invitation._id)
            .session(session)
            .populate('event', 'title startDate startTime endDate endTime location image')
            .populate('user', 'username email')
            .populate('invitedBy', 'username email');

        // Commit the transaction
        await session.commitTransaction();
        session.endSession();

        res.status(201).json({
            invitation: populatedInvitation,
            message: 'Invitation sent successfully'
        });
    } catch (err) {
        // Abort the transaction on error
        await session.abortTransaction();
        session.endSession();
        console.error('Error creating invitation:', err);
        res.status(500).json({ error: 'Failed to send invitation', message: err.message });
    }
};

// PUT /api/events/:eventId/invitations/:invitationId
// PUT /api/events/:eventId/invitations/:invitationId
export const handleInvitation = async (req, res) => {
    // Start a session for the transaction
    const session = await mongoose.startSession();

    try {
        // Begin transaction
        session.startTransaction();

        const { eventId, invitationId } = req.params;
        const { action } = req.body; // 'accept' / 'decline'
        const userId = req.userId;

        // Find invitation with session
        // Important: We need to check that this is an Invitation, not another type
        const invitation = await Invitation.findOne({
            _id: invitationId,
            event: eventId,
            user: userId,
            kind: 'Invitation' // Ensure we're dealing with an Invitation, not a Request
        }).session(session).populate({
            path: 'event',
            select: 'title organizer curAttendees maxAttendees status startDate startTime endDate endTime'
        });

        if (!invitation) {
            await session.abortTransaction();
            session.endSession();
            return res.status(404).json({ error: 'Invitation not found' });
        }

        if (invitation.status !== 'invited') {
            await session.abortTransaction();
            session.endSession();
            return res.status(400).json({ error: 'This invitation has already been processed' });
        }

        // Check if event is still active
        if (invitation.event.status === 'ended' || invitation.event.status === 'cancelled') {
            await session.abortTransaction();
            session.endSession();
            return res.status(400).json({
                error: `Cannot respond to an invitation for an event that is ${invitation.event.status}`
            });
        }

        const event = await Event.findById(invitation.event._id)
            .select('title organizer startDate startTime endTime location')
            .populate('organizer', 'username email firstName lastName')
            .session(session)
            .lean();

        if (action === 'accept') {
            // Check capacity within transaction
            if (invitation.event.curAttendees >= invitation.event.maxAttendees) {
                await session.abortTransaction();
                session.endSession();
                return res.status(400).json({ error: 'Event at maximum capacity' });
            }

            //Check start time
            const currentDate = new Date();
            const eventStartDate = new Date(invitation.event.startDate);
            const eventStartTime = new Date(`${invitation.event.startDate} ${invitation.event.startTime}`);
            if (eventStartDate < currentDate || eventStartTime < currentDate) {
                await session.abortTransaction();
                session.endSession();
                return res.status(400).json({ error: 'Event has already started' });
            }

            //Check ended
            const eventEndDate = new Date(invitation.event.endDate);
            const eventEndTime = new Date(`${invitation.event.endDate} ${invitation.event.endTime}`);
            if (eventEndDate < currentDate || eventEndTime < currentDate) {
                await session.abortTransaction();
                session.endSession();
                return res.status(400).json({ error: 'Event has already ended' });
            }

            // Get current event dates and times
            const targetStartDate = invitation.event.startDate;
            const targetEndDate = invitation.event.endDate;
            const targetStartTime = invitation.event.startTime;
            const targetEndTime = invitation.event.endTime;

            // Find conflicting participations of ANY type (both invitations and requests)
            const conflictingParticipations = await Participation.find({
                user: userId,
                status: 'approved',
                _id: { $ne: invitationId }
            }).session(session)
                .populate({
                    path: 'event',
                    match: {
                        // Only return events that overlap with the target timeframe
                        $and: [
                            // Event hasn't ended before our event starts
                            {
                                $or: [
                                    { endDate: { $gt: targetStartDate } },
                                    {
                                        $and: [
                                            { endDate: targetStartDate },
                                            { endTime: { $gte: targetStartTime } }
                                        ]
                                    }
                                ]
                            },
                            // Event doesn't start after our event ends
                            {
                                $or: [
                                    { startDate: { $lt: targetEndDate } },
                                    {
                                        $and: [
                                            { startDate: targetEndDate },
                                            { startTime: { $lte: targetEndTime } }
                                        ]
                                    }
                                ]
                            }
                        ],
                        // Skip events that are cancelled
                        status: { $ne: 'cancelled' }
                    },
                    select: 'title startDate startTime endDate endTime'
                });

            // Find events the user is organizing that overlap with this timeframe
            const conflictingOrganizedEvents = await Event.find({
                organizer: userId,
                _id: { $ne: eventId },
                status: { $nin: ['cancelled', 'ended'] },

                // Check for overlapping timeframe
                $and: [
                    // Event hasn't ended before our event starts
                    {
                        $or: [
                            { endDate: { $gt: targetStartDate } },
                            {
                                $and: [
                                    { endDate: targetStartDate },
                                    { endTime: { $gte: targetStartTime } }
                                ]
                            }
                        ]
                    },
                    // Event doesn't start after our event ends
                    {
                        $or: [
                            { startDate: { $lt: targetEndDate } },
                            {
                                $and: [
                                    { startDate: targetEndDate },
                                    { startTime: { $lte: targetEndTime } }
                                ]
                            }
                        ]
                    }
                ]
            }).session(session)
                .select('title startDate startTime endDate endTime');

            // Process conflicts
            const conflicts = [];

            // Process participation conflicts (filter out null events from populate match)
            conflictingParticipations.forEach(participation => {
                if (participation.event) {
                    conflicts.push({
                        eventTitle: participation.event.title,
                        eventTime: `${participation.event.startDate} ${participation.event.startTime} - ${participation.event.endDate} ${participation.event.endTime}`,
                        role: 'Participant',
                        participationType: participation.kind
                    });
                }
            });

            // Process organizing conflicts
            conflictingOrganizedEvents.forEach(event => {
                conflicts.push({
                    eventTitle: event.title,
                    eventTime: `${event.startDate} ${event.startTime} - ${event.endDate} ${event.endTime}`,
                    role: 'Organizer'
                });
            });

            console.log('Conflicts:', conflicts);

            if (conflicts.length > 0) {
                await session.abortTransaction();
                session.endSession();
                return res.status(400).json({
                    error: 'Scheduling conflict detected',
                    conflicts: conflicts
                });
            }

            // Update invitation status
            // Important: Use the base Participation model since we're updating a field common to all types
            await Participation.findByIdAndUpdate(
                invitationId,
                {
                    status: 'approved',
                    respondedAt: new Date()
                },
                { session }
            );

            // Update event capacity
            await Event.findByIdAndUpdate(
                eventId,
                { $inc: { curAttendees: 1 } },
                { session }
            );

            const sender = await User.findById(invitation.user)
                .select('username email firstName lastName avatar')
                .session(session)
                .lean();

            if (!sender) {
                await session.abortTransaction();
                throw new Error('Recipient not found');
            }

            // Create a notification for the event organizer
            await Notification.create([{
                userId: invitation.event.organizer,
                type: 'invitationAccepted',
                message: `Invitation accepted`,
                relatedId: invitation._id,
                notificationSender: userId,
                data: {
                    message: `${sender.username || 'A user'} has accepted your invitation to ${invitation.event.title || 'your event'}.
                    
                    ${sender.firstName} ${sender.lastName},
                    ${sender.email}`,
                },
                isRead: false
            }], { session });

        } else if (action === 'decline') {
            // Update invitation status
            // Important: Use the base Participation model since we're updating a field common to all types
            await Participation.findByIdAndUpdate(
                invitationId,
                {
                    status: 'rejected',
                    respondedAt: new Date()
                },
                { session }
            );

            const sender = await User.findById(invitation.user)
                .select('username email firstName lastName avatar')
                .session(session)
                .lean();

            if (!sender) {
                await session.abortTransaction();
                throw new Error('Recipient not found');
            }

            // Create a notification for the event organizer
            await Notification.create([{
                userId: invitation.event.organizer,
                type: 'invitationDeclined',
                message: `Invitation declined`,
                relatedId: invitation._id,
                data: {
                    message: `${sender.username || 'A user'} has declined your invitation to ${invitation.event.title || 'your event'}.
                
                    ${sender.firstName} ${sender.lastName},
                    ${sender.email}`,

                    notificationSender: {
                        username: sender.username,
                        email: sender.email,
                        avatar: sender.avatar,
                        firstName: sender.firstName,
                        lastName: sender.lastName
                    },
                },
                isRead: false
            }], { session });

        } else {
            await session.abortTransaction();
            session.endSession();
            return res.status(400).json({ error: 'Invalid action' });
        }

        // Get the updated invitation to return in response
        // Important: Query from Invitation model to get invitation-specific fields
        const updatedInvitation = await Invitation.findById(invitationId)
            .session(session)
            .populate('event', 'title startDate startTime location')
            .populate('invitedBy', 'username email'); // Include invitedBy which is specific to Invitation

        // Commit the transaction
        await session.commitTransaction();
        session.endSession();

        res.status(200).json({
            invitation: updatedInvitation,
            message: `Invitation ${action === 'accept' ? 'accepted' : 'declined'} successfully`
        });
    } catch (err) {
        // Abort the transaction on error
        await session.abortTransaction();
        session.endSession();
        console.error('Error handling invitation:', err);
        res.status(500).json({ error: 'Failed to process invitation', message: err.message });
    } finally {
        if (session) {
            session.endSession();
        }
    }
};