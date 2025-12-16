import React from 'react';
import { motion } from 'framer-motion';
import { 
  MapPinIcon, 
  CurrencyDollarIcon, 
  ClockIcon,
  HeartIcon,
  BookmarkIcon,
  PencilIcon,
  TrashIcon,
  UserIcon,
  BriefcaseIcon,
  LightBulbIcon,
  PaintBrushIcon,
  EyeSlashIcon
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartIconSolid, BookmarkIcon as BookmarkIconSolid } from '@heroicons/react/24/solid';
import { useNavigate } from 'react-router-dom';
import Card from './ui/Card';
import Button from './ui/Button';
import Badge from './ui/Badge';
import Avatar from './ui/Avatar';

const VacancyCard = ({ 
  vacancy, 
  isMyVacancy = false, 
  likedVacancies = new Set(), 
  savedVacancies = new Set(),
  appliedVacancies = new Set(),
  onToggleLike,
  onToggleSave,
  onDelete,
  onHideVacancy,
  onShowResponses,
  onApplyToVacancy,
  isHidden = false,
  index = 0
}) => {
  const navigate = useNavigate();

  // Определяем тип вакансии и соответствующие стили (цвета соответствуют форме создания вакансии)
  const getVacancyTypeStyles = (vacancyType) => {
    switch (vacancyType?.name) {
      case 'Стажировка':
        return {
          gradient: 'from-orange-500 to-orange-600',
          logoBg: 'bg-orange-500',
          icon: UserIcon,
          iconColor: 'text-white',
          bgColor: 'bg-orange-50',
          textColor: 'text-orange-700',
          borderColor: 'border-orange-200'
        };
      case 'Подработка':
      case 'Фриланс':
        return {
          gradient: 'from-purple-500 to-purple-600',
          logoBg: 'bg-purple-500',
          icon: BriefcaseIcon,
          iconColor: 'text-white',
          bgColor: 'bg-purple-50',
          textColor: 'text-purple-700',
          borderColor: 'border-purple-200'
        };
      case 'Творческий проект':
        return {
          gradient: 'from-pink-500 to-pink-600',
          logoBg: 'bg-pink-500',
          icon: PaintBrushIcon,
          iconColor: 'text-white',
          bgColor: 'bg-pink-50',
          textColor: 'text-pink-700',
          borderColor: 'border-pink-200'
        };
      default: // Обычная вакансия
        return {
          gradient: 'from-blue-500 to-blue-600',
          logoBg: 'bg-blue-500',
          icon: BriefcaseIcon,
          iconColor: 'text-white',
          bgColor: 'bg-blue-50',
          textColor: 'text-blue-700',
          borderColor: 'border-blue-200'
        };
    }
  };

  const typeStyles = getVacancyTypeStyles(vacancy.vacancyType);
  const IconComponent = typeStyles.icon;

  const handleCardClick = () => {
    navigate(`/vacancies/${vacancy.id}`);
  };

  const handleActionClick = (e, action) => {
    e.stopPropagation();
    action();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ delay: index * 0.1, duration: 0.3 }}
      className="group w-full"
    >
      <Card 
        hover 
        padding="lg" 
        className="cursor-pointer border border-gray-200 hover:border-gray-300 transition-all duration-200 w-full bg-white shadow-sm"
        onClick={handleCardClick}
      >
        {/* Заголовок карточки */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-start space-x-4">
            {/* Иконка роли */}
            <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${typeStyles.logoBg}`}>
              <IconComponent className="h-6 w-6 text-white" />
            </div>
            
            <div className="flex-1">
              <h3 className="text-xl font-bold text-gray-900 mb-1">
                {vacancy.title}
              </h3>
              <p className="text-gray-600 text-base mb-2">
                {vacancy.company}
              </p>
              
              {/* Локация и зарплата */}
              <div className="flex items-center space-x-4 text-sm text-gray-600 mb-2">
                <div className="flex items-center space-x-1">
                  <MapPinIcon className="h-4 w-4" />
                  <span>{vacancy.location}</span>
                </div>
                <div className="bg-green-100 text-green-800 px-2 py-1 rounded text-sm font-medium">
                  {vacancy.salaryMin && vacancy.salaryMax 
                    ? `${vacancy.salaryMin.toLocaleString()} - ${vacancy.salaryMax.toLocaleString()} ₽`
                    : vacancy.salaryMin 
                      ? `от ${vacancy.salaryMin.toLocaleString()} ₽`
                      : 'По договоренности'
                  }
                </div>
              </div>
              
              {/* Рекрутер с информацией о связи */}
              {vacancy.user && (
                <div className="flex items-center space-x-2 text-sm">
                  <Avatar 
                    fallback={vacancy.user.name}
                    size="xs" 
                  />
                  <span className="font-medium text-gray-700">
                    {vacancy.user.name}
                  </span>
                  <span className="text-gray-500">• {vacancy.user.company || 'Рекрутер'}</span>
                  
                  {/* Индикатор типа связи */}
                  {vacancy.connectionInfo && (
                    <div className="flex items-center space-x-1 ml-2">
                      {vacancy.connectionInfo.isDirectConnection ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200">
                          <UserIcon className="h-3 w-3 mr-1" />
                          Друг
                        </span>
                      ) : vacancy.connectionInfo.mutualConnections && vacancy.connectionInfo.mutualConnections.length > 0 ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800 border border-purple-200">
                          <UserIcon className="h-3 w-3 mr-1" />
                          Через {vacancy.connectionInfo.mutualConnections.length} {vacancy.connectionInfo.mutualConnections.length === 1 ? 'друга' : 'друзей'}
                        </span>
                      ) : null}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
          
          {/* Дата публикации */}
          <div className="flex items-center space-x-1 text-sm text-gray-500">
            <ClockIcon className="h-4 w-4" />
            <span>Опубликовано {vacancy.posted}</span>
          </div>
        </div>

        {/* Описание вакансии */}
        {vacancy.description && (
          <div className="mb-4">
            <h4 className="font-medium text-gray-900 mb-2">Описание вакансии</h4>
            <p className="text-sm text-gray-600 leading-relaxed">
              {vacancy.description}
            </p>
          </div>
        )}

        {/* Требуемые навыки */}
        {vacancy.skills && vacancy.skills.length > 0 && (
          <div className="mb-6">
            <h4 className="font-medium text-gray-900 mb-3">Требуемые навыки</h4>
            <div className="flex flex-wrap gap-2">
              {vacancy.skills.slice(0, 8).map((skill, index) => {
                const skillColors = [
                  'bg-blue-100 text-blue-800',
                  'bg-purple-100 text-purple-800',
                  'bg-yellow-100 text-yellow-800',
                  'bg-green-100 text-green-800',
                  'bg-orange-100 text-orange-800',
                  'bg-pink-100 text-pink-800'
                ];
                const colorClass = skillColors[index % skillColors.length];
                
                return (
                  <Badge 
                    key={skill.id || skill} 
                    variant="primary" 
                    size="sm"
                    className={`text-xs ${colorClass} border-0 px-3 py-1`}
                  >
                    {skill.name || skill}
                  </Badge>
                );
              })}
              {vacancy.skills.length > 8 && (
                <Badge 
                  variant="secondary" 
                  size="sm"
                  className="text-xs bg-gray-100 text-gray-600 border-0 px-3 py-1"
                >
                  +{vacancy.skills.length - 8}
                </Badge>
              )}
            </div>
          </div>
        )}

        {/* Футер с кнопками действий */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
          <div className="flex items-center space-x-6">
            <button 
              className={`flex items-center space-x-2 text-sm transition-colors ${
                likedVacancies.has(vacancy.id) ? 'text-red-500' : 'text-gray-500 hover:text-red-500'
              }`}
              onClick={(e) => handleActionClick(e, () => onToggleLike(vacancy.id))}
            >
              {likedVacancies.has(vacancy.id) ? (
                <HeartIconSolid className="h-4 w-4" />
              ) : (
                <HeartIcon className="h-4 w-4" />
              )}
              <span>Нравится</span>
            </button>
            
            <button 
              className={`flex items-center space-x-2 text-sm transition-colors ${
                savedVacancies.has(vacancy.id) ? 'text-indigo-500' : 'text-gray-500 hover:text-indigo-500'
              }`}
              onClick={(e) => handleActionClick(e, () => onToggleSave(vacancy.id))}
            >
              {savedVacancies.has(vacancy.id) ? (
                <BookmarkIconSolid className="h-4 w-4" />
              ) : (
                <BookmarkIcon className="h-4 w-4" />
              )}
              <span>{savedVacancies.has(vacancy.id) ? 'В избранном' : 'В избранное'}</span>
            </button>

            {onHideVacancy && !isMyVacancy && (
              <button 
                className="flex items-center space-x-2 text-sm text-gray-500 hover:text-gray-700 transition-colors"
                onClick={(e) => handleActionClick(e, () => onHideVacancy(vacancy.id))}
              >
                <EyeSlashIcon className="h-4 w-4" />
                <span>{isHidden ? 'Показать' : 'Скрыть'}</span>
              </button>
            )}
          </div>
          
          <Button
            variant="primary"
            size="sm"
            className={`px-6 py-2 rounded-lg flex items-center space-x-2 ${
              appliedVacancies.has(vacancy.id) 
                ? 'bg-green-600 hover:bg-green-700 text-white' 
                : 'bg-blue-600 hover:bg-blue-700 text-white'
            }`}
            onClick={(e) => {
              e.stopPropagation();
              if (isMyVacancy && onShowResponses) {
                onShowResponses(vacancy.id);
              } else if (appliedVacancies.has(vacancy.id)) {
                // Если уже откликнулся, ничего не делаем
                return;
              } else if (onApplyToVacancy) {
                onApplyToVacancy(vacancy.id);
              } else {
                // Обычное поведение для отклика
                handleCardClick();
              }
            }}
          >
            <span className="text-sm">
              {isMyVacancy ? '👥' : appliedVacancies.has(vacancy.id) ? '✅' : '🚀'}
            </span>
            <span>
              {isMyVacancy 
                ? 'Показать отклики' 
                : appliedVacancies.has(vacancy.id) 
                  ? 'Заявка отправлена!' 
                  : 'Откликнуться'
              }
            </span>
          </Button>
        </div>
      </Card>
    </motion.div>
  );
};

export default VacancyCard;
