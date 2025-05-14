// models/Settings.js
import mongoose from "mongoose";

const eventSettingsSchema = new mongoose.Schema({
    maxInvitationsPerEvent: { type: Number, required: true, default: 100 },
    maxAttendeesPerEvent: { type: Number, required: true, default: 500 },
}, { _id: false }); // prevent automatic _id for subdoc

const settingsSchema = new mongoose.Schema({
    eventSettings: { type: eventSettingsSchema, required: true }
});

const Settings = mongoose.model('Settings', settingsSchema);

export default Settings;
