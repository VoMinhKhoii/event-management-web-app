import Event from '../models/Event.js';
import Participation from '../models/Participation.js';
import { logActivity } from '../middleware/logActivity.js';

// GET /api/events
export const getAllEvent = async (req, res) => {
  try {
    const { public: isPublic, organizerId, bookingId } = req.query;
    const filter = {};

    if (isPublic) filter.publicity = true;
    if (organizerId) filter.organizer = organizerId;
    const events = await Event.find(filter).populate('organizer');

    if (bookingId) {
      const participations = await Participation.find({
        user: bookingId,
        kind: 'Request',
        status: 'approved'
      }).select('event'); // Only get event field
  
      const participantEventIds = participations.map(p => p.event);
  
      const joinedEvents = await Event.find({ _id: { $in: participantEventIds } }).populate('organizer');
      
      if (organizerId) {
        const allEvents = [...events, ...joinedEvents];
        return res.status(200).json(allEvents);
      } else return res.status(200).json(joinedEvents);
    }

    return res.status(200).json(events);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch events', message: err.message });
  }
};

// GET /api/events/:eventId
export const getEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.eventId).populate('organizer');
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }
    res.status(200).json(event);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch event', message: err.message });
  }
};

export const createEvent = async (req, res) => {
  try {
    // Fetch the system settings
    const settings = await Settings.findOne();
    if (!settings || !settings.eventSettings) {
      return res.status(500).json({ error: 'Event settings not configured' });
    }

    const maxAllowed = settings.eventSettings.maxAttendeesPerEvent;

    // Optional: enforce max limit
    if (req.body.maxAttendees && req.body.maxAttendees > maxAllowed) {
      return res.status(400).json({
        error: `maxAttendees cannot exceed system limit of ${maxAllowed}`
      });
    }

    const eventData = {
      ...req.body,
      organizer: req.userId,
      maxAttendees: req.body.maxAttendees || maxAllowed,
    };

    const newEvent = new Event(eventData);
    await newEvent.save();

    await logActivity(
      req.userId,
      'created',
      'event',
      newEvent._id,
      { eventTitle: newEvent.title }
    );

    const populatedEvent = await Event.findById(newEvent._id).populate('organizer');
    res.status(201).json(populatedEvent);

  } catch (err) {
    res.status(400).json({ error: 'Failed to create event', message: err.message });
  }
};

// PUT /api/events/:eventId
export const updateEvent = async (req, res) => {
  try {
    const updatedEvent = await Event.findByIdAndUpdate(req.params.eventId, req.body, {
      new: true,
      runValidators: true,
    });
    if (!updatedEvent) {
      return res.status(404).json({ error: 'Event not found' });
    }

    await logActivity(
      req.userId,
      'updated',
      'event',
      updatedEvent._id || updatedEvent.id,
      { eventTitle: updatedEvent.title }
    );


    res.status(200).json(updatedEvent);
  } catch (err) {
    res.status(400).json({ error: 'Failed to update event', message: err.message });
  }
};

// DELETE /api/events/:eventId
export const deleteEvent = async (req, res) => {
  try {
    const deletedEvent = await Event.findByIdAndDelete(req.params.eventId);

    if (!deletedEvent) {
      return res.status(404).json({ error: 'Event not found' });
    }

    await logActivity(
      req.userId,
      'deleted',
      'event',
      deletedEvent._id,
      { eventTitle: deletedEvent.title }
    );


    res.status(200).json({ message: 'Event deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete event', message: err.message });
  }
};
