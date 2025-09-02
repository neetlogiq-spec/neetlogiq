// Search Configuration for NeetLogIQ Platform
export const SEARCH_CONFIG = {
  // Global search settings
  global: {
    debounceMs: 300,
    minQueryLength: 2,
    maxSuggestions: 5,
    maxResults: 50,
    fuzzyThreshold: 0.3,
    minScore: 0.5
  },

  // Page-specific search configurations
  pages: {
    colleges: {
      placeholder: "Search medical colleges with AI-powered algorithms...",
      searchFields: ['name', 'state', 'city', 'college_type_category', 'university'],
      suggestions: [
        'MBBS', 'BDS', 'MD', 'MS', 'DNB',
        'Government', 'Private', 'Deemed',
        'Delhi', 'Mumbai', 'Bangalore', 'Chennai',
        'Medical', 'Dental', 'Postgraduate'
      ],
      synonyms: {
        'medical': ['medicine', 'clinical', 'healthcare'],
        'college': ['university', 'institute', 'academy'],
        'government': ['public', 'state', 'central'],
        'private': ['independent', 'autonomous', 'trust']
      }
    },

    courses: {
      placeholder: "Search medical courses with AI-powered algorithms...",
      searchFields: ['course_name', 'specialization', 'course_type', 'level', 'duration'],
      suggestions: [
        'MBBS', 'BDS', 'MD', 'MS', 'DNB',
        'Cardiology', 'Neurology', 'Orthopedics',
        'Undergraduate', 'Postgraduate', 'Diploma',
        'Medical', 'Dental', 'Surgery'
      ],
      synonyms: {
        'mbbs': ['bachelor of medicine', 'medical degree', 'doctor'],
        'bds': ['bachelor of dental surgery', 'dental degree'],
        'md': ['doctor of medicine', 'postgraduate medicine'],
        'ms': ['master of surgery', 'surgical degree'],
        'dnb': ['diplomate of national board', 'postgraduate']
      }
    },

    cutoffs: {
      placeholder: "Search cutoffs with AI-powered algorithms...",
      searchFields: ['college', 'course', 'category', 'description', 'year'],
      suggestions: [
        'MBBS', 'BDS', 'MD', 'MS',
        'General', 'OBC', 'SC', 'ST', 'EWS',
        '2024', '2023', '2022', '2021',
        'AIIMS', 'JIPMER', 'State Medical'
      ],
      synonyms: {
        'general': ['open', 'unreserved', 'ur'],
        'obc': ['other backward class', 'backward class'],
        'sc': ['scheduled caste'],
        'st': ['scheduled tribe'],
        'ews': ['economically weaker section']
      }
    }
  },

  // Algorithm weights and configurations
  algorithms: {
    exact: {
      weight: 1.0,
      color: 'text-green-400',
      bg: 'bg-green-400/20',
      icon: 'Zap'
    },
    fuzzy: {
      weight: 0.8,
      color: 'text-blue-400',
      bg: 'bg-blue-400/20',
      icon: 'Sparkles'
    },
    phonetic: {
      weight: 0.7,
      color: 'text-yellow-400',
      bg: 'bg-yellow-400/20',
      icon: 'Lightbulb'
    },
    semantic: {
      weight: 0.6,
      color: 'text-purple-400',
      bg: 'bg-purple-400/20',
      icon: 'Sparkles'
    },
    regex: {
      weight: 0.5,
      color: 'text-orange-400',
      bg: 'bg-orange-400/20',
      icon: 'Zap'
    },
    location: {
      weight: 0.9,
      color: 'text-red-400',
      bg: 'bg-red-400/20',
      icon: 'MapPin'
    }
  },

  // Location-aware search settings
  location: {
    defaultRadius: 100, // km
    supportedStates: [
      'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
      'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand',
      'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur',
      'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab',
      'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura',
      'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
      'Delhi', 'Jammu and Kashmir', 'Ladakh', 'Chandigarh',
      'Dadra and Nagar Haveli', 'Daman and Diu', 'Lakshadweep',
      'Puducherry', 'Andaman and Nicobar Islands'
    ]
  },

  // Search history and suggestions
  suggestions: {
    maxHistory: 10,
    commonTerms: [
      'MBBS', 'BDS', 'MD', 'MS', 'DNB',
      'Medical', 'Dental', 'Government', 'Private',
      'Delhi', 'Mumbai', 'Bangalore', 'Chennai',
      'Cardiology', 'Neurology', 'Orthopedics'
    ]
  },

  // Performance settings
  performance: {
    maxConcurrentSearches: 3,
    searchTimeout: 5000, // ms
    cacheExpiry: 300000, // 5 minutes
    enableCaching: true
  }
};

// Helper function to get page-specific config
export const getPageConfig = (pageName) => {
  return SEARCH_CONFIG.pages[pageName] || SEARCH_CONFIG.pages.colleges;
};

// Helper function to get algorithm config
export const getAlgorithmConfig = (algorithmName) => {
  return SEARCH_CONFIG.algorithms[algorithmName] || SEARCH_CONFIG.algorithms.exact;
};

// Helper function to get global config
export const getGlobalConfig = () => {
  return SEARCH_CONFIG.global;
};
