import React, { useState } from 'react';
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const StudentList = ({ students, loading, onUpdate }) => {
  const [expandedStudent, setExpandedStudent] = useState(null);
  const [studentDetails, setStudentDetails] = useState({});
  const [loadingDetails, setLoadingDetails] = useState(false);

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
                      handleDelete(student.StudentID, `${student.FirstName} ${student.LastName}`);
                    }}
                    className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm"
                  >
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
                      <h4 className="font-semibold text-gray-700 mb-2">Enrolled Courses</h4>
                      {studentDetails[student.StudentID].courses &&
                      studentDetails[student.StudentID].courses.length > 0 ? (
                        <div className="space-y-2">
                          {studentDetails[student.StudentID].courses.map(course => (
                            <div
                              key={course.CourseID}
                              className="bg-white p-3 rounded border border-gray-200"
                            >
                              <div className="font-semibold text-gray-800">
                                {course.CourseCode} - {course.CourseName}
                              </div>
                              <div className="text-xs text-gray-500 mt-1">
                                Enrolled: {formatDate(course.EnrollmentDate)} | {course.Credits} credits
                              </div>
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
    </div>
  );
};

export default StudentList;

