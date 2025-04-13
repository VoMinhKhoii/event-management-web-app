
import Event from '../models/Event.js';

export const createEvent = async (req, res) => {
  try {
    const newEvent = await Event.create({
      
      ...req.body,
      curAttendees: 0
    });

    res.status(201).json("Event saved successfully: ", newEvent);
  } catch (err) {
    res.status(500).json({ message: err.message || "Server error while creating event." });
  }
};

export const getEvent = async (req, res) => {
    try {
        const event = await Event.findById(req.params.id);
        if (!event) return res.status(404).json({ message: "Event not found" });
        res.status(200).json(event);
      } catch (err) {
        res.status(500).json({ message: err.message });
      }
}

export const getAllEvent = async (req, res) => {
    try {
        const events = await Event.find();
        res.status(200).json(events);
      } catch (err) {
        res.status(500).json({ message: err.message });
      }
}

export const updateEvent = async (req, res) => {
    try {
        const updatedEvent = await Event.findByIdAndUpdate(
          req.params.id,
          { $set: req.body },
          { new: true, runValidators: true }
        );
        if (!updatedEvent) return res.status(404).json({ message: "Event not found" });
        res.status(200).json(updatedEvent);
      } catch (err) {
        res.status(500).json({ message: err.message });
      }
}

export const deleteEvent = async (req, res) => {
    try {
        const deletedEvent = await Event.findByIdAndDelete(req.params.id);
        if (!deletedEvent) return res.status(404).json({ message: "Event not found" });
        res.status(200).json({ message: "Event deleted successfully" });
      } catch (err) {
        res.status(500).json({ message: err.message });
      }
}