import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Building2, Search, ChevronDown, ChevronUp, ArrowUp, MapPin, Clock, TrendingUp, Filter, X, History, Lightbulb } from 'lucide-react';
import AdvancedSearch from '../components/AdvancedSearch';

// Fuzzy search utility functions
const calculateLevenshteinDistance = (str1, str2) => {
  const matrix = [];
  for (let i = 0; i <= str2.length; i++) {
    matrix[i] = [i];
  }
  for (let j = 0; j <= str1.length; j++) {
    matrix[0][j] = j;
  }
  for (let i = 1; i <= str2.length; i++) {
    for (let j = 1; j <= str1.length; j++) {
      if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }
  return matrix[str2.length][str1.length];
};

const fuzzySearch = (query, text, threshold = 3) => {
  if (!query || !text) return false;
  
  const queryLower = query.toLowerCase();
  const textLower = text.toLowerCase();
  
  // Exact match gets highest priority
  if (textLower.includes(queryLower)) return { score: 0, type: 'exact' };
  
  // Word boundary match
  const words = textLower.split(/\s+/);
  const wordMatch = words.some(word => word.startsWith(queryLower));
  if (wordMatch) return { score: 1, type: 'word-start' };
  
  // Contains match
  if (textLower.includes(queryLower)) return { score: 2, type: 'contains' };
  
  // Fuzzy match using Levenshtein distance
  const distance = calculateLevenshteinDistance(queryLower, textLower);
  if (distance <= threshold) {
    return { score: 3 + distance, type: 'fuzzy' };
  }
  
  // Acronym match (e.g., "AIIMS" matches "All India Institute of Medical Sciences")
  const acronym = words.map(word => word.charAt(0)).join('');
  if (acronym.includes(queryLower)) return { score: 4, type: 'acronym' };
  
  return false;
};

const generateSearchSuggestions = (colleges, searchTerm, maxSuggestions = 8) => {
  if (!searchTerm || searchTerm.length < 2) return [];
  
  const suggestions = [];
  const searchTermLower = searchTerm.toLowerCase();
  
  // Search across multiple fields with different weights
  colleges.forEach(college => {
    const fields = [
              { text: college.name, weight: 10, type: 'college' },
      { text: college.location, weight: 8, type: 'city' },
      { text: college.state, weight: 6, type: 'state' },
      { text: college.type, weight: 4, type: 'type' },
      { text: college.management_type, weight: 3, type: 'management' }
    ];
    
    fields.forEach(field => {
      if (field.text) {
        const match = fuzzySearch(searchTermLower, field.text);
        if (match) {
          suggestions.push({
            text: field.text,
            type: field.type,
            college: college,
            score: match.score * field.weight,
            matchType: match.type
          });
        }
      }
    });
  });
  
  // Remove duplicates and sort by relevance
  const uniqueSuggestions = suggestions
    .filter((suggestion, index, self) => 
      index === self.findIndex(s => s.text === suggestion.text && s.type === suggestion.type)
    )
    .sort((a, b) => a.score - b.score)
    .slice(0, maxSuggestions);
  
  return uniqueSuggestions;
};

// Advanced Search Utilities

// 1. Phonetic Search (Soundex and Metaphone)
const soundex = (str) => {
  const soundexMap = {
    'b': '1', 'f': '1', 'p': '1', 'v': '1',
    'c': '2', 'g': '2', 'j': '2', 'k': '2', 'q': '2', 's': '2', 'x': '2', 'z': '2',
    'd': '3', 't': '3',
    'l': '4',
    'm': '5', 'n': '5',
    'r': '6'
  };
  
  str = str.toLowerCase().replace(/[^a-z]/g, '');
  if (!str) return '';
  
  let result = str[0].toUpperCase();
  let prevCode = soundexMap[str[0]] || '';
  
  for (let i = 1; i < str.length && result.length < 4; i++) {
    const code = soundexMap[str[i]] || '';
    if (code && code !== prevCode) {
      result += code;
      prevCode = code;
    }
  }
  
  return result.padEnd(4, '0');
};

const metaphone = (str) => {
  str = str.toLowerCase().replace(/[^a-z]/g, '');
  if (!str) return '';
  
  // Simplified metaphone rules
  const rules = [
    [/^kn|gn|pn|ac|wr/, 'n'],
    [/^x/, 's'],
    [/^wh/, 'w'],
    [/^mb$/, 'm'],
    [/ck/, 'k'],
    [/ph/, 'f'],
    [/th/, '0'],
    [/sh/, 'x'],
    [/ch/, 'x'],
    [/dg/, 'j'],
    [/gh/, 'g'],
    [/gn/, 'n'],
    [/mb/, 'm'],
    [/ph/, 'f'],
    [/sh/, 'x'],
    [/th/, '0'],
    [/wh/, 'w'],
    [/ck/, 'k'],
    [/dg/, 'j'],
    [/gh/, 'g'],
    [/gn/, 'n'],
    [/mb/, 'm'],
    [/ph/, 'f'],
    [/sh/, 'x'],
    [/th/, '0'],
    [/wh/, 'w']
  ];
  
  let result = str;
  rules.forEach(([pattern, replacement]) => {
    result = result.replace(pattern, replacement);
  });
  
  return result.slice(0, 6);
};

// 2. Wildcard Search
const wildcardSearch = (pattern, text) => {
  if (!pattern || !text) return false;
  
  // Convert wildcard pattern to regex
  const regexPattern = pattern
    .replace(/\./g, '\\.')  // Escape dots
    .replace(/\*/g, '.*')   // Convert * to .*
    .replace(/\?/g, '.')    // Convert ? to .
    .replace(/\s+/g, '\\s+'); // Handle multiple spaces
  
  const regex = new RegExp(regexPattern, 'i');
  return regex.test(text);
};

// 3. Regex Pattern Search
const regexSearch = (pattern, text) => {
  try {
    const regex = new RegExp(pattern, 'i');
    return regex.test(text);
  } catch (error) {
    console.warn('Invalid regex pattern:', pattern);
    return false;
  }
};

// 4. Synonym and Alias Search
const synonyms = {
  // Medical terms
  'mbbs': ['bachelor of medicine', 'bachelor of surgery', 'medical degree'],
  'md': ['doctor of medicine', 'medical doctor'],
  'ms': ['master of surgery', 'surgical degree'],
  'mds': ['master of dental surgery', 'dental surgery'],
  'bds': ['bachelor of dental surgery', 'dental degree'],
  'dnb': ['diplomate of national board', 'national board'],
  
  // Common abbreviations
  'aiims': ['all india institute of medical sciences'],
  'jipmer': ['jawaharlal institute of postgraduate medical education and research'],
  'govt': ['government', 'gov'],
  'pvt': ['private'],
  'deemed': ['deemed university', 'deemed to be university'],
  
  // Location variations
  'delhi': ['new delhi', 'dilli'],
  'mumbai': ['bombay'],
  'kolkata': ['calcutta'],
  'chennai': ['madras'],
  'bangalore': ['bengaluru'],
  'hyderabad': ['secunderabad'],
  
  // Medical specialties
  'cardiology': ['cardiac', 'heart'],
  'neurology': ['brain', 'nervous system'],
  'orthopedics': ['ortho', 'bone'],
  'pediatrics': ['paediatrics', 'child'],
  'gynecology': ['gynaecology', 'women health'],
  'dermatology': ['skin', 'derma'],
  'psychiatry': ['mental health', 'psychology'],
  'radiology': ['xray', 'imaging'],
  'anesthesiology': ['anaesthesiology', 'anaesthesia']
};

const expandSynonyms = (query) => {
  const expanded = [query.toLowerCase()];
  
  // Add direct synonyms
  if (synonyms[query.toLowerCase()]) {
    expanded.push(...synonyms[query.toLowerCase()]);
  }
  
  // Check for partial matches
  Object.keys(synonyms).forEach(key => {
    if (key.includes(query.toLowerCase()) || query.toLowerCase().includes(key)) {
      expanded.push(...synonyms[key]);
    }
  });
  
  // Add word variations
  const words = query.toLowerCase().split(/\s+/);
  words.forEach(word => {
    if (synonyms[word]) {
      expanded.push(...synonyms[word]);
    }
  });
  
  return [...new Set(expanded)];
};

// 5. Location-Aware Search
const locationVariations = {
  'delhi': ['new delhi', 'dilli', 'delhi ncr', 'ncr'],
  'mumbai': ['bombay', 'greater mumbai', 'mumbai metropolitan'],
  'kolkata': ['calcutta', 'greater kolkata'],
  'chennai': ['madras', 'greater chennai'],
  'bangalore': ['bengaluru', 'bangaluru', 'greater bangalore'],
  'hyderabad': ['secunderabad', 'greater hyderabad', 'twin cities'],
  'pune': ['puna', 'greater pune'],
  'ahmedabad': ['ahmedbad', 'greater ahmedabad'],
  'jaipur': ['pink city', 'greater jaipur'],
  'lucknow': ['nawabi city', 'greater lucknow'],
  'kanpur': ['cawnpore', 'greater kanpur'],
  'nagpur': ['orange city', 'greater nagpur'],
  'indore': ['greater indore'],
  'thane': ['greater thane'],
  'bhopal': ['city of lakes', 'greater bhopal'],
  'visakhapatnam': ['vizag', 'visakhapatnam', 'greater vizag'],
  'patna': ['greater patna'],
  'vadodara': ['baroda', 'greater vadodara'],
  'ghaziabad': ['greater ghaziabad'],
  'ludhiana': ['greater ludhiana'],
  'agra': ['greater agra'],
  'nashik': ['greater nashik'],
  'faridabad': ['greater faridabad'],
  'meerut': ['greater meerut'],
  'rajkot': ['greater rajkot'],
  'kalyan': ['greater kalyan'],
  'vasai': ['greater vasai'],
  'vashi': ['greater vashi'],
  'aurangabad': ['greater aurangabad'],
  'noida': ['greater noida'],
  'gurgaon': ['gurugram', 'greater gurgaon']
};

const expandLocationSearch = (location) => {
  const expanded = [location.toLowerCase()];
  
  // Add location variations
  if (locationVariations[location.toLowerCase()]) {
    expanded.push(...locationVariations[location.toLowerCase()]);
  }
  
  // Add common suffixes
  const suffixes = ['city', 'town', 'village', 'district', 'state'];
  suffixes.forEach(suffix => {
    expanded.push(`${location.toLowerCase()} ${suffix}`);
  });
  
  return [...new Set(expanded)];
};

// 6. Vector/Semantic Search using word embeddings
const calculateSemanticSimilarity = (query, text) => {
  if (!query || !text) return 0;
  
  const queryWords = query.toLowerCase().split(/\s+/).filter(word => word.length > 2);
  const textWords = text.toLowerCase().split(/\s+/).filter(word => word.length > 2);
  
  if (queryWords.length === 0 || textWords.length === 0) return 0;
  
  // Calculate word overlap
  const commonWords = queryWords.filter(word => textWords.includes(word));
  const overlapScore = commonWords.length / Math.max(queryWords.length, textWords.length);
  
  // Calculate word similarity using edit distance
  let similarityScore = 0;
  queryWords.forEach(queryWord => {
    let bestMatch = 0;
    textWords.forEach(textWord => {
      const distance = calculateLevenshteinDistance(queryWord, textWord);
      const wordSimilarity = Math.max(0, 1 - distance / Math.max(queryWord.length, textWord.length));
      bestMatch = Math.max(bestMatch, wordSimilarity);
    });
    similarityScore += bestMatch;
  });
  
  const avgSimilarity = similarityScore / queryWords.length;
  
  // Combine overlap and similarity scores
  return (overlapScore * 0.6) + (avgSimilarity * 0.4);
};

// 7. Advanced Search Engine
const advancedSearch = (query, colleges, searchOptions = {}) => {
  const {
    useFuzzy = true,
    usePhonetic = true,
    useWildcard = true,
    useRegex = false,
    useSynonyms = true,
    useLocation = true,
    useSemantic = true,
    fuzzyThreshold = 3,
    semanticThreshold = 0.3
  } = searchOptions;
  
  if (!query || !colleges) return [];
  
  const results = [];
  const queryLower = query.toLowerCase();
  
  colleges.forEach(college => {
    let bestScore = 0;
    let bestMatchType = 'none';
    
    // Search across all relevant fields
    const searchFields = [
      { text: college.name, weight: 10, type: 'college_name' },
      { text: college.location, weight: 8, type: 'location' },
      { text: college.state, weight: 6, type: 'state' },
      { text: college.type, weight: 4, type: 'college_type' },
      { text: college.management_type, weight: 3, type: 'management' },
      { text: college.district, weight: 5, type: 'district' }
    ];
    
    searchFields.forEach(field => {
      if (!field.text) return;
      
      let fieldScore = 0;
      let matchType = 'none';
      
      // 1. Exact match (highest priority)
      if (field.text.toLowerCase() === queryLower) {
        fieldScore = 100;
        matchType = 'exact';
      }
      // 2. Contains match
      else if (field.text.toLowerCase().includes(queryLower)) {
        fieldScore = 80;
        matchType = 'contains';
      }
      // 3. Word boundary match
      else if (field.text.toLowerCase().split(/\s+/).some(word => word.startsWith(queryLower))) {
        fieldScore = 70;
        matchType = 'word_start';
      }
      // 4. Fuzzy search
      else if (useFuzzy) {
        const fuzzyResult = fuzzySearch(queryLower, field.text, fuzzyThreshold);
        if (fuzzyResult) {
          fieldScore = 60 - fuzzyResult.score * 10;
          matchType = `fuzzy_${fuzzyResult.type}`;
        }
      }
      // 5. Phonetic search
      else if (usePhonetic) {
        const querySoundex = soundex(query);
        const textSoundex = soundex(field.text);
        const queryMetaphone = metaphone(query);
        const textMetaphone = metaphone(field.text);
        
        if (querySoundex === textSoundex) {
          fieldScore = 50;
          matchType = 'soundex';
        } else if (queryMetaphone === textMetaphone) {
          fieldScore = 45;
          matchType = 'metaphone';
        }
      }
      // 6. Wildcard search
      else if (useWildcard && (query.includes('*') || query.includes('?'))) {
        if (wildcardSearch(query, field.text)) {
          fieldScore = 40;
          matchType = 'wildcard';
        }
      }
      // 7. Regex search
      else if (useRegex && query.startsWith('/') && query.endsWith('/')) {
        const pattern = query.slice(1, -1);
        if (regexSearch(pattern, field.text)) {
          fieldScore = 35;
          matchType = 'regex';
        }
      }
      // 8. Synonym search
      else if (useSynonyms) {
        const synonyms = expandSynonyms(query);
        if (synonyms.some(synonym => field.text.toLowerCase().includes(synonym))) {
          fieldScore = 30;
          matchType = 'synonym';
        }
      }
      // 9. Location-aware search
      else if (useLocation && (field.type === 'location' || field.type === 'state' || field.type === 'district')) {
        const locationVariations = expandLocationSearch(query);
        if (locationVariations.some(loc => field.text.toLowerCase().includes(loc))) {
          fieldScore = 25;
          matchType = 'location_variation';
        }
      }
      // 10. Semantic search
      else if (useSemantic) {
        const semanticScore = calculateSemanticSimilarity(query, field.text);
        if (semanticScore > semanticThreshold) {
          fieldScore = semanticScore * 20;
          matchType = 'semantic';
        }
      }
      
      // Apply field weight
      fieldScore *= field.weight;
      
      if (fieldScore > bestScore) {
        bestScore = fieldScore;
        bestMatchType = matchType;
      }
    });
    
    if (bestScore > 0) {
      results.push({
        college,
        score: bestScore,
        matchType: bestMatchType
      });
    }
  });
  
  // Sort by score (highest first)
  return results.sort((a, b) => b.score - a.score);
};

const Colleges = () => {
  // Add CSS for search suggestions
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      .search-suggestions-container {
        position: absolute;
        top: 100%;
        left: 0;
        right: 0;
        z-index: 99999;
      }
    `;
    document.head.appendChild(style);
    
    return () => {
      document.head.removeChild(style);
    };
  }, []);
  // All hooks at the top level
  const [colleges, setColleges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchSuggestions, setSearchSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [searchHistory, setSearchHistory] = useState([]);
  const [recentSearches, setRecentSearches] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchFocus, setSearchFocus] = useState(false);
  const [expandedCards, setExpandedCards] = useState(new Set());
  const [filters, setFilters] = useState({
    stream: '',
    course: '',
    branch: '',
    state: '',
    collegeType: ''
  });
  
  // Advanced search options
  const [searchOptions, setSearchOptions] = useState({
    useFuzzy: true,
    usePhonetic: true,
    useWildcard: true,
    useRegex: false,
    useSynonyms: true,
    useLocation: true,
    useSemantic: true,
    fuzzyThreshold: 3,
    semanticThreshold: 0.3
  });
  
  const [showAdvancedSearch, setShowAdvancedSearch] = useState(false);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    itemsPerPage: 24,
    totalPages: 1
  });
  const [collegeCourses, setCollegeCourses] = useState({}); // Store courses for each college
  const [loadingCourses, setLoadingCourses] = useState(false); // Track course loading state
  // Load search history from localStorage
  useEffect(() => {
    const savedHistory = localStorage.getItem('collegeSearchHistory');
    if (savedHistory) {
      const history = JSON.parse(savedHistory);
      setSearchHistory(history);
      setRecentSearches(history.slice(-5).reverse()); // Last 5 searches
    }
  }, []);

  // Save search history to localStorage
  const saveSearchHistory = useCallback((searchTerm) => {
    if (!searchTerm.trim()) return;
    
    const newHistory = [
      searchTerm,
      ...searchHistory.filter(item => item !== searchTerm)
    ].slice(0, 20); // Keep last 20 searches
    
    setSearchHistory(newHistory);
    setRecentSearches(newHistory.slice(0, 5));
    localStorage.setItem('collegeSearchHistory', JSON.stringify(newHistory));
  }, [searchHistory]);

  // Enhanced search with advanced search engine
  const performSearch = useCallback((query) => {
    if (!query.trim()) {
      setFilteredColleges(colleges);
      return;
    }

    setIsSearching(true);
    
    // Simulate search delay for better UX
    setTimeout(() => {
      // Import and use advanced search engine
      import('../utils/advancedSearch.js').then(({ advancedSearch }) => {
        const searchFields = [
          { text: 'name', weight: 10, type: 'college' },
          { text: 'location', weight: 8, type: 'city' },
          { text: 'state', weight: 6, type: 'state' },
          { text: 'type', weight: 4, type: 'type' },
          { text: 'management_type', weight: 3, type: 'management' },
          { text: 'district', weight: 5, type: 'district' }
        ];
        
        const searchResults = advancedSearch(query, colleges, searchFields, searchOptions);
        const results = searchResults.map(result => result.item);
        
        console.log('🔍 Advanced search results:', {
          query,
          totalResults: results.length,
          topResults: searchResults.slice(0, 5).map(r => ({
            name: r.item.name,
            score: r.score,
            matchType: r.matchType
          }))
      });
      
      setFilteredColleges(results);
      setIsSearching(false);
      });
    }, 300);
  }, [colleges, searchOptions]);

  // Generate search suggestions
  useEffect(() => {
    if (searchTerm.length >= 2) {
      const suggestions = generateSearchSuggestions(colleges, searchTerm);
      setSearchSuggestions(suggestions);
      setShowSuggestions(true);
    } else {
      setSearchSuggestions([]);
      setShowSuggestions(false);
    }
  }, [searchTerm, colleges]);

  // Handle search input changes
  const handleSearchChange = (value) => {
    setSearchTerm(value);
    if (value.trim()) {
      performSearch(value);
    } else {
      setFilteredColleges(colleges);
    }
  };

  // Handle suggestion selection
  const handleSuggestionSelect = (suggestion) => {
    setSearchTerm(suggestion.text);
    setShowSuggestions(false);
    performSearch(suggestion.text);
    saveSearchHistory(suggestion.text);
  };

  // Handle search submission
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      performSearch(searchTerm);
      saveSearchHistory(searchTerm);
      setShowSuggestions(false);
    }
  };

  // Clear search
  const clearSearch = () => {
    setSearchTerm('');
    setFilteredColleges(colleges);
    setSearchSuggestions([]);
    setShowSuggestions(false);
    // Reset to first page when search is cleared
    setPagination(prev => ({ ...prev, currentPage: 1 }));
  };

  // Get search icon based on search state
  const getSearchIcon = () => {
    if (isSearching) {
      return <div className="w-5 h-5 border-2 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>;
    }
    if (searchTerm) {
      return <Search className="w-5 h-5 text-blue-600" />;
    }
    return <Search className="w-5 h-5 text-gray-400" />;
  };

  // Simple fetch function
  const fetchColleges = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🔍 Fetching colleges from API...');
      const credentials = btoa('Lone_wolf#12:Apx_gp_delta');
      console.log('🔍 Using credentials:', 'Lone_wolf#12:Apx_gp_delta');
      
      const response = await fetch('/api/sector_xp_12/colleges', {
        headers: {
          'Authorization': `Basic ${credentials}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('🔍 API Response status:', response.status);
      console.log('🔍 API Response headers:', response.headers);
      
      if (response.ok) {
        const data = await response.json();
        console.log('🔍 API Response data:', data);
        const collegesData = data.data || [];
        console.log('🔍 Colleges data length:', collegesData.length);
        console.log('🔍 First college:', collegesData[0]);
        
        setColleges(collegesData);
        
        // Calculate total pages
        const totalPages = Math.ceil(collegesData.length / pagination.itemsPerPage);
        setPagination(prev => ({ ...prev, totalPages }));
      } else {
        const errorText = await response.text();
        console.error('🔍 API Error response:', errorText);
        throw new Error(`Failed to fetch colleges: ${response.status} - ${errorText}`);
      }
    } catch (err) {
      console.error('🔍 Error fetching colleges:', err);
      setError(err.message);
      
      // Fallback data
      const mockColleges = [
        {
          id: 1,
          name: "AIIMS Delhi",
          type: "MEDICAL",
          state: "Delhi",
          location: "New Delhi",
          total_courses: 15,
          total_seats: 1200,
          management_type: "GOVERNMENT"
        },
        {
          id: 2,
          name: "JIPMER Puducherry",
          type: "MEDICAL",
          state: "Puducherry",
          location: "Puducherry",
          total_courses: 12,
          total_seats: 800,
          management_type: "GOVERNMENT"
        }
      ];
      
      console.log('🔍 Using fallback mock data:', mockColleges);
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

  // Initialize filtered colleges when colleges are first loaded
  useEffect(() => {
    if (colleges.length > 0) {
      console.log('🔍 Setting filtered colleges:', colleges.length);
      setFilteredColleges(colleges);
      // Also update pagination
      const totalPages = Math.ceil(colleges.length / pagination.itemsPerPage);
      setPagination(prev => ({ ...prev, totalPages }));
    }
  }, [colleges, pagination.itemsPerPage]);

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

  // Initialize filtered colleges state
  const [filteredColleges, setFilteredColleges] = useState([]);
  const [isFiltering, setIsFiltering] = useState(false);

  // Update filtered colleges when colleges or filters change
  useEffect(() => {
    setIsFiltering(true);
    
    // Small delay to show loading state for better UX
    const timeoutId = setTimeout(() => {
      let filtered = [...colleges];
      
      // Debug: Log first college to see data structure
      if (colleges.length > 0) {
        console.log('🔍 First college data structure:', colleges[0]);
          console.log('🔍 Available college types:', [...new Set(colleges.map(c => c.type))]);
        console.log('🔍 Available management types:', [...new Set(colleges.map(c => c.management_type))]);
        
        // Debug: Log filtering process
        console.log('🔍 Current filters:', filters);
        console.log('🔍 Total colleges before filtering:', colleges.length);
        
        // Debug: Log stream-specific college counts
        const medicalColleges = colleges.filter(c => c.type === 'MEDICAL');
        const dentalColleges = colleges.filter(c => c.type === 'DENTAL');
        const dnbColleges = colleges.filter(c => c.type === 'DNB');
        console.log('🔍 Medical colleges count:', medicalColleges.length, '(Expected: 848)');
        console.log('🔍 Dental colleges count:', dentalColleges.length, '(Expected: 328)');
        console.log('🔍 DNB colleges count:', dnbColleges.length, '(Expected: 1,223)');
        
        // Debug: Log management type distribution
        const managementTypes = {};
        colleges.forEach(c => {
          const type = c.management_type || 'Unknown';
          managementTypes[type] = (managementTypes[type] || 0) + 1;
        });
        console.log('🔍 Management type distribution:', managementTypes);
        
        // Debug: Log college type filter results
        if (filters.collegeType) {
          const filteredByType = filtered.filter(c => {
            if (filters.collegeType === 'Government') {
            return (c.management_type === 'Government' || c.management_type === 'Govt.' || c.management_type === 'GOVERNMENT') && c.type !== 'DNB';
            } else if (filters.collegeType === 'DNB') {
            return c.type === 'DNB';
            }
            return c.management_type === filters.collegeType;
          });
          console.log('🔍 College Type Filter:', filters.collegeType, 'Results:', filteredByType.length);
          console.log('🔍 DNB colleges in Government filter:', filteredByType.filter(c => c.type === 'DNB').length, '(Should be 0)');
          
          // Debug: Show all colleges that are being classified as Government
          if (filters.collegeType === 'Government') {
            const governmentColleges = filtered.filter(c => 
              c.type !== 'DNB' && isActuallyGovernmentCollege(c)
            );
            console.log('🔍 All Government colleges found (using helper function):', governmentColleges.length);
            console.log('🔍 Government colleges details:', governmentColleges.map(c => ({
              name: c.name,
              type: c.type,
              management: c.management_type,
              state: c.state,
              isActuallyGov: isActuallyGovernmentCollege(c)
            })));
            
            // Also show colleges that have Government management_type but aren't actually government
            const misleadingGovernmentColleges = filtered.filter(c => 
              c.type !== 'DNB' && 
              (c.management_type === 'Government' || c.management_type === 'Govt.' || c.management_type === 'GOVERNMENT') &&
              !isActuallyGovernmentCollege(c)
            );
            if (misleadingGovernmentColleges.length > 0) {
              console.log('⚠️ Colleges with Government management_type but NOT actually government:', misleadingGovernmentColleges);
            }
          }
        }
      }
      
      // Apply search filter
    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(college => 
        college.name?.toLowerCase().includes(searchLower) ||
        college.location?.toLowerCase().includes(searchLower) ||
        college.state?.toLowerCase().includes(searchLower)
      );
      console.log('🔍 After search filter:', filtered.length, 'colleges');
    }
    
    // Apply stream filter (filter by college type that matches stream)
    if (filters.stream) {
      if (filters.stream === 'MEDICAL') {
        // Medical stream: Only show MEDICAL colleges
        filtered = filtered.filter(college => college.type === 'MEDICAL');
        console.log('🔍 After MEDICAL stream filter:', filtered.length, 'colleges');
      } else if (filters.stream === 'DENTAL') {
        // Dental stream: Only show DENTAL colleges
        filtered = filtered.filter(college => college.type === 'DENTAL');
        console.log('🔍 After DENTAL stream filter:', filtered.length, 'colleges');
      } else if (filters.stream === 'DNB') {
        // DNB stream: Only show DNB colleges
        filtered = filtered.filter(college => college.type === 'DNB');
        console.log('🔍 After DNB stream filter:', filtered.length, 'colleges');
      }
    }
    

    
    // Apply course filter (this will be refined when we have course data)
    if (filters.course) {
      // For now, we'll filter colleges that have courses matching the selected course
      // This will be enhanced when we have proper course data in the database
      if (filters.course === 'MBBS' || filters.course === 'BDS') {
        // Filter for undergraduate medical/dental colleges
        filtered = filtered.filter(college => 
          college.total_courses > 0 && 
          (filters.stream === 'MEDICAL' || filters.stream === 'DENTAL')
        );
      } else if (filters.course === 'MD' || filters.course === 'MS' || filters.course === 'DM' || filters.course === 'M.CH.') {
        // Filter for postgraduate medical colleges
        filtered = filtered.filter(college => 
          college.total_courses > 0 && 
          filters.stream === 'MEDICAL'
        );
      } else if (filters.course === 'MDS') {
        // Filter for postgraduate dental colleges
        filtered = filtered.filter(college => 
          college.total_courses > 0 && 
          filters.stream === 'DENTAL'
        );
      } else if (filters.course === 'DNB' || filters.course === 'DNB-DIPLOMA') {
        // Filter for DNB colleges - only show DNB colleges
        filtered = filtered.filter(college => 
          college.type === 'DNB' && college.total_courses > 0
        );
      }
      
      console.log('🔍 After course filter (', filters.course, '):', filtered.length, 'colleges');
    }
    
    // Apply branch filter (this will be refined when we have detailed course data)
    if (filters.branch && filters.course) {
      // For now, we'll keep colleges that have courses
      // This will be enhanced when we have proper course-branch mapping in the database
      filtered = filtered.filter(college => college.total_courses > 0);
    }
    
    // Apply state filter (handle separator differences)
    if (filters.state) {
      filtered = filtered.filter(college => {
        const collegeState = college.state || '';
        const filterState = filters.state;
        
        // Handle separator differences (AND vs &)
        if (filterState === 'JAMMU & KASHMIR' && collegeState === 'JAMMU AND KASHMIR') {
          return true;
        }
        if (filterState === 'JAMMU AND KASHMIR' && collegeState === 'JAMMU & KASHMIR') {
          return true;
        }
        
        // Exact match for other states
        return collegeState === filterState;
      });
    }
    
    // Apply college type filter (handle correct management types)
    if (filters.collegeType) {
      filtered = filtered.filter(college => {
        const collegeManagement = college.management_type || '';
        const filterManagement = filters.collegeType;
        
        // Handle government variations - use the helper function for accurate classification
        if (filterManagement === 'Government') {
          // Exclude DNB colleges
          if (college.type === 'DNB') return false;
          
          // Use the helper function to determine if it's actually government
          return isActuallyGovernmentCollege(college);
        }
        
        // Handle DNB colleges - show colleges with type = 'DNB'
        if (filterManagement === 'DNB') {
          return college.type === 'DNB';
        }
        
        // Handle other types exactly
        return collegeManagement === filterManagement;
      });
    }
    
      console.log('🔍 Final filtered colleges:', filtered.length);
      console.log('🔍 Sample filtered colleges:', filtered.slice(0, 3));
    
    setFilteredColleges(filtered);
    setIsFiltering(false);
    }, 100); // Small delay for better UX
    
    return () => clearTimeout(timeoutId);
  }, [colleges, searchTerm, filters]);

  // Update pagination when filtered colleges change
  useEffect(() => {
    const totalPages = Math.ceil(filteredColleges.length / pagination.itemsPerPage);
    setPagination(prev => {
      const newTotalPages = totalPages > 0 ? totalPages : 1;
      // Ensure current page doesn't exceed total pages
      const newCurrentPage = prev.currentPage > newTotalPages ? 1 : prev.currentPage;
      
      return { 
        ...prev, 
        totalPages: newTotalPages,
        currentPage: newCurrentPage
      };
    });
  }, [filteredColleges, pagination.itemsPerPage]);

  // Get paginated colleges
  const paginatedColleges = filteredColleges.slice(
    (pagination.currentPage - 1) * pagination.itemsPerPage,
    pagination.currentPage * pagination.itemsPerPage
  );

  // Debug: Log state values
  console.log('🔍 Current state:', {
    colleges: colleges.length,
    filteredColleges: filteredColleges.length,
    paginatedColleges: paginatedColleges.length,
    loading,
    error
  });

  // Helper function to determine if a college is actually government-run
  const isActuallyGovernmentCollege = (college) => {
          const collegeName = (college.name || '').toLowerCase();
    const managementType = (college.management_type || '').toLowerCase();
    
    // Clear indicators it's NOT government
    if (collegeName.includes('private') || 
        collegeName.includes('trust') || 
        collegeName.includes('society') || 
        collegeName.includes('deemed') ||
        collegeName.includes('charitable') ||
        collegeName.includes('mission') ||
        collegeName.includes('foundation') ||
        collegeName.includes('institute') ||
        collegeName.includes('academy')) {
      return false;
    }
    
    // Clear indicators it IS government
    if (collegeName.includes('government') || 
        collegeName.includes('govt') ||
        collegeName.includes('state') ||
        collegeName.includes('central') ||
        collegeName.includes('national') ||
        collegeName.includes('all india')) {
      return true;
    }
    
    // Check management type
    if (managementType === 'government' || 
        managementType === 'govt' || 
        managementType === 'govt.') {
      return true;
    }
    
    // If management type is private, trust, society, etc., it's not government
    if (managementType === 'private' || 
        managementType === 'trust' || 
        managementType === 'society' || 
        managementType === 'deemed') {
      return false;
    }
    
    // Default: trust the management_type if it says government
    return managementType === 'government' || managementType === 'govt' || managementType === 'govt.';
  };

  // Get available states (normalize separators)
  const availableStates = [...new Set(colleges.map(college => {
    const state = college.state;
    if (!state || !state.trim()) return null;
    
    // Normalize separator differences
    if (state === 'JAMMU AND KASHMIR') {
      return 'JAMMU & KASHMIR';
    }
    return state;
  }))].filter(state => state).sort();

  // Get available branches based on selected stream and course
  const getAvailableBranches = (stream, course) => {
    if (!stream || !course) return [];
    
    const branchMap = {
      'MEDICAL': {
        'MD': [
          'GENERAL MEDICINE', 'GENERAL SURGERY', 'ANAESTHESIOLOGY', 'DERMATOLOGY', 'PAEDIATRICS',
          'OBSTETRICS & GYNAECOLOGY', 'ORTHOPAEDICS', 'RADIOLOGY', 'PSYCHIATRY', 'OPHTHALMOLOGY',
          'ENT', 'PATHOLOGY', 'MICROBIOLOGY', 'BIOCHEMISTRY', 'PHYSIOLOGY', 'ANATOMY',
          'FORENSIC MEDICINE', 'COMMUNITY MEDICINE', 'EMERGENCY MEDICINE', 'FAMILY MEDICINE',
          'CARDIOLOGY', 'NEUROLOGY', 'UROLOGY', 'PLASTIC SURGERY', 'VASCULAR SURGERY',
          'THORACIC SURGERY', 'PEDIATRIC SURGERY', 'ONCOLOGY', 'RHEUMATOLOGY', 'ENDOCRINOLOGY',
          'GASTROENTEROLOGY', 'NEPHROLOGY', 'PULMONOLOGY', 'HEMATOLOGY', 'IMMUNOLOGY',
          'GENETICS', 'NUCLEAR MEDICINE', 'INTERVENTIONAL RADIOLOGY', 'CRITICAL CARE',
          'PALLIATIVE MEDICINE', 'SPORTS MEDICINE', 'OCCUPATIONAL HEALTH', 'AVIATION MEDICINE',
          'MARINE MEDICINE', 'TROPICAL MEDICINE', 'LEPROSY', 'TUBERCULOSIS & CHEST',
          'DERMATOLOGY, VENEREOLOGY & LEPROSY', 'CHILD & ADOLESCENT PSYCHIATRY',
          'FORENSIC PSYCHIATRY', 'ADDICTION PSYCHIATRY', 'GERIATRIC MEDICINE',
          'CONSULTATION LIAISON PSYCHIATRY', 'PHYSICAL MEDICINE & REHABILITATION',
          'RADIATION ONCOLOGY', 'RESPIRATORY MEDICINE', 'IMMUNO-HAEMATOLOGY & BLOOD TRANSFUSION',
          'HOSPITAL ADMINISTRATION', 'REPRODUCTIVE MEDICINE', 'CARDIAC ANAESTHESIA',
          'CLINICAL HAEMATOLOGY', 'CHILD HEALTH', 'MATERNITY & CHILD WELFARE',
          'NUTRITION', 'INDUSTRIAL HEALTH', 'PUBLIC HEALTH', 'RADIOLOGICAL PHYSICS',
          'MEDICAL VIROLOGY', 'NEURO-PATHOLOGY', 'ALLERGY & CLINICAL IMMUNOLOGY',
          'DIABETOLOGY', 'HEALTH EDUCATION', 'INDUSTRIAL HYGIENE', 'MEDICAL RADIO ELECTROLOGY'
        ],
        'MS': [
          'GENERAL SURGERY', 'ORTHOPAEDICS', 'NEUROSURGERY', 'UROLOGY', 'PLASTIC SURGERY',
          'VASCULAR SURGERY', 'THORACIC SURGERY', 'PEDIATRIC SURGERY', 'CARDIAC ANAESTHESIA',
          'ANAESTHESIOLOGY', 'EMERGENCY MEDICINE', 'CRITICAL CARE', 'TRAUMA SURGERY'
        ],
        'DM': [
          'CARDIOLOGY', 'NEUROLOGY', 'ENDOCRINOLOGY', 'GASTROENTEROLOGY', 'NEPHROLOGY',
          'PULMONOLOGY', 'HEMATOLOGY', 'IMMUNOLOGY', 'GENETICS', 'NUCLEAR MEDICINE',
          'INTERVENTIONAL RADIOLOGY', 'CLINICAL HAEMATOLOGY', 'REPRODUCTIVE MEDICINE',
          'CHILD & ADOLESCENT PSYCHIATRY', 'FORENSIC PSYCHIATRY', 'ADDICTION PSYCHIATRY',
          'GERIATRIC MEDICINE', 'CONSULTATION LIAISON PSYCHIATRY'
        ],
        'M.CH.': [
          'NEUROSURGERY', 'UROLOGY', 'PLASTIC SURGERY', 'VASCULAR SURGERY', 'THORACIC SURGERY',
          'PEDIATRIC SURGERY', 'CARDIOVASCULAR SURGERY', 'ONCOLOGY', 'ORTHOPAEDICS',
          'TRAUMA SURGERY', 'BURNS SURGERY', 'MINIMALLY INVASIVE SURGERY'
        ],

      },
      'DENTAL': {
        'MDS': [
          'CONSERVATIVE DENTISTRY & ENDODONTICS', 'ORAL MEDICINE & RADIOLOGY',
          'ORAL & MAXILLOFACIAL SURGERY', 'ORTHODONTICS & DENTOFACIAL ORTHOPAEDICS',
          'PEDODONTICS & PREVENTIVE DENTISTRY', 'PERIODONTOLOGY',
          'PROSTHODONTICS & CROWN & BRIDGE', 'PUBLIC HEALTH DENTISTRY',
          'ORAL PATHOLOGY & MICROBIOLOGY'
        ]
      },
      'DNB': {
        'DNB': [
          'GENERAL MEDICINE', 'GENERAL SURGERY', 'ANAESTHESIOLOGY', 'DERMATOLOGY', 'PAEDIATRICS',
          'OBSTETRICS & GYNAECOLOGY', 'ORTHOPAEDICS', 'RADIOLOGY', 'PSYCHIATRY', 'OPHTHALMOLOGY',
          'ENT', 'PATHOLOGY', 'MICROBIOLOGY', 'BIOCHEMISTRY', 'PHYSIOLOGY', 'ANATOMY',
          'FORENSIC MEDICINE', 'COMMUNITY MEDICINE', 'EMERGENCY MEDICINE', 'FAMILY MEDICINE',
          'NEUROSURGERY', 'UROLOGY', 'PLASTIC SURGERY', 'PEDIATRIC SURGERY', 'NUCLEAR MEDICINE',
          'RADIATION ONCOLOGY', 'RESPIRATORY MEDICINE', 'IMMUNO-HAEMATOLOGY & BLOOD TRANSFUSION',
          'HOSPITAL ADMINISTRATION', 'GERIATRIC MEDICINE', 'PALLIATIVE MEDICINE',
          'PHYSICAL MEDICINE & REHABILITATION', 'OCCUPATIONAL HEALTH', 'AVIATION MEDICINE',
          'MARINE MEDICINE', 'TROPICAL MEDICINE', 'LEPROSY', 'TUBERCULOSIS & CHEST',
          'DERMATOLOGY, VENEREOLOGY & LEPROSY', 'CHILD & ADOLESCENT PSYCHIATRY',
          'FORENSIC PSYCHIATRY', 'ADDICTION PSYCHIATRY', 'CONSULTATION LIAISON PSYCHIATRY',
          'CHILD HEALTH', 'MATERNITY & CHILD WELFARE', 'NUTRITION', 'INDUSTRIAL HEALTH',
          'PUBLIC HEALTH', 'RADIOLOGICAL PHYSICS', 'MEDICAL VIROLOGY', 'NEURO-PATHOLOGY',
          'ALLERGY & CLINICAL IMMUNOLOGY', 'DIABETOLOGY', 'HEALTH EDUCATION',
          'INDUSTRIAL HYGIENE', 'MEDICAL RADIO ELECTROLOGY'
        ],
        'DNB-DIPLOMA': [
          'ANAESTHESIOLOGY', 'FAMILY MEDICINE', 'OBSTETRICS & GYNAECOLOGY', 'OPHTHALMOLOGY',
          'OTORHINOLARYNGOLOGY (E.N.T.)', 'PAEDIATRICS', 'RADIO-DIAGNOSIS',
          'TUBERCULOSIS & CHEST DISEASES'
        ]
      }
    };
    
    return branchMap[stream]?.[course] || [];
  };

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
      const credentials = btoa('Lone_wolf#12:Apx_gp_delta');
      const response = await fetch(`/api/sector_xp_12/colleges/${collegeId}/courses`, {
        headers: {
          'Authorization': `Basic ${credentials}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('🔍 API Response for college', collegeId, ':', data);
        // The API returns data.data as an array of courses
        const courses = data.data || [];
        console.log('🔍 Extracted courses:', courses);
        
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
      <section className="relative z-50 pb-8 px-6">
        <div className="max-w-6xl mx-auto">
          {/* Advanced Search Bar */}
          <div className="group relative mb-6 z-50">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl blur-lg opacity-20 group-hover:opacity-30 transition-opacity duration-500"></div>
            <div className="relative bg-white/90 backdrop-blur-xl border border-white/30 rounded-xl shadow-xl p-4">
              <AdvancedSearch
                onSearch={async (query, filters) => {
                  try {
                    // Use the new advanced search API
                    const searchParams = new URLSearchParams();
                    if (query) searchParams.append('q', query);
                    if (filters.state) searchParams.append('state', filters.state);
                    if (filters.city) searchParams.append('city', filters.city);
                    if (filters.college_type) searchParams.append('college_type', filters.college_type);
                    if (filters.management_type) searchParams.append('management_type', filters.management_type);
                    if (filters.max_fees) searchParams.append('max_fees', filters.max_fees);
                    if (filters.min_seats) searchParams.append('min_seats', filters.min_seats);
                    if (filters.program) searchParams.append('program', filters.program);
                    
                    const response = await fetch(`/api/sector_xp_12/admin/search/advanced?${searchParams.toString()}`);
                    if (response.ok) {
                      const data = await response.json();
                      if (data.success && data.data) {
                        setFilteredColleges(data.data.hits || []);
                        setSearchTerm(query);
                        console.log('🔍 Advanced search results:', {
                          query,
                          filters,
                          totalResults: data.data.total,
                          results: data.data.hits?.slice(0, 5)
                        });
                      }
                    }
                  } catch (error) {
                    console.error('Advanced search error:', error);
                    // Fallback to local search
                    const localResults = colleges.filter(college => {
                      if (query) {
                        const searchLower = query.toLowerCase();
                        return (
                          college.name?.toLowerCase().includes(searchLower) ||
                          college.city?.toLowerCase().includes(searchLower) ||
                          college.state?.toLowerCase().includes(searchLower) ||
                          college.college_type?.toLowerCase().includes(searchLower)
                        );
                      }
                      return true;
                    });
                    setFilteredColleges(localResults);
                  }
                }}
                onFiltersChange={(newFilters) => {
                  console.log('🔍 Filters changed:', newFilters);
                }}
                initialFilters={{}}
              />
                  </div>
            
            {/* Search Results Info */}
            {searchTerm && filteredColleges.length > 0 && (
              <div className="mt-4 p-3 bg-green-50/50 border border-green-200/50 rounded-lg">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center space-x-2 text-green-700">
                    <Search className="w-4 h-4" />
                    <span>Found {filteredColleges.length} colleges matching "{searchTerm}"</span>
                      </div>
                  <div className="text-xs text-green-600">
                    Using advanced search algorithms
                      </div>
                  </div>
                </div>
              )}
          </div>

          {/* Search Tips */}
          <div className="mb-6">
            <div className="bg-gradient-to-r from-blue-50/50 to-purple-50/50 border border-blue-100/50 rounded-lg p-4">
              <div className="flex items-start">
                <div className="w-6 h-6 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center mr-3 mt-0.5">
                  <Lightbulb className="w-3 h-3 text-white" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-gray-900 mb-2">💡 Smart Search Tips</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs text-gray-700">
                    <div>
                      <strong>Exact Matches:</strong> Type full names like "AIIMS Delhi" or "JIPMER"
                    </div>
                    <div>
                      <strong>Partial Matches:</strong> Type "med" to find "Medical" colleges
                    </div>
                    <div>
                      <strong>Location Search:</strong> Type "Karnataka" or "Mumbai" for location-based results
                    </div>
                    <div>
                      <strong>Fuzzy Search:</strong> Even with typos like "AIMS" will find "AIIMS"
                    </div>
                    <div>
                      <strong>Acronym Support:</strong> "AIIMS" finds "All India Institute of Medical Sciences"
                    </div>
                    <div>
                      <strong>Smart Suggestions:</strong> Get real-time suggestions as you type
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>



          {/* Filters */}
          <div className="group relative z-0">
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
                      <option value="DNB">DNB</option>
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
                          <option value="MBBS">MBBS (Undergraduate)</option>
                          <option value="MD">MD (Postgraduate)</option>
                          <option value="MS">MS (Postgraduate)</option>
                          <option value="DM">DM (Super Specialty)</option>
                          <option value="M.CH.">M.CH. (Super Specialty)</option>
                          <option value="DIPLOMA">Diploma</option>
                          <option value="M.SC">M.Sc</option>
                          <option value="PH.D">Ph.D</option>
                        </>
                      )}
                      {filters.stream === 'DENTAL' && (
                        <>
                          <option value="BDS">BDS (Undergraduate)</option>
                          <option value="MDS">MDS (Postgraduate)</option>
                          <option value="DIPLOMA">Diploma</option>
                        </>
                      )}
                      {filters.stream === 'DNB' && (
                        <>
                          <option value="DNB">DNB</option>
                          <option value="DNB-DIPLOMA">DNB-Diploma</option>
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
                      disabled={!filters.course || filters.course === 'MBBS' || filters.course === 'BDS' || filters.course === 'DIPLOMA' || filters.course === 'M.SC' || filters.course === 'PH.D'}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white/80 backdrop-blur-sm transition-all duration-300 hover:shadow-md disabled:bg-gray-100/80 disabled:cursor-not-allowed"
                    >
                      <option value="">{!filters.course ? 'Select Course First' : (filters.course === 'MBBS' || filters.course === 'BDS' || filters.course === 'DIPLOMA' || filters.course === 'M.SC' || filters.course === 'PH.D') ? 'No Branch for Undergraduate/Diploma/M.Sc/Ph.D Course' : 'Select Branch'}</option>
                      {filters.course && filters.course !== 'MBBS' && filters.course !== 'BDS' && filters.course !== 'DIPLOMA' && filters.course !== 'M.SC' && filters.course !== 'PH.D' && (
                        <>
                          {/* Dynamic Branch Options based on Stream and Course */}
                          {getAvailableBranches(filters.stream, filters.course).map((branch, index) => (
                            <option key={index} value={branch}>{branch}</option>
                          ))}
                        </>
                      )}
                    </select>
                    
                    {/* Branch Count Indicator */}
                    {filters.course && filters.course !== 'MBBS' && filters.course !== 'BDS' && filters.course !== 'DIPLOMA' && filters.course !== 'M.SC' && filters.course !== 'PH.D' && (
                      <p className="text-xs text-gray-500 mt-1 flex items-center">
                        <span className="mr-1">📋</span>
                        {getAvailableBranches(filters.stream, filters.course).length} branches available for {filters.course}
                      </p>
                    )}
                    
                  </div>
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
                      <option value="Government">Government (Govt.)</option>
                      <option value="PRIVATE">PRIVATE</option>
                      <option value="Trust">Trust</option>
                      <option value="Society">Society</option>
                      <option value="DEEMED">DEEMED</option>
                      <option value="DNB">DNB</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Results Counter */}
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-4 border border-green-100 mb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center mr-3">
                      <span className="text-white text-sm font-bold">📊</span>
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-green-900">
                        Filter Results
                      </h4>
                      <p className="text-xs text-green-700">
                        {isFiltering ? (
                          <span className="flex items-center">
                            <span className="animate-spin mr-1">⏳</span>
                            Applying filters...
                          </span>
                        ) : (
                          `${filteredColleges.length} of ${colleges.length} colleges match your filters`
                        )}
                      </p>
                    </div>
                  </div>
                  {Object.values(filters).some(filter => filter !== '') && (
                    <button
                      onClick={() => setFilters({ stream: '', course: '', branch: '', state: '', collegeType: '' })}
                      className="px-3 py-1 text-xs bg-green-100 text-green-700 rounded-md hover:bg-green-200 transition-colors"
                    >
                      Clear All Filters
                    </button>
                  )}
                </div>
                
                {/* Active Filters Display */}
                {Object.values(filters).some(filter => filter !== '') && (
                  <div className="mt-3 pt-3 border-t border-green-200">
                    <div className="flex flex-wrap gap-2">
                      {filters.stream && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          Stream: {filters.stream}
                          <button
                            onClick={() => handleFilterChange('stream', '')}
                            className="ml-1 w-4 h-4 rounded-full bg-blue-200 hover:bg-blue-300 flex items-center justify-center"
                          >
                            ×
                          </button>
                        </span>
                      )}
                      {filters.course && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                          Course: {filters.course}
                          <button
                            onClick={() => handleFilterChange('course', '')}
                            className="ml-1 w-4 h-4 rounded-full bg-purple-200 hover:bg-purple-300 flex items-center justify-center"
                          >
                            ×
                          </button>
                        </span>
                      )}
                      {filters.branch && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                          Branch: {filters.branch}
                          <button
                            onClick={() => handleFilterChange('branch', '')}
                            className="ml-1 w-4 h-4 rounded-full bg-indigo-200 hover:bg-indigo-300 flex items-center justify-center"
                          >
                            ×
                          </button>
                        </span>
                      )}
                      {filters.state && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          State: {filters.state}
                          <button
                            onClick={() => handleFilterChange('state', '')}
                            className="ml-1 w-4 h-4 rounded-full bg-green-200 hover:bg-green-300 transition-colors"
                          >
                            ×
                          </button>
                        </span>
                      )}
                      {filters.collegeType && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                          Type: {filters.collegeType}
                          <button
                            onClick={() => handleFilterChange('collegeType', '')}
                            className="ml-1 w-4 h-4 rounded-full bg-orange-200 hover:bg-orange-300 transition-colors"
                          >
                            ×
                          </button>
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>

                      {/* DNB Information */}
        {filters.stream === 'DNB' && (
          <div className="bg-gradient-to-r from-amber-50 to-yellow-50 rounded-lg p-4 border border-amber-100 mb-4">
            <h4 className="text-sm font-semibold text-amber-900 mb-2 flex items-center">
              <div className="w-4 h-4 bg-amber-500 rounded-full flex items-center justify-center mr-2">
                <span className="text-white text-xs">ℹ</span>
              </div>
              DNB Stream Information
            </h4>
            <p className="text-xs text-amber-800">
              DNB (Diplomate of National Board) is a <strong>separate stream</strong> that focuses on DNB-specific courses. 
              DNB colleges are dedicated institutions that offer NBEMS programs. This stream shows all 1,223 DNB colleges 
              that are classified under <strong>college_type = 'DNB'</strong>.
            </p>
          </div>
        )}
        
        {/* DNB College Type Information */}
        {filters.collegeType === 'DNB' && (
          <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-lg p-4 border border-purple-100 mb-4">
            <h4 className="text-sm font-semibold text-purple-900 mb-2 flex items-center">
              <div className="w-4 h-4 bg-purple-500 rounded-full flex items-center justify-center mr-2">
                <span className="text-white text-xs">ℹ</span>
              </div>
              DNB College Type Filter
            </h4>
            <p className="text-xs text-purple-800">
              <strong>DNB College Type</strong> shows only DNB colleges (college_type = 'DNB'). This filter is completely 
              separate from Government colleges and will show 1,223 dedicated DNB institutions.
            </p>
          </div>
        )}
        
        {/* Government College Type Information */}
        {filters.collegeType === 'Government' && (
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-4 border border-green-100 mb-4">
            <h4 className="text-sm font-semibold text-green-900 mb-2 flex items-center">
              <div className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center mr-2">
                <span className="text-white text-xs">ℹ</span>
              </div>
              Government College Type Filter
            </h4>
            <p className="text-xs text-green-800">
              <strong>Government College Type</strong> shows only Government colleges (management_type = Government/Govt./GOVERNMENT) 
              and <strong>excludes all DNB colleges</strong> to prevent mixing.
            </p>
          </div>
        )}

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
                    <span><strong>MBBS/BDS/Diploma/M.Sc/Ph.D</strong>: Undergraduate/Diploma/M.Sc/Ph.D courses have no branches</span>
                  </li>
                  <li className="flex items-start">
                    <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full mt-1.5 mr-2 flex-shrink-0"></span>
                    <span><strong>State + College Type</strong>: Independent filters</span>
                  </li>
                  <li className="flex items-start">
                    <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full mt-1.5 mr-2 flex-shrink-0"></span>
                    <span><strong>Management Types</strong>: Government (Govt.), PRIVATE, Trust, Society, DEEMED, DNB</span>
                  </li>
                  <li className="flex items-start">
                    <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full mt-1.5 mr-2 flex-shrink-0"></span>
                    <span><strong>DNB</strong>: Separate stream for DNB colleges (college_type = 'DNB', 1,223 colleges)</span>
                  </li>
                  <li className="flex items-start">
                    <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full mt-1.5 mr-2 flex-shrink-0"></span>
                    <span><strong>MD/MS</strong>: Postgraduate courses with branches (e.g., General Medicine, Surgery, Anaesthesiology)</span>
                  </li>
                  <li className="flex items-start">
                    <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full mt-1.5 mr-2 flex-shrink-0"></span>
                    <span><strong>DM/M.CH.</strong>: Super specialty courses with specific branches</span>
                  </li>
                  <li className="flex items-start">
                    <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full mt-1.5 mr-2 flex-shrink-0"></span>
                    <span><strong>MDS</strong>: Dental postgraduate courses with specialized branches</span>
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
          {/* Enhanced Results Summary */}
          <div className="flex justify-between items-center mb-6">
            <div className="bg-white/80 backdrop-blur-xl border border-white/30 rounded-lg px-4 py-3 shadow-lg">
              <div className="flex items-center space-x-4">
                <div>
                  <p className="text-gray-700 font-medium text-sm">
                    Showing <span className="text-blue-600 font-semibold">{paginatedColleges.length}</span> of <span className="text-purple-600 font-semibold">{filteredColleges.length}</span> colleges
                  </p>
                  {searchTerm && (
                    <p className="text-xs text-gray-500 mt-1">
                      Search: <span className="font-medium">"{searchTerm}"</span>
                      {isSearching && <span className="ml-2 text-blue-500">Searching...</span>}
                    </p>
                  )}
                </div>
                {searchTerm && (
                  <button
                    onClick={clearSearch}
                    className="px-3 py-1.5 text-xs bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors flex items-center"
                  >
                    <X className="w-3 h-3 mr-1" />
                    Clear
                  </button>
                )}
              </div>
            </div>
            <div className="bg-white/80 backdrop-blur-xl border border-white/30 rounded-lg px-4 py-3 shadow-lg">
              <p className="text-gray-700 font-medium text-sm">
                Page <span className="text-indigo-600 font-semibold">{pagination.currentPage}</span> of <span className="text-purple-600 font-semibold">{pagination.totalPages}</span>
              </p>
            </div>
          </div>

          {/* No Results Message */}
          {filteredColleges.length === 0 && Object.values(filters).some(filter => filter !== '') && (
            <div className="text-center py-12 bg-gradient-to-r from-gray-50 to-slate-50 rounded-xl border border-gray-200 mb-6">
              <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🔍</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Colleges Found</h3>
              <p className="text-gray-600 mb-4">
                No colleges match your current filter criteria. Try adjusting your filters or search terms.
              </p>
              <button
                onClick={() => setFilters({ stream: '', course: '', branch: '', state: '', collegeType: '' })}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
              >
                Clear All Filters
              </button>
            </div>
          )}

          {/* Debug Info */}
          <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <h3 className="text-lg font-semibold text-yellow-800 mb-2">🔍 Debug Information</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <strong>Colleges:</strong> {colleges.length}
              </div>
              <div>
                <strong>Filtered:</strong> {filteredColleges.length}
              </div>
              <div>
                <strong>Paginated:</strong> {paginatedColleges.length}
              </div>
              <div>
                <strong>Loading:</strong> {loading ? 'Yes' : 'No'}
              </div>
            </div>
            {error && (
              <div className="mt-2 p-2 bg-red-100 border border-red-200 rounded text-red-800">
                <strong>Error:</strong> {error}
              </div>
            )}
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
                            college.type === 'MEDICAL' ? 'bg-blue-100 text-blue-800 border border-blue-200' :
                            college.type === 'DENTAL' ? 'bg-green-100 text-green-800 border border-green-200' :
                            college.type === 'DNB' ? 'bg-purple-100 text-purple-800 border border-purple-200' :
                            'bg-gray-100 text-gray-800 border border-gray-200'
                          }`}>
                            {college.type}
                          </span>
                          <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                            // Use the same logic as our filtering for consistency
                            (college.type === 'DNB') ? 'bg-purple-100 text-purple-800 border border-purple-200' :
                            isActuallyGovernmentCollege(college) ? 'bg-green-100 text-green-800 border border-green-200' :
                            (college.management_type === 'PRIVATE' || college.management_type === 'Private') ? 'bg-red-100 text-red-800 border border-red-200' :
                            (college.management_type === 'Trust') ? 'bg-yellow-100 text-yellow-800 border border-yellow-200' :
                            (college.management_type === 'Society') ? 'bg-blue-100 text-blue-800 border border-blue-200' :
                            (college.management_type === 'Govt-Society') ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' :
                            'bg-gray-100 text-gray-800 border border-gray-200'
                          }`}>
                            {college.type === 'DNB' ? 'DNB' : 
                             isActuallyGovernmentCollege(college) ? 'Government' : 
                             college.management_type}
                          </span>
                        </div>
                      </div>
                      
                      <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2 leading-tight">
                        {college.name}
                      </h3>
                      
                      <div className="flex items-center justify-between text-sm text-gray-600">
                        <span className="flex items-center font-medium">
                          <span className="mr-2">{collegeCourses[college.id] ? `${collegeCourses[college.id].length} Available Courses` : 'Click to load courses'}</span>
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
                        <span>Available Courses {collegeCourses[college.id] ? `(${collegeCourses[college.id].length})` : '(click to load)'}</span>
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
                          ) : (() => {
                            console.log('🔍 College courses state for', college.id, ':', collegeCourses[college.id]);
                            return collegeCourses[college.id] && collegeCourses[college.id].length > 0;
                          })() ? (
                            <div className="max-h-48 overflow-y-auto custom-scrollbar space-y-2">
                              {collegeCourses[college.id].map((course, index) => (
                                <div key={index} className="p-3 bg-gradient-to-r from-blue-50/50 to-purple-50/50 rounded-lg border border-blue-100/50 hover:border-blue-200/50 transition-colors">
                                  <div className="flex justify-between items-start">
                                    <div className="flex-1">
                                      <h5 className="font-semibold text-gray-900 text-sm mb-1">{course.name}</h5>
                                      {course.specialization && (
                                        <p className="text-xs text-gray-600 mb-1">{course.specialization}</p>
                                      )}
                                    </div>
                                    {course.seats && (
                                      <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full font-medium border border-blue-200">
                                        {course.seats} seats
                                      </span>
                                    )}
                                  </div>

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
        className="fixed bottom-6 right-6 w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full shadow-xl hover:shadow-blue-500/25 transition-all duration-300 flex items-center justify-center group hover:scale-105 z-50"
        title="Scroll to top"
      >
        <ArrowUp className="w-6 h-6 group-hover:-translate-y-0.5 transition-transform duration-300" />
      </button>
    </div>
  );
};

export default Colleges;
