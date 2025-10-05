import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Avatar from './ui/Avatar';
import Button from './ui/Button';
import Card from './ui/Card';
import {
  UserGroupIcon,
  CheckIcon,
  XMarkIcon,
  TrashIcon,
  EnvelopeIcon,
  ChevronUpIcon,
  ChevronDownIcon
} from '@heroicons/react/24/outline';

const FriendsList = ({ userId, isOwnProfile = false }) => {
  const navigate = useNavigate();
  const [friends, setFriends] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);
  const [showPendingRequests, setShowPendingRequests] = useState(true);

  useEffect(() => {
    if (userId) {
      fetchConnections();
    }
  }, [userId]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchConnections = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('authToken');
      if (!token) {
        setError('Пользователь не авторизован.');
        setLoading(false);
        return;
      }

      // Fetch accepted connections
      const acceptedResponse = await fetch(`http://localhost:5000/api/connections?status=accepted`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const acceptedResult = await acceptedResponse.json();

      if (acceptedResult.success) {
        setFriends(acceptedResult.connections);
      } else {
        setError(acceptedResult.error || 'Не удалось загрузить друзей.');
      }

      // Fetch pending connections (only if it's the user's own profile)
      if (isOwnProfile) {
        const pendingResponse = await fetch(`http://localhost:5000/api/connections?status=pending`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        const pendingResult = await pendingResponse.json();

        if (pendingResult.success) {
          setPendingRequests(pendingResult.connections.filter(req => req.isIncoming));
        } else {
          setError(pendingResult.error || 'Не удалось загрузить запросы.');
        }
      }

    } catch (err) {
      setError('Не удалось загрузить связи.');
      console.error('Error fetching connections:', err);
    } finally {
      setLoading(false);
    }
  };

  const acceptRequest = async (connectionId) => {
    setActionLoading(connectionId);
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`http://localhost:5000/api/connections/accept/${connectionId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      const result = await response.json();
      if (result.success) {
        fetchConnections(); // Refresh the list
      } else {
        setError(result.error || 'Не удалось принять запрос.');
      }
    } catch (err) {
      setError('Ошибка сети при принятии запроса.');
      console.error('Error accepting request:', err);
    } finally {
      setActionLoading(null);
    }
  };

  const rejectRequest = async (connectionId) => {
    setActionLoading(connectionId);
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`http://localhost:5000/api/connections/reject/${connectionId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      const result = await response.json();
      if (result.success) {
        fetchConnections(); // Refresh the list
      } else {
        setError(result.error || 'Не удалось отклонить запрос.');
      }
    } catch (err) {
      setError('Ошибка сети при отклонении запроса.');
      console.error('Error rejecting request:', err);
    } finally {
      setActionLoading(null);
    }
  };

  const removeConnection = async (connectionId) => {
    setActionLoading(connectionId);
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`http://localhost:5000/api/connections/${connectionId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const result = await response.json();
      if (result.success) {
        fetchConnections(); // Refresh the list
      } else {
        setError(result.error || 'Не удалось удалить связь.');
      }
    } catch (err) {
      setError('Ошибка сети при удалении связи.');
      console.error('Error removing connection:', err);
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) {
    return <Card className="p-6 text-center text-gray-500">Загрузка связей...</Card>;
  }

  if (error) {
    return <Card className="p-6 text-center text-red-500">Ошибка: {error}</Card>;
  }

  return (
    <div className="space-y-6">
      {/* Pending Requests - подняты наверх */}
      {isOwnProfile && pendingRequests.length > 0 && (
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <EnvelopeIcon className="w-5 h-5 mr-2 text-orange-600" />
              Запросы в друзья ({pendingRequests.length})
            </h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowPendingRequests(!showPendingRequests)}
              className="text-gray-500 hover:text-gray-700"
            >
              {showPendingRequests ? (
                <ChevronUpIcon className="w-4 h-4" />
              ) : (
                <ChevronDownIcon className="w-4 h-4" />
              )}
            </Button>
          </div>

          {showPendingRequests && (
            <div className="space-y-3">
              {pendingRequests.map((request) => (
                <div key={request.id} className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                  <div 
                    className="flex items-center space-x-3 cursor-pointer hover:bg-orange-100 rounded-lg p-2 -m-2 transition-colors"
                    onClick={() => navigate(`/profile/${request.friend.id}`)}
                  >
                    <Avatar 
                      fallback={request.friend.name}
                      size="md"
                    />
                    <div>
                      <p className="font-medium text-gray-900">
                        {request.friend.name}
                      </p>
                      <p className="text-sm text-gray-500">
                        {request.friend.position || 'Специалист'}
                      </p>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => acceptRequest(request.id)}
                      disabled={actionLoading === request.id}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <CheckIcon className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => rejectRequest(request.id)}
                      disabled={actionLoading === request.id}
                      className="text-red-600 hover:text-red-700"
                    >
                      <XMarkIcon className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      )}

      {/* Accepted Friends */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <UserGroupIcon className="w-5 h-5 mr-2 text-blue-600" />
            Друзья ({friends.length})
          </h3>
        </div>

        {friends.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <UserGroupIcon className="w-12 h-12 mx-auto mb-2 text-gray-300" />
            <p>Пока нет друзей</p>
            {isOwnProfile && (
              <p className="text-sm">Найдите людей и добавьте их в друзья</p>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {friends.map((connection) => (
              <div 
                key={connection.id} 
                className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors"
                onClick={() => navigate(`/profile/${connection.friend.id}`)}
              >
                <Avatar 
                  fallback={connection.friend.name}
                  size="md"
                />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 truncate">
                    {connection.friend.name}
                  </p>
                  <p className="text-sm text-gray-500 truncate">
                    {connection.friend.position || 'Специалист'}
                  </p>
                  {connection.friend.company && (
                    <p className="text-xs text-gray-400 truncate">
                      {connection.friend.company}
                    </p>
                  )}
                </div>
                {isOwnProfile && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeConnection(connection.id);
                    }}
                    disabled={actionLoading === connection.id}
                    className="text-red-600 hover:text-red-700"
                  >
                    <TrashIcon className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
};

export default FriendsList;