// Единые данные для фильтров поиска (основаны на реальных данных из mockData.js)

import { mockUsers, mockVacancies } from './mockData.js';

// Извлечение уникальных значений из реальных данных
const extractUniqueValues = (data, field, subField = null) => {
  const values = data.map(item => 
    subField ? item[field]?.[subField] : item[field]
  ).filter(Boolean);
  
  if (Array.isArray(values[0])) {
    return [...new Set(values.flat())];
  }
  
  return [...new Set(values)];
};

// Подсчет количества элементов по категориям
const countByCategory = (data, field, value) => {
  return data.filter(item => {
    if (Array.isArray(item[field])) {
      return item[field].includes(value);
    }
    return item[field] === value;
  }).length;
};

// Маппинг должностей на категории (на основе данных из БД)
const positionToCategory = {
  'Senior Frontend Developer': 'IT и разработка',
  'Frontend Developer': 'IT и разработка', 
  'Backend Developer': 'IT и разработка',
  'Full-stack Developer': 'IT и разработка',
  'Mobile Developer': 'IT и разработка',
  'DevOps Engineer': 'IT и разработка',
  'Security Engineer': 'IT и разработка',
  'System Administrator': 'IT и разработка',
  'UX/UI Designer': 'Дизайн',
  'Product Manager': 'Продукт и аналитика',
  'Business Analyst': 'Продукт и аналитика',
  'QA Engineer': 'Тестирование',
  'Data Analyst': 'Data Science',
  'Data Scientist': 'Data Science',
  'Project Manager': 'Управление проектами',
  'Marketing Manager': 'Маркетинг',
  'HR Manager': 'HR и управление персоналом'
};

// Получение категорий из должностей пользователей
const getUserCategories = () => {
  const categories = {};
  
  mockUsers.forEach(user => {
    const category = positionToCategory[user.position] || 'Другое';
    categories[category] = (categories[category] || 0) + 1;
  });

  return Object.entries(categories)
    .map(([value, count]) => ({ value, label: value, count }))
    .sort((a, b) => b.count - a.count);
};

// Извлечение всех навыков
const getAllSkills = () => {
  const userSkills = extractUniqueValues(mockUsers, 'skills');
  const vacancySkills = extractUniqueValues(mockVacancies, 'skills');
  const allSkills = [...new Set([...userSkills, ...vacancySkills])];
  
  // Группировка навыков по категориям (на основе данных из БД)
  const skillCategories = {
    'Frontend': ['React', 'JavaScript', 'TypeScript', 'Node.js'],
    'Backend': ['Python', 'Node.js', 'PostgreSQL', 'Java', 'Spring', 'Redis', 'Microservices'],
    'Mobile': ['React Native', 'Flutter', 'iOS', 'Android', 'JavaScript'],
    'Design': ['Figma', 'Adobe XD', 'Sketch', 'Prototyping', 'User Research'],
    'DevOps': ['Docker', 'Kubernetes', 'AWS', 'Jenkins', 'Terraform'],
    'Testing': ['Testing', 'Automation', 'Selenium', 'API Testing', 'Bug Tracking'],
    'Data': ['Python', 'SQL', 'Tableau', 'Machine Learning', 'Statistics'],
    'Management': ['HR Management', 'Recruitment', 'Team Building', 'Communication', 'Marketing', 'Analytics', 'Social Media', 'Content Creation'],
    'Marketing': ['Marketing', 'Analytics', 'Social Media', 'Content Creation'],
    'Security': ['Cybersecurity', 'Penetration Testing', 'SIEM', 'Network Security'],
    'System': ['Linux', 'Windows Server', 'Network', 'Security', 'Monitoring']
  };

  return { allSkills, skillCategories };
};

// Получение категорий вакансий
const getVacancyCategories = () => {
  const typeToCategory = {
    'regular': 'IT и разработка',
    'freelance': 'Фриланс',
    'internship': 'Стажировка',
    'creative': 'Творческие проекты'
  };
  
  const categories = {};
  
  mockVacancies.forEach(vacancy => {
    const category = typeToCategory[vacancy.type] || 'Другое';
    categories[category] = (categories[category] || 0) + 1;
  });

  return Object.entries(categories)
    .map(([value, count]) => ({ value, label: value, count }))
    .sort((a, b) => b.count - a.count);
};

// Основные данные фильтров
export const filterData = {
  // Категории профессий (основаны на реальных данных пользователей)
  categories: getUserCategories(),
  
  // Категории вакансий (для страницы вакансий)
  vacancyCategories: getVacancyCategories(),

  // Локации (из реальных данных)
  locations: [
    { value: 'Москва', label: 'Москва', count: countByCategory(mockUsers, 'location', 'Москва') },
    { value: 'Санкт-Петербург', label: 'Санкт-Петербург', count: countByCategory(mockUsers, 'location', 'Санкт-Петербург') },
    { value: 'Удаленно', label: 'Удаленно', count: 0 }
  ].filter(location => location.count > 0 || location.value === 'Удаленно'),

  // Форматы работы
  workFormats: [
    { value: 'Удаленно', label: 'Удаленно' },
    { value: 'Офис', label: 'Офис' },
    { value: 'Гибрид', label: 'Гибрид' }
  ],

  // Уровни опыта
  experience: [
    { value: 'Без опыта', label: 'Без опыта' },
    { value: '1-3 года', label: '1-3 года' },
    { value: '3-6 лет', label: '3-6 лет' },
    { value: '6+ лет', label: '6+ лет' }
  ],

  // Образование
  education: [
    { value: 'Высшее', label: 'Высшее' },
    { value: 'Среднее специальное', label: 'Среднее специальное' },
    { value: 'Среднее', label: 'Среднее' },
    { value: 'Не требуется', label: 'Не требуется' }
  ],

  // Компании (из реальных данных)
  companies: [...new Set(mockUsers.map(user => user.company))].map(company => ({
    value: company,
    label: company,
    count: countByCategory(mockUsers, 'company', company)
  })).sort((a, b) => b.count - a.count),

  // Статусы поиска работы
  jobSearchStatus: [
    { value: 'Открыт к предложениям', label: 'Открыт к предложениям' },
    { value: 'Активно ищет', label: 'Активно ищет' },
    { value: 'Ищет работу', label: 'Ищет работу' },
    { value: 'Рассматривает предложения', label: 'Рассматривает предложения' },
    { value: 'Не ищет', label: 'Не ищет' }
  ],

  // Навыки
  skills: getAllSkills(),

  // Зарплатные диапазоны
  salaryRanges: [
    { value: '0-50000', label: 'До 50 000 ₽' },
    { value: '50000-100000', label: '50 000 - 100 000 ₽' },
    { value: '100000-150000', label: '100 000 - 150 000 ₽' },
    { value: '150000-200000', label: '150 000 - 200 000 ₽' },
    { value: '200000-300000', label: '200 000 - 300 000 ₽' },
    { value: '300000+', label: 'От 300 000 ₽' }
  ],

  // Типы занятости
  employmentTypes: [
    { value: 'Полная занятость', label: 'Полная занятость' },
    { value: 'Частичная занятость', label: 'Частичная занятость' },
    { value: 'Проектная работа', label: 'Проектная работа' },
    { value: 'Стажировка', label: 'Стажировка' },
    { value: 'Фриланс', label: 'Фриланс' }
  ]
};

// Опции сортировки
export const sortOptions = {
  // Для вакансий
  vacancies: [
    { value: 'relevance', label: 'По релевантности' },
    { value: 'newest', label: 'Сначала новые' },
    { value: 'oldest', label: 'Сначала старые' },
    { value: 'salary-high', label: 'Зарплата: по убыванию' },
    { value: 'salary-low', label: 'Зарплата: по возрастанию' },
    { value: 'company', label: 'По компании' }
  ],

  // Для людей
  people: [
    { value: 'relevance', label: 'По релевантности' },
    { value: 'connections', label: 'По количеству связей' },
    { value: 'activity', label: 'По активности' },
    { value: 'experience', label: 'По опыту' },
    { value: 'name', label: 'По имени' },
    { value: 'company', label: 'По компании' }
  ],

  // Универсальные
  universal: [
    { value: 'relevance', label: 'По релевантности' },
    { value: 'newest', label: 'Сначала новые' },
    { value: 'popular', label: 'По популярности' },
    { value: 'rating', label: 'По рейтингу' }
  ]
};

// Функции для работы с фильтрами
export const filterUtils = {
  // Получить отфильтрованные данные
  filterData: (data, filters, searchQuery = '') => {
    return data.filter(item => {
      // Поиск по тексту
      const matchesSearch = !searchQuery || 
        Object.values(item).some(value => 
          typeof value === 'string' && 
          value.toLowerCase().includes(searchQuery.toLowerCase())
        ) ||
        (Array.isArray(item.skills) && 
         item.skills.some(skill => 
           skill.toLowerCase().includes(searchQuery.toLowerCase())
         ));

      // Фильтры по категориям
      const matchesFilters = Object.entries(filters).every(([filterType, filterValues]) => {
        // Проверяем, что filterValues является массивом и не пустым
        if (!Array.isArray(filterValues) || filterValues.length === 0) return true;
        
        // Специальная обработка для salaryRange
        if (filterType === 'salaryRange') {
          const [minSalary, maxSalary] = filterValues;
          if (minSalary === 0 && maxSalary === 100000) return true; // По умолчанию показываем все
          
          // Извлекаем числовое значение из строки зарплаты
          const salaryMatch = item.salary?.match(/(\d+)/);
          if (!salaryMatch) return true;
          
          const salary = parseInt(salaryMatch[1]);
          return salary >= minSalary && salary <= maxSalary;
        }
        
        const itemValue = item[filterType];
        
        if (Array.isArray(itemValue)) {
          return filterValues.some(value => itemValue.includes(value));
        }
        
        return filterValues.includes(itemValue);
      });

      return matchesSearch && matchesFilters;
    });
  },

  // Сортировка данных
  sortData: (data, sortBy) => {
    const sortedData = [...data];
    
    switch (sortBy) {
      case 'newest':
        return sortedData.reverse(); // Предполагаем, что данные уже отсортированы по дате создания
      
      case 'oldest':
        return sortedData;
      
      case 'connections':
        return sortedData.sort((a, b) => (b.connections || 0) - (a.connections || 0));
      
      case 'experience':
        return sortedData.sort((a, b) => {
          const aExp = parseInt(a.experience?.replace(/\D/g, '') || '0');
          const bExp = parseInt(b.experience?.replace(/\D/g, '') || '0');
          return bExp - aExp;
        });
      
      case 'name':
        return sortedData.sort((a, b) => (a.name || a.title || '').localeCompare(b.name || b.title || ''));
      
      case 'company':
        return sortedData.sort((a, b) => (a.company || '').localeCompare(b.company || ''));
      
      case 'salary-high':
        return sortedData.sort((a, b) => {
          const aSalary = parseInt(a.salary?.split('-')[1]?.replace(/\D/g, '') || '0');
          const bSalary = parseInt(b.salary?.split('-')[1]?.replace(/\D/g, '') || '0');
          return bSalary - aSalary;
        });
      
      case 'salary-low':
        return sortedData.sort((a, b) => {
          const aSalary = parseInt(a.salary?.split('-')[0]?.replace(/\D/g, '') || '0');
          const bSalary = parseInt(b.salary?.split('-')[0]?.replace(/\D/g, '') || '0');
          return aSalary - bSalary;
        });
      
      case 'relevance':
      default:
        return sortedData; // Может быть добавлена логика релевантности
    }
  },

  // Получить активные фильтры
  getActiveFilters: (filters) => {
    return Object.entries(filters).reduce((active, [key, value]) => {
      if (Array.isArray(value) && value.length > 0) {
        active[key] = value;
      } else if (typeof value === 'object' && value !== null) {
        const hasValues = Object.values(value).some(v => v && v !== '');
        if (hasValues) {
          active[key] = value;
        }
      } else if (value && value !== '' && value !== 'all') {
        active[key] = value;
      }
      return active;
    }, {});
  },

  // Очистить все фильтры
  clearAllFilters: () => ({
    category: [],
    workFormat: [],
    education: [],
    experience: [],
    companies: [],
    skills: [],
    salary: { min: '', max: '' },
    employmentTypes: []
  })
};

export default filterData;
