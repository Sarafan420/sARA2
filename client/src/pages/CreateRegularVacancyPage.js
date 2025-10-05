import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Layout from '../components/layout/Layout';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Badge from '../components/ui/Badge';
import { useNotification } from '../contexts/NotificationContext';
import { 
  ArrowLeftIcon,
  BriefcaseIcon,
  CurrencyDollarIcon,
  ClockIcon,
  GlobeAltIcon,
  BuildingOfficeIcon,
  TagIcon,
  PlusIcon,
  XMarkIcon,
  CheckCircleIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';
import { useNavigate } from 'react-router-dom';

const CreateRegularVacancyPage = () => {
  const navigate = useNavigate();
  const { success, error } = useNotification();
  
  const [formData, setFormData] = useState({
    title: '',
    department: '',
    location: '',
    workFormat: 'office',
    experienceLevel: '',
    employmentType: 'full-time',
    salaryFrom: '',
    salaryTo: '',
    currency: 'RUB',
    showSalary: true,
    description: '',
    requirements: '',
    responsibilities: '',
    benefits: '',
    skills: [],
    companyBenefits: [],
    contactEmail: '',
    contactPhone: '',
    isUrgent: false,
    specialists: {
      psychologist: false,
      tarot: false,
      numerology: false,
      astrology: false
    }
  });
  
  const [currentSkill, setCurrentSkill] = useState('');
  const [loading, setLoading] = useState(false);

  // Опции
  const departments = [
    'IT и разработка',
    'Продукт и дизайн', 
    'Маркетинг и реклама',
    'Продажи',
    'HR и рекрутинг',
    'Финансы',
    'Операции',
    'Аналитика'
  ];

  const locations = [
    'Москва',
    'Санкт-Петербург', 
    'Екатеринбург',
    'Новосибирск',
    'Казань',
    'Нижний Новгород',
    'Удаленно',
    'Гибрид'
  ];

  const experienceLevels = [
    { value: 'junior', label: 'Junior (1-3 года)' },
    { value: 'middle', label: 'Middle (3-6 лет)' },
    { value: 'senior', label: 'Senior (6+ лет)' },
    { value: 'lead', label: 'Team Lead' },
    { value: 'head', label: 'Head/Director' }
  ];


  const currencies = [
    { value: 'RUB', label: '₽ Рубли' },
    { value: 'USD', label: '$ Доллары' },
    { value: 'EUR', label: '€ Евро' }
  ];

  const availableBenefits = [
    'ДМС',
    'Спортзал',
    'Обеды',
    'Корпоративное обучение',
    'Гибкий график',
    'Удаленная работа',
    'Отпуск 28 дней',
    'Переезд в другой город',
    'Корпоративные мероприятия',
    'Оплата конференций'
  ];

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSpecialistChange = (specialist, checked) => {
    setFormData(prev => ({
      ...prev,
      specialists: {
        ...prev.specialists,
        [specialist]: checked
      }
    }));
  };

  const addSkill = () => {
    if (currentSkill.trim() && !formData.skills.includes(currentSkill.trim())) {
      setFormData(prev => ({
        ...prev,
        skills: [...prev.skills, currentSkill.trim()]
      }));
      setCurrentSkill('');
    }
  };

  const removeSkill = (skillToRemove) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.filter(skill => skill !== skillToRemove)
    }));
  };

  const toggleBenefit = (benefit) => {
    setFormData(prev => ({
      ...prev,
      companyBenefits: prev.companyBenefits.includes(benefit)
        ? prev.companyBenefits.filter(b => b !== benefit)
        : [...prev.companyBenefits, benefit]
    }));
  };

  const handleSubmit = async (isDraft = false) => {
    setLoading(true);
    try {
      // Валидация
      if (!formData.title.trim()) {
        error('Укажите название вакансии');
        return;
      }
      if (!formData.department) {
        error('Выберите отдел');
        return;
      }
      if (!formData.location) {
        error('Укажите местоположение');
        return;
      }

      // Подготовка данных для отправки
      const vacancyData = {
        title: formData.title,
        company: formData.department, // Используем отдел как компанию
        companyLogo: 'https://via.placeholder.com/100x100?text=Logo', // Заглушка
        description: formData.description,
        requirements: formData.requirements,
        salaryMin: formData.salaryFrom ? parseInt(formData.salaryFrom) : null,
        salaryMax: formData.salaryTo ? parseInt(formData.salaryTo) : null,
        location: formData.location,
        type: formData.workFormat === 'office' ? 'Полный день' : 
              formData.workFormat === 'remote' ? 'Удаленно' : 'Частичная занятость',
        experienceLevel: formData.experienceLevel ? 
          (formData.experienceLevel.charAt(0).toUpperCase() + formData.experienceLevel.slice(1)) : null,
        skillsRequired: formData.skills
      };

      // Отправка данных на сервер
      const token = localStorage.getItem('authToken');
      const response = await fetch('http://localhost:5000/api/vacancies', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(vacancyData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Ошибка при создании вакансии');
      }

      const result = await response.json();
      
      if (isDraft) {
        success('Черновик сохранен');
      } else {
        success('Вакансия успешно создана и отправлена на модерацию');
        navigate('/vacancies?tab=my');
      }
    } catch (err) {
      console.error('Error creating vacancy:', err);
      error(err.message || 'Произошла ошибка при создании вакансии');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-24 md:pb-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-4 mb-8"
        >
          <Button
            variant="ghost"
            size="sm"
            icon={ArrowLeftIcon}
            onClick={() => navigate('/vacancies/create')}
          >
            Назад к выбору типа
          </Button>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <BriefcaseIcon className="h-5 w-5 text-blue-600" />
              <span className="text-sm font-medium text-blue-600">Обычная вакансия</span>
            </div>
            <h1 className="text-3xl font-bold text-gray-900">Создание постоянной вакансии</h1>
            <p className="text-gray-600 mt-1">Полная занятость с официальным трудоустройством</p>
          </div>
        </motion.div>

        <form onSubmit={(e) => e.preventDefault()}>
          {/* Основная информация */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-8"
          >
            <Card padding="lg">
              <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
                <BriefcaseIcon className="h-5 w-5 text-indigo-600" />
                Основная информация
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <Input
                    label="Название должности"
                    placeholder="Senior Frontend Developer"
                    value={formData.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Отдел
                  </label>
                  <select
                    value={formData.department}
                    onChange={(e) => handleInputChange('department', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    required
                  >
                    <option value="">Выберите отдел</option>
                    {departments.map(dept => (
                      <option key={dept} value={dept}>{dept}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Местоположение
                  </label>
                  <select
                    value={formData.location}
                    onChange={(e) => handleInputChange('location', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    required
                  >
                    <option value="">Выберите город</option>
                    {locations.map(location => (
                      <option key={location} value={location}>{location}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Уровень опыта
                  </label>
                  <select
                    value={formData.experienceLevel}
                    onChange={(e) => handleInputChange('experienceLevel', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option value="">Выберите уровень</option>
                    {experienceLevels.map(level => (
                      <option key={level.value} value={level.value}>{level.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Формат работы
                  </label>
                  <div className="space-y-2">
                    {[
                      { value: 'office', label: 'Офис', icon: BuildingOfficeIcon },
                      { value: 'remote', label: 'Удаленно', icon: GlobeAltIcon },
                      { value: 'hybrid', label: 'Гибрид', icon: ClockIcon }
                    ].map(format => (
                      <label key={format.value} className="flex items-center">
                        <input
                          type="radio"
                          name="workFormat"
                          value={format.value}
                          checked={formData.workFormat === format.value}
                          onChange={(e) => handleInputChange('workFormat', e.target.value)}
                          className="mr-2"
                        />
                        <format.icon className="h-4 w-4 text-gray-500 mr-2" />
                        {format.label}
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>

          {/* Зарплата и условия */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-8"
          >
            <Card padding="lg">
              <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
                <CurrencyDollarIcon className="h-5 w-5 text-indigo-600" />
                Зарплата и условия
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <Input
                  label="Зарплата от"
                  type="number"
                  placeholder="150000"
                  value={formData.salaryFrom}
                  onChange={(e) => handleInputChange('salaryFrom', e.target.value)}
                />
                <Input
                  label="Зарплата до"
                  type="number"
                  placeholder="250000"
                  value={formData.salaryTo}
                  onChange={(e) => handleInputChange('salaryTo', e.target.value)}
                />
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Валюта
                  </label>
                  <select
                    value={formData.currency}
                    onChange={(e) => handleInputChange('currency', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    {currencies.map(currency => (
                      <option key={currency.value} value={currency.value}>{currency.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Бенефиты */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Что мы предлагаем</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {availableBenefits.map(benefit => (
                    <label
                      key={benefit}
                      className={`flex items-center p-3 border rounded-lg cursor-pointer transition-colors ${
                        formData.companyBenefits.includes(benefit)
                          ? 'border-indigo-500 bg-indigo-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={formData.companyBenefits.includes(benefit)}
                        onChange={() => toggleBenefit(benefit)}
                        className="sr-only"
                      />
                      <div className={`w-4 h-4 border rounded mr-3 flex items-center justify-center ${
                        formData.companyBenefits.includes(benefit)
                          ? 'border-indigo-500 bg-indigo-500'
                          : 'border-gray-300'
                      }`}>
                        {formData.companyBenefits.includes(benefit) && (
                          <CheckCircleIcon className="h-3 w-3 text-white" />
                        )}
                      </div>
                      <span className="text-sm font-medium text-gray-700">{benefit}</span>
                    </label>
                  ))}
                </div>
              </div>
            </Card>
          </motion.div>

          {/* Требования и навыки */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mb-8"
          >
            <Card padding="lg">
              <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
                <TagIcon className="h-5 w-5 text-indigo-600" />
                Требования и навыки
              </h2>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Описание вакансии
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    placeholder="Мы ищем опытного разработчика для работы над продуктами следующего поколения..."
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Требования
                  </label>
                  <textarea
                    value={formData.requirements}
                    onChange={(e) => handleInputChange('requirements', e.target.value)}
                    placeholder="• Опыт работы с React от 3 лет&#10;• Знание TypeScript&#10;• Опыт работы с REST API"
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Обязанности
                  </label>
                  <textarea
                    value={formData.responsibilities}
                    onChange={(e) => handleInputChange('responsibilities', e.target.value)}
                    placeholder="• Разработка пользовательских интерфейсов&#10;• Оптимизация производительности&#10;• Участие в планировании"
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>

                {/* Навыки */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ключевые навыки
                  </label>
                  <div className="flex gap-2 mb-4">
                    <Input
                      placeholder="Добавить навык"
                      value={currentSkill}
                      onChange={(e) => setCurrentSkill(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && addSkill()}
                      className="flex-1"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      icon={PlusIcon}
                      onClick={addSkill}
                    >
                      Добавить
                    </Button>
                  </div>

                  {formData.skills.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {formData.skills.map(skill => (
                        <Badge
                          key={skill}
                          variant="primary"
                          className="flex items-center gap-1"
                        >
                          {skill}
                          <button
                            type="button"
                            onClick={() => removeSkill(skill)}
                            className="ml-1 hover:text-red-600"
                          >
                            <XMarkIcon className="h-3 w-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </Card>
          </motion.div>

          {/* Специалисты */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            className="mb-8"
          >
            <Card padding="lg">
              <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
                <SparklesIcon className="h-5 w-5 text-purple-600" />
                Специалисты
              </h2>
              
              <div className="space-y-4">
                <p className="text-sm text-gray-600 mb-4">
                  Отметьте, если в вашей компании есть штатные специалисты:
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <label className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.specialists.psychologist}
                      onChange={(e) => handleSpecialistChange('psychologist', e.target.checked)}
                      className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                    />
                    <div>
                      <span className="text-sm font-medium text-gray-900">Психолог</span>
                      <p className="text-xs text-gray-500">Штатный психолог для консультаций</p>
                    </div>
                  </label>

                  <label className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.specialists.tarot}
                      onChange={(e) => handleSpecialistChange('tarot', e.target.checked)}
                      className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                    />
                    <div>
                      <span className="text-sm font-medium text-gray-900">Таролог</span>
                      <p className="text-xs text-gray-500">Специалист по картам Таро</p>
                    </div>
                  </label>

                  <label className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.specialists.numerology}
                      onChange={(e) => handleSpecialistChange('numerology', e.target.checked)}
                      className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                    />
                    <div>
                      <span className="text-sm font-medium text-gray-900">Нумеролог</span>
                      <p className="text-xs text-gray-500">Специалист по нумерологии</p>
                    </div>
                  </label>

                  <label className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.specialists.astrology}
                      onChange={(e) => handleSpecialistChange('astrology', e.target.checked)}
                      className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                    />
                    <div>
                      <span className="text-sm font-medium text-gray-900">Астролог</span>
                      <p className="text-xs text-gray-500">Специалист по астрологии</p>
                    </div>
                  </label>
                </div>
              </div>
            </Card>
          </motion.div>

          {/* Контактная информация */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mb-8"
          >
            <Card padding="lg">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Контактная информация</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <Input
                  label="Email для откликов"
                  type="email"
                  placeholder="hr@company.com"
                  value={formData.contactEmail}
                  onChange={(e) => handleInputChange('contactEmail', e.target.value)}
                  required
                />
                <Input
                  label="Телефон (необязательно)"
                  type="tel"
                  placeholder="+7 (999) 123-45-67"
                  value={formData.contactPhone}
                  onChange={(e) => handleInputChange('contactPhone', e.target.value)}
                />
              </div>

              <div>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.isUrgent}
                    onChange={(e) => handleInputChange('isUrgent', e.target.checked)}
                    className="mr-2"
                  />
                  <span className="text-sm font-medium text-gray-700">
                    Срочная вакансия
                  </span>
                </label>
              </div>
            </Card>
          </motion.div>

          {/* Кнопки действий */}
          <div className="flex justify-between">
            <Button
              variant="ghost"
              onClick={() => navigate('/vacancies/create')}
            >
              Отменить
            </Button>

            <div className="flex gap-4">
              <Button
                variant="outline"
                onClick={() => handleSubmit(true)}
                loading={loading}
              >
                Сохранить как черновик
              </Button>
              <Button
                variant="primary"
                onClick={() => handleSubmit(false)}
                loading={loading}
              >
                Опубликовать вакансию
              </Button>
            </div>
          </div>
        </form>
      </div>
    </Layout>
  );
};

export default CreateRegularVacancyPage;
