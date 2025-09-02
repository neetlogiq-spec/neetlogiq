// AI-Generated React Page Template
// Generated for: Colleges
// Template: react-page
// Date: 2025-08-28

import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Building2, Wifi, WifiOff, GraduationCap, Database, ChevronUp, ChevronDown, X, Sparkles, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';
import IntelligentFilters from '../components/IntelligentFilters';
import AdvancedSearchBar from '../components/AdvancedSearchBar';
import apiService from '../services/apiService';
import { useAdvancedSearch } from '../hooks/useAdvancedSearch';
import BeautifulLoader from '../components/BeautifulLoader';
import BackToTopButton from '../components/BackToTopButton';
import GoogleSignIn from '../components/GoogleSignIn';
import UserPopup from '../components/UserPopup';
import { useAuth } from '../contexts/AuthContext';
import { Vortex } from '../components/ui/vortex';
import { LightVortex } from '../components/ui/LightVortex';
import { useTheme } from '../context/ThemeContext';
import ThemeToggle from '../components/ThemeToggle';

const Colleges = () => {
  const [isLoaded, setIsLoaded] = useState(false);
  const { isAuthenticated } = useAuth();
  const { isDarkMode } = useTheme();

  const [expandedCards, setExpandedCards] = useState(new Set());
  const [collegeCourses, setCollegeCourses] = useState({});


  
  // Backend integration state
  const [colleges, setColleges] = useState([]);
  const [filters, setFilters] = useState({});
  const [appliedFilters, setAppliedFilters] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [currentSearchQuery, setCurrentSearchQuery] = useState('');
  // const [isSearching, setIsSearching] = useState(false); // Removed unused state

  const [apiStatus, setApiStatus] = useState('checking');
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 24, // Back to 24 for proper 3x8 grid layout
    totalPages: 1,
    totalItems: 0
  });

  // State for all colleges (used for search index)
  const [allCollegesForSearch, setAllCollegesForSearch] = useState([]);
  
  // State for storing all search results (for pagination)
  const [allSearchResults, setAllSearchResults] = useState([]);
  
  // Advanced search hook - initialized with ALL colleges, not just current page
  const {
    searchService,
    isInitialized: isAdvancedSearchReady,
    isLoading: isAdvancedSearchLoading,
    initializationProgress,
    performSearch: performAdvancedSearch
  } = useAdvancedSearch(allCollegesForSearch);

  // Search colleges by query (hybrid approach)
  const searchColleges = async (searchQuery) => {
    try {
      setIsLoading(true); // Show loading state during search
      if (!searchQuery || searchQuery.trim() === '') {
        // Clear search - reset to normal pagination
        console.log('🔍 Clearing search - returning to default college list');
        setCurrentSearchQuery('');
        setAllSearchResults([]); // Clear stored search results
        setPagination(prev => ({ ...prev, page: 1 })); // Reset to first page
        
        // Load default colleges with current filters
        await loadColleges(appliedFilters, 1);
        return;
      }
      
      console.log('🔍 Searching for:', searchQuery);
      
      // Try advanced search first if available
      if (isAdvancedSearchReady && searchService) {
        try {
          console.log('🚀 Using advanced search service...');
          console.log('🔍 Search service status:', searchService);
          console.log('🔍 All colleges for search:', allCollegesForSearch.length);
          
          const advancedResults = await performAdvancedSearch(searchQuery.trim());
          console.log('🔍 Advanced search results:', advancedResults);
          
          if (advancedResults && advancedResults.length > 0) {
            console.log(`🤖 Advanced search found ${advancedResults.length} results`);
            
            // Always show only first page results to maintain grid
            const firstPageResults = advancedResults.slice(0, pagination.limit);
            setColleges(firstPageResults);
            setCurrentSearchQuery(searchQuery.trim());
            setPagination({
              page: 1,
              limit: pagination.limit,
              totalPages: Math.ceil(advancedResults.length / pagination.limit),
              totalItems: advancedResults.length
            });
            
            // Store all results for pagination
            setAllSearchResults(advancedResults);
            return;
          } else {
            console.log('⚠️ Advanced search returned no results, falling back to backend');
          }
        } catch (advancedError) {
          console.warn('⚠️ Advanced search failed, falling back to backend:', advancedError);
        }
      } else {
        console.log('⚠️ Advanced search not ready:', { isAdvancedSearchReady, searchService });
      }
      
      // Fallback to backend search
      console.log('🔄 Falling back to backend search...');
      console.log('🔍 Backend search query:', searchQuery.trim());
      
      const response = await apiService.searchColleges(searchQuery.trim(), 1, pagination.limit);
      console.log('🔍 Backend search response:', response);
      
      if (response && response.data) {
        console.log(`🔍 Backend search results: ${response.data.length} colleges found`);
        console.log('📊 Pagination info:', response.pagination);
        console.log('🔍 Sample results:', response.data.slice(0, 3));
        
        // Always show only first page results to maintain grid
        const firstPageResults = response.data.slice(0, pagination.limit);
        setColleges(firstPageResults);
        setCurrentSearchQuery(searchQuery.trim());
        setPagination({
          page: 1, // Reset to first page when searching
          limit: pagination.limit,
          totalPages: response.pagination?.totalPages || Math.ceil(response.pagination?.totalItems / pagination.limit),
          totalItems: response.pagination?.totalItems || response.data.length
        });
        
        // Store all results for pagination
        setAllSearchResults(response.data);
      } else {
        console.error('❌ Invalid search response:', response);
        setColleges([]);
        setCurrentSearchQuery('');
        setPagination({
          page: 1,
          limit: 24,
          totalPages: 0,
          totalItems: 0
        });
      }
    } catch (error) {
      console.error('❌ Search error:', error);
      setColleges([]);
      setCurrentSearchQuery('');
      setAllSearchResults([]);
      setPagination({
        page: 1,
        limit: 24,
        totalPages: 0,
        totalItems: 0
      });
    } finally {
      setIsLoading(false); // Hide loading state after search
    }
  };

  // Load colleges from backend
  const loadColleges = useCallback(async (newFilters = {}, newPage = 1) => {
    // Don't load default colleges if there's an active search
    if (currentSearchQuery && currentSearchQuery.trim() !== '') {
      console.log('🔍 Skipping loadColleges - active search in progress');
      return;
    }
    
    try {
      setIsLoading(true);
      console.log('🔍 Loading colleges with filters:', newFilters, 'page:', newPage);
      
      const response = await apiService.getColleges(newFilters, newPage, pagination.limit); // Use dynamic limit
      
      console.log('🔍 API Response:', response);
      console.log('🔍 Total colleges from API:', response.pagination?.totalItems);
      console.log('🔍 Colleges data length:', response.data?.length);
      
      setColleges(response.data || []);
      setPagination(response.pagination || {
        page: newPage,
        limit: pagination.limit,
        totalPages: 1,
        totalItems: 0
      });
      
      // Note: API response doesn't include filters, they are managed separately
    } catch (error) {
      console.error('Failed to load colleges:', error);
      setColleges([]);
    } finally {
      setIsLoading(false);
    }
  }, [currentSearchQuery, pagination.limit]); // Add currentSearchQuery and pagination.limit as dependencies

  // Check API connection status
  const checkApiStatus = async () => {
    try {
      const status = await apiService.getApiStatus();
      setApiStatus(status.status);
    } catch (error) {
      setApiStatus('error');
    }
  };

  // Load all colleges for search index (without pagination)
  const loadAllCollegesForSearch = async () => {
    try {
      console.log('🔍 Loading all colleges for search index...');
      
      // First, get the total count
      const countResponse = await apiService.getColleges({}, 1, 1);
      const totalColleges = countResponse.pagination?.totalItems || 2401;
      console.log(`🔍 Total colleges in database: ${totalColleges}`);
      
      // Load ALL colleges in batches if needed
      if (totalColleges <= 1000) {
        const response = await apiService.getColleges({}, 1, totalColleges);
        if (response && response.data) {
          console.log(`🔍 Loaded ${response.data.length} colleges for search index`);
          setAllCollegesForSearch(response.data);
        }
      } else {
        // Load in batches of 1000
        let allColleges = [];
        const batchSize = 1000;
        const totalBatches = Math.ceil(totalColleges / batchSize);
        
        console.log(`🔍 Loading ${totalColleges} colleges in ${totalBatches} batches...`);
        
        for (let batch = 1; batch <= totalBatches; batch++) {
          const response = await apiService.getColleges({}, batch, batchSize);
          if (response && response.data) {
            allColleges = [...allColleges, ...response.data];
            console.log(`🔍 Batch ${batch}/${totalBatches}: Loaded ${response.data.length} colleges (Total: ${allColleges.length})`);
          }
        }
        
        console.log(`🔍 Final: Loaded ${allColleges.length} colleges for search index`);
        setAllCollegesForSearch(allColleges);
      }
    } catch (error) {
      console.error('Failed to load all colleges for search:', error);
    }
  };

  // Load available filters from backend
  const loadFilters = async () => {
    try {
      const filterData = await apiService.getCollegeFilters();
      console.log('🔍 Initial filters loaded:', filterData);
      // Set filters with proper structure for the component
      setFilters({
        available: filterData
      });
    } catch (error) {
      console.error('Failed to load filters:', error);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoaded(true);
    }, 200); // Reduced from 500ms to 200ms
    return () => clearTimeout(timer);
  }, []);

  // Backend integration
  useEffect(() => {
    checkApiStatus();
    loadFilters();
    loadColleges();
    loadAllCollegesForSearch(); // Load all colleges for search index
  }, [loadColleges]);

  // Debug: Monitor filters state changes
  useEffect(() => {
    console.log('🔍 Filters state changed:', filters);
  }, [filters]);

  // Handle filter changes
  const handleFilterChange = async (newFilters) => {
    console.log('🔍 Filter change detected:', newFilters);
    setAppliedFilters(newFilters);
    
    // If there's an active search, don't apply filters to default college list
    if (currentSearchQuery && currentSearchQuery.trim() !== '') {
      console.log('🔍 Skipping filter application - active search in progress');
      return;
    }
    
    // Reload filters to get synchronized options
    try {
      const filterData = await apiService.getCollegeFilters(newFilters);
      console.log('🔍 New filter data:', filterData);
      // Set filters with proper structure for the component
      setFilters({
        available: filterData
      });
    } catch (error) {
      console.error('Failed to reload filters:', error);
    }
    
    loadColleges(newFilters, 1);
  };

  // Handle filter clearing
  const handleClearFilters = async () => {
    setAppliedFilters({});
    
    // If there's an active search, don't clear filters for default college list
    if (currentSearchQuery && currentSearchQuery.trim() !== '') {
      console.log('🔍 Skipping filter clearing - active search in progress');
      return;
    }
    
    // Reload filters to get all available options
    try {
      const filterData = await apiService.getCollegeFilters({});
      setFilters({
        available: filterData
      });
    } catch (error) {
      console.error('Failed to reload filters:', error);
    }
    
    loadColleges({}, 1);
  };

  // Handle pagination with scroll to top
  const handlePageChange = async (newPage) => {
    setPagination(prev => ({ ...prev, page: newPage }));
    
    if (currentSearchQuery && allSearchResults.length > 0) {
      // If we're searching, use stored search results for pagination
      const startIndex = (newPage - 1) * pagination.limit;
      const endIndex = startIndex + pagination.limit;
      const pageResults = allSearchResults.slice(startIndex, endIndex);
      
      setColleges(pageResults);
      setPagination(prev => ({
        ...prev,
        page: newPage,
        totalPages: Math.ceil(allSearchResults.length / pagination.limit)
      }));
    } else if (currentSearchQuery) {
      // Fallback to API call if no stored results
      try {
        const response = await apiService.searchColleges(currentSearchQuery, newPage, pagination.limit);
        if (response && response.data) {
          setColleges(response.data);
          setPagination(response.pagination || {
            page: newPage,
            limit: pagination.limit,
            totalPages: Math.ceil(response.pagination?.totalItems / pagination.limit),
            totalItems: response.pagination?.totalItems || response.data.length
          });
        }
      } catch (error) {
        console.error('Failed to load search results for page:', newPage, error);
      }
    } else {
      // Normal pagination for filtered results
      loadColleges(appliedFilters, newPage);
    }
    
    // Scroll to top when changing pages
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };







  const toggleCardExpansion = (collegeId) => {
    setExpandedCards(prev => {
      const newSet = new Set(prev);
      if (newSet.has(collegeId)) {
        newSet.delete(collegeId);
      } else {
        newSet.add(collegeId);
        // Fetch courses when expanding
        fetchCollegeCourses(collegeId);
      }
      return newSet;
    });
  };

  const fetchCollegeCourses = async (collegeId) => {
    if (collegeCourses[collegeId]) return; // Already fetched
    
    try {
      console.log(`🔍 Fetching courses for college ID: ${collegeId}`);
      
      // Use the specific college courses endpoint
      const response = await fetch(`http://localhost:5002/api/courses/college/${collegeId}`);
      
      if (response.ok) {
        const data = await response.json();
        console.log(`📚 Courses data for college ${collegeId}:`, data);
        
        // The API returns { collegeId, courses, total }
        const courses = data.courses || [];
        
        if (courses && courses.length > 0) {
          // Transform the courses data to match expected format
          const transformedCourses = courses.map(course => ({
            id: course.id || course.course_name,
            name: course.course_name || course.name,
            specialization: course.branch || course.specialization,
            level: course.level,
            course_type: course.stream || course.course_type,
            duration: course.duration,
            total_seats: course.total_seats || 0,
            college_name: course.college_name
          }));
          
          console.log(`✅ Found ${transformedCourses.length} courses for college ${collegeId}:`, transformedCourses);
          
          setCollegeCourses(prev => ({
            ...prev,
            [collegeId]: transformedCourses
          }));
        } else {
          console.log(`⚠️ No courses found for college ${collegeId}`);
          setCollegeCourses(prev => ({
            ...prev,
            [collegeId]: []
          }));
        }
      } else {
        console.error(`❌ Failed to fetch courses for college ${collegeId}:`, response.status, response.statusText);
        // Set empty array to avoid repeated failed requests
        setCollegeCourses(prev => ({
          ...prev,
          [collegeId]: []
        }));
      }
    } catch (error) {
      console.error(`❌ Error fetching courses for college ${collegeId}:`, error);
      
      // Set empty array instead of mock data to show real API status
      setCollegeCourses(prev => ({
        ...prev,
        [collegeId]: []
      }));
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Dynamic Background */}
      {isDarkMode ? (
        <Vortex
          className="fixed inset-0 z-0"
          particleCount={600}
          baseHue={200}
          rangeHue={80}
          baseSpeed={0.15}
          rangeSpeed={1.8}
          baseRadius={1}
          rangeRadius={2.5}
          backgroundColor="#000000"
          containerClassName="fixed inset-0"
        >
          {/* Subtle overlay for text readability */}
          <div className="absolute inset-0 bg-black/30 z-10"></div>
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
          <div className="absolute inset-0 bg-gradient-to-br from-blue-50/30 via-indigo-50/20 to-purple-50/30 z-10"></div>
        </LightVortex>
      )}

      {/* Content */}
      <div className="relative z-20 min-h-screen flex flex-col">
        {/* Header - Same style as landing page */}
      <motion.header
          className="flex items-center justify-between p-8"
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: isLoaded ? 1 : 0, y: isLoaded ? 0 : -50 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-xl flex items-center justify-center">
              <GraduationCap className="w-8 h-8 text-white" />
            </div>
            <h1 className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>NeetLogIQ</h1>
          </div>

          <div className="flex items-center space-x-6 navbar">
            <nav className="hidden md:flex items-center space-x-8">
              <Link to="/" className={`${isDarkMode ? 'text-white/80 hover:text-white' : 'text-gray-600 hover:text-gray-900'} transition-colors`}>Home</Link>
              <Link to="/colleges" className={`${isDarkMode ? 'text-white' : 'text-gray-900'} font-semibold`}>Colleges</Link>
              <Link to="/courses" className={`${isDarkMode ? 'text-white/80 hover:text-white' : 'text-gray-600 hover:text-gray-900'} transition-colors`}>Courses</Link>
              <Link to="/cutoffs" className={`${isDarkMode ? 'text-white/80 hover:text-white' : 'text-gray-600 hover:text-gray-900'} transition-colors`}>Cutoffs</Link>
              <Link to="/about" className={`${isDarkMode ? 'text-white/80 hover:text-white' : 'text-gray-600 hover:text-gray-900'} transition-colors`}>About</Link>
            </nav>
            
            {/* Theme Toggle */}
            <ThemeToggle />
            
            {/* Authentication Section */}
            <div className="flex items-center gap-4">
              {isAuthenticated ? (
                <UserPopup />
              ) : (
                <GoogleSignIn text="signin" size="medium" width={120} />
              )}
            </div>
        </div>
      </motion.header>

      {/* Main Content */}
        <main className="flex-1 flex flex-col items-center justify-center px-8 py-16">
          <div className="text-center max-w-6xl w-full">
            {/* Page Title - Same style as landing page */}
            <motion.h1
              className={`text-5xl md:text-7xl font-bold mb-6 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: isLoaded ? 1 : 0, scale: isLoaded ? 1 : 0.8 }}
              transition={{ duration: 0.4, delay: 0.2 }}
            >
              Medical Colleges
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              className={`text-xl md:text-2xl mb-12 max-w-3xl mx-auto ${isDarkMode ? 'text-white/90' : 'text-gray-600'}`}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: isLoaded ? 1 : 0, y: isLoaded ? 0 : 30 }}
              transition={{ duration: 0.3, delay: 0.6 }}
            >
              Discover top medical colleges across India with detailed information, courses, and seat availability
            </motion.p>

            {/* Advanced Search Bar */}
            <motion.div
              className="max-w-3xl mx-auto mb-8"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: isLoaded ? 1 : 0, y: isLoaded ? 0 : 30 }}
              transition={{ duration: 0.3, delay: 0.8 }}
            >
              {/* Search Status */}
              <div className="text-center mb-4">
                <div className="flex items-center justify-center gap-3">
                  <div className="inline-flex items-center gap-2 bg-blue-500/20 text-blue-300 px-4 py-2 rounded-full text-sm">
                    <Database className="w-4 h-4" />
                                            {currentSearchQuery ? (
                          <>
                            Search Results: {colleges.length} colleges found for "{currentSearchQuery}"
                            {isAdvancedSearchLoading && <span className="animate-pulse"> (Searching...)</span>}
                          </>
                        ) : (
                      <>
                        Showing {colleges.length} colleges
                        {pagination.totalItems > 0 && ` of ${pagination.totalItems} total`}
                      </>
                    )}
            </div>
            
                  {currentSearchQuery && (
                    <button
                      onClick={() => searchColleges('')}
                      className="inline-flex items-center gap-2 bg-red-500/20 text-red-300 px-3 py-2 rounded-full text-sm hover:bg-red-500/30 transition-colors"
                    >
                      <X className="w-4 h-4" />
                      Clear Search
                    </button>
                  )}
                </div>
              </div>
                              <AdvancedSearchBar
                  placeholder="Search medical colleges with AI-powered algorithms..."
                  onSearchSubmit={searchColleges}
                  debounceMs={300}
                  advancedSearchService={searchService}
                  showAdvancedFeatures={isAdvancedSearchReady}
                />
            </motion.div>

            {/* API Status and Search Results Indicator */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: isLoaded ? 1 : 0, y: isLoaded ? 0 : 20 }}
              transition={{ delay: 0.9, duration: 0.4 }}
              className="flex items-center justify-center gap-4 mb-8 flex-wrap"
            >
              {apiStatus === 'connected' ? (
                <div className="flex items-center gap-2 bg-green-500/20 text-green-300 px-3 py-1 rounded-full text-sm">
                  <Wifi className="w-4 h-4" />
                  Backend Connected
                </div>
              ) : apiStatus === 'checking' ? (
                <div className="flex items-center gap-2 bg-yellow-500/20 text-yellow-300 px-3 py-1 rounded-full text-sm">
                  <Database className="w-4 h-4 animate-pulse" />
                  Checking Connection...
                </div>
              ) : (
                <div className="flex items-center gap-2 bg-red-500/20 text-red-300 px-3 py-1 rounded-full text-sm">
                  <WifiOff className="w-4 h-4" />
                  Backend Disconnected
                </div>
              )}
              
              {/* Advanced Search Status */}
              {isAdvancedSearchReady ? (
                <div className="flex items-center gap-2 bg-purple-500/20 text-purple-300 px-3 py-1 rounded-full text-sm">
                  <Sparkles className="w-4 h-4" />
                  AI Search Ready
                </div>
              ) : isAdvancedSearchLoading ? (
                <div className="flex items-center gap-2 bg-yellow-500/20 text-yellow-300 px-3 py-1 rounded-full text-sm">
                  <Zap className="w-4 h-4 animate-pulse" />
                  <div className="flex flex-col gap-1">
                    <span className="text-xs">{initializationProgress?.message || 'Loading AI Search...'}</span>
                    {initializationProgress?.progress > 0 && (
                      <div className="w-20 h-1 bg-yellow-500/30 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-yellow-400 transition-all duration-500 ease-out"
                          style={{ width: `${initializationProgress.progress}%` }}
                        ></div>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-2 bg-gray-500/20 text-gray-300 px-3 py-1 rounded-full text-sm">
                  <Zap className="w-4 h-4" />
                  {initializationProgress?.stage === 'waiting' ? 'Waiting for data...' : 'AI Search Offline'}
                </div>
              )}
              
              {/* Search Results Indicator */}
              {appliedFilters.search && (
                <div className="flex items-center gap-2 bg-blue-500/20 text-blue-300 px-3 py-1 rounded-full text-sm">
                  <Database className="w-4 h-4" />
                  Search: "{appliedFilters.search}" • {pagination.totalItems} results
                </div>
              )}
            </motion.div>

            {/* Debug Information */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: isLoaded ? 1 : 0, y: isLoaded ? 0 : 20 }}
              transition={{ delay: 0.8, duration: 0.4 }}
              className="mb-6 p-4 bg-blue-500/20 rounded-lg border border-blue-500/30"
            >
              <div className="text-center text-blue-300 text-sm">
                <div className="font-semibold mb-2">🔍 Debug Information</div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                  <div>
                    <span className="font-medium">Total Colleges:</span> {pagination.totalItems}
                  </div>
                  <div>
                    <span className="font-medium">Current Filters:</span> {Object.keys(appliedFilters).filter(k => appliedFilters[k]).join(', ') || 'None'}
                  </div>
                  <div>
                    <span className="font-medium">Page:</span> {pagination.page} of {pagination.totalPages}
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs mt-2">
                  <div>
                    <span className="font-medium">AI Search:</span> {isAdvancedSearchReady ? '✅ Ready' : isAdvancedSearchLoading ? `⏳ ${initializationProgress?.message || 'Loading'}` : `❌ ${initializationProgress?.stage === 'waiting' ? 'Waiting for data' : 'Offline'}`}
                    {initializationProgress?.progress > 0 && (
                      <span className="ml-2 text-xs text-blue-300">
                        ({Math.round(initializationProgress.progress)}%)
                      </span>
                    )}
                  </div>
                  <div>
                    <span className="font-medium">Search Type:</span> {currentSearchQuery ? 'AI + Backend' : 'Backend Only'}
                  </div>
                  <div>
                    <span className="font-medium">Advanced Features:</span> {isAdvancedSearchReady ? '🚀 Active' : '⚠️ Disabled'}
                  </div>
                </div>
                <div className="mt-3 flex justify-center gap-2">
                  <button
                    onClick={() => loadColleges(appliedFilters, 1)}
                    className="px-3 py-1 bg-blue-500/30 hover:bg-blue-500/50 text-blue-200 text-xs rounded border border-blue-400/50 transition-colors"
                  >
                    🔄 Refresh Data
                  </button>
                  <button
                    onClick={() => console.log('Current state:', { colleges: colleges.length, pagination, appliedFilters, filters })}
                    className="px-3 py-1 bg-green-500/30 hover:bg-green-500/50 text-green-200 text-xs rounded border border-green-400/50 transition-colors"
                  >
                    📊 Log State
                  </button>
                  <button
                    onClick={async () => {
                      if (searchService) {
                        const status = searchService.getStatus();
                        console.log('🔍 Advanced Search Service Status:', status);
                        
                        // Test search functionality
                        let testResult = 'Not tested';
                        if (status.isInitialized) {
                          try {
                            const test = await searchService.testSearch();
                            testResult = test.success ? '✅ Working' : `❌ Failed: ${test.error}`;
                          } catch (error) {
                            testResult = `❌ Error: ${error.message}`;
                          }
                        }
                        
                        alert(`AI Search Status:\n- Initialized: ${status.isInitialized}\n- Lunr Index: ${status.lunrIndex}\n- TF Model: ${status.tfModel}\n- Colleges: ${status.collegesCount}\n- Search Test: ${testResult}`);
                      } else {
                        alert('Advanced Search Service not available');
                      }
                    }}
                    className="px-3 py-1 bg-purple-500/30 hover:bg-purple-500/50 text-purple-200 text-xs rounded border border-purple-400/50 transition-colors"
                  >
                    🤖 AI Status & Test
                  </button>
                </div>
              </div>
            </motion.div>

            {/* Intelligent Filters */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: isLoaded ? 1 : 0, y: isLoaded ? 0 : 20 }}
              transition={{ delay: 1.0, duration: 0.4 }}
              className="mb-16"
            >
              <IntelligentFilters
                key={JSON.stringify(filters)} // Force re-render when filters change
                filters={filters}
                appliedFilters={appliedFilters}
                onFilterChange={handleFilterChange}
                onClearFilters={handleClearFilters}
                type="colleges"
              />
            </motion.div>



            {/* Colleges Grid */}
            <motion.div
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: isLoaded ? 1 : 0, y: isLoaded ? 0 : 30 }}
              transition={{ duration: 0.3, delay: 1.2 }}
            >
              {isLoading ? (
                // Beautiful loading animation
                <div className="col-span-full flex justify-center items-center py-16">
                  <BeautifulLoader size="large" showText={true} text="Loading colleges..." />
                </div>
              ) : colleges.length > 0 ? (
                colleges.map((college, index) => (
                <motion.div
                  key={college.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: isLoaded ? 1 : 0, y: isLoaded ? 0 : 20 }}
                  transition={{ delay: 1.4 + index * 0.1, duration: 0.4 }}
                  className={`backdrop-blur-md p-6 rounded-2xl border-2 transition-all shadow-lg ${
                    isDarkMode 
                      ? 'bg-white/10 border-white/20 hover:bg-white/20 shadow-white/10' 
                      : 'bg-green-50/40 border-green-200/60 hover:bg-green-50/50 shadow-green-200/30'
                  }`}
                >
                  <div className="text-center mb-4">
                    <div className="w-16 h-16 bg-primary-500/20 rounded-2xl flex items-center justify-center mx-auto mb-3">
                      <Building2 className="w-8 h-8 text-primary-400" />
                    </div>
                    <h3 className={`text-xl font-semibold mb-2 ${
                      isDarkMode ? 'text-white' : 'text-gray-900'
                    }`}>{college.name}</h3>
                  </div>
                  
                  {/* Reordered College Information */}
                                           <div className="space-y-2 mb-4">
                           <div className={`flex items-center justify-between text-sm ${
                             isDarkMode ? 'text-white/80' : 'text-gray-600'
                           }`}>
                             <span>Type: <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                               college.college_type === 'MEDICAL' ? 'bg-blue-100 text-blue-800 border border-blue-200' :
                               college.college_type === 'DENTAL' ? 'bg-green-100 text-green-800 border border-green-200' :
                               college.college_type === 'DNB' ? 'bg-purple-100 text-purple-800 border border-purple-200' :
                               'bg-gray-100 text-gray-800 border border-gray-200'
                             }`}>
                               {college.college_type || 'N/A'}
                             </span></span>
                             <span>State: {college.state || 'N/A'}</span>
                           </div>
                           <div className={`flex items-center justify-between text-sm ${
                             isDarkMode ? 'text-white/80' : 'text-gray-600'
                           }`}>
                             <span>Est. {college.establishment_year || 'N/A'}</span>
                             <span>Management: {college.management_type || 'N/A'}</span>
                           </div>
                         </div>

                  {/* University Information */}
                  <div className="mb-4">
                    <div className={`p-3 rounded-lg border-2 backdrop-blur-md shadow-md ${
                      isDarkMode 
                        ? 'bg-white/10 border-white/20 shadow-white/5' 
                        : 'bg-green-50/35 border-green-200/50 shadow-green-200/20'
                    }`}>
                      <div className="text-center">
                        <div className={`text-xs mb-1 ${
                          isDarkMode ? 'text-white/70' : 'text-gray-600'
                        }`}>University</div>
                        <div className={`text-xs font-medium leading-tight ${
                          isDarkMode ? 'text-white' : 'text-gray-900'
                        }`}>
                          {college.university || 'N/A'}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Expandable Courses Section */}
                  <div className="mb-4">
                    <button
                      onClick={() => toggleCardExpansion(college.id)}
                      className={`w-full flex items-center justify-between text-sm font-semibold transition-colors p-3 rounded-lg ${
                        isDarkMode 
                          ? 'text-white/90 hover:text-white bg-white/10 hover:bg-white/20' 
                          : 'text-gray-700 hover:text-gray-900 bg-gray-100/80 hover:bg-gray-200/80'
                      }`}
                    >
                      <span>View Courses</span>
                      {expandedCards.has(college.id) ? (
                        <ChevronUp className="w-4 h-4" />
                      ) : (
                        <ChevronDown className="w-4 h-4" />
                      )}
                    </button>
                    
                    {expandedCards.has(college.id) && (
                      <div className="mt-4 space-y-2">
                        <div className="max-h-48 overflow-y-auto space-y-2 courses-scroll-container">
                          {collegeCourses[college.id] ? (
                            collegeCourses[college.id].length > 0 ? (
                              collegeCourses[college.id].map((course, courseIndex) => (
                                                                  <div key={courseIndex} className={`p-3 rounded-lg border-2 backdrop-blur-md shadow-md ${
                                                                    isDarkMode 
                                                                      ? 'bg-white/10 border-white/20 shadow-white/5' 
                                                                      : 'bg-green-50/35 border-green-200/50 shadow-green-200/20'
                                                                  }`}>
                                    <div className="flex justify-between items-center">
                                      <h5 className={`font-semibold text-sm flex-1 pr-3 ${
                                        isDarkMode ? 'text-white' : 'text-gray-900'
                                      }`}>{course.name}</h5>
                                      <span className={`text-xs px-2 py-1 rounded-full font-medium border whitespace-nowrap ${
                                        isDarkMode 
                                          ? 'bg-primary-500/20 text-primary-300 border-primary-500/30' 
                                          : 'bg-blue-100 text-blue-800 border-blue-300'
                                      }`}>
                                        {course.total_seats} seats
                                      </span>
                                    </div>
                                  </div>
                              ))
                            ) : (
                              <div className={`p-3 rounded-lg border-2 backdrop-blur-md shadow-md ${
                                isDarkMode 
                                  ? 'bg-white/10 border-white/20 shadow-white/5' 
                                  : 'bg-green-50/35 border-green-200/50 shadow-green-200/20'
                              }`}>
                                <div className={`text-center text-xs ${
                                  isDarkMode ? 'text-white/70' : 'text-gray-600'
                                }`}>
                                  <div className="mb-2">⚠️ Backend API not available</div>
                                  <div className={`text-xs ${
                                    isDarkMode ? 'text-white/50' : 'text-gray-500'
                                  }`}>
                                    Please start the backend server to view real courses data
                                  </div>
                                </div>
                              </div>
                            )
                          ) : (
                            <div className={`p-3 rounded-lg border-2 backdrop-blur-md shadow-md ${
                              isDarkMode 
                                ? 'bg-white/10 border-white/20 shadow-white/5' 
                                : 'bg-green-50/35 border-green-200/50 shadow-green-200/20'
                            }`}>
                              <div className="text-center">
                                <BeautifulLoader size="small" showText={true} text="Loading courses..." />
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>
                ))
              ) : (
                // No colleges found
                <div className="col-span-full text-center py-12">
                  <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Building2 className="w-8 h-8 text-white/50" />
                  </div>
                  <h3 className={`text-xl font-semibold mb-2 ${
                    isDarkMode ? 'text-white' : 'text-gray-900'
                  }`}>No Colleges Found</h3>
                  <p className={isDarkMode ? 'text-white/70' : 'text-gray-600'}>Try adjusting your filters or search criteria</p>
                </div>
              )}
            </motion.div>

            {/* Enhanced Pagination */}
            {pagination.totalPages > 1 && (
              <motion.div
                className="flex flex-col items-center gap-4 mb-12"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: isLoaded ? 1 : 0, y: isLoaded ? 0 : 20 }}
                transition={{ delay: 1.3, duration: 0.4 }}
              >
                {/* Loading indicator for pagination */}
                {isLoading && (
                  <div className={`text-sm flex items-center gap-2 ${
                    isDarkMode ? 'text-white/70' : 'text-gray-600'
                  }`}>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white/70"></div>
                    Loading colleges...
                  </div>
                )}
                
                {/* Pagination Info */}
                <div className={`text-sm text-center ${
                  isDarkMode ? 'text-white/70' : 'text-gray-600'
                }`}>
                  <div className="mb-1">
                    Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.totalItems)} of {pagination.totalItems} colleges
                  </div>
                  <div className={`text-xs ${
                    isDarkMode ? 'text-white/50' : 'text-gray-500'
                  }`}>
                    Page {pagination.page} of {pagination.totalPages} • {pagination.limit} colleges per page
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
                            1 === currentPage
                              ? isDarkMode ? 'bg-white/30 text-white' : 'bg-blue-500 text-white'
                              : isDarkMode ? 'bg-white/10 text-white/70 hover:bg-white/20' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          1
                        </button>
                      );
                      
                      // Show ellipsis if we're far from the beginning
                      if (currentPage > 4) {
                        pages.push(
                          <span key="ellipsis1" className={`px-2 py-2 text-sm ${
                            isDarkMode ? 'text-white/50' : 'text-gray-500'
                          }`}>
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
                                  ? isDarkMode ? 'bg-white/30 text-white' : 'bg-blue-500 text-white'
                                  : isDarkMode ? 'bg-white/10 text-white/70 hover:bg-white/20' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
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
                          <span key="ellipsis2" className={`px-2 py-2 text-sm ${
                            isDarkMode ? 'text-white/50' : 'text-gray-500'
                          }`}>
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
                                ? isDarkMode ? 'bg-white/30 text-white' : 'bg-blue-500 text-white'
                                : isDarkMode ? 'bg-white/10 text-white/70 hover:bg-white/20' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
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
                      handlePageChange(1);
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
          transition={{ duration: 0.3, delay: 2.0 }}
        >
          <p>&copy; 2024 NeetLogIQ. All rights reserved. Built with ❤️ for medical aspirants.</p>
        </motion.footer>
        </div>
        <BackToTopButton />
    </div>
  );
};

export default Colleges;
