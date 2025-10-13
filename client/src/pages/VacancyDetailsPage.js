import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import Avatar from '../components/ui/Avatar';
import RecruiterInfo from '../components/RecruiterInfo';
import Spinner from '../components/ui/Spinner';
import { 
  MapPinIcon,
  CurrencyDollarIcon,
  ClockIcon,
  ArrowLeftIcon,
  CheckIcon,
  CalendarIcon,
  UserIcon,
  PhoneIcon,
  EnvelopeIcon,
  PaperAirplaneIcon,
  BookmarkIcon,
  ShareIcon
} from '@heroicons/react/24/outline';

const VacancyDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [vacancy, setVacancy] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchVacancy = useCallback(async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('authToken');
      const response = await fetch(`http://localhost:5000/api/vacancies/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setVacancy(data.vacancy);
      } else {
        setError('Вакансия не найдена');
      }
    } catch (err) {
      setError('Ошибка загрузки вакансии');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchVacancy();
  }, [fetchVacancy]);

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-screen">
          <Spinner size="lg" />
        </div>
      </Layout>
    );
  }

  if (error || !vacancy) {
    return (
      <Layout>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Вакансия не найдена</h1>
            <Button onClick={() => navigate('/vacancies')}>
              Вернуться к вакансиям
            </Button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-24 md:pb-8">
        <Button
          variant="ghost"
          icon={ArrowLeftIcon}
          onClick={() => navigate('/vacancies')}
          className="mb-6"
        >
          Назад к вакансиям
        </Button>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            {/* Основная информация о вакансии */}
            <Card padding="lg">
              <div className="flex items-start space-x-4 mb-6">
                <img
                  src={vacancy.companyLogo || '/default-company-logo.png'}
                  alt={vacancy.company}
                  className="w-16 h-16 rounded-xl object-cover shadow-md"
                />
                <div className="flex-1">
                  <h1 className="text-2xl font-bold text-gray-900 mb-2">{vacancy.title}</h1>
                  <p className="text-lg text-gray-600 mb-2">{vacancy.company}</p>
                  
                  <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-4">
                    <div className="flex items-center space-x-1">
                      <MapPinIcon className="h-4 w-4" />
                      <span>{vacancy.location}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <CurrencyDollarIcon className="h-4 w-4" />
                      <span>
                        {vacancy.salaryMin && vacancy.salaryMax 
                          ? `${vacancy.salaryMin.toLocaleString()}-${vacancy.salaryMax.toLocaleString()} ${vacancy.salaryCurrency || '₽'}`
                          : vacancy.salaryMin 
                            ? `от ${vacancy.salaryMin.toLocaleString()} ${vacancy.salaryCurrency || '₽'}`
                            : 'По договоренности'
                        }
                      </span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <ClockIcon className="h-4 w-4" />
                      <span>{new Date(vacancy.createdAt).toLocaleDateString('ru-RU')}</span>
                    </div>
                  </div>

                  {/* Бейджи с основной информацией */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    {vacancy.vacancyType && (
                      <Badge variant="primary" size="sm">
                        {vacancy.vacancyType.name}
                      </Badge>
                    )}
                    {vacancy.workFormat && (
                      <Badge variant="success" size="sm">
                        {vacancy.workFormat.name}
                      </Badge>
                    )}
                    {vacancy.workingStyle && (
                      <Badge variant="warning" size="sm">
                        {vacancy.workingStyle.name}
                      </Badge>
                    )}
                    {vacancy.experienceLevel && (
                      <Badge variant="secondary" size="sm">
                        {vacancy.experienceLevel}
                      </Badge>
                    )}
                    {vacancy.hoursPerWeek && (
                      <Badge variant="info" size="sm">
                        {vacancy.hoursPerWeek} ч/нед
                      </Badge>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex space-x-4">
                <Button variant="primary" className="flex-1" icon={PaperAirplaneIcon}>
                  Откликнуться
                </Button>
                <Button variant="outline" icon={BookmarkIcon}>
                  Сохранить
                </Button>
                <Button variant="outline" icon={ShareIcon}>
                  Поделиться
                </Button>
              </div>
            </Card>


            {/* Фотографии вакансии */}
            {vacancy.photos && vacancy.photos.length > 0 && (
              <Card padding="lg">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Фотографии</h2>
                <div className="space-y-4">
                  {/* Главная фотография */}
                  <div className="w-full h-64 rounded-lg overflow-hidden">
                    <img
                      src={vacancy.photos[0].url}
                      alt={vacancy.photos[0].alt || 'Фото вакансии'}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  
                  {/* Дополнительные фотографии */}
                  {vacancy.photos.length > 1 && (
                    <div className="grid grid-cols-3 gap-2">
                      {vacancy.photos.slice(1, 4).map((photo, index) => (
                        <div key={photo.id} className="h-20 rounded-lg overflow-hidden">
                          <img
                            src={photo.url}
                            alt={photo.alt || `Фото ${index + 2}`}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </Card>
            )}

            {/* Описание и требования */}
            <Card padding="lg">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Описание</h2>
              <p className="text-gray-700 mb-6">{vacancy.description}</p>
              
              {vacancy.requirements && (
                <>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Требования</h3>
                  <p className="text-gray-700 mb-6">{vacancy.requirements}</p>
                </>
              )}
            </Card>

            {/* Навыки */}
            {vacancy.skills && vacancy.skills.length > 0 && (
              <Card padding="lg">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Требуемые навыки</h3>
                <div className="flex flex-wrap gap-2">
                  {vacancy.skills.map((skill) => (
                    <Badge key={skill.id} variant="primary" size="sm">
                      {skill.name}
                    </Badge>
                  ))}
                </div>
              </Card>
            )}

            {/* Сферы деятельности */}
            {vacancy.fields && vacancy.fields.length > 0 && (
              <Card padding="lg">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Сферы деятельности</h3>
                <div className="flex flex-wrap gap-2">
                  {vacancy.fields.map((field) => (
                    <Badge key={field.id} variant="success" size="sm">
                      {field.name}
                    </Badge>
                  ))}
                </div>
              </Card>
            )}

            {/* Что мы предлагаем */}
            {vacancy.offers && vacancy.offers.length > 0 && (
              <Card padding="lg">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Что мы предлагаем</h3>
                <ul className="space-y-2">
                  {vacancy.offers.map((offer) => (
                    <li key={offer.id} className="flex items-center text-gray-700">
                      <CheckIcon className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                      {offer.name}
                    </li>
                  ))}
                </ul>
              </Card>
            )}

            {/* Что получит участник */}
            {vacancy.participantReceives && vacancy.participantReceives.length > 0 && (
              <Card padding="lg">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Что получит участник</h3>
                <ul className="space-y-2">
                  {vacancy.participantReceives.map((receive) => (
                    <li key={receive.id} className="flex items-center text-gray-700">
                      <CheckIcon className="h-4 w-4 text-blue-500 mr-2 flex-shrink-0" />
                      {receive.name}
                    </li>
                  ))}
                </ul>
              </Card>
            )}

            {/* Приобретаемые навыки */}
            {vacancy.acquiredSkills && vacancy.acquiredSkills.length > 0 && (
              <Card padding="lg">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Приобретаемые навыки</h3>
                <div className="flex flex-wrap gap-2">
                  {vacancy.acquiredSkills.map((skill, index) => (
                    <Badge key={index} variant="info" size="sm">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </Card>
            )}
          </div>

          <div className="space-y-6">
            {/* Детали вакансии */}
            <Card padding="lg">
              <h3 className="font-semibold text-gray-900 mb-4">Детали вакансии</h3>
              <div className="space-y-3">
                {vacancy.startDate && (
                  <div className="flex items-center space-x-2 text-sm">
                    <CalendarIcon className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-600">Начало работы:</span>
                    <span className="font-medium">{new Date(vacancy.startDate).toLocaleDateString('ru-RU')}</span>
                  </div>
                )}
                {vacancy.endDate && (
                  <div className="flex items-center space-x-2 text-sm">
                    <CalendarIcon className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-600">Окончание:</span>
                    <span className="font-medium">{new Date(vacancy.endDate).toLocaleDateString('ru-RU')}</span>
                  </div>
                )}
                {vacancy.hoursPerWeek && (
                  <div className="flex items-center space-x-2 text-sm">
                    <ClockIcon className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-600">Часов в неделю:</span>
                    <span className="font-medium">{vacancy.hoursPerWeek}</span>
                  </div>
                )}
                {vacancy.salaryCurrency && (
                  <div className="flex items-center space-x-2 text-sm">
                    <CurrencyDollarIcon className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-600">Валюта:</span>
                    <span className="font-medium">{vacancy.salaryCurrency}</span>
                  </div>
                )}
              </div>
            </Card>

            {/* Контактная информация */}
            <Card padding="lg">
              <h3 className="font-semibold text-gray-900 mb-4">Контактная информация</h3>
              <div className="space-y-3">
                {vacancy.contactEmail && (
                  <div className="flex items-center space-x-2 text-sm">
                    <EnvelopeIcon className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-600">{vacancy.contactEmail}</span>
                  </div>
                )}
                {vacancy.telegramUsername && (
                  <div className="flex items-center space-x-2 text-sm">
                    <UserIcon className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-600">@{vacancy.telegramUsername}</span>
                  </div>
                )}
                {vacancy.user?.phone && (
                  <div className="flex items-center space-x-2 text-sm">
                    <PhoneIcon className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-600">{vacancy.user.phone}</span>
                  </div>
                )}
              </div>
            </Card>

            {/* О компании */}
            <Card padding="lg">
              <h3 className="font-semibold text-gray-900 mb-4">О компании</h3>
              <p className="text-gray-700 text-sm mb-4">
                Ведущая технологическая компания, специализирующаяся на разработке 
                инновационных решений для бизнеса.
              </p>
              <Button variant="outline" size="sm" className="w-full">
                Посмотреть все вакансии
              </Button>
            </Card>

            {/* Рекрутер */}
            <Card padding="lg">
              <h3 className="font-semibold text-gray-900 mb-4">Рекрутер</h3>
              {vacancy.user ? (
                <RecruiterInfo 
                  recruiterId={vacancy.user.id}
                  recruiterName={vacancy.user.name}
                  recruiterPosition={vacancy.user.position}
                  recruiterCompany={vacancy.user.company}
                />
              ) : (
                <p className="text-gray-500 text-sm">Информация о рекрутере недоступна</p>
              )}
            </Card>

            {/* Найдено через общих друзей (если не прямой друг) */}
            {vacancy.connectionInfo && !vacancy.connectionInfo.isDirectConnection && vacancy.connectionInfo.mutualConnections && vacancy.connectionInfo.mutualConnections.length > 0 && (
              <Card padding="lg">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Найдено через общих друзей</h3>
                <div className="space-y-3">
                  <p className="text-sm text-gray-600">Эта вакансия найдена через ваших общих друзей:</p>
                  <div className="flex flex-wrap gap-3">
                    {vacancy.connectionInfo.mutualConnections
                      .filter((mutual, index, self) => index === self.findIndex(m => m.id === mutual.id))
                      .slice(0, 3)
                      .map((mutual) => (
                        <div
                          key={mutual.id}
                          className="flex items-center space-x-2 p-2 bg-blue-50 rounded-lg cursor-pointer hover:bg-blue-100 transition-colors"
                          onClick={() => navigate(`/profile/${mutual.id}`)}
                        >
                          <Avatar fallback={mutual.name} size="sm" />
                          <div>
                            <p className="font-medium text-gray-900">{mutual.name}</p>
                            {mutual.position && (
                              <p className="text-xs text-gray-600">{mutual.position}</p>
                            )}
                          </div>
                        </div>
                      ))}
                    {(() => {
                      const unique = vacancy.connectionInfo.mutualConnections.filter((mutual, index, self) => index === self.findIndex(m => m.id === mutual.id));
                      const remaining = unique.length - 3;
                      return remaining > 0 ? (
                        <div className="flex items-center space-x-2 p-2 bg-gray-50 rounded-lg">
                          <div className="w-6 h-6 bg-gray-300 rounded-full flex items-center justify-center">
                            <span className="text-xs font-medium text-gray-600">+{remaining}</span>
                          </div>
                        </div>
                      ) : null;
                    })()}
                  </div>
                </div>
              </Card>
            )}

            {/* Статистика просмотров */}
            <Card padding="lg">
              <h3 className="font-semibold text-gray-900 mb-4">Статистика</h3>
              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex items-center justify-between">
                  <span>Просмотры:</span>
                  <span className="font-medium">1,234</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Отклики:</span>
                  <span className="font-medium">45</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Сохранения:</span>
                  <span className="font-medium">12</span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default VacancyDetailsPage;