import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

//Register a new user
const signup = async (req, res) => {
    try {
        const { firstName, lastName, username, email, password } = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = await User.create({
            firstName,
            lastName,
            username,
            email,
            password: hashedPassword,
        });

        res.status(201).json({ message: 'User registered successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const login = async (req, res) => {
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
                    // Not using https
                    // secure: true 
                    maxAge: age
                }).status(200).json({
                    message: 'Login successful',
                    user: userObject
                });
                    
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const logout = (req, res) => {
    res.clearCookie("token").status(200).json({
        message: "User logged out successfully",
    });
    //db operations
    console.log("logout");
} 

export { signup, login, logout };