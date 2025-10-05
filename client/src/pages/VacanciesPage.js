import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Layout from '../components/layout/Layout';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import Input from '../components/ui/Input';
import Spinner from '../components/ui/Spinner';
import Avatar from '../components/ui/Avatar';
import RecruiterInfo from '../components/RecruiterInfo';
import { filterData, sortOptions, filterUtils } from '../data/filterData';
import { 
  MagnifyingGlassIcon,
  FunnelIcon,
  CurrencyDollarIcon,
  ClockIcon,
  BookmarkIcon,
  Squares2X2Icon,
  ListBulletIcon,
  HeartIcon,
  ChevronDownIcon,
  MapPinIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon
} from '@heroicons/react/24/outline';
import { BookmarkIcon as BookmarkIconSolid, HeartIcon as HeartIconSolid } from '@heroicons/react/24/solid';

const VacanciesPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'all'); // 'all' или 'my'
  const [action, setAction] = useState(searchParams.get('action') || null); // 'duplicate', 'responses', etc.
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilters, setSelectedFilters] = useState({
    category: [],
    workFormat: [],
    salaryRange: [0, 100000],
    education: []
  });
  const [savedVacancies, setSavedVacancies] = useState(new Set());
  const [likedVacancies, setLikedVacancies] = useState(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' или 'list'
  const [sortBy, setSortBy] = useState('relevance');
  const [vacancies, setVacancies] = useState([]);
  const [myVacancies, setMyVacancies] = useState([]);

  // Обработка действий из URL параметров
  useEffect(() => {
    const actionParam = searchParams.get('action');
    if (actionParam) {
      setAction(actionParam);
      
      if (actionParam === 'duplicate') {
        // Логика для дублирования вакансии
        console.log('Дублирование вакансии');
        // Здесь можно добавить логику для выбора вакансии для дублирования
      } else if (actionParam === 'responses') {
        // Переключаемся на вкладку "Мои вакансии" для просмотра откликов
        setActiveTab('my');
        setSearchParams({ tab: 'my', action: 'responses' });
      }
    }
  }, [searchParams, setSearchParams]);

  // Загружаем вакансии из API
  useEffect(() => {
    fetchVacancies();
    if (user) {
      fetchMyVacancies();
    }
  }, [user]);

  const fetchVacancies = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('http://localhost:5000/api/vacancies');
      if (response.ok) {
        const data = await response.json();
        const formattedVacancies = data.vacancies.map(vacancy => ({
          ...vacancy,
          posted: getRelativeTime(vacancy.createdAt),
          urgent: Math.random() > 0.8,
          remote: vacancy.location === 'Удаленно',
          category: getCategoryFromType(vacancy.type),
          workFormat: getWorkFormat(vacancy.location),
          education: 'Высшее',
          experience: vacancy.experienceLevel || '1-3 года',
          isLiked: false,
          isSaved: false,
          skills: Array.isArray(vacancy.skillsRequired) ? vacancy.skillsRequired : []
        }));
        setVacancies(formattedVacancies);
      } else {
        console.error('Failed to fetch vacancies');
      }
    } catch (error) {
      console.error('Error fetching vacancies:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchMyVacancies = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`http://localhost:5000/api/vacancies/user/${user.id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        const formattedVacancies = data.vacancies.map(vacancy => ({
          ...vacancy,
          posted: getRelativeTime(vacancy.createdAt),
          urgent: Math.random() > 0.8,
          remote: vacancy.location === 'Удаленно',
          category: getCategoryFromType(vacancy.type),
          workFormat: getWorkFormat(vacancy.location),
          education: 'Высшее',
          experience: vacancy.experienceLevel || '1-3 года',
          isLiked: false,
          isSaved: false,
          skills: Array.isArray(vacancy.skillsRequired) ? vacancy.skillsRequired : []
        }));
        setMyVacancies(formattedVacancies);
      } else {
        console.error('Failed to fetch my vacancies');
      }
    } catch (error) {
      console.error('Error fetching my vacancies:', error);
    }
  };

  // Вспомогательные функции для преобразования данных
  const getRelativeTime = (date) => {
    if (!date) return 'недавно';
    const now = new Date();
    const past = new Date(date);
    const diffInHours = (now - past) / (1000 * 60 * 60);
    
    if (diffInHours < 1) return 'недавно';
    if (diffInHours < 24) return `${Math.floor(diffInHours)} ч назад`;
    if (diffInHours < 168) return `${Math.floor(diffInHours / 24)} дн назад`;
    return `${Math.floor(diffInHours / 168)} нед назад`;
  };

  const getCategoryFromType = (type) => {
    const categoryMap = {
      'Полный день': 'IT и разработка',
      'Частичная занятость': 'Фриланс',
      'Удаленно': 'Удаленная работа'
    };
    return categoryMap[type] || 'IT и разработка';
  };

  const getWorkFormat = (location) => {
    if (location === 'Удаленно') return 'Удаленно';
    if (location.includes('Москва') || location.includes('Санкт-Петербург')) return 'Гибрид';
    return 'Офис';
  };


  // Используем единые опции фильтров
  const vacancySortOptions = sortOptions.vacancies;

  // Фильтрация и сортировка с использованием единых утилит
  const filteredVacancies = useMemo(() => {
    const currentVacancies = activeTab === 'my' ? myVacancies : vacancies;
    console.log('🔍 Фильтрация вакансий:');
    console.log('- Активная вкладка:', activeTab);
    console.log('- Всего вакансий:', currentVacancies.length);
    console.log('- Поисковый запрос:', searchQuery);
    console.log('- Фильтры:', selectedFilters);
    
    const filtered = filterUtils.filterData(currentVacancies, selectedFilters, searchQuery);
    console.log('- После фильтрации:', filtered.length);
    
    const sorted = filterUtils.sortData(filtered, sortBy, 'vacancies');
    console.log('- После сортировки:', sorted.length);
    
    return sorted;
  }, [activeTab, vacancies, myVacancies, searchQuery, selectedFilters, sortBy]);

  const handleFilterChange = (filterType, value) => {
    setSelectedFilters(prev => ({
      ...prev,
      [filterType]: prev[filterType].includes(value)
        ? prev[filterType].filter(item => item !== value)
        : [...prev[filterType], value]
    }));
  };

  const toggleSaveVacancy = (vacancyId) => {
    setSavedVacancies(prev => {
      const newSet = new Set(prev);
      if (newSet.has(vacancyId)) {
        newSet.delete(vacancyId);
      } else {
        newSet.add(vacancyId);
      }
      return newSet;
    });
  };

  const toggleLikeVacancy = (vacancyId) => {
    setLikedVacancies(prev => {
      const newSet = new Set(prev);
      if (newSet.has(vacancyId)) {
        newSet.delete(vacancyId);
      } else {
        newSet.add(vacancyId);
      }
      return newSet;
    });
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    // Сохраняем action параметр при переключении вкладок
    const newParams = { tab };
    if (action) {
      newParams.action = action;
    }
    setSearchParams(newParams);
  };

  const handleDeleteVacancy = async (vacancyId) => {
    if (!window.confirm('Вы уверены, что хотите удалить эту вакансию?')) {
      return;
    }

    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`http://localhost:5000/api/vacancies/${vacancyId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        // Обновляем список моих вакансий
        setMyVacancies(prev => prev.filter(v => v.id !== vacancyId));
        // Также обновляем общий список, если вакансия там есть
        setVacancies(prev => prev.filter(v => v.id !== vacancyId));
      } else {
        console.error('Failed to delete vacancy');
      }
    } catch (error) {
      console.error('Error deleting vacancy:', error);
    }
  };

  const clearFilters = () => {
    setSelectedFilters(filterUtils.clearAllFilters());
    setSearchQuery('');
  };

  const hasActiveFilters = Object.keys(filterUtils.getActiveFilters(selectedFilters)).length > 0 || searchQuery;

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-24 md:pb-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Подработки и временная работа</h1>
          <p className="text-gray-600">Найдено {filteredVacancies.length} вакансий</p>
          
          {/* Вкладки */}
          <div className="mt-6">
            <div className="border-b border-gray-200">
              <nav className="-mb-px flex space-x-8">
                <button
                  onClick={() => handleTabChange('all')}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'all'
                      ? 'border-indigo-500 text-indigo-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Все вакансии
                </button>
                {user && (
                  <button
                    onClick={() => handleTabChange('my')}
                    className={`py-2 px-1 border-b-2 font-medium text-sm ${
                      activeTab === 'my'
                        ? 'border-indigo-500 text-indigo-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    Мои вакансии ({myVacancies.length})
                  </button>
                )}
              </nav>
            </div>
          </div>
          
          {/* Кнопка создания вакансии для вкладки "Мои вакансии" */}
          {activeTab === 'my' && user && (
            <div className="mt-4 flex items-center justify-between">
              <Button
                variant="primary"
                icon={PlusIcon}
                onClick={() => navigate('/create-vacancy')}
              >
                Создать вакансию
              </Button>
              {action === 'responses' && (
                <div className="text-sm text-blue-600 font-medium">
                  Просмотр откликов на вакансии
                </div>
              )}
            </div>
          )}
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
                  placeholder="Введите ключевые слова..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  leftIcon={MagnifyingGlassIcon}
                />
              </Card>

              {/* Категории */}
              <Card padding="md">
                <h3 className="font-medium text-gray-900 mb-3">Категория</h3>
                <div className="space-y-2">
                  {filterData.vacancyCategories.map(option => (
                    <label key={option.value} className="flex items-center justify-between cursor-pointer">
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          checked={selectedFilters.category.includes(option.value)}
                          onChange={() => handleFilterChange('category', option.value)}
                          className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                        />
                        <span className="ml-2 text-sm text-gray-700">{option.label}</span>
                      </div>
                      <span className="text-xs text-gray-500">{option.count}</span>
                    </label>
                  ))}
                </div>
              </Card>

              {/* Формат работы */}
              <Card padding="md">
                <h3 className="font-medium text-gray-900 mb-3">Формат работы</h3>
                <div className="space-y-2">
                  {filterData.workFormats.map(option => (
                    <label key={option.value} className="flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedFilters.workFormat.includes(option.value)}
                        onChange={() => handleFilterChange('workFormat', option.value)}
                        className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">{option.label}</span>
                    </label>
                  ))}
                </div>
              </Card>

              {/* Зарплата */}
              <Card padding="md">
                <h3 className="font-medium text-gray-900 mb-3">Зарплата (₽)</h3>
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-600">От</span>
                    <input
                      type="number"
                      placeholder="0"
                      className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-600">До</span>
                    <input
                      type="number"
                      placeholder="100 000"
                      className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                  <Button variant="primary" size="sm" className="w-full">
                    Применить фильтры
                  </Button>
                </div>
              </Card>

              {/* Образование */}
              <Card padding="md">
                <h3 className="font-medium text-gray-900 mb-3">Образование</h3>
                <div className="space-y-2">
                  {filterData.education.map(option => (
                    <label key={option.value} className="flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedFilters.education.includes(option.value)}
                        onChange={() => handleFilterChange('education', option.value)}
                        className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">{option.label}</span>
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
                  {vacancySortOptions.map(option => (
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

            {/* Список вакансий */}
            {isLoading ? (
              <div className="flex justify-center py-12">
                <Spinner size="lg" />
              </div>
            ) : (
              <div className="space-y-4">
                <AnimatePresence>
                  {filteredVacancies.map((vacancy, index) => (
                    <motion.div
                      key={vacancy.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ delay: index * 0.03, duration: 0.3 }}
                    >
                      <Card 
                        hover 
                        padding="lg" 
                        className="cursor-pointer group"
                        onClick={() => navigate(`/vacancies/${vacancy.id}`)}
                      >
                        <div className="flex items-center space-x-4">
                          {/* Логотип компании */}
                          <div className="flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden">
                            <img
                              src={vacancy.companyLogo}
                              alt={vacancy.company}
                              className="w-full h-full object-cover"
                            />
                          </div>

                          {/* Основная информация */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <h3 className="font-semibold text-gray-900 mb-1 group-hover:text-indigo-600 transition-colors">
                                  {vacancy.title}
                                </h3>
                                <p className="text-sm text-gray-600 mb-2">{vacancy.company}</p>
                                
                                {/* Информация о вакансии */}
                                <div className="flex items-center space-x-4 text-sm text-gray-600 mb-2">
                                  <div className="flex items-center space-x-1">
                                    <MapPinIcon className="h-4 w-4" />
                                    <span>{vacancy.location}</span>
                                  </div>
                                  <div className="flex items-center space-x-1">
                                    <CurrencyDollarIcon className="h-4 w-4" />
                                    <span>
                                      {vacancy.salaryMin && vacancy.salaryMax 
                                        ? `${vacancy.salaryMin.toLocaleString()}-${vacancy.salaryMax.toLocaleString()} ₽`
                                        : vacancy.salaryMin 
                                          ? `от ${vacancy.salaryMin.toLocaleString()} ₽`
                                          : 'По договоренности'
                                      }
                                    </span>
                                  </div>
                                  <div className="flex items-center space-x-1">
                                    <ClockIcon className="h-4 w-4" />
                                    <span>{vacancy.posted}</span>
                                  </div>
                                </div>

                                {/* Рекрутер */}
                                {vacancy.user && (
                                  <div className="flex items-center space-x-2 text-sm text-gray-600 mb-2">
                                    <span className="text-gray-500">Рекрутер:</span>
                                    <div 
                                      className="cursor-pointer hover:opacity-80 transition-opacity"
                                      onClick={() => navigate(`/profile/${vacancy.user.id}`)}
                                    >
                                      <Avatar 
                                        fallback={vacancy.user.name}
                                        size="xs" 
                                      />
                                    </div>
                                    <span 
                                      className="font-medium cursor-pointer hover:text-indigo-600 transition-colors"
                                      onClick={() => navigate(`/profile/${vacancy.user.id}`)}
                                    >
                                      {vacancy.user.name}
                                    </span>
                                    {vacancy.user.company && (
                                      <span className="text-gray-500">• {vacancy.user.company}</span>
                                    )}
                                  </div>
                                )}

                                {/* Навыки */}
                                <div className="flex flex-wrap gap-2">
                                  {vacancy.skills.map((skill) => (
                                    <Badge 
                                      key={skill} 
                                      variant={skill === 'Удаленно' ? 'success' : skill === 'Гибрид' ? 'warning' : 'primary'} 
                                      size="sm"
                                    >
                                      {skill}
                                    </Badge>
                                  ))}
                                </div>
                              </div>

                              {/* Действия */}
                              <div className="flex items-center space-x-1 ml-4">
                                {activeTab === 'my' ? (
                                  // Кнопки для моих вакансий
                                  <>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      icon={PencilIcon}
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        navigate(`/vacancies/${vacancy.id}/edit`);
                                      }}
                                      className="text-blue-500 hover:text-blue-600"
                                    />
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      icon={TrashIcon}
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleDeleteVacancy(vacancy.id);
                                      }}
                                      className="text-red-500 hover:text-red-600"
                                    />
                                  </>
                                ) : (
                                  // Кнопки для всех вакансий
                                  <>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      icon={likedVacancies.has(vacancy.id) ? HeartIconSolid : HeartIcon}
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        toggleLikeVacancy(vacancy.id);
                                      }}
                                      className={likedVacancies.has(vacancy.id) ? 'text-red-500 hover:text-red-600' : 'text-gray-400 hover:text-red-500'}
                                    />
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      icon={savedVacancies.has(vacancy.id) ? BookmarkIconSolid : BookmarkIcon}
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        toggleSaveVacancy(vacancy.id);
                                      }}
                                      className={savedVacancies.has(vacancy.id) ? 'text-indigo-500 hover:text-indigo-600' : 'text-gray-400 hover:text-indigo-500'}
                                    />
                                  </>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </Card>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}

            {/* Пустое состояние */}
            {!isLoading && filteredVacancies.length === 0 && (
              <Card padding="lg" className="text-center">
                <div className="py-12">
                  <FunnelIcon className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Вакансии не найдены
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
            {!isLoading && filteredVacancies.length > 0 && (
              <div className="flex justify-center mt-8">
                <div className="flex items-center space-x-2">
                  <Button variant="outline" size="sm" disabled>
                    <ChevronDownIcon className="h-4 w-4 rotate-90" />
                  </Button>
                  <Button variant="primary" size="sm">1</Button>
                  <Button variant="outline" size="sm">2</Button>
                  <Button variant="outline" size="sm">3</Button>
                  <span className="px-2 text-gray-500">...</span>
                  <Button variant="outline" size="sm">15</Button>
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

export default VacanciesPage;