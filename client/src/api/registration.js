const { userAPI } = require('./database');

// API для регистрации пользователей
const registrationAPI = {
  // Регистрация нового пользователя
  async registerUser(userData) {
    try {
      // Валидация данных
      const validation = validateUserData(userData);
      if (!validation.isValid) {
        throw new Error(validation.error);
      }

      // Создание пользователя в базе данных
      const newUser = await userAPI.createUser({
        name: userData.name.trim(),
        email: userData.email.trim().toLowerCase(),
        phone: userData.phone.trim(),
        location: userData.location.trim(),
        company: userData.company.trim(),
        position: userData.position.trim(),
        experience_years: parseInt(userData.experience_years),
        bio: userData.bio ? userData.bio.trim() : 'Новый пользователь sARA2',
        skills: JSON.stringify([]),
        interests: JSON.stringify([]),
        avatar: generateRandomAvatar()
      });

      return {
        success: true,
        user: newUser,
        message: 'Пользователь успешно зарегистрирован'
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  },

  // Проверка существования пользователя по email
  async checkUserExists(email) {
    try {
      const user = await userAPI.getUserByEmail(email);
      return {
        exists: !!user,
        user: user
      };
    } catch (error) {
      return {
        exists: false,
        error: error.message
      };
    }
  }
};

// Валидация данных пользователя
function validateUserData(userData) {
  const { name, email, phone, location, company, position, experience_years } = userData;

  // Проверка обязательных полей
  if (!name || !name.trim()) {
    return { isValid: false, error: 'Имя обязательно для заполнения' };
  }

  if (!email || !email.trim()) {
    return { isValid: false, error: 'Email обязателен для заполнения' };
  }

  if (!phone || !phone.trim()) {
    return { isValid: false, error: 'Телефон обязателен для заполнения' };
  }

  if (!location || !location.trim()) {
    return { isValid: false, error: 'Местоположение обязательно для заполнения' };
  }

  if (!company || !company.trim()) {
    return { isValid: false, error: 'Компания обязательна для заполнения' };
  }

  if (!position || !position.trim()) {
    return { isValid: false, error: 'Должность обязательна для заполнения' };
  }

  if (!experience_years || isNaN(experience_years) || experience_years < 0) {
    return { isValid: false, error: 'Опыт работы должен быть положительным числом' };
  }

  // Валидация email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return { isValid: false, error: 'Некорректный формат email' };
  }

  // Валидация телефона
  const phoneRegex = /^\+7 \(\d{3}\) \d{3}-\d{2}-\d{2}$/;
  if (!phoneRegex.test(phone)) {
    return { isValid: false, error: 'Некорректный формат телефона' };
  }

  // Валидация длины полей
  if (name.trim().length < 2) {
    return { isValid: false, error: 'Имя должно содержать минимум 2 символа' };
  }

  if (name.trim().length > 100) {
    return { isValid: false, error: 'Имя не должно превышать 100 символов' };
  }

  if (email.length > 255) {
    return { isValid: false, error: 'Email не должен превышать 255 символов' };
  }

  if (company.trim().length > 200) {
    return { isValid: false, error: 'Название компании не должно превышать 200 символов' };
  }

  if (position.trim().length > 200) {
    return { isValid: false, error: 'Должность не должна превышать 200 символов' };
  }

  if (experience_years > 50) {
    return { isValid: false, error: 'Опыт работы не может превышать 50 лет' };
  }

  return { isValid: true };
}

// Генерация случайного аватара
function generateRandomAvatar() {
  const avatarIds = [
    '1507003211169-0a1dd7228f2d',
    '1494790108755-2616b612b786',
    '1472099645785-5658abf4ff4e',
    '1438761681033-6461ffad8d80',
    '1500648767791-00dcc994a43e',
    '1544005313-94ddf0286df2',
    '1507591064344-4c6ce005b128',
    '1487412720507-e7ab37603c6f',
    '1534528741775-53994a69daeb'
  ];

  const randomId = avatarIds[Math.floor(Math.random() * avatarIds.length)];
  return `https://images.unsplash.com/photo-${randomId}?w=150&h=150&fit=crop&crop=face`;
}

module.exports = registrationAPI;
