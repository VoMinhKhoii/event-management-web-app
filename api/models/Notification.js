import mongoose from "mongoose";

const notificationSchema = mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: "users" 
    },
    type: {
        type: String,
        enum: ['invitation', 'joinRequest', 'eventUpdate', 'reminder', 'message'],
        required: true
    },
    relatedId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
    },
    data: {
        type: mongoose.Schema.Types.Mixed // For additional context data
    },  
    isRead: {
        type: Boolean,
        default: false
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    readAt: {
        type: Date
    }
}, {
    timestamps: true // Adds createdAt and updatedAt fields automatically
});

const Notification = mongoose.model("Notification", notificationSchema);

export default Notification;