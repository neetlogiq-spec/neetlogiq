import React, { useState, useEffect, useMemo } from 'react';
import { Search, Filter, TrendingUp, TrendingDown, Minus, Target, BarChart3, Calendar, Users, Award, ArrowUp } from 'lucide-react';
import AdvancedSearch from '../components/AdvancedSearch';

const Cutoffs = () => {
  const [cutoffs, setCutoffs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  // State for search and filters
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStream, setSelectedStream] = useState('');
  const [selectedCourse, setSelectedCourse] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');

  useEffect(() => {
    fetchCutoffs();
  }, []);

  const fetchCutoffs = async () => {
    try {
      setLoading(true);
      // For now, we'll use mock data since the cutoff API might not be fully implemented
      // In the future, this would be: const response = await fetch(`http://localhost:4000/api/cutoffs?${params}`);
      
      // Mock data structure with years as columns and rounds as sub-columns
      const mockCutoffs = [
        {
          id: 1,
          college_name: "AIIMS Delhi",
          course: "MBBS",
          category: "General",
          state: "Delhi",
          "2024_round1": 50,
          "2024_round2": 75,
          "2023_round1": 45,
          "2023_round2": 70
        },
        {
          id: 2,
          college_name: "JIPMER Puducherry",
          course: "MBBS",
          category: "General",
          state: "Puducherry",
          "2024_round1": 120,
          "2024_round2": 150,
          "2023_round1": 110,
          "2023_round2": 140
        },
        {
          id: 3,
          college_name: "CMC Vellore",
          course: "MBBS",
          category: "General",
          state: "Tamil Nadu",
          "2024_round1": 200,
          "2024_round2": 250,
          "2023_round1": 190,
          "2023_round2": 240
        },
        {
          id: 4,
          college_name: "AFMC Pune",
          course: "MBBS",
          category: "General",
          state: "Maharashtra",
          "2024_round1": 300,
          "2024_round2": 380,
          "2023_round1": 290,
          "2023_round2": 370
        },
        {
          id: 5,
          college_name: "KGMU Lucknow",
          course: "MBBS",
          category: "General",
          state: "Uttar Pradesh",
          "2024_round1": 450,
          "2024_round2": 520,
          "2023_round1": 440,
          "2023_round2": 510
        },
        {
          id: 6,
          college_name: "BHU Varanasi",
          course: "MBBS",
          category: "General",
          state: "Uttar Pradesh",
          "2024_round1": 600,
          "2024_round2": 680,
          "2023_round1": 590,
          "2023_round2": 670
        }
      ];
      
      setCutoffs(mockCutoffs);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching cutoffs:', err);
    } finally {
      setLoading(false);
    }
  };

  // Filtered cutoffs based on search and filters
  const filteredCutoffs = useMemo(() => {
    return cutoffs.filter(cutoff => {
      const matchesSearch = searchTerm === '' || 
        cutoff.college_name.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStream = selectedStream === '' || 
        cutoff.course.toLowerCase().includes(selectedStream.toLowerCase());
      
      const matchesCourse = selectedCourse === '' || 
        cutoff.course.toLowerCase().includes(selectedCourse.toLowerCase());
      
      const matchesCategory = selectedCategory === '' || 
        cutoff.category.toLowerCase() === selectedCategory.toLowerCase();
      
      return matchesSearch && matchesStream && matchesCourse && matchesCategory;
    });
  }, [searchTerm, selectedStream, selectedCourse, selectedCategory, cutoffs]);

  // Get unique values for dropdowns
  const uniqueStreams = useMemo(() => {
    const streams = [...new Set(cutoffs.map(cutoff => cutoff.course))];
    return streams.sort();
  }, [cutoffs]);

  const uniqueCourses = useMemo(() => {
    const courses = [...new Set(cutoffs.map(cutoff => cutoff.course))];
    return courses.sort();
  }, [cutoffs]);

  const uniqueCategories = useMemo(() => {
    const categories = [...new Set(cutoffs.map(cutoff => cutoff.category))];
    return categories.sort();
  }, [cutoffs]);

  const getRankChange = (currentRank, previousRank) => {
    if (!currentRank || !previousRank) return { type: 'stable', value: 0, icon: <Minus className="h-4 w-4 text-gray-500" /> };
    
    const change = currentRank - previousRank;
    if (change > 0) return { type: 'up', value: change, icon: <TrendingUp className="h-4 w-4 text-green-500" /> };
    if (change < 0) return { type: 'down', value: Math.abs(change), icon: <TrendingDown className="h-4 w-4 text-red-500" /> };
    return { type: 'stable', value: 0, icon: <Minus className="h-4 w-4 text-gray-500" /> };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading cutoff data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-red-600 text-2xl">⚠️</span>
          </div>
          <p className="text-red-600 text-lg mb-2">Error loading cutoff data</p>
          <p className="text-gray-600">{error}</p>
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
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-green-500 to-emerald-600 rounded-3xl mb-8 shadow-2xl animate-fade-in-down">
            <Target className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl md:text-6xl font-bold mb-6 animate-fade-in-down delay-200">
            <span className="bg-gradient-to-r from-gray-900 via-green-800 to-emerald-900 bg-clip-text text-transparent">
              NEET Cutoff Ranks
            </span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 max-w-4xl mx-auto leading-relaxed animate-fade-in-down delay-300">
            Track admission trends and <span className="font-semibold text-green-600">rank requirements</span> for medical colleges across India
          </p>
        </div>
      </section>

      {/* Stats Overview */}
      <section className="relative z-10 pb-12 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="group relative">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl blur-xl opacity-15 group-hover:opacity-25 transition-opacity duration-500"></div>
              <div className="relative bg-white/80 backdrop-blur-xl border border-white/30 rounded-2xl p-6 text-center shadow-xl hover:shadow-blue-500/25 transition-all duration-500 transform hover:scale-105 hover:-translate-y-1">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mb-4 mx-auto shadow-lg">
                  <BarChart3 className="w-8 h-8 text-white" />
                </div>
                <div className="text-3xl font-bold text-blue-600 mb-2">{cutoffs.length}</div>
                <div className="text-sm text-gray-600 font-medium">Total Entries</div>
              </div>
            </div>
            
            <div className="group relative">
              <div className="absolute inset-0 bg-gradient-to-r from-green-600 to-emerald-600 rounded-2xl blur-xl opacity-15 group-hover:opacity-25 transition-opacity duration-500"></div>
              <div className="relative bg-white/80 backdrop-blur-xl border border-white/30 rounded-2xl p-6 text-center shadow-xl hover:shadow-green-500/25 transition-all duration-500 transform hover:scale-105 hover:-translate-y-1">
                <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center mb-4 mx-auto shadow-lg">
                  <Award className="w-8 h-8 text-white" />
                </div>
                <div className="text-3xl font-bold text-green-600 mb-2">6</div>
                <div className="text-sm text-gray-600 font-medium">Top Colleges</div>
              </div>
            </div>
            
            <div className="group relative">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl blur-xl opacity-15 group-hover:opacity-25 transition-opacity duration-500"></div>
              <div className="relative bg-white/80 backdrop-blur-xl border border-white/30 rounded-2xl p-6 text-center shadow-xl hover:shadow-purple-500/25 transition-all duration-500 transform hover:scale-105 hover:-translate-y-1">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center mb-4 mx-auto shadow-lg">
                  <Calendar className="w-8 h-8 text-white" />
                </div>
                <div className="text-3xl font-bold text-purple-600 mb-2">2024</div>
                <div className="text-sm text-gray-600 font-medium">Latest Year</div>
              </div>
            </div>
            
            <div className="group relative">
              <div className="absolute inset-0 bg-gradient-to-r from-orange-600 to-red-600 rounded-2xl blur-xl opacity-15 group-hover:opacity-25 transition-opacity duration-500"></div>
              <div className="relative bg-white/80 backdrop-blur-xl border border-white/30 rounded-2xl p-6 text-center shadow-xl hover:shadow-orange-500/25 transition-all duration-500 transform hover:scale-105 hover:-translate-y-1">
                <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl flex items-center justify-center mb-4 mx-auto shadow-lg">
                  <Users className="w-8 h-8 text-white" />
                </div>
                <div className="text-3xl font-bold text-orange-600 mb-2">24</div>
                <div className="text-sm text-gray-600 font-medium">Data Points</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Search and Filters */}
      <section className="relative z-10 pb-12 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="bg-white/80 backdrop-blur-xl border border-white/30 rounded-2xl shadow-xl p-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">
              <span className="bg-gradient-to-r from-gray-900 to-green-800 bg-clip-text text-transparent">
                Search & Filter Cutoffs
              </span>
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Advanced Search Bar */}
              <div className="relative flex-1">
                <AdvancedSearch
                  placeholder="Search by college name, course, or category..."
                  data={cutoffs}
                  searchFields={[
                    { text: 'college_name', weight: 10, type: 'college' },
                    { text: 'course_name', weight: 8, type: 'course' },
                    { text: 'category', weight: 6, type: 'category' },
                    { text: 'stream', weight: 4, type: 'stream' }
                  ]}
                  onSearch={(results) => {
                    // Update the filtered results
                    setFilteredCutoffs(results);
                  }}
                  onClear={() => setFilteredCutoffs(cutoffs)}
                  showAdvancedOptions={false}
                  showSuggestions={true}
                  maxSuggestions={6}
                />
              </div>

              {/* Stream Filter */}
              <select
                value={selectedStream}
                onChange={(e) => setSelectedStream(e.target.value)}
                className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
              >
                <option value="">All Streams</option>
                {uniqueStreams.map(stream => (
                  <option key={stream} value={stream}>{stream}</option>
                ))}
              </select>

              {/* Course Filter */}
              <select
                value={selectedCourse}
                onChange={(e) => setSelectedCourse(e.target.value)}
                className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
              >
                <option value="">All Courses</option>
                {uniqueCourses.map(course => (
                  <option key={course} value={course}>{course}</option>
                ))}
              </select>

              {/* Category Filter */}
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
              >
                <option value="">All Categories</option>
                {uniqueCategories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </section>

      {/* Results Count */}
      <section className="relative z-10 pb-8 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-green-100 to-emerald-200 rounded-xl flex items-center justify-center">
                  <BarChart3 className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Search Results</h3>
                  <p className="text-sm text-gray-600">
                    Showing <span className="font-semibold text-green-600">{filteredCutoffs.length}</span> of{' '}
                    <span className="font-semibold text-gray-900">{cutoffs.length}</span> cutoff entries
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Cutoffs Table */}
      <section className="relative z-10 pb-16 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 overflow-hidden">
            <div className="bg-gradient-to-r from-green-600 via-teal-600 to-emerald-700 px-6 py-4">
              <h3 className="text-xl font-bold text-white">Cutoff Ranks</h3>
              <p className="text-green-100 text-sm">Detailed NEET cutoff data for medical colleges</p>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gradient-to-r from-green-50 to-emerald-50">
                    <th className="px-6 py-4 text-left font-semibold">College</th>
                    <th className="px-6 py-4 text-left font-semibold">Course</th>
                    <th className="px-6 py-4 text-left font-semibold">Category</th>
                    <th className="px-6 py-4 text-center font-semibold" colSpan="2">2024</th>
                    <th className="px-6 py-4 text-center font-semibold" colSpan="2">2023</th>
                  </tr>
                  <tr>
                    <th className="px-6 py-2 text-left font-medium text-green-100"></th>
                    <th className="px-6 py-2 text-left font-medium text-green-100"></th>
                    <th className="px-6 py-2 text-left font-medium text-green-100"></th>
                    <th className="px-6 py-2 text-center font-medium text-green-100">Round 1</th>
                    <th className="px-6 py-2 text-center font-medium text-green-100">Round 2</th>
                    <th className="px-6 py-2 text-center font-medium text-green-100">Round 1</th>
                    <th className="px-6 py-2 text-center font-medium text-green-100">Round 2</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredCutoffs.length > 0 ? (
                    filteredCutoffs.map((cutoff) => {
                      const rankChange2024R1 = getRankChange(cutoff["2024_round1"], cutoff["2023_round1"]);
                      const rankChange2024R2 = getRankChange(cutoff["2024_round2"], cutoff["2023_round2"]);
                      
                      return (
                        <tr key={cutoff.id} className="hover:bg-gray-50 transition-colors duration-200">
                          {/* College Name and State */}
                          <td className="px-6 py-4">
                            <div className="font-medium text-gray-900">{cutoff.college_name}</div>
                            <div className="text-sm text-gray-500">{cutoff.state}</div>
                          </td>
                          <td className="px-6 py-4 text-gray-900">{cutoff.course}</td>
                          <td className="px-6 py-4">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              cutoff.category === 'General' ? 'bg-blue-100 text-blue-800' :
                              cutoff.category === 'OBC' ? 'bg-green-100 text-green-800' :
                              cutoff.category === 'SC' ? 'bg-purple-100 text-purple-800' :
                              cutoff.category === 'ST' ? 'bg-red-100 text-red-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {cutoff.category}
                            </span>
                          </td>
                          {/* 2024 Round 1 */}
                          <td className="px-6 py-4 text-center">
                            <div className="text-gray-900 font-medium">{cutoff["2024_round1"]}</div>
                            <div className="flex items-center justify-center space-x-1 mt-1">
                              {rankChange2024R1.icon}
                              <span className={`text-xs font-medium ${
                                rankChange2024R1.type === 'up' ? 'text-green-600' :
                                rankChange2024R1.type === 'down' ? 'text-red-600' :
                                'text-gray-600'
                              }`}>
                                {rankChange2024R1.value > 0 ? `+${rankChange2024R1.value}` : rankChange2024R1.value === 0 ? 'Stable' : `-${rankChange2024R1.value}`}
                              </span>
                            </div>
                          </td>
                          {/* 2024 Round 2 */}
                          <td className="px-6 py-4 text-center">
                            <div className="text-gray-900 font-medium">{cutoff["2024_round2"]}</div>
                            <div className="flex items-center justify-center space-x-1 mt-1">
                              {rankChange2024R2.icon}
                              <span className={`text-xs font-medium ${
                                rankChange2024R2.type === 'up' ? 'text-green-600' :
                                rankChange2024R2.type === 'down' ? 'text-red-600' :
                                'text-gray-600'
                              }`}>
                                {rankChange2024R2.value > 0 ? `+${rankChange2024R2.value}` : rankChange2024R2.value === 0 ? 'Stable' : `-${rankChange2024R2.value}`}
                              </span>
                            </div>
                          </td>
                          {/* 2023 Round 1 */}
                          <td className="px-6 py-4 text-center text-gray-600">{cutoff["2023_round1"]}</td>
                          {/* 2023 Round 2 */}
                          <td className="px-6 py-4 text-center text-gray-600">{cutoff["2023_round2"]}</td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan="7" className="px-6 py-12 text-center">
                        <div className="flex flex-col items-center space-y-3">
                          <Search className="w-12 h-12 text-gray-400" />
                          <div>
                            <h3 className="text-lg font-medium text-gray-900">No cutoffs found</h3>
                            <p className="text-gray-500">Try adjusting your search criteria or filters</p>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      {/* Scroll to Top Button */}
      <button
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        className="fixed bottom-6 right-6 w-12 h-12 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-full shadow-xl hover:shadow-2xl transition-all duration-300 flex items-center justify-center z-50 hover:scale-110"
        title="Scroll to top"
      >
        <ArrowUp className="w-6 h-6" />
      </button>
    </div>
  );
};

export default Cutoffs;
