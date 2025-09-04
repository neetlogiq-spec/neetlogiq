import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Sparkles, Target, TrendingUp, CheckCircle, AlertCircle } from 'lucide-react';
import AdvancedSearchService from '../services/advancedSearchService';
import BeautifulLoader from '../components/BeautifulLoader';
import { useTheme } from '../context/ThemeContext';

// Sample college data for demo
const sampleColleges = [
    {
      id: 1,
      name: "Ramaiah Medical College",
      city: "Bangalore",
      state: "Karnataka",
      college_type: "Private",
      stream: "MEDICAL"
    },
    {
      id: 2,
      name: "Karnataka Medical College",
      city: "Hubli",
      state: "Karnataka",
      college_type: "Government",
      stream: "MEDICAL"
    },
    {
      id: 3,
      name: "Dental College Bangalore",
      city: "Bangalore",
      state: "Karnataka",
      college_type: "Private",
      stream: "DENTAL"
    },
    {
      id: 4,
      name: "Government Medical College",
      city: "Mysore",
      state: "Karnataka",
      college_type: "Government",
      stream: "MEDICAL"
    },
    {
      id: 5,
      name: "Private Dental Institute",
      city: "Mangalore",
      state: "Karnataka",
      college_type: "Private",
      stream: "DENTAL"
    }
  ];

const SearchDemo = () => {
  const [searchService, setSearchService] = useState(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [demoQuery, setDemoQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchStats, setSearchStats] = useState(null);
  const { isDarkMode } = useTheme();

  // Initialize search service
  useEffect(() => {
    const initService = async () => {
      try {
        const service = new AdvancedSearchService();
        await service.initialize(sampleColleges);
        setSearchService(service);
        setIsInitialized(true);
        console.log('✅ Demo search service initialized');
      } catch (error) {
        console.error('❌ Failed to initialize demo service:', error);
      }
    };

    initService();
  }, []);

  // Perform demo search
  const performDemoSearch = async (query) => {
    if (!searchService || !isInitialized) return;

    try {
      setIsSearching(true);
      setDemoQuery(query);
      
      console.log('🔍 Demo search for:', query);
      const results = await searchService.search(query);
      
      setSearchResults(results.results || []);
      setSearchStats(results.metadata || {});
      
      console.log('✅ Demo search completed:', results);
    } catch (error) {
      console.error('❌ Demo search failed:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  // Demo queries
  const demoQueries = [
    { query: "ramaiah", description: "Exact college name" },
    { query: "ramaih", description: "Typo tolerance test" },
    { query: "medical colleges in bangalore", description: "Natural language query" },
    { query: "government medical", description: "Type and stream combination" },
    { query: "dental karnataka", description: "Stream and location" },
    { query: "medicel", description: "Fuzzy matching test" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 text-white">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-4xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            Advanced Search Demo
          </h1>
          <p className="text-xl text-blue-200 max-w-3xl mx-auto">
            Experience the power of AI-powered search with Lunr.js and TensorFlow.js
          </p>
        </motion.div>

        {/* Service Status */}
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
            <div className="flex items-center justify-center gap-4 mb-4">
              <div className={`flex items-center gap-2 px-4 py-2 rounded-full ${
                isInitialized 
                  ? 'bg-green-500/20 text-green-300 border border-green-500/30' 
                  : 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30'
              }`}>
                {isInitialized ? <CheckCircle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
                {isInitialized ? 'AI Search Ready' : 'Initializing...'}
              </div>
              
              {isInitialized && (
                <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                  <Sparkles className="w-5 h-5" />
                  Lunr.js + TensorFlow.js
                </div>
              )}
            </div>
            
            {searchStats && (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-center">
                <div className="bg-blue-500/20 rounded-lg p-3">
                  <div className="text-2xl font-bold text-blue-300">{searchStats.totalResults}</div>
                  <div className="text-sm text-blue-200">Total Results</div>
                </div>
                <div className="bg-green-500/20 rounded-lg p-3">
                  <div className="text-2xl font-bold text-green-300">{searchStats.searchTime?.toFixed(1) || 0}ms</div>
                  <div className="text-sm text-green-200">Search Time</div>
                </div>
                <div className="bg-purple-500/20 rounded-lg p-3">
                  <div className="text-2xl font-bold text-purple-300">{searchStats.algorithm || 'Hybrid'}</div>
                  <div className="text-sm text-purple-200">Algorithm</div>
                </div>
                <div className="bg-orange-500/20 rounded-lg p-3">
                  <div className="text-2xl font-bold text-orange-300">5</div>
                  <div className="text-sm text-orange-200">Sample Colleges</div>
                </div>
              </div>
            )}
          </div>
        </motion.div>

        {/* Demo Search Bar */}
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
            <h2 className="text-2xl font-bold mb-4 text-center">Try Advanced Search</h2>
            
            <div className="flex gap-4 mb-4">
              <input
                type="text"
                placeholder="Enter your search query..."
                value={demoQuery}
                onChange={(e) => setDemoQuery(e.target.value)}
                className={`flex-1 px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all duration-300 ${
                  isDarkMode 
                    ? 'bg-white/20 border border-white/30 text-white placeholder-white/60' 
                    : 'bg-white/95 backdrop-blur-sm text-gray-900 placeholder-gray-500 shadow-lg border border-gray-200'
                }`}
              />
              <button
                onClick={() => performDemoSearch(demoQuery)}
                disabled={!isInitialized || !demoQuery.trim()}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 rounded-xl font-semibold transition-colors flex items-center gap-2"
              >
                {isSearching ? (
                  <>
                    <div className="w-5 h-5">
                      <BeautifulLoader size="small" showText={false} />
                    </div>
                    Searching...
                  </>
                ) : (
                  <>
                    <Search className="w-5 h-5" />
                    Search
                  </>
                )}
              </button>
            </div>

            {/* Quick Demo Queries */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {demoQueries.map((demo, index) => (
                <button
                  key={index}
                  onClick={() => performDemoSearch(demo.query)}
                  className="text-left p-3 bg-white/10 hover:bg-white/20 rounded-lg border border-white/20 transition-colors"
                >
                  <div className="font-medium text-blue-300">{demo.query}</div>
                  <div className="text-sm text-white/70">{demo.description}</div>
                </button>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Search Results */}
        {searchResults.length > 0 && (
          <motion.div
            className="mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
          >
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
              <h2 className="text-2xl font-bold mb-4 text-center">
                Search Results for "{demoQuery}"
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {searchResults.map((college, index) => (
                  <div
                    key={college.id || index}
                    className="bg-white/10 rounded-xl p-4 border border-white/20"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-lg font-semibold text-blue-300">{college.name}</span>
                      {college.matchType && (
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          college.matchType === 'lunr' ? 'bg-blue-500/30 text-blue-300' :
                          college.matchType === 'ai' ? 'bg-purple-500/30 text-purple-300' :
                          'bg-green-500/30 text-green-300'
                        }`}>
                          {college.matchType.toUpperCase()}
                        </span>
                      )}
                    </div>
                    
                    <div className="space-y-1 text-sm text-white/80">
                      <div>📍 {college.city}, {college.state}</div>
                      <div>🏛️ {college.college_type}</div>
                      <div>🎓 {college.stream}</div>
                      {college.relevanceScore && (
                        <div className="flex items-center gap-2">
                          <Target className="w-4 h-4 text-yellow-400" />
                          <span className="text-yellow-300">
                            Relevance: {(college.relevanceScore * 100).toFixed(1)}%
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* Features Showcase */}
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.8 }}
        >
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
            <h2 className="text-2xl font-bold mb-6 text-center">Advanced Features</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Search className="w-8 h-8 text-blue-300" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Fuzzy Search</h3>
                <p className="text-white/70 text-sm">
                  Find results even with typos and spelling mistakes
                </p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Sparkles className="w-8 h-8 text-purple-300" />
                </div>
                <h3 className="text-lg font-semibold mb-2">AI Intent</h3>
                <p className="text-white/70 text-sm">
                  Understand natural language queries and user intent
                </p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <TrendingUp className="w-8 h-8 text-green-300" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Smart Ranking</h3>
                <p className="text-white/70 text-sm">
                  Results ranked by relevance and importance
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Technical Details */}
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 1.0 }}
        >
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
            <h2 className="text-2xl font-bold mb-6 text-center">Technical Implementation</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold mb-3 text-blue-300">Lunr.js (Fast Search)</h3>
                <ul className="space-y-2 text-sm text-white/80">
                  <li>• Typo tolerance with ~2 fuzzy matching</li>
                  <li>• Field boosting for relevance scoring</li>
                  <li>• Client-side processing for speed</li>
                  <li>• No API calls or rate limits</li>
                </ul>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold mb-3 text-purple-300">TensorFlow.js (AI)</h3>
                <ul className="space-y-2 text-sm text-white/80">
                  <li>• Neural network for intent classification</li>
                  <li>• Natural language understanding</li>
                  <li>• Context-aware search results</li>
                  <li>• Learning from user behavior</li>
                </ul>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Footer */}
        <motion.div
          className="text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 1.2 }}
        >
          <p className="text-white/60">
            Built with React, Lunr.js, TensorFlow.js, and Compromise.js
          </p>
          <p className="text-white/40 text-sm mt-2">
            Experience professional-grade search without external dependencies
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default SearchDemo;
