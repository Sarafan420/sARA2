const express = require('express');
const { body, validationResult } = require('express-validator');
const { PrismaClient } = require('@prisma/client');
const { authenticateToken } = require('../middleware/auth');

const prisma = new PrismaClient();
const router = express.Router();

// Apply for vacancy
router.post('/', authenticateToken, [
  body('vacancyId').isInt({ min: 1 }).withMessage('Valid vacancy ID required'),
  body('coverLetter').optional().trim().isLength({ max: 1000 }).withMessage('Cover letter too long')
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

    const { vacancyId, coverLetter } = req.body;

    // Check if vacancy exists
    const vacancy = await prisma.vacancy.findUnique({
      where: { id: vacancyId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    if (!vacancy) {
      return res.status(404).json({
        success: false,
        error: 'Vacancy not found'
      });
    }

    // Check if user already applied
    const existingApplication = await prisma.application.findUnique({
      where: {
        userId_vacancyId: {
          userId: req.user.id,
          vacancyId: vacancyId
        }
      }
    });

    if (existingApplication) {
      return res.status(409).json({
        success: false,
        error: 'Already applied',
        message: 'You have already applied for this vacancy'
      });
    }

    // Create application
    const application = await prisma.application.create({
      data: {
        userId: req.user.id,
        vacancyId: vacancyId,
        coverLetter,
        status: 'pending'
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            position: true,
            company: true,
            avatarUrl: true
          }
        },
        vacancy: {
          select: {
            id: true,
            title: true,
            company: true
          }
        }
      }
    });

    // Create notification for vacancy owner
    await prisma.notification.create({
      data: {
        userId: vacancy.userId,
        title: 'Новый отклик на вакансию',
        message: `${req.user.name} откликнулся на вакансию "${vacancy.title}"`,
        type: 'info'
      }
    });

    res.status(201).json({
      success: true,
      message: 'Application submitted successfully',
      application
    });

  } catch (error) {
    console.error('Apply for vacancy error:', error);
    res.status(500).json({
      success: false,
      error: 'Unable to submit application'
    });
  }
});

// Get user's applications
router.get('/my', authenticateToken, async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const where = { userId: req.user.id };
    if (status) {
      where.status = status;
    }

    const [applications, total] = await Promise.all([
      prisma.application.findMany({
        where,
        include: {
          vacancy: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  company: true,
                  avatarUrl: true
                }
              }
            }
          }
        },
        skip,
        take: parseInt(limit),
        orderBy: { createdAt: 'desc' }
      }),
      prisma.application.count({ where })
    ]);

    res.json({
      success: true,
      applications,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });

  } catch (error) {
    console.error('Get applications error:', error);
    res.status(500).json({
      success: false,
      error: 'Unable to fetch applications'
    });
  }
});

// Get applications for user's vacancies
router.get('/received', authenticateToken, async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Get user's vacancy IDs
    const userVacancies = await prisma.vacancy.findMany({
      where: { userId: req.user.id },
      select: { id: true }
    });

    const vacancyIds = userVacancies.map(v => v.id);

    if (vacancyIds.length === 0) {
      return res.json({
        success: true,
        applications: [],
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: 0,
          pages: 0
        }
      });
    }

    const where = { vacancyId: { in: vacancyIds } };
    if (status) {
      where.status = status;
    }

    const [applications, total] = await Promise.all([
      prisma.application.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              position: true,
              company: true,
              avatarUrl: true,
              phone: true
            }
          },
          vacancy: {
            select: {
              id: true,
              title: true,
              company: true
            }
          }
        },
        skip,
        take: parseInt(limit),
        orderBy: { createdAt: 'desc' }
      }),
      prisma.application.count({ where })
    ]);

    res.json({
      success: true,
      applications,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });

  } catch (error) {
    console.error('Get received applications error:', error);
    res.status(500).json({
      success: false,
      error: 'Unable to fetch received applications'
    });
  }
});

// Get applications for specific vacancy (for vacancy owner)
router.get('/vacancy/:vacancyId', authenticateToken, async (req, res) => {
  try {
    const vacancyId = parseInt(req.params.vacancyId);
    const { status, page = 1, limit = 20 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    if (isNaN(vacancyId)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid vacancy ID'
      });
    }

    // Check if vacancy exists and user owns it
    const vacancy = await prisma.vacancy.findUnique({
      where: { id: vacancyId },
      select: { id: true, userId: true, title: true, company: true }
    });

    if (!vacancy) {
      return res.status(404).json({
        success: false,
        error: 'Vacancy not found'
      });
    }

    if (vacancy.userId !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: 'Forbidden',
        message: 'You can only view applications for your own vacancies'
      });
    }

    const where = { vacancyId };
    if (status) {
      where.status = status;
    }

    const [applications, total] = await Promise.all([
      prisma.application.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              position: true,
              company: true,
              avatarUrl: true,
              phone: true
            }
          }
        },
        skip,
        take: parseInt(limit),
        orderBy: { createdAt: 'desc' }
      }),
      prisma.application.count({ where })
    ]);

    res.json({
      success: true,
      applications,
      vacancy: {
        id: vacancy.id,
        title: vacancy.title,
        company: vacancy.company
      },
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });

  } catch (error) {
    console.error('Get vacancy applications error:', error);
    res.status(500).json({
      success: false,
      error: 'Unable to fetch vacancy applications'
    });
  }
});

// Update application status (for vacancy owners)
router.put('/:id/status', authenticateToken, [
  body('status').isIn(['pending', 'reviewed', 'accepted', 'rejected']).withMessage('Invalid status')
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

    const applicationId = parseInt(req.params.id);
    const { status } = req.body;

    if (isNaN(applicationId)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid application ID'
      });
    }

    // Find the application
    const application = await prisma.application.findUnique({
      where: { id: applicationId },
      include: {
        vacancy: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    if (!application) {
      return res.status(404).json({
        success: false,
        error: 'Application not found'
      });
    }

    // Check if user owns the vacancy
    if (application.vacancy.userId !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: 'Forbidden',
        message: 'You can only update applications for your own vacancies'
      });
    }

    // Update application status
    const updatedApplication = await prisma.application.update({
      where: { id: applicationId },
      data: { status },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            position: true,
            company: true,
            avatarUrl: true
          }
        },
        vacancy: {
          select: {
            id: true,
            title: true,
            company: true
          }
        }
      }
    });

    // Create notification for applicant
    const statusMessages = {
      'reviewed': 'Ваш отклик рассмотрен',
      'accepted': 'Поздравляем! Ваш отклик принят',
      'rejected': 'К сожалению, ваш отклик отклонен'
    };

    if (statusMessages[status]) {
      await prisma.notification.create({
        data: {
          userId: application.userId,
          title: statusMessages[status],
          message: `Статус вашего отклика на вакансию "${application.vacancy.title}" изменен на "${status}"`,
          type: status === 'accepted' ? 'success' : status === 'rejected' ? 'error' : 'info'
        }
      });
    }

    res.json({
      success: true,
      message: 'Application status updated successfully',
      application: updatedApplication
    });

  } catch (error) {
    console.error('Update application status error:', error);
    res.status(500).json({
      success: false,
      error: 'Unable to update application status'
    });
  }
});

// Delete application
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const applicationId = parseInt(req.params.id);
    
    if (isNaN(applicationId)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid application ID'
      });
    }

    // Find the application
    const application = await prisma.application.findUnique({
      where: { id: applicationId }
    });

    if (!application) {
      return res.status(404).json({
        success: false,
        error: 'Application not found'
      });
    }

    // Check if user owns the application
    if (application.userId !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: 'Forbidden',
        message: 'You can only delete your own applications'
      });
    }

    // Delete the application
    await prisma.application.delete({
      where: { id: applicationId }
    });

    res.json({
      success: true,
      message: 'Application deleted successfully'
    });

  } catch (error) {
    console.error('Delete application error:', error);
    res.status(500).json({
      success: false,
      error: 'Unable to delete application'
    });
  }
});

module.exports = router;
