const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authenticateToken } = require('../middleware/auth');

const prisma = new PrismaClient();
const router = express.Router();

// Вспомогательная функция для автоматического добавления connections при создании/принятии дружбы
async function updateConnectionsForNewFriendship(userId1, userId2) {
  try {
    // Находим всех друзей пользователя userId1 (кроме userId2)
    const user1Friends = await prisma.friendship.findMany({
      where: {
        OR: [
          { userId: userId1, status: 'accepted' },
          { friendId: userId1, status: 'accepted' }
        ],
        NOT: {
          OR: [
            { userId: userId2 },
            { friendId: userId2 }
          ]
        }
      }
    });

    // Находим всех друзей пользователя userId2 (кроме userId1)
    const user2Friends = await prisma.friendship.findMany({
      where: {
        OR: [
          { userId: userId2, status: 'accepted' },
          { friendId: userId2, status: 'accepted' }
        ],
        NOT: {
          OR: [
            { userId: userId1 },
            { friendId: userId1 }
          ]
        }
      }
    });

    // Получаем ID друзей userId1
    const user1FriendIds = new Set();
    user1Friends.forEach(f => {
      const friendId = f.userId === userId1 ? f.friendId : f.userId;
      user1FriendIds.add(friendId);
    });

    // Получаем ID друзей userId2
    const user2FriendIds = new Set();
    user2Friends.forEach(f => {
      const friendId = f.userId === userId2 ? f.friendId : f.userId;
      user2FriendIds.add(friendId);
    });

    // Добавляем друзей userId2 в connections для userId1 (через userId2 как mutual friend)
    for (const friendId2 of user2FriendIds) {
      // Проверяем, что это не прямой друг userId1
      if (!user1FriendIds.has(friendId2) && friendId2 !== userId1) {
        // Проверяем, что connection еще не существует
        const existingConnection = await prisma.connection.findFirst({
          where: {
            userId: userId1,
            connectedUserId: friendId2,
            mutualFriendId: userId2
          }
        });

        if (!existingConnection) {
          await prisma.connection.create({
            data: {
              userId: userId1,
              connectedUserId: friendId2,
              mutualFriendId: userId2
            }
          });
        }
      }
    }

    // Добавляем друзей userId1 в connections для userId2 (через userId1 как mutual friend)
    for (const friendId1 of user1FriendIds) {
      // Проверяем, что это не прямой друг userId2
      if (!user2FriendIds.has(friendId1) && friendId1 !== userId2) {
        // Проверяем, что connection еще не существует
        const existingConnection = await prisma.connection.findFirst({
          where: {
            userId: userId2,
            connectedUserId: friendId1,
            mutualFriendId: userId1
          }
        });

        if (!existingConnection) {
          await prisma.connection.create({
            data: {
              userId: userId2,
              connectedUserId: friendId1,
              mutualFriendId: userId1
            }
          });
        }
      }
    }

    // Обновляем connections для всех друзей userId1 и userId2
    // Если у друга userId1 есть дружба с userId2, то друзья userId2 должны быть в connections друга userId1
    for (const friendId1 of user1FriendIds) {
      // Проверяем, есть ли у друга userId1 дружба с userId2
      const friendshipWithUser2 = await prisma.friendship.findFirst({
        where: {
          OR: [
            { userId: friendId1, friendId: userId2, status: 'accepted' },
            { userId: userId2, friendId: friendId1, status: 'accepted' }
          ]
        }
      });

      if (friendshipWithUser2) {
        // Добавляем друзей userId2 в connections для друга userId1 (через userId2)
        for (const friendId2 of user2FriendIds) {
          if (friendId2 !== friendId1 && friendId2 !== userId1) {
            const existingConnection = await prisma.connection.findFirst({
              where: {
                userId: friendId1,
                connectedUserId: friendId2,
                mutualFriendId: userId2
              }
            });

            if (!existingConnection) {
              await prisma.connection.create({
                data: {
                  userId: friendId1,
                  connectedUserId: friendId2,
                  mutualFriendId: userId2
                }
              });
            }
          }
        }
      }
    }

    // Аналогично для друзей userId2
    for (const friendId2 of user2FriendIds) {
      // Проверяем, есть ли у друга userId2 дружба с userId1
      const friendshipWithUser1 = await prisma.friendship.findFirst({
        where: {
          OR: [
            { userId: friendId2, friendId: userId1, status: 'accepted' },
            { userId: userId1, friendId: friendId2, status: 'accepted' }
          ]
        }
      });

      if (friendshipWithUser1) {
        // Добавляем друзей userId1 в connections для друга userId2 (через userId1)
        for (const friendId1 of user1FriendIds) {
          if (friendId1 !== friendId2 && friendId1 !== userId2) {
            const existingConnection = await prisma.connection.findFirst({
              where: {
                userId: friendId2,
                connectedUserId: friendId1,
                mutualFriendId: userId1
              }
            });

            if (!existingConnection) {
              await prisma.connection.create({
                data: {
                  userId: friendId2,
                  connectedUserId: friendId1,
                  mutualFriendId: userId1
                }
              });
            }
          }
        }
      }
    }
  } catch (error) {
    console.error('Error updating connections for new friendship:', error);
    // Не прерываем выполнение, если произошла ошибка при обновлении connections
  }
}

// Send friendship request (alias for /send)
router.post('/request', authenticateToken, async (req, res) => {
  // Forward to the main send endpoint
  req.url = '/send';
  return router.handle(req, res);
});

// Send friendship request
router.post('/send', authenticateToken, async (req, res) => {
  try {
    // Поддерживаем оба варианта: connectedUserId и userId (для обратной совместимости)
    const { connectedUserId, userId } = req.body;
    const targetUserIdParam = connectedUserId || userId;
    
    if (!targetUserIdParam) {
      return res.status(400).json({
        success: false,
        error: 'User ID is required (use connectedUserId or userId)'
      });
    }

    const targetUserId = parseInt(targetUserIdParam);
    
    if (isNaN(targetUserId)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid user ID'
      });
    }

    if (req.user.id === targetUserId) {
      return res.status(400).json({
        success: false,
        error: 'Cannot connect to yourself'
      });
    }

    // Check if friendship already exists
    const existingFriendship = await prisma.friendship.findFirst({
      where: {
        OR: [
          { userId: req.user.id, friendId: targetUserId },
          { userId: targetUserId, friendId: req.user.id }
        ]
      }
    });

    if (existingFriendship) {
      return res.status(409).json({
        success: false,
        error: 'Friendship already exists',
        message: 'You already have a friendship request with this user'
      });
    }

    // Create friendship request
    const friendship = await prisma.friendship.create({
      data: {
        userId: req.user.id,
        friendId: targetUserId,
        status: 'pending'
      },
      include: {
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

    // Create notification for the target user
    await prisma.notification.create({
      data: {
        userId: targetUserId,
        title: 'Новое приглашение в друзья',
        message: `${req.user.name} хочет добавить вас в друзья`,
        type: 'info'
      }
    });

    res.status(201).json({
      success: true,
      message: 'Friendship request sent successfully',
      connection: friendship
    });

  } catch (error) {
    console.error('Send friendship error:', error);
    res.status(500).json({
      success: false,
      error: 'Unable to send friendship request'
    });
  }
});

// Accept friendship request
router.post('/accept/:id', authenticateToken, async (req, res) => {
  try {
    const friendshipId = parseInt(req.params.id);
    
    if (isNaN(friendshipId)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid friendship ID'
      });
    }

    // Find the friendship
    const friendship = await prisma.friendship.findUnique({
      where: { id: friendshipId },
      include: {
        user: {
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

    if (!friendship) {
      return res.status(404).json({
        success: false,
        error: 'Friendship request not found'
      });
    }

    if (friendship.friendId !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: 'Forbidden',
        message: 'You can only accept friendship requests sent to you'
      });
    }

    if (friendship.status !== 'pending') {
      return res.status(400).json({
        success: false,
        error: 'Invalid request',
        message: 'This friendship request has already been processed'
      });
    }

    // Accept the friendship
    const updatedFriendship = await prisma.friendship.update({
      where: { id: friendshipId },
      data: { status: 'accepted' },
      include: {
        user: {
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

    // Автоматически обновляем connections для обоих пользователей
    await updateConnectionsForNewFriendship(friendship.userId, friendship.friendId);

    // Create notification for the sender
    await prisma.notification.create({
      data: {
        userId: friendship.userId,
        title: 'Приглашение принято',
        message: `${req.user.name} принял ваше приглашение в друзья`,
        type: 'success'
      }
    });

    res.json({
      success: true,
      message: 'Friendship request accepted',
      connection: updatedFriendship
    });

  } catch (error) {
    console.error('Accept friendship error:', error);
    res.status(500).json({
      success: false,
      error: 'Unable to accept friendship request'
    });
  }
});

// Reject friendship request
router.post('/reject/:id', authenticateToken, async (req, res) => {
  try {
    const friendshipId = parseInt(req.params.id);
    
    if (isNaN(friendshipId)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid friendship ID'
      });
    }

    // Find the friendship
    const friendship = await prisma.friendship.findUnique({
      where: { id: friendshipId }
    });

    if (!friendship) {
      return res.status(404).json({
        success: false,
        error: 'Friendship request not found'
      });
    }

    if (friendship.friendId !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: 'Forbidden',
        message: 'You can only reject friendship requests sent to you'
      });
    }

    if (friendship.status !== 'pending') {
      return res.status(400).json({
        success: false,
        error: 'Invalid request',
        message: 'This friendship request has already been processed'
      });
    }

    // Reject the friendship
    await prisma.friendship.update({
      where: { id: friendshipId },
      data: { status: 'rejected' }
    });

    res.json({
      success: true,
      message: 'Friendship request rejected'
    });

  } catch (error) {
    console.error('Reject friendship error:', error);
    res.status(500).json({
      success: false,
      error: 'Unable to reject friendship request'
    });
  }
});

// Get user's friendships
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { status = 'accepted' } = req.query;

    console.log('Fetching friendships for user:', req.user.id, 'status:', status);

    const friendships = await prisma.friendship.findMany({
      where: {
        OR: [
          { userId: req.user.id },
          { friendId: req.user.id }
        ],
        status: status
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
      },
      orderBy: { createdAt: 'desc' }
    });

    // Transform friendships to show the friend
    const transformedFriendships = friendships.map(f => {
      const friend = f.userId === req.user.id ? f.friend : f.user;
      return {
        id: f.id,
        friend: {
          id: friend.id,
          name: friend.name,
          position: friend.position,
          company: friend.company,
          avatarUrl: friend.avatarUrl
        },
        status: f.status,
        createdAt: f.createdAt,
        isIncoming: f.friendId === req.user.id
      };
    });

    // Удаляем дубликаты на основе ID друга
    const uniqueFriendshipsMap = new Map();
    transformedFriendships.forEach(f => {
      const friendId = f.friend.id;
      if (!uniqueFriendshipsMap.has(friendId) || 
          new Date(f.createdAt) > new Date(uniqueFriendshipsMap.get(friendId).createdAt)) {
        uniqueFriendshipsMap.set(friendId, f);
      }
    });

    const uniqueFriendships = Array.from(uniqueFriendshipsMap.values());

    console.log('Found friendships:', uniqueFriendships.length);

    res.json({
      success: true,
      connections: uniqueFriendships
    });

  } catch (error) {
    console.error('Get friendships error:', error);
    res.status(500).json({
      success: false,
      error: 'Unable to fetch friendships'
    });
  }
});

// Get user's connections (second-level connections)
router.get('/connections', authenticateToken, async (req, res) => {
  try {
    const connections = await prisma.connection.findMany({
      where: {
        userId: req.user.id
      },
      include: {
        connectedUser: {
          select: {
            id: true,
            name: true,
            position: true,
            company: true,
            avatarUrl: true
          }
        },
        mutualFriend: {
          select: {
            id: true,
            name: true,
            avatarUrl: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json({
      success: true,
      connections: connections.map(c => ({
        id: c.id,
        user: c.connectedUser,
        mutualFriend: c.mutualFriend,
        createdAt: c.createdAt
      }))
    });

  } catch (error) {
    console.error('Get connections error:', error);
    res.status(500).json({
      success: false,
      error: 'Unable to fetch connections'
    });
  }
});

// Remove friendship
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const friendshipId = parseInt(req.params.id);
    
    if (isNaN(friendshipId)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid friendship ID'
      });
    }

    // Find the friendship
    const friendship = await prisma.friendship.findUnique({
      where: { id: friendshipId }
    });

    if (!friendship) {
      return res.status(404).json({
        success: false,
        error: 'Friendship not found'
      });
    }

    if (friendship.userId !== req.user.id && friendship.friendId !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: 'Forbidden',
        message: 'You can only remove your own friendships'
      });
    }

    // Delete the friendship
    await prisma.friendship.delete({
      where: { id: friendshipId }
    });

    // Удаляем связанные connections, где эта дружба была mutual friend
    const userId1 = friendship.userId;
    const userId2 = friendship.friendId;
    
    await prisma.connection.deleteMany({
      where: {
        OR: [
          { userId: userId1, mutualFriendId: userId2 },
          { userId: userId2, mutualFriendId: userId1 }
        ]
      }
    });

    res.json({
      success: true,
      message: 'Friendship removed successfully'
    });

  } catch (error) {
    console.error('Remove friendship error:', error);
    res.status(500).json({
      success: false,
      error: 'Unable to remove friendship'
    });
  }
});

// Bulk create friendships (for demo purposes)
router.post('/bulk-create', async (req, res) => {
  try {
    const { connections } = req.body;
    
    if (!Array.isArray(connections)) {
      return res.status(400).json({
        success: false,
        error: 'Connections must be an array'
      });
    }

    const createdFriendships = [];
    
    for (const conn of connections) {
      const { userId, connectedUserId, status = 'accepted' } = conn;
      
      if (!userId || !connectedUserId) {
        continue;
      }

      // Check if friendship already exists
      const existingFriendship = await prisma.friendship.findFirst({
        where: {
          OR: [
            { userId: parseInt(userId), friendId: parseInt(connectedUserId) },
            { userId: parseInt(connectedUserId), friendId: parseInt(userId) }
          ]
        }
      });

      if (!existingFriendship) {
        try {
          const friendship = await prisma.friendship.create({
            data: {
              userId: parseInt(userId),
              friendId: parseInt(connectedUserId),
              status
            }
          });
          createdFriendships.push(friendship);

          // Если дружба принята, обновляем connections
          if (status === 'accepted') {
            await updateConnectionsForNewFriendship(parseInt(userId), parseInt(connectedUserId));
          }
        } catch (error) {
          console.error(`Error creating friendship ${userId} -> ${connectedUserId}:`, error.message);
        }
      }
    }

    res.json({
      success: true,
      message: `Created ${createdFriendships.length} friendships`,
      connections: createdFriendships
    });

  } catch (error) {
    console.error('Bulk create friendships error:', error);
    res.status(500).json({
      success: false,
      error: 'Unable to create friendships'
    });
  }
});

// Get friendship statistics for a user
router.get('/stats/:userId', authenticateToken, async (req, res) => {
  try {
    const targetUserId = parseInt(req.params.userId);
    
    if (isNaN(targetUserId)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid user ID'
      });
    }

    // Get user's direct friends
    const directFriendships = await prisma.friendship.findMany({
      where: {
        OR: [
          { userId: targetUserId, status: 'accepted' },
          { friendId: targetUserId, status: 'accepted' }
        ]
      },
      include: {
        user: {
          select: { id: true }
        },
        friend: {
          select: { id: true }
        }
      }
    });

    // Get friend IDs (excluding the target user) with deduplication
    const friendIdsSet = new Set();
    directFriendships.forEach(f => {
      const friendId = f.userId === targetUserId ? f.friend.id : f.user.id;
      if (friendId !== targetUserId) {
        friendIdsSet.add(friendId);
      }
    });
    const friendIds = Array.from(friendIdsSet);

    // Get connections count
    const connectionsCount = await prisma.connection.count({
      where: {
        userId: targetUserId
      }
    });

    res.json({
      success: true,
      stats: {
        friendsCount: friendIds.length,
        connectionsCount: connectionsCount,
        totalConnections: friendIds.length + connectionsCount
      }
    });

  } catch (error) {
    console.error('Get friendship stats error:', error);
    res.status(500).json({
      success: false,
      error: 'Unable to get friendship statistics'
    });
  }
});

// Get connection path between two users
router.get('/path/:userId', authenticateToken, async (req, res) => {
  try {
    const targetUserId = parseInt(req.params.userId);
    
    if (isNaN(targetUserId)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid user ID'
      });
    }

    if (req.user.id === targetUserId) {
      return res.json({
        success: true,
        isDirectConnection: true,
        path: []
      });
    }

    // Check if direct friendship exists
    const directFriendship = await prisma.friendship.findFirst({
      where: {
        OR: [
          { userId: req.user.id, friendId: targetUserId, status: 'accepted' },
          { userId: targetUserId, friendId: req.user.id, status: 'accepted' }
        ]
      }
    });

    if (directFriendship) {
      return res.json({
        success: true,
        isDirectConnection: true,
        path: []
      });
    }

    // Check if there's a connection (second-level)
    const connection = await prisma.connection.findFirst({
      where: {
        userId: req.user.id,
        connectedUserId: targetUserId
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
      return res.json({
        success: true,
        isDirectConnection: false,
        mutualConnections: [connection.mutualFriend]
      });
    }

    // Find mutual friends
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
            avatarUrl: true,
            position: true,
            company: true
          }
        },
        friend: {
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

    // Check which mutual friends are also connected to target user
    const mutualFriends = [];
    for (const friendship of userFriendships) {
      const mutualUserId = friendship.userId === req.user.id ? friendship.friendId : friendship.userId;
      
      if (mutualUserId === targetUserId) continue;

      const mutualFriendship = await prisma.friendship.findFirst({
        where: {
          OR: [
            { userId: mutualUserId, friendId: targetUserId, status: 'accepted' },
            { userId: targetUserId, friendId: mutualUserId, status: 'accepted' }
          ]
        }
      });

      if (mutualFriendship) {
        const mutualUser = friendship.userId === req.user.id ? friendship.friend : friendship.user;
        mutualFriends.push({
          id: mutualUser.id,
          name: mutualUser.name,
          avatarUrl: mutualUser.avatarUrl,
          position: mutualUser.position,
          company: mutualUser.company
        });
      }
    }

    res.json({
      success: true,
      isDirectConnection: false,
      mutualConnections: mutualFriends.slice(0, 3) // Limit to 3 mutual connections
    });

  } catch (error) {
    console.error('Get connection path error:', error);
    res.status(500).json({
      success: false,
      error: 'Unable to get connection path'
    });
  }
});

// Get friends of friends
router.get('/friends-of-friends/:userId', authenticateToken, async (req, res) => {
  try {
    const currentUserId = parseInt(req.params.userId);
    
    if (isNaN(currentUserId)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid user ID'
      });
    }

    // Get direct friends of the current user
    const directFriendships = await prisma.friendship.findMany({
      where: {
        OR: [
          { userId: currentUserId, status: 'accepted' },
          { friendId: currentUserId, status: 'accepted' }
        ]
      },
      include: {
        user: {
          select: { id: true }
        },
        friend: {
          select: { id: true }
        }
      }
    });

    // Get friend IDs (excluding the current user)
    const friendIds = directFriendships.map(f => 
      f.userId === currentUserId ? f.friend.id : f.user.id
    );

    if (friendIds.length === 0) {
      return res.json({
        success: true,
        friendsOfFriends: []
      });
    }

    // Get connections (second-level connections)
    const connections = await prisma.connection.findMany({
      where: {
        userId: currentUserId
      },
      include: {
        connectedUser: {
          select: {
            id: true,
            name: true,
            position: true,
            company: true,
            avatarUrl: true
          }
        },
        mutualFriend: {
          select: {
            id: true,
            name: true,
            position: true
          }
        }
      }
    });

    // Group by mutual friend
    const friendsOfFriendsMap = new Map();

    for (const conn of connections) {
      const friendOfFriendId = conn.connectedUser.id;
      
      if (!friendsOfFriendsMap.has(friendOfFriendId)) {
        friendsOfFriendsMap.set(friendOfFriendId, {
          id: conn.connectedUser.id,
          name: conn.connectedUser.name,
          position: conn.connectedUser.position,
          company: conn.connectedUser.company,
          avatarUrl: conn.connectedUser.avatarUrl,
          mutualConnections: []
        });
      }

      const existingEntry = friendsOfFriendsMap.get(friendOfFriendId);
      if (!existingEntry.mutualConnections.find(mc => mc.id === conn.mutualFriend.id)) {
        existingEntry.mutualConnections.push({
          id: conn.mutualFriend.id,
          name: conn.mutualFriend.name,
          position: conn.mutualFriend.position
        });
      }
    }

    const friendsOfFriends = Array.from(friendsOfFriendsMap.values());

    res.json({
      success: true,
      friendsOfFriends
    });

  } catch (error) {
    console.error('Get friends of friends error:', error);
    res.status(500).json({
      success: false,
      error: 'Unable to get friends of friends'
    });
  }
});

// Get second-level connections
router.get('/second-level', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Get connections (second-level connections)
    const connections = await prisma.connection.findMany({
      where: {
        userId: userId
      },
      include: {
        connectedUser: {
          select: {
            id: true,
            name: true,
            position: true,
            company: true,
            avatarUrl: true
          }
        },
        mutualFriend: {
          select: {
            id: true,
            name: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json({
      success: true,
      secondLevelConnections: connections.map(c => ({
        id: c.connectedUser.id,
        name: c.connectedUser.name,
        position: c.connectedUser.position,
        company: c.connectedUser.company,
        avatarUrl: c.connectedUser.avatarUrl,
        mutualFriend: c.mutualFriend
      }))
    });
  } catch (error) {
    console.error('Error fetching second-level connections:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

module.exports = router;
