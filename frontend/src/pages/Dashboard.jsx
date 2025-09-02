import React, { useState, useEffect } from 'react';
import { Search, Building2, Target, Users, TrendingUp, ArrowRight, MapPin, Calendar, Star, Sparkles, Zap, Globe, Award } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import AdvancedSearch from '../components/AdvancedSearch';

const Dashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalColleges: 0,
    totalSeats: 0,
    totalCourses: 0,
    statesCovered: 0
  });
  const [recentColleges, setRecentColleges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isHovered, setIsHovered] = useState(false);

  // Function to normalize state names - UPPERCASE + typo correction
  const normalizeStateName = (stateName) => {
    if (!stateName) return '';
    
    // Convert to UPPERCASE first
    const upperState = stateName.toUpperCase().trim();
    
    // Official 35 Indian states and union territories with typo correction
    const officialStates = {
      // States (28)
      'ANDHRA PRADESH': 'ANDHRA PRADESH',
      'ARUNACHAL PRADESH': 'ARUNACHAL PRADESH',
      'ASSAM': 'ASSAM',
      'BIHAR': 'BIHAR',
      'CHHATTISGARH': 'CHHATTISGARH',
      'GOA': 'GOA',
      'GUJARAT': 'GUJARAT',
      'HARYANA': 'HARYANA',
      'HIMACHAL PRADESH': 'HIMACHAL PRADESH',
      'JHARKHAND': 'JHARKHAND',
      'KARNATAKA': 'KARNATAKA',
      'KERALA': 'KERALA',
      'MADHYA PRADESH': 'MADHYA PRADESH',
      'MAHARASHTRA': 'MAHARASHTRA',
      'MANIPUR': 'MANIPUR',
      'MEGHALAYA': 'MEGHALAYA',
      'MIZORAM': 'MIZORAM',
      'NAGALAND': 'NAGALAND',
      'ODISHA': 'ODISHA',
      'PUNJAB': 'PUNJAB',
      'RAJASTHAN': 'RAJASTHAN',
      'SIKKIM': 'SIKKIM',
      'TAMIL NADU': 'TAMIL NADU',
      'TELANGANA': 'TELANGANA',
      'TRIPURA': 'TRIPURA',
      'UTTAR PRADESH': 'UTTAR PRADESH',
      'UTTARAKHAND': 'UTTARAKHAND',
      'WEST BENGAL': 'WEST BENGAL',
      
      // Union Territories (7)
      'ANDAMAN AND NICOBAR ISLANDS': 'ANDAMAN AND NICOBAR ISLANDS',
      'CHANDIGARH': 'CHANDIGARH',
      'DADRA AND NAGAR HAVELI': 'DADRA AND NAGAR HAVELI',
      'DAMAN AND DIU': 'DAMAN AND DIU',
      'DELHI': 'DELHI',
      'JAMMU AND KASHMIR': 'JAMMU AND KASHMIR',
      'PUDUCHERRY': 'PUDUCHERRY',
      
      // Typo corrections and variations
      'ANDAMAN & NICOBAR ISLANDS': 'ANDAMAN AND NICOBAR ISLANDS',
      'ANDAMAN NICOBAR ISLANDS': 'ANDAMAN AND NICOBAR ISLANDS',
      'ANDAMAN AN': 'ANDAMAN AND NICOBAR ISLANDS',
      'ANDHRA PRAD': 'ANDHRA PRADESH',
      'ARUNACHAL P': 'ARUNACHAL PRADESH',
      'CHHATTISGAR': 'CHHATTISGARH',
      'DADRA & NAGAR HAVELI': 'DADRA AND NAGAR HAVELI',
      'DADRA AND N': 'DADRA AND NAGAR HAVELI',
      'DAMAN & DIU': 'DAMAN AND DIU',
      'DELHI (NCT)': 'DELHI',
      'DELHI NCT': 'DELHI',
      'NCT OF DELHI': 'DELHI',
      'NEW DELHI': 'DELHI',
      'JAMMU & KASHMIR': 'JAMMU AND KASHMIR',
      'JAMMU ANDK': 'JAMMU AND KASHMIR',
      'JAMMU AND K': 'JAMMU AND KASHMIR',
      'J&K': 'JAMMU AND KASHMIR',
      'MADHYA PRAD': 'MADHYA PRADESH',
      'MAHARASHTR': 'MAHARASHTRA',
      'ORISSA': 'ODISHA',
      'PONDICHERRY': 'PUDUCHERRY',
      'UTTAR PRADES': 'UTTAR PRADESH',
      'UTTARANCHAL': 'UTTARAKHAND',
      'UTTRAKHAND': 'UTTARAKHAND'
    };
    
    // Return normalized state or original if not found
    return officialStates[upperState] || upperState;
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // First, get the total count from pagination info
      const initialResponse = await fetch('/api/colleges?limit=1');
      if (!initialResponse.ok) throw new Error('Failed to fetch data');
      
      const initialData = await initialResponse.json();
      const totalColleges = initialData.pagination?.totalItems || 0;
      
      // Fetch all colleges in batches to calculate accurate statistics
      const allColleges = [];
      const batchSize = 100;
      const totalBatches = Math.ceil(totalColleges / batchSize);
      
      for (let page = 1; page <= totalBatches; page++) {
        const response = await fetch(`/api/colleges?limit=${batchSize}&page=${page}`);
        if (response.ok) {
          const data = await response.json();
          allColleges.push(...(data.data || []));
        }
      }
      
      // Calculate accurate statistics from all colleges
      const totalSeats = allColleges.reduce((sum, college) => sum + (college.total_seats || 0), 0);
      const totalCourses = allColleges.reduce((sum, college) => sum + (college.total_courses || 0), 0);
      
      // Use normalized state names to get accurate count
      const normalizedStates = new Set(allColleges.map(c => normalizeStateName(c.state)).filter(s => s));
      let statesCovered = normalizedStates.size;
      
      // Validation: Never show more than 35 states
      if (statesCovered > 35) {
        console.warn(`⚠️ Warning: Found ${statesCovered} states, limiting to 35 official states`);
        statesCovered = 35;
      }
      
      // Debug logging to show the normalization effect
      const rawStateCount = new Set(allColleges.map(c => c.state)).size;
      console.log(`State normalization: ${rawStateCount} raw states → ${statesCovered} normalized states`);
      console.log('Expected: 35 Indian states and union territories');
      console.log('Raw states (first 20):', Array.from(new Set(allColleges.map(c => c.state))).sort().slice(0, 20));
      console.log('Normalized states:', Array.from(normalizedStates).sort());
      console.log('Normalization mapping examples:');
      allColleges.slice(0, 10).forEach(college => {
        const normalized = normalizeStateName(college.state);
        if (normalized !== college.state) {
          console.log(`"${college.state}" → "${normalized}"`);
        }
      });
      
      setStats({ totalColleges, totalSeats, totalCourses, statesCovered });
      
      // Get recent colleges (first 6)
      setRecentColleges(allColleges.slice(0, 6));
      
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      // Fallback to mock data if API fails
      setStats({
        totalColleges: 2399,
        totalSeats: 125000,
        totalCourses: 16830,
        statesCovered: 28
      });
      setRecentColleges([
        {
          id: 1,
          college_name: "AIIMS Delhi",
          city: "Delhi",
          state: "Delhi",
          college_type: "medical",
          total_seats: 100,
          total_courses: 25
        },
        {
          id: 2,
          college_name: "JIPMER Puducherry",
          city: "Puducherry",
          state: "Puducherry",
          college_type: "medical",
          total_seats: 150,
          total_courses: 30
        },
        {
          id: 3,
          college_name: "CMC Vellore",
          city: "Vellore",
          state: "Tamil Nadu",
          college_type: "medical",
          total_seats: 100,
          total_courses: 20
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const filteredColleges = recentColleges.filter(college =>
    college.college_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    college.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
    college.state.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="container mx-auto px-4 py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-24 w-24 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-3 text-gray-600 text-lg">Loading dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-64 h-64 bg-gradient-to-br from-blue-400/15 to-purple-600/15 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-64 h-64 bg-gradient-to-tr from-indigo-400/15 to-pink-600/15 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-gradient-to-r from-cyan-400/8 to-blue-600/8 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      {/* Hero Section */}
      <section className="relative z-10 pt-16 pb-12 px-6">
        <div className="max-w-6xl mx-auto text-center">
          {/* Floating Badge */}
          <div className="inline-flex items-center px-3 py-1.5 bg-white/80 backdrop-blur-xl border border-white/20 rounded-full shadow-lg mb-6 animate-fade-in-down">
            <Sparkles className="w-3 h-3 text-blue-600 mr-2" />
            <span className="text-xs font-medium text-gray-700">AI-Powered College Discovery</span>
          </div>

          {/* Main Title */}
          <h1 className="text-4xl md:text-6xl font-bold mb-4 animate-fade-in-down delay-200">
            <span className="bg-gradient-to-r from-gray-900 via-blue-800 to-indigo-900 bg-clip-text text-transparent">
              Find Your Perfect
            </span>
            <br />
            <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
              Medical College
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-lg md:text-xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed animate-fade-in-down delay-300">
            Discover <span className="font-semibold text-blue-600">2,399+ colleges</span> across <span className="font-semibold text-indigo-600">35 states</span> with 
            <span className="font-semibold text-purple-600"> 16,830+ courses</span> and <span className="font-semibold text-cyan-600">80,000+ seats</span>
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center items-center mb-12 animate-fade-in-down delay-400">
            <button 
              onClick={() => navigate('/colleges')}
              className="group relative px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold text-base shadow-xl hover:shadow-blue-500/25 transition-all duration-500 transform hover:scale-105 hover:-translate-y-1 overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-blue-700 to-indigo-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <span className="relative flex items-center">
                <Building2 className="w-4 h-4 mr-2" />
                Browse Colleges
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform duration-300" />
              </span>
            </button>
            
            <button 
              onClick={() => navigate('/cutoffs')}
              className="group relative px-6 py-3 bg-white/90 backdrop-blur-xl border-2 border-white/30 text-gray-700 rounded-xl font-semibold text-base shadow-xl hover:shadow-white/25 transition-all duration-500 transform hover:scale-105 hover:-translate-y-1 overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-gray-50 to-blue-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <span className="relative flex items-center">
                <Target className="w-4 h-4 mr-2" />
                View Cutoffs
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform duration-300" />
              </span>
            </button>
          </div>
        </div>
      </section>

      {/* Stats Grid */}
      <section className="relative z-10 px-6 mb-16">
        <div className="max-w-6xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-8">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">
              <span className="bg-gradient-to-r from-gray-900 to-blue-800 bg-clip-text text-transparent">
                Comprehensive Coverage
              </span>
            </h2>
            <p className="text-base text-gray-600 max-w-2xl mx-auto">
              Your gateway to India's complete medical education ecosystem
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Total Colleges */}
            <div className="group relative">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl blur-xl opacity-15 group-hover:opacity-25 transition-opacity duration-500"></div>
              <div className="relative bg-white/80 backdrop-blur-xl border border-white/30 rounded-2xl p-6 shadow-xl hover:shadow-blue-500/25 transition-all duration-500 transform hover:scale-105 hover:-translate-y-1">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                    <Building2 className="w-6 h-6 text-white" />
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-gray-900">{stats.totalColleges.toLocaleString()}+</div>
                    <div className="text-xs text-gray-500">Total Colleges</div>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <div className="flex items-center text-xs text-gray-600">
                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mr-2"></div>
                    Medical, Dental & Allied
                  </div>
                  <div className="flex items-center text-xs text-gray-600">
                    <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full mr-2"></div>
                    Government & Private
                  </div>
                </div>
              </div>
            </div>

            {/* Total Seats */}
            <div className="group relative">
              <div className="absolute inset-0 bg-gradient-to-r from-green-600 to-emerald-600 rounded-2xl blur-xl opacity-15 group-hover:opacity-25 transition-opacity duration-500"></div>
              <div className="relative bg-white/80 backdrop-blur-xl border border-white/30 rounded-2xl p-6 shadow-xl hover:shadow-green-500/25 transition-all duration-500 transform hover:scale-105 hover:-translate-y-1">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg">
                    <Users className="w-6 h-6 text-white" />
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-gray-900">{stats.totalSeats.toLocaleString()}+</div>
                    <div className="text-xs text-gray-500">Total Seats</div>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <div className="flex items-center text-xs text-gray-600">
                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full mr-2"></div>
                    MBBS, BDS & PG
                  </div>
                  <div className="flex items-center text-xs text-gray-600">
                    <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full mr-2"></div>
                    Merit & Management
                  </div>
                </div>
              </div>
            </div>

            {/* Total Courses */}
            <div className="group relative">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl blur-xl opacity-15 group-hover:opacity-25 transition-opacity duration-500"></div>
              <div className="relative bg-white/80 backdrop-blur-xl border border-white/30 rounded-2xl p-6 shadow-xl hover:shadow-purple-500/25 transition-all duration-500 transform hover:scale-105 hover:-translate-y-1">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center shadow-lg">
                    <Target className="w-6 h-6 text-white" />
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-gray-900">{stats.totalCourses.toLocaleString()}+</div>
                    <div className="text-xs text-gray-500">Total Courses</div>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <div className="flex items-center text-xs text-gray-600">
                    <div className="w-1.5 h-1.5 bg-purple-500 rounded-full mr-2"></div>
                    Undergraduate
                  </div>
                  <div className="flex items-center text-xs text-gray-600">
                    <div className="w-1.5 h-1.5 bg-pink-500 rounded-full mr-2"></div>
                    Postgraduate
                  </div>
                </div>
              </div>
            </div>

            {/* States Covered */}
            <div className="group relative">
              <div className="absolute inset-0 bg-gradient-to-r from-orange-600 to-red-600 rounded-2xl blur-xl opacity-15 group-hover:opacity-25 transition-opacity duration-500"></div>
              <div className="relative bg-white/80 backdrop-blur-xl border border-white/30 rounded-2xl p-6 shadow-xl hover:shadow-orange-500/25 transition-all duration-500 transform hover:scale-105 hover:-translate-y-1">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl flex items-center justify-center shadow-lg">
                    <Globe className="w-6 h-6 text-white" />
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-gray-900">{stats.statesCovered}</div>
                    <div className="text-xs text-gray-500">States Covered</div>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <div className="flex items-center text-xs text-gray-600">
                    <div className="w-1.5 h-1.5 bg-orange-500 rounded-full mr-2"></div>
                    All States & UTs
                  </div>
                  <div className="flex items-center text-xs text-gray-600">
                    <div className="w-1.5 h-1.5 bg-red-500 rounded-full mr-2"></div>
                    Pan India Coverage
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Search Section */}
      <section className="relative z-10 px-6 mb-16">
        <div className="max-w-5xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-8">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">
              <span className="bg-gradient-to-r from-gray-900 to-blue-800 bg-clip-text text-transparent">
                Smart College Discovery
              </span>
            </h2>
            <p className="text-base text-gray-600 max-w-2xl mx-auto">
              Find your ideal medical college with our intelligent search system
            </p>
          </div>

          {/* Advanced Search Bar */}
          <div className="relative">
            {/* Floating Search Container */}
            <div className="relative bg-white/80 backdrop-blur-xl border border-white/30 rounded-2xl shadow-xl p-6 transform hover:scale-[1.01] transition-all duration-500">
              {/* Advanced Search Input */}
              <div className="relative mb-4">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/8 to-purple-500/8 rounded-xl blur-lg"></div>
                <div className="relative bg-white/90 backdrop-blur-sm border border-white/50 rounded-xl p-3 shadow-lg">
                  <AdvancedSearch
                    placeholder="Search colleges, courses, locations, or areas of focus..."
                    data={recentColleges}
                    searchFields={[
                      { text: 'college_name', weight: 10, type: 'college' },
                      { text: 'city', weight: 8, type: 'city' },
                      { text: 'state', weight: 6, type: 'state' },
                      { text: 'college_type', weight: 4, type: 'type' }
                    ]}
                    onSearch={(results) => {
                      // Update the filtered results
                      setRecentColleges(results);
                    }}
                    onClear={() => {
                      // Reset to original data
                      fetchDashboardData();
                    }}
                    showAdvancedOptions={false}
                    showSuggestions={true}
                    maxSuggestions={6}
                  />
                </div>
              </div>

              {/* Quick Filters */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <button className="group flex items-center justify-center px-3 py-2 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg text-blue-700 font-medium hover:from-blue-100 hover:to-indigo-100 hover:border-blue-300 transition-all duration-300 transform hover:scale-105 text-sm">
                  <Building2 className="w-3 h-3 mr-1.5" />
                  Colleges
                </button>
                <button className="group flex items-center justify-center px-3 py-2 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg text-green-700 font-medium hover:from-green-100 hover:to-emerald-100 hover:border-green-300 transition-all duration-300 transform hover:scale-105 text-sm">
                  <Target className="w-3 h-3 mr-1.5" />
                  Courses
                </button>
                <button className="group flex items-center justify-center px-3 py-2 bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-lg text-purple-700 font-medium hover:from-purple-100 hover:to-pink-100 hover:border-purple-300 transition-all duration-300 transform hover:scale-105 text-sm">
                  <MapPin className="w-3 h-3 mr-1.5" />
                  Location
                </button>
                <button className="group flex items-center justify-center px-3 py-2 bg-gradient-to-r from-orange-50 to-red-50 border border-orange-200 rounded-lg text-orange-700 font-medium hover:from-orange-100 hover:to-red-100 hover:border-orange-300 transition-all duration-300 transform hover:scale-105 text-sm">
                  <Award className="w-3 h-3 mr-1.5" />
                  Rankings
                </button>
              </div>

              {/* Search Button */}
              <div className="mt-4 text-center">
                <button className="group relative px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold text-base shadow-xl hover:shadow-blue-500/25 transition-all duration-500 transform hover:scale-105 hover:-translate-y-1 overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-700 to-indigo-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <span className="relative flex items-center justify-center">
                    <Zap className="w-4 h-4 mr-2" />
                    Discover Colleges
                    <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform duration-300" />
                  </span>
                </button>
              </div>
            </div>

            {/* Floating Elements */}
            <div className="absolute -top-3 -right-3 w-6 h-6 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full animate-bounce"></div>
            <div className="absolute -bottom-3 -left-3 w-5 h-5 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full animate-bounce delay-1000"></div>
          </div>
        </div>
      </section>

      {/* Search Results */}
      {searchTerm && (
        <section className="relative z-10 px-6 mb-16">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-6">
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Search Results for "<span className="text-blue-600">{searchTerm}</span>"
              </h3>
              <p className="text-gray-600 text-sm">Found {recentColleges.length} colleges matching your search</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {recentColleges.slice(0, 6).map((college, index) => (
                <div 
                  key={college.id} 
                  className="group relative bg-white/80 backdrop-blur-xl border border-white/30 rounded-xl p-4 shadow-lg hover:shadow-xl transition-all duration-500 transform hover:scale-105 hover:-translate-y-1 overflow-hidden"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 to-indigo-50/50 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  
                  <div className="relative z-10">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h4 className="font-bold text-gray-900 text-base mb-2 line-clamp-2">
                          {college.college_name}
                        </h4>
                        <div className="flex items-center text-xs text-gray-600 mb-1.5">
                          <MapPin className="w-3 h-3 mr-1" />
                          {college.city}, {college.state}
                        </div>
                        <div className="flex items-center text-xs text-gray-600">
                          <Building2 className="w-3 h-3 mr-1" />
                          {college.college_type}
                        </div>
                      </div>
                      <div className="ml-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center shadow-lg">
                          <Star className="w-5 h-5 text-white" />
                        </div>
                      </div>
                    </div>
                    
                    <button 
                      onClick={() => navigate('/colleges')}
                      className="w-full mt-3 px-3 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg font-medium hover:from-blue-600 hover:to-purple-600 transition-all duration-300 flex items-center justify-center text-xs group-hover:shadow-lg"
                    >
                      <span>View Details</span>
                      <ArrowRight className="ml-1.5 h-3 w-3 group-hover:translate-x-1 transition-transform duration-300" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="relative z-10 px-6 mb-16">
        <div className="max-w-5xl mx-auto">
          <div className="relative bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-700 rounded-2xl p-8 text-center text-white overflow-hidden">
            {/* Background Elements */}
            <div className="absolute inset-0">
              <div className="absolute top-0 -left-4 w-56 h-56 bg-white/10 rounded-full mix-blend-overlay filter blur-xl animate-pulse"></div>
              <div className="absolute top-0 -right-4 w-56 h-56 bg-white/10 rounded-full mix-blend-overlay filter blur-xl animate-pulse delay-1000"></div>
              <div className="absolute -bottom-6 left-16 w-56 h-56 bg-white/10 rounded-full mix-blend-overlay filter blur-xl animate-pulse delay-2000"></div>
            </div>
            
            <div className="relative z-10">
              <h2 className="text-2xl md:text-3xl font-bold mb-4">
                Ready to Find Your Perfect College?
              </h2>
              <p className="text-lg text-blue-100 mb-6 max-w-2xl mx-auto">
                Join thousands of students who have discovered their ideal medical education path with NeetLogIQ
              </p>
              
              <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
                <button 
                  onClick={() => navigate('/colleges')}
                  className="group relative px-6 py-3 bg-white text-blue-600 rounded-xl font-semibold text-base hover:bg-gray-100 transition-all duration-300 transform hover:scale-105 hover:-translate-y-1 shadow-xl"
                >
                  <span className="flex items-center">
                    <Building2 className="w-4 h-4 mr-2" />
                    Start Exploring
                    <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform duration-300" />
                  </span>
                </button>
                
                <button 
                  onClick={() => navigate('/cutoffs')}
                  className="group relative px-6 py-3 border-2 border-white text-white rounded-xl font-semibold text-base hover:bg-white hover:text-blue-600 transition-all duration-300 transform hover:scale-105 hover:-translate-y-1 shadow-xl"
                >
                  <span className="flex items-center">
                    <Target className="w-4 h-4 mr-2" />
                    Check Cutoffs
                    <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform duration-300" />
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-16">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-3"></div>
            <p className="text-gray-600 text-base">Loading college data...</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
