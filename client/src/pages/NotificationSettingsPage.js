import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Layout from '../components/layout/Layout';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Switch from '../components/ui/Switch';
import { 
  CogIcon,
  BellIcon,
  EnvelopeIcon,
  DevicePhoneMobileIcon,
  ArrowLeftIcon,
  CheckIcon,
  BriefcaseIcon,
  UserGroupIcon,
  ChatBubbleLeftIcon,
  HeartIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline';
import { useNavigate } from 'react-router-dom';

const NotificationSettingsPage = () => {
  const navigate = useNavigate();
  const [settings, setSettings] = useState({
    allNotifications: true,
    soundEnabled: true,
    showBadges: true,
    emailNotifications: true,
    pushNotifications: true,
    jobMatches: true,
    connectionRequests: true,
    messages: true,
    likes: false,
    systemUpdates: true
  });

  const [hasChanges, setHasChanges] = useState(false);

  const updateSetting = (key, value) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
    setHasChanges(true);
  };

  const saveSettings = () => {
    console.log('Saving settings:', settings);
    setHasChanges(false);
  };

  const resetToDefaults = () => {
    setSettings({
      allNotifications: true,
      soundEnabled: true,
      showBadges: true,
      emailNotifications: true,
      pushNotifications: true,
      jobMatches: true,
      connectionRequests: true,
      messages: true,
      likes: false,
      systemUpdates: true
    });
    setHasChanges(true);
  };

  const notificationTypes = [
    {
      key: 'jobMatches',
      label: 'Подходящие вакансии',
      description: 'Уведомления о новых вакансиях',
      icon: BriefcaseIcon,
      color: 'text-blue-600 bg-blue-100'
    },
    {
      key: 'connectionRequests',
      label: 'Запросы на связь',
      description: 'Когда кто-то хочет добавить вас в связи',
      icon: UserGroupIcon,
      color: 'text-green-600 bg-green-100'
    },
    {
      key: 'messages',
      label: 'Сообщения',
      description: 'Новые сообщения от пользователей',
      icon: ChatBubbleLeftIcon,
      color: 'text-purple-600 bg-purple-100'
    },
    {
      key: 'likes',
      label: 'Лайки',
      description: 'Когда кто-то оценивает ваши публикации',
      icon: HeartIcon,
      color: 'text-pink-600 bg-pink-100'
    },
    {
      key: 'systemUpdates',
      label: 'Системные обновления',
      description: 'Важные обновления системы',
      icon: InformationCircleIcon,
      color: 'text-gray-600 bg-gray-100'
    }
  ];

  return (
    <Layout>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-8"
        >
          <div className="flex items-center">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/notifications')}
              className="mr-4"
            >
              <ArrowLeftIcon className="w-4 h-4 mr-2" />
              Назад
            </Button>
            <CogIcon className="h-8 w-8 text-indigo-600 mr-3" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Настройки уведомлений</h1>
              <p className="text-gray-600">Управляйте уведомлениями</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            {hasChanges && (
              <span className="text-sm text-orange-600 font-medium">Есть изменения</span>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={resetToDefaults}
            >
              Сбросить
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={saveSettings}
              disabled={!hasChanges}
            >
              <CheckIcon className="w-4 h-4 mr-1" />
              Сохранить
            </Button>
          </div>
        </motion.div>

        <div className="space-y-6">
          <Card padding="lg">
            <div className="flex items-center mb-6">
              <BellIcon className="h-6 w-6 text-indigo-600 mr-3" />
              <h2 className="text-xl font-semibold text-gray-900">Общие настройки</h2>
            </div>
            
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium text-gray-900">Все уведомления</h3>
                  <p className="text-sm text-gray-500">Включить или выключить все уведомления</p>
                </div>
                <Switch
                  checked={settings.allNotifications}
                  onChange={(checked) => updateSetting('allNotifications', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium text-gray-900">Звуковые уведомления</h3>
                  <p className="text-sm text-gray-500">Воспроизводить звук при получении уведомлений</p>
                </div>
                <Switch
                  checked={settings.soundEnabled}
                  onChange={(checked) => updateSetting('soundEnabled', checked)}
                  disabled={!settings.allNotifications}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium text-gray-900">Значки на иконке</h3>
                  <p className="text-sm text-gray-500">Показывать количество непрочитанных уведомлений</p>
                </div>
                <Switch
                  checked={settings.showBadges}
                  onChange={(checked) => updateSetting('showBadges', checked)}
                  disabled={!settings.allNotifications}
                />
              </div>
            </div>
          </Card>

          <Card padding="lg">
            <div className="flex items-center mb-6">
              <DevicePhoneMobileIcon className="h-6 w-6 text-indigo-600 mr-3" />
              <h2 className="text-xl font-semibold text-gray-900">Каналы уведомлений</h2>
            </div>
            
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <EnvelopeIcon className="h-5 w-5 text-gray-400 mr-3" />
                  <div>
                    <h3 className="text-sm font-medium text-gray-900">Email уведомления</h3>
                    <p className="text-sm text-gray-500">Получать уведомления на почту</p>
                  </div>
                </div>
                <Switch
                  checked={settings.emailNotifications}
                  onChange={(checked) => updateSetting('emailNotifications', checked)}
                  disabled={!settings.allNotifications}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <DevicePhoneMobileIcon className="h-5 w-5 text-gray-400 mr-3" />
                  <div>
                    <h3 className="text-sm font-medium text-gray-900">Push-уведомления</h3>
                    <p className="text-sm text-gray-500">Получать уведомления в браузере</p>
                  </div>
                </div>
                <Switch
                  checked={settings.pushNotifications}
                  onChange={(checked) => updateSetting('pushNotifications', checked)}
                  disabled={!settings.allNotifications}
                />
              </div>
            </div>
          </Card>

          <Card padding="lg">
            <div className="flex items-center mb-6">
              <InformationCircleIcon className="h-6 w-6 text-indigo-600 mr-3" />
              <h2 className="text-xl font-semibold text-gray-900">Типы уведомлений</h2>
            </div>
            
            <div className="space-y-4">
              {notificationTypes.map((type) => {
                const IconComponent = type.icon;
                return (
                  <div key={type.key} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0">
                    <div className="flex items-center">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${type.color} mr-4`}>
                        <IconComponent className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-gray-900">{type.label}</h3>
                        <p className="text-sm text-gray-500">{type.description}</p>
                      </div>
                    </div>
                    <Switch
                      checked={settings[type.key]}
                      onChange={(checked) => updateSetting(type.key, checked)}
                      disabled={!settings.allNotifications}
                    />
                  </div>
                );
              })}
            </div>
          </Card>

          <Card padding="lg" className="bg-blue-50 border-blue-200">
            <div className="flex items-start">
              <InformationCircleIcon className="h-5 w-5 text-blue-600 mr-3 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="text-sm font-medium text-blue-900 mb-1">Совет</h3>
                <p className="text-sm text-blue-700">
                  Рекомендуем включить уведомления о подходящих вакансиях и сообщениях, 
                  чтобы не пропустить важные возможности для карьеры.
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default NotificationSettingsPage;
