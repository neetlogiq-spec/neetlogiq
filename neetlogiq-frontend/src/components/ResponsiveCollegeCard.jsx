import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Building2, 
  MapPin, 
  Calendar, 
  Users, 
  GraduationCap, 
  ChevronDown, 
  ChevronUp,
  ExternalLink,
  Star,
  Award
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';

const ResponsiveCollegeCard = ({ college, index }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const { isDarkMode } = useTheme();

  const getManagementBadgeColor = (management) => {
    switch (management?.toUpperCase()) {
      case 'GOVERNMENT':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
      case 'PRIVATE':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
      case 'DEEMED':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  const getCollegeTypeColor = (type) => {
    switch (type?.toUpperCase()) {
      case 'MEDICAL':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
      case 'DENTAL':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300';
      case 'AYUSH':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.1 }}
      className={`rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden ${
        isDarkMode 
          ? 'bg-gray-800 border border-gray-700' 
          : 'bg-white border border-gray-200'
      }`}
    >
      {/* Main Card Content */}
      <div className="p-4 sm:p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1 min-w-0">
            <h3 className={`text-lg sm:text-xl font-bold mb-2 line-clamp-2 ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>
              {college.name}
            </h3>
            
            {/* Location */}
            <div className="flex items-center text-sm text-gray-600 dark:text-gray-400 mb-2">
              <MapPin className="w-4 h-4 mr-1 flex-shrink-0" />
              <span className="truncate">
                {college.city}, {college.state}
              </span>
            </div>
          </div>

          {/* Expand/Collapse Button */}
          <motion.button
            onClick={() => setIsExpanded(!isExpanded)}
            className={`ml-3 p-2 rounded-lg transition-colors ${
              isDarkMode 
                ? 'hover:bg-gray-700 text-gray-400' 
                : 'hover:bg-gray-100 text-gray-600'
            }`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {isExpanded ? (
              <ChevronUp className="w-5 h-5" />
            ) : (
              <ChevronDown className="w-5 h-5" />
            )}
          </motion.button>
        </div>

        {/* Badges */}
        <div className="flex flex-wrap gap-2 mb-4">
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getManagementBadgeColor(college.management_type)}`}>
            {college.management_type || 'N/A'}
          </span>
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getCollegeTypeColor(college.college_type)}`}>
            {college.college_type || 'N/A'}
          </span>
        </div>

        {/* Key Info Grid */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          {/* Establishment Year */}
          <div className={`p-3 rounded-lg ${
            isDarkMode ? 'bg-gray-700' : 'bg-gray-50'
          }`}>
            <div className="flex items-center mb-1">
              <Calendar className="w-4 h-4 text-gray-500 mr-2" />
              <span className="text-xs font-medium text-gray-600 dark:text-gray-400">Established</span>
            </div>
            <p className={`text-sm font-semibold ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>
              {college.establishment_year || 'N/A'}
            </p>
          </div>

          {/* Total Seats */}
          <div className={`p-3 rounded-lg ${
            isDarkMode ? 'bg-gray-700' : 'bg-gray-50'
          }`}>
            <div className="flex items-center mb-1">
              <Users className="w-4 h-4 text-gray-500 mr-2" />
              <span className="text-xs font-medium text-gray-600 dark:text-gray-400">Total Seats</span>
            </div>
            <p className={`text-sm font-semibold ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>
              {college.total_seats || 'N/A'}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-2">
          <Link
            to={`/colleges/${college.id}`}
            className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 py-2 rounded-lg text-center font-medium hover:from-blue-600 hover:to-purple-700 transition-all duration-200 flex items-center justify-center"
          >
            <GraduationCap className="w-4 h-4 mr-2" />
            View Details
          </Link>
          
          <Link
            to={`/colleges/${college.id}/courses`}
            className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 text-white px-4 py-2 rounded-lg text-center font-medium hover:from-green-600 hover:to-emerald-700 transition-all duration-200 flex items-center justify-center"
          >
            <ExternalLink className="w-4 h-4 mr-2" />
            View Courses
          </Link>
        </div>
      </div>

      {/* Expanded Content */}
      <motion.div
        initial={false}
        animate={{ height: isExpanded ? 'auto' : 0 }}
        transition={{ duration: 0.3 }}
        className="overflow-hidden"
      >
        <div className={`px-4 sm:px-6 pb-4 sm:pb-6 border-t ${
          isDarkMode ? 'border-gray-700' : 'border-gray-200'
        }`}>
          {/* Additional Information */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
            {/* College Code */}
            {college.code && (
              <div className={`p-3 rounded-lg ${
                isDarkMode ? 'bg-gray-700' : 'bg-gray-50'
              }`}>
                <div className="flex items-center mb-1">
                  <Building2 className="w-4 h-4 text-gray-500 mr-2" />
                  <span className="text-xs font-medium text-gray-600 dark:text-gray-400">College Code</span>
                </div>
                <p className={`text-sm font-semibold ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}>
                  {college.code}
                </p>
              </div>
            )}

            {/* Ranking (if available) */}
            {college.rank && (
              <div className={`p-3 rounded-lg ${
                isDarkMode ? 'bg-gray-700' : 'bg-gray-50'
              }`}>
                <div className="flex items-center mb-1">
                  <Award className="w-4 h-4 text-gray-500 mr-2" />
                  <span className="text-xs font-medium text-gray-600 dark:text-gray-400">Ranking</span>
                </div>
                <p className={`text-sm font-semibold ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}>
                  #{college.rank}
                </p>
              </div>
            )}
          </div>

          {/* Description or Additional Notes */}
          {college.description && (
            <div className="mt-4">
              <p className={`text-sm leading-relaxed ${
                isDarkMode ? 'text-gray-300' : 'text-gray-600'
              }`}>
                {college.description}
              </p>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};

export default ResponsiveCollegeCard;
