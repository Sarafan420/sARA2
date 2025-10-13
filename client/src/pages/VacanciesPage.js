import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { AnimatePresence } from 'framer-motion';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Layout from '../components/layout/Layout';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Spinner from '../components/ui/Spinner';
import VacancyCard from '../components/VacancyCard';
import { sortOptions } from '../data/filterData';
import { 
  MagnifyingGlassIcon,
  FunnelIcon,
  Squares2X2Icon,
  ListBulletIcon,
  ChevronDownIcon,
  PlusIcon
} from '@heroicons/react/24/outline';

const VacanciesPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'all'); // 'all' или 'my'
  const [action, setAction] = useState(searchParams.get('action') || null); // 'duplicate', 'responses', etc.
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilters, setSelectedFilters] = useState({
    vacancyType: [],
    workFormat: [],
    workingStyle: [],
    experienceLevel: [],
    fields: [],
    skills: [],
    salaryRange: [0, 500000],
    location: []
  });
  const [savedVacancies, setSavedVacancies] = useState(new Set());
  const [likedVacancies, setLikedVacancies] = useState(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState('list'); // 'grid' или 'list'
  const [sortBy, setSortBy] = useState('relevance');
  const [vacancies, setVacancies] = useState([]);
  const [myVacancies, setMyVacancies] = useState([]);
  const [referenceData, setReferenceData] = useState({
    vacancyTypes: [],
    fields: [],
    skills: [],
    workFormats: [],
    workingStyles: []
  });

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

  // Вспомогательные функции для преобразования данных
  const getRelativeTime = (date) => {
    if (!date) return 'недавно';
    const now = new Date();
    const past = new Date(date);
    const diffInHours = (now - past) / (1000 * 60 * 60);
    if (diffInHours < 1) return 'только что';
    if (diffInHours < 24) return `${Math.floor(diffInHours)} ч назад`;
    if (diffInHours < 168) return `${Math.floor(diffInHours / 24)} дн назад`;
    return `${Math.floor(diffInHours / 168)} нед назад`;
  };

  const fetchReferenceData = useCallback(async () => {
    try {
      const response = await fetch('http://localhost:5000/api/vacancies/reference-data');
      if (response.ok) {
        const data = await response.json();
        setReferenceData(data.data);
      }
    } catch (error) {
      console.error('Error fetching reference data:', error);
    }
  }, []);

  const fetchVacancies = useCallback(async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem('authToken');
      const response = await fetch('http://localhost:5000/api/vacancies', {
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
          remote: vacancy.workFormat?.name === 'Удаленно',
          category: vacancy.vacancyType?.name || 'Обычная вакансия',
          workFormat: vacancy.workFormat?.name || 'Офис',
          workingStyle: vacancy.workingStyle?.name || 'Полный день',
          experience: vacancy.experienceLevel || 'Middle',
          isLiked: false,
          isSaved: false,
          skills: vacancy.skills || [],
          fields: vacancy.fields || [],
          offers: vacancy.offers || [],
          participantReceives: vacancy.participantReceives || [],
          connectionInfo: vacancy.connectionInfo || null
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
  }, []);

  const fetchMyVacancies = useCallback(async () => {
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
          remote: vacancy.workFormat?.name === 'Удаленно',
          category: vacancy.vacancyType?.name || 'Обычная вакансия',
          workFormat: vacancy.workFormat?.name || 'Офис',
          workingStyle: vacancy.workingStyle?.name || 'Полный день',
          experience: vacancy.experienceLevel || 'Middle',
          isLiked: false,
          isSaved: false,
          skills: vacancy.skills || [],
          fields: vacancy.fields || [],
          offers: vacancy.offers || [],
          participantReceives: vacancy.participantReceives || [],
          connectionInfo: vacancy.connectionInfo || null
        }));
        setMyVacancies(formattedVacancies);
      } else {
        console.error('Failed to fetch my vacancies');
      }
    } catch (error) {
      console.error('Error fetching my vacancies:', error);
    }
  }, [user]);

  // Загружаем данные из API
  useEffect(() => {
    fetchReferenceData();
    if (user) {
      fetchVacancies();
      fetchMyVacancies();
    }
  }, [user, fetchReferenceData, fetchVacancies, fetchMyVacancies]);



  // Используем единые опции фильтров
  const vacancySortOptions = sortOptions.vacancies;

  // Фильтрация и сортировка с использованием новой структуры данных
  const filteredVacancies = useMemo(() => {
    const currentVacancies = activeTab === 'my' ? myVacancies : vacancies;
    console.log('🔍 Фильтрация вакансий:');
    console.log('- Активная вкладка:', activeTab);
    console.log('- Всего вакансий:', currentVacancies.length);
    console.log('- Поисковый запрос:', searchQuery);
    console.log('- Фильтры:', selectedFilters);
    
    let filtered = [...currentVacancies];
    
    // Поиск по тексту
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(vacancy => 
        vacancy.title.toLowerCase().includes(query) ||
        vacancy.company.toLowerCase().includes(query) ||
        vacancy.description?.toLowerCase().includes(query) ||
        vacancy.skills.some(skill => skill.name?.toLowerCase().includes(query)) ||
        vacancy.fields.some(field => field.name?.toLowerCase().includes(query))
      );
    }
    
    // Фильтр по типу вакансии
    if (selectedFilters.vacancyType.length > 0) {
      filtered = filtered.filter(vacancy => 
        selectedFilters.vacancyType.includes(vacancy.vacancyType?.name)
      );
    }
    
    // Фильтр по формату работы
    if (selectedFilters.workFormat.length > 0) {
      filtered = filtered.filter(vacancy => 
        selectedFilters.workFormat.includes(vacancy.workFormat)
      );
    }
    
    // Фильтр по стилю работы
    if (selectedFilters.workingStyle.length > 0) {
      filtered = filtered.filter(vacancy => 
        selectedFilters.workingStyle.includes(vacancy.workingStyle)
      );
    }
    
    // Фильтр по уровню опыта
    if (selectedFilters.experienceLevel.length > 0) {
      filtered = filtered.filter(vacancy => 
        selectedFilters.experienceLevel.includes(vacancy.experience)
      );
    }
    
    // Фильтр по сферам деятельности
    if (selectedFilters.fields.length > 0) {
      filtered = filtered.filter(vacancy => 
        vacancy.fields.some(field => selectedFilters.fields.includes(field.name))
      );
    }
    
    // Фильтр по навыкам
    if (selectedFilters.skills.length > 0) {
      filtered = filtered.filter(vacancy => 
        vacancy.skills.some(skill => selectedFilters.skills.includes(skill.name))
      );
    }
    
    // Фильтр по зарплате
    if (selectedFilters.salaryRange[0] > 0 || selectedFilters.salaryRange[1] < 500000) {
      filtered = filtered.filter(vacancy => {
        const minSalary = vacancy.salaryMin || 0;
        const maxSalary = vacancy.salaryMax || 0;
        return (minSalary >= selectedFilters.salaryRange[0] && 
                (maxSalary === 0 || maxSalary <= selectedFilters.salaryRange[1]));
      });
    }
    
    // Фильтр по локации
    if (selectedFilters.location.length > 0) {
      filtered = filtered.filter(vacancy => 
        selectedFilters.location.includes(vacancy.location)
      );
    }
    
    console.log('- После фильтрации:', filtered.length);
    
    // Сортировка
    let sorted = [...filtered];
    switch (sortBy) {
      case 'relevance':
        // Сортировка по релевантности (пока просто по дате создания)
        sorted.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        break;
      case 'date':
        sorted.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        break;
      case 'salary':
        sorted.sort((a, b) => (b.salaryMax || b.salaryMin || 0) - (a.salaryMax || a.salaryMin || 0));
        break;
      case 'company':
        sorted.sort((a, b) => a.company.localeCompare(b.company));
        break;
      default:
        break;
    }
    
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
    setSelectedFilters({
      vacancyType: [],
      workFormat: [],
      workingStyle: [],
      experienceLevel: [],
      fields: [],
      skills: [],
      salaryRange: [0, 500000],
      location: []
    });
    setSearchQuery('');
  };

  const hasActiveFilters = Object.values(selectedFilters).some(filter => 
    Array.isArray(filter) ? filter.length > 0 : 
    Array.isArray(filter) && filter[0] !== 0 && filter[1] !== 500000
  ) || searchQuery;

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50">
        {/* Поисковая строка в стиле Booking */}
        <div className="bg-white border-b border-gray-200 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-3xl font-bold text-gray-900">Поиск вакансий</h1>
              {user && (
                <div className="flex items-center space-x-4">
                  <button
                    onClick={() => handleTabChange('all')}
                    className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
                      activeTab === 'all'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Все вакансии
                  </button>
                  <button
                    onClick={() => handleTabChange('my')}
                    className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
                      activeTab === 'my'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Мои вакансии ({myVacancies.length})
                  </button>
                </div>
              )}
            </div>

            {/* Поисковая строка */}
            <div className="bg-white border-2 border-blue-500 rounded-2xl p-4 shadow-lg">
              <div className="flex items-center space-x-4">
                {/* Поиск по названию */}
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Что ищете?</label>
                  <Input
                    placeholder="Должность, ключевые слова..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    leftIcon={MagnifyingGlassIcon}
                    className="border-0 focus:ring-0 text-lg"
                  />
                </div>

                {/* Локация */}
                <div className="w-64">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Где?</label>
                  <select
                    value={selectedFilters.location[0] || ''}
                    onChange={(e) => {
                      if (e.target.value) {
                        setSelectedFilters(prev => ({
                          ...prev,
                          location: [e.target.value]
                        }));
                      } else {
                        setSelectedFilters(prev => ({
                          ...prev,
                          location: []
                        }));
                      }
                    }}
                    className="w-full border-0 focus:ring-0 text-lg bg-transparent"
                  >
                    <option value="">Любое место</option>
                    {['Москва', 'Санкт-Петербург', 'Екатеринбург', 'Новосибирск', 'Казань', 'Удаленно'].map(location => (
                      <option key={location} value={location}>{location}</option>
                    ))}
                  </select>
                </div>

                {/* Кнопка поиска */}
                <div className="flex items-end">
                  <Button
                    variant="primary"
                    size="lg"
                    icon={MagnifyingGlassIcon}
                    className="px-8 py-3 rounded-xl bg-blue-600 hover:bg-blue-700"
                  >
                    Найти
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Кнопка создания вакансии для вкладки "Мои вакансии" */}
          {activeTab === 'my' && user && (
            <div className="mb-6 flex items-center justify-between">
              <Button
                variant="primary"
                icon={PlusIcon}
                onClick={() => navigate('/create-vacancy')}
                className="bg-blue-600 hover:bg-blue-700"
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

          <div className="flex gap-8">
            {/* Sidebar с фильтрами */}
            <div className="w-80 flex-shrink-0">
              <div className="sticky top-8 space-y-6">
                {/* Фильтры заголовок */}
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-gray-900">Фильтры</h2>
                  {hasActiveFilters && (
                    <Button variant="ghost" size="sm" onClick={clearFilters} className="text-blue-600 hover:text-blue-700">
                      Очистить все
                    </Button>
                  )}
                </div>

                {/* Тип вакансии */}
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                  <h3 className="font-semibold text-gray-900 mb-4">Тип вакансии</h3>
                  <div className="space-y-3">
                    {referenceData.vacancyTypes.map(type => (
                      <label key={type.id} className="flex items-center cursor-pointer hover:bg-gray-50 p-2 rounded-lg">
                        <input
                          type="checkbox"
                          checked={selectedFilters.vacancyType.includes(type.name)}
                          onChange={() => handleFilterChange('vacancyType', type.name)}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="ml-3 text-sm text-gray-700">{type.name}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Формат работы */}
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                  <h3 className="font-semibold text-gray-900 mb-4">Формат работы</h3>
                  <div className="space-y-3">
                    {referenceData.workFormats.map(format => (
                      <label key={format.id} className="flex items-center cursor-pointer hover:bg-gray-50 p-2 rounded-lg">
                        <input
                          type="checkbox"
                          checked={selectedFilters.workFormat.includes(format.name)}
                          onChange={() => handleFilterChange('workFormat', format.name)}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="ml-3 text-sm text-gray-700">{format.name}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Стиль работы */}
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                  <h3 className="font-semibold text-gray-900 mb-4">Стиль работы</h3>
                  <div className="space-y-3">
                    {referenceData.workingStyles.map(style => (
                      <label key={style.id} className="flex items-center cursor-pointer hover:bg-gray-50 p-2 rounded-lg">
                        <input
                          type="checkbox"
                          checked={selectedFilters.workingStyle.includes(style.name)}
                          onChange={() => handleFilterChange('workingStyle', style.name)}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="ml-3 text-sm text-gray-700">{style.name}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Уровень опыта */}
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                  <h3 className="font-semibold text-gray-900 mb-4">Уровень опыта</h3>
                  <div className="space-y-3">
                    {['Junior', 'Middle', 'Senior'].map(level => (
                      <label key={level} className="flex items-center cursor-pointer hover:bg-gray-50 p-2 rounded-lg">
                        <input
                          type="checkbox"
                          checked={selectedFilters.experienceLevel.includes(level)}
                          onChange={() => handleFilterChange('experienceLevel', level)}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="ml-3 text-sm text-gray-700">{level}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Сферы деятельности */}
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                  <h3 className="font-semibold text-gray-900 mb-4">Сферы деятельности</h3>
                  <div className="space-y-3 max-h-40 overflow-y-auto">
                    {referenceData.fields.map(field => (
                      <label key={field.id} className="flex items-center cursor-pointer hover:bg-gray-50 p-2 rounded-lg">
                        <input
                          type="checkbox"
                          checked={selectedFilters.fields.includes(field.name)}
                          onChange={() => handleFilterChange('fields', field.name)}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="ml-3 text-sm text-gray-700">{field.name}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Навыки */}
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                  <h3 className="font-semibold text-gray-900 mb-4">Навыки</h3>
                  <div className="space-y-3 max-h-40 overflow-y-auto">
                    {referenceData.skills.map(skill => (
                      <label key={skill.id} className="flex items-center cursor-pointer hover:bg-gray-50 p-2 rounded-lg">
                        <input
                          type="checkbox"
                          checked={selectedFilters.skills.includes(skill.name)}
                          onChange={() => handleFilterChange('skills', skill.name)}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="ml-3 text-sm text-gray-700">{skill.name}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Зарплата */}
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                  <h3 className="font-semibold text-gray-900 mb-4">Зарплата (₽)</h3>
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3">
                      <span className="text-sm text-gray-600 w-8">От</span>
                      <input
                        type="number"
                        placeholder="0"
                        value={selectedFilters.salaryRange[0] || ''}
                        onChange={(e) => setSelectedFilters(prev => ({
                          ...prev,
                          salaryRange: [parseInt(e.target.value) || 0, prev.salaryRange[1]]
                        }))}
                        className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div className="flex items-center space-x-3">
                      <span className="text-sm text-gray-600 w-8">До</span>
                      <input
                        type="number"
                        placeholder="500 000"
                        value={selectedFilters.salaryRange[1] === 500000 ? '' : selectedFilters.salaryRange[1] || ''}
                        onChange={(e) => setSelectedFilters(prev => ({
                          ...prev,
                          salaryRange: [prev.salaryRange[0], parseInt(e.target.value) || 500000]
                        }))}
                        className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </div>
                </div>
            </div>
          </div>

            {/* Основной контент */}
            <div className="flex-1">
              {/* Заголовок результатов */}
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    {filteredVacancies.length} вакансий найдено
                  </h2>
                  <p className="text-gray-600 mt-1">
                    {activeTab === 'all' ? 'Показаны вакансии от ваших друзей и друзей друзей' : 'Ваши созданные вакансии'}
                  </p>
                </div>
                
                <div className="flex items-center space-x-4">
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="text-sm border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  >
                    {vacancySortOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  
                  <div className="flex items-center space-x-2 bg-white rounded-lg border border-gray-300 p-1">
                    <Button
                      variant={viewMode === 'list' ? 'primary' : 'ghost'}
                      size="sm"
                      icon={ListBulletIcon}
                      onClick={() => setViewMode('list')}
                      className={viewMode === 'list' ? 'bg-blue-600 text-white' : 'text-gray-600'}
                    />
                    <Button
                      variant={viewMode === 'grid' ? 'primary' : 'ghost'}
                      size="sm"
                      icon={Squares2X2Icon}
                      onClick={() => setViewMode('grid')}
                      className={viewMode === 'grid' ? 'bg-blue-600 text-white' : 'text-gray-600'}
                    />
                  </div>
                </div>
              </div>

              {/* Список вакансий */}
              {isLoading ? (
                <div className="flex justify-center py-12">
                  <Spinner size="lg" />
                </div>
              ) : (
                <div className="space-y-6">
                  <AnimatePresence>
                    {filteredVacancies.map((vacancy, index) => (
                      <VacancyCard
                        key={vacancy.id}
                        vacancy={vacancy}
                        isMyVacancy={activeTab === 'my'}
                        likedVacancies={likedVacancies}
                        savedVacancies={savedVacancies}
                        onToggleLike={toggleLikeVacancy}
                        onToggleSave={toggleSaveVacancy}
                        onDelete={handleDeleteVacancy}
                        index={index}
                      />
                    ))}
                  </AnimatePresence>
                </div>
              )}

              {/* Пустое состояние */}
              {!isLoading && filteredVacancies.length === 0 && (
                <div className="bg-white rounded-xl p-12 text-center shadow-sm border border-gray-200">
                  <FunnelIcon className="h-16 w-16 text-gray-300 mx-auto mb-6" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">
                    Вакансии не найдены
                  </h3>
                  <p className="text-gray-500 mb-6 max-w-md mx-auto">
                    Попробуйте изменить параметры поиска или сбросить фильтры
                  </p>
                  <Button 
                    variant="outline" 
                    onClick={clearFilters}
                    className="border-blue-600 text-blue-600 hover:bg-blue-50"
                  >
                    Очистить фильтры
                  </Button>
                </div>
              )}

              {/* Пагинация */}
              {!isLoading && filteredVacancies.length > 0 && (
                <div className="flex justify-center mt-12">
                  <div className="flex items-center space-x-2 bg-white rounded-lg border border-gray-300 p-2">
                    <Button variant="outline" size="sm" disabled className="border-gray-300">
                      <ChevronDownIcon className="h-4 w-4 rotate-90" />
                    </Button>
                    <Button variant="primary" size="sm" className="bg-blue-600 hover:bg-blue-700">1</Button>
                    <Button variant="outline" size="sm" className="border-gray-300 hover:bg-gray-50">2</Button>
                    <Button variant="outline" size="sm" className="border-gray-300 hover:bg-gray-50">3</Button>
                    <span className="px-2 text-gray-500">...</span>
                    <Button variant="outline" size="sm" className="border-gray-300 hover:bg-gray-50">15</Button>
                    <Button variant="outline" size="sm" className="border-gray-300 hover:bg-gray-50">
                      <ChevronDownIcon className="h-4 w-4 -rotate-90" />
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default VacanciesPage;