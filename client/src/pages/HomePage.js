import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Layout from '../components/layout/Layout';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import Input from '../components/ui/Input';
import Avatar from '../components/ui/Avatar';
import { 
  MagnifyingGlassIcon,
  ArrowTrendingUpIcon,
  UsersIcon,
  BriefcaseIcon,
  ArrowRightIcon,
  ChartBarIcon,
  GlobeAltIcon,
  CubeIcon,
  CheckCircleIcon,
  BuildingOfficeIcon,
  CurrencyDollarIcon,
  SignalIcon,
  UserIcon
} from '@heroicons/react/24/outline';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { appStats } from '../data/mockData';

const HomePage = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');

  const stats = [
    { 
      label: 'Пользователей', 
      value: appStats.users?.toLocaleString() || '0', 
      icon: UsersIcon, 
      change: '+8%',
      color: 'indigo'
    },
    { 
      label: 'Активных вакансий', 
      value: appStats.vacancies?.toLocaleString() || '0', 
      icon: BriefcaseIcon, 
      change: '+12%',
      color: 'blue'
    },
    { 
      label: 'Сфер деятельности', 
      value: appStats.spheres?.toString() || '0', 
      icon: CubeIcon, 
      change: '+5%',
      color: 'purple'
    },
    { 
      label: 'Городов России', 
      value: appStats.geography?.toString() || '0', 
      icon: GlobeAltIcon, 
      change: '+3%',
      color: 'green'
    },
    { 
      label: 'Успешных найма', 
      value: appStats.successfulHires?.toLocaleString() || '0', 
      icon: CheckCircleIcon, 
      change: '+23%',
      color: 'emerald'
    },
    { 
      label: 'Активных компаний', 
      value: appStats.activeCompanies?.toLocaleString() || '0', 
      icon: BuildingOfficeIcon, 
      change: '+15%',
      color: 'cyan'
    },
    { 
      label: 'Средняя зарплата', 
      value: appStats.avgSalary, 
      icon: CurrencyDollarIcon, 
      change: '+18%',
      color: 'yellow'
    },
    { 
      label: 'Отклик на вакансии', 
      value: appStats.responseRate, 
      icon: SignalIcon, 
      change: '+7%',
      color: 'orange'
    }
  ];

  const trendingSkills = [
    'React', 'Python', 'JavaScript', 'TypeScript', 'Node.js', 
    'AWS', 'Docker', 'Kubernetes', 'Machine Learning', 'UI/UX Design'
  ];

  const [recentVacancies, setRecentVacancies] = useState([]);

  // Загружаем последние вакансии из API
  useEffect(() => {
    fetchRecentVacancies();
  }, []);

  const fetchRecentVacancies = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/vacancies?limit=3');
      if (response.ok) {
        const data = await response.json();
        const formattedVacancies = data.vacancies.map(vacancy => ({
          ...vacancy,
          posted: getRelativeTime(vacancy.createdAt),
          urgent: Math.random() > 0.8,
          skills: Array.isArray(vacancy.skillsRequired) ? vacancy.skillsRequired : []
        }));
        setRecentVacancies(formattedVacancies);
      }
    } catch (error) {
      console.error('Error fetching recent vacancies:', error);
    }
  };

  const getRelativeTime = (date) => {
    if (!date) return 'недавно';
    const now = new Date();
    const past = new Date(date);
    const diffInHours = (now - past) / (1000 * 60 * 60);
    
    if (diffInHours < 1) return 'недавно';
    if (diffInHours < 24) return `${Math.floor(diffInHours)} ч назад`;
    if (diffInHours < 168) return `${Math.floor(diffInHours / 24)} дн назад`;
    return `${Math.floor(diffInHours / 168)} нед назад`;
  };


  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-24 md:pb-8">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Найдите <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">идеальную работу</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Профессиональная сеть для поиска работы, талантов и деловых возможностей
          </p>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="max-w-2xl mx-auto mb-8">
            <div className="flex space-x-4">
              <Input
                placeholder="Поиск вакансий, людей..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                leftIcon={MagnifyingGlassIcon}
                size="lg"
                className="flex-1"
              />
              <Button type="submit" variant="primary" size="lg">
                Найти
              </Button>
            </div>
          </form>

          {/* Trending Skills */}
          <div className="flex flex-wrap justify-center gap-2 mb-8">
            <span className="text-sm text-gray-500 mr-2">Популярные навыки:</span>
            {trendingSkills.slice(0, 6).map((skill) => (
              <Badge 
                key={skill} 
                variant="primary" 
                className="cursor-pointer hover:scale-105 transition-transform"
                onClick={() => navigate(`/search?skill=${encodeURIComponent(skill)}`)}
              >
                {skill}
              </Badge>
            ))}
          </div>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-4 mb-12"
        >
          {stats.slice(0, 4).map((stat) => {
            const getColorClasses = (color) => {
              const colorMap = {
                indigo: 'bg-indigo-100 text-indigo-600',
                blue: 'bg-blue-100 text-blue-600',
                purple: 'bg-purple-100 text-purple-600',
                green: 'bg-green-100 text-green-600',
                emerald: 'bg-emerald-100 text-emerald-600',
                cyan: 'bg-cyan-100 text-cyan-600',
                yellow: 'bg-yellow-100 text-yellow-600',
                orange: 'bg-orange-100 text-orange-600'
              };
              return colorMap[color] || 'bg-gray-100 text-gray-600';
            };
            
            const colorClasses = getColorClasses(stat.color);
            const [bgClass, textClass] = colorClasses.split(' ');
            
            return (
              <Card 
                key={stat.label} 
                padding="sm" 
                hover 
                className="text-center"
              >
                <div className={`flex items-center justify-center w-10 h-10 ${bgClass} rounded-lg mx-auto mb-3`}>
                  <stat.icon className={`h-5 w-5 ${textClass}`} />
                </div>
                <div className="text-lg font-bold text-gray-900">{stat.value}</div>
                <div className="text-xs text-gray-600 leading-tight">{stat.label}</div>
                <div className="flex items-center justify-center mt-2">
                  <ArrowTrendingUpIcon className="h-3 w-3 text-green-500 mr-1" />
                  <span className="text-xs text-green-500 font-medium">{stat.change}</span>
                </div>
              </Card>
            );
          })}
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Recent Vacancies */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-2"
          >
            <Card padding="lg">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">Новые вакансии</h2>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  icon={ArrowRightIcon}
                  iconPosition="right"
                  onClick={() => navigate('/vacancies')}
                >
                  Все вакансии
                </Button>
              </div>
              
              <div className="space-y-4">
                {recentVacancies.map((vacancy) => (
                  <motion.div
                    key={vacancy.id}
                    whileHover={{ scale: 1.02 }}
                    className="relative p-4 border border-gray-200 rounded-lg hover:border-indigo-300 hover:shadow-md transition-all cursor-pointer overflow-hidden"
                    onClick={() => navigate(`/vacancies/${vacancy.id}`)}
                  >
                    {/* Большое изображение компании в левом верхнем углу */}
                    <div className="absolute top-0 left-0 w-16 h-16 overflow-hidden rounded-br-xl">
                      <img
                        src={vacancy.companyLogo}
                        alt={vacancy.company}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-br from-black/20 to-transparent"></div>
                    </div>

                    <div className="flex items-start justify-between mb-2 pl-20">
                      <div className="flex items-start space-x-3 flex-1">
                        <div>
                          <div className="flex items-center space-x-2">
                            <h3 className="font-semibold text-gray-900">{vacancy.title}</h3>
                            {vacancy.urgent && (
                              <Badge variant="danger" size="sm">Срочно</Badge>
                            )}
                          </div>
                          <p className="text-gray-600">{vacancy.company} • {vacancy.location}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold text-gray-900">
                          {vacancy.salaryMin && vacancy.salaryMax 
                            ? `${vacancy.salaryMin.toLocaleString()}-${vacancy.salaryMax.toLocaleString()} ₽`
                            : vacancy.salaryMin 
                              ? `от ${vacancy.salaryMin.toLocaleString()} ₽`
                              : 'По договоренности'
                          }
                        </div>
                        <div className="text-sm text-gray-500">{vacancy.type}</div>
                      </div>
                    </div>
                    
                    {/* Рекрутер */}
                    {vacancy.user && (
                      <div className="pl-20 mb-2">
                        <div className="flex items-center space-x-2 text-sm text-gray-600">
                          <span className="text-gray-500">Рекрутер:</span>
                          <div 
                            className="cursor-pointer hover:opacity-80 transition-opacity"
                            onClick={() => navigate(`/profile/${vacancy.user.id}`)}
                          >
                            <Avatar 
                              fallback={vacancy.user.name}
                              size="xs" 
                            />
                          </div>
                          <span 
                            className="font-medium cursor-pointer hover:text-indigo-600 transition-colors"
                            onClick={() => navigate(`/profile/${vacancy.user.id}`)}
                          >
                            {vacancy.user.name}
                          </span>
                          {vacancy.user.company && (
                            <span className="text-gray-500">• {vacancy.user.company}</span>
                          )}
                        </div>
                      </div>
                    )}
                    
                    <div className="flex items-center justify-between pl-20">
                      <div className="flex space-x-2">
                        {vacancy.skills.map((skill) => (
                          <Badge key={skill} variant="blue" size="sm">{skill}</Badge>
                        ))}
                      </div>
                      <span className="text-sm text-gray-500">{vacancy.posted}</span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </Card>
          </motion.div>

          {/* Sidebar */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="space-y-6"
          >

            {/* Quick Actions */}
            <Card padding="lg">
              <h3 className="font-semibold text-gray-900 mb-4">Быстрые действия</h3>
              <div className="space-y-3">
                {isAuthenticated && user ? (
                  <>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full justify-start"
                      icon={BriefcaseIcon}
                      onClick={() => navigate('/vacancies/create')}
                    >
                      Создать вакансию
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full justify-start"
                      icon={UsersIcon}
                      onClick={() => navigate('/people')}
                    >
                      Найти людей
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full justify-start"
                      icon={ChartBarIcon}
                      onClick={() => navigate('/analytics')}
                    >
                      Аналитика
                    </Button>
                  </>
                ) : (
                  <>
                    <Button 
                      variant="primary" 
                      size="sm" 
                      className="w-full justify-start"
                      icon={UserIcon}
                      onClick={() => navigate('/login')}
                    >
                      Войти в аккаунт
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full justify-start"
                      icon={UserIcon}
                      onClick={() => navigate('/register')}
                    >
                      Зарегистрироваться
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full justify-start"
                      icon={UsersIcon}
                      onClick={() => navigate('/people')}
                    >
                      Найти людей
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full justify-start"
                      icon={BriefcaseIcon}
                      onClick={() => navigate('/vacancies')}
                    >
                      Просмотреть вакансии
                    </Button>
                  </>
                )}
              </div>
            </Card>
          </motion.div>
        </div>
      </div>
    </Layout>
  );
};

export default HomePage;
