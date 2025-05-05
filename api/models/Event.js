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
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },

    curAttendees: {
        type: Number,
        default: 0
    },
    status: {
        type: String,
        enum: ['scheduled', 'ongoing', 'ended', 'cancelled'],
        default: 'scheduled'
    }
},
    {
        timestamps: true,
    });

// Middleware for findOne/findById queries
eventSchema.pre(['findOne', 'findById'], async function() {
    const query = this.getQuery();
    const eventId = query._id;
    
    if (eventId) {
        try {
            // Prevent middleware recursion by using a special option
            // This query won't trigger the middleware again
            const event = await mongoose.model('Event').findOne(
                { _id: eventId },
                null,
                { skipMiddleware: true }  // You'll need to check this option in your middleware
            ).lean();
            
            if (event && event.status !== 'cancelled') {
                const now = new Date();
                
                // Safer date parsing with error handling
                let startDateTime, endDateTime;
                try {
                    startDateTime = new Date(`${event.startDate}T${event.startTime}`);
                    endDateTime = new Date(`${event.endDate}T${event.endTime}`);
                    
                    // Validate that dates are valid
                    if (isNaN(startDateTime) || isNaN(endDateTime)) {
                        console.error('Invalid date format for event:', eventId);
                        return;
                    }
                } catch (dateError) {
                    console.error('Error parsing dates for event:', eventId, dateError);
                    return;
                }
                
                let newStatus = event.status;
                
                // Determine the correct status based on current time
                if (now >= startDateTime && now < endDateTime) {
                    newStatus = 'ongoing';
                } else if (now >= endDateTime) {
                    newStatus = 'ended';
                } else {
                    newStatus = 'scheduled';  // Future event
                }
                
                // Only update if status has changed
                if (newStatus !== event.status) {
                    await mongoose.model('Event').updateOne(
                        { _id: eventId },
                        { $set: { status: newStatus } }
                    );
                }
            }
        } catch (error) {
            console.error('Error in event status update middleware:', error);
            // Continue with the original query despite the error
        }
    }
});

const Event = mongoose.model("Event", eventSchema);

export default Event;
