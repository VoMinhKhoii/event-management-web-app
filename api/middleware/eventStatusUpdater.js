import Event from '../models/Event.js';

// Function to update event statuses
const updateEventStatuses = async () => {
    try {
        const now = new Date();
        const currentDateStr = now.toISOString().split('T')[0]; // YYYY-MM-DD
        const currentTimeStr = now.toTimeString().slice(0, 5); // HH:MM

        console.log(`Running event status update: ${currentDateStr} ${currentTimeStr}`);

        // Find scheduled events that should be ongoing (past start date/time but before end)
        const startingEvents = await Event.find({
            status: 'scheduled',
            $or: [
                { startDate: { $lt: currentDateStr } },
                {
                    startDate: currentDateStr,
                    startTime: { $lte: currentTimeStr }
                }
            ]
        });

        // Update them to ongoing
        for (const event of startingEvents) {
            event.status = 'ongoing';
            await event.save();
            console.log(`Event ${event._id} (${event.title}) changed to ongoing`);
        }
        // Find ongoing events that should be ended (past end date/time)
        const endingEvents = await Event.find({
            status: 'ongoing',
            $or: [
                { endDate: { $lt: currentDateStr } },
                {
                    endDate: currentDateStr,
                    endTime: { $lte: currentTimeStr }
                }
            ]
        });
        // Update them to ended
        for (const event of endingEvents) {
            event.status = 'ended';
            await event.save();
            console.log(`Event ${event._id} (${event.title}) changed to ended`);
        }

        console.log(`Status update completed: ${startingEvents.length} events started, ${endingEvents.length} events ended`);
    } catch (err) {
        console.error('Error updating event statuses:', err);
    }
};
export default updateEventStatuses;