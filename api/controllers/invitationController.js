import Invitation from '../models/Invitation.js';
import Event from '../models/Event.js';
import User from '../models/User.js';
import { logActivity } from '../middleware/logActivity.js';

// Create a new invitation
export const createInvitation = async (req, res) => {
    try {
        const { eventId } = req.params;
        const { recipientId, message, role } = req.body;

        // Check if event exists
        const event = await Event.findById(eventId);
        if (!event) {
            return res.status(404).json({ message: 'Event not found' });
        }

        // Check if user is authorized (organizer)
        if (event.organizer.toString() !== req.userId) {
            return res.status(403).json({ message: 'Only event organizer can send invitations' });
        }

        // Check if recipient exists
        const recipient = await User.findById(recipientId);
        if (!recipient) {
            return res.status(404).json({ message: 'Recipient user not found' });
        }

        // Check if invitation already exists
        const existingInvitation = await Invitation.findOne({
            event: eventId,
            user: recipientId,
            kind: 'Invitation'
        });

        if (existingInvitation) {
            return res.status(400).json({ message: 'Invitation already sent to this user' });
        }

        // Create new invitation
        const newInvitation = new Invitation({
            event: eventId,
            user: recipientId,
            invitedBy: req.userId,
            status: 'invited',
            message: message || `You have been invited to ${event.title}`,
            role: role // This can be stored in another collection if needed
        });

        const savedInvitation = await newInvitation.save();

        // Log activity
        await logActivity(
            req.userId,
            'created',
            'invitation',
            savedInvitation._id,
            { recipientName: recipient.username, eventName: event.title }
        );

        res.status(201).json(savedInvitation);
    } catch (error) {
        console.error('Error creating invitation:', error);
        res.status(500).json({ message: error.message });
    }
};

// DELETE - Delete an invitation
export const deleteInvitation = async (req, res) => {
    try {
        const { invitationId } = req.params;

        // Find invitation
        const invitation = await Invitation.findById(invitationId)
            .populate('event', 'organizer title');

        if (!invitation) {
            return res.status(404).json({ message: 'Invitation not found' });
        }

        // Check authorization (only organizer can delete)
        if (invitation.event.organizer.toString() !== req.userId) {
            return res.status(403).json({ message: 'Only event organizer can delete invitations' });
        }

        // Store data for logging before deletion
        const eventTitle = invitation.event.title;
        const recipientId = invitation.user;

        // Delete invitation
        await Invitation.findByIdAndDelete(invitationId);

        // Log activity
        await logActivity(
            req.userId,
            'deleted',
            'invitation',
            invitationId,
            { 
                eventName: eventTitle,
                recipientId: recipientId
            }
        );

        res.status(200).json({ message: 'Invitation deleted successfully' });
    } catch (error) {
        console.error('Error deleting invitation:', error);
        res.status(500).json({ message: error.message });
    }
};

// Get all invitations for an event (for organizers)
export const getEventInvitations = async (req, res) => {
    try {
        const { eventId } = req.params;
        
        // Verify event exists
        const event = await Event.findById(eventId);
        if (!event) {
            return res.status(404).json({ message: 'Event not found' });
        }

        // Check if user is authorized (only organizer can see all invitations)
        if (event.organizer.toString() !== req.userId) {
            return res.status(403).json({ message: 'Only event organizer can view all invitations' });
        }

        const invitations = await Invitation.find({ 
            event: eventId,
            kind: 'Invitation'
        })
            .populate('user', 'username firstName lastName email avatar')
            .populate('invitedBy', 'username firstName lastName')
            .sort({ createdAt: -1 });
            
        res.status(200).json(invitations);
    } catch (error) {
        console.error('Error fetching event invitations:', error);
        res.status(500).json({ message: error.message });
    }
};

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