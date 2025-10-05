import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Layout from '../components/layout/Layout';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import Avatar from '../components/ui/Avatar';
import WorkExperienceSection from '../components/WorkExperienceSection';
import { 
  PencilIcon, 
  EyeIcon, 
  UserGroupIcon, 
  BriefcaseIcon,
  MapPinIcon,
  AcademicCapIcon,
  EnvelopeIcon,
  PhoneIcon,
  ChatBubbleLeftRightIcon,
  Cog6ToothIcon,
  DocumentTextIcon,
  StarIcon,
  ShareIcon,
  ChartBarIcon,
  ArrowRightOnRectangleIcon,
  PlusIcon
} from '@heroicons/react/24/outline';
import { useNavigate } from 'react-router-dom';

const ProfilePage = () => {
  const { id } = useParams();
  const { user: currentUser, loading, logout } = useAuth();
  const navigate = useNavigate();
  const [profileUser, setProfileUser] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [friendStats, setFriendStats] = useState({
    friendsCount: 0,
    connectionsCount: 0
  });
  
  // Определяем чей профиль показываем
  const isOwnProfile = !id;

  // Функция загрузки статистики друзей
  const loadFriendStats = async (userId) => {
    try {
      const token = localStorage.getItem('authToken');
      console.log('Loading friend stats for userId:', userId);
      console.log('Token exists:', !!token);
      
      const response = await fetch(`http://localhost:5000/api/connections/stats/${userId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      
      console.log('API response:', data);
      
      if (data.success) {
        setFriendStats({
          friendsCount: data.stats.friendsCount,
          connectionsCount: data.stats.totalConnections
        });
        console.log('Stats updated:', {
          friendsCount: data.stats.friendsCount,
          connectionsCount: data.stats.totalConnections
        });
      } else {
        console.error('API error:', data.error);
      }
    } catch (error) {
      console.error('Ошибка загрузки статистики друзей:', error);
    }
  };

  // Функция выхода из аккаунта
  const handleLogout = () => {
    logout();
    navigate('/');
  };

  // Загружаем данные пользователя
  useEffect(() => {
    const loadUserData = async () => {
      if (isOwnProfile && currentUser) {
        // Для собственного профиля используем данные из AuthContext
        setProfileUser(currentUser);
        // Загружаем статистику друзей для собственного профиля
        loadFriendStats(currentUser.id);
      } else if (!isOwnProfile && id) {
        // Для чужого профиля загружаем данные из API
        setLoadingProfile(true);
        try {
          const response = await fetch(`http://localhost:5000/api/users/${id}`);
          const data = await response.json();
          
          if (data.success) {
            // Преобразуем данные из БД в формат приложения
            const userData = {
              id: data.user.id,
              name: data.user.name,
              email: data.user.email,
              avatar: data.user.avatarUrl,
              position: data.user.position,
              company: data.user.company,
              location: data.user.location,
              status: data.user.status,
              skills: data.user.skills || [],
              interests: data.user.interests || [],
              about: data.user.bio,
              views: 128, // Можно получать из БД
              friends: [], // Список друзей будет загружаться отдельно
              education: [
                {
                  faculty: 'Высшее образование',
                  university: 'Университет',
                  period: 'Годы обучения',
                  degree: 'Степень',
                  specialization: 'Специализация'
                }
              ],
              contact: {
                email: data.user.email,
                phone: data.user.phone || '+7 (999) 000-00-00',
                telegram: '@username'
              },
              preferences: {
                notifications: true,
                emailUpdates: true,
                profileVisibility: 'public',
                jobAlerts: true
              }
            };
            setProfileUser(userData);
            
            // Загружаем статистику друзей для всех профилей
            loadFriendStats(data.user.id);
          } else {
            console.error('Ошибка загрузки пользователя:', data.error);
            setProfileUser(null);
          }
        } catch (error) {
          console.error('Ошибка загрузки пользователя:', error);
          setProfileUser(null);
        } finally {
          setLoadingProfile(false);
        }
      }
    };

    loadUserData();
  }, [id, isOwnProfile, currentUser]);

  // Показываем загрузку пока не загрузится профиль
  if ((isOwnProfile && loading) || (!isOwnProfile && loadingProfile) || !profileUser) {
    return (
      <Layout>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
            <p className="text-gray-600 mt-4">Загрузка профиля...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Основная информация */}
          <div className="lg:col-span-2">
            {/* Заголовок профиля */}
            <div className="bg-white rounded-lg shadow p-6 mb-6">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4">
                  <Avatar
                    fallback={profileUser.name}
                    size="2xl"
                  />
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900">{profileUser.name}</h1>
                    <p className="text-lg text-gray-700">{profileUser.position}</p>
                    <div className="flex items-center text-gray-500 mt-1">
                      <MapPinIcon className="w-4 h-4 mr-1" />
                      <span>{profileUser.location}</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex space-x-2">
                  {isOwnProfile ? (
                    <>
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => navigate('/profile/edit')}
                        className="flex items-center"
                      >
                        <PencilIcon className="w-4 h-4 mr-1" />
                        Редактировать
                      </Button>
                      <Button variant="outline" size="sm">
                        <ShareIcon className="w-4 h-4" />
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button variant="primary" size="sm">Связаться</Button>
                      <Button variant="outline" size="sm">
                        <StarIcon className="w-4 h-4" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <ShareIcon className="w-4 h-4" />
                      </Button>
                    </>
                  )}
                </div>
              </div>

            </div>

            {/* Навыки */}
            <div className="bg-white rounded-lg shadow p-6 mb-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Навыки</h2>
              <div className="flex flex-wrap gap-2">
                {profileUser.skills?.map((skill, index) => (
                  <Badge key={index} variant="outline">{skill}</Badge>
                ))}
              </div>
            </div>

            {/* Сферы деятельности */}
            <div className="bg-white rounded-lg shadow p-6 mb-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Сферы деятельности</h2>
              <div className="flex flex-wrap gap-2">
                <Badge variant="primary">IT</Badge>
                <Badge variant="primary">Строительство</Badge>
              </div>
            </div>


            {/* Образование */}
            {profileUser.education && (
              <div className="bg-white rounded-lg shadow p-6 mb-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Образование</h2>
                <div className="space-y-4">
                  {profileUser.education.map((edu, index) => (
                    <div key={index} className="flex">
                      <div className="flex-shrink-0 w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mr-4">
                        <AcademicCapIcon className="w-6 h-6 text-green-600" />
                      </div>
                      <div className="flex-grow">
                        <h3 className="font-semibold text-gray-900">{edu.university}</h3>
                        <p className="text-gray-700">{edu.faculty}</p>
                        <p className="text-sm text-gray-500">{edu.period}</p>
                        {edu.specialization && (
                          <p className="text-gray-600">{edu.specialization}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* О себе */}
            {profileUser.about && (
              <div className="bg-white rounded-lg shadow p-6 mb-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">О себе</h2>
                <p className="text-gray-600">{profileUser.about}</p>
              </div>
            )}

            {/* Карьерный путь */}
            <WorkExperienceSection 
              userId={profileUser.id} 
              isOwnProfile={isOwnProfile}
            />

            {/* Личная информация */}
            {(isOwnProfile || profileUser.contact) && (
              <div className="bg-white rounded-lg shadow p-6 mb-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Личная информация</h2>
                <div className="space-y-3">
                  <div className="flex items-center">
                    <EnvelopeIcon className="w-5 h-5 text-gray-400 mr-3" />
                    <span className="text-gray-600">
                      {isOwnProfile ? currentUser?.email : profileUser.contact?.email || 'Скрыто'}
                    </span>
                  </div>
                  {profileUser.contact?.phone && (
                    <div className="flex items-center">
                      <PhoneIcon className="w-5 h-5 text-gray-400 mr-3" />
                      <span className="text-gray-600">{profileUser.contact.phone}</span>
                    </div>
                  )}
                  {profileUser.contact?.telegram && (
                    <div className="flex items-center">
                      <ChatBubbleLeftRightIcon className="w-5 h-5 text-gray-400 mr-3" />
                      <span className="text-gray-600">{profileUser.contact.telegram}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Мои вакансии - временно отключено */}
            {false && (() => {
              const userVacancies = []; // Временно пустой массив
              if (userVacancies.length === 0) return null;
              
              return (
                <div className="bg-white rounded-lg shadow p-6 mb-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-lg font-semibold text-gray-900">
                      {isOwnProfile ? 'Мои вакансии' : `Вакансии от ${profileUser.name.split(' ')[0]}`}
                    </h2>
                    <span className="text-sm text-gray-500">{userVacancies.length} {userVacancies.length === 1 ? 'вакансия' : 'вакансий'}</span>
                  </div>
                  
                  <div className="space-y-4">
                    {userVacancies.slice(0, 3).map((vacancy) => (
                      <div key={vacancy.id} className="border border-gray-200 rounded-lg p-4 hover:border-indigo-300 transition-colors">
                        <div className="flex items-start justify-between mb-2">
                          <h3 className="font-medium text-gray-900 text-sm">{vacancy.title}</h3>
                          <Badge 
                            variant={vacancy.type === 'freelance' ? 'warning' : 
                                    vacancy.type === 'internship' ? 'info' : 
                                    vacancy.type === 'creative' ? 'success' : 'primary'} 
                            size="sm"
                          >
                            {vacancy.type === 'freelance' ? 'Фриланс' : 
                             vacancy.type === 'internship' ? 'Стажировка' : 
                             vacancy.type === 'creative' ? 'Творчество' : 'Работа'}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{vacancy.description}</p>
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-indigo-600">{vacancy.salary}</span>
                          <span className="text-xs text-gray-500">{vacancy.location}</span>
                        </div>
                        {vacancy.skills && vacancy.skills.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {vacancy.skills.slice(0, 3).map((skill, index) => (
                              <Badge key={index} variant="outline" size="xs">{skill}</Badge>
                            ))}
                            {vacancy.skills.length > 3 && (
                              <Badge variant="outline" size="xs">+{vacancy.skills.length - 3}</Badge>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                  
                  {userVacancies.length > 3 && (
                    <Button 
                      variant="outline" 
                      className="w-full mt-4"
                      onClick={() => navigate('/vacancies')}
                    >
                      Показать все {userVacancies.length} вакансий
                    </Button>
                  )}
                  
                  {isOwnProfile && (
                    <Button 
                      variant="primary" 
                      className="w-full mt-2"
                      onClick={() => navigate('/post-vacancy')}
                    >
                      + Добавить вакансию
                    </Button>
                  )}
                </div>
              );
            })()}

            {/* Хобби */}
            <div className="bg-white rounded-lg shadow p-6 mb-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Хобби</h2>
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline">Фотография</Badge>
                <Badge variant="outline">Путешествия</Badge>
                <Badge variant="outline">Лыжный спорт</Badge>
              </div>
            </div>

            {/* Музыка */}
            <div className="bg-white rounded-lg shadow p-6 mb-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Музыка</h2>
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline">Электроника</Badge>
                <Badge variant="outline">Indie rock</Badge>
                <Badge variant="outline">Джаз</Badge>
              </div>
            </div>

            {/* Интересы */}
            <div className="bg-white rounded-lg shadow p-6 mb-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Интересы</h2>
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline">Искусственный интеллект</Badge>
                <Badge variant="outline">Спортивное фехтование</Badge>
                <Badge variant="outline">Веганство</Badge>
                <Badge variant="outline">VR дизайн</Badge>
              </div>
            </div>
          </div>

          {/* Правый сайдбар */}
          <div className="space-y-6">

            {/* Статус профиля */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Статус профиля</h3>
              <div className="text-center">
                <Badge variant={profileUser.status === 'Открыт к предложениям' ? 'success' : 'secondary'} className="mb-4">
                  {profileUser.status}
                </Badge>
              </div>
            </div>

            {/* Статистика */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Статистика</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                      <EyeIcon className="w-4 h-4 text-blue-600" />
                    </div>
                    <span className="text-gray-600">Просмотры профиля</span>
                  </div>
                  <span className="text-2xl font-bold text-blue-600">
                    {profileUser.views || 128}
                  </span>
                </div>
              </div>
            </div>

            {/* Статистика друзей - для всех профилей */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Связи</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-3">
                      <UserGroupIcon className="w-4 h-4 text-green-600" />
                    </div>
                    <span className="text-gray-600">Друзья</span>
                  </div>
                  <span className="text-2xl font-bold text-green-600">
                    {friendStats.friendsCount}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center mr-3">
                      <ChartBarIcon className="w-4 h-4 text-purple-600" />
                    </div>
                    <span className="text-gray-600">Всего связей</span>
                  </div>
                  <span className="text-2xl font-bold text-purple-600">
                    {friendStats.connectionsCount}
                  </span>
                </div>
              </div>
              {isOwnProfile && (
                <Button
                  variant="outline"
                  className="w-full mt-4"
                  onClick={() => navigate('/connections')}
                >
                  Подробнее
                </Button>
              )}
            </div>

            {/* Мои вакансии */}
            {isOwnProfile && (
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Мои вакансии</h3>
                <div className="space-y-3">
                  <Button 
                    variant="outline" 
                    className="w-full justify-start"
                    onClick={() => navigate('/vacancies?tab=my')}
                  >
                    <BriefcaseIcon className="w-4 h-4 mr-2" />
                    Управление вакансиями
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full justify-start"
                    onClick={() => navigate('/create-vacancy')}
                  >
                    <PlusIcon className="w-4 h-4 mr-2" />
                    Создать вакансию
                  </Button>
                </div>
              </div>
            )}

            {/* Избранные вакансии */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Избранные вакансии</h3>
              <div className="space-y-3">
                <div className="border border-gray-200 rounded-lg p-3">
                  <h4 className="font-medium text-gray-900">Senior Frontend Developer</h4>
                  <p className="text-sm text-gray-600">Яндекс</p>
                  <p className="text-sm text-gray-500">200-250k • Москва/Удаленно</p>
                </div>
                <div className="border border-gray-200 rounded-lg p-3">
                  <h4 className="font-medium text-gray-900">Lead React Developer</h4>
                  <p className="text-sm text-gray-600">Сбер</p>
                  <p className="text-sm text-gray-500">250-300k • СПб/Удаленно</p>
                </div>
              </div>
              <Button variant="outline" className="w-full mt-4">
                Показать все избранные
              </Button>
            </div>

            {isOwnProfile && (
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Настройки</h3>
                <div className="space-y-3">
                  <Button variant="outline" size="sm" className="w-full justify-start">
                    <Cog6ToothIcon className="w-4 h-4 mr-2" />
                    Приватность профиля
                  </Button>
                  <Button variant="outline" size="sm" className="w-full justify-start">
                    <DocumentTextIcon className="w-4 h-4 mr-2" />
                    Уведомления
                  </Button>
                  <Button variant="outline" size="sm" className="w-full justify-start">
                    <UserGroupIcon className="w-4 h-4 mr-2" />
                    Аккаунт
                  </Button>
                  <Button variant="outline" size="sm" className="w-full justify-start">
                    <DocumentTextIcon className="w-4 h-4 mr-2" />
                    Экспорт данных
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full justify-start text-red-600 border-red-200 hover:bg-red-50"
                    onClick={handleLogout}
                  >
                    <ArrowRightOnRectangleIcon className="w-4 h-4 mr-2" />
                    Выход из аккаунта
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

export default ProfilePage;
