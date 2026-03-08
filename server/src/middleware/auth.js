const jwt = require('jsonwebtoken');
const { User } = require('../models');

const authMiddleware = async (req, res, next) => {
    const token = req.cookies.token;

    if (!token) {
        return res.status(401).json({ message: 'Unauthorized - No token provided' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const userFound = await User.findById(decoded.id).select('email role name');

        if (!userFound) {
            return res.status(401).json({ message: 'Unauthorized - User not found' });
        }

        req.user = {
            id: userFound._id.toString(),
            email: userFound.email,
            role: userFound.role,
            name: userFound.name
        };

        next();
    } catch (error) {
        return res.status(401).json({ message: 'Unauthorized - Invalid token' });
    }
};

const authorize = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({ message: 'Forbidden - Insufficient permissions' });
        }
        next();
    };
};

module.exports = { authMiddleware, authorize };
