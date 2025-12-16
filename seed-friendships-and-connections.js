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

async function seedFriendshipsAndConnections() {
  try {
    console.log('🚀 Starting to seed friendships and connections...');

    // Получаем всех пользователей
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true
      }
    });

    if (users.length < 2) {
      console.log('❌ Need at least 2 users to create friendships. Found:', users.length);
      return;
    }

    console.log(`📊 Found ${users.length} users`);

    // Очищаем существующие friendships и connections
    console.log('🧹 Cleaning existing friendships and connections...');
    await prisma.connection.deleteMany({});
    await prisma.friendship.deleteMany({});
    console.log('✅ Cleaned up');

    // Создаем friendships между пользователями
    // Создадим сеть дружбы:
    // User 1 дружит с User 2, 3, 4
    // User 2 дружит с User 1, 3, 5
    // User 3 дружит с User 1, 2, 4, 5
    // User 4 дружит с User 1, 3, 6 (если есть)
    // User 5 дружит с User 2, 3, 6 (если есть)
    // И так далее...

    const friendshipsToCreate = [];
    const userIds = users.map(u => u.id);

    // Создаем дружбу между первыми пользователями
    for (let i = 0; i < Math.min(userIds.length, 10); i++) {
      for (let j = i + 1; j < Math.min(userIds.length, 10); j++) {
        // Создаем дружбу с вероятностью 40% для разнообразия
        if (Math.random() < 0.4) {
          friendshipsToCreate.push({
            userId: userIds[i],
            friendId: userIds[j],
            status: 'accepted'
          });
        }
      }
    }

    console.log(`📝 Creating ${friendshipsToCreate.length} friendships...`);

    let createdCount = 0;
    for (const friendship of friendshipsToCreate) {
      try {
        // Проверяем, не существует ли уже такая дружба
        const existing = await prisma.friendship.findFirst({
          where: {
            OR: [
              { userId: friendship.userId, friendId: friendship.friendId },
              { userId: friendship.friendId, friendId: friendship.userId }
            ]
          }
        });

        if (!existing) {
          await prisma.friendship.create({
            data: friendship
          });
          createdCount++;
        }
      } catch (error) {
        console.error(`Error creating friendship ${friendship.userId} -> ${friendship.friendId}:`, error.message);
      }
    }

    console.log(`✅ Created ${createdCount} friendships`);

    // Теперь обновляем connections для всех созданных friendships
    console.log('🔗 Updating connections based on friendships...');
    
    const allFriendships = await prisma.friendship.findMany({
      where: { status: 'accepted' }
    });

    console.log(`📊 Processing ${allFriendships.length} accepted friendships...`);

    let processed = 0;
    const processedPairs = new Set();

    for (const friendship of allFriendships) {
      const pairKey = `${Math.min(friendship.userId, friendship.friendId)}-${Math.max(friendship.userId, friendship.friendId)}`;
      
      if (!processedPairs.has(pairKey)) {
        try {
          await updateConnectionsForNewFriendship(friendship.userId, friendship.friendId);
          processedPairs.add(pairKey);
          processed++;
          
          if (processed % 5 === 0) {
            console.log(`   Processed ${processed}/${allFriendships.length} friendships...`);
          }
        } catch (error) {
          console.error(`Error processing friendship ${friendship.id}:`, error.message);
        }
      }
    }

    // Получаем статистику
    const friendshipsCount = await prisma.friendship.count();
    const connectionsCount = await prisma.connection.count();

    console.log('\n✅ Seeding completed!');
    console.log('📊 Statistics:');
    console.log(`   - Friendships: ${friendshipsCount}`);
    console.log(`   - Connections: ${connectionsCount}`);
    console.log(`   - Users: ${users.length}`);

    // Выводим примеры созданных friendships
    console.log('\n📋 Sample friendships:');
    const sampleFriendships = await prisma.friendship.findMany({
      take: 5,
      include: {
        user: { select: { id: true, name: true } },
        friend: { select: { id: true, name: true } }
      }
    });

    sampleFriendships.forEach(f => {
      console.log(`   ${f.user.name} (${f.user.id}) <-> ${f.friend.name} (${f.friend.id}) [${f.status}]`);
    });

    // Выводим примеры созданных connections
    if (connectionsCount > 0) {
      console.log('\n🔗 Sample connections:');
      const sampleConnections = await prisma.connection.findMany({
        take: 5,
        include: {
          user: { select: { id: true, name: true } },
          connectedUser: { select: { id: true, name: true } },
          mutualFriend: { select: { id: true, name: true } }
        }
      });

      sampleConnections.forEach(c => {
        console.log(`   ${c.user.name} (${c.user.id}) -> ${c.connectedUser.name} (${c.connectedUser.id}) via ${c.mutualFriend.name} (${c.mutualFriend.id})`);
      });
    }

  } catch (error) {
    console.error('❌ Seeding error:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Запуск скрипта
if (require.main === module) {
  seedFriendshipsAndConnections()
    .then(() => {
      console.log('\n🎉 Script completed successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n💥 Script failed:', error);
      process.exit(1);
    });
}

module.exports = { seedFriendshipsAndConnections };

