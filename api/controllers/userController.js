import bcrypt from "bcrypt";
import User from '../models/User.js';
import fs from 'fs';
import { logActivity } from '../middleware/logActivity.js';
import https from 'https';

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
            return res.status(400).json({ error: 'No file uploaded' });
        }

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
        })

        // clean-up temp file
        fs.unlinkSync(req.file.path);

        // update user w/ cloudinary URL
        const updatedUser = await User.findByIdAndUpdate(
            req.userId,
            { avatar: response.secure_url },
            { new: true }
        ).select('-password');

        res.status(200).json({
            message: 'Avatar updated successfully',
            avatar: response.secure_url,
            user: updatedUser
        });
    } catch (err) {
        console.error('Avatar upload error:', err);
        // clean-up temp file if exists
        if (req.file?.path && fs.existsSync(req.file.path)) {
            try {
                if (fs.existsSync(req.file.path)) {
                    fs.unlinkSync(req.file.path);
                }
            } catch (cleanupError) {
                console.error('Error during file cleanup:', cleanupError);
            }
        }

        res.status(500).json({
            message: err.message || 'Failed to update avatar',
        });
    }
};

