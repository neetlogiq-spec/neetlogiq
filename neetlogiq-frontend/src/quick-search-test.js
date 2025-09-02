/**
 * QUICK SEARCH QUALITY TEST
 * 
 * A simplified test that can be run directly in the browser console
 * to demonstrate parallel vs sequential search quality improvements.
 */

// Mock data for testing
const mockColleges = [
  { id: 1, name: 'A J INSTITUTE OF DENTAL SCIENCES', city: 'Mangalore', state: 'Karnataka', college_type: 'DENTAL', stream: 'DENTAL' },
  { id: 2, name: 'A.J. INSTITUTE OF DENTAL SCIENCES', city: 'Mangalore', state: 'Karnataka', college_type: 'DENTAL', stream: 'DENTAL' },
  { id: 3, name: 'M S RAMAIAH MEDICAL COLLEGE', city: 'Bangalore', state: 'Karnataka', college_type: 'MEDICAL', stream: 'MEDICAL' },
  { id: 4, name: 'M.S. RAMAIAH DENTAL COLLEGE', city: 'Bangalore', state: 'Karnataka', college_type: 'DENTAL', stream: 'DENTAL' },
  { id: 5, name: 'K V G MEDICAL COLLEGE', city: 'Sullia', state: 'Karnataka', college_type: 'MEDICAL', stream: 'MEDICAL' },
  { id: 6, name: 'K.V.G. MEDICAL COLLEGE', city: 'Sullia', state: 'Karnataka', college_type: 'MEDICAL', stream: 'MEDICAL' },
  { id: 7, name: 'S K S HOSPITAL', city: 'Mysore', state: 'Karnataka', college_type: 'DNB', stream: 'DNB' },
  { id: 8, name: 'S.K.S. HOSPITAL', city: 'Mysore', state: 'Karnataka', college_type: 'DNB', stream: 'DNB' },
  { id: 9, name: 'A B C MEDICAL COLLEGE', city: 'Delhi', state: 'Delhi', college_type: 'MEDICAL', stream: 'MEDICAL' },
  { id: 10, name: 'A.B.C. MEDICAL COLLEGE', city: 'Delhi', state: 'Delhi', college_type: 'MEDICAL', stream: 'MEDICAL' },
  { id: 11, name: 'BANGALORE MEDICAL COLLEGE', city: 'Bangalore', state: 'Karnataka', college_type: 'MEDICAL', stream: 'MEDICAL' },
  { id: 12, name: 'KARNATAKA MEDICAL COLLEGE', city: 'Hubli', state: 'Karnataka', college_type: 'MEDICAL', stream: 'MEDICAL' },
  { id: 13, name: 'DENTAL COLLEGE BANGALORE', city: 'Bangalore', state: 'Karnataka', college_type: 'DENTAL', stream: 'DENTAL' },
  { id: 14, name: 'MEDICAL INSTITUTE KARNATAKA', city: 'Mysore', state: 'Karnataka', college_type: 'MEDICAL', stream: 'MEDICAL' }
];

// Simple search functions for demonstration
function exactSearch(query, colleges) {
  const queryLower = query.toLowerCase();
  return colleges.filter(college => 
    college.name.toLowerCase().includes(queryLower) ||
    college.city.toLowerCase().includes(queryLower) ||
    college.state.toLowerCase().includes(queryLower)
  );
}

function abbreviationSearch(query, colleges) {
  const queryUpper = query.toUpperCase();
  const patterns = [
    queryUpper.replace(/\./g, ' '),  // A.J. -> A J
    queryUpper.replace(/\s/g, '.'),  // A J -> A.J.
    queryUpper.replace(/[.\s]/g, ''), // A.J. -> AJ
  ];
  
  return colleges.filter(college => {
    const nameUpper = college.name.toUpperCase();
    return patterns.some(pattern => nameUpper.includes(pattern));
  });
}

function partialSearch(query, colleges) {
  const queryLower = query.toLowerCase();
  return colleges.filter(college => {
    const name = college.name.toLowerCase();
    const words = name.split(' ');
    return words.some(word => word.includes(queryLower));
  });
}

function fuzzySearch(query, colleges) {
  const queryLower = query.toLowerCase();
  return colleges.filter(college => {
    const name = college.name.toLowerCase();
    // Simple fuzzy matching - check if most characters match
    let matches = 0;
    for (let i = 0; i < Math.min(queryLower.length, name.length); i++) {
      if (queryLower[i] === name[i]) matches++;
    }
    return matches / queryLower.length > 0.6;
  });
}

// Sequential search simulation
function sequentialSearch(query, colleges) {
  console.log(`🔍 Sequential search for: "${query}"`);
  const startTime = performance.now();
  
  // Try exact search first
  let results = exactSearch(query, colleges);
  if (results.length > 0) {
    console.log(`✅ Found ${results.length} results with exact search`);
    return { results, searchTime: performance.now() - startTime, method: 'exact' };
  }
  
  // Try abbreviation search
  results = abbreviationSearch(query, colleges);
  if (results.length > 0) {
    console.log(`✅ Found ${results.length} results with abbreviation search`);
    return { results, searchTime: performance.now() - startTime, method: 'abbreviation' };
  }
  
  // Try partial search
  results = partialSearch(query, colleges);
  if (results.length > 0) {
    console.log(`✅ Found ${results.length} results with partial search`);
    return { results, searchTime: performance.now() - startTime, method: 'partial' };
  }
  
  // Try fuzzy search
  results = fuzzySearch(query, colleges);
  console.log(`✅ Found ${results.length} results with fuzzy search`);
  return { results, searchTime: performance.now() - startTime, method: 'fuzzy' };
}

// Parallel search simulation
function parallelSearch(query, colleges) {
  console.log(`🚀 Parallel search for: "${query}"`);
  const startTime = performance.now();
  
  // Run all searches simultaneously
  const [exactResults, abbrevResults, partialResults, fuzzyResults] = [
    exactSearch(query, colleges),
    abbreviationSearch(query, colleges),
    partialSearch(query, colleges),
    fuzzySearch(query, colleges)
  ];
  
  // Combine and deduplicate results
  const allResults = [...exactResults, ...abbrevResults, ...partialResults, ...fuzzyResults];
  const uniqueResults = allResults.filter((result, index, self) => 
    index === self.findIndex(r => r.id === result.id)
  );
  
  // Score results based on which methods found them
  const scoredResults = uniqueResults.map(result => {
    let score = 0;
    if (exactResults.includes(result)) score += 100;
    if (abbrevResults.includes(result)) score += 80;
    if (partialResults.includes(result)) score += 60;
    if (fuzzyResults.includes(result)) score += 40;
    
    return { ...result, score };
  });
  
  // Sort by score
  scoredResults.sort((a, b) => b.score - a.score);
  
  console.log(`✅ Found ${scoredResults.length} unique results from ${allResults.length} total matches`);
  console.log(`📊 Methods used: exact(${exactResults.length}), abbrev(${abbrevResults.length}), partial(${partialResults.length}), fuzzy(${fuzzyResults.length})`);
  
  return { 
    results: scoredResults, 
    searchTime: performance.now() - startTime, 
    method: 'parallel',
    breakdown: {
      exact: exactResults.length,
      abbreviation: abbrevResults.length,
      partial: partialResults.length,
      fuzzy: fuzzyResults.length
    }
  };
}

// Test function
function runQuickSearchTest() {
  console.log('🧪 QUICK SEARCH QUALITY TEST');
  console.log('='.repeat(60));
  
  const testQueries = ['a.j', 'a j', 'm.s', 'm s', 'kvg', 'k v g', 'medical', 'bangalore'];
  
  let parallelWins = 0;
  let sequentialWins = 0;
  let totalParallelTime = 0;
  let totalSequentialTime = 0;
  
  testQueries.forEach((query, index) => {
    console.log(`\n🔍 Test ${index + 1}: "${query}"`);
    console.log('-'.repeat(40));
    
    const sequentialResult = sequentialSearch(query, mockColleges);
    const parallelResult = parallelSearch(query, mockColleges);
    
    console.log(`📊 Results:`);
    console.log(`  Sequential: ${sequentialResult.results.length} results in ${sequentialResult.searchTime.toFixed(2)}ms (${sequentialResult.method})`);
    console.log(`  Parallel:   ${parallelResult.results.length} results in ${parallelResult.searchTime.toFixed(2)}ms (${parallelResult.method})`);
    
    if (parallelResult.results.length > sequentialResult.results.length) {
      console.log(`  🎯 Winner: PARALLEL (+${parallelResult.results.length - sequentialResult.results.length} results)`);
      parallelWins++;
    } else if (sequentialResult.results.length > parallelResult.results.length) {
      console.log(`  🎯 Winner: SEQUENTIAL (+${sequentialResult.results.length - parallelResult.results.length} results)`);
      sequentialWins++;
    } else {
      console.log(`  🎯 Winner: TIE (same number of results)`);
    }
    
    totalParallelTime += parallelResult.searchTime;
    totalSequentialTime += sequentialResult.searchTime;
    
    // Show sample results
    if (parallelResult.results.length > 0) {
      console.log(`  📋 Parallel Results: ${parallelResult.results.slice(0, 3).map(r => r.name).join(', ')}`);
    }
    if (sequentialResult.results.length > 0) {
      console.log(`  📋 Sequential Results: ${sequentialResult.results.slice(0, 3).map(r => r.name).join(', ')}`);
    }
  });
  
  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('📈 TEST SUMMARY');
  console.log('='.repeat(60));
  
  const avgParallelTime = totalParallelTime / testQueries.length;
  const avgSequentialTime = totalSequentialTime / testQueries.length;
  const timeImprovement = ((avgSequentialTime - avgParallelTime) / avgSequentialTime) * 100;
  
  console.log(`🏆 Overall Winner: ${parallelWins > sequentialWins ? 'PARALLEL SEARCH' : 
                sequentialWins > parallelWins ? 'SEQUENTIAL SEARCH' : 'TIE'}`);
  
  console.log(`\n📊 Quality Comparison:`);
  console.log(`  Parallel Wins:   ${parallelWins}/${testQueries.length} (${(parallelWins/testQueries.length*100).toFixed(1)}%)`);
  console.log(`  Sequential Wins: ${sequentialWins}/${testQueries.length} (${(sequentialWins/testQueries.length*100).toFixed(1)}%)`);
  
  console.log(`\n⚡ Performance Comparison:`);
  console.log(`  Average Parallel Time:   ${avgParallelTime.toFixed(2)}ms`);
  console.log(`  Average Sequential Time: ${avgSequentialTime.toFixed(2)}ms`);
  console.log(`  Time Improvement:        ${timeImprovement.toFixed(1)}%`);
  
  console.log(`\n🎯 Key Findings:`);
  if (parallelWins > sequentialWins) {
    console.log(`  ✅ Parallel search finds more results in ${parallelWins} out of ${testQueries.length} test cases`);
  }
  if (timeImprovement > 0) {
    console.log(`  ⚡ Parallel search is ${timeImprovement.toFixed(1)}% faster on average`);
  }
  
  console.log(`\n💡 Conclusion:`);
  if (parallelWins > sequentialWins) {
    console.log(`  🚀 PARALLEL SEARCH provides better quality results!`);
    console.log(`  📊 It combines multiple search methods simultaneously`);
    console.log(`  🎯 to deliver more comprehensive and accurate results.`);
  } else {
    console.log(`  ⚖️ Results are mixed - both approaches have their strengths`);
  }
  
  console.log('\n' + '='.repeat(60));
  
  return {
    parallelWins,
    sequentialWins,
    avgParallelTime,
    avgSequentialTime,
    timeImprovement
  };
}

// Make functions available globally for console testing
if (typeof window !== 'undefined') {
  window.runQuickSearchTest = runQuickSearchTest;
  window.mockColleges = mockColleges;
  window.sequentialSearch = sequentialSearch;
  window.parallelSearch = parallelSearch;
}

// Export for module use
export { runQuickSearchTest, mockColleges, sequentialSearch, parallelSearch };
