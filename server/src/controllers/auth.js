const { User, BannedEmail } = require('../models');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');

const register = async (req, res) => {
    const { email, password, name, role } = req.body;

    try {
        if (role === 'ADMIN') {
            return res.status(403).json({ message: 'Administrator accounts cannot be created via public registration.' });
        }

        const isBanned = await BannedEmail.findOne({ email });
        if (isBanned) {
            return res.status(403).json({ message: 'This email is permanently banned from registering or logging in.' });
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists with this email' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await User.create({
            email,
            password: hashedPassword,
            name,
            role: role || 'CLIENT',
        });

        res.status(201).json({ message: 'User registered successfully', userId: user._id });
    } catch (error) {
        console.error('Registration Error:', error);
        res.status(500).json({
            message: 'Server error during registration',
            error: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
            code: error.code
        });
    }
};

const login = async (req, res) => {
    const { email, password } = req.body;

    try {
        const isBanned = await BannedEmail.findOne({ email });
        if (isBanned) {
            return res.status(403).json({ message: 'This email is permanently banned from registering or logging in.' });
        }

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        const token = jwt.sign(
            { id: user._id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '1d' }
        );

        res.cookie('token', token, {
            httpOnly: true,
            secure: true,
            maxAge: 24 * 60 * 60 * 1000, // 1 day
        });

        res.json({
            user: {
                id: user._id,
                email: user.email,
                name: user.name,
                role: user.role
            }
        });
    } catch (error) {
        console.error('Login Error:', error);
        res.status(500).json({
            message: 'Server error during login',
            error: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
            code: error.code
        });
    }
};

const logout = (req, res) => {
    res.clearCookie('token');
    res.json({ message: 'Logged out successfully' });
};

const getMe = async (req, res) => {
    res.json({ user: req.user });
};

const internalHealth = async (req, res) => {
    try {
        const isConnected = mongoose.connection.readyState === 1;
        if (!isConnected) throw new Error('Database not connected');
        res.json({
            status: 'ok',
            database: 'connected',
            env: {
                hasJwt: !!process.env.JWT_SECRET,
                hasDb: !!process.env.DATABASE_URL,
                hasMasterKey: !!process.env.ADMIN_MASTER_KEY,
                nodeEnv: process.env.NODE_ENV
            }
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            database: 'disconnected',
            error: error.message
        });
    }
};

module.exports = { register, login, logout, getMe, internalHealth };
