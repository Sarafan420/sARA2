import React, { useState, useEffect } from 'react';
import { CalendarIcon, BuildingOfficeIcon, BriefcaseIcon, CodeBracketIcon } from '@heroicons/react/24/outline';

const WorkExperienceSection = ({ userId, isOwnProfile = false }) => {
  const [workExperience, setWorkExperience] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchWorkExperience();
  }, [userId]);

  const fetchWorkExperience = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/work-experience/user/${userId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch work experience');
      }
      const data = await response.json();
      setWorkExperience(data.data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', {
      year: 'numeric',
      month: 'long'
    });
  };

  const getDuration = (startDate, endDate) => {
    const start = new Date(startDate);
    const end = endDate ? new Date(endDate) : new Date();
    
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const years = Math.floor(diffDays / 365);
    const months = Math.floor((diffDays % 365) / 30);
    
    if (years > 0) {
      return `${years} ${years === 1 ? 'год' : years < 5 ? 'года' : 'лет'}${months > 0 ? ` ${months} мес.` : ''}`;
    } else {
      return `${months} мес.`;
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded w-full"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="text-red-600 text-center">
          Ошибка загрузки карьерного пути: {error}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <BriefcaseIcon className="h-5 w-5 mr-2 text-blue-600" />
            Карьерный путь
          </h3>
        </div>
      </div>

      <div className="p-6">
        {workExperience.length === 0 ? (
          <div className="text-center py-8">
            <BuildingOfficeIcon className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg mb-2">Карьерный путь не указан</p>
            <p className="text-gray-400 text-sm">
              {isOwnProfile 
                ? 'Добавьте информацию о своем опыте работы' 
                : 'Пользователь не указал информацию о карьерном пути'
              }
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {workExperience.map((work, index) => (
              <div key={work.id} className="relative">
                {/* Timeline line */}
                {index < workExperience.length - 1 && (
                  <div className="absolute left-4 top-12 bottom-0 w-0.5 bg-gray-200"></div>
                )}
                
                <div className="flex items-start space-x-4">
                  {/* Timeline dot */}
                  <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <BuildingOfficeIcon className="h-4 w-4 text-blue-600" />
                  </div>
                  
                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="text-lg font-semibold text-gray-900">
                          {work.position}
                        </h4>
                        <p className="text-blue-600 font-medium flex items-center mt-1">
                          <BuildingOfficeIcon className="h-4 w-4 mr-1" />
                          {work.company}
                        </p>
                        
                        {/* Dates and duration */}
                        <div className="flex items-center space-x-4 mt-2 text-sm text-gray-600">
                          <div className="flex items-center">
                            <CalendarIcon className="h-4 w-4 mr-1" />
                            {formatDate(work.startDate)}
                            {work.endDate ? ` - ${formatDate(work.endDate)}` : ' - настоящее время'}
                          </div>
                          <div className="text-gray-400">•</div>
                          <div className="font-medium">
                            {getDuration(work.startDate, work.endDate)}
                          </div>
                        </div>
                        
                        {/* Project name */}
                        {work.projectName && (
                          <div className="mt-2 flex items-center text-sm text-gray-600">
                            <CodeBracketIcon className="h-4 w-4 mr-1" />
                            <span className="font-medium">Проект:</span>
                            <span className="ml-1">{work.projectName}</span>
                          </div>
                        )}
                        
                        {/* Description */}
                        {work.description && (
                          <div className="mt-3">
                            <p className="text-gray-700 text-sm leading-relaxed">
                              {work.description}
                            </p>
                          </div>
                        )}
                      </div>
                      
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
};

export default WorkExperienceSection;
