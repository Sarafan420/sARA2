import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Layout from '../components/layout/Layout';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Avatar from '../components/ui/Avatar';
import WorkExperienceForm from '../components/WorkExperienceForm';
import { 
  ArrowLeftIcon,
  PhotoIcon,
  XMarkIcon,
  PlusIcon
} from '@heroicons/react/24/outline';

const EditProfilePage = () => {
  const { user, updateProfile } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [isWorkFormOpen, setIsWorkFormOpen] = useState(false);
  const [editingWork, setEditingWork] = useState(null);
  const [workExperience, setWorkExperience] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    position: '',
    company: '',
    location: '',
    status: '',
    about: '',
    skills: [],
    interests: [],
    contact: {
      email: '',
      phone: '',
      telegram: ''
    },
    education: []
  });
  const [newSkill, setNewSkill] = useState('');
  const [newInterest, setNewInterest] = useState('');

  // Загружаем карьерный путь из БД
  useEffect(() => {
    if (user?.id) {
      fetchWorkExperience();
    }
  }, [user?.id]);

  const fetchWorkExperience = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/work-experience/user/${user.id}`);
      if (response.ok) {
        const data = await response.json();
        setWorkExperience(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching work experience:', error);
    }
  };

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        position: user.position || '',
        company: user.company || '',
        location: user.location || '',
        status: user.status || '',
        about: user.about || '',
        skills: user.skills || [],
        interests: user.interests || [],
        contact: {
          email: user.email || '',
          phone: user.contact?.phone || '',
          telegram: user.contact?.telegram || ''
        },
        education: user.education || []
      });
    }
  }, [user]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleAddSkill = (e) => {
    e.preventDefault();
    if (newSkill.trim() && !formData.skills.includes(newSkill.trim())) {
      setFormData(prev => ({
        ...prev,
        skills: [...prev.skills, newSkill.trim()]
      }));
      setNewSkill('');
    }
  };

  const handleRemoveSkill = (skillToRemove) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.filter(skill => skill !== skillToRemove)
    }));
  };

  const handleAddInterest = (e) => {
    e.preventDefault();
    if (newInterest.trim() && !formData.interests.includes(newInterest.trim())) {
      setFormData(prev => ({
        ...prev,
        interests: [...prev.interests, newInterest.trim()]
      }));
      setNewInterest('');
    }
  };

  const handleRemoveInterest = (interestToRemove) => {
    setFormData(prev => ({
      ...prev,
      interests: prev.interests.filter(interest => interest !== interestToRemove)
    }));
  };

  const handleAddWorkExperience = () => {
    setEditingWork(null);
    setIsWorkFormOpen(true);
  };

  const handleEditWorkExperience = (work) => {
    setEditingWork(work);
    setIsWorkFormOpen(true);
  };

  const handleDeleteWorkExperience = async (workId) => {
    if (!window.confirm('Вы уверены, что хотите удалить этот опыт работы?')) {
      return;
    }

    try {
      const response = await fetch(`http://localhost:5000/api/work-experience/${workId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to delete work experience');
      }

      setWorkExperience(prev => prev.filter(work => work.id !== workId));
    } catch (err) {
      console.error('Error deleting work experience:', err);
    }
  };

  const handleWorkFormSubmit = (newWork) => {
    if (editingWork) {
      // Update existing work
      setWorkExperience(prev => 
        prev.map(work => work.id === editingWork.id ? newWork : work)
      );
    } else {
      // Add new work
      setWorkExperience(prev => [newWork, ...prev]);
    }
    setIsWorkFormOpen(false);
    setEditingWork(null);
  };

  const handleAddEducation = () => {
    setFormData(prev => ({
      ...prev,
      education: [
        ...prev.education,
        {
          university: '',
          faculty: '',
          period: '',
          specialization: ''
        }
      ]
    }));
  };

  const handleEducationChange = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      education: prev.education.map((edu, i) => 
        i === index ? { ...edu, [field]: value } : edu
      )
    }));
  };

  const handleRemoveEducation = (index) => {
    setFormData(prev => ({
      ...prev,
      education: prev.education.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const result = await updateProfile(formData);
      if (result.success) {
        navigate('/profile');
      } else {
        console.error('Ошибка обновления профиля:', result.error);
      }
    } catch (error) {
      console.error('Ошибка:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Заголовок */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate('/profile')}
                className="mr-4"
              >
                <ArrowLeftIcon className="w-4 h-4 mr-1" />
                Назад
              </Button>
              <h1 className="text-2xl font-bold text-gray-900">Редактировать профиль</h1>
            </div>
            <Button
              type="submit"
              variant="primary"
              loading={loading}
              onClick={handleSubmit}
            >
              Сохранить изменения
            </Button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Основная информация */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Основная информация</h2>
            
            {/* Фото профиля */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Фото профиля
              </label>
              <div className="flex items-center space-x-4">
                <Avatar
                  fallback={user?.name}
                  size="2xl"
                />
                <Button variant="outline" size="sm">
                  <PhotoIcon className="w-4 h-4 mr-2" />
                  Изменить фото
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Имя и фамилия"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
              />
              <Input
                label="Должность"
                name="position"
                value={formData.position}
                onChange={handleInputChange}
                required
              />
              <Input
                label="Компания"
                name="company"
                value={formData.company}
                onChange={handleInputChange}
              />
              <Input
                label="Местоположение"
                name="location"
                value={formData.location}
                onChange={handleInputChange}
              />
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Статус
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="">Выберите статус</option>
                <option value="Открыт к предложениям">Открыт к предложениям</option>
                <option value="Активен">Активен</option>
                <option value="Ищет работу">Ищет работу</option>
              </select>
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                О себе
              </label>
              <textarea
                name="about"
                value={formData.about}
                onChange={handleInputChange}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Расскажите о себе, своем опыте и интересах..."
              />
            </div>
          </div>

          {/* Навыки и сферы деятельности */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Навыки и сферы деятельности</h2>
            
            {/* Навыки */}
            <div className="mb-6">
              <h3 className="text-md font-medium text-gray-700 mb-3">Навыки</h3>
              <div className="mb-4">
                <div className="flex gap-2 mb-2">
                  <Input
                    placeholder="Добавить навык"
                    value={newSkill}
                    onChange={(e) => setNewSkill(e.target.value)}
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleAddSkill}
                  >
                    <PlusIcon className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                {formData.skills.map((skill, index) => (
                  <div
                    key={index}
                    className="flex items-center bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full text-sm"
                  >
                    <span>{skill}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveSkill(skill)}
                      className="ml-2 hover:text-indigo-900"
                    >
                      <XMarkIcon className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Сферы деятельности */}
            <div>
              <h3 className="text-md font-medium text-gray-700 mb-3">Сферы деятельности</h3>
              <div className="mb-4">
                <div className="flex gap-2 mb-2">
                  <Input
                    placeholder="Добавить сферу деятельности"
                    value={newInterest}
                    onChange={(e) => setNewInterest(e.target.value)}
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleAddInterest}
                  >
                    <PlusIcon className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                {formData.interests.map((interest, index) => (
                  <div
                    key={index}
                    className="flex items-center bg-green-50 text-green-700 px-3 py-1 rounded-full text-sm"
                  >
                    <span>{interest}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveInterest(interest)}
                      className="ml-2 hover:text-green-900"
                    >
                      <XMarkIcon className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Контактная информация */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Контактная информация</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Email"
                name="contact.email"
                type="email"
                value={formData.contact.email}
                onChange={handleInputChange}
              />
              <Input
                label="Телефон"
                name="contact.phone"
                value={formData.contact.phone}
                onChange={handleInputChange}
              />
              <Input
                label="Telegram"
                name="contact.telegram"
                value={formData.contact.telegram}
                onChange={handleInputChange}
                placeholder="@username"
              />
            </div>
          </div>

          {/* Карьерный путь */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Карьерный путь</h2>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAddWorkExperience}
              >
                <PlusIcon className="w-4 h-4 mr-1" />
                Добавить работу
              </Button>
            </div>

            <div className="space-y-4">
              {workExperience.length === 0 ? (
                <p className="text-gray-500 text-center py-4">
                  У вас пока нет записей о карьерном пути
                </p>
              ) : (
                workExperience.map((work, index) => (
                  <div key={work.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="font-semibold text-gray-900">{work.position}</h3>
                        <p className="text-gray-700">{work.company}</p>
                        <p className="text-sm text-gray-500">
                          {new Date(work.startDate).toLocaleDateString('ru-RU')} - {work.endDate ? new Date(work.endDate).toLocaleDateString('ru-RU') : 'настоящее время'}
                        </p>
                        {work.description && (
                          <p className="text-sm text-gray-600 mt-1">{work.description}</p>
                        )}
                        {work.projectName && (
                          <p className="text-sm text-gray-600 mt-1">Проект: {work.projectName}</p>
                        )}
                      </div>
                      <div className="flex space-x-2">
                        <button
                          type="button"
                          onClick={() => handleEditWorkExperience(work)}
                          className="text-blue-500 hover:text-blue-700 text-sm"
                        >
                          Редактировать
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteWorkExperience(work.id)}
                          className="text-red-500 hover:text-red-700 text-sm"
                        >
                          Удалить
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Образование */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Образование</h2>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAddEducation}
              >
                <PlusIcon className="w-4 h-4 mr-1" />
                Добавить
              </Button>
            </div>

            <div className="space-y-4">
              {formData.education.map((edu, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="text-sm font-medium text-gray-900">Образование {index + 1}</h3>
                    <button
                      type="button"
                      onClick={() => handleRemoveEducation(index)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <XMarkIcon className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <Input
                      placeholder="Университет"
                      value={edu.university}
                      onChange={(e) => handleEducationChange(index, 'university', e.target.value)}
                    />
                    <Input
                      placeholder="Факультет"
                      value={edu.faculty}
                      onChange={(e) => handleEducationChange(index, 'faculty', e.target.value)}
                    />
                    <Input
                      placeholder="Период (например, 2015-2019)"
                      value={edu.period}
                      onChange={(e) => handleEducationChange(index, 'period', e.target.value)}
                    />
                    <Input
                      placeholder="Специализация"
                      value={edu.specialization}
                      onChange={(e) => handleEducationChange(index, 'specialization', e.target.value)}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Кнопки действий */}
          <div className="flex justify-end space-x-3 pt-6">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/profile')}
            >
              Отмена
            </Button>
            <Button
              type="submit"
              variant="primary"
              loading={loading}
            >
              Сохранить изменения
            </Button>
          </div>
        </form>
      </div>

      {/* Work Experience Form */}
      <WorkExperienceForm
        isOpen={isWorkFormOpen}
        onClose={() => {
          setIsWorkFormOpen(false);
          setEditingWork(null);
        }}
        onSubmit={handleWorkFormSubmit}
        initialData={editingWork}
        userId={user?.id}
      />
    </Layout>
  );
};

export default EditProfilePage;

