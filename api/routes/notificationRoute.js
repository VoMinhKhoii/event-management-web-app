import express from "express";
import {getNotifications, markAsRead, createNotification, deleteNotification} from "../controllers/notificationController.js";
import { verifyToken } from '../middleware/verifyToken.js';

const router = express.Router();


// @route   GET /api/notifications/:userId
// @desc    Get all notifications for a user
// @access  Private
router.get("/:userId", getNotifications);


// @route   PATCH /api/notifications/:id/read
// @desc    Mark a notification as read
// @access  Private
router.patch("/:notificationId/read", markAsRead);

// @route   POST /api/notifications
// @desc    Create a new notification
// @access  Private
router.post("/", createNotification);

// @route   DELETE /api/notifications/:id
// @desc    Delete a notification
// @access  Private
router.delete("/:notificationId", deleteNotification);



export default router;