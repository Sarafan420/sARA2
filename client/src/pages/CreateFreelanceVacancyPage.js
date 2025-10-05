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
  LightBulbIcon,
  CalendarIcon,
  CurrencyDollarIcon,
  ClockIcon,
  GlobeAltIcon,
  TagIcon,
  PlusIcon,
  XMarkIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline';
import { useNavigate } from 'react-router-dom';

const CreateFreelanceVacancyPage = () => {
  const navigate = useNavigate();
  const { success, error } = useNotification();
  
  const [formData, setFormData] = useState({
    title: '',
    category: '',
    workFormat: 'remote',
    projectType: 'one-time',
    budget: '',
    budgetType: 'fixed',
    currency: 'RUB',
    deadline: '',
    duration: '',
    description: '',
    requirements: '',
    deliverables: '',
    skills: [],
    portfolio: false,
    contactEmail: '',
    contactPhone: '',
    isUrgent: false,
    paymentTerms: 'after_completion'
  });
  
  const [currentSkill, setCurrentSkill] = useState('');
  const [loading, setLoading] = useState(false);

  // Опции
  const categories = [
    'Веб-разработка',
    'Мобильная разработка',
    'Дизайн',
    'Маркетинг',
    'Копирайтинг',
    'Переводы',
    'Видео/Аудио',
    'Фотография',
    'Консультации',
    'Другое'
  ];

  const projectTypes = [
    { value: 'one-time', label: 'Разовый проект' },
    { value: 'ongoing', label: 'Долгосрочное сотрудничество' },
    { value: 'hourly', label: 'Почасовая работа' }
  ];

  const budgetTypes = [
    { value: 'fixed', label: 'Фиксированная цена' },
    { value: 'hourly', label: 'Почасовая оплата' },
    { value: 'negotiable', label: 'По договоренности' }
  ];

  const currencies = [
    { value: 'RUB', label: '₽ Рубли' },
    { value: 'USD', label: '$ Доллары' },
    { value: 'EUR', label: '€ Евро' }
  ];

  const paymentTermsOptions = [
    { value: 'after_completion', label: 'После завершения' },
    { value: 'milestone', label: 'По этапам' },
    { value: 'weekly', label: 'Еженедельно' },
    { value: 'monthly', label: 'Ежемесячно' }
  ];

  const popularSkills = [
    'React', 'JavaScript', 'Python', 'Figma', 'Photoshop',
    'WordPress', 'SEO', 'Copywriting', 'Video Editing',
    'Illustration', 'Translation', 'Data Analysis'
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

  const handleSubmit = async (isDraft = false) => {
    setLoading(true);
    try {
      // Валидация
      if (!formData.title.trim()) {
        error('Укажите название проекта');
        return;
      }
      if (!formData.category) {
        error('Выберите категорию');
        return;
      }
      if (!formData.description.trim()) {
        error('Добавьте описание проекта');
        return;
      }

      // Подготовка данных для отправки
      const vacancyData = {
        title: formData.title,
        company: formData.category, // Используем категорию как компанию
        companyLogo: 'https://via.placeholder.com/100x100?text=Logo', // Заглушка
        description: formData.description,
        requirements: formData.requirements,
        salaryMin: formData.budget && formData.budgetType !== 'hourly' ? parseInt(formData.budget) : null,
        salaryMax: formData.budget && formData.budgetType !== 'hourly' ? parseInt(formData.budget) : null,
        location: formData.workFormat === 'remote' ? 'Удаленно' : 
                  formData.workFormat === 'hybrid' ? 'Гибрид' : 'Офис',
        type: 'Частичная занятость',
        experienceLevel: null, // Для фриланса не указываем уровень
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
        throw new Error(errorData.error || 'Ошибка при создании проекта');
      }

      const result = await response.json();
      
      if (isDraft) {
        success('Черновик сохранен');
      } else {
        success('Проект опубликован и доступен фрилансерам');
        navigate('/vacancies?tab=my');
      }
    } catch (err) {
      console.error('Error creating freelance vacancy:', err);
      error(err.message || 'Произошла ошибка при создании проекта');
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
              <LightBulbIcon className="h-5 w-5 text-purple-600" />
              <span className="text-sm font-medium text-purple-600">Подработка</span>
            </div>
            <h1 className="text-3xl font-bold text-gray-900">Создание проекта для фрилансеров</h1>
            <p className="text-gray-600 mt-1">Частичная занятость, проектная работа, фриланс</p>
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
                Информация о проекте
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <Input
                    label="Название проекта"
                    placeholder="Разработка лендинга для стартапа"
                    value={formData.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Категория
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => handleInputChange('category', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    required
                  >
                    <option value="">Выберите категорию</option>
                    {categories.map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Тип проекта
                  </label>
                  <select
                    value={formData.projectType}
                    onChange={(e) => handleInputChange('projectType', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    {projectTypes.map(type => (
                      <option key={type.value} value={type.value}>{type.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <Input
                    label="Планируемая длительность"
                    placeholder="2 недели"
                    value={formData.duration}
                    onChange={(e) => handleInputChange('duration', e.target.value)}
                  />
                </div>

                <div>
                  <Input
                    label="Крайний срок"
                    type="date"
                    value={formData.deadline}
                    onChange={(e) => handleInputChange('deadline', e.target.value)}
                  />
                </div>
              </div>

              <div className="mt-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Формат работы
                </label>
                <div className="space-y-2">
                  {[
                    { value: 'remote', label: 'Удаленно', icon: GlobeAltIcon },
                    { value: 'hybrid', label: 'Гибрид', icon: ClockIcon },
                    { value: 'office', label: 'В офисе', icon: CalendarIcon }
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
            </Card>
          </motion.div>

          {/* Бюджет */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-8"
          >
            <Card padding="lg">
              <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
                <CurrencyDollarIcon className="h-5 w-5 text-indigo-600" />
                Бюджет и оплата
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Тип оплаты
                  </label>
                  <select
                    value={formData.budgetType}
                    onChange={(e) => handleInputChange('budgetType', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    {budgetTypes.map(type => (
                      <option key={type.value} value={type.value}>{type.label}</option>
                    ))}
                  </select>
                </div>

                <Input
                  label={formData.budgetType === 'hourly' ? 'Ставка в час' : 'Бюджет'}
                  type="number"
                  placeholder={formData.budgetType === 'hourly' ? '2000' : '50000'}
                  value={formData.budget}
                  onChange={(e) => handleInputChange('budget', e.target.value)}
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

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Условия оплаты
                </label>
                <select
                  value={formData.paymentTerms}
                  onChange={(e) => handleInputChange('paymentTerms', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                >
                  {paymentTermsOptions.map(term => (
                    <option key={term.value} value={term.value}>{term.label}</option>
                  ))}
                </select>
              </div>
            </Card>
          </motion.div>

          {/* Описание и требования */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mb-8"
          >
            <Card padding="lg">
              <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
                <TagIcon className="h-5 w-5 text-indigo-600" />
                Требования и детали
              </h2>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Описание проекта
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    placeholder="Подробно опишите проект, цели, особенности и то, что ожидаете от исполнителя..."
                    rows={5}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Требования к исполнителю
                  </label>
                  <textarea
                    value={formData.requirements}
                    onChange={(e) => handleInputChange('requirements', e.target.value)}
                    placeholder="• Опыт разработки лендингов от 2 лет&#10;• Знание React/Next.js&#10;• Портфолио с похожими работами"
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Что должно быть готово
                  </label>
                  <textarea
                    value={formData.deliverables}
                    onChange={(e) => handleInputChange('deliverables', e.target.value)}
                    placeholder="• Готовый лендинг&#10;• Адаптивная верстка&#10;• Оптимизация для мобильных&#10;• Техническая документация"
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>

                {/* Навыки */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Необходимые навыки
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
                    <p className="text-sm text-gray-600 mb-2">Популярные навыки:</p>
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

                <div>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.portfolio}
                      onChange={(e) => handleInputChange('portfolio', e.target.checked)}
                      className="mr-2"
                    />
                    <span className="text-sm font-medium text-gray-700">
                      Требуется портфолио с похожими работами
                    </span>
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
                  label="Email для связи"
                  type="email"
                  placeholder="project@company.com"
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
                    Срочный проект
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
                Опубликовать проект
              </Button>
            </div>
          </div>
        </form>
      </div>
    </Layout>
  );
};

export default CreateFreelanceVacancyPage;
