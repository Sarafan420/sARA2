const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const { PrismaClient } = require('@prisma/client');
const Logger = require('../utils/logger');

const prisma = new PrismaClient();
const router = express.Router();

// Validation middleware
const validateRegistration = [
  body('name').trim().isLength({ min: 2, max: 100 }).withMessage('Name must be 2-100 characters'),
  body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('phone').optional().isMobilePhone('ru-RU').withMessage('Valid phone number required'),
  body('location').optional().trim().isLength({ max: 100 }).withMessage('Location too long'),
  body('company').optional().trim().isLength({ max: 100 }).withMessage('Company name too long'),
  body('position').optional().trim().isLength({ max: 100 }).withMessage('Position too long'),
  body('bio').optional().trim().isLength({ max: 1000 }).withMessage('Bio too long')
];

const validateLogin = [
  body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
  body('password').notEmpty().withMessage('Password required')
];

// Register new user
router.post('/register', validateRegistration, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const { name, email, password, phone, location, company, position, bio } = req.body;

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        error: 'User already exists',
        message: 'An account with this email already exists'
      });
    }

    // Hash password
    const saltRounds = parseInt(process.env.BCRYPT_ROUNDS) || 12;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Create user
    const user = await prisma.user.create({
      data: {
        name,
        email,
        passwordHash,
        phone,
        location,
        company,
        position,
        experienceYears: req.body.experience_years,
        bio,
        skills: JSON.stringify([]),
        interests: JSON.stringify([])
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        location: true,
        company: true,
        position: true,
        experienceYears: true,
        bio: true,
        avatarUrl: true,
        status: true,
        skills: true,
        interests: true,
        createdAt: true
      }
    });

    // Create default settings
    await prisma.userSettings.create({
      data: {
        userId: user.id
      }
    });

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    // Логируем регистрацию
    await Logger.logUserAction(user.id, 'registration', {
      email,
      name,
      timestamp: new Date().toISOString()
    }, req);

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      user: {
        ...user,
        skills: JSON.parse(user.skills),
        interests: JSON.parse(user.interests)
      },
      token
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Registration failed',
      message: 'Unable to create user account'
    });
  }
});

// Login user
router.post('/login', validateLogin, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const { email, password } = req.body;

    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        name: true,
        email: true,
        passwordHash: true,
        phone: true,
        location: true,
        company: true,
        position: true,
        bio: true,
        avatarUrl: true,
        status: true,
        skills: true,
        interests: true,
        experienceYears: true,
        createdAt: true
      }
    });

    if (!user) {
      // Логируем неуспешную попытку входа
      await Logger.logSecurityEvent(null, 'login_attempt', {
        email,
        reason: 'user_not_found',
        timestamp: new Date().toISOString()
      }, false, req);

      return res.status(401).json({
        success: false,
        error: 'Invalid credentials',
        message: 'Email or password is incorrect'
      });
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.passwordHash);
    if (!isValidPassword) {
      // Логируем неуспешную попытку входа
      await Logger.logSecurityEvent(user.id, 'login_attempt', {
        email,
        reason: 'invalid_password',
        timestamp: new Date().toISOString()
      }, false, req);

      return res.status(401).json({
        success: false,
        error: 'Invalid credentials',
        message: 'Email or password is incorrect'
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    // Remove password hash from response
    const { passwordHash, ...userWithoutPassword } = user;

    // Логируем успешный вход
    await Logger.logUserAction(user.id, 'login', {
      email,
      timestamp: new Date().toISOString()
    }, req);

    await Logger.logSecurityEvent(user.id, 'login_attempt', {
      email,
      timestamp: new Date().toISOString()
    }, true, req);

    res.json({
      success: true,
      message: 'Login successful',
      user: {
        ...userWithoutPassword,
        skills: JSON.parse(user.skills),
        interests: JSON.parse(user.interests)
      },
      token
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Login failed',
      message: 'Unable to authenticate user'
    });
  }
});

// Get current user profile
router.get('/me', async (req, res) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'Access token required'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        location: true,
        company: true,
        position: true,
        bio: true,
        avatarUrl: true,
        status: true,
        skills: true,
        interests: true,
        experienceYears: true,
        createdAt: true,
        updatedAt: true
      }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    res.json({
      success: true,
      user: {
        ...user,
        skills: JSON.parse(user.skills),
        interests: JSON.parse(user.interests)
      }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Unable to get user profile'
    });
  }
});

// Logout (client-side token removal)
router.post('/logout', (req, res) => {
  res.json({
    success: true,
    message: 'Logged out successfully'
  });
});

module.exports = router;
