import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Navigate, useNavigate, useLocation } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Spinner from '../components/ui/Spinner';
import Avatar from '../components/ui/Avatar';
import { 
  ArrowLeftIcon,
  ShieldCheckIcon,
  UserGroupIcon,
  BellIcon,
  UserIcon,
  KeyIcon,
  GlobeAltIcon
} from '@heroicons/react/24/outline';

const SettingsPage = () => {
  const { user, isAuthenticated, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Все хуки должны быть в начале компонента
  const [activeSection, setActiveSection] = useState('privacy'); // 'privacy', 'notifications', 'profile'
  const [privacySettings, setPrivacySettings] = useState(null);
  const [friends, setFriends] = useState([]);
  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    pushNotifications: true,
    vacancyAlerts: true,
    connectionRequests: true,
    messages: true,
    weeklyDigest: false
  });
  const [profileSettings, setProfileSettings] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');

  // Определяем активную секцию из URL
  useEffect(() => {
    const path = location.pathname;
    if (path.includes('/privacy')) {
      setActiveSection('privacy');
    } else if (path.includes('/notifications')) {
      setActiveSection('notifications');
    } else if (path.includes('/profile')) {
      setActiveSection('profile');
    } else {
      setActiveSection('privacy'); // по умолчанию
    }
  }, [location.pathname]);

  // Загрузка настроек приватности
  const fetchPrivacySettings = async () => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        console.error('No auth token found');
        setError('Необходимо войти в систему');
        return;
      }
      
      const response = await fetch('http://localhost:5000/api/privacy/settings', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setPrivacySettings(data.settings);
      } else {
        const errorText = await response.text();
        console.error('Privacy settings error response:', errorText);
        throw new Error(`Failed to fetch privacy settings: ${response.status}`);
      }
    } catch (err) {
      console.error('Error fetching privacy settings:', err);
      setError('Не удалось загрузить настройки приватности');
    }
  };

  // Загрузка списка друзей
  const fetchFriends = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch('http://localhost:5000/api/privacy/friends', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setFriends(data.friends);
      } else {
        throw new Error('Failed to fetch friends');
      }
    } catch (err) {
      console.error('Error fetching friends:', err);
      setError('Не удалось загрузить список друзей');
    }
  };

  // Загрузка настроек уведомлений
  const fetchNotificationSettings = async () => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        console.error('No auth token found');
        setError('Необходимо войти в систему');
        return;
      }
      
      const response = await fetch('http://localhost:5000/api/settings/notifications', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setNotificationSettings(data.settings);
      } else {
        const errorText = await response.text();
        console.error('Notification settings error response:', errorText);
        throw new Error(`Failed to fetch notification settings: ${response.status}`);
      }
    } catch (err) {
      console.error('Error fetching notification settings:', err);
      setError('Не удалось загрузить настройки уведомлений');
    }
  };

  // Загрузка настроек профиля (больше не нужна, так как нет настроек для загрузки)
  const fetchProfileSettings = async () => {
    // Настройки профиля больше не загружаются с сервера
    // Только смена пароля остается
  };

  // Загрузка данных при изменении секции
  useEffect(() => {
    if (!isAuthenticated || !user) return;
    
    setIsLoading(true);
    setError(null);
    
    if (activeSection === 'privacy') {
      Promise.all([
        fetchPrivacySettings(),
        fetchFriends()
      ]).finally(() => setIsLoading(false));
    } else if (activeSection === 'notifications') {
      fetchNotificationSettings().finally(() => setIsLoading(false));
    } else if (activeSection === 'profile') {
      // Для профиля не нужно загружать данные с сервера
      setIsLoading(false);
    } else {
      setIsLoading(false);
    }
  }, [isAuthenticated, user, activeSection]);

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

  // Обновление общих настроек приватности
  const updateGeneralSettings = async (field, value) => {
    try {
      setIsSaving(true);
      const token = localStorage.getItem('authToken');
      
      const response = await fetch('http://localhost:5000/api/privacy/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          [field]: value
        })
      });

      if (response.ok) {
        const data = await response.json();
        setPrivacySettings(data.settings);
        setSuccessMessage('Настройки сохранены');
        setTimeout(() => setSuccessMessage(''), 3000);
      } else {
        throw new Error('Failed to update settings');
      }
    } catch (err) {
      console.error('Error updating settings:', err);
      setError('Не удалось сохранить настройки');
    } finally {
      setIsSaving(false);
    }
  };

  // Обновление настроек для конкретного друга
  const updateFriendSettings = async (friendId, field, value) => {
    try {
      setIsSaving(true);
      const token = localStorage.getItem('authToken');
      
      const response = await fetch(`http://localhost:5000/api/privacy/friends/${friendId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          [field]: value
        })
      });

      if (response.ok) {
        // Обновляем локальное состояние
        setFriends(prev => prev.map(friend => 
          friend.id === friendId 
            ? { ...friend, privacySettings: { ...friend.privacySettings, [field]: value } }
            : friend
        ));
        setSuccessMessage('Настройки для друга сохранены');
        setTimeout(() => setSuccessMessage(''), 3000);
      } else {
        throw new Error('Failed to update friend settings');
      }
    } catch (err) {
      console.error('Error updating friend settings:', err);
      setError('Не удалось сохранить настройки для друга');
    } finally {
      setIsSaving(false);
    }
  };

  // Сброс настроек друга к значениям по умолчанию
  const resetFriendSettings = async (friendId) => {
    try {
      setIsSaving(true);
      const token = localStorage.getItem('authToken');
      
      const response = await fetch(`http://localhost:5000/api/privacy/friends/${friendId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        // Обновляем локальное состояние
        setFriends(prev => prev.map(friend => 
          friend.id === friendId 
            ? { ...friend, privacySettings: { showMyVacancies: true, showFriendsVacancies: true } }
            : friend
        ));
        setSuccessMessage('Настройки для друга сброшены');
        setTimeout(() => setSuccessMessage(''), 3000);
      } else {
        throw new Error('Failed to reset friend settings');
      }
    } catch (err) {
      console.error('Error resetting friend settings:', err);
      setError('Не удалось сбросить настройки для друга');
    } finally {
      setIsSaving(false);
    }
  };

  // Обновление настроек уведомлений
  const updateNotificationSettings = async (field, value) => {
    try {
      setIsSaving(true);
      const token = localStorage.getItem('authToken');
      
      const response = await fetch('http://localhost:5000/api/settings/notifications', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          [field]: value
        })
      });

      if (response.ok) {
        const data = await response.json();
        setNotificationSettings(data.settings);
        setSuccessMessage('Настройки уведомлений обновлены');
        setTimeout(() => setSuccessMessage(''), 3000);
      } else {
        throw new Error('Failed to update notification settings');
      }
    } catch (err) {
      console.error('Error updating notification settings:', err);
      setError('Не удалось сохранить настройки уведомлений');
    } finally {
      setIsSaving(false);
    }
  };

  // Обновление настроек профиля (упрощено - только для полей пароля)
  const updateProfileSettings = async (field, value) => {
    setProfileSettings(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Сохранение настроек профиля (только смена пароля)
  const saveProfileSettings = async () => {
    try {
      setIsSaving(true);
      const token = localStorage.getItem('authToken');
      
      // Изменение пароля
      const response = await fetch('http://localhost:5000/api/settings/profile/password', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          currentPassword: profileSettings.currentPassword,
          newPassword: profileSettings.newPassword,
          confirmPassword: profileSettings.confirmPassword
        })
      });

      if (response.ok) {
        setSuccessMessage('Пароль успешно изменен');
        setProfileSettings({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
        setTimeout(() => setSuccessMessage(''), 3000);
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to change password');
      }
    } catch (err) {
      console.error('Error saving profile settings:', err);
      setError(err.message || 'Не удалось изменить пароль');
    } finally {
      setIsSaving(false);
    }
  };

  const ToggleSwitch = ({ enabled, onChange, disabled = false }) => (
    <button
      type="button"
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${
        enabled ? 'bg-indigo-600' : 'bg-gray-200'
      } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      onClick={onChange}
      disabled={disabled}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
          enabled ? 'translate-x-6' : 'translate-x-1'
        }`}
      />
    </button>
  );

  const settingsSections = [
    {
      id: 'privacy',
      name: 'Приватность',
      icon: ShieldCheckIcon,
      description: 'Управление видимостью профиля и данных'
    },
    {
      id: 'notifications',
      name: 'Уведомления',
      icon: BellIcon,
      description: 'Настройки уведомлений и оповещений'
    },
    {
      id: 'profile',
      name: 'Профиль',
      icon: UserIcon,
      description: 'Основные настройки профиля и безопасности'
    }
  ];

  if (isLoading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <Spinner size="lg" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Заголовок */}
          <div className="mb-8">
            <div className="flex items-center space-x-4 mb-4">
              <Button
                variant="secondary"
                onClick={() => navigate('/profile')}
                className="flex items-center space-x-2"
              >
                <ArrowLeftIcon className="w-4 h-4" />
                <span>Назад к профилю</span>
              </Button>
            </div>
            
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Настройки
            </h1>
            <p className="text-gray-600">
              Управляйте настройками вашего аккаунта и приватностью
            </p>
          </div>

          {/* Сообщения об ошибках и успехе */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-800">{error}</p>
            </div>
          )}
          
          {successMessage && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-green-800">{successMessage}</p>
            </div>
          )}

          <div className="flex gap-8">
            {/* Боковая навигация */}
            <div className="w-80 flex-shrink-0">
              <Card padding="lg">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Разделы</h3>
                <nav className="space-y-2">
                  {settingsSections.map((section) => {
                    const IconComponent = section.icon;
                    return (
                      <button
                        key={section.id}
                        onClick={() => {
                          setActiveSection(section.id);
                          navigate(`/settings/${section.id}`);
                        }}
                        className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${
                          activeSection === section.id
                            ? 'bg-blue-50 text-blue-700 border border-blue-200'
                            : 'text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        <IconComponent className="w-5 h-5" />
                        <div>
                          <div className="font-medium">{section.name}</div>
                          <div className="text-xs text-gray-500">{section.description}</div>
                        </div>
                      </button>
                    );
                  })}
                </nav>
              </Card>
            </div>

            {/* Основной контент */}
            <div className="flex-1">
              {activeSection === 'privacy' && (
                <div className="space-y-6">
                  {/* Общие настройки приватности */}
                  {privacySettings && (
                    <>
                      {/* Видимость профиля */}
                      <Card padding="lg">
                        <div className="flex items-center space-x-3 mb-4">
                          <GlobeAltIcon className="w-6 h-6 text-gray-600" />
                          <h3 className="text-lg font-semibold text-gray-900">Видимость профиля</h3>
                        </div>
                        <p className="text-gray-600 mb-4">
                          Кто может видеть ваш профиль и основную информацию
                        </p>
                        
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <div>
                              <label className="text-sm font-medium text-gray-700">Уровень видимости</label>
                              <p className="text-xs text-gray-500">Определяет общую доступность вашего профиля</p>
                            </div>
                            <select
                              value={privacySettings.profileVisibility}
                              onChange={(e) => updateGeneralSettings('profileVisibility', e.target.value)}
                              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                              disabled={isSaving}
                            >
                              <option value="public">Публичный</option>
                              <option value="friends">Только друзья</option>
                              <option value="private">Приватный</option>
                            </select>
                          </div>
                        </div>
                      </Card>

                      {/* Информация профиля */}
                      <Card padding="lg">
                        <div className="flex items-center space-x-3 mb-4">
                          <UserIcon className="w-6 h-6 text-gray-600" />
                          <h3 className="text-lg font-semibold text-gray-900">Информация профиля</h3>
                        </div>
                        <p className="text-gray-600 mb-4">
                          Выберите, какую информацию о себе показывать другим пользователям
                        </p>
                        
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <label className="text-sm font-medium text-gray-700">Показывать вакансии</label>
                              <p className="text-xs text-gray-500">Отображать ваши вакансии в профиле</p>
                            </div>
                            <ToggleSwitch
                              enabled={privacySettings.showVacancies}
                              onChange={() => updateGeneralSettings('showVacancies', !privacySettings.showVacancies)}
                              disabled={isSaving}
                            />
                          </div>

                          <div className="flex items-center justify-between">
                            <div>
                              <label className="text-sm font-medium text-gray-700">Показывать связи</label>
                              <p className="text-xs text-gray-500">Отображать ваши профессиональные связи</p>
                            </div>
                            <ToggleSwitch
                              enabled={privacySettings.showConnections}
                              onChange={() => updateGeneralSettings('showConnections', !privacySettings.showConnections)}
                              disabled={isSaving}
                            />
                          </div>

                          <div className="flex items-center justify-between">
                            <div>
                              <label className="text-sm font-medium text-gray-700">Показывать опыт работы</label>
                              <p className="text-xs text-gray-500">Отображать ваш профессиональный опыт</p>
                            </div>
                            <ToggleSwitch
                              enabled={privacySettings.showWorkExperience}
                              onChange={() => updateGeneralSettings('showWorkExperience', !privacySettings.showWorkExperience)}
                              disabled={isSaving}
                            />
                          </div>

                          <div className="flex items-center justify-between">
                            <div>
                              <label className="text-sm font-medium text-gray-700">Показывать навыки</label>
                              <p className="text-xs text-gray-500">Отображать ваши профессиональные навыки</p>
                            </div>
                            <ToggleSwitch
                              enabled={privacySettings.showSkills}
                              onChange={() => updateGeneralSettings('showSkills', !privacySettings.showSkills)}
                              disabled={isSaving}
                            />
                          </div>

                          <div className="flex items-center justify-between">
                            <div>
                              <label className="text-sm font-medium text-gray-700">Показывать интересы</label>
                              <p className="text-xs text-gray-500">Отображать ваши профессиональные интересы</p>
                            </div>
                            <ToggleSwitch
                              enabled={privacySettings.showInterests}
                              onChange={() => updateGeneralSettings('showInterests', !privacySettings.showInterests)}
                              disabled={isSaving}
                            />
                          </div>

                          <div className="flex items-center justify-between">
                            <div>
                              <label className="text-sm font-medium text-gray-700">Показывать контактную информацию</label>
                              <p className="text-xs text-gray-500">Отображать email и телефон</p>
                            </div>
                            <ToggleSwitch
                              enabled={privacySettings.showContactInfo}
                              onChange={() => updateGeneralSettings('showContactInfo', !privacySettings.showContactInfo)}
                              disabled={isSaving}
                            />
                          </div>
                        </div>
                      </Card>

                      {/* Настройки для друзей */}
                      <Card padding="lg">
                        <div className="flex items-center space-x-3 mb-4">
                          <UserGroupIcon className="w-6 h-6 text-gray-600" />
                          <h3 className="text-lg font-semibold text-gray-900">Настройки для друзей</h3>
                        </div>
                        <p className="text-gray-600 mb-4">
                          Общие настройки того, что ваши друзья могут видеть
                        </p>
                        
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <label className="text-sm font-medium text-gray-700">Разрешить друзьям видеть мои вакансии</label>
                              <p className="text-xs text-gray-500">Друзья смогут видеть вакансии, которые вы создали</p>
                            </div>
                            <ToggleSwitch
                              enabled={privacySettings.allowFriendsToSeeMyVacancies}
                              onChange={() => updateGeneralSettings('allowFriendsToSeeMyVacancies', !privacySettings.allowFriendsToSeeMyVacancies)}
                              disabled={isSaving}
                            />
                          </div>

                          <div className="flex items-center justify-between">
                            <div>
                              <label className="text-sm font-medium text-gray-700">Разрешить друзьям видеть вакансии друзей</label>
                              <p className="text-xs text-gray-500">Друзья смогут видеть вакансии ваших общих друзей</p>
                            </div>
                            <ToggleSwitch
                              enabled={privacySettings.allowFriendsToSeeFriendsVacancies}
                              onChange={() => updateGeneralSettings('allowFriendsToSeeFriendsVacancies', !privacySettings.allowFriendsToSeeFriendsVacancies)}
                              disabled={isSaving}
                            />
                          </div>
                        </div>
                      </Card>

                      {/* Настройки приватности по друзьям */}
                      <Card padding="lg">
                        <div className="flex items-center space-x-3 mb-4">
                          <UserGroupIcon className="w-6 h-6 text-gray-600" />
                          <h3 className="text-lg font-semibold text-gray-900">Настройки для каждого друга</h3>
                        </div>
                        <p className="text-gray-600 mb-6">
                          Индивидуальные настройки приватности для каждого из ваших друзей
                        </p>

                        {friends.length === 0 ? (
                          <div className="text-center py-8">
                            <UserGroupIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 mb-2">
                              У вас пока нет друзей
                            </h3>
                            <p className="text-gray-500">
                              Добавьте друзей, чтобы настроить индивидуальную приватность
                            </p>
                          </div>
                        ) : (
                          <div className="space-y-4">
                            {friends.map((friend) => (
                              <div key={friend.id} className="border border-gray-200 rounded-lg p-4">
                                <div className="flex items-center space-x-4 mb-4">
                                  <Avatar 
                                    fallback={friend.name}
                                    size="md"
                                  />
                                  <div className="flex-1">
                                    <h4 className="font-semibold text-gray-900">{friend.name}</h4>
                                    <p className="text-sm text-gray-600">{friend.position}</p>
                                    {friend.company && (
                                      <p className="text-sm text-gray-500">{friend.company}</p>
                                    )}
                                  </div>
                                  <Button
                                    variant="secondary"
                                    size="sm"
                                    onClick={() => resetFriendSettings(friend.id)}
                                    disabled={isSaving}
                                    className="text-xs"
                                  >
                                    Сбросить
                                  </Button>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  <div className="flex items-center justify-between">
                                    <div>
                                      <label className="text-sm font-medium text-gray-700">
                                        Показать вакансии
                                      </label>
                                      <p className="text-xs text-gray-500">
                                        Разрешить {friend.name} видеть ваши вакансии
                                      </p>
                                    </div>
                                    <ToggleSwitch
                                      enabled={friend.privacySettings.showMyVacancies}
                                      onChange={() => updateFriendSettings(friend.id, 'showMyVacancies', !friend.privacySettings.showMyVacancies)}
                                      disabled={isSaving}
                                    />
                                  </div>

                                  <div className="flex items-center justify-between">
                                    <div>
                                      <label className="text-sm font-medium text-gray-700">
                                        Показать его вакансии
                                      </label>
                                      <p className="text-xs text-gray-500">
                                        Разрешить вашим друзьям видеть вакансии {friend.name}
                                      </p>
                                    </div>
                                    <ToggleSwitch
                                      enabled={friend.privacySettings.showFriendsVacancies}
                                      onChange={() => updateFriendSettings(friend.id, 'showFriendsVacancies', !friend.privacySettings.showFriendsVacancies)}
                                      disabled={isSaving}
                                    />
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </Card>
                    </>
                  )}
                </div>
              )}

              {activeSection === 'notifications' && (
                <div className="space-y-6">
                  <Card padding="lg">
                    <div className="flex items-center space-x-3 mb-4">
                      <BellIcon className="w-6 h-6 text-gray-600" />
                      <h3 className="text-lg font-semibold text-gray-900">Настройки уведомлений</h3>
                    </div>
                    <p className="text-gray-600 mb-6">
                      Выберите, какие уведомления вы хотите получать
                    </p>
                    
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <label className="text-sm font-medium text-gray-700">Email уведомления</label>
                          <p className="text-xs text-gray-500">Получать уведомления по электронной почте</p>
                        </div>
                        <ToggleSwitch
                          enabled={notificationSettings.emailNotifications}
                          onChange={() => updateNotificationSettings('emailNotifications', !notificationSettings.emailNotifications)}
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <label className="text-sm font-medium text-gray-700">Push уведомления</label>
                          <p className="text-xs text-gray-500">Получать push-уведомления в браузере</p>
                        </div>
                        <ToggleSwitch
                          enabled={notificationSettings.pushNotifications}
                          onChange={() => updateNotificationSettings('pushNotifications', !notificationSettings.pushNotifications)}
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <label className="text-sm font-medium text-gray-700">Уведомления о вакансиях</label>
                          <p className="text-xs text-gray-500">Получать уведомления о новых подходящих вакансиях</p>
                        </div>
                        <ToggleSwitch
                          enabled={notificationSettings.vacancyAlerts}
                          onChange={() => updateNotificationSettings('vacancyAlerts', !notificationSettings.vacancyAlerts)}
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <label className="text-sm font-medium text-gray-700">Запросы на связь</label>
                          <p className="text-xs text-gray-500">Получать уведомления о новых запросах на связь</p>
                        </div>
                        <ToggleSwitch
                          enabled={notificationSettings.connectionRequests}
                          onChange={() => updateNotificationSettings('connectionRequests', !notificationSettings.connectionRequests)}
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <label className="text-sm font-medium text-gray-700">Сообщения</label>
                          <p className="text-xs text-gray-500">Получать уведомления о новых сообщениях</p>
                        </div>
                        <ToggleSwitch
                          enabled={notificationSettings.messages}
                          onChange={() => updateNotificationSettings('messages', !notificationSettings.messages)}
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <label className="text-sm font-medium text-gray-700">Еженедельная сводка</label>
                          <p className="text-xs text-gray-500">Получать еженедельную сводку активности</p>
                        </div>
                        <ToggleSwitch
                          enabled={notificationSettings.weeklyDigest}
                          onChange={() => updateNotificationSettings('weeklyDigest', !notificationSettings.weeklyDigest)}
                        />
                      </div>
                    </div>
                  </Card>
                </div>
              )}

              {activeSection === 'profile' && (
                <div className="space-y-6">
                  {/* Смена пароля */}
                  <Card padding="lg">
                    <div className="flex items-center space-x-3 mb-4">
                      <KeyIcon className="w-6 h-6 text-gray-600" />
                      <h3 className="text-lg font-semibold text-gray-900">Смена пароля</h3>
                    </div>
                    
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Текущий пароль
                        </label>
                        <input
                          type="password"
                          value={profileSettings.currentPassword}
                          onChange={(e) => updateProfileSettings('currentPassword', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Введите текущий пароль"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Новый пароль
                        </label>
                        <input
                          type="password"
                          value={profileSettings.newPassword}
                          onChange={(e) => updateProfileSettings('newPassword', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Введите новый пароль"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Подтвердите новый пароль
                        </label>
                        <input
                          type="password"
                          value={profileSettings.confirmPassword}
                          onChange={(e) => updateProfileSettings('confirmPassword', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Подтвердите новый пароль"
                        />
                      </div>

                      <Button
                        variant="primary"
                        onClick={saveProfileSettings}
                        disabled={isSaving || !profileSettings.currentPassword || !profileSettings.newPassword || !profileSettings.confirmPassword}
                        className="mt-4"
                      >
                        {isSaving ? 'Сохранение...' : 'Изменить пароль'}
                      </Button>
                    </div>
                  </Card>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default SettingsPage;
