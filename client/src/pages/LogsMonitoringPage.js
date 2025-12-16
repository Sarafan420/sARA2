import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Spinner from '../components/ui/Spinner';
import { 
  MagnifyingGlassIcon,
  FunnelIcon,
  CalendarIcon,
  UserIcon,
  ShieldCheckIcon,
  ChartBarIcon,
  EyeIcon,
  ClockIcon
} from '@heroicons/react/24/outline';

const LogsMonitoringPage = () => {
  const { user, isAuthenticated, loading } = useAuth();
  
  // Все хуки должны быть в начале компонента
  const [activeTab, setActiveTab] = useState('user'); // 'user', 'security', 'stats'
  const [logs, setLogs] = useState([]);
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [filters, setFilters] = useState({
    page: 1,
    limit: 50,
    actionType: '',
    startDate: '',
    endDate: '',
    success: ''
  });
  const [pagination, setPagination] = useState(null);
  
  // Загрузка данных при изменении вкладки или фильтров
  useEffect(() => {
    if (!isAuthenticated || !user) return; // Не загружаем данные если не авторизован
    
    if (activeTab === 'user') {
      fetchUserLogs();
    } else if (activeTab === 'security') {
      fetchSecurityLogs();
    } else if (activeTab === 'stats') {
      fetchStats();
    }
  }, [activeTab, filters, isAuthenticated, user]);
  
  // Если загружается, показываем спиннер
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  // Если не авторизован, перенаправляем на логин
  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  // Загрузка логов пользователей
  const fetchUserLogs = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('authToken');
      const queryParams = new URLSearchParams({
        page: filters.page,
        limit: filters.limit,
        ...(filters.actionType && { actionType: filters.actionType }),
        ...(filters.startDate && { startDate: filters.startDate }),
        ...(filters.endDate && { endDate: filters.endDate })
      });

      const response = await fetch(`http://localhost:5000/api/logs/user/${user.id}?${queryParams}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setLogs(data.logs);
        setPagination(data.pagination);
      }
    } catch (error) {
      console.error('Error fetching user logs:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Загрузка логов безопасности
  const fetchSecurityLogs = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('authToken');
      const queryParams = new URLSearchParams({
        page: filters.page,
        limit: filters.limit,
        ...(filters.actionType && { actionType: filters.actionType }),
        ...(filters.startDate && { startDate: filters.startDate }),
        ...(filters.endDate && { endDate: filters.endDate }),
        ...(filters.success && { success: filters.success })
      });

      const response = await fetch(`http://localhost:5000/api/logs/security?${queryParams}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setLogs(data.logs);
        setPagination(data.pagination);
      }
    } catch (error) {
      console.error('Error fetching security logs:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Загрузка статистики
  const fetchStats = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('authToken');
      const queryParams = new URLSearchParams({
        ...(filters.startDate && { startDate: filters.startDate }),
        ...(filters.endDate && { endDate: filters.endDate })
      });

      const response = await fetch(`http://localhost:5000/api/logs/stats?${queryParams}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setStats(data.stats);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      page: 1 // Сбрасываем страницу при изменении фильтров
    }));
  };

  const handlePageChange = (newPage) => {
    setFilters(prev => ({
      ...prev,
      page: newPage
    }));
  };

  const clearFilters = () => {
    setFilters({
      page: 1,
      limit: 50,
      actionType: '',
      startDate: '',
      endDate: '',
      success: ''
    });
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('ru-RU');
  };

  const getActionTypeColor = (actionType) => {
    const colors = {
      'login': 'bg-green-100 text-green-800',
      'logout': 'bg-gray-100 text-gray-800',
      'profile_update': 'bg-blue-100 text-blue-800',
      'vacancy_create': 'bg-purple-100 text-purple-800',
      'vacancy_hide': 'bg-orange-100 text-orange-800',
      'vacancy_show': 'bg-yellow-100 text-yellow-800',
      'login_attempt': 'bg-red-100 text-red-800',
      'password_change': 'bg-indigo-100 text-indigo-800'
    };
    return colors[actionType] || 'bg-gray-100 text-gray-800';
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Мониторинг действий пользователей</h1>
            <p className="text-gray-600">Система отслеживания и анализа действий пользователей</p>
          </div>

          {/* Вкладки */}
          <div className="mb-6">
            <div className="border-b border-gray-200">
              <nav className="-mb-px flex space-x-8">
                <button
                  onClick={() => setActiveTab('user')}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'user'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <UserIcon className="w-5 h-5 inline mr-2" />
                  Действия пользователей
                </button>
                <button
                  onClick={() => setActiveTab('security')}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'security'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <ShieldCheckIcon className="w-5 h-5 inline mr-2" />
                  События безопасности
                </button>
                <button
                  onClick={() => setActiveTab('stats')}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'stats'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <ChartBarIcon className="w-5 h-5 inline mr-2" />
                  Статистика
                </button>
              </nav>
            </div>
          </div>

          {/* Фильтры */}
          <Card padding="lg" className="mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Тип действия
                </label>
                <Input
                  type="text"
                  placeholder="Например: login"
                  value={filters.actionType}
                  onChange={(e) => handleFilterChange('actionType', e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Дата начала
                </label>
                <Input
                  type="date"
                  value={filters.startDate}
                  onChange={(e) => handleFilterChange('startDate', e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Дата окончания
                </label>
                <Input
                  type="date"
                  value={filters.endDate}
                  onChange={(e) => handleFilterChange('endDate', e.target.value)}
                />
              </div>
              {activeTab === 'security' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Успешность
                  </label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={filters.success}
                    onChange={(e) => handleFilterChange('success', e.target.value)}
                  >
                    <option value="">Все</option>
                    <option value="true">Успешные</option>
                    <option value="false">Неуспешные</option>
                  </select>
                </div>
              )}
            </div>
            <div className="mt-4 flex justify-between">
              <Button
                variant="secondary"
                onClick={clearFilters}
                className="flex items-center space-x-2"
              >
                <FunnelIcon className="w-4 h-4" />
                <span>Очистить фильтры</span>
              </Button>
              <div className="text-sm text-gray-500">
                {pagination && `Показано ${logs.length} из ${pagination.total} записей`}
              </div>
            </div>
          </Card>

          {/* Контент */}
          {isLoading ? (
            <div className="flex justify-center py-12">
              <Spinner size="lg" />
            </div>
          ) : (
            <>
              {activeTab === 'stats' ? (
                // Статистика
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                  <Card padding="lg">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-blue-600 mb-2">
                        {stats?.totalUserLogs || 0}
                      </div>
                      <div className="text-gray-600">Действия пользователей</div>
                    </div>
                  </Card>
                  <Card padding="lg">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-red-600 mb-2">
                        {stats?.totalSecurityLogs || 0}
                      </div>
                      <div className="text-gray-600">События безопасности</div>
                    </div>
                  </Card>
                  <Card padding="lg">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-green-600 mb-2">
                        {stats?.totalSystemLogs || 0}
                      </div>
                      <div className="text-gray-600">Системные события</div>
                    </div>
                  </Card>
                  <Card padding="lg">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-purple-600 mb-2">
                        {(stats?.totalUserLogs || 0) + (stats?.totalSecurityLogs || 0) + (stats?.totalSystemLogs || 0)}
                      </div>
                      <div className="text-gray-600">Всего событий</div>
                    </div>
                  </Card>
                </div>
              ) : (
                // Таблица логов
                <Card padding="lg">
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Время
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Пользователь
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Тип действия
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Детали
                          </th>
                          {activeTab === 'security' && (
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Успешность
                            </th>
                          )}
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            IP адрес
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {logs.map((log) => (
                          <tr key={log.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              <div className="flex items-center">
                                <ClockIcon className="w-4 h-4 mr-2 text-gray-400" />
                                {formatDate(log.createdAt)}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {log.user ? (
                                <div>
                                  <div className="font-medium">{log.user.name}</div>
                                  <div className="text-gray-500">{log.user.email}</div>
                                </div>
                              ) : (
                                <span className="text-gray-500">Неизвестный пользователь</span>
                              )}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getActionTypeColor(log.actionType)}`}>
                                {log.actionType}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-900">
                              <div className="max-w-xs truncate">
                                {JSON.stringify(log.actionData)}
                              </div>
                            </td>
                            {activeTab === 'security' && (
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                  log.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                }`}>
                                  {log.success ? 'Успешно' : 'Неуспешно'}
                                </span>
                              </td>
                            )}
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {log.ipAddress}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Пагинация */}
                  {pagination && pagination.pages > 1 && (
                    <div className="mt-6 flex items-center justify-between">
                      <div className="text-sm text-gray-700">
                        Страница {pagination.page} из {pagination.pages}
                      </div>
                      <div className="flex space-x-2">
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => handlePageChange(pagination.page - 1)}
                          disabled={pagination.page === 1}
                        >
                          Предыдущая
                        </Button>
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => handlePageChange(pagination.page + 1)}
                          disabled={pagination.page === pagination.pages}
                        >
                          Следующая
                        </Button>
                      </div>
                    </div>
                  )}
                </Card>
              )}
            </>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default LogsMonitoringPage;