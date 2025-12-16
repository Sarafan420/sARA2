const express = require('express');
const { body, validationResult } = require('express-validator');
const { PrismaClient } = require('@prisma/client');
const { authenticateToken, optionalAuth } = require('../middleware/auth');

const prisma = new PrismaClient();
const router = express.Router();

// Get current user profile
router.get('/me', authenticateToken, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
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
        userSkills: {
          include: {
            skill: {
              select: {
                id: true,
                name: true,
                description: true
              }
            }
          }
        },
        interests: true,
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
        skills: user.userSkills.map(us => us.skill),
        interests: JSON.parse(user.interests || '[]')
      }
    });
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch user profile'
    });
  }
});

// Get all users (with optional authentication for personalized results)
router.get('/', optionalAuth, async (req, res) => {
  try {
    const { page = 1, limit = 20, search, location, company, position } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const where = {};
    
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { company: { contains: search, mode: 'insensitive' } },
        { position: { contains: search, mode: 'insensitive' } }
      ];
    }
    
    if (location) {
      where.location = { contains: location, mode: 'insensitive' };
    }
    
    if (company) {
      where.company = { contains: company, mode: 'insensitive' };
    }
    
    if (position) {
      where.position = { contains: position, mode: 'insensitive' };
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
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
          userSkills: {
            include: {
              skill: {
                select: {
                  id: true,
                  name: true,
                  description: true
                }
              }
            }
          },
          interests: true,
          experienceYears: true,
          createdAt: true
        },
        skip,
        take: parseInt(limit),
        orderBy: { createdAt: 'desc' }
      }),
      prisma.user.count({ where })
    ]);

    const usersWithParsedData = users.map(user => ({
      ...user,
      skills: user.userSkills.map(us => us.skill),
      interests: user.interests ? JSON.parse(user.interests) : []
    }));

    res.json({
      success: true,
      users: usersWithParsedData,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });

  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({
      success: false,
      error: 'Unable to fetch users'
    });
  }
});

// Get user by ID
router.get('/:id', optionalAuth, async (req, res) => {
  try {
    const userId = parseInt(req.params.id);
    
    if (isNaN(userId)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid user ID'
      });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
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
        userSkills: {
          include: {
            skill: {
              select: {
                id: true,
                name: true,
                description: true
              }
            }
          }
        },
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

    // Get user's connections count
    const connectionsCount = await prisma.connection.count({
      where: {
        OR: [
          { userId: userId, status: 'accepted' },
          { connectedUserId: userId, status: 'accepted' }
        ]
      }
    });

    // Get user's vacancies count
    const vacanciesCount = await prisma.vacancy.count({
      where: { userId: userId }
    });

    res.json({
      success: true,
      user: {
        ...user,
        skills: user.userSkills.map(us => us.skill),
        interests: user.interests ? JSON.parse(user.interests) : [],
        connectionsCount,
        vacanciesCount
      }
    });

  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      success: false,
      error: 'Unable to fetch user'
    });
  }
});

// Update user profile
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const userId = parseInt(req.params.id);
    
    if (isNaN(userId)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid user ID'
      });
    }

    // Check if user is updating their own profile
    if (req.user.id !== userId) {
      return res.status(403).json({
        success: false,
        error: 'Forbidden',
        message: 'You can only update your own profile'
      });
    }

    const {
      name,
      phone,
      location,
      company,
      position,
      bio,
      status,
      skills,
      interests,
      experienceYears
    } = req.body;

    const updateData = {};
    
    if (name !== undefined) updateData.name = name;
    if (phone !== undefined) updateData.phone = phone;
    if (location !== undefined) updateData.location = location;
    if (company !== undefined) updateData.company = company;
    if (position !== undefined) updateData.position = position;
    if (bio !== undefined) updateData.bio = bio;
    if (status !== undefined) updateData.status = status;
    if (skills !== undefined) updateData.skills = JSON.stringify(skills);
    if (interests !== undefined) updateData.interests = JSON.stringify(interests);
    if (experienceYears !== undefined) updateData.experienceYears = experienceYears;

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData,
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
        updatedAt: true
      }
    });

    res.json({
      success: true,
      message: 'Profile updated successfully',
      user: {
        ...updatedUser,
        skills: updatedUser.skills ? JSON.parse(updatedUser.skills) : [],
        interests: updatedUser.interests ? JSON.parse(updatedUser.interests) : []
      }
    });

  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({
      success: false,
      error: 'Unable to update profile'
    });
  }
});

// Get user's connections
router.get('/:id/connections', optionalAuth, async (req, res) => {
  try {
    const userId = parseInt(req.params.id);
    
    if (isNaN(userId)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid user ID'
      });
    }

    const connections = await prisma.connection.findMany({
      where: {
        OR: [
          { userId: userId, status: 'accepted' },
          { connectedUserId: userId, status: 'accepted' }
        ]
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            position: true,
            company: true,
            avatarUrl: true
          }
        },
        connectedUser: {
          select: {
            id: true,
            name: true,
            position: true,
            company: true,
            avatarUrl: true
          }
        }
      }
    });

    // Transform connections to show the connected user
    const friends = connections.map(conn => {
      const friend = conn.userId === userId ? conn.connectedUser : conn.user;
      return {
        id: friend.id,
        name: friend.name,
        position: friend.position,
        company: friend.company,
        avatar: friend.avatarUrl,
        connectionType: conn.connectionType,
        connectedAt: conn.createdAt
      };
    });

    res.json({
      success: true,
      connections: friends
    });

  } catch (error) {
    console.error('Get connections error:', error);
    res.status(500).json({
      success: false,
      error: 'Unable to fetch connections'
    });
  }
});

// Get user's vacancies
router.get('/:id/vacancies', optionalAuth, async (req, res) => {
  try {
    const userId = parseInt(req.params.id);
    
    if (isNaN(userId)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid user ID'
      });
    }

    const vacancies = await prisma.vacancy.findMany({
      where: { userId: userId },
      orderBy: { createdAt: 'desc' }
    });

    const vacanciesWithParsedData = vacancies.map(vacancy => ({
      ...vacancy,
      skillsRequired: JSON.parse(vacancy.skillsRequired || '[]')
    }));

    res.json({
      success: true,
      vacancies: vacanciesWithParsedData
    });

  } catch (error) {
    console.error('Get user vacancies error:', error);
    res.status(500).json({
      success: false,
      error: 'Unable to fetch user vacancies'
    });
  }
});

module.exports = router;
