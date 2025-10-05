import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import Button from './ui/Button';
import { UserPlusIcon, CheckIcon } from '@heroicons/react/24/outline';

const AddFriendButton = ({ targetUserId, targetUserName, onStatusChange }) => {
  const { user: currentUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('none'); // none, pending, accepted, rejected

  // Check connection status
  const getConnectionStatus = useCallback(async () => {
    if (!currentUser || !targetUserId || currentUser.id === targetUserId) {
      return;
    }

    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`http://localhost:5000/api/connections?status=accepted`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        const acceptedConnection = data.connections.find(conn => 
          conn.friend.id === targetUserId
        );

        if (acceptedConnection) {
          setStatus('accepted');
          return;
        }
      }

      // Check pending requests
      const pendingResponse = await fetch(`http://localhost:5000/api/connections?status=pending`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (pendingResponse.ok) {
        const pendingData = await pendingResponse.json();
        const pendingConnection = pendingData.connections.find(conn => 
          conn.friend.id === targetUserId
        );

        if (pendingConnection) {
          setStatus('pending');
        } else {
          setStatus('none');
        }
      }
    } catch (error) {
      console.error('Error checking connection status:', error);
    }
  }, [currentUser, targetUserId]);

  useEffect(() => {
    getConnectionStatus();
  }, [getConnectionStatus]);

  const sendFriendRequest = async () => {
    if (!currentUser || !targetUserId) return;

    try {
      setLoading(true);
      const token = localStorage.getItem('authToken');
      
      const response = await fetch('http://localhost:5000/api/connections/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          connectedUserId: targetUserId,
          connectionType: 'friend'
        })
      });

      const result = await response.json();

      if (result.success) {
        setStatus('pending');
        if (onStatusChange) {
          onStatusChange('pending');
        }
      } else {
        console.error('Failed to send friend request:', result.error);
      }
    } catch (error) {
      console.error('Error sending friend request:', error);
    } finally {
      setLoading(false);
    }
  };

  // Don't show button for own profile
  if (!currentUser || currentUser.id === targetUserId) {
    return null;
  }

  const renderButton = () => {
    switch (status) {
      case 'pending':
        return (
          <Button variant="outline" size="sm" disabled>
            <UserPlusIcon className="w-4 h-4 mr-1" />
            Запрос отправлен
          </Button>
        );
      case 'accepted':
        return (
          <Button variant="secondary" size="sm" disabled>
            <CheckIcon className="w-4 h-4 mr-1" />
            Друзья
          </Button>
        );
      case 'none':
      default:
        return (
          <Button 
            variant="primary" 
            size="sm" 
            onClick={sendFriendRequest} 
            disabled={loading}
          >
            {loading ? 'Отправка...' : 'Добавить в друзья'}
          </Button>
        );
    }
  };

  return renderButton();
};

export default AddFriendButton;
