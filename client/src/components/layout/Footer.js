import React from 'react';
import { motion } from 'framer-motion';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    company: {
      title: 'Компания',
      links: [
        { name: 'О нас', href: '/about' },
        { name: 'Карьера', href: '/careers' },
        { name: 'Блог', href: '/blog' },
        { name: 'Пресс-центр', href: '/press' }
      ]
    },
    platform: {
      title: 'Платформа',
      links: [
        { name: 'Для соискателей', href: '/job-seekers' },
        { name: 'Для работодателей', href: '/employers' },
        { name: 'API', href: '/api' },
        { name: 'Мобильное приложение', href: '/mobile' }
      ]
    },
    support: {
      title: 'Поддержка',
      links: [
        { name: 'Помощь', href: '/help' },
        { name: 'Связаться с нами', href: '/contact' },
        { name: 'Статус системы', href: '/status' },
        { name: 'Сообщить об ошибке', href: '/report-bug' }
      ]
    },
    legal: {
      title: 'Правовая информация',
      links: [
        { name: 'Политика конфиденциальности', href: '/privacy' },
        { name: 'Условия использования', href: '/terms' },
        { name: 'Политика cookie', href: '/cookies' },
        { name: 'Лицензия', href: '/license' }
      ]
    }
  };

  const socialLinks = [
    { name: 'Twitter', href: '#', icon: 'M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z' },
    { name: 'LinkedIn', href: '#', icon: 'M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6zM2 9h4v12H2z' },
    { name: 'GitHub', href: '#', icon: 'M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 00-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0020 4.77 5.07 5.07 0 0019.91 1S18.73.65 16 2.48a13.38 13.38 0 00-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 005 4.77a5.44 5.44 0 00-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 009 18.13V22' }
  ];

  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          {Object.entries(footerLinks).map(([key, section]) => (
            <div key={key}>
              <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-300 mb-4">
                {section.title}
              </h3>
              <ul className="space-y-3">
                {section.links.map((link) => (
                  <li key={link.name}>
                    <motion.a
                      href={link.href}
                      className="text-gray-400 hover:text-white transition-colors duration-200"
                      whileHover={{ x: 2 }}
                    >
                      {link.name}
                    </motion.a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Newsletter Subscription */}
        <div className="border-t border-gray-700 pt-8 mb-8">
          <div className="max-w-md">
            <h3 className="text-lg font-semibold mb-4">Подписаться на новости</h3>
            <p className="text-gray-400 mb-4">
              Получайте последние обновления о новых вакансиях и возможностях карьерного роста.
            </p>
            <div className="flex space-x-3">
              <input
                type="email"
                placeholder="Ваш email"
                className="flex-1 px-4 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-lg font-medium transition-colors duration-200"
              >
                Подписаться
              </motion.button>
            </div>
          </div>
        </div>

        {/* Bottom Footer */}
        <div className="border-t border-gray-700 pt-8 flex flex-col sm:flex-row justify-between items-center">
          <div className="flex items-center space-x-2 mb-4 sm:mb-0">
            <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">N</span>
            </div>
            <span className="text-xl font-bold">NetWork</span>
          </div>

          <div className="flex items-center space-x-6">
            {/* Social Links */}
            <div className="flex space-x-4">
              {socialLinks.map((social) => (
                <motion.a
                  key={social.name}
                  href={social.href}
                  className="text-gray-400 hover:text-white transition-colors duration-200"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <span className="sr-only">{social.name}</span>
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={social.icon} />
                  </svg>
                </motion.a>
              ))}
            </div>

            <div className="text-gray-400 text-sm">
              © {currentYear} NetWork. Все права защищены.
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
