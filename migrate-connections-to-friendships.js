const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function migrate() {
  try {
    console.log('🚀 Starting migration: Connection -> Friendship + Connection...');

    // Проверяем, существует ли таблица connections
    const tableExists = await prisma.$queryRaw`
      SELECT name FROM sqlite_master 
      WHERE type='table' AND name='connections';
    `;

    if (!tableExists || tableExists.length === 0) {
      console.log('⚠️  Table "connections" does not exist. Creating new structure...');
      
      // Создаем таблицу friendships
      await prisma.$executeRawUnsafe(`
        CREATE TABLE IF NOT EXISTS friendships (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_id INTEGER NOT NULL,
          friend_id INTEGER NOT NULL,
          status TEXT NOT NULL DEFAULT 'pending',
          created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users(id),
          FOREIGN KEY (friend_id) REFERENCES users(id),
          UNIQUE(user_id, friend_id)
        );
      `);

      // Создаем таблицу connections
      await prisma.$executeRawUnsafe(`
        CREATE TABLE IF NOT EXISTS connections (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_id INTEGER NOT NULL,
          connected_user_id INTEGER NOT NULL,
          mutual_friend_id INTEGER NOT NULL,
          created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users(id),
          FOREIGN KEY (connected_user_id) REFERENCES users(id),
          FOREIGN KEY (mutual_friend_id) REFERENCES users(id),
          UNIQUE(user_id, connected_user_id, mutual_friend_id)
        );
      `);

      // Создаем индексы
      await prisma.$executeRawUnsafe(`
        CREATE INDEX IF NOT EXISTS idx_connections_user_id ON connections(user_id);
        CREATE INDEX IF NOT EXISTS idx_connections_connected_user_id ON connections(connected_user_id);
      `);

      console.log('✅ New structure created successfully!');
      return;
    }

    // Шаг 1: Переименовать таблицу connections в friendships (через SQL)
    console.log('📝 Step 1: Renaming connections table to friendships...');
    await prisma.$executeRawUnsafe(`
      ALTER TABLE connections RENAME TO friendships;
    `);

    // Шаг 2: Изменить структуру таблицы friendships
    console.log('📝 Step 2: Updating friendships table structure...');
    
    // Переименовать connected_user_id в friend_id
    await prisma.$executeRawUnsafe(`
      CREATE TABLE friendships_new (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        friend_id INTEGER NOT NULL,
        status TEXT NOT NULL DEFAULT 'pending',
        created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id),
        FOREIGN KEY (friend_id) REFERENCES users(id),
        UNIQUE(user_id, friend_id)
      );
    `);

    // Копировать данные из старой таблицы (игнорируем connection_type, так как теперь только friend)
    await prisma.$executeRawUnsafe(`
      INSERT INTO friendships_new (id, user_id, friend_id, status, created_at)
      SELECT id, user_id, connected_user_id, status, created_at
      FROM friendships;
    `);

    // Удалить старую таблицу и переименовать новую
    await prisma.$executeRawUnsafe(`
      DROP TABLE friendships;
      ALTER TABLE friendships_new RENAME TO friendships;
    `);

    // Шаг 3: Создать новую таблицу connections
    console.log('📝 Step 3: Creating new connections table...');
    await prisma.$executeRawUnsafe(`
      CREATE TABLE connections (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        connected_user_id INTEGER NOT NULL,
        mutual_friend_id INTEGER NOT NULL,
        created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id),
        FOREIGN KEY (connected_user_id) REFERENCES users(id),
        FOREIGN KEY (mutual_friend_id) REFERENCES users(id),
        UNIQUE(user_id, connected_user_id, mutual_friend_id)
      );
    `);

    // Создать индексы
    await prisma.$executeRawUnsafe(`
      CREATE INDEX idx_connections_user_id ON connections(user_id);
      CREATE INDEX idx_connections_connected_user_id ON connections(connected_user_id);
    `);

    console.log('✅ Migration completed successfully!');
    console.log('📊 Next steps:');
    console.log('   1. Run: npx prisma generate');
    console.log('   2. Run: node populate-connections-from-friendships.js');

  } catch (error) {
    console.error('❌ Migration error:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Запуск миграции
if (require.main === module) {
  migrate()
    .then(() => {
      console.log('Migration script completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Migration script failed:', error);
      process.exit(1);
    });
}

module.exports = { migrate };

