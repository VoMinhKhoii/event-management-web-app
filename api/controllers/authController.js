import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Admin from '../models/Admin.js';
import { logActivity } from '../middleware/logActivity.js';

export const signup = async (req, res) => {
    try {
        
        const { firstName, lastName, username, email, password } = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);
        const defaultAvatar = "https://img.freepik.com/premium-vector/cute-boy-smiling-cartoon-kawaii-boy-illustration-boy-avatar-happy-kid_1001605-3447.jpg";
        const newUser = await User.create({
            firstName,
            lastName,
            username,
            email,
            password: hashedPassword,
            avatar: defaultAvatar
        });
        const userObject = newUser.toObject();
        delete userObject.password;


        await logActivity(
                    newUser._id,
                    'created',
                    'user',
                    newUser._id,
                    { username: newUser.username }
                );

        res.status(201).json({ 
            message: 'User registered successfully', 
            user: userObject
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const login = async (req, res) => {
    try {
        const { username, password } = req.body;

        // Check if user exists
        const user = await User.findOne({ username });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Check password
        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Update user status to online
        user.status = 'online';
        await user.save();

        //30 days
        const age = 1000 * 60 * 60 * 24 * 30;

        
        // Generate JWT token
        const token = jwt.sign({ 
            id: user._id 
        },
            process.env.JWT_SECRET, { 
                expiresIn: age 
            });

        // Convert Mongoose document to plain object and remove password
        const userObject = user.toObject();
        delete userObject.password;

        res.cookie('token', token, {
                    httpOnly: true, 
                    secure: true,
                    maxAge: age
                }).status(200).json({
                    message: 'Login successful',
                    user: userObject
                });
                    
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const logout = async (req, res) => {
    try {
        // Extract user ID from token
        const token = req.cookies.token;
        if (token) {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            const userId = decoded.id;
            
            // Update user status to offline
            await User.findByIdAndUpdate(userId, { status: 'offline' });
        }
        
        // Clear the cookie and respond
        res.clearCookie("token").status(200).json({
            message: "User logged out successfully",
        });
    } catch (error) {
        console.error("Logout error:", error);
        // Still clear the cookie even if there's an error
        res.clearCookie("token").status(200).json({
            message: "User logged out successfully",
        });
    }
}

