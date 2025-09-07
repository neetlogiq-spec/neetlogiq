// AI-Generated React Page Template
// Generated for: Colleges
// Template: react-page
// Date: 2025-08-28

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import { Building2, GraduationCap } from 'lucide-react';
import { Link } from 'react-router-dom';
import IntelligentFilters from '../components/IntelligentFilters';
import ResponsiveHeader from '../components/ResponsiveHeader';
import CollegeCard from '../components/ResponsiveCollegeCard';
import CollegeDetailsModal from '../components/CollegeDetailsModal';
import UnifiedSearchBar from '../components/UnifiedSearchBar';
import BlurredOverlay from '../components/BlurredOverlay';
import apiService from '../services/apiService';
import cacheService from '../services/cacheService';
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
  const [currentSearchQuery, setCurrentSearchQuery] = useState('');
  // const [isSearching, setIsSearching] = useState(false); // Removed unused state

  // Modal state management
  const [selectedCollege, setSelectedCollege] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCollegeCourses, setSelectedCollegeCourses] = useState([]);

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
  
  
  // Advanced search hook - initialized with ALL colleges, not just current page
  useAdvancedSearch(allCollegesForSearch);

  // Unified search integration
  useUnifiedSearch(allCollegesForSearch, { contentType: 'colleges' });


  // Handle opening college details modal
  const handleOpenModal = useCallback(async (college) => {
    console.log('🔍 Opening modal for college:', college.name);
    setSelectedCollege(college);
    
    // Fetch courses for the selected college first
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
    }
    
    // Open modal after courses are fetched
    setIsModalOpen(true);
  }, []);

  // Handle closing college details modal
  const handleCloseModal = useCallback(() => {
    console.log('🔍 Closing modal');
    setIsModalOpen(false);
    setSelectedCollege(null);
    setSelectedCollegeCourses([]);
  }, []);

  // Load colleges from backend with chunked loading
  const loadColleges = useCallback(async (newFilters = {}, newPage = 1, isAppend = false) => {
    // Don't load default colleges if there's an active search
    if (currentSearchQuery && currentSearchQuery.trim() !== '') {
      console.log('🔍 Skipping loadColleges - active search in progress');
      return;
    }
    
    // Rate limiting check
    const rateLimit = securityService.checkRateLimit('colleges_api', 20, 60000); // 20 requests per minute
    if (!rateLimit.allowed) {
      console.warn('🚨 Rate limit exceeded for colleges API');
      securityService.logSecurityEvent('RATE_LIMIT_EXCEEDED', {
        endpoint: 'colleges_api',
        remaining: rateLimit.remaining,
        resetTime: rateLimit.resetTime
      });
      return;
    }
    
    try {
      setIsLoading(true);
      console.log('🔍 Loading colleges with filters:', newFilters, 'page:', newPage, 'append:', isAppend);
      
      // Use smaller chunks for better performance
      const chunkSize = 12; // Load 12 colleges at a time instead of 24
      
      // Use cache service for better performance
      const response = await cacheService.cacheApiCall(
        () => apiService.getColleges(newFilters, newPage, chunkSize),
        'colleges',
        { filters: JSON.stringify(newFilters), page: newPage, limit: chunkSize },
        5 * 60 * 1000 // 5 minutes cache
      );
      
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
      setIsLoading(false);
    }
  }, [currentSearchQuery]); // Remove pagination.limit dependency

  // Check API connection status
  const checkApiStatus = async () => {
    try {
      const status = await apiService.getApiStatus();
      console.log('API Status:', status.status);
    } catch (error) {
      console.error('API Status check failed:', error);
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
      // Use cache service for filters (longer TTL since filters don't change often)
      const filterData = await cacheService.cacheApiCall(
        () => apiService.getCollegeFilters(),
        'college-filters',
        {},
        30 * 60 * 1000 // 30 minutes cache
      );
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
    }, 100); // Reduced from 200ms to 100ms for snappier feel
    return () => clearTimeout(timer);
  }, []);

  // Backend integration with parallel chunked loading
  useEffect(() => {
    const initializeData = async () => {
      try {
        console.log('🚀 Starting parallel chunked data loading...');
        const startTime = performance.now();
        
        // Load critical data first (API status + filters + first page of colleges)
        const criticalDataPromise = Promise.all([
          checkApiStatus(),
          loadFilters(),
          loadColleges()
        ]);
        
        // Load search data in parallel (non-blocking)
        const searchDataPromise = loadAllCollegesForSearch();
        
        // Wait for critical data first
        await criticalDataPromise;
        console.log('✅ Critical data loaded, page is now interactive');
        
        // Load search data in background
        searchDataPromise.then(() => {
          console.log('✅ Search data loaded in background');
        }).catch(error => {
          console.error('Search data loading failed (non-critical):', error);
        });
        
        // Warm up cache with common queries (non-blocking)
        cacheService.warmUpCache(apiService).catch(error => {
          console.error('Cache warm-up failed (non-critical):', error);
        });
        
        const endTime = performance.now();
        console.log(`🚀 Parallel loading completed in ${Math.round(endTime - startTime)}ms`);
        
      } catch (error) {
        console.error('Failed to initialize data:', error);
      }
    };

    initializeData();
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

  // Load more colleges function for infinite scroll
  const loadMoreColleges = useCallback(() => {
    if (isLoading || !pagination.hasNext) return;
    
    // Save scroll position before loading
    const currentScrollY = window.scrollY;
    console.log('🔄 Saving scroll position before load:', currentScrollY);
    scrollPositionRef.current = currentScrollY;
    
    const nextPage = pagination.page + 1;
    console.log('🔄 Loading more colleges, page:', nextPage);
    loadColleges(appliedFilters, nextPage, true); // Append mode
  }, [isLoading, pagination.hasNext, pagination.page, appliedFilters, loadColleges]);

  // Debounced scroll handler to prevent multiple rapid triggers
  const [isScrollDebounced, setIsScrollDebounced] = useState(false);
  
  // Ref to track scroll position during data loading
  const scrollPositionRef = useRef(0);

  // Infinite scroll handler - optimized for search-focused usage
  const handleScroll = useCallback(() => {
    if (isLoading || !pagination.hasNext || isScrollDebounced) {
      console.log('🔄 Scroll blocked:', { isLoading, hasNext: pagination.hasNext, isScrollDebounced });
      return;
    }
    
    const { scrollTop, scrollHeight, clientHeight } = document.documentElement;
    const scrollPercentage = (scrollTop + clientHeight) / scrollHeight;
    
    console.log('🔄 Scroll check:', { 
      scrollPercentage: Math.round(scrollPercentage * 100), 
      currentPage: pagination.page,
      hasNext: pagination.hasNext,
      collegesCount: colleges.length
    });
    
    // Load more when user scrolls to 80% of the page (less aggressive loading)
    if (scrollPercentage > 0.8) {
      console.log('🔄 Infinite scroll triggered, loading next chunk...');
      setIsScrollDebounced(true);
      loadMoreColleges();
      
      // Reset debounce after 3 seconds
      setTimeout(() => {
        setIsScrollDebounced(false);
      }, 3000);
    }
  }, [isLoading, pagination.hasNext, pagination.page, isScrollDebounced, loadMoreColleges, colleges.length]);

  // Throttled scroll handler to prevent excessive processing
  const throttledHandleScroll = useCallback(() => {
    let timeoutId;
    return () => {
      if (timeoutId) return;
      timeoutId = setTimeout(() => {
        handleScroll();
        timeoutId = null;
      }, 200); // Increased throttle to 200ms for better performance
    };
  }, [handleScroll]);

  // Add scroll listener for infinite scroll
  useEffect(() => {
    const throttledScroll = throttledHandleScroll();
    window.addEventListener('scroll', throttledScroll, { passive: true });
    return () => window.removeEventListener('scroll', throttledScroll);
  }, [throttledHandleScroll]);

  // Restore scroll position after colleges update (for infinite scroll)
  useEffect(() => {
    if (scrollPositionRef.current > 0) {
      console.log('📍 Restoring scroll position:', scrollPositionRef.current);
      
      let attempts = 0;
      const maxAttempts = 10;
      
      // Wait for DOM to be fully updated with new cards
      const restoreScroll = () => {
        attempts++;
        const currentScrollHeight = document.documentElement.scrollHeight;
        console.log('📍 Attempt', attempts, 'Current scroll height:', currentScrollHeight, 'Target:', scrollPositionRef.current);
        
        // If the scroll height has increased significantly, it means new cards are rendered
        if (currentScrollHeight > scrollPositionRef.current + 100 || attempts >= maxAttempts) {
          console.log('📍 Actually scrolling to:', scrollPositionRef.current);
          window.scrollTo(0, scrollPositionRef.current);
          scrollPositionRef.current = 0; // Reset after restoration
        } else {
          // If not enough height yet, wait a bit more
          setTimeout(restoreScroll, 100);
        }
      };
      
      // Start the restoration process
      setTimeout(restoreScroll, 150);
    }
  }, [colleges]);









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
                  <GoogleSignIn text="signin" size="medium" width={120} />
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
                  collegesData={allCollegesForSearch}
                  showAdvancedFeatures={false}
                  showPerformanceMetrics={true}
                />
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
                // Beautiful loading animation
                <div className="col-span-full flex justify-center items-center py-16">
                  <BeautifulLoader size="large" showText={true} text="Loading colleges..." />
                </div>
              ) : colleges.length > 0 ? (
                colleges.map((college, index) => (
                  <motion.div
                    key={`college-${college.id}-${index}`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: isLoaded ? 1 : 0, y: isLoaded ? 0 : 20 }}
                    transition={{ delay: 0.45 + index * 0.05, duration: 0.2 }}
                  >
                    <CollegeCard 
                      college={college} 
                      index={index}
                      courses={[]}
                      onOpenModal={handleOpenModal}
                    />
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
                transition={{ delay: 0.5, duration: 0.2 }}
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
                </div>
                
                {/* Load More Button - Replaces pagination for better UX */}
                {pagination.hasNext && (
                  <div className="flex justify-center">
                    <button
                      onClick={loadMoreColleges}
                      disabled={isLoading}
                      className={`px-8 py-3 rounded-lg font-medium transition-all duration-200 ${
                        isLoading
                          ? 'opacity-50 cursor-not-allowed'
                          : isDarkMode
                          ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:from-blue-600 hover:to-purple-700 shadow-lg hover:shadow-xl'
                          : 'bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:from-blue-600 hover:to-purple-700 shadow-lg hover:shadow-xl'
                      }`}
                    >
                      {isLoading ? (
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
          <p>&copy; 2024 NeetLogIQ. All rights reserved. Built with ❤️ for medical aspirants.</p>
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
      isLoading={false}
    />

    {/* Security Test Panel */}
    </BlurredOverlay>
  );
};

export default Colleges;
