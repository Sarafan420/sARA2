import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Layout from '../components/layout/Layout';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import Avatar from '../components/ui/Avatar';
import { 
  BellIcon,
  BriefcaseIcon,
  UserGroupIcon,
  ChatBubbleLeftIcon,
  HeartIcon,
  CheckIcon,
  XMarkIcon,
  CogIcon,
  EyeIcon,
  TrashIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';
import { useNavigate } from 'react-router-dom';

const NotificationsPage = () => {
  const navigate = useNavigate();
  const [filter, setFilter] = useState('all'); // 'all', 'unread', 'work', 'social', 'system'
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      type: 'job_match',
      title: 'Новая подходящая вакансия',
      message: 'Senior Frontend Developer в Яндекс соответствует вашему профилю',
      time: '5 минут назад',
      read: false,
      avatar: 'https://images.unsplash.com/photo-1549924231-f129b911e442?w=100&h=100&fit=crop',
      action: { type: 'view', url: '/vacancies/1' },
      priority: 'high'
    },
    {
      id: 2,
      type: 'connection_request',
      title: 'Новый запрос на связь',
      message: 'Анна Петрова хочет добавить вас в свои связи',
      time: '1 час назад',
      read: false,
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b1e5?w=100&h=100&fit=crop&crop=face',
      action: { type: 'accept_reject', userId: 2 },
      priority: 'medium'
    },
    {
      id: 3,
      type: 'message',
      title: 'Новое сообщение',
      message: 'Михаил Иванов прислал вам сообщение о вакансии',
      time: '2 часа назад',
      read: false,
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face',
      action: { type: 'view', url: '/messages/3' },
      priority: 'medium'
    },
    {
      id: 4,
      type: 'like',
      title: 'Новый лайк',
      message: 'Вашу публикацию оценили 12 человек',
      time: '3 часа назад',
      read: true,
      avatar: null,
      action: { type: 'view', url: '/profile#posts' },
      priority: 'low'
    },
    {
      id: 5,
      type: 'job_application',
      title: 'Отклик на вакансию',
      message: 'Елена Сидорова откликнулась на вашу вакансию "React Developer"',
      time: '4 часа назад',
      read: true,
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face',
      action: { type: 'view', url: '/vacancies?tab=my&action=responses' },
      priority: 'high'
    },
    {
      id: 6,
      type: 'system',
      title: 'Обновление профиля',
      message: 'Ваш профиль был успешно обновлен. Теперь он более заметен для работодателей',
      time: '6 часов назад',
      read: true,
      avatar: null,
      action: { type: 'view', url: '/profile' },
      priority: 'low'
    },
    {
      id: 7,
      type: 'reminder',
      title: 'Напоминание',
      message: 'Не забудьте обновить статус поиска работы',
      time: '1 день назад',
      read: true,
      avatar: null,
      action: { type: 'view', url: '/profile/edit' },
      priority: 'medium'
    },
    {
      id: 8,
      type: 'weekly_summary',
      title: 'Еженедельная сводка',
      message: 'На этой неделе ваш профиль посмотрели 47 раз, получен 1 отклик',
      time: '3 дня назад',
      read: true,
      avatar: null,
      action: { type: 'view', url: '/analytics' },
      priority: 'low'
    }
  ]);

  const getNotificationIcon = (type) => {
    const iconMap = {
      job_match: BriefcaseIcon,
      connection_request: UserGroupIcon,
      message: ChatBubbleLeftIcon,
      like: HeartIcon,
      job_application: BriefcaseIcon,
      system: InformationCircleIcon,
      reminder: ExclamationTriangleIcon,
      weekly_summary: CheckCircleIcon
    };
    return iconMap[type] || BellIcon;
  };

  const getNotificationColor = (type, priority) => {
    if (priority === 'high') return 'text-red-600 bg-red-100';
    if (type === 'job_match') return 'text-blue-600 bg-blue-100';
    if (type === 'connection_request') return 'text-green-600 bg-green-100';
    if (type === 'message') return 'text-purple-600 bg-purple-100';
    if (type === 'like') return 'text-pink-600 bg-pink-100';
    return 'text-gray-600 bg-gray-100';
  };

  const markAsRead = (notificationId) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === notificationId ? { ...notif, read: true } : notif
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(notif => ({ ...notif, read: true })));
  };

  const deleteNotification = (notificationId) => {
    setNotifications(prev => prev.filter(notif => notif.id !== notificationId));
  };

  const handleNotificationAction = (notification) => {
    markAsRead(notification.id);
    
    if (notification.action?.type === 'view' && notification.action?.url) {
      navigate(notification.action.url);
    }
  };

  const handleConnectionAction = (notificationId, action) => {
    // Здесь была бы логика принятия/отклонения запроса на связь
    markAsRead(notificationId);
  };

  const filteredNotifications = notifications.filter(notif => {
    if (filter === 'unread') return !notif.read;
    if (filter === 'work') return ['job_match', 'job_application'].includes(notif.type);
    if (filter === 'social') return ['connection_request', 'message', 'like'].includes(notif.type);
    if (filter === 'system') return ['system', 'reminder', 'weekly_summary'].includes(notif.type);
    return true;
  });

  const unreadCount = notifications.filter(n => !n.read).length;

  const filters = [
    { id: 'all', label: 'Все', count: notifications.length },
    { id: 'unread', label: 'Непрочитанные', count: unreadCount },
    { id: 'work', label: 'Работа', count: notifications.filter(n => ['job_match', 'job_application'].includes(n.type)).length },
    { id: 'social', label: 'Социальные', count: notifications.filter(n => ['connection_request', 'message', 'like'].includes(n.type)).length },
    { id: 'system', label: 'Системные', count: notifications.filter(n => ['system', 'reminder', 'weekly_summary'].includes(n.type)).length }
  ];

  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Заголовок */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-8"
        >
          <div className="flex items-center">
            <BellIcon className="h-8 w-8 text-indigo-600 mr-3" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Уведомления</h1>
              <p className="text-gray-600">
                {unreadCount > 0 ? `${unreadCount} непрочитанных уведомлений` : 'Все уведомления прочитаны'}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <Button
              variant="outline"
              size="sm"
              onClick={markAllAsRead}
              disabled={unreadCount === 0}
            >
              <CheckIcon className="w-4 h-4 mr-1" />
              Отметить все как прочитанные
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => navigate('/notifications/settings')}
            >
              <CogIcon className="w-4 h-4 mr-1" />
              Настройки
            </Button>
          </div>
        </motion.div>

        {/* Фильтры */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex flex-wrap gap-2 mb-8"
        >
          {filters.map((filterItem) => (
            <Button
              key={filterItem.id}
              variant={filter === filterItem.id ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setFilter(filterItem.id)}
              className="flex items-center"
            >
              {filterItem.label}
              {filterItem.count > 0 && (
                <Badge variant="secondary" size="sm" className="ml-2">
                  {filterItem.count}
                </Badge>
              )}
            </Button>
          ))}
        </motion.div>

        {/* Список уведомлений */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="space-y-4"
        >
          {filteredNotifications.length === 0 ? (
            <Card padding="lg" className="text-center">
              <BellIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Нет уведомлений</h3>
              <p className="text-gray-500">
                {filter === 'unread' ? 'Все уведомления прочитаны' : 'В этой категории нет уведомлений'}
              </p>
            </Card>
          ) : (
            filteredNotifications.map((notification, index) => {
              const IconComponent = getNotificationIcon(notification.type);
              const colorClasses = getNotificationColor(notification.type, notification.priority);
              
              return (
                <motion.div
                  key={notification.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card 
                    padding="lg" 
                    hover 
                    className={`transition-all duration-200 ${
                      !notification.read 
                        ? 'border-l-4 border-l-indigo-500 bg-indigo-50/30' 
                        : 'hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-start space-x-4">
                      {/* Иконка */}
                      <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${colorClasses}`}>
                        <IconComponent className="w-5 h-5" />
                      </div>

                      {/* Аватар (если есть) */}
                      {notification.avatar && (
                        <Avatar
                          fallback={notification.userName}
                          size="md"
                          className="flex-shrink-0"
                        />
                      )}

                      {/* Контент */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-1">
                              <h3 className={`text-sm font-medium ${!notification.read ? 'text-gray-900' : 'text-gray-700'}`}>
                                {notification.title}
                              </h3>
                              {!notification.read && (
                                <div className="w-2 h-2 bg-indigo-600 rounded-full"></div>
                              )}
                              {notification.priority === 'high' && (
                                <Badge variant="danger" size="xs">
                                  Важное
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-gray-600 mb-2">
                              {notification.message}
                            </p>
                            <p className="text-xs text-gray-500">
                              {notification.time}
                            </p>
                          </div>

                          {/* Действия */}
                          <div className="flex items-center space-x-2 ml-4">
                            {!notification.read && (
                              <Button
                                variant="ghost"
                                size="xs"
                                onClick={() => markAsRead(notification.id)}
                                title="Отметить как прочитанное"
                              >
                                <EyeIcon className="w-4 h-4" />
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="xs"
                              onClick={() => deleteNotification(notification.id)}
                              title="Удалить уведомление"
                              className="text-red-600 hover:text-red-700"
                            >
                              <TrashIcon className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>

                        {/* Специальные действия */}
                        <div className="mt-3 flex items-center space-x-2">
                          {notification.action?.type === 'accept_reject' && (
                            <>
                              <Button
                                size="xs"
                                variant="primary"
                                onClick={() => handleConnectionAction(notification.id, 'accept')}
                              >
                                <CheckIcon className="w-3 h-3 mr-1" />
                                Принять
                              </Button>
                              <Button
                                size="xs"
                                variant="outline"
                                onClick={() => handleConnectionAction(notification.id, 'reject')}
                              >
                                <XMarkIcon className="w-3 h-3 mr-1" />
                                Отклонить
                              </Button>
                            </>
                          )}
                          
                          {notification.action?.type === 'view' && (
                            <Button
                              size="xs"
                              variant="outline"
                              onClick={() => handleNotificationAction(notification)}
                            >
                              Посмотреть
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              );
            })
          )}
        </motion.div>

        {/* Пустое состояние, если нет уведомлений */}
        {notifications.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-12"
          >
            <BellIcon className="mx-auto h-16 w-16 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Пока нет уведомлений</h3>
            <p className="text-gray-500 mb-6">
              Когда появятся новые события, вы увидите их здесь
            </p>
            <Button variant="primary" onClick={() => navigate('/')}>
              Вернуться на главную
            </Button>
          </motion.div>
        )}
      </div>
    </Layout>
  );
};

export default NotificationsPage;