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
  AcademicCapIcon,
  CurrencyDollarIcon,
  UserGroupIcon,
  PlusIcon,
  XMarkIcon,
  DocumentTextIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';
import { useNavigate } from 'react-router-dom';

const CreateInternshipPage = () => {
  const navigate = useNavigate();
  const { success, error } = useNotification();
  
  const [formData, setFormData] = useState({
    title: '',
    department: '',
    duration: '',
    startDate: '',
    endDate: '',
    stipend: '',
    currency: 'RUB',
    isPaid: true,
    description: '',
    responsibilities: '',
    requirements: '',
    learningGoals: '',
    mentorship: true,
    certification: true,
    skills: [],
    targetAudience: 'students',
    experienceLevel: 'no-experience',
    workFormat: 'hybrid',
    scheduleType: 'flexible',
    hoursPerWeek: '',
    benefits: [],
    contactEmail: '',
    applicationDeadline: '',
    maxParticipants: '',
    isUrgent: false
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
    'Аналитика',
    'Юриспруденция',
    'PR и коммуникации'
  ];

  const durations = [
    { value: '1-month', label: '1 месяц' },
    { value: '2-months', label: '2 месяца' },
    { value: '3-months', label: '3 месяца' },
    { value: '6-months', label: '6 месяцев' },
    { value: 'custom', label: 'Другое' }
  ];

  const targetAudiences = [
    { value: 'students', label: 'Студенты' },
    { value: 'graduates', label: 'Выпускники' },
    { value: 'career-change', label: 'Смена карьеры' },
    { value: 'any', label: 'Любой уровень' }
  ];

  const experienceLevels = [
    { value: 'no-experience', label: 'Без опыта' },
    { value: 'basic', label: 'Базовые знания' },
    { value: 'some-experience', label: 'Небольшой опыт' }
  ];

  const workFormats = [
    { value: 'office', label: 'В офисе' },
    { value: 'remote', label: 'Удаленно' },
    { value: 'hybrid', label: 'Гибрид' }
  ];

  const scheduleTypes = [
    { value: 'flexible', label: 'Гибкий график' },
    { value: 'fixed', label: 'Фиксированные часы' },
    { value: 'part-time', label: 'Неполный день' },
    { value: 'full-time', label: 'Полный день' }
  ];

  const currencies = [
    { value: 'RUB', label: '₽ Рубли' },
    { value: 'USD', label: '$ Доллары' },
    { value: 'EUR', label: '€ Евро' }
  ];

  const availableBenefits = [
    'Ментор',
    'Сертификат по итогам',
    'Возможность трудоустройства',
    'Опыт в резюме',
    'Обучающие материалы',
    'Участие в проектах',
    'Нетворкинг',
    'Обеды',
    'Корпоративные мероприятия',
    'Оборудование для работы'
  ];

  const popularSkills = [
    'Python', 'JavaScript', 'React', 'Figma', 'Excel',
    'SQL', 'HTML/CSS', 'Marketing', 'Analytics', 'Photoshop',
    'Communication', 'Teamwork', 'Research', 'Writing'
  ];

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
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

  const addPopularSkill = (skill) => {
    if (!formData.skills.includes(skill)) {
      setFormData(prev => ({
        ...prev,
        skills: [...prev.skills, skill]
      }));
    }
  };

  const toggleBenefit = (benefit) => {
    setFormData(prev => ({
      ...prev,
      benefits: prev.benefits.includes(benefit)
        ? prev.benefits.filter(b => b !== benefit)
        : [...prev.benefits, benefit]
    }));
  };

  const handleSubmit = async (isDraft = false) => {
    setLoading(true);
    try {
      // Валидация
      if (!formData.title.trim()) {
        error('Укажите название стажировки');
        return;
      }
      if (!formData.department) {
        error('Выберите отдел');
        return;
      }
      if (!formData.duration) {
        error('Укажите длительность');
        return;
      }

      // Подготовка данных для отправки
      const vacancyData = {
        title: formData.title,
        company: formData.department, // Используем отдел как компанию
        companyLogo: 'https://via.placeholder.com/100x100?text=Logo', // Заглушка
        description: formData.description,
        requirements: formData.requirements,
        salaryMin: null, // Стажировки обычно неоплачиваемые
        salaryMax: null,
        location: formData.location,
        type: 'Стажировка',
        experienceLevel: 'Junior', // Стажировки для новичков
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
        throw new Error(errorData.error || 'Ошибка при создании стажировки');
      }

      const result = await response.json();
      
      if (isDraft) {
        success('Черновик сохранен');
      } else {
        success('Стажировка опубликована и доступна для заявок');
        navigate('/vacancies?tab=my');
      }
    } catch (err) {
      console.error('Error creating internship:', err);
      error(err.message || 'Произошла ошибка при создании стажировки');
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
              <AcademicCapIcon className="h-5 w-5 text-orange-600" />
              <span className="text-sm font-medium text-orange-600">Стажировка</span>
            </div>
            <h1 className="text-3xl font-bold text-gray-900">Создание стажировочной программы</h1>
            <p className="text-gray-600 mt-1">Обучающая программа для студентов и выпускников</p>
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
                <DocumentTextIcon className="h-5 w-5 text-indigo-600" />
                Основная информация
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <Input
                    label="Название стажировки"
                    placeholder="Стажировка Frontend разработчика"
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
                    Длительность
                  </label>
                  <select
                    value={formData.duration}
                    onChange={(e) => handleInputChange('duration', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    required
                  >
                    <option value="">Выберите длительность</option>
                    {durations.map(duration => (
                      <option key={duration.value} value={duration.value}>{duration.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <Input
                    label="Дата начала"
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => handleInputChange('startDate', e.target.value)}
                  />
                </div>

                <div>
                  <Input
                    label="Дата окончания"
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => handleInputChange('endDate', e.target.value)}
                  />
                </div>

                <div>
                  <Input
                    label="Максимум участников"
                    type="number"
                    placeholder="5"
                    value={formData.maxParticipants}
                    onChange={(e) => handleInputChange('maxParticipants', e.target.value)}
                  />
                </div>

                <div>
                  <Input
                    label="Срок подачи заявок"
                    type="date"
                    value={formData.applicationDeadline}
                    onChange={(e) => handleInputChange('applicationDeadline', e.target.value)}
                  />
                </div>
              </div>
            </Card>
          </motion.div>

          {/* Условия и компенсация */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-8"
          >
            <Card padding="lg">
              <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
                <CurrencyDollarIcon className="h-5 w-5 text-indigo-600" />
                Условия и компенсация
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Формат работы
                  </label>
                  <select
                    value={formData.workFormat}
                    onChange={(e) => handleInputChange('workFormat', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    {workFormats.map(format => (
                      <option key={format.value} value={format.value}>{format.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    График работы
                  </label>
                  <select
                    value={formData.scheduleType}
                    onChange={(e) => handleInputChange('scheduleType', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    {scheduleTypes.map(schedule => (
                      <option key={schedule.value} value={schedule.value}>{schedule.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <Input
                    label="Часов в неделю"
                    type="number"
                    placeholder="20"
                    value={formData.hoursPerWeek}
                    onChange={(e) => handleInputChange('hoursPerWeek', e.target.value)}
                  />
                </div>
              </div>

              {/* Оплата */}
              <div className="mb-6">
                <div className="flex items-center gap-4 mb-4">
                  <h3 className="text-lg font-medium text-gray-900">Компенсация</h3>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.isPaid}
                      onChange={(e) => handleInputChange('isPaid', e.target.checked)}
                      className="mr-2"
                    />
                    Оплачиваемая стажировка
                  </label>
                </div>

                {formData.isPaid && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                      label="Стипендия"
                      type="number"
                      placeholder="25000"
                      value={formData.stipend}
                      onChange={(e) => handleInputChange('stipend', e.target.value)}
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
                )}
              </div>

              {/* Что получит стажер */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Что получит стажер</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {availableBenefits.map(benefit => (
                    <label
                      key={benefit}
                      className={`flex items-center p-3 border rounded-lg cursor-pointer transition-colors ${
                        formData.benefits.includes(benefit)
                          ? 'border-indigo-500 bg-indigo-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={formData.benefits.includes(benefit)}
                        onChange={() => toggleBenefit(benefit)}
                        className="sr-only"
                      />
                      <div className={`w-4 h-4 border rounded mr-3 flex items-center justify-center ${
                        formData.benefits.includes(benefit)
                          ? 'border-indigo-500 bg-indigo-500'
                          : 'border-gray-300'
                      }`}>
                        {formData.benefits.includes(benefit) && (
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

          {/* Требования к кандидатам */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mb-8"
          >
            <Card padding="lg">
              <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
                <UserGroupIcon className="h-5 w-5 text-indigo-600" />
                Требования к кандидатам
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Целевая аудитория
                  </label>
                  <select
                    value={formData.targetAudience}
                    onChange={(e) => handleInputChange('targetAudience', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    {targetAudiences.map(audience => (
                      <option key={audience.value} value={audience.value}>{audience.label}</option>
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
                    {experienceLevels.map(level => (
                      <option key={level.value} value={level.value}>{level.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Описание программы
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    placeholder="Опишите программу стажировки, цели, особенности и преимущества..."
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Требования к кандидатам
                  </label>
                  <textarea
                    value={formData.requirements}
                    onChange={(e) => handleInputChange('requirements', e.target.value)}
                    placeholder="• Студент 3-4 курса или выпускник&#10;• Базовые знания программирования&#10;• Мотивация к обучению"
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Задачи стажера
                  </label>
                  <textarea
                    value={formData.responsibilities}
                    onChange={(e) => handleInputChange('responsibilities', e.target.value)}
                    placeholder="• Участие в разработке продукта&#10;• Изучение технологий под руководством ментора&#10;• Написание кода и тестов"
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Цели обучения
                  </label>
                  <textarea
                    value={formData.learningGoals}
                    onChange={(e) => handleInputChange('learningGoals', e.target.value)}
                    placeholder="• Освоить React и современные инструменты разработки&#10;• Получить опыт работы в команде&#10;• Изучить процессы разработки"
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>

                {/* Навыки */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Желательные навыки
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
                    <div className="flex flex-wrap gap-2 mb-4">
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

                  <div>
                    <p className="text-sm text-gray-600 mb-2">Популярные навыки для стажеров:</p>
                    <div className="flex flex-wrap gap-2">
                      {popularSkills.map(skill => (
                        <button
                          key={skill}
                          type="button"
                          onClick={() => addPopularSkill(skill)}
                          disabled={formData.skills.includes(skill)}
                          className={`px-3 py-1 text-sm rounded-lg border transition-colors ${
                            formData.skills.includes(skill)
                              ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
                              : 'bg-white text-gray-700 border-gray-300 hover:border-indigo-500 hover:text-indigo-600'
                          }`}
                        >
                          {skill}
                        </button>
                      ))}
                    </div>
                  </div>
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
                  label="Email для заявок"
                  type="email"
                  placeholder="internship@company.com"
                  value={formData.contactEmail}
                  onChange={(e) => handleInputChange('contactEmail', e.target.value)}
                  required
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
                    Срочный набор
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
                Опубликовать стажировку
              </Button>
            </div>
          </div>
        </form>
      </div>
    </Layout>
  );
};

export default CreateInternshipPage;
