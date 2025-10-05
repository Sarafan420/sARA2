import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Layout from '../components/layout/Layout';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeftIcon,
  BriefcaseIcon,
  LightBulbIcon,
  AcademicCapIcon,
  CodeBracketIcon,
  PaintBrushIcon,
  RocketLaunchIcon,
  DocumentDuplicateIcon,
  QuestionMarkCircleIcon,
  ChevronRightIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';

const CreateVacancyPage = () => {
  const navigate = useNavigate();
  const [selectedType, setSelectedType] = useState(null);

  // Типы вакансий
  const vacancyTypes = [
    {
      id: 'regular',
      title: 'Обычная вакансия',
      description: 'Полная занятость, официальное трудоустройство, постоянная работа в офисе или удаленно',
      icon: BriefcaseIcon,
      color: 'blue',
      features: [
        'Полная занятость',
        'Официальное оформление', 
        'Соцпакет и бенефиты',
        'Карьерный рост'
      ],
      popular: true,
      route: '/vacancies/create/regular'
    },
    {
      id: 'freelance',
      title: 'Подработка',
      description: 'Частичная занятость, проектная работа, фриланс или временное сотрудничество',
      icon: LightBulbIcon,
      color: 'purple',
      features: [
        'Гибкий график',
        'Проектная основа',
        'Удаленная работа',
        'Быстрый старт'
      ],
      popular: true,
      route: '/vacancies/create/freelance'
    },
    {
      id: 'internship',
      title: 'Стажировка',
      description: 'Обучающая программа для студентов и выпускников с возможностью трудоустройства',
      icon: AcademicCapIcon,
      color: 'orange',
      features: [
        'Обучение и менторство',
        'Возможность трудоустройства',
        'Сертификат по итогам',
        'Опыт в резюме'
      ],
      forBeginner: true,
      route: '/vacancies/create/internship'
    },
    {
      id: 'creative',
      title: 'Творческий проект',
      description: 'Привлечение талантливых креаторов для работы над креативными проектами',
      icon: SparklesIcon,
      color: 'pink',
      features: [
        'Открыт для коллаборации',
        'Портфолио кейс',
        'Нетворкинг',
        'Творческая свобода'
      ],
      creative: true,
      route: '/vacancies/create/creative'
    }
  ];

  // Недавние шаблоны
  const recentTemplates = [
    {
      id: 'frontend-dev',
      title: 'Frontend Developer',
      lastUsed: '2 дня назад',
      icon: CodeBracketIcon,
      route: '/vacancies/create/template/frontend-dev'
    },
    {
      id: 'ui-ux-designer',
      title: 'UI/UX Designer',
      lastUsed: '5 дней назад',
      icon: PaintBrushIcon,
      route: '/vacancies/create/template/ui-ux-designer'
    }
  ];

  // Быстрые действия
  const quickActions = [
    {
      id: 'ai-assistant',
      title: 'ИИ помощник',
      description: 'Создать с помощью ИИ',
      icon: RocketLaunchIcon,
      route: '/vacancies/create/ai-assistant'
    },
    {
      id: 'duplicate',
      title: 'Дублировать',
      description: 'Копия вакансии',
      icon: DocumentDuplicateIcon,
      route: '/vacancies?tab=my&action=duplicate'
    }
  ];

  const handleTypeSelect = (type) => {
    setSelectedType(type.id);
    // Небольшая задержка для визуального эффекта
    setTimeout(() => {
      navigate(type.route);
    }, 200);
  };

  const handleTemplateSelect = (template) => {
    navigate(template.route);
  };

  const handleQuickAction = (action) => {
    navigate(action.route);
  };

  return (
    <Layout>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-24 md:pb-8">
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
            onClick={() => navigate('/vacancies')}
          >
            Назад
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Создать вакансию</h1>
            <p className="text-gray-600 mt-1">Выберите подходящий шаблон для создания вакансии</p>
          </div>
        </motion.div>

        {/* Выбор типа вакансии */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="mb-12"
        >
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Выберите тип вакансии</h2>
          <p className="text-gray-600 mb-8">Выберите подходящий шаблон для создания вакансии</p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {vacancyTypes.map((type, index) => (
              <motion.div
                key={type.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + index * 0.1 }}
              >
                <Card
                  hover
                  className={`relative cursor-pointer transition-all duration-200 ${
                    selectedType === type.id 
                      ? 'ring-2 ring-indigo-500 shadow-lg' 
                      : 'hover:shadow-lg'
                  }`}
                  onClick={() => handleTypeSelect(type)}
                  padding="lg"
                >
                  {/* Badges */}
                  <div className="absolute top-4 right-4 flex gap-2">
                    {type.popular && (
                      <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                        Рекомендуется
                      </span>
                    )}
                    {type.forBeginner && (
                      <span className="px-2 py-1 text-xs font-medium bg-orange-100 text-orange-800 rounded-full">
                        Для новичков
                      </span>
                    )}
                  </div>

                  {/* Icon */}
                  <div className={`w-12 h-12 rounded-lg flex items-center justify-center mb-4 ${
                    type.color === 'blue' ? 'bg-blue-100' :
                    type.color === 'purple' ? 'bg-purple-100' :
                    type.color === 'orange' ? 'bg-orange-100' :
                    'bg-pink-100'
                  }`}>
                    <type.icon className={`h-6 w-6 ${
                      type.color === 'blue' ? 'text-blue-600' :
                      type.color === 'purple' ? 'text-purple-600' :
                      type.color === 'orange' ? 'text-orange-600' :
                      'text-pink-600'
                    }`} />
                  </div>

                  {/* Content */}
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{type.title}</h3>
                  <p className="text-gray-600 text-sm mb-4">{type.description}</p>

                  {/* Features */}
                  <div className="space-y-2 mb-6">
                    {type.features.map((feature, idx) => (
                      <div key={idx} className="flex items-center text-sm text-gray-600">
                        <div className="w-1.5 h-1.5 bg-green-500 rounded-full mr-2 flex-shrink-0" />
                        {feature}
                      </div>
                    ))}
                  </div>

                  {/* Action */}
                  <div className="flex items-center justify-between">
                    <span className={`text-sm font-medium ${
                      type.popular ? 'text-green-600' : 
                      type.forBeginner ? 'text-orange-600' :
                      type.creative ? 'text-pink-600' :
                      'text-purple-600'
                    }`}>
                      {type.popular ? 'Популярно' : 
                       type.forBeginner ? 'Для новичков' : 
                       type.creative ? 'Креативно' : ''}
                    </span>
                    <ChevronRightIcon className="h-5 w-5 text-gray-400" />
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Недавние шаблоны */}
        {recentTemplates.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="mb-12"
          >
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Недавние шаблоны</h2>
            <p className="text-gray-600 mb-6">Используйте ранее созданные шаблоны</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {recentTemplates.map((template, index) => (
                <motion.div
                  key={template.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 + index * 0.1 }}
                >
                  <Card
                    hover
                    className="cursor-pointer"
                    onClick={() => handleTemplateSelect(template)}
                    padding="md"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                        <template.icon className="h-5 w-5 text-gray-600" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900">{template.title}</h3>
                        <p className="text-sm text-gray-500">Последнее использование: {template.lastUsed}</p>
                      </div>
                      <ChevronRightIcon className="h-5 w-5 text-gray-400" />
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Быстрые действия */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mb-12"
        >
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Быстрые действия</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {quickActions.map((action, index) => (
              <motion.div
                key={action.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 + index * 0.1 }}
              >
                <Card
                  hover
                  className="cursor-pointer text-center"
                  onClick={() => handleQuickAction(action)}
                  padding="lg"
                >
                  <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center mx-auto mb-4">
                    <action.icon className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{action.title}</h3>
                  <p className="text-gray-600 text-sm">{action.description}</p>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Помощь */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
        >
          <Card className="bg-blue-50 border-blue-200" padding="lg">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <QuestionMarkCircleIcon className="h-5 w-5 text-blue-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 mb-2">Нужна помощь?</h3>
                <p className="text-gray-600 text-sm mb-4">
                  Ознакомьтесь с руководством по созданию эффективных вакансий
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate('/help/create-vacancy')}
                >
                  Открыть руководство
                </Button>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>
    </Layout>
  );
};

export default CreateVacancyPage;
