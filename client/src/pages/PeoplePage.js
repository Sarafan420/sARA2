import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import Avatar from '../components/ui/Avatar';
import Input from '../components/ui/Input';
import { sortOptions } from '../data/filterData';
import { 
  MagnifyingGlassIcon,
  MapPinIcon,
  UserGroupIcon,
  Squares2X2Icon,
  ListBulletIcon,
  ChevronDownIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';

const PeoplePage = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilters, setSelectedFilters] = useState({
    skills: [],
    interests: [],
    positions: [],
    companies: [],
    locations: [],
    experience: []
  });
  const [viewMode, setViewMode] = useState('grid');
  const [sortBy, setSortBy] = useState('relevance');
  
  // Состояние для данных из базы
  const [users, setUsers] = useState([]);
  const [filterOptions, setFilterOptions] = useState({
    skills: [],
    interests: [],
    positions: [],
    companies: [],
    locations: [],
    experience: []
  });
  const [isLoading, setIsLoading] = useState(true);

  // Используем единые опции сортировки для людей
  const peopleSortOptions = sortOptions.people;

  // Загрузка данных из базы при монтировании компонента
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        // Загружаем пользователей из нового API
        const response = await fetch('http://localhost:5000/api/users');
        const data = await response.json();
        
        if (data.success) {
          setUsers(data.users);
          
          // Извлекаем уникальные значения для фильтров
          const skills = [...new Set(data.users.flatMap(user => user.skills))];
          const interests = [...new Set(data.users.flatMap(user => user.interests))];
          const positions = [...new Set(data.users.map(user => user.position).filter(Boolean))];
          const companies = [...new Set(data.users.map(user => user.company).filter(Boolean))];
          const locations = [...new Set(data.users.map(user => user.location).filter(Boolean))];
          
          setFilterOptions({
            skills: skills.map(skill => ({ value: skill, label: skill, count: data.users.filter(u => u.skills.includes(skill)).length })),
            interests: interests.map(interest => ({ value: interest, label: interest, count: data.users.filter(u => u.interests.includes(interest)).length })),
            positions: positions.map(position => ({ value: position, label: position, count: data.users.filter(u => u.position === position).length })),
            companies: companies.map(company => ({ value: company, label: company, count: data.users.filter(u => u.company === company).length })),
            locations: locations.map(location => ({ value: location, label: location, count: data.users.filter(u => u.location === location).length })),
            experience: [
              { value: '0-2', label: '0-2 года', count: data.users.filter(u => (u.experienceYears || 0) <= 2).length },
              { value: '3-5', label: '3-5 лет', count: data.users.filter(u => (u.experienceYears || 0) >= 3 && (u.experienceYears || 0) <= 5).length },
              { value: '6-10', label: '6-10 лет', count: data.users.filter(u => (u.experienceYears || 0) >= 6 && (u.experienceYears || 0) <= 10).length },
              { value: '10+', label: '10+ лет', count: data.users.filter(u => (u.experienceYears || 0) > 10).length }
            ]
          });
        }
      } catch (error) {
        console.error('Ошибка загрузки данных:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  // Фильтрация и сортировка с использованием данных из базы
  const filteredUsers = useMemo(() => {
    if (isLoading) return [];
    
    let filtered = users;
    
    // Поиск по тексту
    if (searchQuery) {
      filtered = filtered.filter(user => 
        user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.position?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.company?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.location?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    // Фильтрация по навыкам
    if (selectedFilters.skills.length > 0) {
      filtered = filtered.filter(user => 
        selectedFilters.skills.some(skill => user.skills.includes(skill))
      );
    }
    
    // Фильтрация по интересам
    if (selectedFilters.interests.length > 0) {
      filtered = filtered.filter(user => 
        selectedFilters.interests.some(interest => user.interests.includes(interest))
      );
    }
    
    // Фильтрация по позициям
    if (selectedFilters.positions.length > 0) {
      filtered = filtered.filter(user => 
        selectedFilters.positions.includes(user.position)
      );
    }
    
    // Фильтрация по компаниям
    if (selectedFilters.companies.length > 0) {
      filtered = filtered.filter(user => 
        selectedFilters.companies.includes(user.company)
      );
    }
    
    // Фильтрация по локациям
    if (selectedFilters.locations.length > 0) {
      filtered = filtered.filter(user => 
        selectedFilters.locations.includes(user.location)
      );
    }
    
    // Фильтрация по опыту
    if (selectedFilters.experience.length > 0) {
      filtered = filtered.filter(user => {
        const years = user.experienceYears || 0;
        return selectedFilters.experience.some(range => {
          switch (range) {
            case '0-2': return years <= 2;
            case '3-5': return years >= 3 && years <= 5;
            case '6-10': return years >= 6 && years <= 10;
            case '10+': return years > 10;
            default: return false;
          }
        });
      });
    }
    
    // Сортировка
    switch (sortBy) {
      case 'name':
        return filtered.sort((a, b) => a.name.localeCompare(b.name));
      case 'experience':
        return filtered.sort((a, b) => (b.experienceYears || 0) - (a.experienceYears || 0));
      case 'company':
        return filtered.sort((a, b) => (a.company || '').localeCompare(b.company || ''));
      case 'location':
        return filtered.sort((a, b) => (a.location || '').localeCompare(b.location || ''));
      default:
        return filtered;
    }
  }, [users, searchQuery, selectedFilters, sortBy, isLoading]);

  const handleFilterChange = (filterType, value) => {
    setSelectedFilters(prev => ({
      ...prev,
      [filterType]: prev[filterType].includes(value)
        ? prev[filterType].filter(item => item !== value)
        : [...prev[filterType], value]
    }));
  };

  const clearFilters = () => {
    setSelectedFilters({
      skills: [],
      interests: [],
      positions: [],
      companies: [],
      locations: [],
      experience: []
    });
    setSearchQuery('');
  };

  const hasActiveFilters = Object.values(selectedFilters).some(arr => arr.length > 0) || searchQuery;

  // Маппинг должностей на категории для пользователей
  const getUserCategory = (position) => {
    const categoryMap = {
      'Senior Frontend Developer': 'IT и разработка',
      'Frontend Developer': 'IT и разработка', 
      'Backend Developer': 'IT и разработка',
      'Full Stack Developer': 'IT и разработка',
      'Mobile Developer': 'IT и разработка',
      'DevOps Engineer': 'IT и разработка',
      'Security Engineer': 'IT и разработка',
      'System Administrator': 'IT и разработка',
      'UX/UI Дизайнер': 'Дизайн',
      'UX/UI Designer': 'Дизайн',
      'Product Manager': 'Продукт и аналитика',
      'Business Analyst': 'Продукт и аналитика',
      'QA Engineer': 'Тестирование',
      'Data Scientist': 'Data Science',
      'Project Manager': 'Управление проектами',
      'Marketing Manager': 'Маркетинг'
    };
    return categoryMap[position] || 'Другое';
  };

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-24 md:pb-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Люди и специалисты</h1>
          <p className="text-gray-600">Найдено {filteredUsers.length} специалистов</p>
        </div>

        <div className="flex gap-8">
          {/* Sidebar с фильтрами */}
          <div className="w-80 flex-shrink-0">
            <div className="sticky top-8 space-y-6">
              {/* Фильтры заголовок */}
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">Фильтры</h2>
                {hasActiveFilters && (
                  <Button variant="ghost" size="sm" onClick={clearFilters}>
                    Очистить
                  </Button>
                )}
              </div>

              {/* Поиск */}
              <Card padding="md">
                <h3 className="font-medium text-gray-900 mb-3">Поиск</h3>
                <Input
                  placeholder="Имя, должность, навыки..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  leftIcon={MagnifyingGlassIcon}
                />
              </Card>

              {/* Навыки */}
              <Card padding="md">
                <h3 className="font-medium text-gray-900 mb-3 flex items-center">
                  <SparklesIcon className="h-4 w-4 mr-2" />
                  Навыки
                </h3>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {filterOptions.skills.map(option => (
                    <label key={option.value} className="flex items-center justify-between cursor-pointer">
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          checked={selectedFilters.skills.includes(option.value)}
                          onChange={() => handleFilterChange('skills', option.value)}
                          className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                        />
                        <span className="ml-2 text-sm text-gray-700">{option.label}</span>
                      </div>
                      <span className="text-xs text-gray-500">{option.count}</span>
                    </label>
                  ))}
                </div>
              </Card>

              {/* Должности */}
              <Card padding="md">
                <h3 className="font-medium text-gray-900 mb-3">Должности</h3>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {filterOptions.positions.map(option => (
                    <label key={option.value} className="flex items-center justify-between cursor-pointer">
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          checked={selectedFilters.positions.includes(option.value)}
                          onChange={() => handleFilterChange('positions', option.value)}
                          className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                        />
                        <span className="ml-2 text-sm text-gray-700">{option.label}</span>
                      </div>
                      <span className="text-xs text-gray-500">{option.count}</span>
                    </label>
                  ))}
                </div>
              </Card>

              {/* Локации */}
              <Card padding="md">
                <h3 className="font-medium text-gray-900 mb-3">Город</h3>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {filterOptions.locations.map(option => (
                    <label key={option.value} className="flex items-center justify-between cursor-pointer">
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          checked={selectedFilters.locations.includes(option.value)}
                          onChange={() => handleFilterChange('locations', option.value)}
                          className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                        />
                        <span className="ml-2 text-sm text-gray-700">{option.label}</span>
                      </div>
                      <span className="text-xs text-gray-500">{option.count}</span>
                    </label>
                  ))}
                </div>
              </Card>

              {/* Компании */}
              <Card padding="md">
                <h3 className="font-medium text-gray-900 mb-3">Компания</h3>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {filterOptions.companies.map(option => (
                    <label key={option.value} className="flex items-center justify-between cursor-pointer">
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          checked={selectedFilters.companies.includes(option.value)}
                          onChange={() => handleFilterChange('companies', option.value)}
                          className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                        />
                        <span className="ml-2 text-sm text-gray-700">{option.label}</span>
                      </div>
                      <span className="text-xs text-gray-500">{option.count}</span>
                    </label>
                  ))}
                </div>
              </Card>

              {/* Уровень опыта */}
              <Card padding="md">
                <h3 className="font-medium text-gray-900 mb-3">Опыт работы</h3>
                <div className="space-y-2">
                  {filterOptions.experience.map(option => (
                    <label key={option.value} className="flex items-center justify-between cursor-pointer">
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          checked={selectedFilters.experience.includes(option.value)}
                          onChange={() => handleFilterChange('experience', option.value)}
                          className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                        />
                        <span className="ml-2 text-sm text-gray-700">{option.label}</span>
                      </div>
                      <span className="text-xs text-gray-500">{option.count}</span>
                    </label>
                  ))}
                </div>
              </Card>

              {/* Интересы */}
              <Card padding="md">
                <h3 className="font-medium text-gray-900 mb-3">Интересы</h3>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {filterOptions.interests.map(option => (
                    <label key={option.value} className="flex items-center justify-between cursor-pointer">
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          checked={selectedFilters.interests.includes(option.value)}
                          onChange={() => handleFilterChange('interests', option.value)}
                          className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                        />
                        <span className="ml-2 text-sm text-gray-700">{option.label}</span>
                      </div>
                      <span className="text-xs text-gray-500">{option.count}</span>
                    </label>
                  ))}
                </div>
              </Card>
            </div>
          </div>

          {/* Основной контент */}
          <div className="flex-1">
            {/* Тулбар с сортировкой и переключателем вида */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-4">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="text-sm border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  {peopleSortOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center space-x-2">
                <Button
                  variant={viewMode === 'grid' ? 'primary' : 'ghost'}
                  size="sm"
                  icon={Squares2X2Icon}
                  onClick={() => setViewMode('grid')}
                />
                <Button
                  variant={viewMode === 'list' ? 'primary' : 'ghost'}
                  size="sm"
                  icon={ListBulletIcon}
                  onClick={() => setViewMode('list')}
                />
              </div>
            </div>

            {/* Индикатор загрузки */}
            {isLoading && (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                <span className="ml-2 text-gray-600">Загрузка данных...</span>
              </div>
            )}

            {/* Список людей */}
            {!isLoading && (
              <div className={viewMode === 'grid' ? 'grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6' : 'space-y-4'}>
                <AnimatePresence>
                  {filteredUsers.map((user, index) => (
                  <motion.div
                    key={user.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ delay: index * 0.03, duration: 0.3 }}
                  >
                    <Card 
                      hover 
                      padding="lg" 
                      className="cursor-pointer text-center"
                      onClick={() => navigate(`/profile/${user.id}`)}
                    >
                      {/* Аватар */}
                      <div className="flex justify-center mb-4">
                        <Avatar
                          fallback={user.name}
                          size="xl"
                        />
                      </div>

                      {/* Основная информация */}
                      <div className="mb-4">
                        <h3 className="font-semibold text-gray-900 mb-1 hover:text-indigo-600 transition-colors">
                          {user.name}
                        </h3>
                        <p className="text-sm text-gray-600 mb-1">{user.position}</p>
                        <p className="text-sm text-gray-500">{user.company}</p>
                      </div>

                      {/* Локация и статус */}
                      <div className="flex items-center justify-center space-x-4 text-sm text-gray-600 mb-4">
                        <div className="flex items-center space-x-1">
                          <MapPinIcon className="h-4 w-4" />
                          <span>{user.location?.split(',')[0] || 'Не указано'}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <UserGroupIcon className="h-4 w-4" />
                          <span>{user.connections || 0}</span>
                        </div>
                      </div>

                      {/* Статус */}
                      <div className="mb-4">
                        <Badge 
                          variant={
                            user.status === 'Открыт к предложениям' ? 'success' :
                            user.status === 'Ищет работу' ? 'warning' : 'default'
                          } 
                          size="sm"
                        >
                          {user.status}
                        </Badge>
                      </div>

                      {/* Навыки */}
                      <div className="flex flex-wrap justify-center gap-1">
                        {(() => {
                          const skills = Array.isArray(user.skills) ? user.skills : [];
                          return skills.slice(0, 3).map((skill) => (
                            <Badge key={skill} variant="primary" size="sm">
                              {skill}
                            </Badge>
                          ));
                        })()}
                        {(() => {
                          const skills = Array.isArray(user.skills) ? user.skills : [];
                          return skills.length > 3 && (
                            <Badge variant="default" size="sm">
                              +{skills.length - 3}
                            </Badge>
                          );
                        })()}
                      </div>

                      {/* Категория */}
                      <div className="mt-3">
                        <Badge variant="default" size="sm">
                          {getUserCategory(user.position)}
                        </Badge>
                      </div>
                    </Card>
                  </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}

            {/* Пустое состояние */}
            {!isLoading && filteredUsers.length === 0 && (
              <Card padding="lg" className="text-center">
                <div className="py-12">
                  <UserGroupIcon className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Специалисты не найдены
                  </h3>
                  <p className="text-gray-500 mb-4">
                    Попробуйте изменить параметры поиска или сбросить фильтры
                  </p>
                  <Button variant="outline" onClick={clearFilters}>
                    Очистить фильтры
                  </Button>
                </div>
              </Card>
            )}

            {/* Пагинация */}
            {!isLoading && filteredUsers.length > 0 && (
              <div className="flex justify-center mt-8">
                <div className="flex items-center space-x-2">
                  <Button variant="outline" size="sm" disabled>
                    <ChevronDownIcon className="h-4 w-4 rotate-90" />
                  </Button>
                  <Button variant="primary" size="sm">1</Button>
                  <Button variant="outline" size="sm">2</Button>
                  <Button variant="outline" size="sm">3</Button>
                  <span className="px-2 text-gray-500">...</span>
                  <Button variant="outline" size="sm">8</Button>
                  <Button variant="outline" size="sm">
                    <ChevronDownIcon className="h-4 w-4 -rotate-90" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default PeoplePage;