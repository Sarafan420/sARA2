import { useState, useEffect, useCallback, useMemo } from 'react';
import apiService from '../services/api';

// Оптимизированный хук для работы с API данными
export const useOptimizedApi = (apiCall, dependencies = []) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Мемоизируем функцию запроса для предотвращения лишних ре-рендеров
  const memoizedApiCall = useCallback(apiCall, [apiCall, ...dependencies]);

  // Унифицированная функция для выполнения запроса
  const executeRequest = useCallback(async (showLoading = true) => {
    try {
      if (showLoading) setLoading(true);
      setError(null);
      const result = await memoizedApiCall();
      setData(result);
      return result;
    } catch (err) {
      const errorMessage = err.message || 'Произошла ошибка при загрузке данных';
      setError(errorMessage);
      console.error('API call failed:', err);
      throw err;
    } finally {
      if (showLoading) setLoading(false);
    }
  }, [memoizedApiCall]);

  useEffect(() => {
    executeRequest();
  }, [executeRequest]);

  // Функция для обновления данных без показа лоадера
  const refetch = useCallback(() => executeRequest(false), [executeRequest]);

  // Мемоизируем возвращаемое значение
  const returnValue = useMemo(() => ({
    data,
    loading,
    error,
    refetch
  }), [data, loading, error, refetch]);

  return returnValue;
};

// Специализированные хуки для различных сущностей
export const useUsers = () => {
  const apiCall = useCallback(() => apiService.getUsers(), []);
  return useOptimizedApi(apiCall);
};

export const useUser = (id) => {
  const apiCall = useCallback(() => {
    if (!id) return Promise.resolve(null);
    return apiService.getUser(id);
  }, [id]);
  return useOptimizedApi(apiCall, [id]);
};

export const useVacancies = () => {
  const apiCall = useCallback(() => apiService.getVacancies(), []);
  return useOptimizedApi(apiCall);
};

export const useVacancy = (id) => {
  const apiCall = useCallback(() => {
    if (!id) return Promise.resolve(null);
    return apiService.getVacancy(id);
  }, [id]);
  return useOptimizedApi(apiCall, [id]);
};

export const useMyVacancies = (userId) => {
  const apiCall = useCallback(() => {
    if (!userId) return Promise.resolve([]);
    return apiService.getMyVacancies(userId);
  }, [userId]);
  return useOptimizedApi(apiCall, [userId]);
};

export const useConnections = (userId) => {
  const apiCall = useCallback(() => {
    if (!userId) return Promise.resolve([]);
    return apiService.getConnections(userId);
  }, [userId]);
  return useOptimizedApi(apiCall, [userId]);
};

export const useNotifications = (userId) => {
  const apiCall = useCallback(() => {
    if (!userId) return Promise.resolve([]);
    return apiService.getNotifications(userId);
  }, [userId]);
  return useOptimizedApi(apiCall, [userId]);
};

export const useResponses = (userId) => {
  const apiCall = useCallback(() => {
    if (!userId) return Promise.resolve([]);
    return apiService.getResponses(userId);
  }, [userId]);
  return useOptimizedApi(apiCall, [userId]);
};

// Оптимизированный хук для мутаций
export const useOptimizedMutation = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const mutate = useCallback(async (apiCall) => {
    try {
      setLoading(true);
      setError(null);
      const result = await apiCall();
      return result;
    } catch (err) {
      const errorMessage = err.message || 'Произошла ошибка при выполнении операции';
      setError(errorMessage);
      console.error('Mutation failed:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Мемоизируем возвращаемое значение
  const returnValue = useMemo(() => ({
    mutate,
    loading,
    error
  }), [mutate, loading, error]);

  return returnValue;
};
