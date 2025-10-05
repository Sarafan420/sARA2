const express = require('express');
const { PrismaClient } = require('@prisma/client');
const authenticateToken = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

// Получить весь опыт работы пользователя
router.get('/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    const workExperience = await prisma.workExperience.findMany({
      where: { userId: parseInt(userId) },
      orderBy: { startDate: 'desc' }
    });

    res.json({
      success: true,
      data: workExperience
    });

  } catch (error) {
    console.error('Error fetching work experience:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch work experience'
    });
  }
});

// Получить конкретный опыт работы
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const workExperience = await prisma.workExperience.findUnique({
      where: { id: parseInt(id) }
    });

    if (!workExperience) {
      return res.status(404).json({
        success: false,
        error: 'Work experience not found'
      });
    }

    res.json({
      success: true,
      data: workExperience
    });

  } catch (error) {
    console.error('Error fetching work experience:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch work experience'
    });
  }
});

// Создать новый опыт работы
router.post('/', async (req, res) => {
  try {
    const { company, position, startDate, endDate, description, projectName } = req.body;

    // Простая валидация
    if (!company || !position || !startDate) {
      return res.status(400).json({
        success: false,
        error: 'Company, position and start date are required'
      });
    }

    const workExperience = await prisma.workExperience.create({
      data: {
        userId: 1, // Временно используем ID 1
        company,
        position,
        startDate: new Date(startDate),
        endDate: endDate ? new Date(endDate) : null,
        description,
        projectName
      }
    });

    res.status(201).json({
      success: true,
      data: workExperience,
      message: 'Work experience created successfully'
    });

  } catch (error) {
    console.error('Error creating work experience:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create work experience'
    });
  }
});

// Обновить опыт работы
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { company, position, startDate, endDate, description, projectName } = req.body;

    // Простая валидация
    if (!company || !position || !startDate) {
      return res.status(400).json({
        success: false,
        error: 'Company, position and start date are required'
      });
    }

    // Проверяем, что опыт работы существует
    const existingWorkExperience = await prisma.workExperience.findUnique({
      where: { id: parseInt(id) }
    });

    if (!existingWorkExperience) {
      return res.status(404).json({
        success: false,
        error: 'Work experience not found'
      });
    }

    const workExperience = await prisma.workExperience.update({
      where: { id: parseInt(id) },
      data: {
        company,
        position,
        startDate: new Date(startDate),
        endDate: endDate ? new Date(endDate) : null,
        description,
        projectName
      }
    });

    res.json({
      success: true,
      data: workExperience,
      message: 'Work experience updated successfully'
    });

  } catch (error) {
    console.error('Error updating work experience:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update work experience'
    });
  }
});

// Удалить опыт работы
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Проверяем, что опыт работы существует
    const existingWorkExperience = await prisma.workExperience.findUnique({
      where: { id: parseInt(id) }
    });

    if (!existingWorkExperience) {
      return res.status(404).json({
        success: false,
        error: 'Work experience not found'
      });
    }

    await prisma.workExperience.delete({
      where: { id: parseInt(id) }
    });

    res.json({
      success: true,
      message: 'Work experience deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting work experience:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete work experience'
    });
  }
});

module.exports = router;
