import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Layout from '../components/layout/Layout';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Spinner from '../components/ui/Spinner';
import Avatar from '../components/ui/Avatar';
import { 
  ArrowLeftIcon,
  UserIcon,
  CalendarIcon,
  EnvelopeIcon,
  PhoneIcon
} from '@heroicons/react/24/outline';

const VacancyResponsesPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [vacancy, setVacancy] = useState(null);
  const [responses, setResponses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchVacancyAndResponses = async () => {
      try {
        setIsLoading(true);
        const token = localStorage.getItem('authToken');
        
        // Загружаем данные вакансии
        const vacancyResponse = await fetch(`http://localhost:5000/api/vacancies/${id}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (vacancyResponse.ok) {
          const vacancyData = await vacancyResponse.json();
          setVacancy(vacancyData);
        }

        // Загружаем отклики на вакансию
        const responsesResponse = await fetch(`http://localhost:5000/api/applications/vacancy/${id}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (responsesResponse.ok) {
          const responsesData = await responsesResponse.json();
          setResponses(responsesData.applications || []);
        }
      } catch (error) {
        console.error('Error fetching vacancy and responses:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchVacancyAndResponses();
  }, [id]);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('ru-RU');
  };

  const getStatusColor = (status) => {
    const colors = {
      'pending': 'bg-yellow-100 text-yellow-800',
      'reviewed': 'bg-blue-100 text-blue-800',
      'accepted': 'bg-green-100 text-green-800',
      'rejected': 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getStatusText = (status) => {
    const texts = {
      'pending': 'На рассмотрении',
      'reviewed': 'Рассмотрено',
      'accepted': 'Принято',
      'rejected': 'Отклонено'
    };
    return texts[status] || status;
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <Spinner size="lg" />
        </div>
      </Layout>
    );
  }

  if (!vacancy) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
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
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Заголовок */}
          <div className="mb-8">
            <div className="flex items-center space-x-4 mb-4">
              <Button
                variant="secondary"
                onClick={() => navigate('/vacancies?tab=my')}
                className="flex items-center space-x-2"
              >
                <ArrowLeftIcon className="w-4 h-4" />
                <span>Назад к моим вакансиям</span>
              </Button>
            </div>
            
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Отклики на вакансию "{vacancy.title}"
            </h1>
            <p className="text-gray-600">
              {vacancy.company} • {responses.length} откликов
            </p>
          </div>

          {/* Информация о вакансии */}
          <Card padding="lg" className="mb-6">
            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center">
                <UserIcon className="h-6 w-6 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-gray-900 mb-1">
                  {vacancy.title}
                </h3>
                <p className="text-gray-600 mb-2">{vacancy.company}</p>
                <p className="text-sm text-gray-500">
                  Создана {formatDate(vacancy.createdAt)}
                </p>
              </div>
            </div>
          </Card>

          {/* Список откликов */}
          {responses.length === 0 ? (
            <Card padding="lg">
              <div className="text-center py-12">
                <UserIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Пока нет откликов
                </h3>
                <p className="text-gray-500">
                  Отклики на эту вакансию появятся здесь, когда кандидаты подадут заявки.
                </p>
              </div>
            </Card>
          ) : (
            <div className="space-y-4">
              {responses.map((response) => (
                <Card key={response.id} padding="lg">
                  <div className="flex items-start space-x-4">
                    <Avatar 
                      fallback={response.user.name}
                      size="md"
                    />
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="text-lg font-semibold text-gray-900">
                          {response.user.name}
                        </h4>
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(response.status)}`}>
                          {getStatusText(response.status)}
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div className="flex items-center space-x-2 text-sm text-gray-600">
                          <EnvelopeIcon className="w-4 h-4" />
                          <span>{response.user.email}</span>
                        </div>
                        {response.user.phone && (
                          <div className="flex items-center space-x-2 text-sm text-gray-600">
                            <PhoneIcon className="w-4 h-4" />
                            <span>{response.user.phone}</span>
                          </div>
                        )}
                        <div className="flex items-center space-x-2 text-sm text-gray-600">
                          <CalendarIcon className="w-4 h-4" />
                          <span>Отклик от {formatDate(response.createdAt)}</span>
                        </div>
                        {response.user.position && (
                          <div className="text-sm text-gray-600">
                            <span className="font-medium">Должность:</span> {response.user.position}
                          </div>
                        )}
                      </div>

                      {response.user.company && (
                        <div className="text-sm text-gray-600 mb-3">
                          <span className="font-medium">Компания:</span> {response.user.company}
                        </div>
                      )}

                      {response.coverLetter && (
                        <div className="mb-4">
                          <h5 className="font-medium text-gray-900 mb-2">Сопроводительное письмо:</h5>
                          <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                            {response.coverLetter}
                          </p>
                        </div>
                      )}

                      <div className="flex items-center space-x-4">
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => navigate(`/profile/${response.user.id}`)}
                        >
                          Посмотреть профиль
                        </Button>
                        
                        <div className="flex space-x-2">
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => {
                              // Здесь можно добавить логику для принятия отклика
                            }}
                            className="bg-green-600 hover:bg-green-700 text-white"
                          >
                            Принять
                          </Button>
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => {
                              // Здесь можно добавить логику для отклонения отклика
                            }}
                            className="bg-red-600 hover:bg-red-700 text-white"
                          >
                            Отклонить
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default VacancyResponsesPage;
