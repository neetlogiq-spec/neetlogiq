// AI-Generated React Page Template
// Generated for: Colleges
// Template: react-page
// Date: 2025-08-28

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { motion } from 'framer-motion';
import { Building2, GraduationCap } from 'lucide-react';
import { Link } from 'react-router-dom';
import IntelligentFilters from '../components/IntelligentFilters';
import ResponsiveHeader from '../components/ResponsiveHeader';
import CollegeCard from '../components/ResponsiveCollegeCard';
import CollegeDetailsModal from '../components/CollegeDetailsModal';
import UnifiedSearchBar from '../components/UnifiedSearchBar';
import BlurredOverlay from '../components/BlurredOverlay';
import InfiniteScrollTrigger from '../components/InfiniteScrollTrigger';
import CollegeCardSkeleton from '../components/CollegeCardSkeleton';
import apiService from '../services/apiService';
import securityService from '../services/securityService';
import { useAdvancedSearch } from '../hooks/useAdvancedSearch';
import { useUnifiedSearch } from '../hooks/useUnifiedSearch';
import BeautifulLoader from '../components/BeautifulLoader';
import BackToTopButton from '../components/BackToTopButton';
import GoogleSignIn from '../components/GoogleSignIn';
import UserPopup from '../components/UserPopup';
import { useAuth } from '../contexts/AuthContext';
import { Vortex } from '../components/ui/vortex';
import { LightVortex } from '../components/ui/LightVortex';
import { useTheme } from '../context/ThemeContext';
import ThemeToggle from '../components/ThemeToggle';
import AICommandPalette from '../components/AICommandPalette';

const Colleges = () => {
  const [isLoaded, setIsLoaded] = useState(false);
  const { isAuthenticated } = useAuth();
  const { isDarkMode } = useTheme();
  const [isAICommandPaletteOpen, setIsAICommandPaletteOpen] = useState(false);



  
  // Backend integration state
  const [colleges, setColleges] = useState([]);
  const [filters, setFilters] = useState({});
  const [appliedFilters, setAppliedFilters] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false); // Separate state for infinite scroll
  const [currentSearchQuery, setCurrentSearchQuery] = useState('');
  // const [isSearching, setIsSearching] = useState(false); // Removed unused state

  // Modal state management
  const [selectedCollege, setSelectedCollege] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCollegeCourses, setSelectedCollegeCourses] = useState([]);
  const [isModalLoading, setIsModalLoading] = useState(false);

  // Debug courses state changes
  useEffect(() => {
    console.log('🔍 selectedCollegeCourses changed:', selectedCollegeCourses.length, 'courses');
  }, [selectedCollegeCourses]);

  const [pagination, setPagination] = useState({
    page: 1,
    limit: 24, // 3x8 grid = 24 college cards per page
    totalPages: 1,
    totalItems: 0
  });

  // State for all colleges (used for search index)
  const [allCollegesForSearch, setAllCollegesForSearch] = useState([]);
  const [searchIndexLoading, setSearchIndexLoading] = useState(false);
  const [searchIndexProgress, setSearchIndexProgress] = useState(0);
  const [searchIndexComplete, setSearchIndexComplete] = useState(false);
  const [searchIndexLoaded, setSearchIndexLoaded] = useState(false);
  
  // Ref to track if initialization has already happened
  const isInitialized = useRef(false);
  
  // Memoize the search data to prevent infinite re-renders
  const searchData = useMemo(() => {
    return allCollegesForSearch.length > 0 ? allCollegesForSearch : [];
  }, [allCollegesForSearch]);
  
  // Advanced search hook - initialized with ALL colleges, not just current page
  useAdvancedSearch(searchData);

  // Unified search integration
  useUnifiedSearch(searchData, { contentType: 'colleges' });


  // Handle opening college details modal
  const handleOpenModal = useCallback(async (college) => {
    console.log('🔍 Opening modal for college:', college.name);
    setSelectedCollege(college);
    setIsModalLoading(true);
    setIsModalOpen(true);
    
    // Fetch courses for the selected college
    try {
      console.log('🔍 Fetching courses for college ID:', college.id);
      console.log('🔍 API URL will be:', `${process.env.REACT_APP_API_URL || 'https://neetlogiq-backend.neetlogiq.workers.dev'}/api/courses?college_id=${college.id}`);
      
      const response = await apiService.getCoursesByCollege(college.id);
      console.log('📚 Full API response for college', college.id, ':', response);
      
      if (response && response.data && Array.isArray(response.data)) {
        console.log('📚 Sample course data:', response.data[0]);
        setSelectedCollegeCourses(response.data);
        console.log('✅ Found', response.data.length, 'courses for college', college.id, ':', response.data);
      } else {
        console.log('⚠️ No courses data received for college', college.id, 'Response structure:', response);
        setSelectedCollegeCourses([]);
      }
    } catch (error) {
      console.error('❌ Failed to fetch courses for college', college.id, ':', error);
      setSelectedCollegeCourses([]);
    } finally {
      setIsModalLoading(false);
    }
  }, []);

  // Handle closing college details modal
  const handleCloseModal = useCallback(() => {
    console.log('🔍 Closing modal');
    setIsModalOpen(false);
    setSelectedCollege(null);
    setSelectedCollegeCourses([]);
    setIsModalLoading(false);
    
    // Don't reset scroll position ref - let the user stay where they were
    // scrollPositionRef.current = 0;
  }, []);

  // Load colleges from backend with optimized loading
  const loadColleges = useCallback(async (newFilters = {}, newPage = 1, isAppend = false) => {
    // Don't load default colleges if there's an active search
    if (currentSearchQuery && currentSearchQuery.trim() !== '') {
      console.log('🔍 Skipping loadColleges - active search in progress');
      return;
    }
    
    try {
      // Use different loading states based on whether we're appending or replacing
      if (isAppend) {
        setIsLoadingMore(true);
      } else {
        setIsLoading(true);
      }
      console.log('🔍 Loading colleges with filters:', newFilters, 'page:', newPage, 'append:', isAppend);
      
      // Use optimal chunk size for fast loading
      const chunkSize = 24; // Load 24 colleges at a time for fast initial load
      
      // Direct API call for faster loading (cache is handled by browser)
      const response = await apiService.getColleges(newFilters, newPage, chunkSize);
      
      console.log('🔍 API Response:', response);
      console.log('🔍 API Response keys:', Object.keys(response));
      console.log('🔍 Total colleges from API:', response.pagination?.totalItems);
      console.log('🔍 Colleges data length:', response.data?.length);
      console.log('🔍 Response.data exists:', !!response.data);
      console.log('🔍 Response.colleges exists:', !!response.colleges);
      
      // Append or replace data based on isAppend flag
      if (isAppend && newPage > 1) {
        setColleges(prevColleges => {
          // Filter out duplicates based on college.id
          const existingIds = new Set(prevColleges.map(college => college.id));
          const newColleges = (response.data || []).filter(college => !existingIds.has(college.id));
          console.log('📍 Adding new colleges:', newColleges.length, 'Total will be:', prevColleges.length + newColleges.length);
          return [...prevColleges, ...newColleges];
        });
        
        // Update pagination to reflect the new page
        setPagination(prevPagination => ({
          ...prevPagination,
          page: newPage,
          hasNext: response.pagination?.hasNext || false,
          totalItems: response.pagination?.totalItems || prevPagination.totalItems
        }));
      } else {
        setColleges(response.data || []);
        setPagination(response.pagination || {
          page: newPage,
          limit: chunkSize,
          totalPages: 1,
          totalItems: 0
        });
      }
      
      // Note: API response doesn't include filters, they are managed separately
    } catch (error) {
      console.error('Failed to load colleges:', error);
      if (!isAppend) {
        setColleges([]);
      }
    } finally {
      // Reset both loading states
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  }, [currentSearchQuery]); // Remove pagination.limit dependency

  // Note: API status check removed for faster loading

  // Load all colleges for search index (hybrid approach - progressive loading)
  const loadAllCollegesForSearch = useCallback(async () => {
    // Prevent multiple simultaneous loads
    if (searchIndexLoading || searchIndexLoaded) {
      console.log('🔍 Search index already loading or loaded, skipping...');
      return;
    }
    
    try {
      setSearchIndexLoading(true);
      setSearchIndexProgress(0);
      console.log('🔍 Loading all colleges for search index (hybrid approach)...');
      
      // First, get the total count
      const countResponse = await apiService.getColleges({}, 1, 1);
      const totalColleges = countResponse.pagination?.totalItems || 2401;
      console.log(`🔍 Total colleges in database: ${totalColleges}`);
      
      // Load ALL colleges in optimized parallel chunks for complete search coverage
      const chunkSize = 500; // Larger chunks for fewer parallel requests (faster)
      const totalChunks = Math.ceil(totalColleges / chunkSize);
      console.log(`🔍 Loading ${totalColleges} colleges in ${totalChunks} parallel chunks of ${chunkSize}...`);
      
      // Create parallel promises for all chunks
      const chunkPromises = [];
      for (let chunk = 1; chunk <= totalChunks; chunk++) {
        const promise = apiService.getColleges({}, chunk, chunkSize)
          .then(response => {
            if (response && response.data) {
              console.log(`🔍 Chunk ${chunk}/${totalChunks}: Loaded ${response.data.length} colleges`);
              // Update progress
              setSearchIndexProgress(prev => Math.min(prev + (100 / totalChunks), 100));
              return response.data;
            }
            return [];
          })
          .catch(error => {
            console.error(`Failed to load chunk ${chunk}:`, error);
            return [];
          });
        chunkPromises.push(promise);
      }
      
      // Wait for all chunks to load in parallel
      const chunkResults = await Promise.all(chunkPromises);
      
      // Combine all results
      const allColleges = chunkResults.flat();
      console.log(`🔍 Final: Loaded ${allColleges.length} colleges for complete search index`);
      setAllCollegesForSearch(allColleges);
      setSearchIndexLoading(false);
      setSearchIndexProgress(100);
      setSearchIndexComplete(true);
      setSearchIndexLoaded(true);
      
      // Hide completion message after 3 seconds
      setTimeout(() => {
        setSearchIndexComplete(false);
      }, 3000);
      
    } catch (error) {
      console.error('Failed to load all colleges for search:', error);
      setSearchIndexLoading(false);
      // Don't set searchIndexLoaded to true on error, so it can retry
    }
  }, [searchIndexLoading, searchIndexLoaded]);

  // Load available filters from backend (optimized)
  const loadFilters = async () => {
    try {
      // Direct API call for faster loading (browser handles caching)
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
    }, 50); // Further reduced for even snappier feel
    return () => clearTimeout(timer);
  }, []);

  // Note: Cache clearing removed for faster loading - browser cache is sufficient

  // Backend integration - ultra-fast loading
  useEffect(() => {
    // Prevent double initialization
    if (isInitialized.current) {
      return;
    }
    
    const initializeData = async () => {
      try {
        console.log('🚀 Starting ultra-fast data loading...');
        const startTime = performance.now();
        
        // Load colleges first for instant display
        await loadColleges();
        console.log('✅ Colleges loaded, page is now interactive');
        
        // Load background data immediately for faster performance
        Promise.all([
          loadFilters(),
          loadAllCollegesForSearch(),
          // Preload next page for faster infinite scroll
          apiService.getColleges({}, 2, 24).then(response => {
            if (response && response.data) {
              console.log('🚀 Preloaded next page of colleges for faster infinite scroll');
            }
          }).catch(error => {
            console.log('Preload failed (non-critical):', error);
          })
        ]).then(() => {
          console.log('✅ Background data loaded');
        }).catch(error => {
          console.error('Background data loading failed (non-critical):', error);
        });
        
        const endTime = performance.now();
        console.log(`🚀 Ultra-fast loading completed in ${Math.round(endTime - startTime)}ms`);
        
        // Mark as initialized
        isInitialized.current = true;
        
      } catch (error) {
        console.error('Failed to initialize data:', error);
      }
    };

    initializeData();
  }, [loadColleges, loadAllCollegesForSearch]); // Include dependencies but use ref to prevent double execution

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

  // Load more colleges function for infinite scroll
  const loadMoreColleges = useCallback(() => {
    if (isLoading || isLoadingMore || !pagination.hasNext || isModalOpen) {
      console.log('🔄 Load more blocked:', { isLoading, isLoadingMore, hasNext: pagination.hasNext, isModalOpen });
      return;
    }
    
    const nextPage = pagination.page + 1;
    console.log('🔄 Loading more colleges, page:', nextPage);
    loadColleges(appliedFilters, nextPage, true); // Append mode
  }, [isLoading, isLoadingMore, pagination.hasNext, pagination.page, appliedFilters, loadColleges, isModalOpen]);










  return (
    <BlurredOverlay>
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
        {/* Header - Original Design for Desktop, Responsive for Mobile */}
        <div className="hidden md:block">
      <motion.header
            className="flex items-center justify-between p-8"
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: isLoaded ? 1 : 0, y: isLoaded ? 0 : -50 }}
            transition={{ duration: 0.2, delay: 0.05 }}
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
                  <GoogleSignIn text="Sign In" size="medium" width={100} />
                )}
              </div>
            </div>
          </motion.header>
        </div>

        {/* Mobile Header */}
        <div className="md:hidden">
          <ResponsiveHeader />
        </div>

      {/* Main Content */}
        <main className="flex-1 flex flex-col items-center justify-center px-4 sm:px-8 py-8">
          <div className="text-center max-w-6xl w-full">
            {/* Page Title - Same style as landing page */}
            <motion.h1
              className={`text-5xl md:text-7xl font-bold mb-6 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: isLoaded ? 1 : 0, scale: isLoaded ? 1 : 0.8 }}
              transition={{ duration: 0.25, delay: 0.1 }}
            >
              Medical Colleges
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              className={`text-xl md:text-2xl mb-12 max-w-3xl mx-auto ${isDarkMode ? 'text-white/90' : 'text-gray-600'}`}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: isLoaded ? 1 : 0, y: isLoaded ? 0 : 30 }}
              transition={{ duration: 0.2, delay: 0.15 }}
            >
              Discover top medical colleges across India with detailed information, courses, and seat availability
            </motion.p>

            {/* Advanced Search Bar */}
            <motion.div
              className="max-w-3xl mx-auto mb-8"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: isLoaded ? 1 : 0, y: isLoaded ? 0 : 30 }}
              transition={{ duration: 0.2, delay: 0.2 }}
            >
                              <UnifiedSearchBar
                  placeholder="Search medical colleges with unified AI intelligence..."
                  collegesData={colleges}
                  onSearchResults={async (searchResult) => {
                    console.log("🔍 Unified search results received:", searchResult);
                    
                    // Security validation
                    if (searchResult && searchResult.query) {
                      const validation = securityService.validateSearchInput(searchResult.query);
                      if (!validation.isValid) {
                        console.warn('🚨 Invalid search query blocked:', validation.error);
                        securityService.logSecurityEvent('INVALID_SEARCH_QUERY', {
                          query: searchResult.query,
                          error: validation.error
                        });
                        return;
                      }
                    }
                    
                    if (searchResult && searchResult.results && searchResult.results.length > 0) {
                      console.log("🔍 Setting colleges to unified search results:", searchResult.results.length, "colleges");
                      setColleges(searchResult.results);
                      setCurrentSearchQuery(searchResult.query || "Search Results");
                      setPagination({
                        page: 1,
                        limit: searchResult.results.length,
                        totalPages: 1,
                        totalItems: searchResult.results.length
                      });
                      console.log("✅ Colleges state updated successfully");
                    } else if (searchResult && searchResult.searchType === 'none') {
                      // Only clear search when explicitly clearing (searchType: 'none')
                      console.log("🔍 Clearing search results");
                      setCurrentSearchQuery('');
                      // Reset pagination to default values
                      setPagination({
                        page: 1,
                        limit: 24,
                        totalPages: 1,
                        totalItems: 0
                      });
                      // Load default colleges
                      loadColleges(appliedFilters, 1);
                    } else if (searchResult && searchResult.query) {
                      // Use FTS5 search for ultra-fast results
                      try {
                        console.log("🔍 Using FTS5 search for:", searchResult.query);
                        const fts5Results = await apiService.searchCollegesFTS5(searchResult.query, 1, 50);
                        
                        if (fts5Results.data && fts5Results.data.length > 0) {
                          console.log("🔍 FTS5 search results:", fts5Results.data.length, "colleges");
                          setColleges(fts5Results.data);
                          setCurrentSearchQuery(searchResult.query);
                          setPagination({
                            page: 1,
                            limit: fts5Results.data.length,
                            totalPages: fts5Results.pagination.totalPages,
                            totalItems: fts5Results.pagination.totalItems
                          });
                        } else {
                          // Fallback to advanced search
                          console.log("🔄 FTS5 returned no results, trying advanced search...");
                          const advancedResults = await apiService.advancedSearch(searchResult.query, {
                            type: 'colleges',
                            limit: 50,
                            threshold: 0.3
                          });
                          
                          if (advancedResults.results && advancedResults.results.length > 0) {
                            console.log("🚀 Advanced search results:", advancedResults.results.length, "colleges");
                            setColleges(advancedResults.results);
                            setCurrentSearchQuery(searchResult.query);
                            setPagination({
                              page: 1,
                              limit: advancedResults.results.length,
                              totalPages: 1,
                              totalItems: advancedResults.total
                            });
                          }
                        }
                      } catch (error) {
                        console.error("FTS5 search failed:", error);
                        // Fallback to regular search results
                        if (searchResult.results && searchResult.results.length > 0) {
                          setColleges(searchResult.results);
                          setCurrentSearchQuery(searchResult.query);
                        }
                      }
                    } else {
                      console.log("🔍 No search results to display");
                      // Don't clear colleges array for empty results
                    }
                  }}
                  debounceMs={300}
                  contentType="colleges"
                  showAdvancedFeatures={false}
                  showPerformanceMetrics={true}
                />
                
                {/* Search Index Loading Progress Indicator */}
                {searchIndexLoading && (
                  <motion.div
                    className="mt-4 p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
                        🔍 Building complete search index...
                      </span>
                      <span className="text-xs text-blue-600 dark:text-blue-400">
                        {Math.round(searchIndexProgress)}%
                      </span>
                    </div>
                    <div className="w-full bg-blue-200 dark:bg-blue-800 rounded-full h-2">
                      <div 
                        className="bg-blue-600 dark:bg-blue-400 h-2 rounded-full transition-all duration-300 ease-out"
                        style={{ width: `${searchIndexProgress}%` }}
                      ></div>
                    </div>
                    <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                      Loading all 2401 colleges for comprehensive search results
                    </p>
                  </motion.div>
                )}
                
                {/* Search Index Completion Message */}
                {searchIndexComplete && (
                  <motion.div
                    className="mt-4 p-3 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="flex items-center">
                      <span className="text-sm font-medium text-green-700 dark:text-green-300">
                        ✅ Complete search index ready! All 2401 colleges loaded for comprehensive search results.
                      </span>
            </div>
                  </motion.div>
                )}
            </motion.div>

            {/* API Status and Search Results Indicator */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: isLoaded ? 1 : 0, y: isLoaded ? 0 : 20 }}
              transition={{ delay: 0.25, duration: 0.2 }}
              className="flex items-center justify-center gap-4 mb-8 flex-wrap"
            >
            </motion.div>


            {/* Intelligent Filters */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: isLoaded ? 1 : 0, y: isLoaded ? 0 : 20 }}
              transition={{ delay: 0.35, duration: 0.2 }}
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
              transition={{ duration: 0.2, delay: 0.4 }}
            >
              {isLoading ? (
                // Beautiful loading animation for initial load
                <div className="col-span-full flex justify-center items-center py-16">
                  <BeautifulLoader size="large" showText={true} text="Loading colleges..." />
                </div>
              ) : colleges.length > 0 ? (
                <>
                  {/* Existing college cards */}
                  {colleges.map((college, index) => (
                    <CollegeCard 
                      key={`college-${college.id}-${index}`}
                      college={college} 
                      index={index}
                      courses={[]}
                      onOpenModal={handleOpenModal}
                    />
                  ))}
                  
                  {/* Skeleton cards for loading more */}
                  {isLoadingMore && (
                    <>
                      {Array.from({ length: 6 }).map((_, skeletonIndex) => (
                        <CollegeCardSkeleton 
                          key={`skeleton-${skeletonIndex}`} 
                          index={skeletonIndex}
                        />
                      ))}
                    </>
                  )}
                </>
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

            {/* Infinite Scroll Trigger - loads more colleges when user reaches 80% of current content */}
            {colleges.length > 0 && pagination.hasNext && (
              <InfiniteScrollTrigger
                onLoadMore={loadMoreColleges}
                hasMore={pagination.hasNext}
                isLoading={isLoadingMore}
                threshold={0.8}
                rootMargin="200px"
              >
                {/* Loading indicator is now handled by skeleton cards in the grid */}
              </InfiniteScrollTrigger>
            )}

            {/* End of content indicator */}
            {colleges.length > 0 && !pagination.hasNext && (
              <div className="col-span-full text-center py-8">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300">
                  <GraduationCap className="w-4 h-4" />
                  <span className="text-sm font-medium">You've reached the end! All colleges loaded.</span>
                </div>
              </div>
            )}

            {/* Enhanced Pagination */}
            {pagination.totalPages > 1 && (
              <motion.div
                className="flex flex-col items-center gap-4 mb-12"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: isLoaded ? 1 : 0, y: isLoaded ? 0 : 20 }}
                transition={{ delay: 0.5, duration: 0.2 }}
              >
                {/* Loading indicator for pagination */}
                {(isLoading || isLoadingMore) && (
                  <div className={`text-sm flex items-center gap-2 ${
                    isDarkMode ? 'text-white/70' : 'text-gray-600'
                  }`}>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white/70"></div>
                    {isLoading ? 'Loading colleges...' : 'Loading more colleges...'}
                  </div>
                )}
                
                {/* Pagination Info */}
                <div className={`text-sm text-center ${
                  isDarkMode ? 'text-white/70' : 'text-gray-600'
                }`}>
                </div>
                
                {/* Load More Button - Replaces pagination for better UX */}
                {pagination.hasNext && (
                  <div className="flex justify-center">
                    <button
                      onClick={loadMoreColleges}
                      disabled={isLoading || isLoadingMore}
                      className={`px-8 py-3 rounded-lg font-medium transition-all duration-200 ${
                        (isLoading || isLoadingMore)
                          ? 'opacity-50 cursor-not-allowed'
                          : isDarkMode
                          ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:from-blue-600 hover:to-purple-700 shadow-lg hover:shadow-xl'
                          : 'bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:from-blue-600 hover:to-purple-700 shadow-lg hover:shadow-xl'
                      }`}
                    >
                      {(isLoading || isLoadingMore) ? (
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                          Loading...
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <span>Load More Colleges</span>
                          <span className="text-sm opacity-80">
                            ({pagination.totalItems - colleges.length} remaining)
                          </span>
                        </div>
                      )}
                    </button>
                  </div>
                )}
                
                {/* Results Summary */}
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
          transition={{ duration: 0.2, delay: 0.6 }}
        >
          <p>&copy; 2025 NeetLogIQ. All rights reserved. Built with ❤️ for medical aspirants.</p>
        </motion.footer>
        </div>
        <BackToTopButton />
        
        {/* AI Command Palette - Available via Ctrl+K */}
        <AICommandPalette 
          isVisible={isAICommandPaletteOpen}
          onClose={() => setIsAICommandPaletteOpen(false)}
        />
    </div>

    {/* College Details Modal */}
    <CollegeDetailsModal
      isOpen={isModalOpen}
      onClose={handleCloseModal}
      college={selectedCollege}
      courses={selectedCollegeCourses}
      isLoading={isModalLoading}
    />

    {/* Security Test Panel */}
    </BlurredOverlay>
  );
};

export default Colleges;
