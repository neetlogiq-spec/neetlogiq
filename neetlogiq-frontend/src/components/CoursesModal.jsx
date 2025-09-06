import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, GraduationCap, Clock, BookOpen } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import useScrollLock from '../hooks/useScrollLock';

const CoursesModal = ({ isOpen, onClose, college, courses, isLoading }) => {
  const { isDarkMode } = useTheme();
  
  // Lock body scroll when modal is open
  useScrollLock(isOpen);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        {/* Backdrop */}
        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
        
        {/* Modal Content */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          transition={{ type: "spring", damping: 30, stiffness: 400 }}
          className={`relative w-full max-w-4xl max-h-[90vh] overflow-hidden rounded-2xl shadow-2xl ${
            isDarkMode 
              ? 'bg-gray-800 border border-gray-700' 
              : 'bg-white border border-gray-200'
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className={`p-6 border-b ${
            isDarkMode ? 'border-gray-700' : 'border-gray-200'
          }`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                  isDarkMode ? 'bg-green-500/20' : 'bg-green-100'
                }`}>
                  <GraduationCap className={`w-6 h-6 ${
                    isDarkMode ? 'text-green-400' : 'text-green-600'
                  }`} />
                </div>
                <div>
                  <h2 className={`text-xl font-bold ${
                    isDarkMode ? 'text-white' : 'text-gray-900'
                  }`}>
                    {college?.name}
                  </h2>
                  <p className={`text-sm ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                    Available Courses
                  </p>
                </div>
              </div>
              
              <button
                onClick={onClose}
                className={`p-2 rounded-lg transition-colors ${
                  isDarkMode 
                    ? 'hover:bg-gray-700 text-gray-400' 
                    : 'hover:bg-gray-100 text-gray-600'
                }`}
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
                <span className={`ml-3 ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  Loading courses...
                </span>
              </div>
            ) : courses && courses.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {courses
                  .sort((a, b) => {
                    // Prioritize UG courses (MBBS and BDS) first
                    const courseA = (a.name || a.course_name || '').toUpperCase();
                    const courseB = (b.name || b.course_name || '').toUpperCase();
                    
                    // Check if course is UG (MBBS or BDS)
                    const isUGA = courseA.includes('MBBS') || courseA.includes('BDS');
                    const isUGB = courseB.includes('MBBS') || courseB.includes('BDS');
                    
                    // UG courses come first
                    if (isUGA && !isUGB) return -1;
                    if (!isUGA && isUGB) return 1;
                    
                    // Within same category, sort alphabetically
                    return courseA.localeCompare(courseB);
                  })
                  .map((course, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.03, duration: 0.2 }}
                    className={`p-4 rounded-xl border-2 backdrop-blur-md shadow-lg ${
                      isDarkMode 
                        ? 'bg-green-50/10 border-green-200/20 shadow-green-200/10' 
                        : 'bg-green-50/40 border-green-200/60 shadow-green-200/30'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h3 className={`text-lg font-semibold mb-2 ${
                          isDarkMode ? 'text-white' : 'text-gray-900'
                        }`}>
                          {course.name}
                        </h3>
                        
                        {course.specialization && (
                          <p className={`text-sm mb-2 ${
                            isDarkMode ? 'text-gray-300' : 'text-gray-600'
                          }`}>
                            {course.specialization}
                          </p>
                        )}
                      </div>
                      
                      <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                        isDarkMode 
                          ? 'bg-green-500/20 text-green-300' 
                          : 'bg-green-100 text-green-800'
                      }`}>
                        {course.total_seats || 0} seats
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      {course.level && (
                        <div className="flex items-center space-x-2">
                          <BookOpen className={`w-4 h-4 ${
                            isDarkMode ? 'text-gray-400' : 'text-gray-500'
                          }`} />
                          <span className={`text-sm ${
                            isDarkMode ? 'text-gray-300' : 'text-gray-600'
                          }`}>
                            {course.level}
                          </span>
                        </div>
                      )}
                      
                      {course.duration && (
                        <div className="flex items-center space-x-2">
                          <Clock className={`w-4 h-4 ${
                            isDarkMode ? 'text-gray-400' : 'text-gray-500'
                          }`} />
                          <span className={`text-sm ${
                            isDarkMode ? 'text-gray-300' : 'text-gray-600'
                          }`}>
                            {course.duration}
                          </span>
                        </div>
                      )}
                    </div>

                    {course.description && (
                      <p className={`text-sm mt-3 leading-relaxed ${
                        isDarkMode ? 'text-gray-300' : 'text-gray-600'
                      }`}>
                        {course.description}
                      </p>
                    )}
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 ${
                  isDarkMode ? 'bg-gray-700' : 'bg-gray-100'
                }`}>
                  <GraduationCap className={`w-8 h-8 ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-500'
                  }`} />
                </div>
                <h3 className={`text-lg font-semibold mb-2 ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}>
                  No Courses Available
                </h3>
                <p className={`text-sm ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  No course information is available for this college at the moment.
                </p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className={`p-6 border-t ${
            isDarkMode ? 'border-gray-700' : 'border-gray-200'
          }`}>
            <div className="flex justify-end">
              <button
                onClick={onClose}
                className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                  isDarkMode 
                    ? 'bg-gray-700 text-white hover:bg-gray-600' 
                    : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                }`}
              >
                Close
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default CoursesModal;
