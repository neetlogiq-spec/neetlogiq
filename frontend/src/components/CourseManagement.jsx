import React, { useState, useEffect } from 'react';
import { 
  BookOpen, 
  Plus, 
  Edit3, 
  Trash2, 
  Eye, 
  Calendar, 
  Users, 
  Target,
  GraduationCap,
  AlertTriangle
} from 'lucide-react';
import CourseModal from './CourseModal';

const CourseManagement = ({ 
  collegeId, 
  collegeName, 
  courses = [], 
  loading = false,
  onCourseUpdate,
  onCourseDelete,
  onCourseCreate
}) => {
  const [showCourseModal, setShowCourseModal] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [courseToDelete, setCourseToDelete] = useState(null);

  const handleEditCourse = (course) => {
    setSelectedCourse(course);
    setShowCourseModal(true);
  };

  const handleAddCourse = () => {
    setSelectedCourse(null);
    setShowCourseModal(true);
  };

  const handleDeleteCourse = (course) => {
    setCourseToDelete(course);
    setShowDeleteConfirm(true);
  };

  const confirmDeleteCourse = async () => {
    if (courseToDelete) {
      try {
        await onCourseDelete(courseToDelete.id);
        setShowDeleteConfirm(false);
        setCourseToDelete(null);
      } catch (error) {
        console.error('Error deleting course:', error);
      }
    }
  };

  const handleSaveCourse = async (courseData) => {
    try {
      if (selectedCourse) {
        // Update existing course
        await onCourseUpdate(selectedCourse.id, courseData);
      } else {
        // Create new course
        await onCourseCreate(collegeId, courseData);
      }
      setShowCourseModal(false);
      setSelectedCourse(null);
    } catch (error) {
      console.error('Error saving course:', error);
      throw error;
    }
  };

  const getCourseTypeColor = (type) => {
    switch (type) {
      case 'UG': return 'bg-blue-100 text-blue-800';
      case 'PG': return 'bg-purple-100 text-purple-800';
      case 'DIPLOMA': return 'bg-green-100 text-green-800';
      case 'FELLOWSHIP': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getLevelColor = (level) => {
    switch (level) {
      case 'MBBS': return 'bg-green-100 text-green-800';
      case 'MD': return 'bg-blue-100 text-blue-800';
      case 'MS': return 'bg-purple-100 text-purple-800';
      case 'BDS': return 'bg-teal-100 text-teal-800';
      case 'MDS': return 'bg-indigo-100 text-indigo-800';
      case 'DNB': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-red-100 text-red-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-4 course-management-section">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <BookOpen className="w-5 h-5 text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-900">Courses & Programs</h3>
          <span className="px-2 py-1 bg-gray-100 text-gray-600 text-sm rounded-full">
            {courses.length} course{courses.length !== 1 ? 's' : ''}
          </span>
        </div>
        <button
          onClick={handleAddCourse}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>Add Course</span>
        </button>
      </div>

      {/* Courses List */}
      {loading ? (
        <div className="text-center py-8 bg-gray-50 rounded-xl">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-3"></div>
          <p className="text-gray-600">Loading courses...</p>
        </div>
      ) : courses.length === 0 ? (
        <div className="text-center py-8 bg-gray-50 rounded-xl">
          <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <h4 className="text-lg font-medium text-gray-900 mb-2">No Courses Yet</h4>
          <p className="text-gray-600 mb-4">
            This college doesn't have any courses added yet. Add the first course to get started.
          </p>
          <button
            onClick={handleAddCourse}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2 mx-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Add First Course</span>
          </button>
        </div>
      ) : (
        <div className="grid gap-4">
          {courses.map((course) => (
            <div
              key={course.id}
              className="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  {/* Course Header */}
                  <div className="flex items-center space-x-3 mb-3">
                    <h4 className="text-lg font-semibold text-gray-900">
                      {course.name}
                    </h4>
                    <div className="flex space-x-2">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getCourseTypeColor(course.course_type)}`}>
                        {course.course_type}
                      </span>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getLevelColor(course.level)}`}>
                        {course.level}
                      </span>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(course.status)}`}>
                        {course.status}
                      </span>
                    </div>
                  </div>

                  {/* Course Details */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3">
                    {course.specialization && (
                      <div className="flex items-center space-x-2">
                        <Target className="w-4 h-4 text-gray-500" />
                        <span className="text-sm text-gray-600">
                          Area of Focus: {course.specialization}
                        </span>
                      </div>
                    )}
                    <div className="flex items-center space-x-2">
                      <Calendar className="w-4 h-4 text-gray-500" />
                      <span className="text-sm text-gray-600">
                        {course.duration} months
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Users className="w-4 h-4 text-gray-500" />
                      <span className="text-sm text-gray-600">
                        {course.total_seats} seats
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <GraduationCap className="w-4 h-4 text-gray-500" />
                      <span className="text-sm text-gray-600">
                        {course.entrance_exam}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center space-x-2 ml-4">
                  <button
                    onClick={() => handleEditCourse(course)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    title="Edit Course"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteCourse(course)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Delete Course"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Course Modal */}
      <CourseModal
        isOpen={showCourseModal}
        onClose={() => {
          setShowCourseModal(false);
          setSelectedCourse(null);
        }}
        course={selectedCourse}
        collegeName={collegeName}
        onSave={handleSaveCourse}
        onDelete={onCourseDelete}
      />

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && courseToDelete && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center w-12 h-12 rounded-full bg-red-100 mb-4">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Delete Course
              </h3>
              <p className="text-sm text-gray-600 mb-6">
                Are you sure you want to delete "{courseToDelete.name}" from {collegeName}? 
                This action cannot be undone.
              </p>
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDeleteCourse}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CourseManagement;
