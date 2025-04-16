const User = require('../models/user.model.js');
const Astrologer = require('../models/astrologer.model.js');
const bcryptjs = require('bcryptjs');
const errorHandler = require('../utils/error.js');
const jwt = require('jsonwebtoken');


//for email validation
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

const signup = async (req, res, next) => {
    const { name, username, email, password, role } = req.body;

    try {
        if (!name || !username || !email || !password) {
            return res.status(400).json('All fields are required');
        }
        if (!isValidEmail(email)) {
            return res.status(400).json('Invalid email format');
        }
        // Check if user already exists (case-insensitive)
        const existingUser = await User.findOne({
            $or: [{ username: { $regex: new RegExp(`^${username}$`, 'i') } }, { email: { $regex: new RegExp(`^${email}$`, 'i') } }]
        });

        if (existingUser) {
            return res.status(400).json('User already exists');
        }

        const hashedPassword = bcryptjs.hashSync(password, 10);
        const newUser = new User({ name, username, email, password: hashedPassword, role });
        await newUser.save();
        const { password: pass, ...userDetails } = newUser._doc;
        res
            .status(201)
            .json({
                success: true,
                message: 'User created successfully!',
                user: userDetails
            });

    } catch (error) {
        next(error);
    }
};

const astrologerSignup = async (req, res, next) => {
    const {
        name,
        username,
        email,
        password,
        languages = [],
        experience = 0,
        costPerMinute = 0,
        about = ''
    } = req.body;

    try {
        // Input Validation
        if (!name || !username || !email || !password) {
            return res.status(400).json('All fields are required');
        }
        if (!isValidEmail(email)) {
            return res.status(400).json('Invalid email format');
        }

        // Check if user already exists (case-insensitive)
        const existingUser = await User.findOne({
            $or: [
                { username: { $regex: new RegExp(`^${username}$`, 'i') } },
                { email: { $regex: new RegExp(`^${email}$`, 'i') } }
            ]
        });

        if (existingUser) {
            return res.status(400).json('User already exists');
        }

        // Create User
        const hashedPassword = bcryptjs.hashSync(password, 10);
        const newUser = new User({
            name,
            username,
            email,
            password: hashedPassword,
            role: "Astrologer" // Fixed role for astrologer signup
        });
        await newUser.save();

        // Create Astrologer Profile
        const newAstrologer = new Astrologer({
            userId: newUser._id,
            languages,
            experience,
            costPerMinute,
            about: about || `${name} is a new astrologer.`
        });
        await newAstrologer.save();

        // Return response without password
        const { password: pass, ...userDetails } = newUser._doc;
        res.status(201).json({
            success: true,
            message: 'Astrologer account created successfully!',
            user: userDetails,
            astrologer: newAstrologer
        });

    } catch (error) {
        next(error);
    }
};


const login = async (req, res, next) => {
    const { email, password } = req.body;
    console.log(`Login attempt for email: ${email}`);

    try {
        if (!email || !password) {
            console.warn('Email or password missing');
            return res.status(400).json({ 
                success: false, 
                message: 'Email and password are required.' 
            });
        }

        const validUser = await User.findOne({ 
            email: { $regex: new RegExp(`^${email}$`, 'i') } 
        });
        
        if (!validUser) {
            console.warn(`User not found for email: ${email}`);
            return res.status(404).json({ 
                success: false, 
                message: 'User not found!' 
            });
        }

        const validPassword = bcryptjs.compareSync(password, validUser.password);
        if (!validPassword) {
            console.warn(`Invalid password attempt for email: ${email}`);
            return res.status(401).json({ 
                success: false, 
                message: 'Wrong credentials!' 
            });
        }

        const token = jwt.sign({
            id: validUser._id,
            role: validUser.role
        }, process.env.JWT_SECRET, { expiresIn: '6h' });

        const { password: pass, ...rest } = validUser._doc;

        res.status(200).json({
            success: true,
            message: 'Login successful!',
            user: rest,
            token
        });

        console.log(`Login successful for email: ${email}`);
    } catch (error) {
        console.error('Login error:', error);
        next(error);
    }
};

const google = async (req, res, next) => {
    try {
        // Input Validation
        if (!req.body.email || !req.body.name) {
            return res.status(400).json('Missing required Google profile information');
        }

        const user = await User.findOne({ email: req.body.email });
        if (user) {
            const token = jwt.sign({
                id: validUser._id,
                role: validUser.role
            }, process.env.JWT_SECRET);
            const { password: pass, ...rest } = user._doc;
            res
                .cookie('access_token', token, { httpOnly: true, secure: isProduction, maxAge: 6 * 60 * 60 * 1000 })
                .status(200)
                .json(rest);
        } else {
            let username = req.body.name.split(' ').json('').toLowerCase() + Math.random().toString(36).slice(-4);

            // Check for username collision (you can add a retry mechanism if needed)
            let existingUsername = await User.findOne({ username });
            while (existingUsername) {
                username = req.body.name.split(' ').json('').toLowerCase() + Math.random().toString(36).slice(-4);
                existingUsername = await User.findOne({ username });
            }

            const generatedPassword =
                Math.random().toString(36).slice(-8) +
                Math.random().toString(36).slice(-8);
            const hashedPassword = bcryptjs.hashSync(generatedPassword, 10);
            const newUser = new User({
                username: username,
                email: req.body.email,
                password: hashedPassword,
                avatar: req.body.photo,
            });
            await newUser.save();
            const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET);
            const { password: pass, ...rest } = newUser._doc;
            res
                .cookie('access_token', token, {
                    httpOnly: true,
                    sameSite: 'none',
                    secure: true,
                    maxAge: 6 * 60 * 60 * 1000
                })
                .status(200)
                .json(rest);
        }
    } catch (error) {
        next(error);
    }
};

const signOut = async (req, res, next) => {
    try {
        // With token-based auth, no need to clear cookies
        // Client should remove token from storage
        res.status(200).json({ 
            success: true,
            message: 'Logged out successfully'
        });
    } catch (error) {
        next(error);
    }
};

/**
 * WARNING: This is a test-only route that will delete ALL users and astrologers.
 * This should NEVER be used in production environments.
 * For testing and development purposes only.
 */
const deleteAllUsers = async (req, res, next) => {
    try {
        // Delete all astrologers first (to handle foreign key relationships)
        await Astrologer.deleteMany({});
        // Then delete all users
        await User.deleteMany({});
        
        res.status(200).json({
            success: true,
            message: 'All users and astrologers deleted successfully for testing purposes'
        });
    } catch (error) {
        next(error);
    }
};

module.exports = { google, signOut, login, signup, astrologerSignup, deleteAllUsers };