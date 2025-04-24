import mongoose from "mongoose";

const eventRequestSchema = mongoose.Schema({
    event: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Event',
        required: true
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected', 'invited'],
        default: 'pending'
    },
    type: {
        type: String,
        enum: ['request', 'invitation'],
        required: true
    },
    respondedAt: Date
},
    {
        timestamps: true
    });

const EventRequest = mongoose.model("EventRequest", eventRequestSchema);

export default EventRequest;
