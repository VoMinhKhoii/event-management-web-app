// models/Activity.js
import mongoose from 'mongoose';

const ActivitySchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    action: {
        type: String,
        enum: ['created', 'updated', 'deleted'],
        required: true
    },
    entityType: {
        type: String,
        enum: ['event', 'user'],
        required: true
    },
    entityId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    details: {
        type: Object,
        default: {}
    },
},
{
    timestamps: true,
})

export default mongoose.model('Activity', ActivitySchema);