const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Путь к базе данных
const dbPath = path.join(__dirname, '../../sARA2_database.db');

// Создаем подключение к базе данных
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Ошибка подключения к базе данных:', err.message);
  } else {
    console.log('Подключение к SQLite базе данных установлено');
  }
});

// Функция для выполнения SQL запросов
function runQuery(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function(err) {
      if (err) {
        reject(err);
      } else {
        resolve(this);
      }
    });
  });
}

// Функция для выполнения SQL запросов с возвратом данных
function getQuery(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) {
        reject(err);
      } else {
        resolve(rows);
      }
    });
  });
}

// Функция для получения одной записи
function getOneQuery(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) {
        reject(err);
      } else {
        resolve(row);
      }
    });
  });
}

// API для работы с пользователями
const userAPI = {
  // Создание нового пользователя
  async createUser(userData) {
    try {
      const {
        name,
        email,
        password_hash,
        phone,
        location,
        company,
        position,
        experience_years,
        bio,
        skills = '[]',
        interests = '[]',
        avatar
      } = userData;

      // Проверяем, существует ли пользователь с таким email
      const existingUser = await getOneQuery(
        'SELECT id FROM users WHERE email = ?',
        [email]
      );

      if (existingUser) {
        throw new Error('Пользователь с таким email уже существует');
      }

      // Создаем нового пользователя
      const result = await runQuery(
        `INSERT INTO users (
          name, email, password_hash, phone, location, company, position, 
          experience_years, bio, skills, interests, avatar_url, status
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          name, email, password_hash, phone, location, company, position,
          experience_years, bio, skills, interests, avatar, 'Открыт к предложениям'
        ]
      );

      // Получаем созданного пользователя
      const newUser = await getOneQuery(
        'SELECT * FROM users WHERE id = ?',
        [result.lastID]
      );

      return newUser;
    } catch (error) {
      throw error;
    }
  },

  // Получение пользователя по ID
  async getUserById(id) {
    try {
      const user = await getOneQuery(
        'SELECT * FROM users WHERE id = ?',
        [id]
      );
      return user;
    } catch (error) {
      throw error;
    }
  },

  // Получение пользователя по email
  async getUserByEmail(email) {
    try {
      const user = await getOneQuery(
        'SELECT * FROM users WHERE email = ?',
        [email]
      );
      return user;
    } catch (error) {
      throw error;
    }
  },

  // Проверка пароля пользователя
  async validatePassword(email, password) {
    try {
      const user = await getOneQuery(
        'SELECT id, name, email, password_hash, avatar_url, company, position, location, skills, interests FROM users WHERE email = ?',
        [email]
      );
      
      if (!user) {
        return null;
      }

      // В реальном приложении здесь должна быть проверка хеша пароля
      // Для демо используем простую проверку
      const bcrypt = require('bcrypt');
      const isValidPassword = await bcrypt.compare(password, user.password_hash);
      
      if (isValidPassword) {
        // Убираем пароль из ответа
        const { password_hash, ...userWithoutPassword } = user;
        return userWithoutPassword;
      }
      
      return null;
    } catch (error) {
      throw error;
    }
  },

  // Получение всех пользователей
  async getAllUsers() {
    try {
      const users = await getQuery(
        'SELECT id, name, email, phone, location, company, position, experience_years, bio, avatar_url, status, skills, interests, created_at FROM users ORDER BY created_at DESC'
      );
      return users;
    } catch (error) {
      throw error;
    }
  },

  // Обновление пользователя
  async updateUser(id, userData) {
    try {
      const {
        name,
        email,
        phone,
        location,
        company,
        position,
        experience_years,
        bio,
        skills,
        interests,
        avatar
      } = userData;

      await runQuery(
        `UPDATE users SET 
          name = ?, email = ?, phone = ?, location = ?, company = ?, 
          position = ?, experience_years = ?, bio = ?, skills = ?, 
          interests = ?, avatar = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?`,
        [
          name, email, phone, location, company, position,
          experience_years, bio, skills, interests, avatar, id
        ]
      );

      const updatedUser = await getOneQuery(
        'SELECT * FROM users WHERE id = ?',
        [id]
      );

      return updatedUser;
    } catch (error) {
      throw error;
    }
  },

  // Удаление пользователя (мягкое удаление)
  async deleteUser(id) {
    try {
      await runQuery(
        'UPDATE users SET status = "inactive", updated_at = CURRENT_TIMESTAMP WHERE id = ?',
        [id]
      );
      return true;
    } catch (error) {
      throw error;
    }
  }
};

// API для работы с вакансиями
const vacancyAPI = {
  // Создание новой вакансии
  async createVacancy(vacancyData) {
    try {
      const {
        title,
        company,
        location,
        salary_min,
        salary_max,
        description,
        requirements,
        benefits,
        employment_type,
        experience_level,
        work_schedule,
        company_logo,
        company_images,
        has_specialization,
        created_by
      } = vacancyData;

      const result = await runQuery(
        `INSERT INTO vacancies (
          title, company, location, salary_min, salary_max, description,
          requirements, benefits, employment_type, experience_level, work_schedule,
          company_logo, company_images, has_specialization, created_by, status
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          title, company, location, salary_min, salary_max, description,
          requirements, benefits, employment_type, experience_level, work_schedule,
          company_logo, company_images, has_specialization, created_by, 'active'
        ]
      );

      const newVacancy = await getOneQuery(
        'SELECT * FROM vacancies WHERE id = ?',
        [result.lastID]
      );

      return newVacancy;
    } catch (error) {
      throw error;
    }
  },

  // Получение всех вакансий
  async getAllVacancies() {
    try {
      const vacancies = await getQuery(
        'SELECT * FROM vacancies WHERE status = "active" ORDER BY created_at DESC'
      );
      return vacancies;
    } catch (error) {
      throw error;
    }
  },

  // Получение вакансии по ID
  async getVacancyById(id) {
    try {
      const vacancy = await getOneQuery(
        'SELECT * FROM vacancies WHERE id = ?',
        [id]
      );
      return vacancy;
    } catch (error) {
      throw error;
    }
  }
};

// API для работы с связями
const connectionAPI = {
  // Создание связи
  async createConnection(userId, friendId) {
    const connectionType = 'friend';
    try {
      const result = await runQuery(
        'INSERT INTO connections (user_id, friend_id, connection_type, status) VALUES (?, ?, ?, ?)',
        [userId, friendId, connectionType, 'pending']
      );

      return result.lastID;
    } catch (error) {
      throw error;
    }
  },

  // Получение связей пользователя
  async getUserConnections(userId) {
    try {
      const connections = await getQuery(
        `SELECT c.*, u.name, u.avatar, u.company, u.position 
         FROM connections c 
         JOIN users u ON c.friend_id = u.id 
         WHERE c.user_id = ? AND c.status = 'accepted'`,
        [userId]
      );
      return connections;
    } catch (error) {
      throw error;
    }
  },

  // Принятие связи
  async acceptConnection(connectionId) {
    try {
      await runQuery(
        'UPDATE connections SET status = "accepted", updated_at = CURRENT_TIMESTAMP WHERE id = ?',
        [connectionId]
      );
      return true;
    } catch (error) {
      throw error;
    }
  }
};

// API для работы с уведомлениями
const notificationAPI = {
  // Создание уведомления
  async createNotification(userId, title, message, type, data = null) {
    try {
      const result = await runQuery(
        'INSERT INTO notifications (user_id, title, message, type, data) VALUES (?, ?, ?, ?, ?)',
        [userId, title, message, type, data ? JSON.stringify(data) : null]
      );

      return result.lastID;
    } catch (error) {
      throw error;
    }
  },

  // Получение уведомлений пользователя
  async getUserNotifications(userId) {
    try {
      const notifications = await getQuery(
        'SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC',
        [userId]
      );
      return notifications;
    } catch (error) {
      throw error;
    }
  },

  // Отметка уведомления как прочитанного
  async markAsRead(notificationId) {
    try {
      await runQuery(
        'UPDATE notifications SET is_read = TRUE WHERE id = ?',
        [notificationId]
      );
      return true;
    } catch (error) {
      throw error;
    }
  }
};

// Закрытие подключения к базе данных
function closeDatabase() {
  db.close((err) => {
    if (err) {
      console.error('Ошибка при закрытии базы данных:', err.message);
    } else {
      console.log('Подключение к базе данных закрыто');
    }
  });
}

module.exports = {
  userAPI,
  vacancyAPI,
  connectionAPI,
  notificationAPI,
  closeDatabase,
  runQuery,
  getQuery,
  getOneQuery
};
