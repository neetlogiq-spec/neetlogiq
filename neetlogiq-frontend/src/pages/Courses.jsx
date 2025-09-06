// AI-Generated React Page Template
// Generated for: Courses
// Template: react-page
// Date: 2025-08-28

import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { BookOpen, GraduationCap, Search } from 'lucide-react';
import { Link } from 'react-router-dom';
import UnifiedSearchBar from '../components/UnifiedSearchBar';
import BackToTopButton from '../components/BackToTopButton';
import GoogleSignIn from '../components/GoogleSignIn';
import UserPopup from '../components/UserPopup';
import BlurredOverlay from '../components/BlurredOverlay';
import ResponsiveHeader from '../components/ResponsiveHeader';
import CourseCollegesModal from '../components/CourseCollegesModal';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Vortex } from '../components/ui/vortex';
import { LightVortex } from '../components/ui/LightVortex';
import ThemeToggle from '../components/ThemeToggle';
import apiService from '../services/apiService';
import cacheService from '../services/cacheService';

const Courses = () => {
  const [isLoaded, setIsLoaded] = useState(false);
  const { isAuthenticated } = useAuth();
  const { isDarkMode } = useTheme();

  const [selectedStream, setSelectedStream] = useState('all');
  const [courses, setCourses] = useState([]);
  const [filteredCourses, setFilteredCourses] = useState([]);
  const [colleges, setColleges] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [isCollegesModalOpen, setIsCollegesModalOpen] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 24,
    totalPages: 1,
    totalItems: 0
  });


  useEffect(() => {
    const timer = setTimeout(() => {
        setIsLoaded(true);
    }, 200);
    return () => clearTimeout(timer);
  }, []);

  // Load courses from backend with chunked loading
  const loadCourses = useCallback(async (newFilters = {}, newPage = 1, isAppend = false) => {
    try {
      setIsLoading(true);
      console.log('🔍 Loading courses with filters:', newFilters, 'page:', newPage, 'append:', isAppend);
      
      // Use smaller chunks for better performance
      const chunkSize = 12; // Load 12 courses at a time
      
      // Use cache service for better performance
      const response = await cacheService.cacheApiCall(
        () => apiService.getCourses(newFilters, newPage, chunkSize),
        'courses',
        { filters: JSON.stringify(newFilters), page: newPage, limit: chunkSize },
        5 * 60 * 1000 // 5 minutes cache
      );
      
      console.log('🔍 Chunked loading complete:', {
        page: newPage,
        totalCourses: response.data?.length || 0,
        pagination: response.pagination
      });
      
      // Filter out courses with 0 total seats
      const validCourses = (response.data || []).filter(course => course.total_seats > 0);
      
      // Append or replace data based on isAppend flag
      if (isAppend && newPage > 1) {
        setCourses(prevCourses => [...prevCourses, ...validCourses]);
        setFilteredCourses(prevCourses => [...prevCourses, ...validCourses]);
      } else {
        setCourses(validCourses);
        setFilteredCourses(validCourses);
      }
      
      setPagination({
        page: newPage,
        limit: chunkSize,
        totalPages: response.pagination?.totalPages || 1,
        totalItems: response.pagination?.totalItems || validCourses.length
      });
    } catch (error) {
      console.error('Failed to load courses:', error);
      if (!isAppend) {
        setCourses([]);
        setFilteredCourses([]);
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Backend integration - only load on initial mount with proper pagination
  useEffect(() => {
    const initialLoad = async () => {
      try {
        setIsLoading(true);
        console.log('🔍 Initial loading with proper pagination');
        
        // Load colleges data for search engine
        const collegesPromise = fetch(`${process.env.REACT_APP_API_URL || 'https://neetlogiq-backend.neetlogiq.workers.dev'}/api/colleges?limit=100`)
          .then(response => response.json())
          .then(data => {
            console.log('🏫 Loaded colleges for search:', data.data?.length || 0);
            setColleges(data.data || []);
            return data;
          })
          .catch(error => {
            console.error('Failed to load colleges:', error);
            return { data: [] };
          });

        // Load first page of courses with proper pagination
        const coursesPromise = fetch(`${process.env.REACT_APP_API_URL || 'https://neetlogiq-backend.neetlogiq.workers.dev'}/api/courses?page=1&limit=24`)
          .then(response => response.json())
          .then(data => {
            console.log('📚 Loaded courses:', data.data?.length || 0);
            // Filter out courses with 0 total seats
            const validCourses = (data.data || []).filter(course => course.total_seats > 0);
            console.log('📚 Valid courses after filtering:', validCourses.length);
            return { ...data, data: validCourses };
          })
          .catch(error => {
            console.error('Failed to load courses:', error);
            return { data: [], pagination: { totalItems: 0, totalPages: 1 } };
          });

        // Load both courses and colleges in parallel
        const [, coursesData] = await Promise.all([
          collegesPromise,
          coursesPromise
        ]);
        
        console.log('🔍 Initial loading complete:', {
          totalCourses: coursesData.data?.length || 0,
          pagination: coursesData.pagination
        });
        
        setCourses(coursesData.data || []);
        setFilteredCourses(coursesData.data || []);
        setPagination({
          page: 1,
          limit: 24,
          totalPages: coursesData.pagination?.totalPages || 1,
          totalItems: coursesData.data?.length || 0 // Use filtered count
        });
      } catch (error) {
        console.error('Failed to load courses:', error);
        setCourses([]);
        setFilteredCourses([]);
      } finally {
        setIsLoading(false);
      }
    };
    
    initialLoad();
  }, []); // Empty dependency array - only run on mount

  // Load more courses function for infinite scroll
  const loadMoreCourses = useCallback(() => {
    if (isLoading || !pagination.hasNext) return;
    
    const nextPage = Math.floor(courses.length / 12) + 1;
    console.log('🔄 Loading more courses, page:', nextPage);
    loadCourses({}, nextPage, true); // Append mode
  }, [isLoading, pagination.hasNext, courses.length, loadCourses]);

  // Infinite scroll handler
  const handleScroll = useCallback(() => {
    if (isLoading || !pagination.hasNext) return;
    
    const { scrollTop, scrollHeight, clientHeight } = document.documentElement;
    const scrollPercentage = (scrollTop + clientHeight) / scrollHeight;
    
    // Load more when user scrolls to 70% of the page
    if (scrollPercentage > 0.7) {
      console.log('🔄 Infinite scroll triggered for courses, loading next chunk...');
      loadMoreCourses();
    }
  }, [isLoading, pagination.hasNext, loadMoreCourses]);

  // Add scroll listener for infinite scroll
  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  // Update filtered courses when courses change (but not during search)
  useEffect(() => {
    // Only update filteredCourses if we're not in the middle of a search
    // This prevents overriding search results
    console.log('🔍 useEffect triggered - courses:', courses.length, 'filteredCourses:', filteredCourses.length);
    if (courses.length > 0 && filteredCourses.length === 0) {
      console.log('🔍 Updating filteredCourses from courses:', courses.length);
      setFilteredCourses(courses);
    }
  }, [courses, filteredCourses.length]);



  const handleStreamChange = (stream) => {
    setSelectedStream(stream);
    loadCourses({ stream: stream }, 1);
    // Scroll to top when changing stream
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePageChange = (newPage) => {
    // Preserve current stream filter when changing pages
    const currentFilters = {};
    if (selectedStream && selectedStream !== 'all') {
      currentFilters.stream = selectedStream;
    }
    loadCourses(currentFilters, newPage);
    // Scroll to top when changing page
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };


  // Handle opening colleges modal
  const handleViewColleges = (course) => {
    setSelectedCourse(course);
    setIsCollegesModalOpen(true);
  };

  const getStreamIcon = (stream) => {
    switch (stream) {
      case 'MEDICAL':
        return BookOpen;
      case 'DENTAL':
        return BookOpen;
      case 'DNB':
        return BookOpen;
      default:
        return BookOpen;
    }
  };

  const getStreamColor = (stream) => {
    switch (stream) {
      case 'MEDICAL':
        return 'from-blue-500 to-blue-600';
      case 'DENTAL':
        return 'from-green-500 to-green-600';
      case 'DNB':
        return 'from-purple-500 to-purple-600';
      default:
        return 'from-gray-500 to-gray-600';
    }
  };

  const streams = [
    { value: 'all', label: 'All Streams' },
    { value: 'MEDICAL', label: 'Medical' },
    { value: 'DENTAL', label: 'Dental' },
    { value: 'DNB', label: 'DNB' }
  ];

  return (
    <BlurredOverlay>
      <div className="min-h-screen relative overflow-hidden transition-all duration-500">
      {/* Dynamic Background based on theme */}
      {isDarkMode ? (
        <Vortex
          className="fixed inset-0 z-0"
          particleCount={700}
          baseHue={120}
          rangeHue={100}
          baseSpeed={0.18}
          rangeSpeed={1.9}
          baseRadius={1}
          rangeRadius={2.8}
          backgroundColor="#000000"
          containerClassName="fixed inset-0"
        >
          {/* Subtle overlay for text readability */}
          <div className="absolute inset-0 bg-black/25 z-10"></div>
        </Vortex>
      ) : (
        <LightVortex
          className="fixed inset-0 z-0"
          particleCount={400}
          baseHue={200}
          rangeHue={80}
          baseSpeed={0.1}
          rangeSpeed={1.5}
          baseRadius={1.5}
          rangeRadius={3}
          backgroundColor="#ffffff"
          containerClassName="fixed inset-0"
        >
          {/* Light overlay for text readability */}
          <div className="absolute inset-0 bg-gradient-to-br from-green-50/30 via-blue-50/20 to-purple-50/30 z-10"></div>
        </LightVortex>
      )}

      {/* Content */}
      <div className="relative z-20 min-h-screen flex flex-col">
        {/* Desktop Header - Original Design */}
        <div className="hidden md:block">
        <motion.header
            className="flex items-center justify-between p-8"
        initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: isLoaded ? 1 : 0, y: isLoaded ? 0 : -20 }}
            transition={{ duration: 0.2, delay: 0.05 }}
          >
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-xl flex items-center justify-center">
                <GraduationCap className="w-8 h-8 text-white" />
              </div>
              <h1 className={`text-3xl font-bold transition-colors duration-300 ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>NeetLogIQ</h1>
            </div>

            <div className="flex items-center space-x-6 navbar">
              <nav className="hidden md:flex items-center space-x-8">
                <Link 
                  to="/" 
                  className={`transition-colors duration-300 ${
                    isDarkMode 
                      ? 'text-white/80 hover:text-white' 
                      : 'text-gray-700 hover:text-gray-900'
                  }`}
                >
                  Home
                </Link>
                <Link 
                  to="/colleges" 
                  className={`transition-colors duration-300 ${
                    isDarkMode 
                      ? 'text-white/80 hover:text-white' 
                      : 'text-gray-700 hover:text-gray-900'
                  }`}
                >
                  Colleges
                </Link>
                <Link 
                  to="/courses" 
                  className={`font-semibold transition-colors duration-300 ${
                    isDarkMode ? 'text-white' : 'text-gray-900'
                  }`}
                >
            Courses
                </Link>
                <Link 
                  to="/cutoffs" 
                  className={`transition-colors duration-300 ${
                    isDarkMode 
                      ? 'text-white/80 hover:text-white' 
                      : 'text-gray-700 hover:text-gray-900'
                  }`}
                >
                  Cutoffs
                </Link>
                <Link 
                  to="/about" 
                  className={`transition-colors duration-300 ${
                    isDarkMode 
                      ? 'text-white/80 hover:text-white' 
                      : 'text-gray-700 hover:text-gray-900'
                  }`}
                >
                  About
                </Link>
              </nav>
              
              {/* Theme Toggle and Authentication Section */}
              <div className="flex items-center gap-4">
                <ThemeToggle />
                {isAuthenticated ? (
                  <UserPopup />
                ) : (
                  <GoogleSignIn text="signin" size="medium" width={120} />
                )}
              </div>
            </div>
          </motion.header>
        </div>

        {/* Mobile Header - Responsive Design */}
        <div className="md:hidden">
          <ResponsiveHeader />
        </div>

      {/* Main Content */}
        <main className="flex-1 flex flex-col items-center justify-center px-8 py-16">
          <div className="text-center max-w-6xl w-full">
            {/* Page Title - Same style as landing page */}
            <motion.h1
              className={`text-5xl md:text-7xl font-bold mb-6 transition-colors duration-300 ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: isLoaded ? 1 : 0, scale: isLoaded ? 1 : 0.95 }}
              transition={{ duration: 0.25, delay: 0.1 }}
            >
              Medical Courses
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              className={`text-xl md:text-2xl mb-12 max-w-3xl mx-auto transition-colors duration-300 ${
                isDarkMode ? 'text-white/90' : 'text-gray-700'
              }`}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: isLoaded ? 1 : 0, y: isLoaded ? 0 : 15 }}
              transition={{ duration: 0.2, delay: 0.15 }}
            >
              Explore comprehensive medical courses and see which colleges offer them with detailed seat information
            </motion.p>

            {/* Advanced Search Bar */}
            <motion.div
              className="max-w-3xl mx-auto mb-16"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: isLoaded ? 1 : 0, y: isLoaded ? 0 : 15 }}
              transition={{ duration: 0.2, delay: 0.2 }}
            >
              <UnifiedSearchBar
                placeholder="Search medical courses with AI-powered intelligence..."
                contentType="courses"
                colleges={colleges}
                showSuggestions={false}
                onSearchResults={async (searchResult) => {
                  console.log("🔍 Unified search results for courses:", searchResult);
                  
                  if (searchResult.results && searchResult.results.length > 0) {
                    console.log("🔍 Setting courses to search results:", searchResult.results.length, "courses");
                    
                    // Convert search results to course format for display
                    const searchCourses = searchResult.results.map(result => ({
                      course_name: result.course_name,
                      stream: result.stream,
                      branch: result.branch || '',
                      level: result.level,
                      duration: result.duration || 'N/A',
                      total_seats: result.total_seats || 0,
                      total_colleges: result.total_colleges || 0, // Use consistent field name
                      college_names: result.college_names || '',
                      colleges: result.colleges || []
                    }));
                    
                    // Filter out courses with 0 total seats
                    const validSearchCourses = searchCourses.filter(course => course.total_seats > 0);
                    
                    console.log("🔍 Before setting courses - current courses:", courses.length, "filteredCourses:", filteredCourses.length);
                    console.log("🔍 Search courses data:", validSearchCourses.map(c => ({ name: c.course_name, seats: c.total_seats, colleges: c.total_colleges })));
                    setCourses(validSearchCourses);
                    setFilteredCourses(validSearchCourses);
                    setPagination({
                      page: 1,
                      limit: validSearchCourses.length,
                      totalPages: 1,
                      totalItems: validSearchCourses.length
                    });
                    console.log("🔍 Courses state updated successfully - validSearchCourses:", validSearchCourses.length);
                  } else if (searchResult && searchResult.searchType === 'none') {
                    // Only clear search when explicitly clearing (searchType: 'none')
                    console.log("🔍 Clearing search results for courses");
                    // Reset pagination to default values before reloading
                    setPagination({
                      page: 1,
                      limit: 24,
                      totalPages: 1,
                      totalItems: 0
                    });
                    // Reload the original courses
                    const currentFilters = {};
                    if (selectedStream && selectedStream !== 'all') {
                      currentFilters.stream = selectedStream;
                    }
                    loadCourses(currentFilters, 1);
                  } else if (searchResult && searchResult.query) {
                    // Use advanced search for better results
                    try {
                      console.log("🚀 Using advanced search for courses:", searchResult.query);
                      const advancedResults = await apiService.advancedSearch(searchResult.query, {
                        type: 'courses',
                        limit: 50,
                        threshold: 0.3
                      });
                      
                      if (advancedResults.results && advancedResults.results.length > 0) {
                        console.log("🚀 Advanced search results:", advancedResults.results.length, "courses");
                        
                        // Convert advanced search results to course format
                        const advancedCourses = advancedResults.results.map(result => ({
                          course_name: result.course_name,
                          stream: result.stream,
                          branch: result.branch || '',
                          level: result.level,
                          duration: result.duration || 'N/A',
                          total_seats: result.total_seats || 0,
                          total_colleges: result.total_colleges || 0,
                          college_names: result.college_names || '',
                          colleges: result.colleges || []
                        }));
                        
                        // Filter out courses with 0 total seats
                        const validAdvancedCourses = advancedCourses.filter(course => course.total_seats > 0);
                        
                        setCourses(validAdvancedCourses);
                        setFilteredCourses(validAdvancedCourses);
                        setPagination({
                          page: 1,
                          limit: validAdvancedCourses.length,
                          totalPages: 1,
                          totalItems: advancedResults.total
                        });
                      }
                    } catch (error) {
                      console.error("Advanced search failed:", error);
                      // Fallback to regular search results
                      if (searchResult.results && searchResult.results.length > 0) {
                        const searchCourses = searchResult.results.map(result => ({
                          course_name: result.course_name,
                          stream: result.stream,
                          branch: result.branch || '',
                          level: result.level,
                          duration: result.duration || 'N/A',
                          total_seats: result.total_seats || 0,
                          total_colleges: result.total_colleges || 0,
                          college_names: result.college_names || '',
                          colleges: result.colleges || []
                        }));
                        
                        const validSearchCourses = searchCourses.filter(course => course.total_seats > 0);
                        setCourses(validSearchCourses);
                        setFilteredCourses(validSearchCourses);
                      }
                    }
                  } else {
                    console.log("🔍 No search results to display for courses");
                    // Don't clear courses array for empty results
                  }
                }}
                debounceMs={300}
                showAIInsight={true}
              />
            </motion.div>

            {/* Stream Filters */}
            <motion.div
              className="flex flex-wrap gap-4 justify-center mb-16"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: isLoaded ? 1 : 0, y: isLoaded ? 0 : 15 }}
              transition={{ duration: 0.2, delay: 0.25 }}
            >
              {streams.map((stream) => (
                <button
                  key={stream.value}
                  onClick={() => handleStreamChange(stream.value)}
                  className={`px-6 py-3 rounded-xl font-medium transition-all ${
                    selectedStream === stream.value
                      ? stream.value === 'MEDICAL' 
                        ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg'
                        : stream.value === 'DENTAL'
                        ? 'bg-gradient-to-r from-green-500 to-green-600 text-white shadow-lg'
                        : stream.value === 'DNB'
                        ? 'bg-gradient-to-r from-purple-500 to-purple-600 text-white shadow-lg'
                        : 'bg-gradient-to-r from-primary-500 to-secondary-500 text-white shadow-lg'
                      : stream.value === 'MEDICAL'
                      ? isDarkMode 
                        ? 'bg-blue-500/20 backdrop-blur-sm text-blue-200 border border-blue-400/30 hover:bg-blue-500/30 hover:text-blue-100'
                        : 'bg-blue-100 text-blue-800 border border-blue-300 hover:bg-blue-200 hover:text-blue-900'
                      : stream.value === 'DENTAL'
                      ? isDarkMode 
                        ? 'bg-green-500/20 backdrop-blur-sm text-green-200 border border-green-400/30 hover:bg-green-500/30 hover:text-green-100'
                        : 'bg-green-100 text-green-800 border border-green-300 hover:bg-green-200 hover:text-green-900'
                      : stream.value === 'DNB'
                      ? isDarkMode 
                        ? 'bg-purple-500/20 backdrop-blur-sm text-purple-200 border border-purple-400/30 hover:bg-purple-500/30 hover:text-purple-100'
                        : 'bg-purple-100 text-purple-800 border border-purple-300 hover:bg-purple-200 hover:text-purple-900'
                      : isDarkMode 
                        ? 'bg-white/10 backdrop-blur-sm text-white/80 hover:bg-white/20 hover:text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:text-gray-900'
                  }`}
                >
                  {stream.label}
                </button>
              ))}
            </motion.div>

            {/* Search Status */}
            {filteredCourses.length !== courses.length && (
              <motion.div
                className="text-center mb-8"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <div className="inline-flex items-center gap-2 bg-blue-500/20 text-blue-300 px-4 py-2 rounded-full text-sm">
                  <Search className="w-4 h-4" />
                  Search Results: {filteredCourses.length} of {courses.length} courses
            </div>
              </motion.div>
            )}
            
            {/* Courses Grid - 2x12 Layout */}
            <motion.div
              className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-16 max-w-7xl mx-auto w-full"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: isLoaded ? 1 : 0, y: isLoaded ? 0 : 15 }}
              transition={{ duration: 0.2, delay: 0.3 }}
            >
              {/* No courses found message */}
              {!isLoading && filteredCourses.length === 0 && (
                <div className="col-span-full text-center py-12">
                  <div className={`text-lg mb-4 ${
                    isDarkMode ? 'text-white/60' : 'text-gray-600'
                  }`}>
                    <BookOpen className="w-16 h-16 mx-auto mb-4 opacity-50" />
                    No courses found
                  </div>
                  <p className={`text-sm ${
                    isDarkMode ? 'text-white/40' : 'text-gray-500'
                  }`}>
                    Try adjusting your search criteria or stream filter
                  </p>
                </div>
              )}
              {isLoading ? (
                <>
                  {/* Loading indicator */}
                  <div className="col-span-full text-center mb-8">
                    <div className={`text-lg ${
                      isDarkMode ? 'text-white/80' : 'text-gray-700'
                    }`}>
                      Loading courses...
                    </div>
                  </div>
                  
                  {/* Loading skeleton - 24 cards for 2x12 grid */}
                  {Array.from({ length: 24 }).map((_, index) => (
                    <div key={index} className={`backdrop-blur-md p-6 rounded-2xl border-2 animate-pulse shadow-lg ${
                      isDarkMode 
                        ? 'bg-white/10 border-white/20 shadow-white/10' 
                        : 'bg-blue-50/40 border-blue-200/60 shadow-blue-200/30'
                    }`}>
                      <div className={`w-16 h-16 rounded-2xl mx-auto mb-3 ${
                        isDarkMode ? 'bg-white/20' : 'bg-gray-200/50'
                      }`}></div>
                      <div className={`h-4 rounded mb-2 ${
                        isDarkMode ? 'bg-white/20' : 'bg-gray-200/50'
                      }`}></div>
                      <div className={`h-3 rounded mb-1 ${
                        isDarkMode ? 'bg-white/20' : 'bg-gray-200/50'
                      }`}></div>
                      <div className={`h-3 rounded ${
                        isDarkMode ? 'bg-white/20' : 'bg-gray-200/50'
                      }`}></div>
                    </div>
                  ))}
                </>
              ) : filteredCourses.length > 0 ? (
                (() => {
                  console.log('🔍 Rendering courses grid:', {
                    totalCourses: filteredCourses.length,
                    paginationLimit: pagination.limit,
                    expectedGrid: `${Math.ceil(filteredCourses.length / 2)} rows × 2 columns`,
                    courseNames: filteredCourses.map(c => c.course_name)
                  });
                  return filteredCourses;
                })()
                  .map((course, index) => {
                    const IconComponent = getStreamIcon(course.stream);
                    
                    return (
                      <motion.div
                        key={`${course.course_name}-${course.stream}-${course.level}-${index}`}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: isLoaded ? 1 : 0, y: isLoaded ? 0 : 10 }}
                        transition={{ delay: 0.35 + index * 0.03, duration: 0.2 }}
                        className={`backdrop-blur-md p-6 rounded-2xl border-2 transition-all h-fit shadow-lg ${
                          isDarkMode 
                            ? 'bg-white/10 border-white/20 hover:bg-white/20 shadow-white/10' 
                            : 'bg-blue-50/40 border-blue-200/60 hover:bg-blue-50/50 shadow-blue-200/30'
                        }`}
                      >
                        <div className="text-center mb-4">
                          <div className={`w-16 h-16 bg-gradient-to-r ${getStreamColor(course.stream)} rounded-2xl flex items-center justify-center mx-auto mb-3`}>
                            <IconComponent className="w-8 h-8 text-white" />
                          </div>
                                                  <h3 className={`text-xl font-semibold mb-2 ${
                                                    isDarkMode ? 'text-white' : 'text-gray-900'
                                                  }`}>{course.course_name}</h3>
                        </div>
                      
                      <div className="space-y-2 mb-4">
                        {(() => {
                          // Use backend-provided counts instead of frontend aggregation
                          const collegeCount = course.total_colleges || 0;
                          const totalSeats = course.total_seats || 0;
                          
                          return (
                            <>
                              <div className={`flex items-center justify-between text-sm ${
                                isDarkMode ? 'text-white/80' : 'text-gray-600'
                              }`}>
                                <span>Stream: <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                                  course.stream === 'MEDICAL' ? 'bg-blue-500 text-white border border-blue-600' :
                                  course.stream === 'DENTAL' ? 'bg-green-500 text-white border border-green-600' :
                                  course.stream === 'DNB' ? 'bg-purple-500 text-white border border-purple-600' :
                                  'bg-gray-500 text-white border border-gray-600'
                                }`}>
                                  {course.stream}
                                </span></span>
                                <span>Colleges: {collegeCount}</span>
                              </div>
                              <div className={`flex items-center justify-between text-sm ${
                                isDarkMode ? 'text-white/80' : 'text-gray-600'
                              }`}>
                                <span>Total Seats: {totalSeats.toLocaleString()}</span>
                                <span>Duration: {course.duration || 'N/A'}</span>
                              </div>
                            </>
                          );
                        })()}
                      </div>

                      {/* Expandable Colleges Section */}
                      <div className="mb-4">
                        <button
                          onClick={() => handleViewColleges(course)}
                          className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 py-3 rounded-lg text-center font-medium hover:from-blue-600 hover:to-purple-700 transition-all duration-200 flex items-center justify-center"
                        >
                          <GraduationCap className="w-4 h-4 mr-2" />
                          {(() => {
                            // Use backend-provided count instead of frontend aggregation
                            const collegeCount = course.total_colleges || 0;
                            return <span>View Colleges ({collegeCount})</span>;
                          })()}
                        </button>
                      </div>
                    </motion.div>
                  );
                })
              ) : (
                <div className="col-span-full text-center py-12">
                  <div className={`w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-4 backdrop-blur-md shadow-lg ${
                    isDarkMode ? 'bg-white/10 shadow-white/10' : 'bg-blue-50/40 shadow-blue-200/30'
                  }`}>
                    <BookOpen className={`w-12 h-12 ${
                      isDarkMode ? 'text-white/50' : 'text-gray-400'
                    }`} />
                  </div>
                  <h3 className={`text-xl font-semibold mb-2 ${
                    isDarkMode ? 'text-white' : 'text-gray-900'
                  }`}>
                    {filteredCourses.length === 0 && courses.length > 0 ? 'No courses match your search' : 'No courses found'}
              </h3>
                  <p className={isDarkMode ? 'text-white/70' : 'text-gray-600'}>
                    {filteredCourses.length === 0 && courses.length > 0 ? 'Try different search terms or clear your search' : 'Try adjusting your search or filters'}
                  </p>
                </div>
              )}
            </motion.div>

            {/* Enhanced Pagination */}
            {pagination.totalPages > 1 && (
              <motion.div
                className="flex flex-col items-center gap-4 mb-12"
                initial={{ opacity: 0 }}
                animate={{ opacity: isLoaded ? 1 : 0 }}
                transition={{ duration: 0.2, delay: 0.4 }}
              >
                {/* Loading indicator for pagination */}
                {isLoading && (
                  <div className={`text-sm flex items-center gap-2 ${
                    isDarkMode ? 'text-white/70' : 'text-gray-600'
                  }`}>
                    <div className={`animate-spin rounded-full h-4 w-4 border-b-2 ${
                      isDarkMode ? 'border-white/70' : 'border-gray-600'
                    }`}></div>
                    Loading courses...
                  </div>
                )}
                {/* Pagination Info */}
                <div className={`text-sm text-center ${
                  isDarkMode ? 'text-white/70' : 'text-gray-600'
                }`}>
                  <div className="mb-1">
                    Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.totalItems)} of {pagination.totalItems} courses
                  </div>
                  <div className={`text-xs ${
                    isDarkMode ? 'text-white/50' : 'text-gray-500'
                  }`}>
                    Page {pagination.page} of {pagination.totalPages} • {pagination.limit} courses per page
                  </div>
                </div>
                
                {/* Pagination Controls */}
                <div className="flex justify-center items-center gap-2">
                  {/* First Page */}
                  <button
                    onClick={() => handlePageChange(1)}
                    disabled={pagination.page <= 1}
                    className={`px-3 py-2 backdrop-blur-sm rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm ${
                      isDarkMode 
                        ? 'bg-white/10 text-white hover:bg-white/20' 
                        : 'bg-gray-100/80 text-gray-700 hover:bg-gray-200/80'
                    }`}
                  >
                    First
                  </button>
                  
                  {/* Previous Page */}
                  <button
                    onClick={() => handlePageChange(pagination.page - 1)}
                    disabled={pagination.page <= 1}
                    className={`px-4 py-2 backdrop-blur-sm rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors ${
                      isDarkMode 
                        ? 'bg-white/10 text-white hover:bg-white/20' 
                        : 'bg-gray-100/80 text-gray-700 hover:bg-gray-200/80'
                    }`}
                  >
                    Previous
                  </button>
                  
                  {/* Page Numbers */}
                  <div className="flex gap-1 flex-wrap justify-center max-w-md">
                    {(() => {
                      const pages = [];
                      const totalPages = pagination.totalPages;
                      const currentPage = pagination.page;
                      
                      // Always show first page
                      pages.push(
                        <button
                          key={1}
                          onClick={() => handlePageChange(1)}
                          className={`px-3 py-2 rounded-lg transition-colors text-sm ${
                            currentPage === 1
                              ? isDarkMode 
                                ? 'bg-white/30 text-white'
                                : 'bg-blue-500 text-white'
                              : isDarkMode
                                ? 'bg-white/10 text-white/70 hover:bg-white/20'
                                : 'bg-gray-100/80 text-gray-700 hover:bg-gray-200/80'
                          }`}
                        >
                          1
                        </button>
                      );
                      
                      // Show ellipsis if we're far from the beginning
                      if (currentPage > 4) {
                        pages.push(
                          <span key="ellipsis1" className="px-2 py-2 text-white/50 text-sm">
                            ...
                          </span>
                        );
                      }
                      
                      // Show pages around current page
                      const startPage = Math.max(2, currentPage - 2);
                      const endPage = Math.min(totalPages - 1, currentPage + 2);
                      
                      for (let i = startPage; i <= endPage; i++) {
                        if (i !== 1 && i !== totalPages) {
                          pages.push(
                            <button
                              key={i}
                              onClick={() => handlePageChange(i)}
                              className={`px-3 py-2 rounded-lg transition-colors text-sm ${
                                i === currentPage
                                  ? 'bg-white/30 text-white'
                                  : 'bg-white/10 text-white/70 hover:bg-white/20'
                              }`}
                            >
                              {i}
                            </button>
                          );
                        }
                      }
                      
                      // Show ellipsis if we're far from the end
                      if (currentPage < totalPages - 3) {
                        pages.push(
                          <span key="ellipsis2" className="px-2 py-2 text-white/50 text-sm">
                            ...
                          </span>
                        );
                      }
                      
                      // Always show last page (if more than 1 page)
                      if (totalPages > 1) {
                        pages.push(
                          <button
                            key={totalPages}
                            onClick={() => handlePageChange(totalPages)}
                            className={`px-3 py-2 rounded-lg transition-colors text-sm ${
                              totalPages === currentPage
                                ? 'bg-white/30 text-white'
                                : 'bg-white/10 text-white/70 hover:bg-white/20'
                            }`}
                          >
                            {totalPages}
                          </button>
                        );
                      }
                      
                      return pages;
                    })()}
                  </div>
                  
                  {/* Next Page */}
                  <button
                    onClick={() => handlePageChange(pagination.page + 1)}
                    disabled={pagination.page >= pagination.totalPages}
                    className={`px-4 py-2 backdrop-blur-sm rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors ${
                      isDarkMode 
                        ? 'bg-white/10 text-white hover:bg-white/20' 
                        : 'bg-gray-100/80 text-gray-700 hover:bg-gray-200/80'
                    }`}
                  >
                    Next
                  </button>
                  
                  {/* Last Page */}
                  <button
                    onClick={() => handlePageChange(pagination.totalPages)}
                    disabled={pagination.page >= pagination.totalPages}
                    className={`px-3 py-2 backdrop-blur-sm rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm ${
                      isDarkMode 
                        ? 'bg-white/10 text-white hover:bg-white/20' 
                        : 'bg-gray-100/80 text-gray-700 hover:bg-gray-200/80'
                    }`}
                  >
                    Last
                  </button>
                </div>
                
                {/* Page Size Selector */}
                <div className={`flex items-center gap-2 text-sm ${
                  isDarkMode ? 'text-white/70' : 'text-gray-600'
                }`}>
                  <span>Show:</span>
                  <select
                    value={pagination.limit}
                    onChange={(e) => {
                      const newLimit = parseInt(e.target.value);
                      setPagination(prev => ({ ...prev, limit: newLimit, page: 1 }));
                      // Preserve stream filter when changing page size
                      const currentFilters = {};
                      if (selectedStream && selectedStream !== 'all') {
                        currentFilters.stream = selectedStream;
                      }
                      loadCourses(currentFilters, 1);
                    }}
                    className={`px-2 py-1 backdrop-blur-sm rounded border focus:outline-none ${
                      isDarkMode 
                        ? 'bg-white/10 text-white border-white/20 focus:border-white/40' 
                        : 'bg-gray-100/80 text-gray-700 border-gray-300/50 focus:border-blue-400'
                    }`}
                  >
                    <option value={12}>12</option>
                    <option value={24}>24</option>
                    <option value={48}>48</option>
                    <option value={96}>96</option>
                  </select>
                  <span>per page</span>
                </div>
                
                {/* Jump to Page */}
                <div className={`flex items-center gap-2 text-sm ${
                  isDarkMode ? 'text-white/70' : 'text-gray-600'
                }`}>
                  <span>Jump to:</span>
                  <input
                    type="number"
                    min="1"
                    max={pagination.totalPages}
                    placeholder="Page"
                    className={`w-20 px-2 py-1 backdrop-blur-sm rounded border focus:outline-none ${
                      isDarkMode 
                        ? 'bg-white/10 text-white border-white/20 focus:border-white/40 placeholder-white/50' 
                        : 'bg-gray-100/80 text-gray-700 border-gray-300/50 focus:border-blue-400 placeholder-gray-500'
                    }`}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        const pageNum = parseInt(e.target.value);
                        if (pageNum >= 1 && pageNum <= pagination.totalPages) {
                          handlePageChange(pageNum);
                          e.target.value = '';
                        }
                      }
                    }}
                  />
                  <button
                    onClick={(e) => {
                      const input = e.target.previousElementSibling;
                      const pageNum = parseInt(input.value);
                      if (pageNum >= 1 && pageNum <= pagination.totalPages) {
                        handlePageChange(pageNum);
                        input.value = '';
                      }
                    }}
                    className={`px-3 py-1 backdrop-blur-sm rounded border transition-colors text-xs ${
                      isDarkMode 
                        ? 'bg-white/10 text-white border-white/20 hover:bg-white/20' 
                        : 'bg-gray-100/80 text-gray-700 border-gray-300/50 hover:bg-gray-200/80'
                    }`}
                  >
                    Go
                  </button>
                </div>
              </motion.div>
            )}


          </div>
        </main>

        {/* Footer - Same style as landing page */}
        <motion.footer
          className={`text-center p-8 transition-colors duration-300 ${
            isDarkMode ? 'text-white/60' : 'text-gray-500'
          }`}
          initial={{ opacity: 0 }}
          animate={{ opacity: isLoaded ? 1 : 0 }}
          transition={{ duration: 0.2, delay: 0.5 }}
        >
          <p>&copy; 2024 NeetLogIQ. All rights reserved. Built with ❤️ for medical aspirants.</p>
        </motion.footer>
        </div>
        <BackToTopButton />
        
        {/* Course Colleges Modal */}
        <CourseCollegesModal
          isOpen={isCollegesModalOpen}
          onClose={() => setIsCollegesModalOpen(false)}
          course={selectedCourse}
          colleges={colleges}
        />
        
    </div>
    </BlurredOverlay>
  );
};

export default Courses;
