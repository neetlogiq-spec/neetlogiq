import React, { useState, useEffect } from 'react';
import { 
  BookOpen, 
  Calendar, 
  GraduationCap, 
  Users, 
  Target, 
  AlertTriangle,
  CheckCircle,
  XCircle
} from 'lucide-react';

const CourseModal = ({ 
  isOpen, 
  onClose, 
  course = null, 
  collegeName = '', 
  onSave, 
  onDelete 
}) => {
  const [formData, setFormData] = useState({
    name: '',
    normalized_name: '',
    course_type: 'UG',
    level: 'MBBS',
    specialization: '',
    duration: 60,
    entrance_exam: 'NEET',
    total_seats: 0,
    status: 'active'
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Course type options
  const courseTypes = [
    { value: 'UG', label: 'Undergraduate' },
    { value: 'PG', label: 'Postgraduate' },
    { value: 'DIPLOMA', label: 'Diploma' },
    { value: 'FELLOWSHIP', label: 'Fellowship' }
  ];

  // Level options
  const levelOptions = [
    { value: 'MBBS', label: 'MBBS' },
    { value: 'MD', label: 'MD' },
    { value: 'MS', label: 'MS' },
    { value: 'DM', label: 'DM' },
    { value: 'MCh', label: 'MCh' },
    { value: 'BDS', label: 'BDS' },
    { value: 'MDS', label: 'MDS' },
    { value: 'DNB', label: 'DNB' },
    { value: 'OTHER', label: 'Other' }
  ];

  // Entrance exam options
  const entranceExams = [
    { value: 'NEET', label: 'NEET' },
    { value: 'NEET-PG', label: 'NEET-PG' },
    { value: 'NEET-SS', label: 'NEET-SS' },
    { value: 'AIIMS', label: 'AIIMS' },
    { value: 'JIPMER', label: 'JIPMER' },
    { value: 'OTHER', label: 'Other' }
  ];

  // Status options
  const statusOptions = [
    { value: 'active', label: 'Active' },
    { value: 'inactive', label: 'Inactive' },
    { value: 'pending', label: 'Pending' }
  ];

  useEffect(() => {
    if (course) {
      setFormData({
        name: course.name || '',
        normalized_name: course.normalized_name || '',
        course_type: course.course_type || 'UG',
        level: course.level || 'MBBS',
        specialization: course.specialization || '',
        duration: course.duration || 60,
        entrance_exam: course.entrance_exam || 'NEET',
        total_seats: course.total_seats || 0,
        status: course.status || 'active'
      });
    } else {
      // Reset form for new course
      setFormData({
        name: '',
        normalized_name: '',
        course_type: 'UG',
        level: 'MBBS',
        specialization: '',
        duration: 60,
        entrance_exam: 'NEET',
        total_seats: 0,
        status: 'active'
      });
    }
    setErrors({});
    setShowDeleteConfirm(false);
  }, [course]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Degree program is required';
    }

    if (formData.total_seats < 0) {
      newErrors.total_seats = 'Total seats cannot be negative';
    }

    if (formData.duration <= 0) {
      newErrors.duration = 'Duration must be greater than 0';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    const action = course ? 'UPDATE' : 'CREATE';
    const courseName = course ? course.name : formData.name;
    
    if (!confirm(`💾 ${action} COURSE CONFIRMATION\n\nYou are about to ${action.toLowerCase()} course:\n"${courseName}"\n\nCollege: ${collegeName}\n\nThis will ${course ? 'modify existing data' : 'add new data'} in the database.\n\nDo you want to proceed?`)) {
      return;
    }

    setIsSubmitting(true);
    try {
      await onSave(formData);
      onClose();
    } catch (error) {
      console.error('Error saving course:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!course) return;

    if (!confirm(`🚨 DELETE COURSE WARNING\n\nYou are about to permanently delete:\n"${course.name}"\n\nCollege: ${collegeName}\n\nThis action CANNOT be undone and will:\n- Remove all course data\n- Delete associated cutoff records\n- Impact student searches\n\nAre you absolutely sure?`)) {
      return;
    }

    if (!confirm(`🔒 FINAL CONFIRMATION\n\nThis is your LAST CHANCE to cancel.\n\nCourse "${course.name}" will be PERMANENTLY DELETED.\n\nType confirmation: Click OK to DELETE FOREVER or Cancel to abort.`)) {
      return;
    }

    try {
      await onDelete(course.id);
      onClose();
    } catch (error) {
      console.error('Error deleting course:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? parseInt(value) || 0 : value
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <BookOpen className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                {course ? 'Edit Course' : 'Add New Course'}
              </h2>
              <p className="text-sm text-gray-600">
                {collegeName && `College: ${collegeName}`}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <XCircle className="w-6 h-6 text-gray-500" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Degree Program */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Degree Program *
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                errors.name ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="e.g., MBBS, MD General Medicine, BDS"
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-600 flex items-center">
                <AlertTriangle className="w-4 h-4 mr-1" />
                {errors.name}
              </p>
            )}
          </div>

          {/* Course Type and Level */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Course Type
              </label>
              <select
                name="course_type"
                value={formData.course_type}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {courseTypes.map(type => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Level
              </label>
              <select
                name="level"
                value={formData.level}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {levelOptions.map(level => (
                  <option key={level.value} value={level.value}>
                    {level.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Area of Focus */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Area of Focus
            </label>
            <input
              type="text"
              name="specialization"
              value={formData.specialization}
              onChange={handleInputChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="e.g., General Medicine, Surgery, Pediatrics"
            />
          </div>

          {/* Duration and Seats */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Duration (months)
              </label>
              <input
                type="number"
                name="duration"
                value={formData.duration}
                onChange={handleInputChange}
                min="1"
                className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.duration ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="60"
              />
              {errors.duration && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertTriangle className="w-4 h-4 mr-1" />
                  {errors.duration}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Total Seats
              </label>
              <input
                type="number"
                name="total_seats"
                value={formData.total_seats}
                onChange={handleInputChange}
                min="0"
                className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.total_seats ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="150"
              />
              {errors.total_seats && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertTriangle className="w-4 h-4 mr-1" />
                  {errors.total_seats}
                </p>
              )}
            </div>
          </div>

          {/* Entrance Exam and Status */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Entrance Exam
              </label>
              <select
                name="entrance_exam"
                value={formData.entrance_exam}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {entranceExams.map(exam => (
                  <option key={exam.value} value={exam.value}>
                    {exam.value}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {statusOptions.map(status => (
                  <option key={status.value} value={status.value}>
                    {status.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between pt-6 border-t border-gray-200">
            <div className="flex space-x-3">
              {course && (
                <button
                  type="button"
                  onClick={() => setShowDeleteConfirm(true)}
                  className="px-6 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors flex items-center space-x-2"
                >
                  <XCircle className="w-5 h-5" />
                  <span>Delete Course</span>
                </button>
              )}
            </div>

            <div className="flex space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-5 h-5" />
                    <span>{course ? 'Update Course' : 'Create Course'}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>

        {/* Delete Confirmation Modal */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-60 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
              <div className="text-center">
                <div className="mx-auto flex items-center justify-center w-12 h-12 rounded-full bg-red-100 mb-4">
                  <AlertTriangle className="w-6 h-6 text-red-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Delete Course
                </h3>
                <p className="text-sm text-gray-600 mb-6">
                  Are you sure you want to delete "{course?.name}"? This action cannot be undone.
                </p>
                <div className="flex space-x-3">
                  <button
                    onClick={() => setShowDeleteConfirm(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDelete}
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
    </div>
  );
};

export default CourseModal;
