import bcrypt from "bcrypt";
import User from '../models/User.js';

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

        res.status(200).json({ message: 'User deleted' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Update user avatar
export const updateAvatar = async (req, res) => {
    try {
        const { avatarUrl } = req.body;
        
        if (!avatarUrl) {
            return res.status(400).json({ message: 'Avatar URL is required' });
        }
        
        const user = await User.findById(req.userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        
        user.avatar = avatarUrl;
        await user.save();
        
        res.status(200).json({
            message: 'Avatar updated successfully',
            avatar: avatarUrl
        });
    } catch (error) {
        console.error('Error updating avatar:', error);
        res.status(500).json({ message: error.message });
    }
};

