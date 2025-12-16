const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Функция для обновления connections при создании/принятии дружбы
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
      if (!user1FriendIds.has(friendId2) && friendId2 !== userId1) {
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
      if (!user2FriendIds.has(friendId1) && friendId1 !== userId2) {
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
    for (const friendId1 of user1FriendIds) {
      const friendshipWithUser2 = await prisma.friendship.findFirst({
        where: {
          OR: [
            { userId: friendId1, friendId: userId2, status: 'accepted' },
            { userId: userId2, friendId: friendId1, status: 'accepted' }
          ]
        }
      });

      if (friendshipWithUser2) {
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
      const friendshipWithUser1 = await prisma.friendship.findFirst({
        where: {
          OR: [
            { userId: friendId2, friendId: userId1, status: 'accepted' },
            { userId: userId1, friendId: friendId2, status: 'accepted' }
          ]
        }
      });

      if (friendshipWithUser1) {
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
    throw error;
  }
}

async function populateConnections() {
  try {
    console.log('🚀 Starting to populate connections from existing friendships...');

    // Получаем все принятые дружбы
    const friendships = await prisma.friendship.findMany({
      where: {
        status: 'accepted'
      }
    });

    console.log(`📊 Found ${friendships.length} accepted friendships`);

    // Обрабатываем каждую дружбу
    let processed = 0;
    for (const friendship of friendships) {
      const userId1 = friendship.userId;
      const userId2 = friendship.friendId;

      try {
        await updateConnectionsForNewFriendship(userId1, userId2);
        processed++;
        if (processed % 10 === 0) {
          console.log(`✅ Processed ${processed}/${friendships.length} friendships...`);
        }
      } catch (error) {
        console.error(`❌ Error processing friendship ${friendship.id}:`, error.message);
      }
    }

    console.log(`✅ Successfully processed ${processed} friendships`);
    console.log('🎉 Connections population completed!');

  } catch (error) {
    console.error('❌ Error populating connections:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Запуск скрипта
if (require.main === module) {
  populateConnections()
    .then(() => {
      console.log('Script completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Script failed:', error);
      process.exit(1);
    });
}

module.exports = { populateConnections, updateConnectionsForNewFriendship };

