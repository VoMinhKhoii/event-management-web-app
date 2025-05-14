import mongoose from "mongoose";

const notificationSchema = mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: "users"
    },
    type: {
        type: String,
        enum: ['invitation', 'joinRequest', 'eventUpdate', 'eventReminder', 'invitationReminder', 'message', 'invitationDeclined', 'invitationAccepted', 'requestDeclined', 'requestApproved'],
        required: true
    },
    message: {
        type: String,
        required: true
    },
    relatedId: {
        type: mongoose.Schema.Types.ObjectId,
        required: false,
    },
    notificationSender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",  // Reference to the User model
        required: false
    },
    data: {
        type: mongoose.Schema.Types.Mixed // For additional context data
    },
    isRead: {
        type: Boolean,
        default: false
    },
    readAt: {
        type: Date,
        default: null
    },
}, {
    timestamps: true // Adds createdAt and updatedAt fields automatically
});

const Notification = mongoose.model("Notification", notificationSchema);

export default Notification;