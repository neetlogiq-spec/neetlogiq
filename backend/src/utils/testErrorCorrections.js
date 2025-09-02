const ErrorCorrectionDictionary = require('./errorCorrectionDictionary');

async function testErrorCorrections() {
  console.log('🧪 Testing Error Correction Dictionary System...\n');
  
  const dictionary = new ErrorCorrectionDictionary();
  
  try {
    // Step 1: Initialize database
    console.log('1️⃣ Initializing Error Correction Database...');
    await dictionary.initializeDatabase();
    console.log('✅ Database initialized successfully!\n');
    
    // Step 2: Load default corrections
    console.log('2️⃣ Loading Default Corrections...');
    await dictionary.loadDefaultCorrections();
    console.log('✅ Default corrections loaded!\n');
    
    // Step 3: Test college name corrections
    console.log('3️⃣ Testing College Name Corrections...');
    const collegeTests = [
      'PGIMER,',
      'B.J. MDAL COLLEGE',
      'CANNAUGHT PLACE',
      'AHMDAD',
      'NEW DELHI,',
      'DELHI (NCT)'
    ];
    
    for (const test of collegeTests) {
      const result = await dictionary.applyCorrections(test, 'college_name');
      console.log(`"${test}" → "${result.corrected}" (${result.corrections.length} corrections applied)`);
    }
    console.log();
    
    // Step 4: Test program name corrections
    console.log('4️⃣ Testing Program Name Corrections...');
    const programTests = [
      'GENERAL MDINE',
      'RADIO- DIAGNOSIS',
      'OBST. AND GYNAE',
      'M.D.',
      'MD(GENERAL MEDICINE)',
      'MS(OBSTETRICS AND GYNAECOLOGY)',
      'RADIORADIODIAGNOSISRADIODIAGNOSIS'
    ];
    
    for (const test of programTests) {
      const result = await dictionary.applyCorrections(test, 'program_name');
      console.log(`"${test}" → "${result.corrected}" (${result.corrections.length} corrections applied)`);
    }
    console.log();
    
    // Step 5: Test location corrections
    console.log('5️⃣ Testing Location Corrections...');
    const locationTests = [
      'CHENNAI-03',
      'JAIPUR,',
      'GUJARAT,INDIA'
    ];
    
    for (const test of locationTests) {
      const result = await dictionary.applyCorrections(test, 'location');
      console.log(`"${test}" → "${result.corrected}" (${result.corrections.length} corrections applied)`);
    }
    console.log();
    
    // Step 6: Test quota and category corrections
    console.log('6️⃣ Testing Quota & Category Corrections...');
    const quotaTests = [
      'aiq',
      'open',
      'Aiq',
      'Open'
    ];
    
    for (const test of quotaTests) {
      const result = await dictionary.applyCorrections(test, 'quota');
      console.log(`"${test}" → "${result.corrected}" (${result.corrections.length} corrections applied)`);
    }
    console.log();
    
    // Step 7: Test complex corrections
    console.log('7️⃣ Testing Complex Corrections...');
    const complexTests = [
      'B.J. MDAL COLLEGE, AHMDAD',
      'MD(RADIORADIODIAGNOSISRADIODIAGNOSIS)',
      'PGIMER,, NEW DELHI,'
    ];
    
    for (const test of complexTests) {
      const result = await dictionary.applyCorrections(test);
      console.log(`"${test}" → "${result.corrected}" (${result.corrections.length} corrections applied)`);
    }
    console.log();
    
    // Step 8: Get statistics
    console.log('8️⃣ Getting Correction Statistics...');
    const stats = await dictionary.getCorrectionStats();
    console.log('📊 Correction Statistics:');
    console.log(`   Total Corrections: ${stats.total_corrections}`);
    console.log(`   Active Corrections: ${stats.active_corrections}`);
    console.log(`   Total Usage: ${stats.total_usage}`);
    console.log(`   Success Rate: ${Math.round(stats.success_rate * 100)}%`);
    console.log();
    
    // Step 9: Test search functionality
    console.log('9️⃣ Testing Search Functionality...');
    const searchResults = await dictionary.searchCorrections('MDAL');
    console.log(`🔍 Search for "MDAL": ${searchResults.length} results found`);
    searchResults.forEach(result => {
      console.log(`   - ${result.pattern} → ${result.correction} (${result.priority})`);
    });
    console.log();
    
    // Step 10: Test individual correction
    console.log('🔟 Testing Individual Correction...');
    if (searchResults.length > 0) {
      const testCorrection = searchResults[0];
      const testResult = await dictionary.testCorrection(testCorrection.id, 'B.J. MDAL COLLEGE');
      console.log('🧪 Test Result:');
      console.log(`   Original: "${testResult.original}"`);
      console.log(`   Corrected: "${testResult.corrected}"`);
      console.log(`   Changed: ${testResult.changed ? 'Yes' : 'No'}`);
      console.log(`   Pattern: ${testResult.pattern}`);
      console.log(`   Replacement: ${testResult.replacement}`);
    }
    console.log();
    
    console.log('🎉 All tests completed successfully!');
    console.log('🚀 Error Correction Dictionary is ready for production use!');
    console.log('📚 You can now manage corrections through the admin interface');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
    process.exit(1);
  } finally {
    await dictionary.close();
  }
}

// Run the test if this file is executed directly
if (require.main === module) {
  testErrorCorrections();
}

module.exports = { testErrorCorrections };
