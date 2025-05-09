import Event from '../models/Event.js';
import Participation from '../models/Participation.js';
import Notification from '../models/Notification.js';
import { logActivity } from '../middleware/logActivity.js';
import { detectEventChanges } from '../utils/eventHelpers.js';
import fs from 'fs';
import https from 'https';
import mongoose from 'mongoose';

// GET /api/events
export const getAllEvent = async (req, res) => {
  try {
    const { public: isPublic, organizerId, participantId } = req.query;
    const filter = {};

    if (isPublic) filter.publicity = true;
    if (organizerId) filter.organizer = organizerId;
    const events = await Event.find(filter).populate('organizer');

    if (participantId) {
      const participations = await Participation.find({
        user: participantId,
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

// POST /api/events 
export const createEvent = async (req, res) => {
  try {
    let imageUrl = null;

    // handle image upload if file exists
    if (req.file) {
      // read file as base64
      const fileBuffer = fs.readFileSync(req.file.path);
      const base64File = fileBuffer.toString('base64');
      const dataURI = `data:${req.file.mimetype};base64,${base64File}`;

      const cloudinaryUrl = `https://api.cloudinary.com/v1_1/${process.env.CLOUDINARY_CLOUD_NAME}/upload`;

      // manually construct data payload
      const boundary = '----WebKitFormBoundary' + Math.random().toString(16).slice(2);
      const payload = [
        `--${boundary}`,
        'Content-Disposition: form-data; name="file"',
        `Content-Type: ${req.file.mimetype}`,
        '',
        dataURI,
        `--${boundary}`,
        'Content-Disposition: form-data; name="upload_preset"',
        '',
        process.env.CLOUDINARY_UPLOAD_PRESET,
        `--${boundary}--`,
        ''
      ].join('\r\n');

      // request to cloudinary
      const response = await new Promise((resolve, reject) => {
        const options = {
          method: 'POST',
          headers: {
            'Content-Type': `multipart/form-data; boundary=${boundary}`,
            'Content-Length': Buffer.byteLength(payload)
          }
        };

        const req = https.request(cloudinaryUrl, options, (res) => {
          let data = '';
          res.on('data', (chunk) => {
            data += chunk;
          });
          res.on('end', () => {
            resolve(JSON.parse(data));
          });
        });

        req.on('error', (err) => {
          reject(err);
        });

        req.write(payload);
        req.end();
      });

      imageUrl = response.secure_url;

      // clean-up temp file
      fs.unlinkSync(req.file.path);
    }

    const newEvent = new Event({
      ...req.body,
      organizer: req.userId, // Set organizer as current user
      image: imageUrl
    });

    await newEvent.save();

    // Log this activity
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
    // clean-up temp file if exists
    if (req.file?.path && fs.existsSync(req.file.path)) {
      try {
        fs.unlinkSync(req.file.path);
      } catch (cleanupError) {
        console.error('Error during file cleanup:', cleanupError);
      }
    }

    res.status(400).json({
      error: 'Failed to create event',
      message: err.message
    });
  }
};

// PUT /api/events/:eventId
export const updateEvent = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    let imageUrl = null;

    // handle image upload if file exists
    if (req.file) {
      // read file as base64
      const fileBuffer = fs.readFileSync(req.file.path);
      const base64File = fileBuffer.toString('base64');
      const dataURI = `data:${req.file.mimetype};base64,${base64File}`;

      const cloudinaryUrl = `https://api.cloudinary.com/v1_1/${process.env.CLOUDINARY_CLOUD_NAME}/upload`;

      // manually construct data payload
      const boundary = '----WebKitFormBoundary' + Math.random().toString(16).slice(2);
      const payload = [
        `--${boundary}`,
        'Content-Disposition: form-data; name="file"',
        `Content-Type: ${req.file.mimetype}`,
        '',
        dataURI,
        `--${boundary}`,
        'Content-Disposition: form-data; name="upload_preset"',
        '',
        process.env.CLOUDINARY_UPLOAD_PRESET,
        `--${boundary}--`,
        ''
      ].join('\r\n');

      // request to cloudinary
      const response = await new Promise((resolve, reject) => {
        const options = {
          method: 'POST',
          headers: {
            'Content-Type': `multipart/form-data; boundary=${boundary}`,
            'Content-Length': Buffer.byteLength(payload)
          }
        };

        const req = https.request(cloudinaryUrl, options, (res) => {
          let data = '';
          res.on('data', (chunk) => {
            data += chunk;
          });
          res.on('end', () => {
            resolve(JSON.parse(data));
          });
        });

        req.on('error', (err) => {
          reject(err);
        });

        req.write(payload);
        req.end();
      });

      imageUrl = response.secure_url;

      // clean-up temp file
      fs.unlinkSync(req.file.path);
    }

    const existingEvent = await Event.findById(req.params.eventId).session(session);
    if (!existingEvent) {
      await session.abortTransaction();
      return res.status(404).json({ error: 'Event not found' });
    }

    const updateData = {
      ...req.body,
      image: imageUrl || existingEvent.image // use new image if uploaded, otherwise keep existing
    };

    // check if any value was changed when submitting event update
    const changes = detectEventChanges(existingEvent, updateData);

    const updatedEvent = await Event.findByIdAndUpdate(req.params.eventId, updateData, {
      new: true,
      runValidators: true,
      session,
    });

    await logActivity(
      req.userId,
      'updated',
      'event',
      updatedEvent._id || updatedEvent.id,
      { eventTitle: updatedEvent.title }
    );

    // only send notif if there were actual changes
    if (changes) {
      const participations = await Participation.find({
        event: req.params.eventId,
        status: 'approved'
      }).session(session);

      if (participations.length > 0) {
        const notifications = participations.map(participation => {
          return {
            userId: participation.user,
            type: 'eventUpdate',
            message: `Event "${updatedEvent.title}" has been updated`,
            relatedId: {
              _id: updatedEvent._id,
              event: {
                _id: updatedEvent._id,
                title: updatedEvent.title,
                startDate: updatedEvent.startDate,
                startTime: updatedEvent.startTime,
                endTime: updatedEvent.endTime,
                location: updatedEvent.location,
                image: updatedEvent.image
              }
            },
            data: `Event "${updatedEvent.title}" has been updated`,
            isRead: false
          };
        });

        await Notification.create(notifications, { session });
      }
    }

    await session.commitTransaction();
    res.status(200).json(updatedEvent);
  } catch (err) {
    await session.abortTransaction();
    console.error('Error updating event:', err);

    // clean-up temp file if exists
    if (req.file?.path && fs.existsSync(req.file.path)) {
      try {
        fs.unlinkSync(req.file.path);
      } catch (cleanupError) {
        console.error('Error during file cleanup:', cleanupError);
      }
    }

    res.status(400).json({
      error: 'Failed to update event',
      message: err.message
    });
  } finally {
    session.endSession();
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
