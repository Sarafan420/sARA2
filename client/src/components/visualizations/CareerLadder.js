import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CalendarIcon, 
  BuildingOfficeIcon, 
  ClockIcon,
  ArrowUpIcon,
  TrophyIcon,
  StarIcon
} from '@heroicons/react/24/outline';

const CareerLadder = ({ workExperience, currentPosition }) => {
  const [selectedStep, setSelectedStep] = useState(null);

  // Сортируем опыт работы по годам (новые сверху)
  const sortedExperience = [...workExperience].sort((a, b) => {
    const yearA = parseInt(a.period.split(' - ')[0].split(' ')[1] || '2000');
    const yearB = parseInt(b.period.split(' - ')[0].split(' ')[1] || '2000');
    return yearB - yearA;
  });

  // Добавляем текущую позицию если она есть
  const careerSteps = currentPosition ? [
    {
      position: currentPosition,
      company: 'Текущая позиция',
      period: 'Настоящее время',
      duration: 'Активно',
      description: 'Текущая работа',
      isCurrent: true
    },
    ...sortedExperience
  ] : sortedExperience;

  // Определяем уровень позиции для визуализации
  const getPositionLevel = (position) => {
    const senior = ['Senior', 'Lead', 'Head', 'Director', 'CTO', 'VP'];
    const middle = ['Manager', 'Specialist', 'Analyst'];
    
    if (senior.some(level => position.includes(level))) return 3;
    if (middle.some(level => position.includes(level))) return 2;
    return 1;
  };

  // Цвета для разных уровней
  const getLevelColor = (level) => {
    const colors = {
      1: 'bg-blue-500',
      2: 'bg-purple-500', 
      3: 'bg-yellow-500'
    };
    return colors[level] || 'bg-gray-500';
  };

  const getLevelIcon = (level) => {
    if (level === 3) return TrophyIcon;
    if (level === 2) return StarIcon;
    return ArrowUpIcon;
  };

  return (
    <div className="relative">
      {/* Заголовок */}
      <div className="text-center mb-8">
        <h3 className="text-2xl font-bold text-gray-900 mb-2">Карьерная лестница</h3>
        <p className="text-gray-600">Путь профессионального развития</p>
      </div>

      {/* Лестница */}
      <div className="relative max-w-4xl mx-auto">
        {/* Центральная линия */}
        <div className="absolute left-1/2 transform -translate-x-1/2 w-1 bg-gradient-to-b from-indigo-500 to-purple-600 h-full"></div>

        {/* Ступени карьеры */}
        <div className="space-y-12">
          {careerSteps.map((step, index) => {
            const level = getPositionLevel(step.position);
            const LevelIcon = getLevelIcon(level);
            const isLeft = index % 2 === 0;

            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: isLeft ? -50 : 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.2, duration: 0.6 }}
                className={`relative flex items-center ${isLeft ? 'justify-start' : 'justify-end'}`}
              >
                {/* Ступень */}
                <div 
                  className={`relative ${isLeft ? 'mr-8' : 'ml-8'} max-w-md cursor-pointer`}
                  onClick={() => setSelectedStep(selectedStep === index ? null : index)}
                >
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={`p-6 bg-white rounded-xl shadow-lg border-2 transition-all duration-300 ${
                      step.isCurrent 
                        ? 'border-indigo-500 bg-gradient-to-br from-indigo-50 to-purple-50' 
                        : 'border-gray-200 hover:border-indigo-300'
                    } ${selectedStep === index ? 'ring-4 ring-indigo-200' : ''}`}
                  >
                    {/* Заголовок позиции */}
                    <div className="flex items-start space-x-3 mb-4">
                      <div className={`flex-shrink-0 w-12 h-12 ${getLevelColor(level)} rounded-full flex items-center justify-center`}>
                        <LevelIcon className="h-6 w-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <h4 className={`font-bold text-lg ${step.isCurrent ? 'text-indigo-900' : 'text-gray-900'}`}>
                          {step.position}
                        </h4>
                        <div className="flex items-center text-gray-600 mt-1">
                          <BuildingOfficeIcon className="h-4 w-4 mr-1" />
                          <span className="text-sm">{step.company}</span>
                        </div>
                      </div>
                    </div>

                    {/* Временные рамки */}
                    <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
                      <div className="flex items-center">
                        <CalendarIcon className="h-4 w-4 mr-1" />
                        <span>{step.period}</span>
                      </div>
                      <div className="flex items-center">
                        <ClockIcon className="h-4 w-4 mr-1" />
                        <span>{step.duration}</span>
                      </div>
                    </div>

                    {/* Описание (расширенное) */}
                    <AnimatePresence>
                      {selectedStep === index && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.3 }}
                          className="border-t border-gray-200 pt-3 mt-3"
                        >
                          <p className="text-gray-700 text-sm leading-relaxed">
                            {step.description}
                          </p>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Индикатор текущей позиции */}
                    {step.isCurrent && (
                      <div className="absolute -top-2 -right-2">
                        <div className="bg-indigo-500 text-white text-xs px-2 py-1 rounded-full">
                          Сейчас
                        </div>
                      </div>
                    )}
                  </motion.div>
                </div>

                {/* Соединительный элемент с центральной линией */}
                <div className="absolute left-1/2 transform -translate-x-1/2 z-10">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: index * 0.2 + 0.3, duration: 0.3 }}
                    className={`w-6 h-6 ${getLevelColor(level)} rounded-full border-4 border-white shadow-lg flex items-center justify-center`}
                  >
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                  </motion.div>
                </div>

                {/* Стрелка направления */}
                <div className={`absolute top-1/2 transform -translate-y-1/2 ${
                  isLeft ? 'right-4' : 'left-4'
                } text-gray-400`}>
                  <div className={`w-8 h-0.5 bg-gray-300 ${isLeft ? '' : 'transform rotate-180'}`}></div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Стрелка роста в начале */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: careerSteps.length * 0.2 + 0.5 }}
          className="absolute -top-8 left-1/2 transform -translate-x-1/2 text-center"
        >
          <div className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-4 py-2 rounded-full text-sm font-medium">
            Карьерный рост ↗
          </div>
        </motion.div>
      </div>

      {/* Легенда уровней */}
      <div className="mt-12 flex justify-center">
        <div className="bg-gray-50 rounded-xl p-4">
          <h4 className="text-sm font-medium text-gray-900 mb-3 text-center">Уровни позиций</h4>
          <div className="flex space-x-6 text-xs">
            <div className="flex items-center">
              <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
              <span>Junior/Entry</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-purple-500 rounded-full mr-2"></div>
              <span>Middle/Specialist</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-yellow-500 rounded-full mr-2"></div>
              <span>Senior/Lead</span>
            </div>
          </div>
        </div>
      </div>

      {/* Подсказка */}
      <div className="text-center mt-6 text-sm text-gray-500">
        Нажмите на ступень, чтобы увидеть подробности
      </div>
    </div>
  );
};

export default CareerLadder;
