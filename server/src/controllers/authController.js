const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

// Generate JWT
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d'
    });
};

// @desc    Register new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res) => {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
        return res.status(400).json({ message: 'Please add all fields' });
    }

    // Check if user exists
    const userExists = await User.findOne({ email });

    if (userExists) {
        return res.status(400).json({ message: 'User already exists' });
    }

    // Create user
    const user = await User.create({
        name,
        email,
        password,
        role: role || 'participant'
    });

    if (user) {
        res.status(201).json({
            _id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            token: generateToken(user._id)
        });
    } else {
        res.status(400).json({ message: 'Invalid user data' });
    }
};

// @desc    Authenticate a user
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res) => {
    const { email, password } = req.body;

    // Check for user email
    const user = await User.findOne({ email }).select('+password');

    if (user && (await user.matchPassword(password))) {
        res.json({
            _id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            token: generateToken(user._id)
        });
    } else {
        res.status(400).json({ message: 'Invalid credentials' });
    }
};

// @desc    Get user data
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res) => {
    const user = await User.findById(req.user.id);

    res.status(200).json({
        _id: user.id,
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        collegeName: user.collegeName,
        course: user.course,
        yearOfStudy: user.yearOfStudy,
        phone: user.phone,
        skills: user.skills,
        githubUrl: user.githubUrl,
        linkedinUrl: user.linkedinUrl,
        resumeUrl: user.resumeUrl,
        avatar: user.avatar
    });
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
const updateProfile = async (req, res) => {
    const user = await User.findById(req.user.id);

    if (user) {
        user.name = req.body.name || user.name;
        user.email = req.body.email || user.email;
        if (req.body.password) {
            user.password = req.body.password;
        }
        if (req.file) {
            // Check if it's an avatar or resume based on fieldname (if using multiselect)
            // But for now, we assume avatar since it's the standard profile update
            // We'll handle resume separately or check field names
            if (req.file.fieldname === 'resume') {
                user.resumeUrl = `/uploads/${req.file.filename}`;
            } else {
                user.avatar = `/uploads/${req.file.filename}`;
            }
        }

        // Participant fields
        if (req.body.collegeName) user.collegeName = req.body.collegeName;
        if (req.body.course) user.course = req.body.course;
        if (req.body.yearOfStudy) user.yearOfStudy = req.body.yearOfStudy;
        if (req.body.phone) user.phone = req.body.phone;
        if (req.body.skills) {
            user.skills = typeof req.body.skills === 'string'
                ? req.body.skills.split(',').map(s => s.trim())
                : req.body.skills;
        }
        if (req.body.githubUrl) user.githubUrl = req.body.githubUrl;
        if (req.body.linkedinUrl) user.linkedinUrl = req.body.linkedinUrl;

        const updatedUser = await user.save();

        res.json({
            _id: updatedUser._id,
            name: updatedUser.name,
            email: updatedUser.email,
            role: updatedUser.role,
            avatar: updatedUser.avatar,
            collegeName: updatedUser.collegeName,
            course: updatedUser.course,
            yearOfStudy: updatedUser.yearOfStudy,
            phone: updatedUser.phone,
            skills: updatedUser.skills,
            githubUrl: updatedUser.githubUrl,
            linkedinUrl: updatedUser.linkedinUrl,
            resumeUrl: updatedUser.resumeUrl,
            token: generateToken(updatedUser._id)
        });
    } else {
        res.status(404).json({ message: 'User not found' });
    }
};

module.exports = {
    registerUser,
    loginUser,
    getMe,
    updateProfile
};
