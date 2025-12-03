import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const StudentRegistration = ({ onStudentAdded }) => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    dateOfBirth: '',
    address: ''
  });
  const [courses, setCourses] = useState([]);
  const [filteredCourses, setFilteredCourses] = useState([]);
  const [selectedCourses, setSelectedCourses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  useEffect(() => {
    fetchCourses();
  }, []);

  useEffect(() => {
    filterCourses();
  }, [courses, searchTerm, selectedCategory]);

  const filterCourses = () => {
    let filtered = courses;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(course =>
        course.CourseCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.CourseName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (course.Description && course.Description.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Filter by category
    if (selectedCategory !== 'All') {
      filtered = filtered.filter(course => course.Category === selectedCategory);
    }

    setFilteredCourses(filtered);
  };

  const fetchCourses = async () => {
    setLoading(true);
    setError('');
    try {
      console.log('Fetching courses from:', `${API_BASE_URL}/courses`);
      const response = await axios.get(`${API_BASE_URL}/courses`);
      console.log('Courses API response:', response.data);
      console.log('Number of courses:', response.data?.length || 0);
      
      if (response.data && Array.isArray(response.data)) {
        setCourses(response.data);
        setFilteredCourses(response.data);
        if (response.data.length === 0) {
          setError('No courses available in the database.');
        }
      } else {
        console.error('Invalid response format:', response.data);
        setError('Invalid response from server.');
        setCourses([]);
        setFilteredCourses([]);
      }
    } catch (error) {
      console.error('Error fetching courses:', error);
      console.error('Error details:', error.response?.data || error.message);
      setError(error.response?.data?.error || error.response?.data?.details || 'Failed to load courses. Please check your connection.');
      setCourses([]);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError('');
  };

  const handleCourseToggle = (courseId) => {
    setSelectedCourses(prev => {
      if (prev.includes(courseId)) {
        return prev.filter(id => id !== courseId);
      } else {
        return [...prev, courseId];
      }
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!formData.firstName || !formData.lastName || !formData.email) {
      setError('First Name, Last Name, and Email are required fields.');
      return;
    }

    setSubmitting(true);
    try {
      const response = await axios.post(`${API_BASE_URL}/students`, {
        ...formData,
        courseIds: selectedCourses
      });
      
      alert('Student registered successfully!');
      
      // Reset form
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        phoneNumber: '',
        dateOfBirth: '',
        address: ''
      });
      setSelectedCourses([]);
      
      if (onStudentAdded) {
        onStudentAdded();
      }
    } catch (error) {
      console.error('Error registering student:', error);
      setError(
        error.response?.data?.error || 
        'Failed to register student. Please try again.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Student Registration Form</h2>
      
      {error && (
        <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Personal Information */}
        <div className="bg-gray-50 p-6 rounded-lg">
          <h3 className="text-lg font-semibold text-gray-700 mb-4">Personal Information</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                First Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter first name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Last Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter last name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="student@example.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phone Number
              </label>
              <input
                type="tel"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="+1 (555) 123-4567"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date of Birth
              </label>
              <input
                type="date"
                name="dateOfBirth"
                value={formData.dateOfBirth}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Address
              </label>
              <textarea
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                rows="3"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter address"
              />
            </div>
          </div>
        </div>

        {/* Course Selection */}
        <div className="bg-gray-50 p-6 rounded-lg">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-700">
              Course Enrollment
              <span className="text-sm font-normal text-gray-500 ml-2">
                (Select one or more courses)
              </span>
            </h3>
            {selectedCourses.length > 0 && (
              <div className="px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold">
                {selectedCourses.length} Selected
              </div>
            )}
          </div>

          {/* Search and Category Filter */}
          <div className="mb-6 space-y-3">
            <div className="relative">
              <input
                type="text"
                placeholder="Search courses by code, name, or description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 pl-10 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
              <svg
                className="absolute left-3 top-2.5 h-5 w-5 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            
            {/* Category Filter */}
            <div className="flex flex-wrap gap-2">
              {['All', 'IT', 'Mathematics', 'Science', 'Language & Communication', 'Social Sciences', 'General'].map(category => (
                <button
                  key={category}
                  type="button"
                  onClick={() => setSelectedCategory(category)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    selectedCategory === category
                      ? 'bg-blue-600 text-white shadow-md transform scale-105'
                      : 'bg-white text-gray-700 border-2 border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <p className="text-gray-600 mt-2">Loading courses...</p>
            </div>
          ) : filteredCourses.length === 0 ? (
            <p className="text-gray-600 text-center py-8">
              {courses.length === 0 ? 'No courses available.' : 'No courses match your search criteria.'}
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {filteredCourses.map(course => (
                <label
                  key={course.CourseID}
                  className={`flex items-start p-4 border-2 rounded-lg cursor-pointer transition-all ${
                    selectedCourses.includes(course.CourseID)
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={selectedCourses.includes(course.CourseID)}
                    onChange={() => handleCourseToggle(course.CourseID)}
                    className="mt-1 mr-3 h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <div className="font-semibold text-gray-800">
                        {course.CourseCode}
                      </div>
                      {course.Category && (
                        <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                          course.Category === 'IT' ? 'bg-blue-100 text-blue-800' :
                          course.Category === 'Mathematics' ? 'bg-purple-100 text-purple-800' :
                          course.Category === 'Science' ? 'bg-green-100 text-green-800' :
                          course.Category === 'Language & Communication' ? 'bg-yellow-100 text-yellow-800' :
                          course.Category === 'Social Sciences' ? 'bg-pink-100 text-pink-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {course.Category}
                        </span>
                      )}
                    </div>
                    <div className="text-sm text-gray-600 font-medium">
                      {course.CourseName}
                    </div>
                    {course.Description && (
                      <div className="text-xs text-gray-500 mt-1 line-clamp-2">
                        {course.Description}
                      </div>
                    )}
                    <div className="text-xs text-gray-500 mt-1 flex items-center gap-2">
                      <span>{course.Credits} credits</span>
                    </div>
                  </div>
                </label>
              ))}
            </div>
          )}

          {selectedCourses.length > 0 && (
            <div className="mt-4 p-3 bg-blue-100 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>{selectedCourses.length}</strong> course(s) selected
              </p>
            </div>
          )}
        </div>

        {/* Submit Button */}
        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => {
              setFormData({
                firstName: '',
                lastName: '',
                email: '',
                phoneNumber: '',
                dateOfBirth: '',
                address: ''
              });
              setSelectedCourses([]);
              setSearchTerm('');
              setSelectedCategory('All');
              setError('');
            }}
            className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Clear Form
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="px-8 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed font-semibold"
          >
            {submitting ? 'Registering...' : 'Register Student'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default StudentRegistration;

