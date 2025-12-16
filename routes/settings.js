const express = require('express');
const { body, validationResult } = require('express-validator');
const { PrismaClient } = require('@prisma/client');
const { authenticateToken } = require('../middleware/auth');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();
const router = express.Router();

// Get user's notification settings
router.get('/notifications', authenticateToken, async (req, res) => {
  try {
    const notificationSettings = await prisma.userNotificationSettings.findUnique({
      where: { userId: req.user.id }
    });

    // If no settings exist, create default ones
    if (!notificationSettings) {
      const newSettings = await prisma.userNotificationSettings.create({
        data: {
          userId: req.user.id,
          emailNotifications: true,
          pushNotifications: true,
          vacancyAlerts: true,
          connectionRequests: true,
          messages: true,
          weeklyDigest: false
        }
      });

      return res.json({
        success: true,
        settings: newSettings
      });
    }

    res.json({
      success: true,
      settings: notificationSettings
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Unable to fetch notification settings'
    });
  }
});

// Update notification settings
router.put('/notifications', authenticateToken, [
  body('emailNotifications').optional().isBoolean(),
  body('pushNotifications').optional().isBoolean(),
  body('vacancyAlerts').optional().isBoolean(),
  body('connectionRequests').optional().isBoolean(),
  body('messages').optional().isBoolean(),
  body('weeklyDigest').optional().isBoolean()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const {
      emailNotifications,
      pushNotifications,
      vacancyAlerts,
      connectionRequests,
      messages,
      weeklyDigest
    } = req.body;

    // Upsert notification settings
    const notificationSettings = await prisma.userNotificationSettings.upsert({
      where: { userId: req.user.id },
      update: {
        ...(emailNotifications !== undefined && { emailNotifications }),
        ...(pushNotifications !== undefined && { pushNotifications }),
        ...(vacancyAlerts !== undefined && { vacancyAlerts }),
        ...(connectionRequests !== undefined && { connectionRequests }),
        ...(messages !== undefined && { messages }),
        ...(weeklyDigest !== undefined && { weeklyDigest })
      },
      create: {
        userId: req.user.id,
        emailNotifications: emailNotifications !== undefined ? emailNotifications : true,
        pushNotifications: pushNotifications !== undefined ? pushNotifications : true,
        vacancyAlerts: vacancyAlerts !== undefined ? vacancyAlerts : true,
        connectionRequests: connectionRequests !== undefined ? connectionRequests : true,
        messages: messages !== undefined ? messages : true,
        weeklyDigest: weeklyDigest !== undefined ? weeklyDigest : false
      }
    });

    res.json({
      success: true,
      message: 'Notification settings updated successfully',
      settings: notificationSettings
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Unable to update notification settings'
    });
  }
});

// Get user's profile settings
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    const profileSettings = await prisma.userProfileSettings.findUnique({
      where: { userId: req.user.id }
    });

    // If no settings exist, create default ones
    if (!profileSettings) {
      const newSettings = await prisma.userProfileSettings.create({
        data: {
          userId: req.user.id,
          hideFromEveryone: false,
          profileVisibility: 'public',
          allowSearch: true,
          allowMessages: true,
          allowConnectionRequests: true
        }
      });

      return res.json({
        success: true,
        settings: newSettings
      });
    }

    res.json({
      success: true,
      settings: profileSettings
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Unable to fetch profile settings'
    });
  }
});

// Update profile settings
router.put('/profile', authenticateToken, [
  body('hideFromEveryone').optional().isBoolean(),
  body('profileVisibility').optional().isIn(['public', 'friends', 'private']),
  body('allowSearch').optional().isBoolean(),
  body('allowMessages').optional().isBoolean(),
  body('allowConnectionRequests').optional().isBoolean()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const {
      hideFromEveryone,
      profileVisibility,
      allowSearch,
      allowMessages,
      allowConnectionRequests
    } = req.body;

    // Upsert profile settings
    const profileSettings = await prisma.userProfileSettings.upsert({
      where: { userId: req.user.id },
      update: {
        ...(hideFromEveryone !== undefined && { hideFromEveryone }),
        ...(profileVisibility && { profileVisibility }),
        ...(allowSearch !== undefined && { allowSearch }),
        ...(allowMessages !== undefined && { allowMessages }),
        ...(allowConnectionRequests !== undefined && { allowConnectionRequests })
      },
      create: {
        userId: req.user.id,
        hideFromEveryone: hideFromEveryone !== undefined ? hideFromEveryone : false,
        profileVisibility: profileVisibility || 'public',
        allowSearch: allowSearch !== undefined ? allowSearch : true,
        allowMessages: allowMessages !== undefined ? allowMessages : true,
        allowConnectionRequests: allowConnectionRequests !== undefined ? allowConnectionRequests : true
      }
    });

    res.json({
      success: true,
      message: 'Profile settings updated successfully',
      settings: profileSettings
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Unable to update profile settings'
    });
  }
});

// Change password
router.put('/profile/password', authenticateToken, [
  body('currentPassword').notEmpty().withMessage('Current password is required'),
  body('newPassword').isLength({ min: 6 }).withMessage('New password must be at least 6 characters'),
  body('confirmPassword').custom((value, { req }) => {
    if (value !== req.body.newPassword) {
      throw new Error('Password confirmation does not match');
    }
    return true;
  })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const { currentPassword, newPassword } = req.body;

    // Get user with password hash
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: { passwordHash: true }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    // Verify current password
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!isCurrentPasswordValid) {
      return res.status(400).json({
        success: false,
        error: 'Current password is incorrect'
      });
    }

    // Hash new password
    const saltRounds = 12;
    const newPasswordHash = await bcrypt.hash(newPassword, saltRounds);

    // Update password
    await prisma.user.update({
      where: { id: req.user.id },
      data: { passwordHash: newPasswordHash }
    });

    res.json({
      success: true,
      message: 'Password changed successfully'
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Unable to change password'
    });
  }
});

module.exports = router;
