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
  PlusIcon,
  UserGroupIcon,
  LinkIcon,
  BriefcaseIcon
} from '@heroicons/react/24/outline';

const VacanciesPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'all'); // 'all', 'my', 'hidden', 'responses'
  const [action, setAction] = useState(searchParams.get('action') || null); // 'duplicate', 'responses', etc.
  const [searchQuery, setSearchQuery] = useState('');
  const [skillsSearchQuery, setSkillsSearchQuery] = useState(''); // Поиск по навыкам в фильтрах
  const [selectedFilters, setSelectedFilters] = useState({
    vacancyType: [],
    workFormat: [],
    workingStyle: [],
    experienceLevel: [],
    fields: [],
    skills: [],
    salaryRange: [0, 500000],
    location: [],
    foundThrough: ['friends', 'connections', 'users'] // Все варианты выбраны по умолчанию
  });
  const [savedVacancies, setSavedVacancies] = useState(new Set());
  const [likedVacancies, setLikedVacancies] = useState(new Set());
  const [hiddenVacancies, setHiddenVacancies] = useState(new Set());
  const [appliedVacancies, setAppliedVacancies] = useState(new Set());
  const [totalVacancies, setTotalVacancies] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [loadedCount, setLoadedCount] = useState(0);
  const [viewMode, setViewMode] = useState('list'); // 'grid' или 'list'
  const [sortBy, setSortBy] = useState('relevance');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [vacancies, setVacancies] = useState([]);
  const [myVacancies, setMyVacancies] = useState([]);
  const [appliedVacanciesList, setAppliedVacanciesList] = useState([]); // Полный список вакансий из откликов
  const [friends, setFriends] = useState([]); // Список друзей для определения типа связи
  const [secondLevelConnections, setSecondLevelConnections] = useState([]); // Связи второго уровня
  const [referenceData, setReferenceData] = useState({
    vacancyTypes: [],
    fields: [],
    skills: [],
    workFormats: [],
    workingStyles: []
  });

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

  // Загрузка вакансий для откликов
  const loadAppliedVacancies = useCallback(async (vacancyIds) => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token || vacancyIds.length === 0) {
        setAppliedVacanciesList([]);
        return;
      }
      
      // Загружаем вакансии по ID
      const vacancyPromises = vacancyIds.map(id => 
        fetch(`http://localhost:5000/api/vacancies/${id}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }).then(res => res.json()).catch(() => ({ success: false }))
      );
      
      const results = await Promise.all(vacancyPromises);
      const formattedVacancies = results
        .filter(result => result.success && result.vacancy)
        .map(result => {
          const vacancy = result.vacancy;
          return {
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
          };
        });
      
      setAppliedVacanciesList(formattedVacancies);
    } catch (error) {
      console.error('Error loading applied vacancies:', error);
      setAppliedVacanciesList([]);
    }
  }, []);

  // Загрузка данных из localStorage при инициализации
  useEffect(() => {
    const loadData = async () => {
      // Загружаем скрытые вакансии
      const savedHiddenVacancies = localStorage.getItem('hiddenVacancies');
      if (savedHiddenVacancies) {
        try {
          const hiddenIds = JSON.parse(savedHiddenVacancies);
          setHiddenVacancies(new Set(hiddenIds));
        } catch (error) {
          // Error parsing hidden vacancies
        }
      }

      // Загружаем отклики из localStorage
      const savedAppliedVacancies = localStorage.getItem('appliedVacancies');
      if (savedAppliedVacancies) {
        try {
          const appliedIds = JSON.parse(savedAppliedVacancies);
          setAppliedVacancies(new Set(appliedIds));
        } catch (error) {
          // Error parsing applied vacancies
        }
      }

      // Проверяем существующие отклики через API
      try {
        const token = localStorage.getItem('authToken');
        if (token) {
          const response = await fetch('http://localhost:5000/api/applications/my', {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });

          if (response.ok) {
            const data = await response.json();
            const appliedIds = data.applications.map(app => app.vacancyId);
            setAppliedVacancies(new Set(appliedIds));
            localStorage.setItem('appliedVacancies', JSON.stringify(appliedIds));
            
            // Загружаем полные данные вакансий для откликов
            if (appliedIds.length > 0) {
              loadAppliedVacancies(appliedIds);
            } else {
              setAppliedVacanciesList([]);
            }
          }
        }
      } catch (error) {
        // Error loading applied vacancies from API
        setAppliedVacanciesList([]);
      }
    };

    loadData();
  }, [loadAppliedVacancies]);

  // Очистка несуществующих скрытых вакансий после загрузки вакансий
  useEffect(() => {
    if (vacancies.length > 0 && hiddenVacancies.size > 0) {
      const existingVacancyIds = new Set(vacancies.map(v => v.id));
      const validHiddenIds = Array.from(hiddenVacancies).filter(id => existingVacancyIds.has(id));
      
      if (validHiddenIds.length !== hiddenVacancies.size) {
        setHiddenVacancies(new Set(validHiddenIds));
        localStorage.setItem('hiddenVacancies', JSON.stringify(validHiddenIds));
      }
    }
  }, [vacancies, hiddenVacancies]);

  // Обработка действий из URL параметров
  useEffect(() => {
    const actionParam = searchParams.get('action');
    if (actionParam) {
      setAction(actionParam);
      
      if (actionParam === 'duplicate') {
        // Логика для дублирования вакансии
        // Здесь можно добавить логику для выбора вакансии для дублирования
      } else if (actionParam === 'responses') {
        // Переключаемся на вкладку "Мои вакансии" для просмотра откликов
        setActiveTab('my');
        setSearchParams({ tab: 'my', action: 'responses' });
      }
    }
  }, [searchParams, setSearchParams]);

  const fetchReferenceData = useCallback(async () => {
    try {
      const response = await fetch('http://localhost:5000/api/vacancies/reference-data');
      if (response.ok) {
        const data = await response.json();
        setReferenceData(data.data);
      }
    } catch (error) {
      // Error fetching reference data
    }
  }, []);

  const fetchVacancies = useCallback(async (offset = 0, append = false) => {
    try {
      if (offset === 0) {
        setIsLoading(true);
      } else {
        setIsLoadingMore(true);
      }
      
      const token = localStorage.getItem('authToken');
      const response = await fetch(`http://localhost:5000/api/vacancies?offset=${offset}&limit=20`, {
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
        
        if (append) {
          setVacancies(prev => [...prev, ...formattedVacancies]);
        } else {
          setVacancies(formattedVacancies);
        }
        
        // Обновляем общее количество вакансий и статус загрузки
        if (data.total !== undefined) {
          setTotalVacancies(data.total);
        }
        
        setHasMore(data.hasMore || false);
        setLoadedCount(offset + formattedVacancies.length);
      }
    } catch (error) {
      console.error('Error fetching vacancies:', error);
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  }, []);

  // Загрузка дополнительных вакансий
  const loadMoreVacancies = useCallback(() => {
    if (!isLoadingMore && hasMore && activeTab === 'all') {
      fetchVacancies(loadedCount, true);
    }
  }, [isLoadingMore, hasMore, loadedCount, activeTab, fetchVacancies]);

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
      }
    } catch (error) {
      // Error fetching my vacancies
    }
  }, [user]);

  // Загрузка друзей для определения типа связи
  const fetchFriends = useCallback(async () => {
    try {
      const token = localStorage.getItem('authToken');
      // Загружаем только принятые дружбы
      const response = await fetch('http://localhost:5000/api/connections?status=accepted', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        // Преобразуем данные в формат, ожидаемый клиентом
        // API возвращает connections с полем friend
        const friendsData = (data.connections || []).map(conn => ({
          userId: conn.friend.id,
          friendId: conn.friend.id,
          status: conn.status || 'accepted'
        }));
        setFriends(friendsData);
      }
    } catch (error) {
      console.error('Error fetching friends:', error);
    }
  }, []);

  // Загрузка связей второго уровня
  const fetchSecondLevelConnections = useCallback(async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch('http://localhost:5000/api/connections/second-level', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        // API возвращает массив объектов с полем id (ID пользователя связи)
        const connectionIds = (data.secondLevelConnections || []).map(conn => 
          typeof conn === 'object' ? conn.id : conn
        );
        setSecondLevelConnections(connectionIds);
      }
    } catch (error) {
      console.error('Error fetching second-level connections:', error);
    }
  }, []);

  // Загружаем данные из API
  useEffect(() => {
    fetchReferenceData();
    if (user) {
      fetchMyVacancies();
      fetchFriends();
      fetchSecondLevelConnections();
    }
  }, [user, fetchMyVacancies, fetchFriends, fetchSecondLevelConnections]);

  // Загружаем вакансии при монтировании или изменении вкладки
  useEffect(() => {
    if (user && activeTab === 'all') {
      // Сбрасываем состояние при загрузке
      setLoadedCount(0);
      setHasMore(true);
      fetchVacancies(0, false);
    }
  }, [user, activeTab, fetchVacancies]);

  // Intersection Observer для бесконечной прокрутки
  useEffect(() => {
    if (activeTab !== 'all' || !hasMore || isLoading || isLoadingMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          loadMoreVacancies();
        }
      },
      { threshold: 0.1 }
    );

    const triggerElement = document.getElementById('load-more-trigger');
    if (triggerElement) {
      observer.observe(triggerElement);
    }

    return () => {
      if (triggerElement) {
        observer.unobserve(triggerElement);
      }
    };
  }, [activeTab, hasMore, isLoading, isLoadingMore, loadMoreVacancies]);

  // Используем единые опции фильтров
  const vacancySortOptions = sortOptions.vacancies;

  // Функция для определения типа связи с вакансией
  const getFoundThroughType = useCallback((vacancyUserId) => {
    if (!user || !vacancyUserId) return 'users';
    
    // Если это моя вакансия, не применяем фильтр
    if (vacancyUserId === user.id) return 'users';
    
    // Получаем ID всех прямых друзей (только принятые связи)
    const directFriendIds = friends
      .filter(friend => friend.status === 'accepted')
      .map(friend => friend.userId || friend.friendId);
    
    // Проверяем, является ли автор вакансии прямым другом
    const isDirectFriend = directFriendIds.includes(vacancyUserId);
    
    if (isDirectFriend) {
      return 'friends';
    }
    
    // Проверяем, является ли автор вакансии связью второго уровня
    // (друзья друзей, но НЕ прямые друзья)
    const isSecondLevelConnection = Array.isArray(secondLevelConnections) && 
                                    secondLevelConnections.includes(vacancyUserId) && 
                                    !isDirectFriend;
    
    if (isSecondLevelConnection) {
      return 'connections';
    }
    
    // Все остальные - без связей (не друзья и не связи друзей)
    return 'users';
  }, [user, friends, secondLevelConnections]);

  // Фильтрация и сортировка с использованием новой структуры данных
  const filteredVacancies = useMemo(() => {
    let currentVacancies;
    
    if (activeTab === 'my') {
      currentVacancies = myVacancies;
    } else if (activeTab === 'hidden') {
      // Для скрытых вакансий показываем только те, что есть в hiddenVacancies
      currentVacancies = vacancies.filter(vacancy => hiddenVacancies.has(vacancy.id));
    } else if (activeTab === 'responses') {
      // Для моих откликов показываем загруженные вакансии из откликов
      currentVacancies = appliedVacanciesList;
    } else {
      // Для обычных вакансий исключаем скрытые и уже откликнувшиеся
      currentVacancies = vacancies.filter(vacancy => 
        !hiddenVacancies.has(vacancy.id) && !appliedVacancies.has(vacancy.id)
      );
    }
    
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
    
    // Фильтр по типу связи "Нашли с помощью"
    if (selectedFilters.foundThrough.length > 0 && selectedFilters.foundThrough.length < 3) {
      filtered = filtered.filter(vacancy => {
        const foundThroughType = getFoundThroughType(vacancy.userId);
        return selectedFilters.foundThrough.includes(foundThroughType);
      });
    }
    
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
        sorted.sort((a, b) => (a.company || '').localeCompare(b.company || ''));
        break;
      case 'vacancyType':
        // Сортировка по типу вакансии
        sorted.sort((a, b) => {
          const typeA = a.vacancyType?.name || '';
          const typeB = b.vacancyType?.name || '';
          return typeA.localeCompare(typeB);
        });
        break;
      case 'skills':
        // Сортировка по количеству навыков (сначала с большим количеством)
        sorted.sort((a, b) => {
          const skillsA = a.skills?.length || 0;
          const skillsB = b.skills?.length || 0;
          if (skillsB !== skillsA) {
            return skillsB - skillsA;
          }
          // Если количество навыков одинаковое, сортируем по названию первого навыка
          const firstSkillA = a.skills?.[0]?.name || '';
          const firstSkillB = b.skills?.[0]?.name || '';
          return firstSkillA.localeCompare(firstSkillB);
        });
        break;
      default:
        break;
    }
    
    return sorted;
  }, [activeTab, vacancies, myVacancies, appliedVacanciesList, searchQuery, selectedFilters, sortBy, hiddenVacancies, appliedVacancies, getFoundThroughType]);

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
    
    // Если переключаемся на вкладку откликов, загружаем вакансии
    if (tab === 'responses' && appliedVacancies.size > 0) {
      loadAppliedVacancies(Array.from(appliedVacancies));
    }
  };

  // Функции для работы со скрытыми вакансиями
  const hideVacancy = async (vacancyId) => {
    const newHiddenVacancies = new Set(hiddenVacancies);
    newHiddenVacancies.add(vacancyId);
    setHiddenVacancies(newHiddenVacancies);
    
    // Сохраняем в localStorage
    localStorage.setItem('hiddenVacancies', JSON.stringify([...newHiddenVacancies]));

    // Логируем действие скрытия вакансии
    try {
      const token = localStorage.getItem('authToken');
      if (token && user) {
        await fetch('http://localhost:5000/api/logs/user', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            actionType: 'vacancy_hide',
            actionData: {
              vacancyId: vacancyId,
              timestamp: new Date().toISOString()
            }
          })
        });
      }
    } catch (error) {
      // Error logging vacancy hide
    }
  };

  const showVacancy = async (vacancyId) => {
    const newHiddenVacancies = new Set(hiddenVacancies);
    newHiddenVacancies.delete(vacancyId);
    setHiddenVacancies(newHiddenVacancies);
    
    // Сохраняем в localStorage
    localStorage.setItem('hiddenVacancies', JSON.stringify([...newHiddenVacancies]));

    // Логируем действие показа вакансии
    try {
      const token = localStorage.getItem('authToken');
      if (token && user) {
        await fetch('http://localhost:5000/api/logs/user', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            actionType: 'vacancy_show',
            actionData: {
              vacancyId: vacancyId,
              timestamp: new Date().toISOString()
            }
          })
        });
      }
    } catch (error) {
      // Error logging vacancy show
    }
  };

  const handleShowResponses = (vacancyId) => {
    // Переходим на страницу с откликами для конкретной вакансии
    navigate(`/vacancies/${vacancyId}/responses`);
  };

  // Функция для отклика на вакансию
  const handleApplyToVacancy = async (vacancyId) => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        return;
      }

      const response = await fetch('http://localhost:5000/api/applications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          vacancyId: vacancyId,
          status: 'pending'
        })
      });

      if (response.ok) {
        // Добавляем вакансию в список откликов
        const newAppliedVacancies = new Set(appliedVacancies);
        newAppliedVacancies.add(vacancyId);
        setAppliedVacancies(newAppliedVacancies);
        
        // Сохраняем в localStorage
        localStorage.setItem('appliedVacancies', JSON.stringify([...newAppliedVacancies]));
        
        // Логируем действие
        await fetch('http://localhost:5000/api/logs/user', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            actionType: 'apply_to_vacancy',
            actionData: { vacancyId: vacancyId }
          })
        });
        
        // Показываем уведомление пользователю
        alert('Заявка отправлена! Вакансия добавлена в раздел "Мои отклики".');
      } else if (response.status === 409) {
        // Пользователь уже откликнулся - обновляем состояние
        const newAppliedVacancies = new Set(appliedVacancies);
        newAppliedVacancies.add(vacancyId);
        setAppliedVacancies(newAppliedVacancies);
        localStorage.setItem('appliedVacancies', JSON.stringify([...newAppliedVacancies]));
      }
    } catch (error) {
      // Error applying to vacancy
    }
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
      }
    } catch (error) {
      // Error deleting vacancy
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
      location: [],
      foundThrough: ['friends', 'connections', 'users'] // Сбрасываем к состоянию "все выбраны"
    });
    setSearchQuery('');
  };

  const clearHiddenVacancies = () => {
    setHiddenVacancies(new Set());
    localStorage.removeItem('hiddenVacancies');
  };


  const hasActiveFilters = Object.values(selectedFilters).some(filter => 
    Array.isArray(filter) ? filter.length > 0 : 
    Array.isArray(filter) && filter[0] !== 0 && filter[1] !== 500000
  ) || searchQuery;

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50">
        {/* Заголовок с акцентом на связи */}
        <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-4xl font-bold mb-2">Поиск вакансий через связи</h1>
                <p className="text-blue-100 text-lg">Найдите работу через свою профессиональную сеть</p>
              </div>
              {user && (
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => handleTabChange('all')}
                    className={`px-5 py-2.5 rounded-xl font-medium text-sm transition-all ${
                      activeTab === 'all'
                        ? 'bg-white text-blue-600 shadow-lg'
                        : 'bg-white/20 text-white hover:bg-white/30 backdrop-blur-sm'
                    }`}
                  >
                    Все вакансии ({totalVacancies})
                  </button>
                  <button
                    onClick={() => handleTabChange('my')}
                    className={`px-5 py-2.5 rounded-xl font-medium text-sm transition-all ${
                      activeTab === 'my'
                        ? 'bg-white text-blue-600 shadow-lg'
                        : 'bg-white/20 text-white hover:bg-white/30 backdrop-blur-sm'
                    }`}
                  >
                    Мои вакансии ({myVacancies.length})
                  </button>
                  <button
                    onClick={() => handleTabChange('responses')}
                    className={`px-5 py-2.5 rounded-xl font-medium text-sm transition-all ${
                      activeTab === 'responses'
                        ? 'bg-white text-blue-600 shadow-lg'
                        : 'bg-white/20 text-white hover:bg-white/30 backdrop-blur-sm'
                    }`}
                  >
                    Мои отклики ({appliedVacancies.size})
                  </button>
                  <button
                    onClick={() => handleTabChange('hidden')}
                    className={`px-5 py-2.5 rounded-xl font-medium text-sm transition-all ${
                      activeTab === 'hidden'
                        ? 'bg-white text-blue-600 shadow-lg'
                        : 'bg-white/20 text-white hover:bg-white/30 backdrop-blur-sm'
                    }`}
                  >
                    Скрытые ({hiddenVacancies.size})
                  </button>
                </div>
              )}
        </div>

            {/* Поисковая строка - улучшенный дизайн */}
            <div className="bg-white rounded-2xl p-6 shadow-xl border border-gray-200">
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
                <div className="flex items-center space-x-2">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                    className="text-blue-600 hover:text-blue-700"
                  >
                    {showAdvancedFilters ? 'Скрыть' : 'Расширенные'} фильтры
                  </Button>
                {hasActiveFilters && (
                    <Button variant="ghost" size="sm" onClick={clearFilters} className="text-blue-600 hover:text-blue-700">
                      Очистить все
                  </Button>
                )}
                </div>
              </div>

                {/* Тип вакансии - улучшенный дизайн */}
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-gray-900">Тип вакансии</h3>
                    {selectedFilters.vacancyType.length > 0 && (
                      <span className="text-xs text-blue-600 font-medium">
                        Выбрано: {selectedFilters.vacancyType.length}
                      </span>
                    )}
                  </div>
                  <div className="space-y-2">
                    {referenceData.vacancyTypes && referenceData.vacancyTypes.length > 0 ? (
                      referenceData.vacancyTypes.map(type => (
                        <label key={type.id} className="flex items-center cursor-pointer hover:bg-blue-50 p-3 rounded-lg transition-colors border border-transparent hover:border-blue-200">
                          <input
                            type="checkbox"
                            checked={selectedFilters.vacancyType.includes(type.name)}
                            onChange={() => handleFilterChange('vacancyType', type.name)}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 w-4 h-4"
                          />
                          <span className="ml-3 text-sm font-medium text-gray-700 flex-1">{type.name}</span>
                          {selectedFilters.vacancyType.includes(type.name) && (
                            <span className="text-blue-600 text-xs">✓</span>
                          )}
                        </label>
                      ))
                    ) : (
                      <p className="text-sm text-gray-500">Загрузка типов вакансий...</p>
                    )}
                  </div>
                </div>

                {/* Навыки - улучшенный дизайн с поиском */}
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-gray-900">Навыки</h3>
                    {selectedFilters.skills.length > 0 && (
                      <span className="text-xs text-blue-600 font-medium">
                        Выбрано: {selectedFilters.skills.length}
                      </span>
                    )}
                  </div>
                  
                  {/* Поиск по навыкам */}
                  <div className="mb-4">
                    <Input
                      placeholder="Поиск навыков..."
                      value={skillsSearchQuery}
                      onChange={(e) => setSkillsSearchQuery(e.target.value)}
                      leftIcon={MagnifyingGlassIcon}
                      className="text-sm"
                      size="sm"
                    />
                  </div>
                  
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {referenceData.skills && referenceData.skills.length > 0 ? (
                      referenceData.skills
                        .filter(skill => {
                          if (!skillsSearchQuery) return true;
                          return skill.name.toLowerCase().includes(skillsSearchQuery.toLowerCase());
                        })
                        .map(skill => (
                          <label key={skill.id} className="flex items-center cursor-pointer hover:bg-blue-50 p-3 rounded-lg transition-colors border border-transparent hover:border-blue-200">
                            <input
                              type="checkbox"
                              checked={selectedFilters.skills.includes(skill.name)}
                              onChange={() => handleFilterChange('skills', skill.name)}
                              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 w-4 h-4"
                            />
                            <span className="ml-3 text-sm font-medium text-gray-700 flex-1">{skill.name}</span>
                            {selectedFilters.skills.includes(skill.name) && (
                              <span className="text-blue-600 text-xs">✓</span>
                            )}
                          </label>
                        ))
                    ) : (
                      <p className="text-sm text-gray-500">Загрузка навыков...</p>
                    )}
                    
                    {referenceData.skills && referenceData.skills.length > 0 && 
                     skillsSearchQuery && 
                     referenceData.skills.filter(skill => 
                       skill.name.toLowerCase().includes(skillsSearchQuery.toLowerCase())
                     ).length === 0 && (
                      <p className="text-sm text-gray-500 text-center py-4">Навыки не найдены</p>
                    )}
                  </div>
                  
                  {/* Показать выбранные навыки */}
                  {selectedFilters.skills.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <p className="text-xs font-medium text-gray-600 mb-2">Выбранные навыки:</p>
                      <div className="flex flex-wrap gap-2">
                        {selectedFilters.skills.map(skillName => (
                          <span
                            key={skillName}
                            className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200"
                          >
                            {skillName}
                            <button
                              onClick={() => handleFilterChange('skills', skillName)}
                              className="ml-1 text-blue-600 hover:text-blue-800"
                            >
                              ×
                            </button>
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Расширенные фильтры */}
                {showAdvancedFilters && (
                  <>
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
                  </>
                )}

                {/* Нашли с помощью - Улучшенный дизайн с акцентом на связи */}
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 shadow-sm border-2 border-blue-200">
                  <div className="flex items-center space-x-2 mb-4">
                    <UserGroupIcon className="h-5 w-5 text-blue-600" />
                    <h3 className="font-semibold text-gray-900">Фильтр вакансий</h3>
                  </div>
                  <p className="text-xs text-gray-600 mb-4">Найдите вакансии через свою профессиональную сеть</p>
                  <div className="space-y-3">
                    <label className="flex items-start cursor-pointer hover:bg-white/60 p-3 rounded-lg transition-colors border border-transparent hover:border-green-200">
                      <input
                        type="checkbox"
                        checked={selectedFilters.foundThrough.includes('friends')}
                        onChange={() => handleFilterChange('foundThrough', 'friends')}
                        className="mt-1 rounded border-gray-300 text-green-600 focus:ring-green-500 w-4 h-4"
                      />
                      <div className="ml-3 flex-1">
                        <div className="flex items-center space-x-2">
                          <UserGroupIcon className="h-4 w-4 text-green-600" />
                          <span className="text-sm font-semibold text-gray-900">Вакансии друзей</span>
                        </div>
                        <p className="text-xs text-gray-600 mt-1">Только вакансии от ваших прямых друзей (из таблицы friendships)</p>
                      </div>
                    </label>
                    <label className="flex items-start cursor-pointer hover:bg-white/60 p-3 rounded-lg transition-colors border border-transparent hover:border-purple-200">
                      <input
                        type="checkbox"
                        checked={selectedFilters.foundThrough.includes('connections')}
                        onChange={() => handleFilterChange('foundThrough', 'connections')}
                        className="mt-1 rounded border-gray-300 text-purple-600 focus:ring-purple-500 w-4 h-4"
                      />
                      <div className="ml-3 flex-1">
                        <div className="flex items-center space-x-2">
                          <LinkIcon className="h-4 w-4 text-purple-600" />
                          <span className="text-sm font-semibold text-gray-900">Вакансии ваших связей</span>
                        </div>
                        <p className="text-xs text-gray-600 mt-1">Вакансии от друзей ваших друзей (из таблицы connections)</p>
                      </div>
                    </label>
                    <label className="flex items-start cursor-pointer hover:bg-white/60 p-3 rounded-lg transition-colors border border-transparent hover:border-gray-200">
                      <input
                        type="checkbox"
                        checked={selectedFilters.foundThrough.includes('users')}
                        onChange={() => handleFilterChange('foundThrough', 'users')}
                        className="mt-1 rounded border-gray-300 text-gray-600 focus:ring-gray-500 w-4 h-4"
                      />
                      <div className="ml-3 flex-1">
                        <div className="flex items-center space-x-2">
                          <BriefcaseIcon className="h-4 w-4 text-gray-600" />
                          <span className="text-sm font-semibold text-gray-900">Вакансии без связей</span>
                        </div>
                        <p className="text-xs text-gray-600 mt-1">Все остальные вакансии (не друзья и не связи)</p>
                      </div>
                    </label>
                </div>
                </div>
            </div>
          </div>

          {/* Основной контент */}
          <div className="flex-1">
              {/* Заголовок результатов с статистикой по связям */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex-1">
                  <div className="flex items-center space-x-4 mb-2">
                    <h2 className="text-2xl font-bold text-gray-900">
                      Показано вакансий: {filteredVacancies.length}
                    </h2>
                  </div>
                  
                  {/* Статистика по типам связей */}
                  {activeTab === 'all' && filteredVacancies.length > 0 && (
                    <div className="flex items-center space-x-4 mt-3">
                      {(() => {
                        const friendsCount = filteredVacancies.filter(v => getFoundThroughType(v.userId) === 'friends').length;
                        const connectionsCount = filteredVacancies.filter(v => getFoundThroughType(v.userId) === 'connections').length;
                        const usersCount = filteredVacancies.filter(v => getFoundThroughType(v.userId) === 'users').length;
                        
                        return (
                          <>
                            {friendsCount > 0 && (
                              <div className="flex items-center space-x-1">
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200">
                                  <UserGroupIcon className="h-3 w-3 mr-1" />
                                  Друзья: {friendsCount}
                                </span>
                              </div>
                            )}
                            {connectionsCount > 0 && (
                              <div className="flex items-center space-x-1">
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800 border border-purple-200">
                                  <LinkIcon className="h-3 w-3 mr-1" />
                                  Связи: {connectionsCount}
                                </span>
                              </div>
                            )}
                            {usersCount > 0 && (
                              <div className="flex items-center space-x-1">
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 border border-gray-200">
                                  Все: {usersCount}
                                </span>
                              </div>
                            )}
                          </>
                        );
                      })()}
                    </div>
                  )}
                  
                  <p className="text-gray-600 mt-2">
                    {activeTab === 'all' ? `Все доступные вакансии` : 
                     activeTab === 'my' ? 'Ваши созданные вакансии' :
                     activeTab === 'responses' ? `Вакансии, на которые вы откликнулись (${appliedVacancies.size} откликов)` :
                     activeTab === 'hidden' ? 'Скрытые вакансии' : 'Все доступные вакансии'}
                  </p>
                  {activeTab === 'hidden' && hiddenVacancies.size > 0 && (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={clearHiddenVacancies}
                      className="mt-2 text-red-600 border-red-200 hover:bg-red-50"
                    >
                      Очистить все скрытые
                    </Button>
                  )}
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
            ) : filteredVacancies.length === 0 ? (
              <Card padding="lg" className="text-center py-12">
                <div className="max-w-md mx-auto">
                  <BriefcaseIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {activeTab === 'responses' 
                      ? 'Нет откликов' 
                      : activeTab === 'hidden'
                      ? 'Нет скрытых вакансий'
                      : activeTab === 'my'
                      ? 'У вас пока нет вакансий'
                      : 'Вакансии не найдены'}
                  </h3>
                  <p className="text-gray-600 mb-4">
                    {activeTab === 'responses' 
                      ? 'Вы еще не откликнулись ни на одну вакансию' 
                      : activeTab === 'hidden'
                      ? 'Вы не скрыли ни одной вакансии'
                      : activeTab === 'my'
                      ? 'Создайте свою первую вакансию'
                      : 'Попробуйте изменить параметры поиска или фильтры'}
                  </p>
                  {activeTab === 'my' && user && (
                    <Button
                      variant="primary"
                      icon={PlusIcon}
                      onClick={() => navigate('/create-vacancy')}
                    >
                      Создать вакансию
                    </Button>
                  )}
                </div>
              </Card>
            ) : (
                <div className="space-y-6">
                <AnimatePresence>
                  {filteredVacancies.map((vacancy, index) => (
                      <VacancyCard
                      key={vacancy.id}
                        vacancy={vacancy}
                        isMyVacancy={activeTab === 'my'}
                        isHidden={activeTab === 'hidden'}
                        likedVacancies={likedVacancies}
                        savedVacancies={savedVacancies}
                        onToggleLike={toggleLikeVacancy}
                        onToggleSave={toggleSaveVacancy}
                        onDelete={handleDeleteVacancy}
                        onHideVacancy={activeTab === 'hidden' ? showVacancy : hideVacancy}
                        onShowResponses={handleShowResponses}
                        onApplyToVacancy={handleApplyToVacancy}
                        appliedVacancies={appliedVacancies}
                        index={index}
                      />
                  ))}
                </AnimatePresence>
                
                {/* Триггер для загрузки дополнительных вакансий */}
                {activeTab === 'all' && hasMore && (
                  <div id="load-more-trigger" className="h-20 flex items-center justify-center">
                    {isLoadingMore && (
                      <div className="flex items-center space-x-2 text-gray-600">
                        <Spinner size="sm" />
                        <span className="text-sm">Загрузка вакансий...</span>
                      </div>
                    )}
                  </div>
                )}
                
                {activeTab === 'all' && !hasMore && filteredVacancies.length > 0 && (
                  <div className="text-center py-8 text-gray-500 text-sm">
                    Все вакансии загружены
                  </div>
                )}
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

            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default VacanciesPage;