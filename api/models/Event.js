import mongoose from "mongoose";

const eventSchema = mongoose.Schema({

        title: {
            type: String,
            required: [true, "Please add title"]
        },

        description: {
            type: String,
            required: [true, "Please add event description"]
        },

        summary: {
            type: String,
            required: [true, "Please add event summary"]
        },

        startTime: {
            type: String,
            required: [true, "Please add a start time"]
        },

        endTime: {
            type: String,
            required: [true, "Please add an end time"]
        },

        startDate: {
            type: String,
            required: [true, "Please add a start date"]
        },

        endDate: {
            type: String,
            required: [true, "Please add an end date"]
        },

        location: {
            type: String,
            required: [true, "Please add a location"]
        },

        eventType: {
            type: String,
            required: [true, "Please choose an event type"]
        },

        image: {
            type: String,
            required: [true, "Please add an image"]
        },

        
        maxAttendees: {
            type: Number,
            required: [true, "Please choose the max number of attendees"]
        },

        publicity: {
            type: Boolean,
            default: true,
            required: [true, "Please choose event publicity"]
        },

        organizer: {
            type: Object,
            required: true
        },


        curAttendees: {
            type: Number,
            default: 0
        }

    }, 
{
    timestamps: true,
});

const Event = mongoose.model("Event", eventSchema);
export default Event;