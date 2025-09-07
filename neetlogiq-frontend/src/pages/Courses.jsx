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
import InfiniteScrollTrigger from '../components/InfiniteScrollTrigger';

const Courses = () => {
  const [isLoaded, setIsLoaded] = useState(false);
  const { isAuthenticated } = useAuth();
  const { isDarkMode } = useTheme();

  const [selectedStream, setSelectedStream] = useState('all');
  const [courses, setCourses] = useState([]);
  const [filteredCourses, setFilteredCourses] = useState([]);
  const [colleges, setColleges] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false); // Separate state for infinite scroll
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
    }, 50); // Reduced for faster loading
    return () => clearTimeout(timer);
  }, []);

  // Note: Cache clearing removed for faster loading - browser cache is sufficient

  // Load courses from backend with chunked loading
  const loadCourses = useCallback(async (newFilters = {}, newPage = 1, isAppend = false) => {
    try {
      // Use different loading states based on whether we're appending or replacing
      if (isAppend) {
        setIsLoadingMore(true);
      } else {
        setIsLoading(true);
      }
      
      console.log('🔍 Loading courses with filters:', newFilters, 'page:', newPage, 'append:', isAppend);
      
      // Use optimal chunk size for fast loading
      const chunkSize = 24; // Load 24 courses at a time for faster loading
      
      // Direct API call for faster loading (cache is handled by browser)
      const response = await apiService.getCourses(newFilters, newPage, chunkSize);
      
      console.log('🔍 Chunked loading complete:', {
        page: newPage,
        totalCourses: response.data?.length || 0,
        pagination: response.pagination
      });
      
      // Filter out courses with 0 total seats
      const validCourses = (response.data || []).filter(course => course.total_seats > 0);
      
      // Append or replace data based on isAppend flag
      if (isAppend && newPage > 1) {
        setCourses(prevCourses => {
          // Create unique identifier using course_name + stream combination
          const existingKeys = new Set(prevCourses.map(course => `${course.course_name}-${course.stream}`));
          const newCourses = validCourses.filter(course => !existingKeys.has(`${course.course_name}-${course.stream}`));
          console.log('📍 Adding new courses:', newCourses.length, 'Total will be:', prevCourses.length + newCourses.length);
          console.log('📍 Existing courses:', prevCourses.length, 'New courses from API:', validCourses.length);
          console.log('📍 Existing keys:', Array.from(existingKeys).slice(0, 5));
          console.log('📍 New course keys:', validCourses.slice(0, 5).map(c => `${c.course_name}-${c.stream}`));
          return [...prevCourses, ...newCourses];
        });
        setFilteredCourses(prevCourses => {
          const existingKeys = new Set(prevCourses.map(course => `${course.course_name}-${course.stream}`));
          const newCourses = validCourses.filter(course => !existingKeys.has(`${course.course_name}-${course.stream}`));
          return [...prevCourses, ...newCourses];
        });
        
        // Update pagination to reflect the new page
        setPagination(prevPagination => ({
          ...prevPagination,
          page: newPage,
          hasNext: response.pagination?.hasNext || false,
          totalItems: response.pagination?.totalItems || prevPagination.totalItems
        }));
      } else {
        setCourses(validCourses);
        setFilteredCourses(validCourses);
        setPagination({
          page: newPage,
          limit: chunkSize,
          totalPages: response.pagination?.totalPages || 1,
          totalItems: response.pagination?.totalItems || validCourses.length,
          hasNext: response.pagination?.hasNext || false
        });
      }
    } catch (error) {
      console.error('Failed to load courses:', error);
      if (!isAppend) {
        setCourses([]);
        setFilteredCourses([]);
      }
    } finally {
      // Reset both loading states
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  }, []);

  // Backend integration - load initial data
  useEffect(() => {
    const initialLoad = async () => {
      try {
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

        // Load first page of courses using the optimized loadCourses function
        const coursesPromise = loadCourses({}, 1, false);

        // Load both courses and colleges in parallel
        await Promise.all([
          collegesPromise,
          coursesPromise
        ]);
        
        console.log('🔍 Initial loading complete');
      } catch (error) {
        console.error('Failed to load courses:', error);
      }
    };
    
    initialLoad();
  }, [loadCourses]); // Include loadCourses dependency

  // Load more courses function for infinite scroll
  const loadMoreCourses = useCallback(() => {
    console.log('🔄 Load more triggered:', { 
      isLoading, 
      isLoadingMore, 
      hasNext: pagination.hasNext, 
      currentPage: pagination.page,
      totalPages: pagination.totalPages,
      totalItems: pagination.totalItems
    });
    
    if (isLoading || isLoadingMore || !pagination.hasNext) {
      console.log('🔄 Load more blocked:', { isLoading, isLoadingMore, hasNext: pagination.hasNext });
      return;
    }
    
    const nextPage = pagination.page + 1;
    console.log('🔄 Loading more courses, page:', nextPage);
    
    // Preserve current stream filter when loading more courses
    const currentFilters = {};
    if (selectedStream && selectedStream !== 'all') {
      currentFilters.stream = selectedStream;
    }
    
    loadCourses(currentFilters, nextPage, true); // Append mode with current filters
  }, [isLoading, isLoadingMore, pagination.hasNext, pagination.page, loadCourses, selectedStream]);


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
                  <GoogleSignIn text="Sign In" size="medium" width={100} />
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
                collegesData={colleges}
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
                        key={`${course.course_name}-${course.stream}`}
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
              
              {/* Skeleton cards for loading more */}
              {isLoadingMore && (
                <>
                  {Array.from({ length: 6 }).map((_, skeletonIndex) => (
                    <div key={`skeleton-${skeletonIndex}`} className={`backdrop-blur-md p-6 rounded-2xl border-2 animate-pulse shadow-lg ${
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
              )}
            </motion.div>

            {/* Infinite Scroll Trigger - loads more courses when user reaches 80% of current content */}
            {filteredCourses.length > 0 && pagination.hasNext && (
              <InfiniteScrollTrigger
                onLoadMore={loadMoreCourses}
                hasMore={pagination.hasNext}
                isLoading={isLoadingMore}
                threshold={0.8}
                rootMargin="200px"
              >
                {/* Loading indicator is now handled by skeleton cards in the grid */}
              </InfiniteScrollTrigger>
            )}

            {/* End of content indicator */}
            {filteredCourses.length > 0 && !pagination.hasNext && (
              <div className="col-span-full text-center py-8">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-100 dark:bg-green-900/30 text-green-800 dark:bg-green-300">
                  <BookOpen className="w-4 h-4" />
                  <span className="text-sm font-medium">You've reached the end! All courses loaded.</span>
                </div>
              </div>
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
