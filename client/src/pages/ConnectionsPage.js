import React, { useState, useMemo, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import Avatar from '../components/ui/Avatar';
import FriendsList from '../components/FriendsList';
import Spinner from '../components/ui/Spinner';
import { useAuth } from '../contexts/AuthContext';
import { 
  UsersIcon,
  ChartBarIcon,
  ArrowPathIcon,
  FunnelIcon,
  EyeIcon,
  LinkIcon,
  StarIcon,
  CubeIcon,
  BriefcaseIcon,
  HeartIcon,
  UserGroupIcon,
  UserPlusIcon
} from '@heroicons/react/24/outline';
import { mockUsers, mockConnections } from '../data/mockData';

const ConnectionsPage = () => {
  const [activeTab, setActiveTab] = useState('friends');
  const [friendsOfFriends, setFriendsOfFriends] = useState([]);
  const [loadingConnections, setLoadingConnections] = useState(false);
  const { user: currentUser } = useAuth();
  const navigate = useNavigate();

  // Обработка данных для графиков
  const connectionsData = useMemo(() => {
    const companies = {};
    const skills = {};
    const networkNodes = [];
    const networkLinks = [];

    // Группируем связи по компаниям
    mockConnections.forEach(connection => {
      if (!companies[connection.company]) {
        companies[connection.company] = 0;
      }
      companies[connection.company]++;
    });

    // Группируем по навыкам пользователей
    mockUsers.forEach(user => {
      if (user.skills) {
        user.skills.forEach(skill => {
          if (!skills[skill]) {
            skills[skill] = 0;
          }
          skills[skill]++;
        });
      }
    });

    // Создаем узлы и связи для сетевого графика
    const mainUser = { id: 'me', name: 'Вы', group: 0, size: 20 };
    networkNodes.push(mainUser);

    mockConnections.forEach((connection) => {
      networkNodes.push({
        id: connection.id,
        name: connection.name,
        group: connection.company === 'Яндекс' ? 1 : 
               connection.company === 'Сбер' ? 2 : 
               connection.company === 'ВКонтакте' ? 3 : 4,
        size: 10 + connection.mutualConnections
      });

      networkLinks.push({
        source: 'me',
        target: connection.id,
        strength: connection.connectionStrength === 'strong' ? 3 :
                 connection.connectionStrength === 'medium' ? 2 : 1
      });
    });

    return {
      companies: Object.entries(companies).map(([name, count]) => ({ name, count })),
      skills: Object.entries(skills).slice(0, 8).map(([name, count]) => ({ name, count })),
      networkNodes,
      networkLinks
    };
  }, []);

  // Функция для получения друзей друзей
  const fetchFriendsOfFriends = async () => {
    if (!currentUser) return;
    
    setLoadingConnections(true);
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`http://localhost:5000/api/connections/friends-of-friends/${currentUser.id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setFriendsOfFriends(data.friendsOfFriends || []);
      } else {
        console.error('Failed to fetch friends of friends');
      }
    } catch (error) {
      console.error('Error fetching friends of friends:', error);
    } finally {
      setLoadingConnections(false);
    }
  };

  // Функция для отправки запроса в друзья
  const sendFriendRequest = async (userId) => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch('http://localhost:5000/api/connections/request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ connectedUserId: userId })
      });

      if (response.ok) {
        // Обновляем список друзей друзей
        fetchFriendsOfFriends();
      } else {
        console.error('Failed to send friend request');
      }
    } catch (error) {
      console.error('Error sending friend request:', error);
    }
  };

  // Загружаем друзей друзей при переключении на вкладку
  useEffect(() => {
    if (activeTab === 'my-connections' && currentUser) {
      fetchFriendsOfFriends();
    }
  }, [activeTab, currentUser]);

  const tabs = [
    { id: 'friends', label: 'Друзья', icon: UserGroupIcon },
    { id: 'my-connections', label: 'Мои связи', icon: LinkIcon },
    { id: 'overview', label: 'Обзор', icon: ChartBarIcon },
    { id: 'analytics', label: 'Аналитика', icon: FunnelIcon }
  ];

  // Рассчитываем статистику
  const totalFriends = mockConnections.length;
  const totalConnections = Math.floor(mockConnections.length * 2.5); // Друзья + друзья друзей
  const connectionRating = Math.floor(mockConnections.reduce((sum, c) => sum + (c.connectionStrength === 'strong' ? 3 : c.connectionStrength === 'medium' ? 2 : 1), 0) / mockConnections.length * 10);
  const jobResponses = Math.floor(mockConnections.length * 0.3);

  const connectionStats = [
    { label: 'Друзья', value: totalFriends, color: 'blue', icon: UsersIcon },
    { label: 'Всего связей', value: totalConnections, color: 'green', icon: LinkIcon },
    { label: 'Рейтинг связей', value: connectionRating, color: 'purple', icon: StarIcon },
    { label: 'Сферы деятельности', value: 12, color: 'indigo', icon: CubeIcon },
    { label: 'Отклики по вакансиям', value: jobResponses, color: 'orange', icon: BriefcaseIcon }
  ];

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-24 md:pb-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Мои связи</h1>
              <p className="text-gray-600">
                Анализ и визуализация вашей профессиональной сети
              </p>
            </div>
            <div className="flex space-x-4">
              <Button variant="outline" icon={ArrowPathIcon}>
                Обновить
              </Button>
              <Button variant="primary" icon={EyeIcon}>
                Найти связи
              </Button>
            </div>
          </div>

          {/* Tabs */}
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-indigo-500 text-indigo-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <tab.icon className="h-5 w-5 mr-2" />
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>
        </motion.div>

        {/* Content */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {activeTab === 'friends' && currentUser && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Мои друзья</h2>
                  <p className="text-gray-600">Управляйте своими связями и запросами</p>
                </div>
              </div>

              <FriendsList
                userId={currentUser.id}
                isOwnProfile={true}
              />
            </div>
          )}

          {activeTab === 'my-connections' && currentUser && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Мои связи</h2>
                  <p className="text-gray-600">Друзья ваших друзей - расширьте свою сеть</p>
                </div>
                <Button 
                  variant="outline" 
                  icon={ArrowPathIcon}
                  onClick={fetchFriendsOfFriends}
                  disabled={loadingConnections}
                >
                  Обновить
                </Button>
              </div>

              {loadingConnections ? (
                <div className="flex justify-center py-12">
                  <Spinner size="lg" />
                </div>
              ) : friendsOfFriends.length === 0 ? (
                <Card padding="lg">
                  <div className="text-center py-12">
                    <LinkIcon className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Нет доступных связей</h3>
                    <p className="text-gray-600">Добавьте друзей, чтобы увидеть их друзей здесь</p>
                  </div>
                </Card>
              ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {friendsOfFriends.map((connection) => (
                    <Card key={connection.id} padding="lg" className="hover:shadow-lg transition-shadow">
                      <div className="flex items-start space-x-4">
                        <div
                          className="cursor-pointer hover:opacity-80 transition-opacity"
                          onClick={() => navigate(`/profile/${connection.id}`)}
                        >
                          <Avatar
                            fallback={connection.name}
                            size="lg"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-2">
                            <h3
                              className="text-lg font-semibold text-gray-900 cursor-pointer hover:text-indigo-600 transition-colors truncate"
                              onClick={() => navigate(`/profile/${connection.id}`)}
                            >
                              {connection.name}
                            </h3>
                          </div>
                          <p className="text-sm text-gray-600 mb-1 truncate">
                            {connection.position}
                          </p>
                          {connection.company && (
                            <p className="text-sm text-gray-500 mb-3 truncate">
                              {connection.company}
                            </p>
                          )}
                          
                          {/* Показываем общих друзей */}
                          {connection.mutualConnections && connection.mutualConnections.length > 0 && (
                            <div className="mb-4">
                              <p className="text-xs text-gray-500 mb-2">
                                Общие друзья ({connection.mutualConnections.length}):
                              </p>
                              <div className="flex flex-wrap gap-1">
                                {connection.mutualConnections.slice(0, 3).map((mutual) => (
                                  <span
                                    key={mutual.id}
                                    className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-700 cursor-pointer hover:bg-gray-200 transition-colors"
                                    onClick={() => navigate(`/profile/${mutual.id}`)}
                                  >
                                    {mutual.name}
                                  </span>
                                ))}
                                {connection.mutualConnections.length > 3 && (
                                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-700">
                                    +{connection.mutualConnections.length - 3}
                                  </span>
                                )}
                              </div>
                            </div>
                          )}

                          <div className="flex space-x-2">
                            <Button
                              variant="primary"
                              size="sm"
                              className="flex-1"
                              icon={UserPlusIcon}
                              onClick={() => sendFriendRequest(connection.id)}
                            >
                              Добавить
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="flex-1"
                              icon={EyeIcon}
                              onClick={() => navigate(`/profile/${connection.id}`)}
                            >
                              Профиль
                            </Button>
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'overview' && (
            <div className="grid lg:grid-cols-2 gap-8">
              {/* Spider Chart - Навыки */}
              <Card padding="lg">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Распределение навыков в сети
                </h3>
                <div className="h-64 flex items-center justify-center text-gray-500">
                  <div className="text-center">
                    <ChartBarIcon className="h-12 w-12 mx-auto mb-2 text-gray-400" />
                    <p>График навыков</p>
                    <p className="text-sm">(будет реализован позже)</p>
                  </div>
                </div>
              </Card>

              {/* Sunburst - Компании */}
              <Card padding="lg">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Связи по компаниям
                </h3>
                <div className="h-64 flex items-center justify-center text-gray-500">
                  <div className="text-center">
                    <CubeIcon className="h-12 w-12 mx-auto mb-2 text-gray-400" />
                    <p>График компаний</p>
                    <p className="text-sm">(будет реализован позже)</p>
                  </div>
                </div>
              </Card>

              {/* Recent Connections */}
              <Card padding="lg" className="lg:col-span-2">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Недавние связи
                  </h3>
                  <Button variant="ghost" size="sm">
                    Посмотреть все
                  </Button>
                </div>
                
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {mockConnections.slice(0, 6).map((connection) => (
                    <motion.div
                      key={connection.id}
                      whileHover={{ scale: 1.02 }}
                      className="p-4 border border-gray-200 rounded-lg hover:border-indigo-300 hover:shadow-md transition-all cursor-pointer"
                    >
                      <div className="flex items-center space-x-3 mb-3">
                        <Avatar fallback={connection.name} size="md" />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-900 truncate">{connection.name}</p>
                          <p className="text-sm text-gray-600 truncate">{connection.position}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <Badge 
                          variant={connection.connectionStrength === 'strong' ? 'green' : 
                                  connection.connectionStrength === 'medium' ? 'yellow' : 'gray'} 
                          size="sm"
                        >
                          {connection.connectionStrength === 'strong' ? 'Сильная' :
                           connection.connectionStrength === 'medium' ? 'Средняя' : 'Слабая'}
                        </Badge>
                        <span className="text-xs text-gray-500">
                          {connection.mutualConnections} общих
                        </span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </Card>
            </div>
          )}

          {activeTab === 'analytics' && (
            <div className="space-y-6">
              {/* Stats */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                {connectionStats.map((stat) => {
                  const IconComponent = stat.icon;
                  return (
                    <Card key={stat.label} padding="sm" className="text-center">
                      <div className="flex flex-col items-center space-y-2">
                        <div className={`p-2 rounded-lg bg-${stat.color}-100`}>
                          <IconComponent className={`w-5 h-5 text-${stat.color}-600`} />
                        </div>
                        <div className="text-lg font-bold text-gray-900">{stat.value}</div>
                        <div className="text-xs text-gray-600">{stat.label}</div>
                      </div>
                    </Card>
                  );
                })}
              </div>

              <div className="grid lg:grid-cols-2 gap-8">
                <Card padding="lg">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Анализ сильных связей
                  </h3>
                  <div className="h-64 flex items-center justify-center text-gray-500">
                    <div className="text-center">
                      <HeartIcon className="h-12 w-12 mx-auto mb-2 text-gray-400" />
                      <p>Анализ сильных связей</p>
                      <p className="text-sm">(будет реализован позже)</p>
                    </div>
                  </div>
                </Card>

                <Card padding="lg">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Рост сети по времени
                  </h3>
                  <div className="h-64 flex items-center justify-center text-gray-500">
                    <div className="text-center">
                      <ChartBarIcon className="h-12 w-12 mx-auto mb-2 text-gray-400" />
                      <p>График роста сети</p>
                      <p className="text-sm">(будет реализован позже)</p>
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </Layout>
  );
};

export default ConnectionsPage;
