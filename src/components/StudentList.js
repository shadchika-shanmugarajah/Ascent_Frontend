import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const StudentList = ({ students, loading, onUpdate }) => {
  const [expandedStudent, setExpandedStudent] = useState(null);
  const [studentDetails, setStudentDetails] = useState({});
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [showAddCourseModal, setShowAddCourseModal] = useState(null);
  const [showEditModal, setShowEditModal] = useState(null);
  const [editFormData, setEditFormData] = useState({});
  const [availableCourses, setAvailableCourses] = useState([]);
  const [selectedCoursesToAdd, setSelectedCoursesToAdd] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  useEffect(() => {
    if (showAddCourseModal) {
      fetchAvailableCourses();
    }
  }, [showAddCourseModal]);

  const fetchAvailableCourses = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/courses`);
      setAvailableCourses(response.data || []);
    } catch (error) {
      console.error('Error fetching courses:', error);
      alert('Failed to load courses');
    }
  };

  const fetchStudentDetails = async (studentId) => {
    if (studentDetails[studentId]) {
      setExpandedStudent(expandedStudent === studentId ? null : studentId);
      return;
    }

    setLoadingDetails(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/students/${studentId}`);
      setStudentDetails(prev => ({
        ...prev,
        [studentId]: response.data
      }));
      setExpandedStudent(studentId);
    } catch (error) {
      console.error('Error fetching student details:', error);
      alert('Failed to load student details');
    } finally {
      setLoadingDetails(false);
    }
  };

  const handleAddCourses = async (studentId) => {
    if (selectedCoursesToAdd.length === 0) {
      alert('Please select at least one course');
      return;
    }

    try {
      await axios.post(`${API_BASE_URL}/students/${studentId}/courses`, {
        courseIds: selectedCoursesToAdd
      });
      alert('Courses added successfully!');
      setShowAddCourseModal(null);
      setSelectedCoursesToAdd([]);
      setSearchTerm('');
      setSelectedCategory('All');
      // Refresh student details
      const response = await axios.get(`${API_BASE_URL}/students/${studentId}`);
      setStudentDetails(prev => ({
        ...prev,
        [studentId]: response.data
      }));
      onUpdate();
    } catch (error) {
      console.error('Error adding courses:', error);
      alert(error.response?.data?.error || 'Failed to add courses');
    }
  };

  const handleRemoveCourse = async (studentId, courseId) => {
    if (!window.confirm('Are you sure you want to remove this course enrollment?')) {
      return;
    }

    try {
      await axios.delete(`${API_BASE_URL}/students/${studentId}/courses/${courseId}`);
      alert('Course removed successfully!');
      // Refresh student details
      const response = await axios.get(`${API_BASE_URL}/students/${studentId}`);
      setStudentDetails(prev => ({
        ...prev,
        [studentId]: response.data
      }));
      onUpdate();
    } catch (error) {
      console.error('Error removing course:', error);
      alert('Failed to remove course');
    }
  };

  const handleEditClick = (student) => {
    setEditFormData({
      firstName: student.FirstName,
      lastName: student.LastName,
      email: student.Email,
      phoneNumber: student.PhoneNumber || '',
      dateOfBirth: student.DateOfBirth ? student.DateOfBirth.split('T')[0] : '',
      address: student.Address || ''
    });
    setShowEditModal(student.StudentID);
  };

  const handleEditInputChange = (e) => {
    const { name, value } = e.target;
    setEditFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleUpdateStudent = async (studentId) => {
    if (!editFormData.firstName || !editFormData.lastName || !editFormData.email) {
      alert('First Name, Last Name, and Email are required');
      return;
    }

    try {
      await axios.put(`${API_BASE_URL}/students/${studentId}`, editFormData);
      alert('Student updated successfully!');
      setShowEditModal(null);
      setEditFormData({});
      // Refresh student list and details
      onUpdate();
      // Clear cached details to force refresh
      setStudentDetails(prev => {
        const newDetails = { ...prev };
        delete newDetails[studentId];
        return newDetails;
      });
      setExpandedStudent(null);
    } catch (error) {
      console.error('Error updating student:', error);
      alert(error.response?.data?.error || 'Failed to update student');
    }
  };

  const toggleCourseSelection = (courseId) => {
    setSelectedCoursesToAdd(prev => {
      if (prev.includes(courseId)) {
        return prev.filter(id => id !== courseId);
      } else {
        return [...prev, courseId];
      }
    });
  };

  const getFilteredCourses = () => {
    let filtered = availableCourses;

    // Filter out already enrolled courses
    if (showAddCourseModal && studentDetails[showAddCourseModal]) {
      const enrolledCourseIds = (studentDetails[showAddCourseModal].courses || []).map(c => c.CourseID);
      filtered = filtered.filter(course => !enrolledCourseIds.includes(course.CourseID));
    }

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

    return filtered;
  };

  const handleDelete = async (studentId, studentName) => {
    if (!window.confirm(`Are you sure you want to delete ${studentName}?`)) {
      return;
    }

    try {
      await axios.delete(`${API_BASE_URL}/students/${studentId}`);
      alert('Student deleted successfully');
      onUpdate();
      setExpandedStudent(null);
      setStudentDetails(prev => {
        const newDetails = { ...prev };
        delete newDetails[studentId];
        return newDetails;
      });
    } catch (error) {
      console.error('Error deleting student:', error);
      alert('Failed to delete student');
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <p className="mt-4 text-gray-600">Loading students...</p>
      </div>
    );
  }

  if (students.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600 text-lg">No students registered yet.</p>
        <p className="text-gray-500 mt-2">Register a new student to get started.</p>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Registered Students</h2>
      
      <div className="space-y-4">
        {students.map(student => (
          <div
            key={student.StudentID}
            className="border border-gray-300 rounded-lg shadow-sm hover:shadow-md transition-shadow"
          >
            <div
              className="p-4 cursor-pointer"
              onClick={() => fetchStudentDetails(student.StudentID)}
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-800">
                    {student.FirstName} {student.LastName}
                  </h3>
                  <p className="text-gray-600 mt-1">{student.Email}</p>
                  {student.PhoneNumber && (
                    <p className="text-gray-500 text-sm mt-1">{student.PhoneNumber}</p>
                  )}
                  {student.EnrolledCourses && (
                    <p className="text-blue-600 text-sm mt-2">
                      <strong>Courses:</strong> {student.EnrolledCourses || 'None'}
                    </p>
                  )}
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEditClick(student);
                    }}
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm flex items-center gap-1"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    Edit
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(student.StudentID, `${student.FirstName} ${student.LastName}`);
                    }}
                    className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm flex items-center gap-1"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    Delete
                  </button>
                  <svg
                    className={`w-5 h-5 text-gray-500 transition-transform ${
                      expandedStudent === student.StudentID ? 'transform rotate-180' : ''
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>

            {expandedStudent === student.StudentID && (
              <div className="border-t border-gray-300 bg-gray-50 p-4">
                {loadingDetails ? (
                  <div className="text-center py-4">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  </div>
                ) : studentDetails[student.StudentID] ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-semibold text-gray-700 mb-2">Personal Details</h4>
                      <div className="space-y-2 text-sm">
                        <p><strong>Date of Birth:</strong> {formatDate(studentDetails[student.StudentID].DateOfBirth)}</p>
                        <p><strong>Address:</strong> {studentDetails[student.StudentID].Address || 'N/A'}</p>
                        <p><strong>Registered:</strong> {formatDate(studentDetails[student.StudentID].CreatedAt)}</p>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <h4 className="font-semibold text-gray-700">Enrolled Courses</h4>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setShowAddCourseModal(student.StudentID);
                            setSelectedCoursesToAdd([]);
                            setSearchTerm('');
                            setSelectedCategory('All');
                          }}
                          className="px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium flex items-center gap-1"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                          </svg>
                          Add Course
                        </button>
                      </div>
                      {studentDetails[student.StudentID].courses &&
                      studentDetails[student.StudentID].courses.length > 0 ? (
                        <div className="space-y-2">
                          {studentDetails[student.StudentID].courses.map(course => (
                            <div
                              key={course.CourseID}
                              className="bg-white p-3 rounded border border-gray-200 flex justify-between items-start hover:shadow-md transition-shadow"
                            >
                              <div className="flex-1">
                                <div className="font-semibold text-gray-800">
                                  {course.CourseCode} - {course.CourseName}
                                </div>
                                <div className="text-xs text-gray-500 mt-1">
                                  Enrolled: {formatDate(course.EnrollmentDate)} | {course.Credits} credits
                                </div>
                              </div>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleRemoveCourse(student.StudentID, course.CourseID);
                                }}
                                className="ml-2 px-2 py-1 bg-red-100 text-red-600 rounded hover:bg-red-200 transition-colors text-xs font-medium"
                              >
                                Remove
                              </button>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-gray-500 text-sm">No courses enrolled</p>
                      )}
                    </div>
                  </div>
                ) : null}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Add Course Modal */}
      {showAddCourseModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h3 className="text-2xl font-bold text-gray-800">Add Courses</h3>
                <button
                  onClick={() => {
                    setShowAddCourseModal(null);
                    setSelectedCoursesToAdd([]);
                    setSearchTerm('');
                    setSelectedCategory('All');
                  }}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="p-6">
              {/* Search and Filter */}
              <div className="mb-6 space-y-3">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search courses..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full px-4 py-2 pl-10 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                
                <div className="flex flex-wrap gap-2">
                  {['All', 'IT', 'Mathematics', 'Science', 'Language & Communication', 'Social Sciences', 'General'].map(category => (
                    <button
                      key={category}
                      type="button"
                      onClick={() => setSelectedCategory(category)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                        selectedCategory === category
                          ? 'bg-blue-600 text-white shadow-md'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {category}
                    </button>
                  ))}
                </div>
              </div>

              {/* Course List */}
              <div className="max-h-96 overflow-y-auto space-y-2 mb-4">
                {getFilteredCourses().length === 0 ? (
                  <p className="text-gray-500 text-center py-8">No courses available</p>
                ) : (
                  getFilteredCourses().map(course => (
                    <label
                      key={course.CourseID}
                      className={`flex items-start p-4 border-2 rounded-lg cursor-pointer transition-all ${
                        selectedCoursesToAdd.includes(course.CourseID)
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-300 hover:border-gray-400'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={selectedCoursesToAdd.includes(course.CourseID)}
                        onChange={() => toggleCourseSelection(course.CourseID)}
                        className="mt-1 mr-3 h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <div className="flex-1">
                        <div className="font-semibold text-gray-800">
                          {course.CourseCode} - {course.CourseName}
                        </div>
                        {course.Description && (
                          <div className="text-sm text-gray-600 mt-1">
                            {course.Description}
                          </div>
                        )}
                        <div className="text-xs text-gray-500 mt-1">
                          {course.Credits} credits
                          {course.Category && (
                            <span className={`ml-2 px-2 py-0.5 rounded ${
                              course.Category === 'IT' ? 'bg-blue-100 text-blue-800' :
                              course.Category === 'Mathematics' ? 'bg-purple-100 text-purple-800' :
                              course.Category === 'Science' ? 'bg-green-100 text-green-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {course.Category}
                            </span>
                          )}
                        </div>
                      </div>
                    </label>
                  ))
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddCourseModal(null);
                    setSelectedCoursesToAdd([]);
                    setSearchTerm('');
                    setSelectedCategory('All');
                  }}
                  className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => handleAddCourses(showAddCourseModal)}
                  disabled={selectedCoursesToAdd.length === 0}
                  className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed font-semibold"
                >
                  Add {selectedCoursesToAdd.length > 0 ? `(${selectedCoursesToAdd.length})` : ''} Course{selectedCoursesToAdd.length !== 1 ? 's' : ''}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Student Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h3 className="text-2xl font-bold text-gray-800">Edit Student Details</h3>
                <button
                  onClick={() => {
                    setShowEditModal(null);
                    setEditFormData({});
                  }}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <form onSubmit={(e) => {
              e.preventDefault();
              handleUpdateStudent(showEditModal);
            }} className="p-6">
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      First Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="firstName"
                      value={editFormData.firstName || ''}
                      onChange={handleEditInputChange}
                      required
                      className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                      value={editFormData.lastName || ''}
                      onChange={handleEditInputChange}
                      required
                      className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                      value={editFormData.email || ''}
                      onChange={handleEditInputChange}
                      required
                      className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                      value={editFormData.phoneNumber || ''}
                      onChange={handleEditInputChange}
                      className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                      value={editFormData.dateOfBirth || ''}
                      onChange={handleEditInputChange}
                      className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Address
                  </label>
                  <textarea
                    name="address"
                    value={editFormData.address || ''}
                    onChange={handleEditInputChange}
                    rows="3"
                    className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter address"
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-6 pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditModal(null);
                    setEditFormData({});
                  }}
                  className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold shadow-lg"
                >
                  Update Student
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentList;

