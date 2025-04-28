import mongoose from "mongoose";

const participationSchema = mongoose.Schema({
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
    respondedAt: Date
},
    {
        timestamps: true,
        discriminatorKey: 'kind'
    });

const Participation = mongoose.model("Participation", participationSchema);

export default Participation;
