import mongoose from "mongoose";
import Participation from "./Participation.js";

const invitationSchema = new mongoose.Schema({
    invitedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
});

const Invitation = Participation.discriminator('Invitation', invitationSchema);

export default Invitation;
