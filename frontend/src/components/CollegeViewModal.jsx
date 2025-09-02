import React, { useState, useEffect } from 'react';
import { 
  X, 
  Building2, 
  MapPin, 
  Calendar, 
  GraduationCap,
  Users,
  BookOpen,
  Award,
  Star,
  TrendingUp,
  Shield,
  ExternalLink
} from 'lucide-react';
import CourseManagement from './CourseManagement';

const CollegeViewModal = ({ isOpen, onClose, college = null }) => {
  const [courses, setCourses] = useState([]);
  const [loadingCourses, setLoadingCourses] = useState(false);
  const [cutoffs, setCutoffs] = useState([]);
  const [loadingCutoffs, setLoadingCutoffs] = useState(false);

  // Fetch courses when modal opens
  useEffect(() => {
    if (isOpen && college?.id) {
      fetchCourses();
      fetchCutoffs();
    }
  }, [isOpen, college?.id]);

  const fetchCourses = async () => {
    try {
      setLoadingCourses(true);
      const credentials = btoa('Lone_wolf#12:Apx_gp_delta');
      const response = await fetch(`/api/sector_xp_12/colleges/${college.id}/courses`, {
        headers: {
          'Authorization': `Basic ${credentials}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setCourses(data.data?.programs || []);
      } else {
        console.error('Failed to fetch courses for college:', college.id);
        setCourses([]);
      }
    } catch (error) {
      console.error('Error fetching courses:', error);
      setCourses([]);
    } finally {
      setLoadingCourses(false);
    }
  };

  const fetchCutoffs = async () => {
    try {
      setLoadingCutoffs(true);
      const credentials = btoa('Lone_wolf#12:Apx_gp_delta');
      const response = await fetch(`/api/sector_xp_12/colleges/${college.id}/cutoffs`, {
        headers: {
          'Authorization': `Basic ${credentials}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setCutoffs(data.data || []);
      } else {
        console.error('Failed to fetch cutoffs for college:', college.id);
        setCutoffs([]);
      }
    } catch (error) {
      console.error('Error fetching cutoffs:', error);
      setCutoffs([]);
    } finally {
      setLoadingCutoffs(false);
    }
  };

  if (!isOpen || !college) return null;

  const getStatusColor = (status) => {
    const colors = {
      active: 'text-green-700 bg-green-100',
      inactive: 'text-red-700 bg-red-100',
      pending: 'text-yellow-700 bg-yellow-100'
    };
    return colors[status] || 'text-gray-700 bg-gray-100';
  };

  const getManagementColor = (management) => {
    const colors = {
      GOVERNMENT: 'text-blue-700 bg-blue-100',
      PRIVATE: 'text-purple-700 bg-purple-100',
      DEEMED: 'text-indigo-700 bg-indigo-100',
      CENTRAL: 'text-cyan-700 bg-cyan-100',
      STATE: 'text-emerald-700 bg-emerald-100'
    };
    return colors[management] || 'text-gray-700 bg-gray-100';
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        {/* Backdrop */}
        <div 
          className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75 backdrop-blur-sm"
          onClick={onClose}
        ></div>

        {/* Modal - Made more responsive and contained */}
        <div className="inline-block align-bottom bg-white/90 backdrop-blur-xl rounded-3xl text-left overflow-hidden shadow-2xl transform transition-all sm:my-8 sm:align-middle sm:max-w-6xl sm:w-full max-w-[95vw] border border-white/50">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600/20 via-purple-600/20 to-pink-600/20 px-4 sm:px-6 py-4 border-b border-white/20">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 sm:space-x-3 min-w-0 flex-1">
                <button
                  onClick={onClose}
                  className="mr-2 sm:mr-3 p-2 text-gray-600 hover:text-gray-800 hover:bg-white/20 rounded-xl transition-colors duration-200 flex-shrink-0"
                  title="Back to Colleges"
                >
                  <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center flex-shrink-0">
                  <Building2 className="w-5 h-5 sm:w-7 sm:h-7 text-white" />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="text-lg sm:text-xl font-bold text-gray-900 truncate">College Details</h3>
                  <p className="text-xs sm:text-sm text-gray-600 truncate">
                    <span className="text-blue-600 hover:text-blue-800 cursor-pointer" onClick={onClose}>
                      Colleges Management
                    </span>
                    <span className="mx-2 text-gray-400">→</span>
                    <span className="truncate">{college.name}</span>
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 transition-colors duration-200 p-2 hover:bg-gray-100 rounded-xl flex-shrink-0 ml-2"
              >
                <X className="w-5 h-5 sm:w-6 sm:h-6" />
              </button>
            </div>
          </div>

          {/* Content - Better overflow handling */}
          <div className="px-4 sm:px-6 py-6 max-h-[70vh] overflow-y-auto">
            {/* College Header */}
            <div className="mb-6 sm:mb-8">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-4 space-y-3 sm:space-y-0">
                <div className="flex-1 min-w-0">
                  <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2 leading-tight break-words">
                    {college.name}
                  </h1>
                  <div className="flex items-center space-x-2 text-base sm:text-lg text-gray-600 mb-4">
                    <MapPin className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 flex-shrink-0" />
                    <span className="truncate">{college.city}, {college.state}</span>
                  </div>
                </div>
                <div className="flex flex-col items-start sm:items-end space-y-2">
                  <span className={`px-3 sm:px-4 py-2 rounded-full text-xs sm:text-sm font-medium ${getStatusColor(college.status)}`}>
                    {college.status?.toUpperCase()}
                  </span>
                  <span className={`px-3 sm:px-4 py-2 rounded-full text-xs sm:text-sm font-medium ${getManagementColor(college.management_type)}`}>
                    {college.management_type}
                  </span>
                </div>
              </div>

              {/* Basic Info Cards - Better responsive grid */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-3 sm:p-4 rounded-2xl border border-blue-200">
                  <div className="flex items-center justify-between mb-2">
                    <GraduationCap className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600" />
                    <span className="text-xs text-blue-600 font-medium">TYPE</span>
                  </div>
                  <div className="text-sm sm:text-lg font-bold text-blue-900 truncate">{college.college_type}</div>
                  <div className="text-xs text-blue-600">College Type</div>
                </div>

                <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 p-3 sm:p-4 rounded-2xl border border-emerald-200">
                  <div className="flex items-center justify-between mb-2">
                    <BookOpen className="w-6 h-6 sm:w-8 sm:h-8 text-emerald-600" />
                    <span className="text-xs text-emerald-600 font-medium">PROGRAMS</span>
                  </div>
                  <div className="text-sm sm:text-lg font-bold text-emerald-900">{college.total_programs || 0}</div>
                  <div className="text-xs text-emerald-600">Available Courses</div>
                </div>

                <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-3 sm:p-4 rounded-2xl border border-purple-200">
                  <div className="flex items-center justify-between mb-2">
                    <TrendingUp className="w-6 h-6 sm:w-8 sm:h-8 text-purple-600" />
                    <span className="text-xs text-purple-600 font-medium">CUTOFFS</span>
                  </div>
                  <div className="text-sm sm:text-lg font-bold text-purple-900">{cutoffs.length}</div>
                  <div className="text-xs text-purple-600">Cutoff Records</div>
                </div>

                <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-3 sm:p-4 rounded-2xl border border-orange-200">
                  <div className="flex items-center justify-between mb-2">
                    <Calendar className="w-6 h-6 sm:w-8 sm:h-8 text-orange-600" />
                    <span className="text-xs text-orange-600 font-medium">ESTABLISHED</span>
                  </div>
                  <div className="text-sm sm:text-lg font-bold text-orange-900">{college.establishment_year || 'N/A'}</div>
                  <div className="text-xs text-orange-600">Year Founded</div>
                </div>
              </div>
            </div>

            {/* Detailed Information - Better responsive layout */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6">
              {/* Left Column */}
              <div className="space-y-4 sm:space-y-6">
                {/* Basic Information */}
                <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-4 sm:p-6 border border-white/50 shadow-lg">
                  <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-4 flex items-center">
                    <Building2 className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-blue-600" />
                    Basic Information
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600 text-sm sm:text-base">College ID:</span>
                      <span className="font-medium text-gray-900 text-sm sm:text-base">#{college.id}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 text-sm sm:text-base">College Type:</span>
                      <span className="font-medium text-gray-900 text-sm sm:text-base truncate">{college.college_type}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 text-sm sm:text-base">Management:</span>
                      <span className="font-medium text-gray-900 text-sm sm:text-base truncate">{college.management_type}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 text-sm sm:text-base">Status:</span>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(college.status)}`}>
                        {college.status?.toUpperCase()}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Location Information */}
                <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-4 sm:p-6 border border-white/50 shadow-lg">
                  <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-4 flex items-center">
                    <MapPin className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-red-600" />
                    Location Details
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600 text-sm sm:text-base">City:</span>
                      <span className="font-medium text-gray-900 text-sm sm:text-base truncate">{college.city}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 text-sm sm:text-base">State:</span>
                      <span className="font-medium text-gray-900 text-sm sm:text-base truncate">{college.state}</span>
                    </div>
                    {college.university && (
                      <div className="flex justify-between">
                        <span className="text-gray-600 text-sm sm:text-base">University:</span>
                        <span className="font-medium text-gray-900 text-sm sm:text-base truncate">{college.university}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Right Column */}
              <div className="space-y-4 sm:space-y-6">
                {/* Academic Information */}
                <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-4 sm:p-6 border border-white/50 shadow-lg">
                  <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-4 flex items-center">
                    <BookOpen className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-green-600" />
                    Academic Details
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600 text-sm sm:text-base">Total Programs:</span>
                      <span className="font-medium text-gray-900 text-sm sm:text-base">{college.total_programs || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 text-sm sm:text-base">Cutoff Records:</span>
                      <span className="font-medium text-gray-900 text-sm sm:text-base">{college.total_cutoffs || 0}</span>
                    </div>
                    {college.total_seats && (
                      <div className="flex justify-between">
                        <span className="text-gray-600 text-sm sm:text-base">Total Seats:</span>
                        <span className="font-medium text-gray-900 text-sm sm:text-base">{college.total_seats}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-gray-600 text-sm sm:text-base">Establishment Year:</span>
                      <span className="font-medium text-gray-900 text-sm sm:text-base">{college.establishment_year || 'Not specified'}</span>
                    </div>
                  </div>
                </div>

                {/* Course Management */}
                <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-4 sm:p-6 border border-white/50 shadow-lg">
                  <CourseManagement
                    collegeId={college.id}
                    collegeName={college.name}
                    courses={courses}
                    loading={loadingCourses}
                    onCourseUpdate={async (courseId, courseData) => {
                      try {
                        const response = await fetch(`/api/sector_xp_12/courses/${courseId}`, {
                          method: 'PUT',
                          headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Basic ${btoa('Lone_wolf#12:Apx_gp_delta')}`
                          },
                          body: JSON.stringify(courseData)
                        });
                        
                        if (!response.ok) {
                          throw new Error('Failed to update course');
                        }
                        
                        // Refresh the college data to show updated courses
                        window.location.reload();
                      } catch (error) {
                        console.error('Error updating course:', error);
                        alert(`Failed to update course: ${error.message}`);
                      }
                    }}
                    onCourseDelete={async (courseId) => {
                      try {
                        const response = await fetch(`/api/sector_xp_12/courses/${courseId}`, {
                          method: 'DELETE',
                          headers: {
                            'Authorization': `Basic ${btoa('Lone_wolf#12:Apx_gp_delta')}`
                          }
                        });
                        
                        if (!response.ok) {
                          throw new Error('Failed to delete course');
                        }
                        
                        // Refresh the college data to show updated courses
                        window.location.reload();
                      } catch (error) {
                        console.error('Error deleting course:', error);
                        alert(`Failed to delete course: ${error.message}`);
                      }
                    }}
                    onCourseCreate={async (collegeId, courseData) => {
                      try {
                        const response = await fetch(`/api/sector_xp_12/colleges/${collegeId}/courses`, {
                          method: 'POST',
                          headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Basic ${btoa('Lone_wolf#12:Apx_gp_delta')}`
                          },
                          body: JSON.stringify(courseData)
                        });
                        
                        if (!response.ok) {
                          throw new Error('Failed to create course');
                        }
                        
                        // Refresh the college data to show updated courses
                        window.location.reload();
                      } catch (error) {
                        console.error('Error creating course:', error);
                        alert(`Failed to create course: ${error.message}`);
                      }
                    }}
                  />
                </div>

                {/* Quick Actions - Now with working functionality */}
                <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-4 sm:p-6 border border-white/50 shadow-lg">
                  <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-4 flex items-center">
                    <Star className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-yellow-600" />
                    Quick Actions
                  </h3>
                  <div className="space-y-3">
                    <button 
                      onClick={() => {
                        // Scroll to course management section
                        const courseSection = document.querySelector('.course-management-section');
                        if (courseSection) {
                          courseSection.scrollIntoView({ behavior: 'smooth' });
                        }
                      }}
                      className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-300 shadow-lg hover:shadow-xl"
                    >
                      <BookOpen className="w-4 h-4" />
                      <span>View Programs</span>
                    </button>
                    <button 
                      onClick={() => {
                        // Show cutoffs in a modal or expand cutoffs section
                        alert('Cutoff data will be displayed here. Feature coming soon!');
                      }}
                      className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white rounded-xl hover:from-emerald-700 hover:to-emerald-800 transition-all duration-300 shadow-lg hover:shadow-xl"
                    >
                      <TrendingUp className="w-4 h-4" />
                      <span>View Cutoffs</span>
                    </button>
                    <button 
                      onClick={() => {
                        // Try to open website if available, otherwise show message
                        if (college.website) {
                          window.open(college.website, '_blank');
                        } else {
                          alert('Website information not available for this college.');
                        }
                      }}
                      className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-xl hover:from-purple-700 hover:to-purple-800 transition-all duration-300 shadow-lg hover:shadow-xl"
                    >
                      <ExternalLink className="w-4 h-4" />
                      <span>Visit Website</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="px-4 sm:px-6 py-4 border-t border-gray-200 bg-gray-50/50">
            <div className="flex items-center justify-end">
              <button
                onClick={onClose}
                className="px-4 sm:px-6 py-2 sm:py-3 text-gray-700 bg-white hover:bg-gray-50 border border-gray-300 rounded-xl transition-colors duration-200 text-sm sm:text-base"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CollegeViewModal;
