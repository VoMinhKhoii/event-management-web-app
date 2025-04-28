import Notification from "../models/Notification.js";

// @desc    Get all notifications for a user
// @route   GET /api/notifications/:userId
// @access  Private
export const getNotifications = async (req, res) => {
    try {
        const { userId } = req.params;
        const notifications = await Notification.find({ userId }).sort({ createdAt: -1 });
        res.status(200).json(notifications);
    } catch (error) {
        res.status(500).json({ error: "Server error", error });
    }
};

// @desc    Mark a notification as read
// @route   PATCH /api/notifications/:id/read
// @access  Private
export const markAsRead = async (req, res) => {
    try {
        const { id } = req.params;
        const notification = await Notification.findByIdAndUpdate(
            id,
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
// @route   DELETE /api/notifications/:id
// @access  Private
export const deleteNotification = async (req, res) => {
    try {
        const { id } = req.params;
        const notification = await Notification.findByIdAndDelete(id);
        if (!notification) {
            return res.status(404).json({ error: "Notification not found" });
        }
        res.status(200).json({ message: "Notification deleted successfully" });
    } catch (error) {
        res.status(500).json({ error: "Server error", error });
    }
};

export const getEventInfoFromNotification = async (req, res) => {

    try {
        const {id} = req.params;
        const notification = await Notification.findById(id).populate('relatedId').model('request');
        if (!notification){
            notification = await Notification.findById(id).populate('relatedId').model('invitation');
            if (!notification){
                return res.status(404).json({ error: "Notification not found" });
            }
        }

        const eventInfo = await notification.relatedId.populate('eventId').model('event');
        if (!eventInfo) {
            return res.status(404).json({ error: "Event not found" });
        }

        res.status(200).json(eventInfo);
        console.log("Successfully retrieve event info: ", eventInfo);
    }
    catch (error) {
        res.status(500).json({ error: "Server error", error });
    }

};
