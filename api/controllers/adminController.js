// controllers/adminController.js
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import Activity from '../models/Activity.js';
import Admin from '../models/Admin.js';

// Get recent admin activities
export const getRecentActivities = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const skip = (page - 1) * limit;

        const activities = await Activity.find()
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .populate('userId', 'username avatar')
            .lean();

        if (!activities || activities.length === 0) {
            return res.status(200).json([]);
        }

        const formattedActivities = activities.map(activity => {
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

// Admin login
export const adminLogin = async (req, res) => {
    try {
        const { username, password } = req.body;

        const user = await Admin.findOne({ username });
        if (!user) {
            return res.status(404).json({ message: 'Admin not found' });
        }

        // Compare hashed password
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        user.status = 'online';
        await user.save();

        const age = 1000 * 60 * 60 * 24 * 30; // 30 days

        const token = jwt.sign(
            { id: user._id },
            process.env.JWT_SECRET,
            { expiresIn: age }
        );

        const userObject = user.toObject();
        delete userObject.password;

        res.cookie('token', token, {
            httpOnly: true,
            maxAge: age
        }).status(200).json({
            message: 'Login successful',
            user: userObject
        });

    } catch (error) {
        console.error("Login error:", error);
        res.status(500).json({ message: error.message });
    }
};

// Admin logout
export const adminLogout = async (req, res) => {
    try {
        const token = req.cookies.token;
        if (token) {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            const userId = decoded.id;

            await Admin.findByIdAndUpdate(userId, { status: 'offline' });
        }

        res.clearCookie("token").status(200).json({
            message: "Admin logged out successfully",
        });
    } catch (error) {
        console.error("Logout error:", error);
        res.clearCookie("token").status(200).json({
            message: "Admin logged out successfully",
        });
    }
};

// Create default admin
export const createDefaultAdmin = async () => {
    try {
        const adminUsername = process.env.default_username;
        const adminPassword = process.env.default_password;

        const existingAdmin = await Admin.findOne({ username: adminUsername });
        if (existingAdmin) {
            console.log('Default admin already exists.');
            return;
        }

        const hashedPassword = await bcrypt.hash(adminPassword, 10);

        const newAdmin = await Admin.create({
            username: adminUsername,
            password: hashedPassword,
        });

        console.log('Default admin created:', newAdmin.username);
    } catch (error) {
        console.error('Error creating default admin:', error);
    }
};
