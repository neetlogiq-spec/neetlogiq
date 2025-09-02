const CutoffImportPreparer = require('./cutoffImportPreparer');
const path = require('path');

async function testCutoffImportPreparation() {
  console.log('🧪 Testing Cutoff Import Preparation System...\n');
  
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
    
    // Get current stats
    console.log('3️⃣ Getting current system stats...');
    const stats = await preparer.getImportStats();
    console.log('📊 Current System Stats:');
    console.log(`   - Colleges: ${stats.total_colleges}`);
    console.log(`   - Programs: ${stats.total_programs}`);
    console.log(`   - Cutoffs: ${stats.total_cutoffs}`);
    console.log(`   - System Ready: ${stats.system_ready ? '✅' : '❌'}\n`);
    
    // Test file metadata extraction
    console.log('4️⃣ Testing file metadata extraction...');
    const testFiles = [
      'AIQ_PG_2024_R1_aggregated_20250826_132632.csv',
      'KEA_2024_MEDICAL_R1_aggregated_20250826_132649.csv',
      'KEA_2024_DENTAL_R1_aggregated_20250826_132647.csv'
    ];
    
    testFiles.forEach(filename => {
      const metadata = preparer.extractFileMetadata(filename);
      console.log(`   📁 ${filename}:`);
      console.log(`      Authority: ${metadata?.authority || 'N/A'}`);
      console.log(`      Year: ${metadata?.year || 'N/A'}`);
      console.log(`      Round: ${metadata?.round || 'N/A'}`);
    });
    console.log('');
    
    // Test quota parsing
    console.log('5️⃣ Testing quota parsing...');
    const testQuotas = [
      'state',
      'management/paid seats quota',
      'AIQ',
      'central'
    ];
    
    testQuotas.forEach(quota => {
      const parsed = preparer.parseQuota(quota);
      console.log(`   🏷️  "${quota}" → "${parsed}"`);
    });
    console.log('');
    
    // Test rank parsing
    console.log('6️⃣ Testing rank parsing...');
    const testRanks = [
      'OPEN:71481, OPEN:79767, OPEN:85561',
      'GM:15958, SC:25000, OBC:30000',
      '2AG:24096, GM:16026, GMP:24997'
    ];
    
    testRanks.forEach(rankString => {
      const parsed = preparer.parseRanks(rankString);
      console.log(`   🎯 "${rankString}":`);
      parsed.forEach(rank => {
        console.log(`      ${rank.category}: ${rank.rank}`);
      });
    });
    console.log('');
    
    // Test college name cleaning
    console.log('7️⃣ Testing college name cleaning...');
    const testCollegeNames = [
      'A.C.S. MEDICAL COLLEGE AND HOSPITAL,A.C.S. MEDICAL COLLEGE AND HOSPITAL, TAMIL NADU, 600077',
      'A.J.INSTITUTE OF MEDICAL SCIENCES,NH 17, KUNTIKANA,MANGALORE',
      'A.J. INSTITUTE OF DENTAL SCIENCES,NH 17, KUNTIKANA,MANGALORE'
    ];
    
    testCollegeNames.forEach(name => {
      const cleaned = preparer.cleanCollegeName(name);
      console.log(`   🏥 "${name.substring(0, 50)}..." → "${cleaned.substring(0, 50)}..."`);
    });
    console.log('');
    
    // Test program name cleaning
    console.log('8️⃣ Testing program name cleaning...');
    const testProgramNames = [
      'M.D. (ANAESTHESIOLOGY)',
      'M.D. (DERM.,VENE. AND LEPROSY)/ (DERMAT OLOGY)/(SKIN AND VENEREA L DISEASE S)/(VENE REOLOG Y)',
      'M.D. ANAESTHESIA',
      'MDS. CONSERVATIVE DENTISTRY'
    ];
    
    testProgramNames.forEach(name => {
      const cleaned = preparer.cleanProgramName(name);
      console.log(`   📚 "${name.substring(0, 40)}..." → "${cleaned.substring(0, 40)}..."`);
    });
    console.log('');
    
    // Test data validation
    console.log('9️⃣ Testing data validation...');
    const testData = [
      { round: 'aiq_r1', quota: 'management', college_name: 'Test College', course_name: 'Test Course', all_ranks: 'OPEN:1000' },
      { round: 'aiq_r1', quota: 'management', college_name: 'Test College', course_name: 'Test Course' }, // Missing all_ranks
      { round: 'aiq_r1', quota: 'management', college_name: 'Test College', all_ranks: 'OPEN:1000' }, // Missing course_name
      { round: 'aiq_r1', quota: 'management', course_name: 'Test Course', all_ranks: 'OPEN:1000' } // Missing college_name
    ];
    
    testData.forEach((data, index) => {
      const validation = preparer.validateCutoffData(data);
      console.log(`   📋 Test ${index + 1}: ${validation.isValid ? '✅ Valid' : '❌ Invalid'}`);
      if (!validation.isValid) {
        console.log(`      Errors: ${validation.errors.join(', ')}`);
      }
    });
    console.log('');
    
    console.log('🎉 All tests completed successfully!');
    console.log('🚀 System is ready for cutoff import');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
    process.exit(1);
  }
}

// Run the test if this file is executed directly
if (require.main === module) {
  testCutoffImportPreparation();
}

module.exports = { testCutoffImportPreparation };
