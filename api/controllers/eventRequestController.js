import Event from '../models/Event.js';
import Request from '../models/Request.js';
import { logActivity } from '../middleware/logActivity.js';
import mongoose from 'mongoose';
import Notification from '../models/Notification.js';
import Participation from '../models/Participation.js';
import Invitation from '../models/Invitation.js';

// POST /api/events/:eventId/request-join
// POST /api/events/:eventId/requests
export const requestToJoinEvent = async (req, res) => {
    // Start a session for the transaction
    const session = await mongoose.startSession();
    
    try {
        // Begin transaction
        session.startTransaction();
        
        const { eventId } = req.params;
        const userId = req.userId;
        
        // Check if event exists
        const event = await Event.findById(eventId).session(session);
        if (!event) {
            await session.abortTransaction();
            session.endSession();
            return res.status(404).json({ error: 'Event not found' });
        }

        // Check event status
        if (event.status === 'ended') {
            await session.abortTransaction();
            session.endSession();
            return res.status(400).json({ error: 'Cannot request to join an event that has ended' });
        }
        
        if (event.status === 'cancelled') {
            await session.abortTransaction();
            session.endSession();
            return res.status(400).json({ error: 'Cannot request to join a cancelled event' });
        }

        // Check if event is public
        if (event.publicity === false) {
            await session.abortTransaction();
            session.endSession();
            return res.status(400).json({ error: 'Cannot request to join a private event' });
        }
        
        // Check if event's capacity
        if (event.curAttendees >= event.maxAttendees) {
            await session.abortTransaction();
            session.endSession();
            return res.status(400).json({ error: 'Event is at maximum capacity' });
        }
        
        // Check if user is the organizer (can't request to join your own event)
        if (event.organizer.toString() === userId) {
            await session.abortTransaction();
            session.endSession();
            return res.status(400).json({ error: 'You are the organizer of this event' });
        }

        // Check if user already has a participation record
        const existingParticipation = await Participation.findOne({
            event: eventId,
            user: userId
        }).session(session).lean();

        if (existingParticipation) {
            let errorMessage, statusDetails;
            
            switch(existingParticipation.status) {
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

        // Create join request
        const request = await Request.create([{
            event: eventId,
            user: userId,
            status: 'pending',
            customMessage: req.body.message || '' // Include custom message if provided
        }], { session }).then(requests => requests[0]);

        // Create notification for the event organizer
        await Notification.create([{
            userId: event.organizer,
            type: 'joinRequest',
            message: `${req.username || 'A user'} has requested to join your event: ${event.title}`,
            relatedId: request._id,
            isRead: false
        }], { session });

        // Return fully populated data
        const populatedRequest = await Request.findById(request._id)
            .session(session)
            .populate('event', 'title startDate startTime endDate endTime location image')
            .populate('user', 'username email');

        // Commit the transaction
        await session.commitTransaction();
        session.endSession();
        
        res.status(201).json({
            request: populatedRequest,
            message: 'Join request sent successfully'
        });
    } catch (err) {
        // Abort the transaction on error
        if (session) {
            await session.abortTransaction();
            session.endSession();
        }
        console.error('Error creating join request:', err);
        res.status(500).json({ error: 'Failed to send join request', message: err.message });
    }
};

// PUT /api/events/:eventId/requests/:requestId
// PUT /api/events/:eventId/requests/:requestId
export const handleJoinRequest = async (req, res) => {
    // Start a session for the transaction
    const session = await mongoose.startSession();
    
    try {
        // Begin transaction
        session.startTransaction();
        
        const { eventId, requestId } = req.params;
        const { action } = req.body; // 'approve' / 'decline'
        const organizerId = req.userId; // From auth middleware

        // Find request - ensure it's a Request type
        const joinRequest = await Request.findOne({
            _id: requestId,
            event: eventId,
            kind: 'Request' // Ensure it's a Request, not an Invitation
        }).session(session).populate({
            path: 'event',
            select: 'title organizer curAttendees maxAttendees status startDate startTime endDate endTime'
        }).populate('user', 'username email');

        if (!joinRequest) {
            await session.abortTransaction();
            session.endSession();
            return res.status(404).json({ error: 'Join request not found' });
        }

        // Check if request is still pending
        if (joinRequest.status !== 'pending') {
            await session.abortTransaction();
            session.endSession();
            return res.status(400).json({ error: 'This request has already been processed' });
        }
        
        // Check if current user is the event organizer
        if (joinRequest.event.organizer.toString() !== organizerId) {
            await session.abortTransaction();
            session.endSession();
            return res.status(403).json({ error: 'Only the event organizer can handle join requests' });
        }
        
        // Check if event is still active
        if (joinRequest.event.status === 'ended' || joinRequest.event.status === 'cancelled') {
            await session.abortTransaction();
            session.endSession();
            return res.status(400).json({ 
                error: `Cannot process request for an event that is ${joinRequest.event.status}` 
            });
        }

        if (action === 'approve') {
            // Check capacity within transaction
            if (joinRequest.event.curAttendees >= joinRequest.event.maxAttendees) {
                await session.abortTransaction();
                session.endSession();
                return res.status(400).json({ error: 'Event is at maximum capacity' });
            }
            
            // Get current event dates and times
            const targetStartDate = joinRequest.event.startDate;
            const targetEndDate = joinRequest.event.endDate;
            const targetStartTime = joinRequest.event.startTime;
            const targetEndTime = joinRequest.event.endTime;
            
            // Get requestor's ID for conflict checking
            const requestorId = joinRequest.user._id;
            
            // Find conflicting participations of ANY type
            const conflictingParticipations = await Participation.find({
                user: requestorId,
                status: 'approved',
                _id: { $ne: requestId }
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
                organizer: requestorId,
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
            
            // Process participation conflicts
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
            
            if (conflicts.length > 0) {
                await session.abortTransaction();
                session.endSession();
                return res.status(400).json({ 
                    error: 'Scheduling conflict detected',
                    conflicts: conflicts
                });
            }

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
            
            // Create notification for the requestor
            await Notification.create([{
                userId: joinRequest.user._id,
                type: 'requestApproved',
                message: `Your request to join ${joinRequest.event.title} has been approved`,
                relatedId: requestId,
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
            
            // Create notification for the requestor
            await Notification.create([{
                userId: joinRequest.user._id,
                type: 'requestDeclined',
                message: `Your request to join ${joinRequest.event.title} has been declined`,
                relatedId: requestId,
                isRead: false
            }], { session });
        } else {
            await session.abortTransaction();
            session.endSession();
            return res.status(400).json({ error: 'Invalid action' });
        }

        // Get the updated request to return in response
        const updatedRequest = await Request.findById(requestId)
            .session(session)
            .populate('event', 'title startDate startTime location')
            .populate('user', 'username email');
        
        // Commit the transaction
        await session.commitTransaction();
        session.endSession();
        
        res.status(200).json({
            request: updatedRequest,
            message: `Join request ${action === 'approve' ? 'approved' : 'declined'} successfully`
        });
    } catch (err) {
        // Abort the transaction on error
        if (session) {
            await session.abortTransaction();
            session.endSession();
        }
        console.error('Error handling join request:', err);
        res.status(500).json({ error: 'Failed to process join request', message: err.message });
    }
};
