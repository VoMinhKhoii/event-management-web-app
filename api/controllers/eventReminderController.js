import Event from '../models/Event.js';
import Notification from '../models/Notification.js';
import Participation from '../models/Participation.js';
import mongoose from 'mongoose';
import User from '../models/User.js';

/**
 * Send reminders to users who have been invited but haven't responded
 * POST /api/events/:eventId/reminders/pending-invites
 */
export const sendPendingInvitationReminders = async (req, res) => {
    const session = await mongoose.startSession();

    try {
        session.startTransaction();

        const { eventId } = req.params;
        const organizerId = req.userId;

        // Validate event and organizer authorization
        const event = await Event.findById(eventId)
            .select('title organizer startDate startTime endTime location')
            .populate('organizer', 'username email firstName lastName avatar')
            .session(session)
            .lean();

        if (!event) {
            throw new Error('Event not found');
        }

        // Basic validations
        if (event.status === 'ended') {
            throw new Error('Event has already ended');
        }

        if (event.status === 'cancelled') {
            throw new Error('Event has already been cancelled');
        }

        if (event.curAttendees >= event.maxAttendees) {
            throw new Error('Event is at maximum capacity');
        }

        if (event.organizer._id.toString() !== organizerId) {
            throw new Error('Only the event organizer can send reminders');
        }

        // Find all invited users who haven't responded
        const pendingInvitations = await Participation.find({
            event: eventId,
            status: 'invited',
            kind: 'Invitation'
        }).session(session)
            .select('user')
            .lean();

        if (pendingInvitations.length === 0) {
            await session.abortTransaction();
            return res.status(200).json({
                message: 'No pending invitations found for this event'
            });
        }

        // Create notifications for each invited user
        const notifications = [];
        for (const invitation of pendingInvitations) {
            notifications.push({
                userId: invitation.user,
                type: 'invitationReminder',
                message: `Reminder: You have a pending invitation to ${event.title}`,
                relatedId: invitation._id,
                data: {
                    message: `You are invited to attend the "${event.title}" on ${event.startDate} from ${event.startTime} to ${event.endTime} at ${event.location}.
                
                We have sent an invitation to your account. Kindly check your notifications to confirm your attendance at your earliest convenience.
                
                We hope to welcome you at the event.
                
                Best regards,
                
                ${event.organizer.firstName} ${event.organizer.lastName},
                ${event.organizer.email}`,
                    notificationSender: {
                        username: event.organizer.username,
                        email: event.organizer.email,
                        avatar: event.organizer.avatar,
                        firstName: event.organizer.firstName,
                        lastName: event.organizer.lastName
                    },
                },
                isRead: false
            });
        }

        await Notification.create(notifications, { session, ordered: true });

        // Commit transaction
        await session.commitTransaction();

        res.status(200).json({
            success: true,
            message: `Reminders sent to ${pendingInvitations.length} pending invitees`,
            count: pendingInvitations.length
        });

    } catch (err) {
        // Abort transaction on error
        if (session) {
            try {
                await session.abortTransaction();
            } catch (abortError) {
                console.error('Error aborting transaction:', abortError);
            }
        }

        console.error('Error sending invitation reminders:', err);

        res.status(400).json({
            error: err.message || 'Failed to send reminders'
        });
    } finally {
        // Always end the session
        if (session) {
            session.endSession();
        }
    }
};

/**
 * Send reminders to confirmed attendees of an event
 * POST /api/events/:eventId/reminders/attendees
 */
export const sendAttendeeReminders = async (req, res) => {
    const session = await mongoose.startSession();

    try {
        session.startTransaction();

        const { eventId } = req.params;
        const organizerId = req.userId;

        // Validate event and organizer authorization
        const event = await Event.findById(eventId)
            .select('title organizer startDate startTime endTime location')
            .populate('organizer', 'username email firstName lastName')
            .session(session)
            .lean();

        if (!event) {
            throw new Error('Event not found');
        }


        if (event.organizer._id.toString() !== organizerId) {
            throw new Error('Only the event organizer can send reminders');
        }

        // Find all confirmed attendees
        const confirmedAttendees = await Participation.find({
            event: eventId,
            status: 'approved'
        }).session(session)
            .select('user')
            .lean();

        if (confirmedAttendees.length === 0) {
            await session.abortTransaction();
            return res.status(200).json({
                message: 'No confirmed attendees found for this event'
            });
        }

        // Create notifications for each attendee
        const notifications = [];
        for (const attendee of confirmedAttendees) {
            notifications.push({
                userId: attendee.user,
                type: 'eventReminder',
                message: `Reminder: Event "${event.title}" is coming up`,
                relatedId: attendee._id,
                data: {
                    message: `This is a friendly reminder that ${event.title} will take place on ${event.startDate} from ${event.startTime} to ${event.endTime || 'TBD'} at ${event.location || 'TBD'}.
                
                    We look forward to your participation.
                
                    Regards,
                
                    ${event.organizer.firstName} ${event.organizer.lastName},
                    ${event.organizer.email}`,
                    notificationSender: {
                        username: event.organizer.username,
                        email: event.organizer.email,
                        avatar: event.organizer.avatar,
                        firstName: event.organizer.firstName,
                        lastName: event.organizer.lastName
                    },
                },
                isRead: false
            });
        }

        await Notification.create(notifications, { session, ordered: true });

        // Commit transaction
        await session.commitTransaction();

        res.status(200).json({
            success: true,
            message: `Reminders sent to ${confirmedAttendees.length} attendees`,
            count: confirmedAttendees.length
        });

    } catch (err) {
        // Abort transaction on error
        if (session) {
            try {
                await session.abortTransaction();
            } catch (abortError) {
                console.error('Error aborting transaction:', abortError);
            }
        }

        console.error('Error sending attendee reminders:', err);

        res.status(400).json({
            error: err.message || 'Failed to send reminders'
        });
    } finally {
        // Always end the session
        if (session) {
            session.endSession();
        }
    }
};