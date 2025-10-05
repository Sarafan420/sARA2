const bcrypt = require('bcrypt');
const { userAPI } = require('./database');

// API для авторизации
const authAPI = {
  // Регистрация пользователя
  async register(userData) {
    try {
      const {
        name,
        email,
        password,
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
      const existingUser = await userAPI.getUserByEmail(email);
      if (existingUser) {
        throw new Error('Пользователь с таким email уже существует');
      }

      // Хешируем пароль
      const saltRounds = 10;
      const password_hash = await bcrypt.hash(password, saltRounds);

      // Создаем пользователя
      const newUser = await userAPI.createUser({
        name,
        email,
        password_hash,
        phone,
        location,
        company,
        position,
        experience_years,
        bio,
        skills,
        interests,
        avatar
      });

      // Убираем пароль из ответа
      const { password_hash: _, ...userWithoutPassword } = newUser;
      return userWithoutPassword;
    } catch (error) {
      throw error;
    }
  },

  // Авторизация пользователя
  async login(email, password) {
    try {
      // Проверяем пароль
      const user = await userAPI.validatePassword(email, password);
      
      if (!user) {
        throw new Error('Неверный email или пароль');
      }

      return user;
    } catch (error) {
      throw error;
    }
  },

  // Получение пользователя по ID (без пароля)
  async getUserById(id) {
    try {
      const user = await userAPI.getUserById(id);
      if (user) {
        const { password_hash, ...userWithoutPassword } = user;
        return userWithoutPassword;
      }
      return null;
    } catch (error) {
      throw error;
    }
  },

  // Обновление пароля
  async updatePassword(userId, currentPassword, newPassword) {
    try {
      const user = await userAPI.getUserById(userId);
      if (!user) {
        throw new Error('Пользователь не найден');
      }

      // Проверяем текущий пароль
      const isValidPassword = await bcrypt.compare(currentPassword, user.password_hash);
      if (!isValidPassword) {
        throw new Error('Неверный текущий пароль');
      }

      // Хешируем новый пароль
      const saltRounds = 10;
      const newPasswordHash = await bcrypt.hash(newPassword, saltRounds);

      // Обновляем пароль
      await userAPI.updateUser(userId, { password_hash: newPasswordHash });

      return true;
    } catch (error) {
      throw error;
    }
  }
};

module.exports = authAPI;
