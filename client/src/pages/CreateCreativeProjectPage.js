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
  SparklesIcon,
  UserGroupIcon,
  PaintBrushIcon,
  CalendarIcon,
  DocumentTextIcon,
  PlusIcon,
  XMarkIcon,
  PhotoIcon,
  CloudArrowUpIcon,
  StarIcon,
  RocketLaunchIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';
import { useNavigate } from 'react-router-dom';

const CreateCreativeProjectPage = () => {
  const navigate = useNavigate();
  const { success, error } = useNotification();
  
  const [formData, setFormData] = useState({
    title: '',
    category: '',
    openForCollaboration: true,
    description: '',
    experienceLevel: 'beginner',
    timeframe: '1-2-weeks',
    skills: [],
    budget: '',
    currency: 'RUB',
    workFormat: 'remote',
    deadline: '',
    deliverables: {
      portfolio: true,
      networking: true,
      longTermCollaboration: false,
      recommendation: false
    },
    files: [],
    contactEmail: '',
    isDraft: false
  });
  
  const [currentSkill, setCurrentSkill] = useState('');
  const [dragActive, setDragActive] = useState(false);
  const [loading, setLoading] = useState(false);

  // Опции
  const categories = [
    'Дизайн',
    'Фотография',
    'Видеопроизводство',
    'Иллюстрация',
    'Анимация',
    'UI/UX',
    'Брендинг',
    'Копирайтинг',
    'Музыка',
    'Архитектура',
    'Другое'
  ];

  const experienceLevels = [
    { value: 'beginner', label: 'Начинающий' },
    { value: 'intermediate', label: 'Средний' },
    { value: 'expert', label: 'Эксперт' }
  ];

  const timeframes = [
    { value: '1-2-weeks', label: '1-2 недели' },
    { value: '1-month', label: '1 месяц' },
    { value: '2-3-months', label: '2-3 месяца' },
    { value: 'ongoing', label: 'Долгосрочно' }
  ];

  const currencies = [
    { value: 'RUB', label: '₽ за проект' },
    { value: 'USD', label: '$ за проект' },
    { value: 'EUR', label: '€ за проект' }
  ];

  const workFormats = [
    { value: 'remote', label: 'Удаленно' },
    { value: 'office', label: 'Офис' },
    { value: 'hybrid', label: 'Гибридный' }
  ];

  const popularSkills = [
    'Photoshop', 'Illustrator', 'Figma', 'After Effects', 'Cinema 4D',
    'Sketch', 'InDesign', 'Premiere Pro', 'Blender', 'Maya',
    'Procreate', 'Photography', 'Video Editing', 'Motion Graphics'
  ];

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleDeliverableChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      deliverables: {
        ...prev.deliverables,
        [field]: value
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

  const addPopularSkill = (skill) => {
    if (!formData.skills.includes(skill)) {
      setFormData(prev => ({
        ...prev,
        skills: [...prev.skills, skill]
      }));
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleFileSelect = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFiles(e.target.files);
    }
  };

  const handleFiles = (files) => {
    const fileArray = Array.from(files);
    setFormData(prev => ({
      ...prev,
      files: [...prev.files, ...fileArray.slice(0, 10 - prev.files.length)]
    }));
  };

  const removeFile = (index) => {
    setFormData(prev => ({
      ...prev,
      files: prev.files.filter((_, i) => i !== index)
    }));
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
        salaryMin: formData.budget ? parseInt(formData.budget) : null,
        salaryMax: formData.budget ? parseInt(formData.budget) : null,
        location: formData.location,
        type: 'Творческий проект',
        experienceLevel: null, // Для творческих проектов не указываем уровень
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
        success('Творческий проект опубликован!');
        navigate('/vacancies?tab=my');
      }
    } catch (err) {
      console.error('Error creating creative project:', err);
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
              <SparklesIcon className="h-5 w-5 text-pink-600" />
              <span className="text-sm font-medium text-pink-600">Творческий проект</span>
            </div>
            <h1 className="text-3xl font-bold text-gray-900">Создание творческого проекта</h1>
            <p className="text-gray-600 mt-1">Опишите ваш проект для привлечения талантливых креаторов</p>
          </div>
        </motion.div>

        <form onSubmit={(e) => e.preventDefault()}>
          {/* Основы проекта */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-8"
          >
            <Card padding="lg">
              <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
                <DocumentTextIcon className="h-5 w-5 text-indigo-600" />
                Основы проекта
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <Input
                    label="Название проекта"
                    placeholder="Креативная кампания для стартапа"
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

                <div className="flex items-center">
                  <div className="flex items-center gap-3">
                    <UserGroupIcon className="h-5 w-5 text-pink-600" />
                    <div>
                      <h3 className="font-medium text-gray-900">Открыт для коллаборации</h3>
                      <p className="text-sm text-gray-600">Позволить другим креаторам присоединиться к проекту</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.openForCollaboration}
                        onChange={(e) => handleInputChange('openForCollaboration', e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-pink-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-pink-600"></div>
                    </label>
                  </div>
                </div>
              </div>

              <div className="mt-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Описание проекта
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Расскажите о целях проекта, вашем видении и что вы хотите создать..."
                  rows={5}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  required
                />
              </div>
            </Card>
          </motion.div>

          {/* Требования и навыки */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-8"
          >
            <Card padding="lg">
              <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
                <PaintBrushIcon className="h-5 w-5 text-indigo-600" />
                Требования и навыки
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
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

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Временные рамки
                  </label>
                  <select
                    value={formData.timeframe}
                    onChange={(e) => handleInputChange('timeframe', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    {timeframes.map(timeframe => (
                      <option key={timeframe.value} value={timeframe.value}>{timeframe.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Навыки */}
              <div className="mb-6">
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
                            : 'bg-white text-gray-700 border-gray-300 hover:border-pink-500 hover:text-pink-600'
                        }`}
                      >
                        {skill}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>

          {/* Детали проекта */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mb-8"
          >
            <Card padding="lg">
              <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
                <CalendarIcon className="h-5 w-5 text-indigo-600" />
                Детали проекта
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Формат работы
                  </label>
                  <div className="space-y-2">
                    {workFormats.map(format => (
                      <label key={format.value} className="flex items-center">
                        <input
                          type="radio"
                          name="workFormat"
                          value={format.value}
                          checked={formData.workFormat === format.value}
                          onChange={(e) => handleInputChange('workFormat', e.target.value)}
                          className="mr-2"
                        />
                        {format.label}
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <Input
                    label="Крайний срок"
                    type="date"
                    value={formData.deadline}
                    onChange={(e) => handleInputChange('deadline', e.target.value)}
                  />
                </div>

                <div className="space-y-4">
                  <div className="flex gap-2">
                    <Input
                      label="Бюджет проекта"
                      type="number"
                      placeholder="50000"
                      value={formData.budget}
                      onChange={(e) => handleInputChange('budget', e.target.value)}
                      className="flex-1"
                    />
                    <div className="w-32">
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
                </div>
              </div>

              {/* Что получит участник */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
                  <StarIcon className="h-5 w-5 text-yellow-500" />
                  Что получит участник
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                    <input
                      type="checkbox"
                      checked={formData.deliverables.portfolio}
                      onChange={(e) => handleDeliverableChange('portfolio', e.target.checked)}
                      className="rounded"
                    />
                    <div className="flex items-center gap-2">
                      <PhotoIcon className="h-5 w-5 text-blue-600" />
                      <span className="font-medium">Портфолио кейс</span>
                    </div>
                  </label>

                  <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                    <input
                      type="checkbox"
                      checked={formData.deliverables.networking}
                      onChange={(e) => handleDeliverableChange('networking', e.target.checked)}
                      className="rounded"
                    />
                    <div className="flex items-center gap-2">
                      <UserGroupIcon className="h-5 w-5 text-green-600" />
                      <span className="font-medium">Нетворкинг</span>
                    </div>
                  </label>

                  <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                    <input
                      type="checkbox"
                      checked={formData.deliverables.recommendation}
                      onChange={(e) => handleDeliverableChange('recommendation', e.target.checked)}
                      className="rounded"
                    />
                    <div className="flex items-center gap-2">
                      <StarIcon className="h-5 w-5 text-purple-600" />
                      <span className="font-medium">Рекомендация</span>
                    </div>
                  </label>

                  <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                    <input
                      type="checkbox"
                      checked={formData.deliverables.longTermCollaboration}
                      onChange={(e) => handleDeliverableChange('longTermCollaboration', e.target.checked)}
                      className="rounded"
                    />
                    <div className="flex items-center gap-2">
                      <CheckCircleIcon className="h-5 w-5 text-orange-600" />
                      <span className="font-medium">Долгосрочное сотрудничество</span>
                    </div>
                  </label>
                </div>
              </div>
            </Card>
          </motion.div>

          {/* Приложить файлы */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mb-8"
          >
            <Card padding="lg">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Приложить файлы</h2>
              
              <div
                className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                  dragActive 
                    ? 'border-pink-500 bg-pink-50' 
                    : 'border-gray-300 hover:border-gray-400'
                }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                <CloudArrowUpIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-lg font-medium text-gray-900 mb-2">
                  Перетащите файлы сюда или 
                  <button
                    type="button"
                    onClick={() => document.getElementById('file-upload').click()}
                    className="text-pink-600 hover:text-pink-700 ml-1"
                  >
                    выберите файлы
                  </button>
                </p>
                <p className="text-sm text-gray-500">
                  Поддерживаются: PDF, DOC, PNG, JPG (до 10МБ)
                </p>
                
                <input
                  id="file-upload"
                  type="file"
                  multiple
                  accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
                  onChange={handleFileSelect}
                  className="hidden"
                />
              </div>

              {formData.files.length > 0 && (
                <div className="mt-4">
                  <h4 className="font-medium text-gray-900 mb-2">Загруженные файлы:</h4>
                  <div className="space-y-2">
                    {formData.files.map((file, index) => (
                      <div key={index} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                        <span className="text-sm font-medium text-gray-900">{file.name}</span>
                        <button
                          type="button"
                          onClick={() => removeFile(index)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <XMarkIcon className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </Card>
          </motion.div>

          {/* Контактная информация */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mb-8"
          >
            <Card padding="lg">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Контактная информация</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Email для связи"
                  type="email"
                  placeholder="project@company.com"
                  value={formData.contactEmail}
                  onChange={(e) => handleInputChange('contactEmail', e.target.value)}
                  required
                />
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
                className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700"
              >
                <RocketLaunchIcon className="h-4 w-4 mr-2" />
                Запустить проект
              </Button>
            </div>
          </div>
        </form>
      </div>
    </Layout>
  );
};

export default CreateCreativeProjectPage;
