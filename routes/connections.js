const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authenticateToken } = require('../middleware/auth');

const prisma = new PrismaClient();
const router = express.Router();

// Send connection request (alias for /send)
router.post('/request', authenticateToken, async (req, res) => {
  // Forward to the main send endpoint
  req.url = '/send';
  return router.handle(req, res);
});

// Send connection request
router.post('/send', authenticateToken, async (req, res) => {
  try {
    const { connectedUserId } = req.body;
    const connectionType = 'friend';
    
    if (!connectedUserId) {
      return res.status(400).json({
        success: false,
        error: 'Connected user ID is required'
      });
    }

    const targetUserId = parseInt(connectedUserId);
    
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

    // Check if connection already exists
    const existingConnection = await prisma.connection.findFirst({
      where: {
        OR: [
          { userId: req.user.id, connectedUserId: targetUserId },
          { userId: targetUserId, connectedUserId: req.user.id }
        ]
      }
    });

    if (existingConnection) {
      return res.status(409).json({
        success: false,
        error: 'Connection already exists',
        message: 'You already have a connection with this user'
      });
    }

    // Create connection request
    const connection = await prisma.connection.create({
      data: {
        userId: req.user.id,
        connectedUserId: targetUserId,
        connectionType,
        status: 'pending'
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
      message: 'Connection request sent successfully',
      connection
    });

  } catch (error) {
    console.error('Send connection error:', error);
    res.status(500).json({
      success: false,
      error: 'Unable to send connection request'
    });
  }
});

// Accept connection request
router.post('/accept/:id', authenticateToken, async (req, res) => {
  try {
    const connectionId = parseInt(req.params.id);
    
    if (isNaN(connectionId)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid connection ID'
      });
    }

    // Find the connection
    const connection = await prisma.connection.findUnique({
      where: { id: connectionId },
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

    if (!connection) {
      return res.status(404).json({
        success: false,
        error: 'Connection request not found'
      });
    }

    if (connection.connectedUserId !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: 'Forbidden',
        message: 'You can only accept connection requests sent to you'
      });
    }

    if (connection.status !== 'pending') {
      return res.status(400).json({
        success: false,
        error: 'Invalid request',
        message: 'This connection request has already been processed'
      });
    }

    // Accept the connection
    const updatedConnection = await prisma.connection.update({
      where: { id: connectionId },
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

    // Create notification for the sender
    await prisma.notification.create({
      data: {
        userId: connection.userId,
        title: 'Приглашение принято',
        message: `${req.user.name} принял ваше приглашение в друзья`,
        type: 'success'
      }
    });

    res.json({
      success: true,
      message: 'Connection request accepted',
      connection: updatedConnection
    });

  } catch (error) {
    console.error('Accept connection error:', error);
    res.status(500).json({
      success: false,
      error: 'Unable to accept connection request'
    });
  }
});

// Reject connection request
router.post('/reject/:id', authenticateToken, async (req, res) => {
  try {
    const connectionId = parseInt(req.params.id);
    
    if (isNaN(connectionId)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid connection ID'
      });
    }

    // Find the connection
    const connection = await prisma.connection.findUnique({
      where: { id: connectionId }
    });

    if (!connection) {
      return res.status(404).json({
        success: false,
        error: 'Connection request not found'
      });
    }

    if (connection.connectedUserId !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: 'Forbidden',
        message: 'You can only reject connection requests sent to you'
      });
    }

    if (connection.status !== 'pending') {
      return res.status(400).json({
        success: false,
        error: 'Invalid request',
        message: 'This connection request has already been processed'
      });
    }

    // Reject the connection
    await prisma.connection.update({
      where: { id: connectionId },
      data: { status: 'rejected' }
    });

    res.json({
      success: true,
      message: 'Connection request rejected'
    });

  } catch (error) {
    console.error('Reject connection error:', error);
    res.status(500).json({
      success: false,
      error: 'Unable to reject connection request'
    });
  }
});

// Get user's connections
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { status = 'accepted' } = req.query;

    const connections = await prisma.connection.findMany({
      where: {
        OR: [
          { userId: req.user.id },
          { connectedUserId: req.user.id }
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
        connectedUser: {
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

    // Transform connections to show the connected user
    const transformedConnections = connections.map(conn => {
      const friend = conn.userId === req.user.id ? conn.connectedUser : conn.user;
      return {
        id: conn.id,
        friend: {
          id: friend.id,
          name: friend.name,
          position: friend.position,
          company: friend.company,
          avatarUrl: friend.avatarUrl
        },
        connectionType: conn.connectionType,
        status: conn.status,
        createdAt: conn.createdAt,
        isIncoming: conn.connectedUserId === req.user.id
      };
    });

    res.json({
      success: true,
      connections: transformedConnections
    });

  } catch (error) {
    console.error('Get connections error:', error);
    res.status(500).json({
      success: false,
      error: 'Unable to fetch connections'
    });
  }
});

// Remove connection
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const connectionId = parseInt(req.params.id);
    
    if (isNaN(connectionId)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid connection ID'
      });
    }

    // Find the connection
    const connection = await prisma.connection.findUnique({
      where: { id: connectionId }
    });

    if (!connection) {
      return res.status(404).json({
        success: false,
        error: 'Connection not found'
      });
    }

    if (connection.userId !== req.user.id && connection.connectedUserId !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: 'Forbidden',
        message: 'You can only remove your own connections'
      });
    }

    // Delete the connection
    await prisma.connection.delete({
      where: { id: connectionId }
    });

    res.json({
      success: true,
      message: 'Connection removed successfully'
    });

  } catch (error) {
    console.error('Remove connection error:', error);
    res.status(500).json({
      success: false,
      error: 'Unable to remove connection'
    });
  }
});

// Bulk create connections (for demo purposes)
router.post('/bulk-create', async (req, res) => {
  try {
    const { connections } = req.body;
    
    if (!Array.isArray(connections)) {
      return res.status(400).json({
        success: false,
        error: 'Connections must be an array'
      });
    }

    const createdConnections = [];
    
    for (const conn of connections) {
      const { userId, connectedUserId, status = 'accepted' } = conn;
      const connectionType = 'friend';
      
      if (!userId || !connectedUserId) {
        continue;
      }

      // Check if connection already exists
      const existingConnection = await prisma.connection.findFirst({
        where: {
          OR: [
            { userId: parseInt(userId), connectedUserId: parseInt(connectedUserId) },
            { userId: parseInt(connectedUserId), connectedUserId: parseInt(userId) }
          ]
        }
      });

      if (!existingConnection) {
        try {
          const connection = await prisma.connection.create({
            data: {
              userId: parseInt(userId),
              connectedUserId: parseInt(connectedUserId),
              connectionType,
              status
            }
          });
          createdConnections.push(connection);
        } catch (error) {
          console.error(`Error creating connection ${userId} -> ${connectedUserId}:`, error.message);
        }
      }
    }

    res.json({
      success: true,
      message: `Created ${createdConnections.length} connections`,
      connections: createdConnections
    });

  } catch (error) {
    console.error('Bulk create connections error:', error);
    res.status(500).json({
      success: false,
      error: 'Unable to create connections'
    });
  }
});

// Get connection statistics for a user
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
    const directConnections = await prisma.connection.findMany({
      where: {
        OR: [
          { userId: targetUserId, status: 'accepted' },
          { connectedUserId: targetUserId, status: 'accepted' }
        ]
      },
      include: {
        user: {
          select: { id: true }
        },
        connectedUser: {
          select: { id: true }
        }
      }
    });

    console.log(`Direct connections for user ${targetUserId}:`, directConnections.length);

    // Get friend IDs (excluding the target user)
    const friendIds = directConnections.map(conn => 
      conn.userId === targetUserId ? conn.connectedUser.id : conn.user.id
    );

    console.log(`Friend IDs:`, friendIds);

    // Get all connections of friends (second-degree connections)
    const secondDegreeConnections = await prisma.connection.findMany({
      where: {
        OR: [
          { userId: { in: friendIds }, status: 'accepted' },
          { connectedUserId: { in: friendIds }, status: 'accepted' }
        ]
      },
      include: {
        user: {
          select: { id: true }
        },
        connectedUser: {
          select: { id: true }
        }
      }
    });

    console.log(`Second degree connections:`, secondDegreeConnections.length);

    // Collect all unique user IDs from second-degree connections
    const allSecondDegreeUserIds = new Set();
    secondDegreeConnections.forEach(conn => {
      if (conn.user.id !== targetUserId) {
        allSecondDegreeUserIds.add(conn.user.id);
      }
      if (conn.connectedUser.id !== targetUserId) {
        allSecondDegreeUserIds.add(conn.connectedUser.id);
      }
    });

    console.log(`Unique second degree user IDs before filtering:`, allSecondDegreeUserIds.size);

    // Remove direct friends from second-degree connections to avoid double counting
    friendIds.forEach(friendId => {
      allSecondDegreeUserIds.delete(friendId);
    });

    console.log(`Unique second degree user IDs after filtering:`, allSecondDegreeUserIds.size);

    const totalConnections = friendIds.length + allSecondDegreeUserIds.size;

    console.log(`Final stats - Friends: ${friendIds.length}, Second degree: ${allSecondDegreeUserIds.size}, Total: ${totalConnections}`);

    res.json({
      success: true,
      stats: {
        friendsCount: friendIds.length,
        totalConnections: totalConnections,
        secondDegreeConnections: allSecondDegreeUserIds.size
      }
    });

  } catch (error) {
    console.error('Get friend stats error:', error);
    res.status(500).json({
      success: false,
      error: 'Unable to get friend statistics'
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

    // Check if direct connection exists
    const directConnection = await prisma.connection.findFirst({
      where: {
        OR: [
          { userId: req.user.id, connectedUserId: targetUserId, status: 'accepted' },
          { userId: targetUserId, connectedUserId: req.user.id, status: 'accepted' }
        ]
      }
    });

    if (directConnection) {
      return res.json({
        success: true,
        isDirectConnection: true,
        path: []
      });
    }

    // Find mutual connections (friends of both users)
    const mutualConnections = await prisma.connection.findMany({
      where: {
        OR: [
          { userId: req.user.id, status: 'accepted' },
          { connectedUserId: req.user.id, status: 'accepted' }
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
        connectedUser: {
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

    // Check which mutual connections are also connected to target user
    const mutualFriends = [];
    for (const connection of mutualConnections) {
      const mutualUserId = connection.userId === req.user.id ? connection.connectedUserId : connection.userId;
      
      if (mutualUserId === targetUserId) continue;

      const mutualConnection = await prisma.connection.findFirst({
        where: {
          OR: [
            { userId: mutualUserId, connectedUserId: targetUserId, status: 'accepted' },
            { userId: targetUserId, connectedUserId: mutualUserId, status: 'accepted' }
          ]
        }
      });

      if (mutualConnection) {
        const mutualUser = connection.userId === req.user.id ? connection.connectedUser : connection.user;
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
    const directConnections = await prisma.connection.findMany({
      where: {
        OR: [
          { userId: currentUserId, status: 'accepted' },
          { connectedUserId: currentUserId, status: 'accepted' }
        ]
      },
      include: {
        user: {
          select: { id: true }
        },
        connectedUser: {
          select: { id: true }
        }
      }
    });

    // Get friend IDs (excluding the current user)
    const friendIds = directConnections.map(conn => 
      conn.userId === currentUserId ? conn.connectedUser.id : conn.user.id
    );

    if (friendIds.length === 0) {
      return res.json({
        success: true,
        friendsOfFriends: []
      });
    }

    // Get all connections of friends (second-degree connections)
    const secondDegreeConnections = await prisma.connection.findMany({
      where: {
        OR: [
          { userId: { in: friendIds }, status: 'accepted' },
          { connectedUserId: { in: friendIds }, status: 'accepted' }
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

    // Group by friend of friend and find mutual connections
    const friendsOfFriendsMap = new Map();

    for (const conn of secondDegreeConnections) {
      let friendOfFriendId, friendOfFriend;
      
      if (friendIds.includes(conn.userId)) {
        friendOfFriendId = conn.connectedUser.id;
        friendOfFriend = conn.connectedUser;
      } else if (friendIds.includes(conn.connectedUserId)) {
        friendOfFriendId = conn.userId;
        friendOfFriend = conn.user;
      }

      // Skip if it's the current user or a direct friend
      if (friendOfFriendId === currentUserId || friendIds.includes(friendOfFriendId)) {
        continue;
      }

      if (!friendsOfFriendsMap.has(friendOfFriendId)) {
        friendsOfFriendsMap.set(friendOfFriendId, {
          id: friendOfFriend.id,
          name: friendOfFriend.name,
          position: friendOfFriend.position,
          company: friendOfFriend.company,
          avatarUrl: friendOfFriend.avatarUrl,
          mutualConnections: []
        });
      }

      // Find the mutual friend (the direct friend who connects us)
      const mutualFriendId = friendIds.includes(conn.userId) ? conn.userId : conn.connectedUserId;
      const mutualFriend = directConnections.find(dc => 
        dc.userId === mutualFriendId || dc.connectedUserId === mutualFriendId
      );

      if (mutualFriend) {
        const mutualFriendData = mutualFriend.userId === mutualFriendId ? 
          await prisma.user.findUnique({ where: { id: mutualFriendId }, select: { id: true, name: true, position: true } }) :
          await prisma.user.findUnique({ where: { id: mutualFriend.connectedUserId }, select: { id: true, name: true, position: true } });

        if (mutualFriendData && !friendsOfFriendsMap.get(friendOfFriendId).mutualConnections.find(mc => mc.id === mutualFriendData.id)) {
          friendsOfFriendsMap.get(friendOfFriendId).mutualConnections.push(mutualFriendData);
        }
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

module.exports = router;
