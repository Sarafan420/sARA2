const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

class Logger {
  // Логирование действий пользователя
  static async logUserAction(userId, actionType, actionData = {}, req = null) {
    try {
      const logData = {
        userId,
        actionType,
        actionData: JSON.stringify(actionData),
        ipAddress: req?.ip || req?.connection?.remoteAddress || null,
        userAgent: req?.get?.('User-Agent') || null,
        sessionId: req?.sessionID || null
      };

      await prisma.userLog.create({
        data: logData
      });
    } catch (error) {
      // Error logging user action
    }
  }

  // Логирование событий безопасности
  static async logSecurityEvent(userId, actionType, actionData = {}, success = false, req = null) {
    try {
      const logData = {
        userId: userId || null,
        actionType,
        actionData: JSON.stringify(actionData),
        ipAddress: req?.ip || req?.connection?.remoteAddress || 'unknown',
        userAgent: req?.get?.('User-Agent') || null,
        success
      };

      await prisma.securityLog.create({
        data: logData
      });
    } catch (error) {
      // Error logging security event
    }
  }

  // Логирование системных событий
  static async logSystemEvent(level, message, context = {}, service = null) {
    try {
      const logData = {
        level,
        message,
        context: JSON.stringify(context),
        service
      };

      await prisma.systemLog.create({
        data: logData
      });
    } catch (error) {
      // Error logging system event
    }
  }

  // Получение статистики логов
  static async getLogStats(startDate = null, endDate = null) {
    try {
      const where = {};
      if (startDate || endDate) {
        where.createdAt = {};
        if (startDate) where.createdAt.gte = new Date(startDate);
        if (endDate) where.createdAt.lte = new Date(endDate);
      }

      const [
        totalUserLogs,
        totalSecurityLogs,
        totalSystemLogs,
        userLogsByType,
        securityLogsByType,
        systemLogsByLevel
      ] = await Promise.all([
        prisma.userLog.count({ where }),
        prisma.securityLog.count({ where }),
        prisma.systemLog.count({ where }),
        prisma.userLog.groupBy({
          by: ['actionType'],
          where,
          _count: { actionType: true }
        }),
        prisma.securityLog.groupBy({
          by: ['actionType'],
          where,
          _count: { actionType: true }
        }),
        prisma.systemLog.groupBy({
          by: ['level'],
          where,
          _count: { level: true }
        })
      ]);

      return {
        totalUserLogs,
        totalSecurityLogs,
        totalSystemLogs,
        userLogsByType,
        securityLogsByType,
        systemLogsByLevel
      };
    } catch (error) {
      // Error getting log stats
      return null;
    }
  }

  // Получение логов пользователя
  static async getUserLogs(userId, options = {}) {
    try {
      const {
        page = 1,
        limit = 50,
        actionType = null,
        startDate = null,
        endDate = null
      } = options;

      const where = { userId: parseInt(userId) };

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

      return {
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
      };
    } catch (error) {
      // Error getting user logs
      return null;
    }
  }

  // Получение логов безопасности
  static async getSecurityLogs(options = {}) {
    try {
      const {
        page = 1,
        limit = 50,
        actionType = null,
        success = null,
        startDate = null,
        endDate = null
      } = options;

      const where = {};

      if (actionType) {
        where.actionType = actionType;
      }

      if (success !== null) {
        where.success = success;
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

      return {
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
      };
    } catch (error) {
      // Error getting security logs
      return null;
    }
  }

  // Очистка старых логов (для автоматического архивирования)
  static async cleanupOldLogs(daysToKeep = 180) {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

      const [deletedUserLogs, deletedSecurityLogs, deletedSystemLogs] = await Promise.all([
        prisma.userLog.deleteMany({
          where: {
            createdAt: {
              lt: cutoffDate
            }
          }
        }),
        prisma.securityLog.deleteMany({
          where: {
            createdAt: {
              lt: cutoffDate
            }
          }
        }),
        prisma.systemLog.deleteMany({
          where: {
            createdAt: {
              lt: cutoffDate
            }
          }
        })
      ]);
      return {
        deletedUserLogs: deletedUserLogs.count,
        deletedSecurityLogs: deletedSecurityLogs.count,
        deletedSystemLogs: deletedSystemLogs.count
      };
    } catch (error) {
      // Error cleaning up old logs
      return null;
    }
  }
}

module.exports = Logger;
