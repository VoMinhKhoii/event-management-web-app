// controllers/adminController.js
import Activity from '../models/Activity.js';
export const getRecentActivities = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const activities = await Activity.find()
            .sort({ timestamp: -1 })
            .skip(skip)
            .limit(limit)
            .populate('userId', 'username avatar')
            .lean();

        if (!activities || activities.length === 0) {
            return res.status(200).json([]); // Return empty array if no activities
        }

        // Format activities for frontend with proper property checks
        const formattedActivities = activities.map(activity => {
            // Default description
            let description = `${activity.userId?.username || 'User'} ${activity.action} a ${activity.entityType}`;
            
            if (activity.entityType === 'user') {
                if (activity.action === 'created') {
                    description = `${activity.userId?.username || 'User'} registered an account`;
                } else {
                    description = `${activity.userId?.username || 'User'} ${activity.action} their account`;
                }
            } else if (activity.entityType === 'event' && activity.details?.eventTitle) {
                description = `${activity.userId?.username || 'User'} ${activity.action} event: ${activity.details.eventTitle}`;
            }
            
            return {
                id: activity._id,
                desc: description,
                action: activity.action,
                type: activity.entityType,
                timestamp: activity.timestamp || activity.createdAt || new Date(activity._id.getTimestamp()).toISOString(),
                details: activity.details || {}
            };
        });
        
        res.status(200).json(formattedActivities);
    } catch (err) {
        console.error('Error fetching activities:', err);
        res.status(500).json({ message: err.message });
    }
};
