// Test script for enhanced abbreviation search
import simpleSearchService from './src/services/simpleSearchService.js';

// Use the singleton instance
const searchService = simpleSearchService;

// Test cases for abbreviation search
const testCases = [
  {
    query: "AJ",
    expectedCollege: "A J INSTITUTE OF MEDICAL SCIENCES & RESEARCH CENTRE",
    description: "Test AJ abbreviation"
  },
  {
    query: "MSR",
    expectedCollege: "M.S. RAMAIAH DENTAL COLLEGE", 
    description: "Test MSR abbreviation"
  },
  {
    query: "MSRMC",
    expectedCollege: "M S RAMAIAH MEDICAL COLLEGE",
    description: "Test MSRMC abbreviation"
  },
  {
    query: "A B",
    expectedCollege: "A.B. SHETTY MEMORIAL INSTITUTE OF DENTAL SCIENCES",
    description: "Test A B abbreviation"
  },
  {
    query: "a.b",
    expectedCollege: "A.B. SHETTY MEMORIAL INSTITUTE OF DENTAL SCIENCES", 
    description: "Test a.b abbreviation"
  }
];

console.log("🧪 Testing Enhanced Abbreviation Search System");
console.log("=" .repeat(60));

// Test the abbreviation pattern generation
console.log("\n📋 Testing Abbreviation Pattern Generation:");
console.log("-".repeat(50));

const testColleges = [
  "A J INSTITUTE OF MEDICAL SCIENCES & RESEARCH CENTRE",
  "M.S. RAMAIAH DENTAL COLLEGE",
  "A.B. SHETTY MEMORIAL INSTITUTE OF DENTAL SCIENCES"
];

testColleges.forEach(college => {
  const patterns = searchService.generateCollegeAbbreviationPatterns(college);
  console.log(`\n🏫 "${college}"`);
  console.log(`   Generated patterns: [${patterns.join(', ')}]`);
});

// Test abbreviation detection
console.log("\n🔍 Testing Abbreviation Detection:");
console.log("-".repeat(50));

const testQueries = ["AJ", "MSR", "MSRMC", "A B", "a.b", "KVG", "random text"];
testQueries.forEach(query => {
  const isAbbreviation = searchService.isLikelyAbbreviation(query);
  console.log(`"${query}" → isAbbreviation: ${isAbbreviation}`);
});

// Test concatenated abbreviation matching
console.log("\n🎯 Testing Concatenated Abbreviation Matching:");
console.log("-".repeat(50));

const abbreviationTests = [
  { query: "AJ", college: "A J INSTITUTE OF MEDICAL SCIENCES & RESEARCH CENTRE" },
  { query: "MSR", college: "M.S. RAMAIAH DENTAL COLLEGE" },
  { query: "MSRMC", college: "M S RAMAIAH MEDICAL COLLEGE" }
];

abbreviationTests.forEach(test => {
  const matches = searchService.isConcatenatedAbbreviationMatch(test.query, test.college);
  console.log(`"${test.query}" matches "${test.college}": ${matches}`);
});

console.log("\n✅ Abbreviation search system test completed!");
console.log("\n🚀 Ready to test in the browser at: http://localhost:5001");
console.log("📝 Try searching for: AJ, MSR, MSRMC, A B, a.b");
