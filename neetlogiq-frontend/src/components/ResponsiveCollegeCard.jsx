import React, { useState, memo, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  MapPin, 
  Users, 
  GraduationCap
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import CollegeDetailsModal from './CollegeDetailsModal';

const ResponsiveCollegeCard = ({ 
  college, 
  index, 
  courses = [], 
  onFetchCourses 
}) => {
  const { isDarkMode } = useTheme();
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

  // Debug modal state changes
  useEffect(() => {
    console.log('🔍 Modal state changed:', { isDetailsModalOpen, college: college?.name });
  }, [isDetailsModalOpen, college?.name]);


  const getCollegeTypeColor = (type) => {
    switch (type?.toUpperCase()) {
      case 'MEDICAL':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
      case 'DENTAL':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300';
      case 'DNB':
        return 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300';
      case 'AYUSH':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.15, delay: index * 0.03 }}
        className={`h-full flex flex-col rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden backdrop-blur-md border-2 ${
          isDarkMode 
            ? 'bg-green-50/10 border-green-200/20 shadow-green-200/10' 
            : 'bg-green-50/40 border-green-200/60 shadow-green-200/30'
        }`}
      >
      {/* Main Card Content */}
      <div className="p-4 sm:p-6 flex flex-col flex-1">
        {/* Header */}
        <div className="mb-4">
          <h3 className={`text-lg sm:text-xl font-bold mb-3 line-clamp-2 text-center ${
            isDarkMode ? 'text-white' : 'text-gray-900'
          }`}>
            {college.name}
          </h3>
          
          {/* College Type - Centered */}
          <div className="text-center mb-3">
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getCollegeTypeColor(college.college_type)}`}>
              {college.college_type || 'N/A'}
            </span>
          </div>
        </div>

        {/* Key Info Grid */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          {/* State */}
          <div className={`p-3 rounded-lg ${
            isDarkMode ? 'bg-gray-700' : 'bg-gray-50'
          }`}>
            <div className="flex items-center justify-center mb-1">
              <MapPin className="w-4 h-4 text-gray-500 mr-2" />
              <span className="text-xs font-medium text-gray-600 dark:text-gray-400">State</span>
            </div>
            <p className={`text-sm font-semibold text-center ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>
              {(college.state || 'N/A').trim()}
            </p>
          </div>

          {/* Management */}
          <div className={`p-3 rounded-lg ${
            isDarkMode ? 'bg-gray-700' : 'bg-gray-50'
          }`}>
            <div className="flex items-center justify-center mb-1">
              <Users className="w-4 h-4 text-gray-500 mr-2" />
              <span className="text-xs font-medium text-gray-600 dark:text-gray-400">Management</span>
            </div>
            <p className={`text-sm font-semibold text-center ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>
              {(college.management_type || 'N/A').trim()}
            </p>
          </div>
        </div>

        {/* Action Button */}
        <div className="mt-auto">
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              console.log('🔍 Button clicked, opening modal for college:', college.name);
              setIsDetailsModalOpen(true);
              if (onFetchCourses) {
                console.log('🔍 Fetching courses for college:', college.id);
                onFetchCourses();
              }
            }}
            className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 py-2 rounded-lg text-center font-medium hover:from-blue-600 hover:to-purple-700 transition-all duration-200 flex items-center justify-center"
          >
            <GraduationCap className="w-4 h-4 mr-2" />
            View Details & Courses
          </button>
        </div>
      </div>
      </motion.div>

      {/* College Details Modal */}
      <CollegeDetailsModal
        isOpen={isDetailsModalOpen}
        onClose={() => setIsDetailsModalOpen(false)}
        college={college}
        courses={courses}
        isLoading={false}
      />
    </>
  );
};

export default memo(ResponsiveCollegeCard);
