import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Mock данные больше не используются - все данные загружаются из API

  useEffect(() => {
    // Проверка аутентификации при загрузке приложения
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('authToken');
        if (token) {
          // Проверяем валидность токена, отправляя запрос на сервер
          const response = await fetch('http://localhost:5000/api/users/me', {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });

          if (response.ok) {
            const userData = await response.json();
            // Убеждаемся, что skills - это массив
            const user = {
              ...userData.user,
              skills: Array.isArray(userData.user.skills) ? userData.user.skills : []
            };
            setUser(user);
            setIsAuthenticated(true);
          } else {
            // Токен недействителен, очищаем его
            localStorage.removeItem('authToken');
            setUser(null);
            setIsAuthenticated(false);
          }
        } else {
          setUser(null);
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        localStorage.removeItem('authToken');
        setUser(null);
        setIsAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (email, password) => {
    setLoading(true);
    try {
      // Отправляем запрос на сервер
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Ошибка сервера' }));
        return {
          success: false,
          error: errorData.message || errorData.error || 'Ошибка входа. Проверьте данные.'
        };
      }

      const data = await response.json();

      if (data.success) {
        localStorage.setItem('authToken', data.token);
        
        // Преобразуем данные пользователя из БД в формат приложения
        const userData = {
          id: data.user.id,
          name: data.user.name,
          email: data.user.email,
          avatar: data.user.avatarUrl,
          position: data.user.position,
          company: data.user.company,
          location: data.user.location,
          status: data.user.status,
          skills: data.user.skills || [],
          interests: data.user.interests || [],
          about: data.user.bio,
          connections: 42, // Можно получать из БД
          views: 128, // Можно получать из БД
          friends: data.user.id === 1 ? [
            // Друзья для Александра Петрова (ID: 1)
            { id: 2, name: "Мария Сидорова", position: "HR Manager", company: "HR Solutions", avatar: null },
            { id: 3, name: "Дмитрий Козлов", position: "Full-stack Developer", company: "AI Solutions", avatar: null },
            { id: 4, name: "Анна Волкова", position: "UX/UI Designer", company: "Design Studio", avatar: null },
            { id: 5, name: "Сергей Морозов", position: "DevOps Engineer", company: "CloudTech", avatar: null },
            { id: 6, name: "Елена Новикова", position: "Marketing Manager", company: "Digital Agency", avatar: null },
            { id: 7, name: "Игорь Лебедев", position: "Mobile Developer", company: "MobileDev", avatar: null },
            { id: 8, name: "Ольга Соколова", position: "Data Analyst", company: "DataCorp", avatar: null },
            { id: 9, name: "Павел Кузнецов", position: "Backend Developer", company: "Backend Solutions", avatar: null },
            { id: 10, name: "Татьяна Попова", position: "QA Engineer", company: "Quality Assurance", avatar: null }
          ] : [], // Для других пользователей пустой список
          // Добавляем дополнительные поля для профиля
          workExperience: [
            {
              position: data.user.position || 'Специалист',
              company: data.user.company || 'Компания',
              period: 'Текущая позиция',
              duration: 'Активно',
              description: data.user.bio || 'Описание опыта работы'
            }
          ],
          education: [
            {
              faculty: 'Высшее образование',
              university: 'Университет',
              period: 'Годы обучения',
              degree: 'Степень',
              specialization: 'Специализация'
            }
          ],
          contact: {
            email: data.user.email,
            phone: '+7 (999) 000-00-00',
            telegram: '@username'
          },
          preferences: {
            notifications: true,
            emailUpdates: true,
            profileVisibility: 'public',
            jobAlerts: true
          }
        };

        setUser(userData);
        setIsAuthenticated(true);
        return { success: true };
      } else {
        return { success: false, error: data.error || 'Ошибка авторизации' };
      }
    } catch (error) {
      return { success: false, error: error.message || 'Ошибка соединения' };
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData) => {
    setLoading(true);
    try {
      // Отправляем запрос на новый API
      const response = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success) {
        // Сохраняем токен
        localStorage.setItem('authToken', data.token);
        
        // Преобразуем данные пользователя в формат приложения
        const newUser = {
          id: data.user.id,
          name: data.user.name,
          email: data.user.email,
          avatar: data.user.avatarUrl || '',
          position: data.user.position || '',
          company: data.user.company || '',
          location: data.user.location || '',
          status: data.user.status || 'Открыт к предложениям',
          skills: data.user.skills || [],
          interests: data.user.interests || [],
          about: data.user.bio || '',
          connections: 0,
          views: 0,
          friends: [],
          workExperience: [
            {
              position: data.user.position || 'Специалист',
              company: data.user.company || 'Компания',
              period: 'Текущая позиция',
              duration: 'Активно',
              description: data.user.bio || 'Описание опыта работы'
            }
          ],
          education: [
            {
              faculty: 'Высшее образование',
              university: 'Университет',
              period: 'Годы обучения',
              degree: 'Степень',
              specialization: 'Специализация'
            }
          ],
          contact: {
            email: data.user.email,
            phone: data.user.phone || '',
            telegram: '@username'
          },
          preferences: {
            notifications: true,
            emailUpdates: true,
            profileVisibility: 'public',
            jobAlerts: true
          }
        };
        
        setUser(newUser);
        setIsAuthenticated(true);
        return { success: true };
      } else {
        throw new Error(data.error || 'Ошибка регистрации');
      }
    } catch (error) {
      console.error('Registration error:', error);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('authToken');
    setUser(null);
    setIsAuthenticated(false);
  };

  const updateProfile = async (profileData) => {
    setLoading(true);
    try {
      // Симуляция API запроса
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const updatedUser = {
        ...user,
        ...profileData,
        profile: {
          ...user.profile,
          ...profileData.profile
        }
      };
      
      setUser(updatedUser);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  const value = {
    user,
    loading,
    isAuthenticated,
    login,
    register,
    logout,
    updateProfile
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
