import Event from '../models/Event.js';
import EventRequest from '../models/EventRequest.js';
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

// POST /api/events/:eventId/request-join
export const requestToJoinEvent = async (req, res) => {
  try {
    const { eventId } = req.params;
    const userId = req.userId;

    // Check if event exists & is public
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    // Prevent organier from joining own event
    if (event.organizer.toString() === userId) {
      return res.status(400).json({
        error: 'You cannot request to join your own event'
      });
    }

    if (!event.publicity) {
      return res.status(403).json({ error: 'Request failed - This event is private' });
    }

    // Check if user already has pending/approved request
    const existingRequest = await EventRequest.findOne({
      event: eventId,
      user: userId,
      status: { $in: ['pending', 'approved'] }
    });

    if (existingRequest) {
      return res.status(400).json({
        error: existingRequest.status === 'approved' ? 'You are already attending this event' : 'You already have a pending request for this event'
      });
    }

    // Check if event has available slots
    if (event.curAttendees >= event.maxAttendees) {
      return res.status(400).json({ error: 'This event has reached maximum capacity' })
    }

    // Create new join request
    const joinRequest = new EventRequest({
      event: eventId,
      user: userId,
      type: 'request',
      status: 'pending'
    });

    await joinRequest.save();
    res.status(201).json(joinRequest);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create join request', message: err.message });
  }
}

// PUT /api/events/:eventId/requests/:requestId
export const handleJoinRequest = async (req, res) => {
  try {
    const { eventId, requestId } = req.params;
    const { action } = req.body;
    const userId = req.userId;

    // Verify the user is the organizer
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }
    if (event.organizer._id.toString() !== userId) {
      return res.status(403).json({ error: 'Only the event organizer can manage join requests' });
    }

    // Find request
    const request = await EventRequest.findById(requestId)
      .populate({
        path: 'event',
        select: 'title maxAttendees curAttendees'
      })
      .populate({
        path: 'user',
        select: 'name email'
      });

    // Process
    if (action === 'approve') {
      // Check if event has available slots
      if (event.curAttendees >= event.maxAttendees) {
        return res.status(400).json({ error: 'This event has reached maximum capacity' })
      }

      request.status = 'approved'
      event.curAttendees += 1;

      await Promise.all([request.save(), event.save()]);

    } else if (action === 'reject') {
      request.status = 'rejected';
      await request.save();

      // TODO: Send notification to user
    } else {
      return res.status(400).json({ error: 'Invalid action' });
    }

    res.status(200).json(request);
  } catch (err) {
    res.status(500).json({ error: 'Failed to process join request', message: err.message });
  }
}
