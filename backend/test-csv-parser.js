const CutoffCsvParser = require('./src/utils/cutoffCsvParser');
const path = require('path');

async function testCsvParser() {
  try {
    console.log('🧪 Testing CSV Parser...\n');
    
    const parser = new CutoffCsvParser();
    
    // Test with sample data
    const sampleData = [
      {
        round: 'r1',
        quota: 'state',
        college_name: 'A.J.INSTITUTE OF MEDICAL SCIENCES ,NH 17, KUNTIKANA,MANGALORE',
        college_location: 'Mangalore, Karnataka',
        course_name: 'DIPLOMA IN TUBERCULOSIS & CHEST DISEASES',
        all_ranks: 'GMPH:44483'
      },
      {
        round: 'r1',
        quota: 'state',
        college_name: 'A.J.INSTITUTE OF MEDICAL SCIENCES ,NH 17, KUNTIKANA,MANGALORE',
        college_location: 'Mangalore, Karnataka',
        course_name: 'MD ANAESTHESIOLOGY',
        all_ranks: '2AG:24096, GM:15958, GM:16026, GMP:24997, GMP:28888, MU:37804, MU:40339, MU:41831, MU:43843, MU:44668, MU:47504, OPN:22743'
      }
    ];

    console.log('📊 Sample Data:');
    console.log(JSON.stringify(sampleData, null, 2));
    console.log('\n');

    // Test parsing individual rows
    console.log('🔍 Testing Row Parsing:');
    for (let i = 0; i < sampleData.length; i++) {
      const row = sampleData[i];
      console.log(`\nRow ${i + 1}:`);
      
      try {
        const parsed = parser.parseRow(row, {
          authority: 'KEA',
          year: 2024,
          quota: 'state'
        });
        
        console.log('✅ Parsed Successfully:');
        console.log('College:', parsed.college.name);
        console.log('City:', parsed.college.city);
        console.log('State:', parsed.college.state);
        console.log('Course:', parsed.course.name);
        console.log('Level:', parsed.course.level);
        console.log('Cutoffs:', parsed.cutoffs.length);
        
        for (const cutoff of parsed.cutoffs) {
          console.log(`  - ${cutoff.category}: ${cutoff.opening_rank}`);
        }
        
      } catch (error) {
        console.log('❌ Parse Error:', error.message);
      }
    }

    // Test rank string parsing
    console.log('\n🔍 Testing Rank String Parsing:');
    const testRanks = [
      'GMPH:44483',
      '2AG:24096, GM:15958, GM:16026',
      'GM:15958, GMP:24997, GMP:28888',
      'MU:37804, MU:40339, MU:41831'
    ];

    for (const rankString of testRanks) {
      console.log(`\nRank String: "${rankString}"`);
      const ranks = parser.parseRankString(rankString);
      console.log('Parsed Ranks:', ranks);
    }

    // Test category normalization
    console.log('\n🔍 Testing Category Normalization:');
    const testCategories = ['GMPH', '2AG', 'GM', 'GMP', 'MU', 'OPN', 'SC', 'ST', 'OBC'];
    
    for (const category of testCategories) {
      const normalized = parser.normalizeCategory(category);
      console.log(`${category} → ${normalized}`);
    }

    // Test course parsing
    console.log('\n🔍 Testing Course Parsing:');
    const testCourses = [
      'MBBS',
      'BDS',
      'MD GENERAL MEDICINE',
      'MS GENERAL SURGERY',
      'MDS CONSERVATIVE DENTISTRY',
      'DIPLOMA IN TUBERCULOSIS & CHEST DISEASES',
      'DNB GENERAL MEDICINE',
      'FELLOWSHIP IN CARDIOLOGY'
    ];

    for (const course of testCourses) {
      const parsed = parser.parseCourseInfo(course);
      console.log(`\n"${course}" → Level: ${parsed.level}, Type: ${parsed.type}, Specialization: ${parsed.specialization || 'None'}`);
    }

    console.log('\n✅ All tests completed successfully!');

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Run the test
testCsvParser();
