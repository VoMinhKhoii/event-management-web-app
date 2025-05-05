import Event from '../models/Event.js';
import Request from '../models/Request.js';
import { logActivity } from '../middleware/logActivity.js';

// POST /api/events/:eventId/request-join
export const requestToJoinEvent = async (req, res) => {
    try {
        const { eventId } = req.params;
        const userId = req.userId;

        // Check if event exists & is public
        const event = await Event.findById(eventId);
        if (!event) {
            return res.status(404).json({ error: 'Event not found' });
        }

        // Prevent organier from joining own event
        if (event.organizer.toString() === userId) {
            return res.status(400).json({
                error: 'You cannot request to join your own event'
            });
        }

        if (!event.publicity) {
            return res.status(403).json({ error: 'Request failed - This event is private' });
        }

        // Check if user already has pending/approved request
        const existingRequest = await Request.findOne({
            event: eventId,
            user: userId,
            status: { $in: ['pending', 'approved'] }
        });

        if (existingRequest) {
            return res.status(400).json({
                error: existingRequest.status === 'approved' ? 'You are already attending this event' : 'You already have a pending request for this event'
            });
        }

        // Check if event has available slots
        if (event.curAttendees >= event.maxAttendees) {
            return res.status(400).json({ error: 'This event has reached maximum capacity' })
        }

        // Create new join request
        const joinRequest = new Request({
            event: eventId,
            user: userId,
            status: 'pending'
        });

        await joinRequest.save();
        res.status(201).json(joinRequest);
    } catch (err) {
        res.status(500).json({ error: 'Failed to create join request', message: err.message });
    }
}

// PUT /api/events/:eventId/requests/:requestId
export const handleJoinRequest = async (req, res) => {
    try {
        const { eventId, requestId } = req.params;
        const { action } = req.body;
        const userId = req.userId;

        // Verify the user is the organizer
        const event = await Event.findById(eventId);
        if (!event) {
            return res.status(404).json({ error: 'Event not found' });
        }
        if (event.organizer._id.toString() !== userId) {
            return res.status(403).json({ error: 'Only the event organizer can manage join requests' });
        }

        // Find request
        const request = await Request.findById(requestId)
            .populate({
                path: 'event',
                select: 'title maxAttendees curAttendees'
            })
            .populate({
                path: 'user',
                select: 'name email'
            });

        if (!request || request.event._id.toString() !== eventId) {
            return res.status(404).json({ error: 'Join request not found' });
        }

        if (request.status !== 'pending') {
            return res.status(400).json({ error: 'This request has already been processed' });
        }

        // Process
        if (action === 'approve') {
            // Check if event has available slots
            if (event.curAttendees >= event.maxAttendees) {
                return res.status(400).json({ error: 'This event has reached maximum capacity' })
            }

            request.status = 'approved'
            event.curAttendees += 1;

            await Promise.all([request.save(), event.save()]);

        } else if (action === 'reject') {
            request.status = 'rejected';
            request.respondedAt = new Date();
            await request.save();

            // TODO: Send notification to user
        } else {
            return res.status(400).json({ error: 'Invalid action' });
        }

        res.status(200).json(request);
    } catch (err) {
        res.status(500).json({ error: 'Failed to process join request', message: err.message });
    }
}
