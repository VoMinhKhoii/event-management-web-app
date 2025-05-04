import { model } from "mongoose";
import Notification from "../models/Notification.js";
import Participation from "../models/Participation.js";

// @desc    Get all notifications for a user
// @route   GET /api/notifications/:userId
// @access  Private
export const getNotifications = async (req, res) => {
    try {

        console.log("Fetching notifications for user ID:", req.params.userId);
        const { userId } = req.params;
        const notifications = await Notification.find({
            userId,
            relatedId: { $ne: null } // only where relatedId is not null
        })
            .sort({ createdAt: -1 })
            .populate({
                path: 'relatedId',
                model: 'Participation',
                populate: {
                    path: 'event',
                    model: 'Event'
                }
            })
            .lean(); // optional: return plain JS objects

        res.status(200).json(notifications);
    } catch (error) {
        res.status(500).json({ error: "Server error", error });
    }
};

// @desc    Mark a notification as read
// @route   PATCH /api/notifications/:notificationId/read
// @access  Private
export const markAsRead = async (req, res) => {
    try {
        const { notificationId } = req.params;
        const notification = await Notification.findByIdAndUpdate(
            notificationId,
            { isRead: true, readAt: new Date() },
            { new: true }
        );
        if (!notification) {
            return res.status(404).json({ error: "Notification not found" });
        }
        res.status(200).json(notification);
    } catch (error) {
        res.status(500).json({ error: "Server error", error });
    }
};

// @desc    Create a new notification
// @route   POST /api/notifications
// @access  Private
export const createNotification = async (req, res) => {
    try {
        const newNotification = new Notification(req.body);
        await newNotification.save();
        res.status(201).json(newNotification);
        console.log("Successfully create notification: ", newNotification);
    } catch (error) {
        res.status(500).json({ error: "Server error", error });
    }
};

// @desc    Delete a notification
// @route   DELETE /api/notifications/:notificationId
// @access  Private
export const deleteNotification = async (req, res) => {
    try {
        const { notificationId } = req.params;
        const notification = await Notification.findByIdAndDelete(notificationId);
        if (!notification) {
            return res.status(404).json({ error: "Notification not found" });
        }
        res.status(200).json({ message: "Notification deleted successfully" });
    } catch (error) {
        res.status(500).json({ error: "Server error", error });
    }
};


