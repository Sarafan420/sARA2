import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';

// Pages
import HomePage from './pages/HomePage';
import VacanciesPage from './pages/VacanciesPage';
import PeoplePage from './pages/PeoplePage';
import ProfilePage from './pages/ProfilePage';
import EditProfilePage from './pages/EditProfilePage';
import CreateVacancyPage from './pages/CreateVacancyPage';
import CreateRegularVacancyPage from './pages/CreateRegularVacancyPage';
import CreateFreelanceVacancyPage from './pages/CreateFreelanceVacancyPage';
import CreateInternshipPage from './pages/CreateInternshipPage';
import CreateCreativeProjectPage from './pages/CreateCreativeProjectPage';
import VacancyDetailsPage from './pages/VacancyDetailsPage';
import SearchPage from './pages/SearchPage';
import NotificationsPage from './pages/NotificationsPage';
import NotificationSettingsPage from './pages/NotificationSettingsPage';
import RegistrationPage from './pages/RegistrationPage';
import LoginPage from './pages/LoginPage';
import SettingsPage from './pages/SettingsPage';
import ConnectionsPage from './pages/ConnectionsPage';

// Contexts
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { NotificationProvider } from './contexts/NotificationContext';

// Components
import ProtectedRoute from './components/auth/ProtectedRoute';

// Global Styles
import './styles/globals.css';

const App = () => {
  return (
    <ThemeProvider>
      <AuthProvider>
        <NotificationProvider>
          <Router>
            <div className="app">
              <AnimatePresence mode="wait">
                <Routes>
                  {/* Main Pages */}
                  <Route path="/" element={<HomePage />} />
                  <Route path="/vacancies" element={<VacanciesPage />} />
                  <Route path="/people" element={<PeoplePage />} />
                  
                  {/* Vacancy Routes */}
                  <Route path="/vacancies/:id" element={<VacancyDetailsPage />} />
                  <Route path="/vacancies/create" element={
                    <ProtectedRoute>
                      <CreateVacancyPage />
                    </ProtectedRoute>
                  } />
                  <Route path="/vacancies/create/regular" element={
                    <ProtectedRoute>
                      <CreateRegularVacancyPage />
                    </ProtectedRoute>
                  } />
                  <Route path="/vacancies/create/freelance" element={
                    <ProtectedRoute>
                      <CreateFreelanceVacancyPage />
                    </ProtectedRoute>
                  } />
                  <Route path="/vacancies/create/internship" element={
                    <ProtectedRoute>
                      <CreateInternshipPage />
                    </ProtectedRoute>
                  } />
                  <Route path="/vacancies/create/creative" element={
                    <ProtectedRoute>
                      <CreateCreativeProjectPage />
                    </ProtectedRoute>
                  } />
                  
                  {/* Profile Routes */}
                  <Route path="/profile" element={
                    <ProtectedRoute>
                      <ProfilePage />
                    </ProtectedRoute>
                  } />
                  <Route path="/profile/edit" element={
                    <ProtectedRoute>
                      <EditProfilePage />
                    </ProtectedRoute>
                  } />
                  <Route path="/profile/:id" element={<ProfilePage />} />
                  
                  {/* Connections */}
                  <Route path="/connections" element={
                    <ProtectedRoute>
                      <ConnectionsPage />
                    </ProtectedRoute>
                  } />
                  
                  {/* Utility Pages */}
                  <Route path="/search" element={<SearchPage />} />
                  <Route path="/notifications" element={
                    <ProtectedRoute>
                      <NotificationsPage />
                    </ProtectedRoute>
                  } />
                  <Route path="/notifications/settings" element={
                    <ProtectedRoute>
                      <NotificationSettingsPage />
                    </ProtectedRoute>
                  } />
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/register" element={<RegistrationPage />} />
                  <Route path="/settings" element={
                    <ProtectedRoute>
                      <SettingsPage />
                    </ProtectedRoute>
                  } />
                  
                  {/* Create Route - Universal */}
                  <Route path="/create" element={
                    <ProtectedRoute>
                      <CreateVacancyPage />
                    </ProtectedRoute>
                  } />
                  
                  {/* 404 */}
                  <Route path="*" element={<NotFoundPage />} />
                </Routes>
              </AnimatePresence>
            </div>
          </Router>
        </NotificationProvider>
      </AuthProvider>
    </ThemeProvider>
  );
};

// 404 Page Component
const NotFoundPage = () => (
  <div className="min-h-screen bg-gray-50 flex items-center justify-center">
    <div className="text-center">
      <h1 className="text-4xl font-bold text-gray-900 mb-4">404</h1>
      <p className="text-gray-600 mb-8">Страница не найдена</p>
      <a href="/" className="text-indigo-600 hover:text-indigo-700 font-medium">
        Вернуться на главную
      </a>
    </div>
  </div>
);

export default App;
