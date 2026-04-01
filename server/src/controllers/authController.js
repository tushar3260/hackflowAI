import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import User from '../models/User.js';
import { sendEmail } from '../utils/emailService.js';

// Generate JWT
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d'
    });
};

// @desc    Register new user
// @route   POST /api/auth/register
// @access  Public
// @desc    Register new user
// @route   POST /api/auth/register
// @access  Public
export const registerUser = async (req, res) => {
    try {
        console.log('📝 Register Request Body:', req.body);
        const { name, email, password, role } = req.body;

        if (!name || !email || !password) {
            console.log('❌ Missing fields');
            return res.status(400).json({ message: 'Please add all fields' });
        }

        // Check if user exists
        const userExists = await User.findOne({ email });

        if (userExists) {
            console.log('❌ User already exists:', email);
            return res.status(400).json({ message: 'User already exists' });
        }

        // Generate OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();

        // Hash OTP
        const salt = crypto.randomBytes(16).toString('hex');
        const hash = crypto.pbkdf2Sync(otp, salt, 1000, 64, 'sha512').toString('hex');
        const emailVerificationToken = `${salt}:${hash}`; // Store salt and hash

        // Create user
        console.log('👤 Creating User...');
        const user = await User.create({
            name,
            email,
            password,
            role: role || 'participant',
            emailVerificationToken,
            emailVerificationExpire: Date.now() + 10 * 60 * 1000, // 10 minutes
            isEmailVerified: false
        });

        if (user) {
            // Send OTP Email
            try {
                await sendEmail({
                    to: user.email,
                    subject: 'Hackflow AI - Email Verification',
                    text: `Your verification code is: ${otp}`,
                    html: `<h3>Your verification code is: <strong>${otp}</strong></h3><p>It expires in 10 minutes.</p>`
                });
                console.log('✅ User Created & OTP Sent:', user._id);
                res.status(201).json({
                    message: 'OTP_SENT',
                    email: user.email
                });
            } catch (emailError) {
                console.error('❌ Email Send Error:', emailError);
                // Optional: Delete user if email fails? Or allow resend?
                // For now, return error but keep user (can resend)
                res.status(500).json({ message: 'User created but failed to send OTP. Please try resending.' });
            }
        } else {
            console.log('❌ Invalid user data (generic)');
            res.status(400).json({ message: 'Invalid user data' });
        }
    } catch (error) {
        console.error('❌ Register Error:', error.message);
        res.status(400).json({ message: error.message });
    }
};

// @desc    Authenticate a user
// @route   POST /api/auth/login
// @access  Public
export const loginUser = async (req, res) => {
    const { email, password } = req.body;

    // Check for user email
    const user = await User.findOne({ email }).select('+password');

    if (user && (await user.matchPassword(password))) {
        // Check verification (skip for Google users if they somehow have a password, but usually they don't)
        // If user has googleId, they are verified. If not, check isEmailVerified
        if (!user.googleId && !user.isEmailVerified) {
            return res.status(401).json({ message: 'EMAIL_NOT_VERIFIED', email: user.email });
        }

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
export const getMe = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);

        if (!user) {
            return res.status(404).json({ message: 'User not found in DB' });
        }

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
    } catch (e) {
        console.error('❌ GetMe Error:', e.message);
        res.status(500).json({ message: 'Server Error', error: e.message });
    }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
export const updateProfile = async (req, res) => {
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
                user.resumeUrl = req.file.path;
            } else {
                user.avatar = req.file.path;
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

// @desc    Verify Email OTP
// @route   POST /api/auth/verify-email
// @access  Public
export const verifyEmail = async (req, res) => {
    try {
        const { email, otp } = req.body;

        const user = await User.findOne({ email });

        if (!user) {
            return res.status(400).json({ message: 'User not found' });
        }

        if (user.isEmailVerified) {
            return res.status(400).json({ message: 'Email already verified' });
        }

        if (!user.emailVerificationToken || !user.emailVerificationExpire) {
            return res.status(400).json({ message: 'Invalid verification request' });
        }

        if (Date.now() > user.emailVerificationExpire) {
            return res.status(400).json({ message: 'OTP expired' });
        }

        // Verify OTP
        const [salt, hash] = user.emailVerificationToken.split(':');
        const verifyHash = crypto.pbkdf2Sync(otp, salt, 1000, 64, 'sha512').toString('hex');

        if (verifyHash !== hash) {
            return res.status(400).json({ message: 'Invalid OTP' });
        }

        // Success
        user.isEmailVerified = true;
        user.emailVerificationToken = undefined;
        user.emailVerificationExpire = undefined;
        await user.save();

        res.json({
            _id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            token: generateToken(user._id)
        });

    } catch (error) {
        console.error('❌ Verify Email Error:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Resend OTP
// @route   POST /api/auth/resend-otp
// @access  Public
export const resendOtp = async (req, res) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(400).json({ message: 'User not found' });
        }

        if (user.isEmailVerified) {
            return res.status(400).json({ message: 'Email already verified' });
        }

        // Generate OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();

        // Hash OTP
        const salt = crypto.randomBytes(16).toString('hex');
        const hash = crypto.pbkdf2Sync(otp, salt, 1000, 64, 'sha512').toString('hex');
        const emailVerificationToken = `${salt}:${hash}`;

        user.emailVerificationToken = emailVerificationToken;
        user.emailVerificationExpire = Date.now() + 10 * 60 * 1000; // 10 mins
        await user.save();

        // Send Email
        await sendEmail({
            to: user.email,
            subject: 'Hackflow AI - Resend Verification Code',
            text: `Your verification code is: ${otp}`,
            html: `<h3>Your verification code is: <strong>${otp}</strong></h3><p>It expires in 10 minutes.</p>`
        });

        res.json({ message: 'OTP resent successfully' });

    } catch (error) {
        console.error('❌ Resend OTP Error:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};


import { OAuth2Client } from 'google-auth-library';

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// ... (existing imports)

// ... (existing functions)

// @desc    Login with Google
// @route   POST /api/auth/google
// @access  Public
export const googleLogin = async (req, res) => {
    try {
        const { token } = req.body;

        const ticket = await client.verifyIdToken({
            idToken: token,
            audience: process.env.GOOGLE_CLIENT_ID
        });

        const { name, email, picture, sub: googleId } = ticket.getPayload();

        // Check if user exists
        let user = await User.findOne({ $or: [{ email }, { googleId }] });

        if (user) {
            // If user exists but doesn't have googleId (registered via email/password), update it
            if (!user.googleId) {
                user.googleId = googleId;
                if (!user.avatar) user.avatar = picture;
                await user.save();
            }
        } else {
            // Create new user
            user = await User.create({
                name,
                email,
                googleId,
                avatar: picture,
                role: 'participant', // Default role
                password: '' // Only if schema allows empty password or handled by validation
            });
        }

        res.json({
            _id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            avatar: user.avatar,
            token: generateToken(user._id)
        });

    } catch (error) {
        console.error('❌ Google Login Error:', error.message);
        res.status(400).json({ message: 'Google Login Failed', error: error.message });
    }
};
