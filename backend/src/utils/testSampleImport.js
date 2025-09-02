const CutoffImportPreparer = require('./cutoffImportPreparer');
const path = require('path');
const fs = require('fs');

async function testSampleImport() {
  console.log('🧪 Testing Sample Cutoff Import...\n');
  
  const preparer = new CutoffImportPreparer();
  
  try {
    // Initialize the system
    console.log('1️⃣ Initializing system...');
    await preparer.initialize();
    console.log('✅ System initialized successfully\n');
    
    // Prepare the system
    console.log('2️⃣ Preparing system for import...');
    const systemReady = await preparer.prepareSystem();
    if (!systemReady) {
      throw new Error('Failed to prepare system');
    }
    console.log('✅ System prepared successfully\n');
    
    // Test with a small sample file
    const sampleFile = '/Users/kashyapanand/Desktop/output/KEA_2024_DENTAL_R1_aggregated_20250826_132647.csv';
    
    if (!fs.existsSync(sampleFile)) {
      throw new Error(`Sample file not found: ${sampleFile}`);
    }
    
    console.log('3️⃣ Processing sample file...');
    console.log(`   📁 File: ${path.basename(sampleFile)}`);
    
    // Parse the CSV file
    const rawData = await preparer.parseCSVFile(sampleFile);
    console.log(`   📊 Raw records: ${rawData.length}`);
    
    // Extract file metadata
    const metadata = preparer.extractFileMetadata(path.basename(sampleFile));
    console.log(`   🏛️  Authority: ${metadata?.authority || 'N/A'}`);
    console.log(`   📅 Year: ${metadata?.year || 'N/A'}`);
    console.log(`   🔄 Round: ${metadata?.round || 'N/A'}\n`);
    
    // Process first 5 records for testing
    const testRecords = rawData.slice(0, 5);
    console.log('4️⃣ Testing with first 5 records...\n');
    
    let successfulMatches = 0;
    let totalCutoffs = 0;
    
    for (let i = 0; i < testRecords.length; i++) {
      const record = testRecords[i];
      console.log(`   📋 Record ${i + 1}:`);
      console.log(`      Round: ${record.round}`);
      console.log(`      Quota: ${record.quota}`);
      console.log(`      College: ${record.college_name.substring(0, 60)}...`);
      console.log(`      Course: ${record.course_name.substring(0, 50)}...`);
      console.log(`      Ranks: ${record.all_ranks}`);
      
      // Validate data
      const validation = preparer.validateCutoffData(record);
      if (!validation.isValid) {
        console.log(`      ❌ Validation failed: ${validation.errors.join(', ')}`);
        continue;
      }
      console.log(`      ✅ Validation passed`);
      
      // Test college matching
      console.log(`      🔍 Finding college match...`);
      const college = await preparer.findMatchingCollege(record.college_name);
      if (college) {
        console.log(`      ✅ College matched: ${college.name.substring(0, 50)}...`);
        console.log(`         ID: ${college.id}, Type: ${college.college_type}`);
        
        // Test program matching
        console.log(`      🔍 Finding program match...`);
        const program = await preparer.findMatchingProgram(record.course_name, college.id);
        if (program) {
          console.log(`      ✅ Program matched: ${program.name.substring(0, 50)}...`);
          console.log(`         ID: ${program.id}, Type: ${program.course_type}`);
          
          // Parse ranks
          const ranks = preparer.parseRanks(record.all_ranks);
          console.log(`      🎯 Parsed ${ranks.length} ranks:`);
          ranks.forEach(rank => {
            console.log(`         ${rank.category}: ${rank.rank}`);
          });
          
          // Count successful matches
          successfulMatches++;
          totalCutoffs += ranks.length;
          
          console.log(`      ✅ Record ${i + 1} fully processed`);
        } else {
          console.log(`      ❌ Program not found for: ${record.course_name}`);
        }
      } else {
        console.log(`      ❌ College not found for: ${record.college_name.substring(0, 50)}...`);
      }
      
      console.log(''); // Empty line for readability
    }
    
    // Summary
    console.log('5️⃣ Test Results Summary:');
    console.log(`   📊 Records processed: ${testRecords.length}`);
    console.log(`   ✅ Successful matches: ${successfulMatches}`);
    console.log(`   🎯 Total cutoffs generated: ${totalCutoffs}`);
    console.log(`   📈 Success rate: ${((successfulMatches / testRecords.length) * 100).toFixed(1)}%`);
    
    if (successfulMatches > 0) {
      console.log('\n🎉 Sample import test successful!');
      console.log('🚀 System is ready for full dataset import');
      
      // Show what would be imported
      console.log('\n📋 Sample of what would be imported:');
      console.log(`   - Authority: ${metadata?.authority}`);
      console.log(`   - Year: ${metadata?.year}`);
      console.log(`   - Round: ${metadata?.round}`);
      console.log(`   - Sample colleges: ${successfulMatches}`);
      console.log(`   - Sample cutoffs: ${totalCutoffs}`);
      
    } else {
      console.log('\n⚠️  No successful matches found');
      console.log('🔍 Review college and program matching algorithms');
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error);
    process.exit(1);
  }
}

// Run the test if this file is executed directly
if (require.main === module) {
  testSampleImport();
}

module.exports = { testSampleImport };
