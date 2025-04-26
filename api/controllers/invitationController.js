import Invitation from '../models/Invitation.js';
import Event from '../models/Event.js';
import User from '../models/User.js';
import { logActivity } from '../middleware/logActivity.js';

// Accept an invitation
export const acceptInvitation = async (req, res) => {
    try {
        const { invitationId } = req.params;

        // Find the invitation
        const invitation = await Invitation.findById(invitationId);
        if (!invitation) {
            return res.status(404).json({ message: 'Invitation not found' });
        }

        // Verify the invitation belongs to the current user
        if (invitation.recipient.toString() !== req.userId) {
            return res.status(403).json({ message: 'Unauthorized' });
        }

        // Find the event
        const event = await Event.findById(invitation.event);
        if (!event) {
            return res.status(404).json({ message: 'Event not found' });
        }

        // Check if event is at capacity
        if (event.attendees.length >= event.maxAttendees) {
            return res.status(400).json({ message: 'Event is at full capacity' });
        }

        // Add user to event attendees if not already there
        if (!event.attendees.includes(req.userId)) {
            event.attendees.push(req.userId);
            await event.save();
        }

        // Update invitation status
        invitation.status = 'accepted';
        invitation.respondedAt = new Date();
        await invitation.save();

        // Log activity
        await logActivity(
            req.userId,
            'accepted',
            'invitation',
            invitation._id,
            { eventName: event.title }
        );

        res.status(200).json({
            message: 'Invitation accepted successfully',
            invitation
        });

    } catch (error) {
        console.error('Error accepting invitation:', error);
        res.status(500).json({ message: error.message });
    }
};

// Decline an invitation
export const declineInvitation = async (req, res) => {
    try {
        const { invitationId } = req.params;

        // Find the invitation
        const invitation = await Invitation.findById(invitationId);
        if (!invitation) {
            return res.status(404).json({ message: 'Invitation not found' });
        }

        // Verify the invitation belongs to the current user
        if (invitation.recipient.toString() !== req.userId) {
            return res.status(403).json({ message: 'Unauthorized' });
        }

        // Update invitation status
        invitation.status = 'declined';
        invitation.respondedAt = new Date();
        await invitation.save();

        // Find the event (for activity logging)
        const event = await Event.findById(invitation.event);

        // Log activity
        await logActivity(
            req.userId,
            'declined',
            'invitation',
            invitation._id,
            { eventName: event ? event.title : 'Unknown event' }
        );

        res.status(200).json({
            message: 'Invitation declined successfully',
            invitation
        });

    } catch (error) {
        console.error('Error declining invitation:', error);
        res.status(500).json({ message: error.message });
    }
};

// Get all invitations for the current user
export const getUserInvitations = async (req, res) => {
    try {
        const invitations = await Invitation.find({
            recipient: req.userId
        })
            .populate('event', 'title date location')
            .populate('sender', 'username firstName lastName avatar')
            .sort({ createdAt: -1 });

        res.status(200).json(invitations);
    } catch (error) {
        console.error('Error fetching invitations:', error);
        res.status(500).json({ message: error.message });
    }
};