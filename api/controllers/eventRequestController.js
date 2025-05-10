import Event from '../models/Event.js';
import Request from '../models/Request.js';
import { logActivity } from '../middleware/logActivity.js';
import mongoose from 'mongoose';
import Notification from '../models/Notification.js';
import Participation from '../models/Participation.js';
import Invitation from '../models/Invitation.js';
import User from '../models/User.js';

export const getRequests = async (req, res) => {
    try {
        const { eventId } = req.params;
        const requests = await Participation.find({
            event: eventId,
            kind: 'Request',
        }).populate({
            path: 'user',
            select: 'username avatar email'
        });
        if (!requests) {
            return res.status(404).json({ error: 'No requests found' });
        }
        res.status(200).json({ requests });
    } catch (err) {
        console.error('Error fetching invitations:', err);
        res.status(500).json({ error: 'Failed to fetch invitations', message: err.message });
    }
};

// POST /api/events/:eventId/request-join
export const requestToJoinEvent = async (req, res) => {
    console.log('Memory before function:', process.memoryUsage().heapUsed / 1024 / 1024, 'MB');
    const session = await mongoose.startSession();

    try {
        // Begin transaction
        session.startTransaction();

        const { eventId } = req.params;
        const userId = req.userId;

        const requestingUser = await User.findById(userId)
            .select('username email firstName lastName avatar')
            .session(session)
            .lean();

        if (!requestingUser) {
            await session.abortTransaction();
            throw new Error('User not found');
        }

        // Check if event exists with minimal data projection
        const event = await Event.findById(eventId)
            .select('title organizer status publicity curAttendees maxAttendees startDate startTime endDate endTime')
            .session(session)
            .lean();

        if (!event) {
            await session.abortTransaction();
            throw new Error('Event not found');
        }

        // Basic validations
        if (event.status === 'ended') {
            await session.abortTransaction();
            throw new Error('Cannot request to join an event that has ended');
        }

        if (event.status === 'cancelled') {
            await session.abortTransaction();
            throw new Error('Cannot request to join a cancelled event');
        }

        if (event.publicity === false) {
            await session.abortTransaction();
            throw new Error('Cannot request to join a private event');
        }

        if (event.curAttendees >= event.maxAttendees) {
            await session.abortTransaction();
            throw new Error('Event is at maximum capacity');
        }

        if (event.organizer.toString() === userId) {
            await session.abortTransaction();
            throw new Error('You are the organizer of this event');
        }

        // Check existing participation
        const existingParticipation = await Participation.findOne({
            event: eventId,
            user: userId
        }).session(session).lean();

        if (existingParticipation) {
            await session.abortTransaction();
            let errorMessage, statusDetails;

            switch (existingParticipation.status) {
                case 'approved':
                    errorMessage = 'You are already attending this event';
                    statusDetails = 'already_attending';
                    break;
                case 'invited':
                    errorMessage = 'You have already been invited to this event';
                    statusDetails = 'invitation_pending';
                    break;
                case 'rejected':
                    errorMessage = 'You have previously declined an invitation or request';
                    statusDetails = 'previously_declined';
                    break;
                case 'pending':
                    errorMessage = 'You already have a pending request to join this event';
                    statusDetails = 'request_pending';
                    break;
                default:
                    errorMessage = 'You already have a participation record for this event';
                    statusDetails = 'existing_record';
            }

            throw new Error(JSON.stringify({
                message: errorMessage,
                code: statusDetails,
                participationId: existingParticipation._id,
                participationType: existingParticipation.kind
            }));
        }

        // NEW: Check for scheduling conflicts BEFORE creating the request
        const targetStartDate = event.startDate;
        const targetEndDate = event.endDate;
        const targetStartTime = event.startTime;
        const targetEndTime = event.endTime;

        // Find conflicting participations
        const conflictingParticipations = await Participation.find({
            user: userId,
            status: 'approved',
        }).session(session)
            .populate({
                path: 'event',
                match: {
                    $and: [
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
                    status: { $ne: 'cancelled' }
                },
                select: 'title startDate startTime endDate endTime'
            });

        // Find events the user is organizing that overlap
        const conflictingOrganizedEvents = await Event.find({
            organizer: userId,
            _id: { $ne: eventId },
            status: { $nin: ['cancelled', 'ended'] },
            $and: [
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

        conflictingOrganizedEvents.forEach(evt => {
            conflicts.push({
                eventTitle: evt.title,
                eventTime: `${evt.startDate} ${evt.startTime} - ${evt.endDate} ${evt.endTime}`,
                role: 'Organizer'
            });
        });

        if (conflicts.length > 0) {
            throw new Error(JSON.stringify({
                message: 'Scheduling conflict detected',
                conflicts: conflicts
            }));
        }

        // Create join request after all validations pass
        const request = await Request.create([{
            event: eventId,
            user: userId,
            status: 'pending',
            customMessage: req.body.message || ''
        }], { session }).then(requests => requests[0]);


        // Create notification for organizer
        await Notification.create([{
            userId: event.organizer,
            type: 'joinRequest',
            message: `${requestingUser.username || 'A user'} has requested to join your event`,
            relatedId: request._id,
            notificationSender: userId,
            data: {
            },
            isRead: false
        }], { session });

        // Return minimal data
        const result = {
            _id: request._id,
            status: 'pending',
            event: {
                _id: event._id,
                title: event.title
            },
            message: 'Join request sent successfully'
        };

        // Commit transaction
        await session.commitTransaction();

        res.status(201).json(result);
    } catch (err) {
        // Better error handling
        if (session) {
            try {
                await session.abortTransaction();
            } catch (abortError) {
                console.error('Error aborting transaction:', abortError);
            }
        }

        console.error('Error in requestToJoinEvent:', err);

        // Parse error message if it's our custom JSON error
        try {
            const parsedError = JSON.parse(err.message);
            if (parsedError.conflicts) {
                return res.status(400).json({
                    error: 'Scheduling conflict detected',
                    conflicts: parsedError.conflicts
                });
            } else {
                return res.status(400).json({
                    error: parsedError.message,
                    status: parsedError.code,
                    participationId: parsedError.participationId
                });
            }
        } catch (parseErr) {
            // Regular error handling
            return res.status(err.message.includes('not found') ? 404 : 400).json({
                error: err.message || 'Failed to send join request'
            });
        }
    } finally {
        // Always end the session
        if (session) {
            session.endSession();
        }

        console.log('Memory after function:', process.memoryUsage().heapUsed / 1024 / 1024, 'MB');
    }
};

// PUT /api/events/:eventId/requests/:requestId
export const handleJoinRequest = async (req, res) => {
    const session = await mongoose.startSession();

    try {
        session.startTransaction();

        const { eventId, requestId } = req.params;
        const { action } = req.body; // 'approve' / 'decline'
        const organizerId = req.userId;

        // Find request with minimal population
        const joinRequest = await Request.findOne({
            _id: requestId,
            event: eventId,
            kind: 'Request'
        }).session(session)
            .populate('event', 'title organizer curAttendees maxAttendees status')
            .populate('user', 'username email');

        if (!joinRequest) {
            throw new Error('Join request not found');
        }

        if (joinRequest.status !== 'pending') {
            throw new Error('This request has already been processed');
        }

        if (joinRequest.event.organizer.toString() !== organizerId) {
            throw new Error('Only the event organizer can handle join requests');
        }

        if (joinRequest.event.status === 'ended' || joinRequest.event.status === 'cancelled') {
            throw new Error(`Cannot process request for an event that is ${joinRequest.event.status}`);
        }

        const event = await Event.findById(joinRequest.event._id)
            .select('title organizer startDate startTime endTime location')
            .populate('organizer', 'username email firstName lastName')
            .session(session)
            .lean();


        if (action === 'approve') {
            // Check capacity
            if (joinRequest.event.curAttendees >= joinRequest.event.maxAttendees) {
                throw new Error('Event is at maximum capacity');
            }

            // No need to check conflicts here - already checked during request creation

            // Update request status
            await Participation.findByIdAndUpdate(
                requestId,
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

            const sender = await User.findById(joinRequest.user)
                .select('username email firstName lastName avatar')
                .session(session)
                .lean();

            if (!sender) {
                await session.abortTransaction();
                throw new Error('Recipient not found');
            }


            // Create notification for requestor
            await Notification.create([{
                userId: joinRequest.user._id,
                type: 'requestApproved',
                message: `Request to join ${joinRequest.event.title} - approved`,
                relatedId: requestId,
                notificationSender: organizerId,
                data: {
                    message: `Your request to join "${joinRequest.event.title}" has been approved by the organizer.

                    You are now confirmed to attend this event on ${event.startDate} from ${event.startTime} to ${event.endTime} at ${event.location || 'the specified location'}.

                    We look forward to seeing you there!

                    Best regards,

                    ${event.organizer.firstName} ${event.organizer.lastName},
                    ${event.organizer.email}`
                },
                isRead: false
            }], { session });

        } else if (action === 'decline') {
            // Update request status
            await Participation.findByIdAndUpdate(
                requestId,
                {
                    status: 'rejected',
                    respondedAt: new Date()
                },
                { session }
            );

            // Create notification for requestor
            await Notification.create([{
                userId: joinRequest.user._id,
                type: 'requestDeclined',
                message: `Request to join ${joinRequest.event.title} - declined`,
                relatedId: requestId,
                data: {
                    message: `We regret to inform you that your request to join "${joinRequest.event.title}" has been declined by the organizer.

                    Please feel free to explore other events that might interest you.

                    Regards,

                    ${event.organizer.firstName} ${event.organizer.lastName},
                    ${event.organizer.email}`,
                    notificationSender: {
                        username: event.organizer.username,
                        email: event.organizer.email,
                        avatar: event.organizer.avatar
                    }
                },
                isRead: false
            }], { session });
        } else {
            throw new Error('Invalid action');
        }

        // Return minimal data
        const result = {
            requestId: requestId,
            status: action === 'approve' ? 'approved' : 'rejected',
            message: `Join request ${action === 'approve' ? 'approved' : 'declined'} successfully`
        };

        await session.commitTransaction();

        res.status(200).json(result);
    } catch (err) {
        if (session) {
            try {
                await session.abortTransaction();
            } catch (abortError) {
                console.error('Error aborting transaction:', abortError);
            }
        }

        console.error('Error handling join request:', err);

        res.status(400).json({
            error: err.message || 'Failed to process join request'
        });
    } finally {
        if (session) {
            session.endSession();
        }
    }
};