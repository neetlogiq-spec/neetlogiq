import React, { useState, useEffect } from 'react';
import { Search, Building2, ChevronDown, ChevronUp, ArrowUp } from 'lucide-react';

const Colleges = () => {
  // All hooks at the top level
  const [colleges, setColleges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedCards, setExpandedCards] = useState(new Set());
  const [filters, setFilters] = useState({
    stream: '',
    course: '',
    branch: '',
    state: '',
    collegeType: ''
  });
  const [pagination, setPagination] = useState({
    currentPage: 1,
    itemsPerPage: 24,
    totalPages: 1
  });
  const [collegeCourses, setCollegeCourses] = useState({}); // Store courses for each college
  const [loadingCourses, setLoadingCourses] = useState(false); // Track course loading state

  // Simple fetch function
  const fetchColleges = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('http://localhost:4000/api/colleges');
      
      if (response.ok) {
        const data = await response.json();
        const collegesData = data.data || [];
        setColleges(collegesData);
        
        // Calculate total pages
        const totalPages = Math.ceil(collegesData.length / pagination.itemsPerPage);
        setPagination(prev => ({ ...prev, totalPages }));
      } else {
        throw new Error(`Failed to fetch colleges: ${response.status}`);
      }
    } catch (err) {
      console.error('Error fetching colleges:', err);
      setError(err.message);
      
      // Fallback data
      const mockColleges = [
        {
          id: 1,
          college_name: "AIIMS Delhi",
          college_type: "MEDICAL",
          state: "Delhi",
          city: "New Delhi",
          total_courses: 15,
          total_seats: 1200,
          management_type: "GOVERNMENT"
        },
        {
          id: 2,
          college_name: "JIPMER Puducherry",
          college_type: "MEDICAL",
          state: "Puducherry",
          city: "Puducherry",
          total_courses: 12,
          total_seats: 800,
          management_type: "GOVERNMENT"
        }
      ];
      
      setColleges(mockColleges);
      setPagination(prev => ({ ...prev, totalPages: 1 }));
    } finally {
      setLoading(false);
    }
  };

  // Load colleges on mount
  useEffect(() => {
    fetchColleges();
  }, []);

  // Preload courses for first few colleges
  useEffect(() => {
    if (colleges.length > 0 && !loading) {
      // Preload courses for first 6 colleges
      const collegesToPreload = colleges.slice(0, 6);
      collegesToPreload.forEach(college => {
        if (!collegeCourses[college.id]) {
          fetchCollegeCourses(college.id);
        }
      });
    }
  }, [colleges, loading]);

  // Filter colleges
  const filteredColleges = colleges.filter(college => {
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      return college.college_name.toLowerCase().includes(searchLower) ||
             college.city.toLowerCase().includes(searchLower) ||
             college.state.toLowerCase().includes(searchLower);
    }
    return true;
  });

  // Get paginated colleges
  const paginatedColleges = filteredColleges.slice(
    (pagination.currentPage - 1) * pagination.itemsPerPage,
    pagination.currentPage * pagination.itemsPerPage
  );

  // Get available states
  const availableStates = [...new Set(colleges.map(college => college.state))].filter(state => state && state.trim()).sort();

  // Handle filter changes
  const handleFilterChange = (filterType, value) => {
    setFilters(prev => {
      const newFilters = { ...prev, [filterType]: value };
      
      // Reset dependent filters
      if (filterType === 'stream') {
        newFilters.course = '';
        newFilters.branch = '';
      } else if (filterType === 'course') {
        newFilters.branch = '';
      }
      
      return newFilters;
    });
    
    // Reset to first page when filters change
    setPagination(prev => ({ ...prev, currentPage: 1 }));
  };

  // Toggle card expansion
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

  // Fetch courses for a specific college
  const fetchCollegeCourses = async (collegeId) => {
    // Don't fetch if already loaded
    if (collegeCourses[collegeId]) return;
    
    try {
      setLoadingCourses(true);
      const response = await fetch(`http://localhost:4000/api/colleges/${collegeId}`);
      
      if (response.ok) {
        const data = await response.json();
        const courses = data.courses || [];
        
        setCollegeCourses(prev => ({
          ...prev,
          [collegeId]: courses
        }));
      } else {
        console.error('Failed to fetch courses for college:', collegeId);
        // Set empty array to avoid repeated failed requests
        setCollegeCourses(prev => ({
          ...prev,
          [collegeId]: []
        }));
      }
    } catch (error) {
      console.error('Error fetching courses:', error);
      
      // Fallback to mock course data if API fails
      const mockCourses = [
        {
          course_name: 'MBBS',
          course_type: 'Undergraduate',
          total_seats: 150,
          duration: '5.5 years',
          specialization: 'General Medicine'
        },
        {
          course_name: 'MD General Medicine',
          course_type: 'Postgraduate',
          total_seats: 20,
          duration: '3 years',
          specialization: 'General Medicine'
        },
        {
          course_name: 'MS General Surgery',
          course_type: 'Postgraduate',
          total_seats: 15,
          duration: '3 years',
          specialization: 'General Surgery'
        }
      ];
      
      setCollegeCourses(prev => ({
        ...prev,
        [collegeId]: mockCourses
      }));
    } finally {
      setLoadingCourses(false);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg mb-4">Loading colleges...</p>
          <p className="text-gray-500 text-sm mb-6">This may take a few moments</p>
          
          <button
            onClick={fetchColleges}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Retry Loading
          </button>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center p-8">
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Error Loading Colleges</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={fetchColleges}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Try Again
            </button>
            
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              Reload Page
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Main render
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-64 h-64 bg-gradient-to-br from-blue-400/15 to-purple-600/15 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-64 h-64 bg-gradient-to-tr from-indigo-400/15 to-pink-600/15 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-gradient-to-r from-cyan-400/8 to-blue-600/8 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      {/* Hero Section */}
      <section className="relative z-10 pt-12 pb-8 px-6">
        <div className="max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl mb-6 shadow-xl animate-fade-in-down">
            <Building2 className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl md:text-5xl font-bold mb-4 animate-fade-in-down delay-200">
            <span className="bg-gradient-to-r from-gray-900 via-blue-800 to-purple-900 bg-clip-text text-transparent">
              Discover Your Perfect
            </span>
            <br />
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Medical College
            </span>
          </h1>
          <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed animate-fade-in-down delay-300">
            Explore thousands of medical colleges across India with detailed information about <span className="font-semibold text-blue-600">courses, seats, and admission criteria</span>
          </p>
        </div>
      </section>

      {/* Stats Overview */}
      <section className="relative z-10 pb-8 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="group relative">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl blur-lg opacity-15 group-hover:opacity-25 transition-opacity duration-500"></div>
              <div className="relative bg-white/80 backdrop-blur-xl border border-white/30 rounded-xl p-4 text-center shadow-lg hover:shadow-blue-500/25 transition-all duration-500 transform hover:scale-105 hover:-translate-y-1">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center mb-3 mx-auto shadow-lg">
                  <Building2 className="w-6 h-6 text-white" />
                </div>
                <div className="text-2xl font-bold text-blue-600 mb-1">{colleges.length.toLocaleString()}</div>
                <div className="text-xs text-gray-600 font-medium">Total Colleges</div>
              </div>
            </div>
            
            <div className="group relative">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl blur-lg opacity-15 group-hover:opacity-25 transition-opacity duration-500"></div>
              <div className="relative bg-white/80 backdrop-blur-xl border border-white/30 rounded-xl p-4 text-center shadow-lg hover:shadow-purple-500/25 transition-all duration-500 transform hover:scale-105 hover:-translate-y-1">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center mb-3 mx-auto shadow-lg">
                  <div className="w-6 h-6 bg-white rounded-lg flex items-center justify-center">
                    <span className="text-purple-600 font-bold text-xs">35</span>
                  </div>
                </div>
                <div className="text-2xl font-bold text-purple-600 mb-1">35</div>
                <div className="text-xs text-gray-600 font-medium">States Covered</div>
              </div>
            </div>
            
            <div className="group relative">
              <div className="absolute inset-0 bg-gradient-to-r from-green-600 to-emerald-600 rounded-xl blur-lg opacity-15 group-hover:opacity-25 transition-opacity duration-500"></div>
              <div className="relative bg-white/80 backdrop-blur-xl border border-white/30 rounded-xl p-4 text-center shadow-lg hover:shadow-green-500/25 transition-all duration-500 transform hover:scale-105 hover:-translate-y-1">
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center mb-3 mx-auto shadow-lg">
                  <div className="w-6 h-6 bg-white rounded-lg flex items-center justify-center">
                    <span className="text-green-600 font-bold text-xs">100+</span>
                  </div>
                </div>
                <div className="text-2xl font-bold text-green-600 mb-1">100+</div>
                <div className="text-xs text-gray-600 font-medium">Course Types</div>
              </div>
            </div>
            
            <div className="group relative">
              <div className="absolute inset-0 bg-gradient-to-r from-orange-600 to-red-600 rounded-xl blur-lg opacity-15 group-hover:opacity-25 transition-opacity duration-500"></div>
              <div className="relative bg-white/80 backdrop-blur-xl border border-white/30 rounded-xl p-4 text-center shadow-lg hover:shadow-orange-500/25 transition-all duration-500 transform hover:scale-105 hover:-translate-y-1">
                <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl flex items-center justify-center mb-3 mx-auto shadow-lg">
                  <div className="w-6 h-6 bg-white rounded-lg flex items-center justify-center">
                    <span className="text-orange-600 font-bold text-xs">50K+</span>
                  </div>
                </div>
                <div className="text-2xl font-bold text-orange-600 mb-1">50K+</div>
                <div className="text-xs text-gray-600 font-medium">Total Seats</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Search and Filters Section */}
      <section className="relative z-10 pb-8 px-6">
        <div className="max-w-6xl mx-auto">
          {/* Search Bar */}
          <div className="group relative mb-6">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl blur-lg opacity-20 group-hover:opacity-30 transition-opacity duration-500"></div>
            <div className="relative bg-white/90 backdrop-blur-xl border border-white/30 rounded-xl shadow-xl p-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search colleges by name, city, or state..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border-0 bg-transparent text-gray-900 placeholder-gray-500 text-base focus:outline-none focus:ring-0"
                />
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="group relative">
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl blur-lg opacity-15 group-hover:opacity-25 transition-opacity duration-500"></div>
            <div className="relative bg-white/90 backdrop-blur-xl border border-white/30 rounded-xl shadow-xl p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                <div className="w-6 h-6 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center mr-3">
                  <Search className="w-3 h-3 text-white" />
                </div>
                Advanced Filters
              </h3>
              
              {/* First Row - Stream, Course, Branch */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                {/* Stream */}
                <div className="group">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Stream</label>
                  <div className="relative">
                    <select
                      value={filters.stream}
                      onChange={(e) => handleFilterChange('stream', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white/80 backdrop-blur-sm transition-all duration-300 hover:shadow-md"
                    >
                      <option value="">Select Stream</option>
                      <option value="MEDICAL">MEDICAL</option>
                      <option value="DENTAL">DENTAL</option>
                      <option value="NBEMS">NBEMS</option>
                    </select>
                  </div>
                </div>

                {/* Course */}
                <div className="group">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Course</label>
                  <div className="relative">
                    <select
                      value={filters.course}
                      onChange={(e) => handleFilterChange('course', e.target.value)}
                      disabled={!filters.stream}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white/80 backdrop-blur-sm transition-all duration-300 hover:shadow-md disabled:bg-gray-100/80 disabled:cursor-not-allowed"
                    >
                      <option value="">{filters.stream ? 'Select Course' : 'Select Stream First'}</option>
                      {filters.stream === 'MEDICAL' && (
                        <>
                          <option value="MBBS">MBBS</option>
                          <option value="NBEMS">NBEMS</option>
                          <option value="DIPLOMA">Diploma</option>
                          <option value="DM">DM</option>
                          <option value="M.CH.">M.CH.</option>
                        </>
                      )}
                      {filters.stream === 'DENTAL' && (
                        <>
                          <option value="BDS">BDS</option>
                          <option value="MDS">MDS</option>
                          <option value="DIPLOMA">Diploma</option>
                        </>
                      )}
                      {filters.stream === 'NBEMS' && (
                        <>
                          <option value="NBEMS">NBEMS</option>
                          <option value="DIPLOMA">Diploma</option>
                        </>
                      )}
                    </select>
                  </div>
                </div>

                {/* Branch */}
                <div className="group">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Branch</label>
                  <div className="relative">
                    <select
                      value={filters.branch}
                      onChange={(e) => handleFilterChange('branch', e.target.value)}
                      disabled={!filters.course || filters.course === 'MBBS' || filters.course === 'BDS'}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white/80 backdrop-blur-sm transition-all duration-300 hover:shadow-md disabled:bg-gray-100/80 disabled:cursor-not-allowed custom-scrollbar scrollable-dropdown"
                      size={filters.course && filters.course !== 'MBBS' && filters.course !== 'BDS' ? 6 : 1}
                    >
                      <option value="">{!filters.course ? 'Select Course First' : (filters.course === 'MBBS' || filters.course === 'BDS') ? 'No Branch for Undergraduate Course' : 'Select Branch'}</option>
                      {filters.course && filters.course !== 'MBBS' && filters.course !== 'BDS' && (
                        <>
                          <option value="GENERAL MEDICINE">General Medicine</option>
                          <option value="GENERAL SURGERY">General Surgery</option>
                          <option value="ANAESTHESIOLOGY">Anaesthesiology</option>
                          <option value="DERMATOLOGY">Dermatology</option>
                          <option value="PAEDIATRICS">Paediatrics</option>
                          <option value="OBSTETRICS & GYNAECOLOGY">Obstetrics & Gynaecology</option>
                          <option value="ORTHOPAEDICS">Orthopaedics</option>
                          <option value="RADIOLOGY">Radiology</option>
                          <option value="PSYCHIATRY">Psychiatry</option>
                          <option value="OPHTHALMOLOGY">Ophthalmology</option>
                          <option value="ENT">ENT</option>
                          <option value="PATHOLOGY">Pathology</option>
                          <option value="MICROBIOLOGY">Microbiology</option>
                          <option value="BIOCHEMISTRY">Biochemistry</option>
                          <option value="PHYSIOLOGY">Physiology</option>
                          <option value="ANATOMY">Anatomy</option>
                          <option value="FORENSIC MEDICINE">Forensic Medicine</option>
                          <option value="COMMUNITY MEDICINE">Community Medicine</option>
                          <option value="EMERGENCY MEDICINE">Emergency Medicine</option>
                          <option value="FAMILY MEDICINE">Family Medicine</option>
                        </>
                      )}
                    </select>
                    
                    {/* Scroll Indicator */}
                    {filters.course && filters.course !== 'MBBS' && filters.course !== 'BDS' && (
                      <div className="absolute right-2 top-1/2 transform -translate-y-1/2 pointer-events-none">
                        <div className="flex flex-col items-center space-y-1">
                          <div className="w-1 h-1 bg-indigo-400 rounded-full scroll-indicator"></div>
                          <div className="w-1 h-1 bg-indigo-400 rounded-full scroll-indicator delay-75"></div>
                          <div className="w-1 h-1 bg-indigo-400 rounded-full scroll-indicator delay-150"></div>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {/* Scroll Hint */}
                  {filters.course && filters.course !== 'MBBS' && filters.course !== 'BDS' && (
                    <p className="text-xs text-gray-500 mt-1 flex items-center">
                      <span className="mr-1">📜</span>
                      Scroll to see all 20 branches
                    </p>
                  )}
                </div>
              </div>

              {/* Second Row - State, College Type */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                {/* State */}
                <div className="group">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">State</label>
                  <div className="relative">
                    <select
                      value={filters.state}
                      onChange={(e) => handleFilterChange('state', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white/80 backdrop-blur-sm transition-all duration-300 hover:shadow-md"
                    >
                      <option value="">All States</option>
                      {availableStates.map(state => (
                        <option key={state} value={state}>{state}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* College Type */}
                <div className="group">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">College Type</label>
                  <div className="relative">
                    <select
                      value={filters.collegeType}
                      onChange={(e) => handleFilterChange('collegeType', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white/80 backdrop-blur-sm transition-all duration-300 hover:shadow-md"
                    >
                      <option value="">All Types</option>
                      <option value="GOVERNMENT">GOVERNMENT</option>
                      <option value="PRIVATE">PRIVATE</option>
                      <option value="DEEMED">DEEMED</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Filter Dependencies Explanation */}
              <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg p-4 border border-indigo-100">
                <h4 className="text-sm font-semibold text-indigo-900 mb-2 flex items-center">
                  <div className="w-4 h-4 bg-indigo-500 rounded-full flex items-center justify-center mr-2">
                    <span className="text-white text-xs">ℹ</span>
                  </div>
                  Filter Dependencies
                </h4>
                <ul className="text-xs text-indigo-800 space-y-1">
                  <li className="flex items-start">
                    <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full mt-1.5 mr-2 flex-shrink-0"></span>
                    <span><strong>Stream → Course → Branch</strong>: Filters work in sequence</span>
                  </li>
                  <li className="flex items-start">
                    <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full mt-1.5 mr-2 flex-shrink-0"></span>
                    <span><strong>Course + Branch</strong>: Both must match for a college to be included</span>
                  </li>
                  <li className="flex items-start">
                    <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full mt-1.5 mr-2 flex-shrink-0"></span>
                    <span><strong>MBBS/BDS</strong>: Undergraduate courses have no branches</span>
                  </li>
                  <li className="flex items-start">
                    <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full mt-1.5 mr-2 flex-shrink-0"></span>
                    <span><strong>State + College Type</strong>: Independent filters</span>
                  </li>
                  <li className="flex items-start">
                    <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full mt-1.5 mr-2 flex-shrink-0"></span>
                    <span><strong>NBEMS</strong>: Maps to DNB in database</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Results and Colleges Section */}
      <section className="relative z-10 pb-16 px-6">
        <div className="max-w-6xl mx-auto">
          {/* Results Count */}
          <div className="flex justify-between items-center mb-6">
            <div className="bg-white/80 backdrop-blur-xl border border-white/30 rounded-lg px-4 py-3 shadow-lg">
              <p className="text-gray-700 font-medium text-sm">
                Showing <span className="text-blue-600 font-semibold">{paginatedColleges.length}</span> of <span className="text-purple-600 font-semibold">{filteredColleges.length}</span> colleges
              </p>
            </div>
            <div className="bg-white/80 backdrop-blur-xl border border-white/30 rounded-lg px-4 py-3 shadow-lg">
              <p className="text-gray-700 font-medium text-sm">
                Page <span className="text-indigo-600 font-semibold">{pagination.currentPage}</span> of <span className="text-purple-600 font-semibold">{pagination.totalPages}</span>
              </p>
            </div>
          </div>

          {/* Colleges Grid */}
          {paginatedColleges.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {paginatedColleges.map((college) => (
                <div key={college.id} className="group relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-purple-600/10 rounded-2xl blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  <div className="relative bg-white/90 backdrop-blur-xl border border-white/30 rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-500 transform hover:scale-[1.01] hover:-translate-y-0.5">
                    {/* College Header */}
                    <div className="p-5 border-b border-gray-100/50">
                      <div className="flex items-start justify-between mb-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                          <Building2 className="w-5 h-5 text-white" />
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                            college.college_type === 'MEDICAL' ? 'bg-blue-100 text-blue-800 border border-blue-200' :
                            college.college_type === 'DENTAL' ? 'bg-green-100 text-green-800 border border-green-200' :
                            'bg-purple-100 text-purple-800 border border-purple-200'
                          }`}>
                            {college.college_type}
                          </span>
                          <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                            college.management_type === 'GOVERNMENT' || college.management_type === 'Government' || college.management_type === 'Govt.' ? 'bg-green-100 text-green-800 border border-green-200' :
                            college.management_type === 'PRIVATE' || college.management_type === 'Private' ? 'bg-red-100 text-red-800 border border-red-200' :
                            'bg-yellow-100 text-yellow-800 border border-yellow-200'
                          }`}>
                            {college.management_type}
                          </span>
                        </div>
                      </div>
                      
                      <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2 leading-tight">
                        {college.college_name}
                      </h3>
                      
                      <div className="flex items-center justify-between text-sm text-gray-600">
                        <span className="flex items-center font-medium">
                          <span className="mr-2">{college.total_courses} Available Courses</span>
                        </span>
                        <span className="flex items-center font-medium">
                          📍 {college.state}
                        </span>
                      </div>
                    </div>

                    {/* Expandable Courses Section */}
                    <div className="p-5">
                      <button
                        onClick={() => toggleCardExpansion(college.id)}
                        className="w-full flex items-center justify-between text-sm font-semibold text-gray-700 hover:text-blue-600 transition-colors p-3 bg-gray-50/50 rounded-lg hover:bg-gray-100/50"
                      >
                        <span>Available Courses, {college.total_courses} courses</span>
                        {expandedCards.has(college.id) ? (
                          <ChevronUp className="w-4 h-4" />
                        ) : (
                          <ChevronDown className="w-4 h-4" />
                        )}
                      </button>
                      
                      {expandedCards.has(college.id) && (
                        <div className="mt-4 space-y-2">
                          {loadingCourses && !collegeCourses[college.id] ? (
                            <div className="flex items-center space-x-2 text-sm text-gray-500 p-3 bg-gray-50/50 rounded-lg">
                              <div className="w-4 h-4 border-2 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
                              <span>Loading courses...</span>
                            </div>
                          ) : collegeCourses[college.id] && collegeCourses[college.id].length > 0 ? (
                            <div className="max-h-48 overflow-y-auto custom-scrollbar space-y-2">
                              {collegeCourses[college.id].map((course, index) => (
                                <div key={index} className="p-3 bg-gradient-to-r from-blue-50/50 to-purple-50/50 rounded-lg border border-blue-100/50 hover:border-blue-200/50 transition-colors">
                                  <div className="flex justify-between items-start">
                                    <div className="flex-1">
                                      <h5 className="font-semibold text-gray-900 text-sm mb-1">{course.course_name}</h5>
                                      {course.course_type && (
                                        <p className="text-xs text-gray-600 mb-1">{course.course_type}</p>
                                      )}
                                    </div>
                                    {course.total_seats && (
                                      <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full font-medium border border-blue-200">
                                        {course.total_seats} seats
                                      </span>
                                    )}
                                  </div>
                                  {course.duration && (
                                    <p className="text-xs text-gray-500 mt-1">Duration: {course.duration}</p>
                                  )}
                                  {course.specialization && (
                                    <p className="text-xs text-gray-500 mt-1">Specialization: {course.specialization}</p>
                                  )}
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="text-sm text-gray-500 p-3 bg-gray-50/50 rounded-lg text-center">
                              {collegeCourses[college.id] ? 'No courses available for this college' : 'Failed to load courses'}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                <Search className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">No colleges found</h3>
              <p className="text-gray-600">Try adjusting your filters or search terms.</p>
            </div>
          )}

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="mt-8 flex justify-center">
              <div className="bg-white/80 backdrop-blur-xl border border-white/30 rounded-xl shadow-lg p-3">
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setPagination(prev => ({ ...prev, currentPage: 1 }))}
                    disabled={pagination.currentPage === 1}
                    className="px-3 py-2 text-sm font-semibold text-gray-500 bg-gray-100/80 border border-gray-200 rounded-lg hover:bg-gray-200/80 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
                  >
                    First
                  </button>
                  
                  <button
                    onClick={() => setPagination(prev => ({ ...prev, currentPage: prev.currentPage - 1 }))}
                    disabled={pagination.currentPage === 1}
                    className="px-3 py-2 text-sm font-semibold text-gray-500 bg-gray-100/80 border border-gray-200 rounded-lg hover:bg-gray-200/80 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
                  >
                    Previous
                  </button>
                  
                  <span className="px-4 py-2 text-sm font-semibold text-gray-700 bg-white/80 rounded-lg border border-gray-200">
                    Page {pagination.currentPage} of {pagination.totalPages}
                  </span>
                  
                  <button
                    onClick={() => setPagination(prev => ({ ...prev, currentPage: prev.currentPage + 1 }))}
                    disabled={pagination.currentPage === pagination.totalPages}
                    className="px-3 py-2 text-sm font-semibold text-gray-500 bg-gray-100/80 border border-gray-200 rounded-lg hover:bg-gray-200/80 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
                  >
                    Next
                  </button>
                  
                  <button
                    onClick={() => setPagination(prev => ({ ...prev, currentPage: pagination.totalPages }))}
                    disabled={pagination.currentPage === pagination.totalPages}
                    className="px-3 py-2 text-sm font-semibold text-gray-500 bg-gray-100/80 border border-gray-200 rounded-lg hover:bg-gray-200/80 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
                  >
                    Last
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Scroll to Top Button */}
      <button
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        className="fixed bottom-6 right-6 w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full shadow-xl hover:shadow-blue-500/25 transition-all duration-300 flex items-center justify-center group hover:scale-105"
      >
        <ArrowUp className="w-6 h-6 group-hover:-translate-y-0.5 transition-transform duration-300" />
      </button>
    </div>
  );
};

export default Colleges;
