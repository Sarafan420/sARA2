import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  HomeIcon, 
  BriefcaseIcon, 
  UsersIcon, 
  UserIcon,
  PlusIcon 
} from '@heroicons/react/24/outline';
import {
  HomeIcon as HomeIconSolid,
  BriefcaseIcon as BriefcaseIconSolid,
  UsersIcon as UsersIconSolid,
  UserIcon as UserIconSolid
} from '@heroicons/react/24/solid';

const MobileBottomNav = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const tabs = [
    {
      id: 'home',
      label: 'Главная',
      path: '/',
      icon: HomeIcon,
      iconSolid: HomeIconSolid
    },
    {
      id: 'vacancies',
      label: 'Вакансии',
      path: '/vacancies',
      icon: BriefcaseIcon,
      iconSolid: BriefcaseIconSolid
    },
    {
      id: 'create',
      label: 'Создать',
      path: '/create',
      icon: PlusIcon,
      iconSolid: PlusIcon,
      isSpecial: true
    },
    {
      id: 'people',
      label: 'Люди',
      path: '/people',
      icon: UsersIcon,
      iconSolid: UsersIconSolid
    },
    {
      id: 'profile',
      label: 'Профиль',
      path: '/profile',
      icon: UserIcon,
      iconSolid: UserIconSolid
    }
  ];

  const isActive = (path) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  // Скрываем на больших экранах
  if (typeof window !== 'undefined' && window.innerWidth >= 768) {
    return null;
  }

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40">
      <div className="bg-white border-t border-gray-200 px-2 py-1 safe-area-bottom">
        <div className="flex justify-around items-center max-w-md mx-auto">
          {tabs.map((tab) => {
            const active = isActive(tab.path);
            const Icon = active ? tab.iconSolid : tab.icon;
            
            return (
              <motion.button
                key={tab.id}
                onClick={() => navigate(tab.path)}
                className={`flex flex-col items-center justify-center min-w-0 flex-1 ${
                  tab.isSpecial ? 'relative' : 'py-2 px-1'
                }`}
                whileTap={{ scale: 0.95 }}
              >
                {tab.isSpecial ? (
                  <motion.div
                    className="w-12 h-12 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg -mt-6"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <Icon className="h-6 w-6 text-white" />
                  </motion.div>
                ) : (
                  <>
                    <motion.div
                      className={`p-1 rounded-lg ${
                        active ? 'text-indigo-600' : 'text-gray-500'
                      }`}
                      animate={{ scale: active ? 1.1 : 1 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Icon className="h-6 w-6" />
                    </motion.div>
                    
                    <span 
                      className={`text-xs font-medium mt-1 ${
                        active ? 'text-indigo-600' : 'text-gray-500'
                      }`}
                    >
                      {tab.label}
                    </span>
                    
                    {active && (
                      <motion.div
                        layoutId="activeTab"
                        className="absolute -top-0.5 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-indigo-600 rounded-full"
                        initial={false}
                        transition={{ duration: 0.2 }}
                      />
                    )}
                  </>
                )}
              </motion.button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default MobileBottomNav;
