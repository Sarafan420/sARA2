// API для работы с данными людей из базы данных
const API_BASE_URL = 'http://localhost:5000/api';

export const peopleAPI = {
  // Получение всех пользователей
  async getAllUsers() {
    try {
      const response = await fetch(`${API_BASE_URL}/users`);
      if (!response.ok) {
        throw new Error('Ошибка получения пользователей');
      }
      return await response.json();
    } catch (error) {
      console.error('Ошибка API:', error);
      return [];
    }
  },

  // Получение уникальных навыков из базы данных с подсчетом
  async getUniqueSkills() {
    try {
      const users = await this.getAllUsers();
      const skillsCount = {};
      
      users.forEach(user => {
        if (user.skills) {
          try {
            const skills = JSON.parse(user.skills);
            if (Array.isArray(skills)) {
              skills.forEach(skill => {
                skillsCount[skill] = (skillsCount[skill] || 0) + 1;
              });
            }
          } catch (e) {
            // Если skills не JSON, игнорируем
          }
        }
      });
      
      return Object.entries(skillsCount)
        .map(([skill, count]) => ({ skill, count }))
        .sort((a, b) => a.skill.localeCompare(b.skill));
    } catch (error) {
      console.error('Ошибка получения навыков:', error);
      return [];
    }
  },

  // Получение уникальных должностей из базы данных с подсчетом
  async getUniquePositions() {
    try {
      const users = await this.getAllUsers();
      const positionsCount = {};
      
      users.forEach(user => {
        if (user.position) {
          positionsCount[user.position] = (positionsCount[user.position] || 0) + 1;
        }
      });
      
      return Object.entries(positionsCount)
        .map(([position, count]) => ({ position, count }))
        .sort((a, b) => a.position.localeCompare(b.position));
    } catch (error) {
      console.error('Ошибка получения должностей:', error);
      return [];
    }
  },

  // Получение уникальных компаний из базы данных с подсчетом
  async getUniqueCompanies() {
    try {
      const users = await this.getAllUsers();
      const companiesCount = {};
      
      users.forEach(user => {
        if (user.company) {
          companiesCount[user.company] = (companiesCount[user.company] || 0) + 1;
        }
      });
      
      return Object.entries(companiesCount)
        .map(([company, count]) => ({ company, count }))
        .sort((a, b) => a.company.localeCompare(b.company));
    } catch (error) {
      console.error('Ошибка получения компаний:', error);
      return [];
    }
  },

  // Получение уникальных городов из базы данных с подсчетом
  async getUniqueLocations() {
    try {
      const users = await this.getAllUsers();
      const locationsCount = {};
      
      users.forEach(user => {
        if (user.location) {
          locationsCount[user.location] = (locationsCount[user.location] || 0) + 1;
        }
      });
      
      return Object.entries(locationsCount)
        .map(([location, count]) => ({ location, count }))
        .sort((a, b) => a.location.localeCompare(b.location));
    } catch (error) {
      console.error('Ошибка получения городов:', error);
      return [];
    }
  },

  // Получение уникальных интересов из базы данных с подсчетом
  async getUniqueInterests() {
    try {
      const users = await this.getAllUsers();
      const interestsCount = {};
      
      users.forEach(user => {
        if (user.interests) {
          try {
            const interests = JSON.parse(user.interests);
            if (Array.isArray(interests)) {
              interests.forEach(interest => {
                interestsCount[interest] = (interestsCount[interest] || 0) + 1;
              });
            }
          } catch (e) {
            // Если interests не JSON, игнорируем
          }
        }
      });
      
      return Object.entries(interestsCount)
        .map(([interest, count]) => ({ interest, count }))
        .sort((a, b) => a.interest.localeCompare(b.interest));
    } catch (error) {
      console.error('Ошибка получения интересов:', error);
      return [];
    }
  },

  // Получение статистики по опыту работы
  async getExperienceStats() {
    try {
      const users = await this.getAllUsers();
      const stats = {
        '0-1 год': 0,
        '2-3 года': 0,
        '4-5 лет': 0,
        '6-10 лет': 0,
        '10+ лет': 0
      };
      
      users.forEach(user => {
        const experience = user.experience_years || 0;
        if (experience <= 1) {
          stats['0-1 год']++;
        } else if (experience <= 3) {
          stats['2-3 года']++;
        } else if (experience <= 5) {
          stats['4-5 лет']++;
        } else if (experience <= 10) {
          stats['6-10 лет']++;
        } else {
          stats['10+ лет']++;
        }
      });
      
      return stats;
    } catch (error) {
      console.error('Ошибка получения статистики опыта:', error);
      return {};
    }
  }
};

// Утилиты для фильтрации данных из базы
export const filterUtils = {
  // Фильтрация пользователей по выбранным фильтрам
  filterUsers(users, filters, searchQuery) {
    return users.filter(user => {
      // Поиск по тексту
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const searchFields = [
          user.name,
          user.position,
          user.company,
          user.location,
          user.bio
        ];
        
        // Добавляем навыки и интересы к поиску
        try {
          if (user.skills) {
            const skills = JSON.parse(user.skills);
            if (Array.isArray(skills)) {
              searchFields.push(...skills);
            }
          }
          if (user.interests) {
            const interests = JSON.parse(user.interests);
            if (Array.isArray(interests)) {
              searchFields.push(...interests);
            }
          }
        } catch (e) {
          // Игнорируем ошибки парсинга JSON
        }
        
        const matchesSearch = searchFields.some(field => 
          field && field.toString().toLowerCase().includes(query)
        );
        
        if (!matchesSearch) return false;
      }

      // Фильтр по навыкам
      if (filters.skills && filters.skills.length > 0) {
        try {
          const userSkills = user.skills ? JSON.parse(user.skills) : [];
          const hasMatchingSkill = filters.skills.some(skill => 
            userSkills.includes(skill)
          );
          if (!hasMatchingSkill) return false;
        } catch (e) {
          return false;
        }
      }

      // Фильтр по интересам
      if (filters.interests && filters.interests.length > 0) {
        try {
          const userInterests = user.interests ? JSON.parse(user.interests) : [];
          const hasMatchingInterest = filters.interests.some(interest => 
            userInterests.includes(interest)
          );
          if (!hasMatchingInterest) return false;
        } catch (e) {
          return false;
        }
      }

      // Фильтр по должностям
      if (filters.positions && filters.positions.length > 0) {
        if (!filters.positions.includes(user.position)) return false;
      }

      // Фильтр по компаниям
      if (filters.companies && filters.companies.length > 0) {
        if (!filters.companies.includes(user.company)) return false;
      }

      // Фильтр по городам
      if (filters.locations && filters.locations.length > 0) {
        if (!filters.locations.includes(user.location)) return false;
      }

      // Фильтр по опыту работы
      if (filters.experience && filters.experience.length > 0) {
        const userExperience = user.experience_years || 0;
        const matchesExperience = filters.experience.some(expRange => {
          switch (expRange) {
            case '0-1 год':
              return userExperience <= 1;
            case '2-3 года':
              return userExperience >= 2 && userExperience <= 3;
            case '4-5 лет':
              return userExperience >= 4 && userExperience <= 5;
            case '6-10 лет':
              return userExperience >= 6 && userExperience <= 10;
            case '10+ лет':
              return userExperience > 10;
            default:
              return false;
          }
        });
        if (!matchesExperience) return false;
      }

      return true;
    });
  },

  // Сортировка пользователей
  sortUsers(users, sortBy) {
    const sorted = [...users];
    
    switch (sortBy) {
      case 'name':
        return sorted.sort((a, b) => a.name.localeCompare(b.name));
      case 'experience':
        return sorted.sort((a, b) => (b.experience_years || 0) - (a.experience_years || 0));
      case 'relevance':
      default:
        return sorted;
    }
  }
};
