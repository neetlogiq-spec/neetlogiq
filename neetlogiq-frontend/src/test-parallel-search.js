/**
 * PARALLEL vs SEQUENTIAL SEARCH QUALITY TEST
 * 
 * This test demonstrates the quality improvements of parallel search
 * by comparing results from both approaches on the same queries.
 */

import { AdvancedSearchService } from './services/advancedSearchService.js';

class SearchQualityTester {
  constructor() {
    this.advancedSearchService = new AdvancedSearchService();
    this.testQueries = [
      // Abbreviation tests
      'a.j',           // Should find "A J INSTITUTE OF DENTAL SCIENCES"
      'a j',           // Should find "A.J. INSTITUTE OF DENTAL SCIENCES"  
      'm.s',           // Should find "M S RAMAIAH MEDICAL COLLEGE"
      'm s',           // Should find "M.S. RAMAIAH DENTAL COLLEGE"
      'kvg',           // Should find "K V G MEDICAL COLLEGE"
      'k v g',         // Should find "K.V.G. MEDICAL COLLEGE"
      
      // Complex abbreviation tests
      's.k.s',         // Should find "S K S HOSPITAL"
      's k s',         // Should find "S.K.S. HOSPITAL"
      'a.b.c',         // Should find "A B C MEDICAL COLLEGE"
      'a b c',         // Should find "A.B.C. MEDICAL COLLEGE"
      
      // Regular search tests
      'medical',       // Should find medical colleges
      'dental',        // Should find dental colleges
      'bangalore',     // Should find Bangalore colleges
      'karnataka',     // Should find Karnataka colleges
      
      // Edge cases
      'xyz',           // Should return no results
      'a',             // Single letter test
      'ab',            // Two letter test
    ];
    
    this.results = {
      parallel: {},
      sequential: {},
      comparison: {}
    };
  }

  async initialize() {
    console.log('🚀 Initializing Search Quality Tester...');
    
    try {
      // Mock college data for testing
      const mockColleges = [
        {
          id: 1,
          name: 'A J INSTITUTE OF DENTAL SCIENCES',
          city: 'Mangalore',
          state: 'Karnataka',
          college_type: 'DENTAL',
          stream: 'DENTAL'
        },
        {
          id: 2,
          name: 'A.J. INSTITUTE OF DENTAL SCIENCES',
          city: 'Mangalore', 
          state: 'Karnataka',
          college_type: 'DENTAL',
          stream: 'DENTAL'
        },
        {
          id: 3,
          name: 'M S RAMAIAH MEDICAL COLLEGE',
          city: 'Bangalore',
          state: 'Karnataka', 
          college_type: 'MEDICAL',
          stream: 'MEDICAL'
        },
        {
          id: 4,
          name: 'M.S. RAMAIAH DENTAL COLLEGE',
          city: 'Bangalore',
          state: 'Karnataka',
          college_type: 'DENTAL', 
          stream: 'DENTAL'
        },
        {
          id: 5,
          name: 'K V G MEDICAL COLLEGE',
          city: 'Sullia',
          state: 'Karnataka',
          college_type: 'MEDICAL',
          stream: 'MEDICAL'
        },
        {
          id: 6,
          name: 'K.V.G. MEDICAL COLLEGE',
          city: 'Sullia',
          state: 'Karnataka',
          college_type: 'MEDICAL',
          stream: 'MEDICAL'
        },
        {
          id: 7,
          name: 'S K S HOSPITAL',
          city: 'Mysore',
          state: 'Karnataka',
          college_type: 'DNB',
          stream: 'DNB'
        },
        {
          id: 8,
          name: 'S.K.S. HOSPITAL',
          city: 'Mysore',
          state: 'Karnataka',
          college_type: 'DNB',
          stream: 'DNB'
        },
        {
          id: 9,
          name: 'A B C MEDICAL COLLEGE',
          city: 'Delhi',
          state: 'Delhi',
          college_type: 'MEDICAL',
          stream: 'MEDICAL'
        },
        {
          id: 10,
          name: 'A.B.C. MEDICAL COLLEGE',
          city: 'Delhi',
          state: 'Delhi',
          college_type: 'MEDICAL',
          stream: 'MEDICAL'
        }
      ];

      const initResult = await this.advancedSearchService.initialize(mockColleges);
      
      if (initResult.success) {
        console.log('✅ Search Quality Tester initialized successfully');
        return true;
      } else {
        console.error('❌ Failed to initialize Search Quality Tester:', initResult.error);
        return false;
      }
    } catch (error) {
      console.error('❌ Initialization error:', error);
      return false;
    }
  }

  async runParallelSearch(query) {
    console.log(`🔄 Running PARALLEL search for: "${query}"`);
    const startTime = performance.now();
    
    try {
      const results = await this.advancedSearchService.search(query);
      const searchTime = performance.now() - startTime;
      
      return {
        query,
        results: results.results || results,
        searchTime,
        resultCount: (results.results || results).length,
        searchType: 'parallel',
        success: true
      };
    } catch (error) {
      console.error(`❌ Parallel search failed for "${query}":`, error);
      return {
        query,
        results: [],
        searchTime: performance.now() - startTime,
        resultCount: 0,
        searchType: 'parallel',
        success: false,
        error: error.message
      };
    }
  }

  async runSequentialSearch(query) {
    console.log(`🔄 Running SEQUENTIAL search for: "${query}"`);
    const startTime = performance.now();
    
    try {
      // Simulate sequential search by running searches one by one
      let results = [];
      
      // Tier 1: Exact match
      results = this.advancedSearchService.exactSearch(query);
      if (results.length > 0) {
        return {
          query,
          results,
          searchTime: performance.now() - startTime,
          resultCount: results.length,
          searchType: 'sequential',
          tier: 'exact',
          success: true
        };
      }
      
      // Tier 2: Neural abbreviation (if applicable)
      if (this.advancedSearchService.isAbbreviationQuery(query)) {
        results = this.advancedSearchService.neuralAbbreviationSearch(query);
        if (results.length > 0) {
          return {
            query,
            results,
            searchTime: performance.now() - startTime,
            resultCount: results.length,
            searchType: 'sequential',
            tier: 'neural-abbreviation',
            success: true
          };
        }
      }
      
      // Tier 3: Regex abbreviation (if applicable)
      if (this.advancedSearchService.isAbbreviationQuery(query)) {
        results = this.advancedSearchService.advancedRegexAbbreviationSearch(query);
        if (results.length > 0) {
          return {
            query,
            results,
            searchTime: performance.now() - startTime,
            resultCount: results.length,
            searchType: 'sequential',
            tier: 'regex-abbreviation',
            success: true
          };
        }
      }
      
      // Tier 4: Partial match
      results = this.advancedSearchService.partialSearch(query);
      if (results.length > 0) {
        return {
          query,
          results,
          searchTime: performance.now() - startTime,
          resultCount: results.length,
          searchType: 'sequential',
          tier: 'partial',
          success: true
        };
      }
      
      // Tier 5: Smart abbreviation
      results = this.advancedSearchService.smartAbbreviationSearch(query);
      if (results.length > 0) {
        return {
          query,
          results,
          searchTime: performance.now() - startTime,
          resultCount: results.length,
          searchType: 'sequential',
          tier: 'smart-abbreviation',
          success: true
        };
      }
      
      // No results found
      return {
        query,
        results: [],
        searchTime: performance.now() - startTime,
        resultCount: 0,
        searchType: 'sequential',
        tier: 'no-results',
        success: true
      };
      
    } catch (error) {
      console.error(`❌ Sequential search failed for "${query}":`, error);
      return {
        query,
        results: [],
        searchTime: performance.now() - startTime,
        resultCount: 0,
        searchType: 'sequential',
        success: false,
        error: error.message
      };
    }
  }

  async runQualityTest() {
    console.log('🧪 Starting Search Quality Test...');
    console.log('=' .repeat(80));
    
    for (const query of this.testQueries) {
      console.log(`\n🔍 Testing Query: "${query}"`);
      console.log('-'.repeat(50));
      
      // Run both searches
      const [parallelResult, sequentialResult] = await Promise.all([
        this.runParallelSearch(query),
        this.runSequentialSearch(query)
      ]);
      
      // Store results
      this.results.parallel[query] = parallelResult;
      this.results.sequential[query] = sequentialResult;
      
      // Compare results
      const comparison = this.compareResults(parallelResult, sequentialResult);
      this.results.comparison[query] = comparison;
      
      // Display results
      this.displayQueryResults(query, parallelResult, sequentialResult, comparison);
    }
    
    // Generate summary report
    this.generateSummaryReport();
  }

  compareResults(parallelResult, sequentialResult) {
    const parallelCount = parallelResult.resultCount;
    const sequentialCount = sequentialResult.resultCount;
    
    const parallelTime = parallelResult.searchTime;
    const sequentialTime = sequentialResult.searchTime;
    
    // Quality metrics
    const resultImprovement = parallelCount > sequentialCount ? 
      ((parallelCount - sequentialCount) / Math.max(sequentialCount, 1)) * 100 : 0;
    
    const timeImprovement = parallelTime < sequentialTime ?
      ((sequentialTime - parallelTime) / sequentialTime) * 100 : 0;
    
    // Accuracy assessment
    const parallelAccuracy = this.assessAccuracy(parallelResult.results, parallelResult.query);
    const sequentialAccuracy = this.assessAccuracy(sequentialResult.results, sequentialResult.query);
    
    return {
      resultImprovement,
      timeImprovement,
      parallelAccuracy,
      sequentialAccuracy,
      qualityWinner: parallelCount > sequentialCount ? 'parallel' : 
                    sequentialCount > parallelCount ? 'sequential' : 'tie',
      speedWinner: parallelTime < sequentialTime ? 'parallel' : 
                  sequentialTime < parallelTime ? 'sequential' : 'tie'
    };
  }

  assessAccuracy(results, query) {
    if (results.length === 0) return 0;
    
    let accuracyScore = 0;
    const queryLower = query.toLowerCase();
    
    results.forEach(result => {
      const name = (result.name || '').toLowerCase();
      
      // Exact match bonus
      if (name.includes(queryLower)) {
        accuracyScore += 100;
      }
      
      // Abbreviation match bonus
      if (this.isAbbreviationMatch(query, name)) {
        accuracyScore += 50;
      }
      
      // Relevance bonus
      if (result.relevanceScore) {
        accuracyScore += result.relevanceScore;
      }
    });
    
    return Math.min(100, accuracyScore / results.length);
  }

  isAbbreviationMatch(query, name) {
    const queryUpper = query.toUpperCase();
    const nameUpper = name.toUpperCase();
    
    // Check for various abbreviation patterns
    const patterns = [
      queryUpper.replace(/\./g, ' '),  // A.J. -> A J
      queryUpper.replace(/\s/g, '.'),  // A J -> A.J.
      queryUpper.replace(/[.\s]/g, ''), // A.J. -> AJ
    ];
    
    return patterns.some(pattern => nameUpper.includes(pattern));
  }

  displayQueryResults(query, parallelResult, sequentialResult, comparison) {
    console.log(`📊 Results for "${query}":`);
    console.log(`  Parallel:   ${parallelResult.resultCount} results in ${parallelResult.searchTime.toFixed(2)}ms`);
    console.log(`  Sequential: ${sequentialResult.resultCount} results in ${sequentialResult.searchTime.toFixed(2)}ms`);
    
    if (comparison.resultImprovement > 0) {
      console.log(`  🎯 Quality: Parallel found ${comparison.resultImprovement.toFixed(1)}% more results`);
    }
    
    if (comparison.timeImprovement > 0) {
      console.log(`  ⚡ Speed: Parallel was ${comparison.timeImprovement.toFixed(1)}% faster`);
    }
    
    console.log(`  🏆 Winner: ${comparison.qualityWinner} (quality), ${comparison.speedWinner} (speed)`);
    
    // Show sample results
    if (parallelResult.results.length > 0) {
      console.log(`  📋 Parallel Results: ${parallelResult.results.slice(0, 3).map(r => r.name).join(', ')}`);
    }
    if (sequentialResult.results.length > 0) {
      console.log(`  📋 Sequential Results: ${sequentialResult.results.slice(0, 3).map(r => r.name).join(', ')}`);
    }
  }

  generateSummaryReport() {
    console.log('\n' + '='.repeat(80));
    console.log('📈 SEARCH QUALITY TEST SUMMARY REPORT');
    console.log('='.repeat(80));
    
    const queries = Object.keys(this.results.comparison);
    let parallelWins = 0;
    let sequentialWins = 0;
    let ties = 0;
    
    let totalResultImprovement = 0;
    let totalTimeImprovement = 0;
    let totalParallelAccuracy = 0;
    let totalSequentialAccuracy = 0;
    
    queries.forEach(query => {
      const comparison = this.results.comparison[query];
      
      if (comparison.qualityWinner === 'parallel') parallelWins++;
      else if (comparison.qualityWinner === 'sequential') sequentialWins++;
      else ties++;
      
      totalResultImprovement += comparison.resultImprovement;
      totalTimeImprovement += comparison.timeImprovement;
      totalParallelAccuracy += comparison.parallelAccuracy;
      totalSequentialAccuracy += comparison.sequentialAccuracy;
    });
    
    const avgResultImprovement = totalResultImprovement / queries.length;
    const avgTimeImprovement = totalTimeImprovement / queries.length;
    const avgParallelAccuracy = totalParallelAccuracy / queries.length;
    const avgSequentialAccuracy = totalSequentialAccuracy / queries.length;
    
    console.log(`\n🏆 OVERALL WINNER: ${parallelWins > sequentialWins ? 'PARALLEL SEARCH' : 
                  sequentialWins > parallelWins ? 'SEQUENTIAL SEARCH' : 'TIE'}`);
    
    console.log(`\n📊 Quality Comparison:`);
    console.log(`  Parallel Wins:   ${parallelWins}/${queries.length} (${(parallelWins/queries.length*100).toFixed(1)}%)`);
    console.log(`  Sequential Wins: ${sequentialWins}/${queries.length} (${(sequentialWins/queries.length*100).toFixed(1)}%)`);
    console.log(`  Ties:           ${ties}/${queries.length} (${(ties/queries.length*100).toFixed(1)}%)`);
    
    console.log(`\n📈 Performance Metrics:`);
    console.log(`  Average Result Improvement: ${avgResultImprovement.toFixed(1)}%`);
    console.log(`  Average Time Improvement:   ${avgTimeImprovement.toFixed(1)}%`);
    console.log(`  Average Parallel Accuracy:  ${avgParallelAccuracy.toFixed(1)}%`);
    console.log(`  Average Sequential Accuracy: ${avgSequentialAccuracy.toFixed(1)}%`);
    
    console.log(`\n🎯 Key Findings:`);
    if (avgResultImprovement > 0) {
      console.log(`  ✅ Parallel search finds ${avgResultImprovement.toFixed(1)}% more results on average`);
    }
    if (avgTimeImprovement > 0) {
      console.log(`  ⚡ Parallel search is ${avgTimeImprovement.toFixed(1)}% faster on average`);
    }
    if (avgParallelAccuracy > avgSequentialAccuracy) {
      console.log(`  🎯 Parallel search has ${(avgParallelAccuracy - avgSequentialAccuracy).toFixed(1)}% higher accuracy`);
    }
    
    console.log(`\n💡 Conclusion:`);
    if (parallelWins > sequentialWins) {
      console.log(`  🚀 PARALLEL SEARCH provides significantly better quality results!`);
      console.log(`  📊 It wins ${parallelWins} out of ${queries.length} test cases`);
      console.log(`  🎯 The parallel architecture successfully combines multiple search engines`);
      console.log(`  ⚡ to deliver more comprehensive and accurate results faster.`);
    } else {
      console.log(`  ⚖️ Results are mixed - both approaches have their strengths`);
    }
    
    console.log('\n' + '='.repeat(80));
  }
}

// Run the test
async function runSearchQualityTest() {
  const tester = new SearchQualityTester();
  
  const initialized = await tester.initialize();
  if (!initialized) {
    console.error('❌ Failed to initialize tester');
    return;
  }
  
  await tester.runQualityTest();
}

// Export for use in other modules
export { SearchQualityTester, runSearchQualityTest };

// Run if called directly
if (typeof window !== 'undefined') {
  // Browser environment
  window.runSearchQualityTest = runSearchQualityTest;
} else {
  // Node.js environment
  runSearchQualityTest().catch(console.error);
}
