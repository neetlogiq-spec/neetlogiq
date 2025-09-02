// Advanced Search Utilities

// Fuzzy search utility functions
export const calculateLevenshteinDistance = (str1, str2) => {
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

export const fuzzySearch = (query, text, threshold = 3) => {
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

// Phonetic Search (Soundex and Metaphone)
export const soundex = (str) => {
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

export const metaphone = (str) => {
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
    [/wh/, 'w']
  ];
  
  let result = str;
  rules.forEach(([pattern, replacement]) => {
    result = result.replace(pattern, replacement);
  });
  
  return result.slice(0, 6);
};

// Wildcard Search
export const wildcardSearch = (pattern, text) => {
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

// Regex Pattern Search
export const regexSearch = (pattern, text) => {
  try {
    const regex = new RegExp(pattern, 'i');
    return regex.test(text);
  } catch (error) {
    console.warn('Invalid regex pattern:', pattern);
    return false;
  }
};

// Synonym and Alias Search
export const synonyms = {
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

export const expandSynonyms = (query) => {
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

// Location-Aware Search
export const locationVariations = {
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

export const expandLocationSearch = (location) => {
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

// Vector/Semantic Search using word embeddings
export const calculateSemanticSimilarity = (query, text) => {
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

// Advanced Search Engine
export const advancedSearch = (query, data, searchFields, searchOptions = {}) => {
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
  
  if (!query || !data) return [];
  
  const results = [];
  const queryLower = query.toLowerCase();
  
  data.forEach(item => {
    let bestScore = 0;
    let bestMatchType = 'none';
    
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
        item,
        score: bestScore,
        matchType: bestMatchType
      });
    }
  });
  
  // Sort by score (highest first)
  return results.sort((a, b) => b.score - a.score);
};

// Generate search suggestions
export const generateSearchSuggestions = (data, searchTerm, searchFields, maxSuggestions = 8) => {
  if (!searchTerm || searchTerm.length < 2) return [];
  
  const suggestions = [];
  const searchTermLower = searchTerm.toLowerCase();
  
  // Search across multiple fields with different weights
  data.forEach(item => {
    searchFields.forEach(field => {
      if (field.text) {
        const match = fuzzySearch(searchTermLower, field.text);
        if (match) {
          suggestions.push({
            text: field.text,
            type: field.type,
            item: item,
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
