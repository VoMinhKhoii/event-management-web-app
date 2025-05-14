import express from "express";
import {getNotifications, markAsRead, createNotification, deleteNotification, getNewCount} from "../controllers/notificationController.js";
import { verifyToken } from '../middleware/verifyToken.js';

const router = express.Router();


// @route   GET /api/notifications/:userId
// @desc    Get all notifications for a user
// @access  Private
router.get("/", verifyToken, getNotifications);


// @route   PATCH /api/notifications/:id/read
// @desc    Mark a notification as read
// @access  Private
router.patch("/:notificationId/read", verifyToken,markAsRead);

// @route   POST /api/notifications
// @desc    Create a new notification
// @access  Private
router.post("/",verifyToken, createNotification);

// @route   DELETE /api/notifications/:id
// @desc    Delete a notification
// @access  Private
router.delete("/:notificationId",verifyToken, deleteNotification);

// @route   GET /api/notifications/new
// @desc    Get the count of new notifications since a given date
// @access  Private
router.get("/new", verifyToken, getNewCount);



export default router;