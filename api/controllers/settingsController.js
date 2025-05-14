// controllers/settingsController.js
import Settings from "../models/Settings.js";

export const getSettings = async (req, res) => {
    try {
        let settings = await Settings.findOne();

        if (!settings) {
            // If no settings are found, insert default settings
            settings = new Settings({
                eventSettings: {
                    maxInvitationsPerEvent: 100,
                    maxAttendeesPerEvent: 500,
                },
            });

            await settings.save(); // Save the new settings
        }

        res.status(200).json(settings);
    } catch (error) {
        console.error('Error fetching settings:', error);
        res.status(500).json({ message: 'Error fetching settings' });
    }
};

export const updateSettings = async (req, res) => {
    const { maxInvitationsPerEvent, maxAttendeesPerEvent } = req.body;

    // Validate input
    if (typeof maxInvitationsPerEvent !== 'number' || typeof maxAttendeesPerEvent !== 'number') {
        return res.status(400).json({ message: 'Invalid input types' });
    }

    try {
        // Find existing settings
        let settings = await Settings.findOne();
        
        if (!settings) {
            // Return an error if no settings are found
            return res.status(404).json({ message: 'Settings not found' });
        }

        // Update the existing event settings
        settings.eventSettings.maxInvitationsPerEvent = maxInvitationsPerEvent;
        settings.eventSettings.maxAttendeesPerEvent = maxAttendeesPerEvent;

        // Save the updated settings
        await settings.save();

        res.json({ message: 'Settings updated successfully', settings });
    } catch (err) {
        console.error('Error saving settings:', err);
        res.status(500).json({ message: 'Server error' });
    }
};

