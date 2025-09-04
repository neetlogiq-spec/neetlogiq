import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Zap, Sparkles, Lightbulb, MapPin, Clock, Info } from 'lucide-react';

const SearchDemo = () => {
  const [selectedAlgorithm, setSelectedAlgorithm] = useState('all');

  const algorithms = [
    {
      key: 'exact',
      name: 'Exact Match Search',
      icon: Zap,
      color: 'text-green-400',
      bg: 'bg-green-400/20',
      description: 'Finds exact text matches in college names, cities, or states',
      examples: [
        'Search: "Delhi" → Finds colleges in Delhi',
        'Search: "Medical" → Finds colleges with "Medical" in name',
        'Search: "Government" → Finds government colleges'
      ]
    },
    {
      key: 'fuzzy',
      name: 'Fuzzy Search',
      icon: Sparkles,
      color: 'text-blue-400',
      bg: 'bg-blue-400/20',
      description: 'Uses Levenshtein distance to find similar spellings and typos',
      examples: [
        'Search: "ramaih" → Finds "Ramaiah" colleges',
        'Search: "manipal" → Finds "Manipal" colleges',
        'Search: "aiims" → Finds "AIIMS" colleges'
      ]
    },
    {
      key: 'phonetic',
      name: 'Phonetic Search',
      icon: Lightbulb,
      color: 'text-yellow-400',
      bg: 'bg-yellow-400/20',
      description: 'Finds words that sound similar using phonetic algorithms',
      examples: [
        'Search: "aiims" → Finds "AIIMS" (sounds similar)',
        'Search: "jipmer" → Finds "JIPMER" (phonetic match)',
        'Search: "cmc" → Finds "CMC Vellore" (abbreviation)'
      ]
    },
    {
      key: 'semantic',
      name: 'Semantic Search',
      icon: Sparkles,
      color: 'text-purple-400',
      bg: 'bg-purple-400/20',
      description: 'Understands meaning and synonyms for better results',
      examples: [
        'Search: "heart" → Finds cardiology departments',
        'Search: "brain" → Finds neurology departments',
        'Search: "bone" → Finds orthopedics departments'
      ]
    },
    {
      key: 'regex',
      name: 'Regex Pattern Search',
      icon: Zap,
      color: 'text-orange-400',
      bg: 'bg-orange-400/20',
      description: 'Advanced pattern matching using regular expressions',
      examples: [
        'Search: "^A.*" → Finds colleges starting with A',
        'Search: ".*Medical.*" → Finds colleges with "Medical" anywhere',
        'Search: "[A-Z]{4,}" → Finds colleges with 4+ capital letters'
      ]
    },
    {
      key: 'vector',
      name: 'Vector Search',
      icon: Sparkles,
      color: 'text-indigo-400',
      bg: 'bg-indigo-400/20',
      description: 'TF-IDF based search for relevance scoring',
      examples: [
        'Search: "medical college" → Ranks by term importance',
        'Search: "cardiology surgery" → Finds most relevant matches',
        'Search: "government medical" → Prioritizes exact phrase matches'
      ]
    },
    {
      key: 'wildcard',
      name: 'Wildcard Search',
      icon: Zap,
      color: 'text-pink-400',
      bg: 'bg-pink-400/20',
      description: 'Simple pattern matching with * and ? characters',
      examples: [
        'Search: "A*" → Finds colleges starting with A',
        'Search: "*Medical*" → Finds colleges with "Medical" anywhere',
        'Search: "M?nipal" → Finds "Manipal" (single character wildcard)'
      ]
    },
    {
      key: 'location',
      name: 'Location-Aware Search',
      icon: MapPin,
      color: 'text-red-400',
      bg: 'bg-red-400/20',
      description: 'Prioritizes results based on geographic proximity',
      examples: [
        'Search: "Delhi" → Shows Delhi colleges first',
        'Search: "Karnataka" → Prioritizes Karnataka colleges',
        'Search: "Mumbai" → Ranks Mumbai colleges higher'
      ]
    }
  ];

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-white mb-4">Advanced Search Algorithms</h2>
        <p className="text-gray-300 text-lg">
          Discover the power of AI-powered search with multiple algorithms working together
        </p>
      </div>

      {/* Algorithm Selector */}
      <div className="flex flex-wrap justify-center gap-2 mb-8">
        <button
          onClick={() => setSelectedAlgorithm('all')}
          className={`px-4 py-2 rounded-lg transition-colors ${
            selectedAlgorithm === 'all'
              ? 'bg-primary-600 text-white'
              : 'bg-gray-600/20 text-gray-300 hover:bg-gray-600/30'
          }`}
        >
          All Algorithms
        </button>
        {algorithms.map((algo) => (
          <button
            key={algo.key}
            onClick={() => setSelectedAlgorithm(algo.key)}
            className={`px-4 py-2 rounded-lg transition-colors ${
              selectedAlgorithm === algo.key
                ? `${algo.bg} ${algo.color}`
                : 'bg-gray-600/20 text-gray-300 hover:bg-gray-600/30'
            }`}
          >
            {algo.name}
          </button>
        ))}
      </div>

      {/* Algorithm Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {algorithms
          .filter((algo) => selectedAlgorithm === 'all' || selectedAlgorithm === algo.key)
          .map((algo) => (
            <motion.div
              key={algo.key}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className={`${algo.bg} border border-gray-600 rounded-lg p-6 hover:scale-105 transition-transform`}
            >
              <div className="flex items-center gap-3 mb-4">
                <algo.icon className={`w-6 h-6 ${algo.color}`} />
                <h3 className={`text-lg font-semibold ${algo.color}`}>{algo.name}</h3>
              </div>
              
              <p className="text-gray-300 mb-4 text-sm">{algo.description}</p>
              
              <div className="space-y-2">
                <h4 className="text-white font-medium text-sm">Examples:</h4>
                {algo.examples.map((example, index) => (
                  <div key={index} className="text-gray-400 text-xs bg-gray-800/50 p-2 rounded">
                    {example}
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
      </div>

      {/* Usage Tips */}
      <div className="mt-12 bg-gray-800/50 border border-gray-600 rounded-lg p-6">
        <div className="flex items-center gap-3 mb-4">
          <Info className="w-6 h-6 text-blue-400" />
          <h3 className="text-xl font-semibold text-white">Search Tips</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="text-white font-medium mb-3">For Best Results:</h4>
            <ul className="text-gray-300 text-sm space-y-2">
              <li>• Use specific terms like "Ramaiah" instead of "rama"</li>
              <li>• Try different spellings if exact search fails</li>
              <li>• Use wildcards (*) for partial matches</li>
              <li>• Combine location + college type for targeted results</li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-white font-medium mb-3">Advanced Features:</h4>
            <ul className="text-gray-300 text-sm space-y-2">
              <li>• Regex patterns for complex searches</li>
              <li>• Vector search for relevance ranking</li>
              <li>• Phonetic matching for pronunciation</li>
              <li>• Semantic understanding of medical terms</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchDemo;
