// Совместимость с существующим кодом - переадресация на оптимизированные хуки
export { 
  useOptimizedApi as useApi,
  useOptimizedMutation as useMutation 
} from './useOptimizedApi';

// Переадресация специализированных хуков на оптимизированные версии
export {
  useUsers,
  useUser,
  useVacancies,
  useVacancy,
  useMyVacancies,
  useConnections,
  useNotifications,
  useResponses
} from './useOptimizedApi';
