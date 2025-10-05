import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Spinner from '../components/ui/Spinner';
import { 
  MagnifyingGlassIcon
} from '@heroicons/react/24/outline';

const SearchPage = () => {
  const location = useLocation();
  
  const [searchQuery, setSearchQuery] = useState(
    new URLSearchParams(location.search).get('q') || ''
  );
  
  const [isLoading, setIsLoading] = useState(true);

  // Имитация загрузки результатов поиска
  useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 800);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-24 md:pb-8">
        {/* Главный поиск */}
        <div className="mb-8">
          <div className="max-w-2xl mx-auto">
            <div className="flex space-x-4">
              <Input
                placeholder="Поиск вакансий, людей..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                leftIcon={MagnifyingGlassIcon}
                className="flex-1"
                size="lg"
              />
              <Button variant="primary" size="lg">
                Найти
              </Button>
            </div>
          </div>
        </div>

        {/* Результаты поиска */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            {searchQuery ? `Результаты поиска: "${searchQuery}"` : 'Поиск вакансий'}
          </h1>
          <p className="text-gray-600">
            Найдено результатов
          </p>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <Spinner size="lg" />
          </div>
        ) : (
          <Card padding="lg" className="text-center">
            <div className="py-12">
              <MagnifyingGlassIcon className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Функция поиска в разработке
              </h3>
              <p className="text-gray-500 mb-4">
                Скоро здесь будет полноценный поиск по вакансиям
              </p>
            </div>
          </Card>
        )}
      </div>
    </Layout>
  );
};

export default SearchPage;