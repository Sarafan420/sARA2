const express = require('express');
const { body, validationResult } = require('express-validator');
const { PrismaClient } = require('@prisma/client');
const { authenticateToken, optionalAuth } = require('../middleware/auth');

const prisma = new PrismaClient();
const router = express.Router();

// Get all vacancies (show all vacancies to all users)
router.get('/', optionalAuth, async (req, res) => {
  try {
    const { 
      offset = 0,
      limit = 20,
      search, 
      location, 
      company, 
      type, 
      experienceLevel,
      salaryMin,
      salaryMax
    } = req.query;

    const where = {};
    
    // Показываем все вакансии для всех пользователей
    // Фильтрация по типу рекрутера теперь происходит на фронтенде
    
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { company: { contains: search, mode: 'insensitive' } }
      ];
    }
    
    if (location) {
      where.location = { contains: location, mode: 'insensitive' };
    }
    
    if (company) {
      where.company = { contains: company, mode: 'insensitive' };
    }
    
    if (type) {
      where.type = type;
    }
    
    if (experienceLevel) {
      where.experienceLevel = experienceLevel;
    }
    
    if (salaryMin) {
      where.salaryMax = { gte: parseInt(salaryMin) };
    }
    
    if (salaryMax) {
      where.salaryMin = { lte: parseInt(salaryMax) };
    }

    // Получаем все вакансии для правильной сортировки по связям
    const allVacancies = await prisma.vacancy.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            avatarUrl: true,
            company: true
          }
        },
        vacancyType: true,
        workFormat: true,
        workingStyle: true,
        vacancyFields: {
          include: {
            field: true
          }
        },
        vacancySkills: {
          include: {
            skill: true
          }
        },
        vacancyOffers: {
          include: {
            offer: true
          }
        },
        vacancyParticipants: {
          include: {
            participantReceive: true
          }
        },
        photos: {
          orderBy: { order: 'asc' }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    // Если пользователь авторизован, сортируем по приоритету связей
    let sortedVacancies = allVacancies;
    if (req.user) {
      // Получаем ID друзей
      const friendships = await prisma.friendship.findMany({
        where: {
          OR: [
            { userId: req.user.id, status: 'accepted' },
            { friendId: req.user.id, status: 'accepted' }
          ]
        }
      });
      const friendIds = new Set();
      friendships.forEach(f => {
        const friendId = f.userId === req.user.id ? f.friendId : f.userId;
        friendIds.add(friendId);
      });

      // Получаем ID связей второго уровня
      const connections = await prisma.connection.findMany({
        where: {
          userId: req.user.id
        }
      });
      const connectionIds = new Set(connections.map(c => c.connectedUserId));

      // Сортируем: сначала друзья, затем связи, затем остальные
      sortedVacancies = allVacancies.sort((a, b) => {
        const aIsFriend = friendIds.has(a.userId);
        const bIsFriend = friendIds.has(b.userId);
        const aIsConnection = connectionIds.has(a.userId) && !aIsFriend;
        const bIsConnection = connectionIds.has(b.userId) && !bIsFriend;

        // Приоритет 1: друзья
        if (aIsFriend && !bIsFriend) return -1;
        if (!aIsFriend && bIsFriend) return 1;
        
        // Приоритет 2: связи (если оба не друзья)
        if (!aIsFriend && !bIsFriend) {
          if (aIsConnection && !bIsConnection) return -1;
          if (!aIsConnection && bIsConnection) return 1;
        }

        // Приоритет 3: по дате создания (новые сначала)
        return new Date(b.createdAt) - new Date(a.createdAt);
      });
    }

    // Применяем пагинацию после сортировки
    const totalCount = sortedVacancies.length;
    const skip = parseInt(offset);
    const take = parseInt(limit);
    const vacancies = sortedVacancies.slice(skip, skip + take);

    const vacanciesWithParsedData = await Promise.all(vacancies.map(async vacancy => {
      // Построение connectionInfo для каждой вакансии
      let connectionInfo = null;
      
      if (req.user && vacancy.userId !== req.user.id) {
        // Проверяем, является ли рекрутер прямым другом
        const directFriendship = await prisma.friendship.findFirst({
          where: {
            OR: [
              { userId: req.user.id, friendId: vacancy.userId, status: 'accepted' },
              { userId: vacancy.userId, friendId: req.user.id, status: 'accepted' }
            ]
          }
        });

        if (directFriendship) {
          connectionInfo = { isDirectConnection: true, mutualConnections: [] };
        } else {
          // Проверяем, есть ли connection (связь второго уровня)
          const connection = await prisma.connection.findFirst({
            where: {
              userId: req.user.id,
              connectedUserId: vacancy.userId
            },
            include: {
              mutualFriend: {
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

          if (connection) {
            connectionInfo = { 
              isDirectConnection: false, 
              mutualConnections: [connection.mutualFriend] 
            };
          } else {
            // Ищем общих друзей через friendships
            const userFriendships = await prisma.friendship.findMany({
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
                    position: true,
                    company: true,
                    avatarUrl: true
                  }
                },
                friend: {
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

            const mutualFriends = [];
            const addedUserIds = new Set();

            for (const friendship of userFriendships) {
              const mutualUserId = friendship.userId === req.user.id ? friendship.friendId : friendship.userId;
              if (mutualUserId === vacancy.userId) continue;
              if (addedUserIds.has(mutualUserId)) continue;

              // Проверяем, является ли этот пользователь другом рекрутера
              const mutualFriendship = await prisma.friendship.findFirst({
                where: {
                  OR: [
                    { userId: mutualUserId, friendId: vacancy.userId, status: 'accepted' },
                    { userId: vacancy.userId, friendId: mutualUserId, status: 'accepted' }
                  ]
                }
              });

              if (mutualFriendship) {
                const mutualUser = friendship.userId === req.user.id ? friendship.friend : friendship.user;
                mutualFriends.push({
                  id: mutualUser.id,
                  name: mutualUser.name,
                  position: mutualUser.position,
                  company: mutualUser.company,
                  avatarUrl: mutualUser.avatarUrl
                });
                addedUserIds.add(mutualUserId);
              }
            }

            if (mutualFriends.length > 0) {
              connectionInfo = { isDirectConnection: false, mutualConnections: mutualFriends.slice(0, 3) };
            }
          }
        }
      }

      const result = {
        ...vacancy,
        skillsRequired: JSON.parse(vacancy.skillsRequired || '[]'),
        acquiredSkills: JSON.parse(vacancy.acquiredSkills || '[]'),
        fields: vacancy.vacancyFields?.map(vf => vf.field) || [],
        skills: vacancy.vacancySkills?.map(vs => vs.skill) || [],
        offers: vacancy.vacancyOffers?.map(vo => vo.offer) || [],
        participantReceives: vacancy.vacancyParticipants?.map(vp => vp.participantReceive) || [],
        connectionInfo
      };

      return result;
    }));

    res.json({
      success: true,
      vacancies: vacanciesWithParsedData,
      total: totalCount,
      hasMore: skip + take < totalCount
    });

  } catch (error) {
    console.error('Get vacancies error:', error);
    res.status(500).json({
      success: false,
      error: 'Unable to fetch vacancies'
    });
  }
});

// Get vacancies by user ID
router.get('/user/:userId', optionalAuth, async (req, res) => {
  try {
    const userId = parseInt(req.params.userId);
    
    if (isNaN(userId)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid user ID'
      });
    }

    const vacancies = await prisma.vacancy.findMany({
      where: { userId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            avatarUrl: true,
            company: true
          }
        },
        vacancyType: true,
        workFormat: true,
        workingStyle: true,
        vacancyFields: {
          include: {
            field: true
          }
        },
        vacancySkills: {
          include: {
            skill: true
          }
        },
        vacancyOffers: {
          include: {
            offer: true
          }
        },
        vacancyParticipants: {
          include: {
            participantReceive: true
          }
        },
        photos: {
          orderBy: { order: 'asc' }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json({
      success: true,
      vacancies: vacancies.map(vacancy => ({
        ...vacancy,
        skillsRequired: JSON.parse(vacancy.skillsRequired || '[]'),
        acquiredSkills: JSON.parse(vacancy.acquiredSkills || '[]'),
        fields: vacancy.vacancyFields?.map(vf => vf.field) || [],
        skills: vacancy.vacancySkills?.map(vs => vs.skill) || [],
        offers: vacancy.vacancyOffers?.map(vo => vo.offer) || [],
        participantReceives: vacancy.vacancyParticipants?.map(vp => vp.participantReceive) || []
      }))
    });

  } catch (error) {
    console.error('Get user vacancies error:', error);
    res.status(500).json({
      success: false,
      error: 'Unable to fetch user vacancies'
    });
  }
});

// Get vacancy by ID
router.get('/:id', optionalAuth, async (req, res) => {
  try {
    const vacancyId = parseInt(req.params.id);
    
    if (isNaN(vacancyId)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid vacancy ID'
      });
    }

    const vacancy = await prisma.vacancy.findUnique({
      where: { id: vacancyId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            avatarUrl: true,
            company: true,
            position: true
          }
        },
        vacancyType: true,
        workFormat: true,
        workingStyle: true,
        vacancyFields: {
          include: {
            field: true
          }
        },
        vacancySkills: {
          include: {
            skill: true
          }
        },
        vacancyOffers: {
          include: {
            offer: true
          }
        },
        vacancyParticipants: {
          include: {
            participantReceive: true
          }
        },
        photos: {
          orderBy: { order: 'asc' }
        },
        applications: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                avatarUrl: true,
                position: true,
                company: true
              }
            }
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

    // Построение connectionInfo: прямой друг или через общих друзей
    let connectionInfo = null;
    if (req.user && vacancy.userId !== req.user.id) {
      // Проверяем, является ли рекрутер прямым другом
      const directFriendship = await prisma.friendship.findFirst({
        where: {
          OR: [
            { userId: req.user.id, friendId: vacancy.userId, status: 'accepted' },
            { userId: vacancy.userId, friendId: req.user.id, status: 'accepted' }
          ]
        }
      });

      const isDirectConnection = !!directFriendship;

      let mutualConnections = [];
      if (!isDirectConnection) {
        // Проверяем, есть ли connection (связь второго уровня)
        const connection = await prisma.connection.findFirst({
          where: {
            userId: req.user.id,
            connectedUserId: vacancy.userId
          },
          include: {
            mutualFriend: {
              select: {
                id: true,
                name: true,
                avatarUrl: true,
                position: true,
                company: true
              }
            }
          }
        });

        if (connection) {
          mutualConnections = [connection.mutualFriend];
        } else {
          // Ищем общих друзей через friendships
          const userFriendships = await prisma.friendship.findMany({
            where: {
              OR: [
                { userId: req.user.id, status: 'accepted' },
                { friendId: req.user.id, status: 'accepted' }
              ]
            }
          });

          const friendIds = userFriendships.map(f => 
            f.userId === req.user.id ? f.friendId : f.userId
          );

          if (friendIds.length > 0) {
            // Находим друзей пользователя, у которых есть дружба с рекрутером
            const mutualFriendships = await prisma.friendship.findMany({
              where: {
                status: 'accepted',
                OR: [
                  { userId: { in: friendIds }, friendId: vacancy.userId },
                  { friendId: { in: friendIds }, userId: vacancy.userId }
                ]
              }
            });

            const mutualFriendIdsSet = new Set();
            mutualFriendships.forEach(f => {
              if (friendIds.includes(f.userId) && f.friendId === vacancy.userId) {
                mutualFriendIdsSet.add(f.userId);
              }
              if (friendIds.includes(f.friendId) && f.userId === vacancy.userId) {
                mutualFriendIdsSet.add(f.friendId);
              }
            });

            const mutualFriendIds = Array.from(mutualFriendIdsSet);
            if (mutualFriendIds.length > 0) {
              const mutualUsers = await prisma.user.findMany({
                where: { id: { in: mutualFriendIds } },
                select: {
                  id: true,
                  name: true,
                  avatarUrl: true,
                  position: true,
                  company: true
                }
              });
              mutualConnections = mutualUsers;
            }
          }
        }
      }

      connectionInfo = {
        isDirectConnection,
        mutualConnections
      };
    }

    res.json({
      success: true,
      vacancy: {
        ...vacancy,
        skillsRequired: JSON.parse(vacancy.skillsRequired || '[]'),
        acquiredSkills: JSON.parse(vacancy.acquiredSkills || '[]'),
        fields: vacancy.vacancyFields?.map(vf => vf.field) || [],
        skills: vacancy.vacancySkills?.map(vs => vs.skill) || [],
        offers: vacancy.vacancyOffers?.map(vo => vo.offer) || [],
        participantReceives: vacancy.vacancyParticipants?.map(vp => vp.participantReceive) || [],
        connectionInfo
      }
    });

  } catch (error) {
    console.error('Get vacancy error:', error);
    res.status(500).json({
      success: false,
      error: 'Unable to fetch vacancy'
    });
  }
});

// Create new vacancy
router.post('/', authenticateToken, [
  body('title').trim().isLength({ min: 3, max: 200 }).withMessage('Title must be 3-200 characters'),
  body('company').trim().isLength({ min: 2, max: 100 }).withMessage('Company must be 2-100 characters'),
  body('description').optional().trim().isLength({ max: 2000 }).withMessage('Description too long'),
  body('requirements').optional().trim().isLength({ max: 1000 }).withMessage('Requirements too long'),
  body('salaryMin').optional().isInt({ min: 0 }).withMessage('Invalid minimum salary'),
  body('salaryMax').optional().isInt({ min: 0 }).withMessage('Invalid maximum salary'),
  body('location').optional().trim().isLength({ max: 100 }).withMessage('Location too long'),
  body('type').optional().isIn(['Полный день', 'Частичная занятость', 'Удаленно']).withMessage('Invalid job type'),
  body('experienceLevel').optional().isIn(['Junior', 'Middle', 'Senior']).withMessage('Invalid experience level'),
  body('skillsRequired').optional().isArray().withMessage('Skills must be an array')
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
      title,
      company,
      companyLogo,
      description,
      requirements,
      salaryMin,
      salaryMax,
      location,
      type,
      experienceLevel,
      skillsRequired
    } = req.body;

    const vacancy = await prisma.vacancy.create({
      data: {
        title,
        company,
        companyLogo,
        description,
        requirements,
        salaryMin: salaryMin ? parseInt(salaryMin) : null,
        salaryMax: salaryMax ? parseInt(salaryMax) : null,
        location,
        type,
        experienceLevel,
        skillsRequired: JSON.stringify(skillsRequired || []),
        userId: req.user.id
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            avatarUrl: true,
            company: true
          }
        }
      }
    });

    res.status(201).json({
      success: true,
      message: 'Vacancy created successfully',
      vacancy: {
        ...vacancy,
        skillsRequired: JSON.parse(vacancy.skillsRequired || '[]')
      }
    });

  } catch (error) {
    console.error('Create vacancy error:', error);
    res.status(500).json({
      success: false,
      error: 'Unable to create vacancy'
    });
  }
});

// Update vacancy
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const vacancyId = parseInt(req.params.id);
    
    if (isNaN(vacancyId)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid vacancy ID'
      });
    }

    // Check if vacancy exists and user owns it
    const existingVacancy = await prisma.vacancy.findUnique({
      where: { id: vacancyId }
    });

    if (!existingVacancy) {
      return res.status(404).json({
        success: false,
        error: 'Vacancy not found'
      });
    }

    if (existingVacancy.userId !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: 'Forbidden',
        message: 'You can only update your own vacancies'
      });
    }

    const {
      title,
      company,
      companyLogo,
      description,
      requirements,
      salaryMin,
      salaryMax,
      location,
      type,
      experienceLevel,
      skillsRequired
    } = req.body;

    const updateData = {};
    
    if (title !== undefined) updateData.title = title;
    if (company !== undefined) updateData.company = company;
    if (companyLogo !== undefined) updateData.companyLogo = companyLogo;
    if (description !== undefined) updateData.description = description;
    if (requirements !== undefined) updateData.requirements = requirements;
    if (salaryMin !== undefined) updateData.salaryMin = salaryMin ? parseInt(salaryMin) : null;
    if (salaryMax !== undefined) updateData.salaryMax = salaryMax ? parseInt(salaryMax) : null;
    if (location !== undefined) updateData.location = location;
    if (type !== undefined) updateData.type = type;
    if (experienceLevel !== undefined) updateData.experienceLevel = experienceLevel;
    if (skillsRequired !== undefined) updateData.skillsRequired = JSON.stringify(skillsRequired);

    const updatedVacancy = await prisma.vacancy.update({
      where: { id: vacancyId },
      data: updateData,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            avatarUrl: true,
            company: true
          }
        }
      }
    });

    res.json({
      success: true,
      message: 'Vacancy updated successfully',
      vacancy: {
        ...updatedVacancy,
        skillsRequired: JSON.parse(updatedVacancy.skillsRequired || '[]')
      }
    });

  } catch (error) {
    console.error('Update vacancy error:', error);
    res.status(500).json({
      success: false,
      error: 'Unable to update vacancy'
    });
  }
});

// Delete vacancy
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const vacancyId = parseInt(req.params.id);
    
    if (isNaN(vacancyId)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid vacancy ID'
      });
    }

    // Check if vacancy exists and user owns it
    const existingVacancy = await prisma.vacancy.findUnique({
      where: { id: vacancyId }
    });

    if (!existingVacancy) {
      return res.status(404).json({
        success: false,
        error: 'Vacancy not found'
      });
    }

    if (existingVacancy.userId !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: 'Forbidden',
        message: 'You can only delete your own vacancies'
      });
    }

    await prisma.vacancy.delete({
      where: { id: vacancyId }
    });

    res.json({
      success: true,
      message: 'Vacancy deleted successfully'
    });

  } catch (error) {
    console.error('Delete vacancy error:', error);
    res.status(500).json({
      success: false,
      error: 'Unable to delete vacancy'
    });
  }
});

// Get reference data for vacancy creation
router.get('/reference-data', async (req, res) => {
  try {
    const [vacancyTypes, fields, skills, workFormats, workingStyles, offers, participantReceives] = await Promise.all([
      prisma.vacancyType.findMany({ orderBy: { name: 'asc' } }),
      prisma.field.findMany({ orderBy: { name: 'asc' } }),
      prisma.skill.findMany({ orderBy: { name: 'asc' } }),
      prisma.workFormat.findMany({ orderBy: { name: 'asc' } }),
      prisma.workingStyle.findMany({ orderBy: { name: 'asc' } }),
      prisma.offer.findMany({ orderBy: { name: 'asc' } }),
      prisma.participantReceive.findMany({ orderBy: { name: 'asc' } })
    ]);

    res.json({
      success: true,
      data: {
        vacancyTypes,
        fields,
        skills,
        workFormats,
        workingStyles,
        offers,
        participantReceives
      }
    });

  } catch (error) {
    console.error('Get reference data error:', error);
    res.status(500).json({
      success: false,
      error: 'Unable to fetch reference data'
    });
  }
});

module.exports = router;
