import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Avatar from './ui/Avatar';
import Button from './ui/Button';
import { UserIcon, UserGroupIcon, EyeIcon } from '@heroicons/react/24/outline';

const RecruiterInfo = ({ recruiterId, recruiterName, recruiterPosition, recruiterCompany }) => {
  const navigate = useNavigate();
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

      {/* Connection status */}
      {connectionInfo && (
        <div className="space-y-2">
          {connectionInfo.isDirectConnection ? (
            <div className="flex items-center space-x-2 text-green-600">
              <UserIcon className="w-4 h-4" />
              <span className="text-sm font-medium">Ваш друг</span>
            </div>
          ) : connectionInfo.mutualConnections && connectionInfo.mutualConnections.length > 0 ? (
            <div className="space-y-2">
              <div className="flex items-center space-x-2 text-blue-600">
                <UserGroupIcon className="w-4 h-4" />
                <span className="text-sm font-medium">
                  Связаны через {connectionInfo.mutualConnections.length} общих {connectionInfo.mutualConnections.length === 1 ? 'друга' : 'друзей'}
                </span>
              </div>
              
              {/* Show mutual connections */}
              <div className="space-y-1">
                {connectionInfo.mutualConnections.map((mutual) => (
                  <div key={mutual.id} className="flex items-center space-x-2 text-sm text-gray-600">
                    <Avatar 
                      fallback={mutual.name}
                      size="xs" 
                    />
                    <span>{mutual.name}</span>
                    {mutual.position && (
                      <span className="text-gray-500">• {mutual.position}</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex items-center space-x-2 text-gray-500">
              <UserIcon className="w-4 h-4" />
              <span className="text-sm">Нет общих связей</span>
            </div>
          )}
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
