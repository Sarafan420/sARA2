const express = require('express');
const { body, validationResult } = require('express-validator');
const { PrismaClient } = require('@prisma/client');
const { authenticateToken } = require('../middleware/auth');

const prisma = new PrismaClient();
const router = express.Router();

// Get user's privacy settings
router.get('/settings', authenticateToken, async (req, res) => {
  try {
    const privacySettings = await prisma.userPrivacySettings.findUnique({
      where: { userId: req.user.id },
      include: {
        friendPrivacySettings: {
          include: {
            friend: {
              select: {
                id: true,
                name: true,
                email: true,
                avatarUrl: true,
                position: true,
                company: true
              }
            }
          }
        }
      }
    });

    // If no settings exist, create default ones
    if (!privacySettings) {
      const newSettings = await prisma.userPrivacySettings.create({
        data: {
          userId: req.user.id,
          profileVisibility: 'public',
          showVacancies: true,
          showConnections: true,
          showWorkExperience: true,
          showSkills: true,
          showInterests: true,
          showContactInfo: true,
          allowFriendsToSeeMyVacancies: true,
          allowFriendsToSeeFriendsVacancies: true
        },
        include: {
          friendPrivacySettings: {
            include: {
              friend: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                  avatarUrl: true,
                  position: true,
                  company: true
                }
              }
            }
          }
        }
      });

      return res.json({
        success: true,
        settings: newSettings
      });
    }

    res.json({
      success: true,
      settings: privacySettings
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Unable to fetch privacy settings'
    });
  }
});

// Update general privacy settings
router.put('/settings', authenticateToken, [
  body('profileVisibility').optional().isIn(['public', 'friends', 'private']),
  body('showVacancies').optional().isBoolean(),
  body('showConnections').optional().isBoolean(),
  body('showWorkExperience').optional().isBoolean(),
  body('showSkills').optional().isBoolean(),
  body('showInterests').optional().isBoolean(),
  body('showContactInfo').optional().isBoolean(),
  body('allowFriendsToSeeMyVacancies').optional().isBoolean(),
  body('allowFriendsToSeeFriendsVacancies').optional().isBoolean()
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
      profileVisibility,
      showVacancies,
      showConnections,
      showWorkExperience,
      showSkills,
      showInterests,
      showContactInfo,
      allowFriendsToSeeMyVacancies,
      allowFriendsToSeeFriendsVacancies
    } = req.body;

    // Upsert privacy settings
    const privacySettings = await prisma.userPrivacySettings.upsert({
      where: { userId: req.user.id },
      update: {
        ...(profileVisibility && { profileVisibility }),
        ...(showVacancies !== undefined && { showVacancies }),
        ...(showConnections !== undefined && { showConnections }),
        ...(showWorkExperience !== undefined && { showWorkExperience }),
        ...(showSkills !== undefined && { showSkills }),
        ...(showInterests !== undefined && { showInterests }),
        ...(showContactInfo !== undefined && { showContactInfo }),
        ...(allowFriendsToSeeMyVacancies !== undefined && { allowFriendsToSeeMyVacancies }),
        ...(allowFriendsToSeeFriendsVacancies !== undefined && { allowFriendsToSeeFriendsVacancies })
      },
      create: {
        userId: req.user.id,
        profileVisibility: profileVisibility || 'public',
        showVacancies: showVacancies !== undefined ? showVacancies : true,
        showConnections: showConnections !== undefined ? showConnections : true,
        showWorkExperience: showWorkExperience !== undefined ? showWorkExperience : true,
        showSkills: showSkills !== undefined ? showSkills : true,
        showInterests: showInterests !== undefined ? showInterests : true,
        showContactInfo: showContactInfo !== undefined ? showContactInfo : true,
        allowFriendsToSeeMyVacancies: allowFriendsToSeeMyVacancies !== undefined ? allowFriendsToSeeMyVacancies : true,
        allowFriendsToSeeFriendsVacancies: allowFriendsToSeeFriendsVacancies !== undefined ? allowFriendsToSeeFriendsVacancies : true
      },
      include: {
        friendPrivacySettings: {
          include: {
            friend: {
              select: {
                id: true,
                name: true,
                email: true,
                avatarUrl: true,
                position: true,
                company: true
              }
            }
          }
        }
      }
    });

    res.json({
      success: true,
      message: 'Privacy settings updated successfully',
      settings: privacySettings
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Unable to update privacy settings'
    });
  }
});

// Get friends list for privacy settings
router.get('/friends', authenticateToken, async (req, res) => {
  try {
    // Get user's friends
    const friendships = await prisma.friendship.findMany({
      where: {
        OR: [
          { userId: req.user.id, status: 'accepted' },
          { friendId: req.user.id, status: 'accepted' }
        ]
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            avatarUrl: true,
            position: true,
            company: true
          }
        },
        friend: {
          select: {
            id: true,
            name: true,
            email: true,
            avatarUrl: true,
            position: true,
            company: true
          }
        }
      }
    });

    // Extract friends (excluding the current user)
    const friends = friendships.map(friendship => {
      const friend = friendship.userId === req.user.id ? friendship.friend : friendship.user;
      return {
        id: friend.id,
        name: friend.name,
        email: friend.email,
        avatarUrl: friend.avatarUrl,
        position: friend.position,
        company: friend.company
      };
    });

    // Get privacy settings for friends
    const friendPrivacySettings = await prisma.friendPrivacySettings.findMany({
      where: { userId: req.user.id },
      include: {
        friend: {
          select: {
            id: true,
            name: true,
            email: true,
            avatarUrl: true,
            position: true,
            company: true
          }
        }
      }
    });

    // Merge friends with their privacy settings
    const friendsWithSettings = friends.map(friend => {
      const settings = friendPrivacySettings.find(s => s.friendId === friend.id);
      return {
        ...friend,
        privacySettings: settings ? {
          showMyVacancies: settings.showMyVacancies,
          showFriendsVacancies: settings.showFriendsVacancies
        } : {
          showMyVacancies: true, // default
          showFriendsVacancies: true // default
        }
      };
    });

    res.json({
      success: true,
      friends: friendsWithSettings
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Unable to fetch friends'
    });
  }
});

// Update friend's privacy settings
router.put('/friends/:friendId', authenticateToken, [
  body('showMyVacancies').isBoolean(),
  body('showFriendsVacancies').isBoolean()
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

    const friendId = parseInt(req.params.friendId);
    const { showMyVacancies, showFriendsVacancies } = req.body;

    if (isNaN(friendId)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid friend ID'
      });
    }

    // Check if the friend exists and is actually a friend
    const friendship = await prisma.friendship.findFirst({
      where: {
        OR: [
          { userId: req.user.id, friendId: friendId, status: 'accepted' },
          { userId: friendId, friendId: req.user.id, status: 'accepted' }
        ]
      }
    });

    if (!friendship) {
      return res.status(404).json({
        success: false,
        error: 'Friend not found'
      });
    }

    // Upsert friend privacy settings
    const friendSettings = await prisma.friendPrivacySettings.upsert({
      where: {
        userId_friendId: {
          userId: req.user.id,
          friendId: friendId
        }
      },
      update: {
        showMyVacancies,
        showFriendsVacancies
      },
      create: {
        userId: req.user.id,
        friendId: friendId,
        showMyVacancies,
        showFriendsVacancies
      },
      include: {
        friend: {
          select: {
            id: true,
            name: true,
            email: true,
            avatarUrl: true,
            position: true,
            company: true
          }
        }
      }
    });

    res.json({
      success: true,
      message: 'Friend privacy settings updated successfully',
      settings: friendSettings
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Unable to update friend privacy settings'
    });
  }
});

// Reset friend's privacy settings to default
router.delete('/friends/:friendId', authenticateToken, async (req, res) => {
  try {
    const friendId = parseInt(req.params.friendId);

    if (isNaN(friendId)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid friend ID'
      });
    }

    // Delete friend privacy settings (will revert to defaults)
    await prisma.friendPrivacySettings.deleteMany({
      where: {
        userId: req.user.id,
        friendId: friendId
      }
    });

    res.json({
      success: true,
      message: 'Friend privacy settings reset to default'
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Unable to reset friend privacy settings'
    });
  }
});

module.exports = router;
