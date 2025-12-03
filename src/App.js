import React, { useState, useEffect } from 'react';
import StudentRegistration from './components/StudentRegistration';
import StudentList from './components/StudentList';
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

function App() {
  const [activeTab, setActiveTab] = useState('register');
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/students`);
      setStudents(response.data);
    } catch (error) {
      console.error('Error fetching students:', error);
      alert('Failed to fetch students. Make sure the backend server is running.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'list') {
      fetchStudents();
    }
  }, [activeTab]);

  const handleStudentAdded = () => {
    fetchStudents();
    setActiveTab('list');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        <header className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            Student Registration System
          </h1>
          <p className="text-gray-600">
            Register students and manage course enrollments
          </p>
        </header>

        <div className="max-w-6xl mx-auto">
          {/* Tabs */}
          <div className="flex space-x-4 mb-6 border-b border-gray-300">
            <button
              onClick={() => setActiveTab('register')}
              className={`px-6 py-3 font-semibold transition-colors ${
                activeTab === 'register'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-blue-500'
              }`}
            >
              Register Student
            </button>
            <button
              onClick={() => setActiveTab('list')}
              className={`px-6 py-3 font-semibold transition-colors ${
                activeTab === 'list'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-blue-500'
              }`}
            >
              View Students ({students.length})
            </button>
          </div>

          {/* Content */}
          <div className="bg-white rounded-lg shadow-xl p-6">
            {activeTab === 'register' && (
              <StudentRegistration onStudentAdded={handleStudentAdded} />
            )}
            {activeTab === 'list' && (
              <StudentList
                students={students}
                loading={loading}
                onUpdate={fetchStudents}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;

