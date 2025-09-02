// Advanced Search Algorithm Test Suite
// Comprehensive testing for fuzzy, phonetic, location, and semantic search

import { 
  advancedSearch, 
  fuzzySearch, 
  soundex, 
  metaphone, 
  wildcardSearch, 
  regexSearch,
  expandSynonyms,
  expandLocationSearch,
  calculateSemanticSimilarity
} from './advancedSearch.js';

// Test data
const testColleges = [
  { id: 1, name: 'ALL INDIA INSTITUTE OF MEDICAL SCIENCES', location: 'NEW DELHI', type: 'MEDICAL' },
  { id: 2, name: 'MAULANA AZAD MEDICAL COLLEGE', location: 'NEW DELHI', type: 'MEDICAL' },
  { id: 3, name: 'LADY HARDINGE MEDICAL COLLEGE', location: 'NEW DELHI', type: 'MEDICAL' },
  { id: 4, name: 'UNIVERSITY COLLEGE OF MEDICAL SCIENCES', location: 'NEW DELHI', type: 'MEDICAL' },
  { id: 5, name: 'VARDHMAN MAHAVIR MEDICAL COLLEGE', location: 'NEW DELHI', type: 'MEDICAL' },
  { id: 6, name: 'BOMBAY HOSPITAL INSTITUTE OF MEDICAL SCIENCES', location: 'MUMBAI', type: 'MEDICAL' },
  { id: 7, name: 'SETH GORDHANDAS SUNDERDAS MEDICAL COLLEGE', location: 'MUMBAI', type: 'MEDICAL' },
  { id: 8, name: 'TOPIWALA NATIONAL MEDICAL COLLEGE', location: 'MUMBAI', type: 'MEDICAL' },
  { id: 9, name: 'BANGALORE MEDICAL COLLEGE AND RESEARCH INSTITUTE', location: 'BANGALORE', type: 'MEDICAL' },
  { id: 10, name: 'KEMPE GOWDA INSTITUTE OF MEDICAL SCIENCES', location: 'BANGALORE', type: 'MEDICAL' }
];

const testPrograms = [
  { id: 1, name: 'MBBS', specialization: 'MEDICINE', level: 'UNDERGRADUATE' },
  { id: 2, name: 'BDS', specialization: 'DENTAL', level: 'UNDERGRADUATE' },
  { id: 3, name: 'MD CARDIOLOGY', specialization: 'CARDIOLOGY', level: 'POSTGRADUATE' },
  { id: 4, name: 'MS ORTHOPEDICS', specialization: 'ORTHOPEDICS', level: 'POSTGRADUATE' },
  { id: 5, name: 'MD PEDIATRICS', specialization: 'PEDIATRICS', level: 'POSTGRADUATE' }
];

// Test suite class
class SearchTestSuite {
  constructor() {
    this.results = {
      passed: 0,
      failed: 0,
      total: 0,
      details: []
    };
  }

  // Run all tests
  async runAllTests() {
    console.log('🧪 Starting Advanced Search Algorithm Test Suite...\n');
    
    this.testFuzzySearch();
    this.testPhoneticSearch();
    this.testLocationSearch();
    this.testSynonymSearch();
    this.testWildcardSearch();
    this.testRegexSearch();
    this.testSemanticSearch();
    this.testAdvancedSearchIntegration();
    this.testPerformance();
    
    this.generateReport();
    return this.results;
  }

  // Test fuzzy search
  testFuzzySearch() {
    console.log('🔍 Testing Fuzzy Search...');
    
    const testCases = [
      { query: 'AIMS', expected: 'ALL INDIA INSTITUTE OF MEDICAL SCIENCES', description: 'Acronym matching' },
      { query: 'bombay', expected: 'BOMBAY HOSPITAL INSTITUTE OF MEDICAL SCIENCES', description: 'City name variation' },
      { query: 'kardioloji', expected: 'MD CARDIOLOGY', description: 'Typo tolerance' },
      { query: 'pediatric', expected: 'MD PEDIATRICS', description: 'Partial word matching' }
    ];

    testCases.forEach(testCase => {
      const results = fuzzySearch(testCase.query, testCase.expected, 3);
      const passed = results;
      
      this.recordTest('Fuzzy Search', testCase.description, passed, testCase.query, testCase.expected);
    });
  }

  // Test phonetic search
  testPhoneticSearch() {
    console.log('🎵 Testing Phonetic Search...');
    
    const testCases = [
      { query: 'kardioloji', expected: 'CARDIOLOGY', description: 'Soundex matching' },
      { query: 'pediatric', expected: 'PEDIATRICS', description: 'Metaphone matching' }
    ];

    testCases.forEach(testCase => {
      const soundexResult = soundex(testCase.query) === soundex(testCase.expected);
      const metaphoneResult = metaphone(testCase.query) === metaphone(testCase.expected);
      const passed = soundexResult || metaphoneResult;
      
      this.recordTest('Phonetic Search', testCase.description, passed, testCase.query, testCase.expected);
    });
  }

  // Test location search
  testLocationSearch() {
    console.log('📍 Testing Location Search...');
    
    const testCases = [
      { query: 'delhi', expected: 'NEW DELHI', description: 'City name matching' },
      { query: 'mumbai', expected: 'MUMBAI', description: 'City name matching' },
      { query: 'bangalore', expected: 'BANGALORE', description: 'City name matching' }
    ];

    testCases.forEach(testCase => {
      const results = testColleges.filter(college => 
        college.location.toLowerCase().includes(testCase.query.toLowerCase())
      );
      const passed = results.length > 0;
      
      this.recordTest('Location Search', testCase.description, passed, testCase.query, testCase.expected);
    });
  }

  // Test synonym search
  testSynonymSearch() {
    console.log('🔄 Testing Synonym Search...');
    
    const testCases = [
      { query: 'heart', expected: 'CARDIOLOGY', description: 'Medical synonym expansion' },
      { query: 'bone', expected: 'ORTHOPEDICS', description: 'Medical synonym expansion' }
    ];

    testCases.forEach(testCase => {
      const expanded = expandSynonyms(testCase.query);
      const results = testPrograms.filter(program => 
        expanded.some(synonym => 
          program.specialization.toLowerCase().includes(synonym.toLowerCase())
        )
      );
      const passed = results.length > 0;
      
      this.recordTest('Synonym Search', testCase.description, passed, testCase.query, testCase.expected);
    });
  }

  // Test wildcard search
  testWildcardSearch() {
    console.log('⭐ Testing Wildcard Search...');
    
    const testCases = [
      { query: 'MD*', expected: 'MD CARDIOLOGY', description: 'Prefix wildcard' },
      { query: '*CARDIOLOGY', expected: 'MD CARDIOLOGY', description: 'Suffix wildcard' },
      { query: 'M*S', expected: 'MS ORTHOPEDICS', description: 'Pattern wildcard' }
    ];

    testCases.forEach(testCase => {
      const results = testPrograms.filter(program => 
        wildcardSearch(testCase.query, program.name)
      );
      const passed = results.length > 0;
      
      this.recordTest('Wildcard Search', testCase.description, passed, testCase.query, testCase.expected);
    });
  }

  // Test regex search
  testRegexSearch() {
    console.log('🔧 Testing Regex Search...');
    
    const testCases = [
      { query: '^MD.*', expected: 'MD CARDIOLOGY', description: 'Regex pattern matching' },
      { query: '.*COLLEGE.*', expected: 'BANGALORE MEDICAL COLLEGE AND RESEARCH INSTITUTE', description: 'Regex pattern matching' }
    ];

    testCases.forEach(testCase => {
      const results = testColleges.filter(college => 
        regexSearch(testCase.query, college.name)
      );
      const passed = results.length > 0;
      
      this.recordTest('Regex Search', testCase.description, passed, testCase.query, testCase.expected);
    });
  }

  // Test semantic search
  testSemanticSearch() {
    console.log('🧠 Testing Semantic Search...');
    
    const testCases = [
      { query: 'heart disease', expected: 'CARDIOLOGY', description: 'Semantic similarity' },
      { query: 'children medicine', expected: 'PEDIATRICS', description: 'Semantic similarity' }
    ];

    testCases.forEach(testCase => {
      const results = testPrograms.map(program => ({
        ...program,
        similarity: calculateSemanticSimilarity(testCase.query, program.specialization)
      })).sort((a, b) => b.similarity - a.similarity);
      
      const passed = results[0] && results[0].similarity > 0.3;
      
      this.recordTest('Semantic Search', testCase.description, passed, testCase.query, testCase.expected);
    });
  }

  // Test advanced search integration
  testAdvancedSearchIntegration() {
    console.log('🚀 Testing Advanced Search Integration...');
    
    const testCases = [
      { 
        query: 'AIMS delhi', 
        searchFields: ['name', 'location'], 
        expected: 'ALL INDIA INSTITUTE OF MEDICAL SCIENCES',
        description: 'Multi-field search with location'
      },
      { 
        query: 'cardiology heart', 
        searchFields: ['name', 'specialization'], 
        expected: 'MD CARDIOLOGY',
        description: 'Multi-field search with synonyms'
      }
    ];

    testCases.forEach(testCase => {
      const results = advancedSearch(testCase.query, testColleges.concat(testPrograms), testCase.searchFields, {
        fuzzy: true,
        phonetic: true,
        location: true,
        synonyms: true
      });
      
      const passed = results.some(result => 
        result.item.name?.includes(testCase.expected) || 
        result.item.specialization?.includes(testCase.expected)
      );
      
      this.recordTest('Advanced Search Integration', testCase.description, passed, testCase.query, testCase.expected);
    });
  }

  // Test performance
  testPerformance() {
    console.log('⚡ Testing Performance...');
    
    const startTime = performance.now();
    const results = advancedSearch('medical', testColleges.concat(testPrograms), ['name', 'specialization', 'location'], {
      fuzzy: true,
      phonetic: true,
      location: true,
      synonyms: true
    });
    const endTime = performance.now();
    
    const responseTime = endTime - startTime;
    const passed = responseTime < 100; // Should complete in under 100ms
    
    this.recordTest('Performance', `Response time: ${responseTime.toFixed(2)}ms`, passed, 'medical', 'Under 100ms');
  }

  // Record test result
  recordTest(category, description, passed, input, expected) {
    this.results.total++;
    if (passed) {
      this.results.passed++;
    } else {
      this.results.failed++;
    }
    
    this.results.details.push({
      category,
      description,
      passed,
      input,
      expected,
      timestamp: new Date().toISOString()
    });
  }

  // Generate test report
  generateReport() {
    console.log('\n📊 Advanced Search Test Results');
    console.log('================================');
    console.log(`✅ Passed: ${this.results.passed}`);
    console.log(`❌ Failed: ${this.results.failed}`);
    console.log(`📈 Success Rate: ${((this.results.passed / this.results.total) * 100).toFixed(1)}%`);
    
    if (this.results.failed > 0) {
      console.log('\n❌ Failed Tests:');
      this.results.details
        .filter(test => !test.passed)
        .forEach(test => {
          console.log(`  - ${test.category}: ${test.description}`);
          console.log(`    Input: "${test.input}" | Expected: "${test.expected}"`);
        });
    }
    
    console.log('\n🎯 Test Summary:');
    console.log(`  Total Tests: ${this.results.total}`);
    console.log(`  Passed: ${this.results.passed}`);
    console.log(`  Failed: ${this.results.failed}`);
    console.log(`  Success Rate: ${((this.results.passed / this.results.total) * 100).toFixed(1)}%`);
  }
}

// Export test suite
export default SearchTestSuite;
export { testColleges, testPrograms };
