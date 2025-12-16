const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

// Middleware для логирования действий пользователя
const logUserAction = async (req, res, next) => {
  try {
    if (req.user) {
      const logData = {
        userId: req.user.id,
        actionType: req.body.actionType || req.route?.path?.replace('/', '') || 'unknown',
        actionData: JSON.stringify(req.body.actionData || {}),
        ipAddress: req.ip || req.connection.remoteAddress,
        userAgent: req.get('User-Agent'),
        sessionId: req.sessionID || null
      };

      await prisma.userLog.create({
        data: logData
      });
    }
  } catch (error) {
    console.error('Error logging user action:', error);
  }
  next();
};

// Middleware для логирования безопасности
const logSecurityEvent = async (req, res, next) => {
  try {
    const logData = {
      userId: req.user?.id || null,
      actionType: req.body.actionType || 'security_event',
      actionData: JSON.stringify(req.body.actionData || {}),
      ipAddress: req.ip || req.connection.remoteAddress,
      userAgent: req.get('User-Agent'),
      success: req.body.success || false
    };

    await prisma.securityLog.create({
      data: logData
    });
  } catch (error) {
    console.error('Error logging security event:', error);
  }
  next();
};

// POST /api/logs/user - Логирование действий пользователя
router.post('/user', authenticateToken, logUserAction, async (req, res) => {
  try {
    res.json({ success: true, message: 'Action logged successfully' });
  } catch (error) {
    console.error('Error in user log endpoint:', error);
    res.status(500).json({ error: 'Failed to log user action' });
  }
});

// POST /api/logs/security - Логирование событий безопасности
router.post('/security', logSecurityEvent, async (req, res) => {
  try {
    res.json({ success: true, message: 'Security event logged successfully' });
  } catch (error) {
    console.error('Error in security log endpoint:', error);
    res.status(500).json({ error: 'Failed to log security event' });
  }
});

// GET /api/logs/user/:userId - Получение логов пользователя (только для админов)
router.get('/user/:userId', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 50, actionType, startDate, endDate } = req.query;

    // Проверяем права доступа (пока разрешаем всем авторизованным пользователям)
    // В будущем можно добавить проверку на роль администратора

    const where = {
      userId: parseInt(userId)
    };

    if (actionType) {
      where.actionType = actionType;
    }

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = new Date(startDate);
      if (endDate) where.createdAt.lte = new Date(endDate);
    }

    const logs = await prisma.userLog.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      skip: (page - 1) * limit,
      take: parseInt(limit)
    });

    const total = await prisma.userLog.count({ where });

    res.json({
      logs: logs.map(log => ({
        ...log,
        actionData: JSON.parse(log.actionData)
      })),
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching user logs:', error);
    res.status(500).json({ error: 'Failed to fetch user logs' });
  }
});

// GET /api/logs/security - Получение логов безопасности (только для админов)
router.get('/security', authenticateToken, async (req, res) => {
  try {
    const { page = 1, limit = 50, actionType, success, startDate, endDate } = req.query;

    const where = {};

    if (actionType) {
      where.actionType = actionType;
    }

    if (success !== undefined) {
      where.success = success === 'true';
    }

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = new Date(startDate);
      if (endDate) where.createdAt.lte = new Date(endDate);
    }

    const logs = await prisma.securityLog.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      skip: (page - 1) * limit,
      take: parseInt(limit)
    });

    const total = await prisma.securityLog.count({ where });

    res.json({
      logs: logs.map(log => ({
        ...log,
        actionData: JSON.parse(log.actionData)
      })),
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching security logs:', error);
    res.status(500).json({ error: 'Failed to fetch security logs' });
  }
});

// GET /api/logs/stats - Статистика по логам
router.get('/stats', authenticateToken, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    const where = {};
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = new Date(startDate);
      if (endDate) where.createdAt.lte = new Date(endDate);
    }

    const [
      totalUserLogs,
      totalSecurityLogs,
      userLogsByType,
      securityLogsByType,
      recentActivity
    ] = await Promise.all([
      prisma.userLog.count({ where }),
      prisma.securityLog.count({ where }),
      prisma.userLog.groupBy({
        by: ['actionType'],
        where,
        _count: {
          actionType: true
        }
      }),
      prisma.securityLog.groupBy({
        by: ['actionType'],
        where,
        _count: {
          actionType: true
        }
      }),
      prisma.userLog.findMany({
        where,
        include: {
          user: {
            select: {
              name: true,
              email: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        },
        take: 10
      })
    ]);

    res.json({
      stats: {
        totalUserLogs,
        totalSecurityLogs,
        userLogsByType,
        securityLogsByType,
        recentActivity: recentActivity.map(log => ({
          ...log,
          actionData: JSON.parse(log.actionData)
        }))
      }
    });
  } catch (error) {
    console.error('Error fetching log stats:', error);
    res.status(500).json({ error: 'Failed to fetch log statistics' });
  }
});

module.exports = router;
