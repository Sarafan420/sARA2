import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Spinner from '../components/ui/Spinner';
import Avatar from '../components/ui/Avatar';
import { 
  ArrowLeftIcon,
  ShieldCheckIcon,
  UserGroupIcon,
  EyeIcon,
  EyeSlashIcon,
  GlobeAltIcon,
  LockClosedIcon,
  UserIcon,
  Cog6ToothIcon
} from '@heroicons/react/24/outline';

const PrivacySettingsPage = () => {
  const { user, isAuthenticated, loading } = useAuth();
  
  // Все хуки должны быть в начале компонента
  const [activeTab, setActiveTab] = useState('general'); // 'general', 'friends'
  const [privacySettings, setPrivacySettings] = useState(null);
  const [friends, setFriends] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');

  // Загрузка настроек приватности
  const fetchPrivacySettings = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch('http://localhost:5000/api/privacy/settings', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setPrivacySettings(data.settings);
      } else {
        throw new Error('Failed to fetch privacy settings');
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

  // Загрузка данных при изменении вкладки
  useEffect(() => {
    if (!isAuthenticated || !user) return;
    
    setIsLoading(true);
    setError(null);
    
    Promise.all([
      fetchPrivacySettings(),
      fetchFriends()
    ]).finally(() => setIsLoading(false));
  }, [isAuthenticated, user]);

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
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Заголовок */}
          <div className="mb-8">
            <div className="flex items-center space-x-4 mb-4">
              <Button
                variant="secondary"
                onClick={() => window.history.back()}
                className="flex items-center space-x-2"
              >
                <ArrowLeftIcon className="w-4 h-4" />
                <span>Назад</span>
              </Button>
            </div>
            
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Настройки приватности профиля
            </h1>
            <p className="text-gray-600">
              Управляйте тем, кто может видеть информацию о вас и ваших вакансиях
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

          {/* Вкладки */}
          <div className="mb-6">
            <div className="border-b border-gray-200">
              <nav className="-mb-px flex space-x-8">
                <button
                  onClick={() => setActiveTab('general')}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'general'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <ShieldCheckIcon className="w-5 h-5 inline mr-2" />
                  Общая приватность
                </button>
                <button
                  onClick={() => setActiveTab('friends')}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'friends'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <UserGroupIcon className="w-5 h-5 inline mr-2" />
                  Приватность по друзьям
                </button>
              </nav>
            </div>
          </div>

          {/* Контент */}
          {activeTab === 'general' && privacySettings && (
            <div className="space-y-6">
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
            </div>
          )}

          {activeTab === 'friends' && (
            <div className="space-y-6">
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
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default PrivacySettingsPage;
