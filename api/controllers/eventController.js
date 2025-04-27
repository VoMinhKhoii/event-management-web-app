import Event from '../models/Event.js';
import { logActivity } from '../middleware/logActivity.js';

// GET /api/events
export const getAllEvent = async (req, res) => {
  try {
    const { public: isPublic, organizerId } = req.query;
    const filter = {};

    if (isPublic) filter.publicity = true;
    if (organizerId) filter.organizer = organizerId;

    const events = await Event.find(filter).populate('organizer');
    res.status(200).json(events);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch events', message: err.message });
  }
};

// GET /api/events/:id
export const getEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id).populate('organizer');
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }
    res.status(200).json(event);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch event', message: err.message });
  }
};

// POST /api/events
export const createEvent = async (req, res) => {
  try {
    const newEvent = new Event(req.body);
    await newEvent.save();

    // Log this activity
    await logActivity(
      req.userId,
      'created',
      'event',
      newEvent._id,
      { eventTitle: newEvent.title }
    );

    res.status(201).json(newEvent);
  } catch (err) {
    res.status(400).json({ error: 'Failed to create event', message: err.message });
  }
};

// PUT /api/events/:id
export const updateEvent = async (req, res) => {
  try {
    const updatedEvent = await Event.findByIdAndUpdate(req.params.id, req.body, {
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

// DELETE /api/events/:id
export const deleteEvent = async (req, res) => {
  try {
    const deletedEvent = await Event.findByIdAndDelete(req.params.id);

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
