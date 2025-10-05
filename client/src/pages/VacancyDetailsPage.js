import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
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
  CheckIcon
} from '@heroicons/react/24/outline';

const VacancyDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [vacancy, setVacancy] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchVacancy();
  }, [id]);

  const fetchVacancy = async () => {
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
  };

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
            <Card padding="lg">
              <div className="flex items-start space-x-4 mb-6">
                <img
                  src={vacancy.companyLogo}
                  alt={vacancy.company}
                  className="w-16 h-16 rounded-xl object-cover shadow-md"
                />
                <div className="flex-1">
                  <h1 className="text-2xl font-bold text-gray-900 mb-2">{vacancy.title}</h1>
                  <p className="text-lg text-gray-600 mb-2">{vacancy.company}</p>
                  
                  <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                    <div className="flex items-center space-x-1">
                      <MapPinIcon className="h-4 w-4" />
                      <span>{vacancy.location}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <CurrencyDollarIcon className="h-4 w-4" />
                      <span>
                        {vacancy.salaryMin && vacancy.salaryMax 
                          ? `${vacancy.salaryMin.toLocaleString()}-${vacancy.salaryMax.toLocaleString()} ₽`
                          : vacancy.salaryMin 
                            ? `от ${vacancy.salaryMin.toLocaleString()} ₽`
                            : 'По договоренности'
                        }
                      </span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <ClockIcon className="h-4 w-4" />
                      <span>{new Date(vacancy.createdAt).toLocaleDateString('ru-RU')}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex space-x-4">
                <Button variant="primary" className="flex-1">
                  Откликнуться
                </Button>
                <Button variant="outline">
                  Сохранить
                </Button>
                <Button variant="outline">
                  Поделиться
                </Button>
              </div>
            </Card>

            <Card padding="lg">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Описание</h2>
              <p className="text-gray-700 mb-6">{vacancy.description}</p>
              
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Требования</h3>
              <ul className="space-y-2 mb-6">
                {vacancy.skillsRequired && vacancy.skillsRequired.map((skill, index) => (
                  <li key={index} className="flex items-center text-gray-700">
                    <CheckIcon className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                    {skill}
                  </li>
                ))}
              </ul>
            </Card>
          </div>

          <div className="space-y-6">
            <Card padding="lg">
              <h3 className="font-semibold text-gray-900 mb-4">О компании</h3>
              <p className="text-gray-700 text-sm">
                Ведущая технологическая компания, специализирующаяся на разработке 
                инновационных решений для бизнеса.
              </p>
              <Button variant="outline" size="sm" className="w-full mt-4">
                Посмотреть все вакансии
              </Button>
            </Card>

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
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default VacancyDetailsPage;