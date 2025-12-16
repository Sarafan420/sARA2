const express = require('express');
const { body, validationResult } = require('express-validator');
const { PrismaClient } = require('@prisma/client');
const { authenticateToken } = require('../middleware/auth');

const prisma = new PrismaClient();
const router = express.Router();

// Get user skills
router.get('/skills', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    
    const userSkills = await prisma.userSkill.findMany({
      where: { userId },
      include: {
        skill: {
          select: {
            id: true,
            name: true,
            description: true
          }
        }
      },
      orderBy: {
        skill: {
          name: 'asc'
        }
      }
    });

    res.json({
      success: true,
      skills: userSkills.map(us => ({
        id: us.id,
        skillId: us.skillId,
        name: us.skill.name,
        description: us.skill.description
      }))
    });
  } catch (error) {
    console.error('Error fetching user skills:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// Add skill to user
router.post('/skills', authenticateToken, [
  body('skillId').isInt().withMessage('Skill ID must be an integer')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Validation error',
        details: errors.array()
      });
    }

    const userId = req.user.id;
    const { skillId } = req.body;

    // Check if skill exists
    const skill = await prisma.skill.findUnique({
      where: { id: skillId }
    });

    if (!skill) {
      return res.status(404).json({
        success: false,
        error: 'Skill not found'
      });
    }

    // Check if user already has this skill
    const existingUserSkill = await prisma.userSkill.findUnique({
      where: {
        userId_skillId: {
          userId,
          skillId
        }
      }
    });

    if (existingUserSkill) {
      return res.status(409).json({
        success: false,
        error: 'User already has this skill'
      });
    }

    // Add skill to user
    const userSkill = await prisma.userSkill.create({
      data: {
        userId,
        skillId
      },
      include: {
        skill: {
          select: {
            id: true,
            name: true,
            description: true
          }
        }
      }
    });

    res.status(201).json({
      success: true,
      skill: {
        id: userSkill.id,
        skillId: userSkill.skillId,
        name: userSkill.skill.name,
        description: userSkill.skill.description
      }
    });
  } catch (error) {
    console.error('Error adding skill to user:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// Remove skill from user
router.delete('/skills/:skillId', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const skillId = parseInt(req.params.skillId);

    // Check if user has this skill
    const userSkill = await prisma.userSkill.findUnique({
      where: {
        userId_skillId: {
          userId,
          skillId
        }
      }
    });

    if (!userSkill) {
      return res.status(404).json({
        success: false,
        error: 'User skill not found'
      });
    }

    // Remove skill from user
    await prisma.userSkill.delete({
      where: {
        userId_skillId: {
          userId,
          skillId
        }
      }
    });

    res.json({
      success: true,
      message: 'Skill removed from user'
    });
  } catch (error) {
    console.error('Error removing skill from user:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// Get all available skills
router.get('/skills/available', authenticateToken, async (req, res) => {
  try {
    const skills = await prisma.skill.findMany({
      select: {
        id: true,
        name: true,
        description: true
      },
      orderBy: {
        name: 'asc'
      }
    });

    res.json({
      success: true,
      skills
    });
  } catch (error) {
    console.error('Error fetching available skills:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

module.exports = router;
