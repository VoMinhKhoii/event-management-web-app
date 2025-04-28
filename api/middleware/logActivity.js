// services/activityService.js
import Activity from '../models/Activity.js';

export const logActivity = async (userId, action, entityType, entityId, details = {}) => {
    try {
        console.log(`Logging activity: ${action} ${entityType} by ${userId}`);
        const activity = new Activity({
            userId,
            action,
            entityType,
            entityId,
            details
        });

        await activity.save();
        return activity;
    } catch (error) {
        console.error('Error logging activity:', error);
    }
};
