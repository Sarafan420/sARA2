import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Avatar from './ui/Avatar';
import Button from './ui/Button';
import { UserIcon, UserGroupIcon, EyeIcon } from '@heroicons/react/24/outline';

const RecruiterInfo = ({ recruiterId, recruiterName, recruiterPosition, recruiterCompany }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [connectionInfo, setConnectionInfo] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (recruiterId) {
      fetchConnectionInfo();
    }
  }, [recruiterId]);

  const fetchConnectionInfo = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`http://localhost:5000/api/connections/path/${recruiterId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setConnectionInfo(data);
      }
    } catch (error) {
      console.error('Error fetching connection info:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewProfile = () => {
    navigate(`/profile/${recruiterId}`);
  };

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center space-x-3">
        <div 
          className="cursor-pointer hover:opacity-80 transition-opacity"
          onClick={handleViewProfile}
        >
          <Avatar 
            fallback={recruiterName}
            size="md" 
          />
        </div>
        <div className="flex-1">
          <p 
            className="font-medium text-gray-900 cursor-pointer hover:text-indigo-600 transition-colors"
            onClick={handleViewProfile}
          >
            {recruiterName}
          </p>
          <p className="text-sm text-gray-600">{recruiterPosition}</p>
          {recruiterCompany && (
            <p className="text-sm text-gray-500">{recruiterCompany}</p>
          )}
        </div>
      </div>

      {/* Владелец вакансии */}
      {user && recruiterId === user.id && (
        <div className="flex items-center space-x-2 text-indigo-600">
          <UserIcon className="w-4 h-4" />
          <span className="text-sm font-medium">Ваша вакансия</span>
        </div>
      )}

      {/* Прямой друг */}
      {(!user || recruiterId !== user.id) && connectionInfo && connectionInfo.isDirectConnection && (
        <div className="flex items-center space-x-2 text-green-600">
          <UserIcon className="w-4 h-4" />
          <span className="text-sm font-medium">Ваш друг</span>
        </div>
      )}

      <div className="space-y-2">
        <Button 
          variant="primary" 
          size="sm" 
          className="w-full"
          icon={EyeIcon}
          onClick={handleViewProfile}
        >
          Посмотреть профиль
        </Button>
        <Button variant="outline" size="sm" className="w-full">
          Написать сообщение
        </Button>
      </div>
    </div>
  );
};

export default RecruiterInfo;
