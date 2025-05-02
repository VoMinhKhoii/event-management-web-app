import Invitation from '../models/Invitation.js';
import Event from '../models/Event.js';
import { logActivity } from '../middleware/logActivity.js';

// POST /api/events/:eventId/invite
export const inviteToEvent = async (req, res) => {
    try {
        const { eventId } = req.params;
        const { userId: inviteeId } = req.body;
        const inviterId = req.userId;

        // Check if event exists & is public
        const event = await Event.findById(eventId);
        if (!event) {
            return res.status(404).json({ error: 'Event not found' });
        }

        if (event.organizer.toString() !== inviterId) {
            return res.status(403).json({ error: 'Only the event organizer can invite' });
        }

        // Prevent self-invite
        if (inviteeId === inviterId) {
            return res.status(400).json({ error: 'Cannot invite yourself' });
        }

        // Check for existing invitation
        const existingInvitation = await Invitation.findOne({
            event: eventId,
            user: inviteeId,
            status: { $in: ['invited', 'approved'] }
        });
        if (existingInvitation) {
            return res.status(400).json({
                error: existingInvitation.status === 'appproved' ? 'User is already attending' : 'Invitation is already sent'
            });
        }

        const invitation = new Invitation({
            event: eventId,
            user: inviteeId,
            invitedBy: inviterId,
            status: 'invited',
            customMessage: req.body.message
        });

        await invitation.save();

        res.status(201).json(invitation);
    } catch (err) {
        res.status(500).json({ error: 'Failed to send invitation', message: err.message });
    }
};

// PUT /api/events/:eventId/invitations/:invitationId
export const handleInvitation = async (req, res) => {
    try {
        const { eventId, invitationId } = req.params;
        const { action } = req.body; // 'accept' / 'decline'
        const userId = req.userId;

        // Find invitation
        const invitation = await Invitation.findOne({
            _id: invitationId,
            event: eventId,
            user: userId
        }).populate('event');

        if (!invitation) {
            return res.status(404).json({ error: 'Invitation not found' });
        }

        if (invitation.status !== 'invited') {
            return res.status(400).json({ error: 'This invitation has already been processed' });
        }

        if (action === 'accept') {
            if (invitation.event.curAttendees >= invitation.event.maxAttendees) {
                return res.status(400).json({ error: 'Event at maximum capacity' });
            }

            invitation.status = 'approved';
            invitation.event.curAttendees += 1;
            await Promise.all([invitation.save(), invitation.event.save()]);
        } else if (action === 'decline') {
            invitation.status = 'rejected';
            await invitation.save();
        } else {
            return res.status(400).json({ error: 'Invalid action' });
        }

        res.status(200).json(invitation);
    } catch (err) {
        res.status(500).json({ error: 'Failed to process invitation', message: err.message });
    }
}
