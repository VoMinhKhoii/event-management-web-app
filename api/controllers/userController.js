import bcrypt from "bcrypt";
import User from '../models/User.js';
import path from 'path';
import fs from 'fs';
import { logActivity } from '../middleware/logActivity.js';

export const getUsers = async (req, res) => {
    try {
        const users = await User.find().select('-password');
        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

export const getUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select('-password');
        if (!user) return res.status(404).json({ message: 'User not found' });
        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

export const updateUser = async (req, res) => {
    try {

        const { firstName, lastName, username, email, password } = req.body;


        // Check if user exists
        const user = await User.findById(req.userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        console.log('User before update:', user);
        // Check if username is being changed and if it's already taken
        if (username && username !== user.username) {
            const existingUsername = await User.findOne({ username });
            if (existingUsername) {
                return res.status(400).json({ message: 'Username already taken' });
            }
        }

        // Check if email is being changed and if it's already taken
        if (email && email !== user.email) {
            const existingEmail = await User.findOne({ email });
            if (existingEmail) {
                return res.status(400).json({ message: 'Email already taken' });
            }
        }

        // Update user information
        if (firstName) user.firstName = firstName;
        if (lastName) user.lastName = lastName;
        if (username) user.username = username;
        if (email) user.email = email;


        // Update password if provided
        if (password && password.trim() !== '') {
            user.password = await bcrypt.hash(password, 10);
        }

        // Save updated user
        const updatedUser = await user.save();
        console.log('User profile updated:', updatedUser);

        // Convert to object and remove password before sending response
        const userObject = updatedUser.toObject();
        delete userObject.password;

        await logActivity(
            req.userId,
            'updated',
            'user',
            updatedUser._id || updatedUser.id,
            { username: updatedUser.username }
        );

        res.status(200).json({
            message: 'Profile updated successfully',
            user: userObject
        });
    } catch (error) {
        console.error('Error updating profile:', error);
        res.status(500).json({ message: error.message });
    }
};


export const deleteUser = async (req, res) => {
    try {
        const userId = req.params.id;

        // current user can only delete their own information
        if (userId !== req.user.id) {
            return res.status(403).json({ message: 'Permission denied' });
        }

        const deletedUser = await User.findByIdAndDelete(userId);
        if (!deletedUser) return res.status(404).json({ message: 'User not found' });

        await logActivity(
            req.userId,
            'deleted',
            'user',
            deletedUser._id,
            { username: deletedUser.username }
        );

        res.status(200).json({ message: 'User deleted' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Update user avatar
export const updateAvatar = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded ' });
        }

        const uploadDir = path.join(__dirname, '../../tmp/uploads');
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }

        const cloudinaryUrl = `https://api.cloudinary.com/v1_1/${process.env.CLOUDINARY_CLOUD_NAME}/upload`;
        const formData = new FormData();

        // convert buffer to blob
        const fileStream = fs.createReadStream(req.file.path);
        formData.append('file', fileStream);
        formData.append('upload_preset', process.env.CLOUDINARY_UPLOAD_PRESET);
        formData.append('folder', 'permanent_assets');

        const cloudinaryResponse = await fetch(cloudinaryUrl, {
            method: 'POST',
            body: formData
        });

        if (!cloudinaryResponse.ok) {
            const errorData = await cloudinaryResponse.json();
            throw new Error(cloudinaryData.error?.message || 'Cloudinary upload failed');
        }

        const cloudinaryData = await cloudinaryResponse.json();

        // remove temp file
        try {
            if (fs.existsSync(req.file.path)) {
                fs.unlinkSync(req.file.path);
            }
        } catch (unlinkError) {
            console.error('Error deleting temporary file:', unlinkError);
        }

        const avatarUrl = `/uploads/${req.file.filename}`;
        const updatedUser = await User.findByIdAndUpdate(
            req.userId,
            { avatar: avatarUrl },
            { new: true }
        ).select('-password');

        res.status(200).json({
            message: 'Avatar updated successfully',
            avatar: avatarUrl,
            user: updatedUser
        });
    } catch (error) {
        // clean-up temp file if exists
        if (req.file?.path && fs.existsSync(req.file.path)) {
            try {
                fs.unlinkSync(req.file.path);
            } catch (cleanupError) {
                console.error('Error during file cleanup:', cleanupError);
            }
        }

        console.error('Error updating avatar:', error);
        res.status(500).json({
            message: error.message || 'Failed to update avatar',
            error: error.toString()
        });
    }
};

