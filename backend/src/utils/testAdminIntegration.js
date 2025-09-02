const StagingCutoffImporter = require('./stagingCutoffImporter');

async function testAdminIntegration() {
  console.log('🧪 Testing Admin Integration with Staging Importer...\n');
  
  const importer = new StagingCutoffImporter();
  
  try {
    // Step 1: Initialize staging database
    console.log('1️⃣ Initializing Staging Database...');
    await importer.initializeStagingDatabase();
    console.log('✅ Staging database initialized successfully!\n');
    
    // Step 2: Test reference data loading
    console.log('2️⃣ Testing Reference Data Loading...');
    await importer.loadReferenceData();
    console.log(`✅ Reference data loaded: ${importer.colleges.size} colleges, ${importer.programs.size} programs\n`);
    
    // Step 3: Test college matching
    console.log('3️⃣ Testing College Matching...');
    const testColleges = [
      'PGIMER',
      'DR. RML HOSPITAL',
      'B.J. MEDICAL COLLEGE',
      'MADRAS MEDICAL COLLEGE'
    ];
    
    for (const college of testColleges) {
      const match = await importer.findMatchingCollege(college);
      if (match) {
        console.log(`✅ "${college}" → "${match.name}" (${match.type})`);
      } else {
        console.log(`❌ "${college}" → No match found`);
      }
    }
    console.log();
    
    // Step 4: Test program matching
    console.log('4️⃣ Testing Program Matching...');
    const testPrograms = [
      'MD(GENERAL MEDICINE)',
      'MD(RADIODIAGNOSIS)',
      'MS(GENERAL SURGERY)',
      'MD(ANESTHESIOLOGY)'
    ];
    
    for (const program of testPrograms) {
      const match = await importer.findMatchingProgram(program);
      if (match) {
        console.log(`✅ "${program}" → "${match.name}"`);
      } else {
        console.log(`❌ "${program}" → No match found`);
      }
    }
    console.log();
    
    // Step 5: Test data cleaning
    console.log('5️⃣ Testing Data Cleaning...');
    const testData = {
      college_institute: 'B.J. MDAL COLLEGE, AHMDAD',
      course: 'MD(RADIORADIODIAGNOSISRADIODIAGNOSIS)',
      quota: 'AIQ',
      category: 'OPEN',
      round: 'R1',
      year: 2024
    };
    
    const cleaned = importer.cleanRawData(testData);
    console.log('Original:', testData);
    console.log('Cleaned:', cleaned);
    console.log();
    
    // Step 6: Test session creation
    console.log('6️⃣ Testing Session Creation...');
    const sessionId = await importer.startImportSession('test_file.xlsx', 'TEST');
    console.log(`✅ Session created with ID: ${sessionId}\n`);
    
    // Step 7: Test raw data insertion
    console.log('7️⃣ Testing Raw Data Insertion...');
    const testRecord = {
      'ALL INDIA RANK': '1500',
      'QUOTA': 'AIQ',
      'COLLEGE/INSTITUTE': 'PGIMER',
      'COURSE': 'MD(GENERAL MEDICINE)',
      'CATEGORY': 'OPEN',
      'ROUND': 'R1',
      'YEAR': '2024'
    };
    
    const rawId = await importer.insertRawRecord(testRecord, sessionId, 1);
    console.log(`✅ Raw record inserted with ID: ${rawId}\n`);
    
    // Step 8: Test processing
    console.log('8️⃣ Testing Data Processing...');
    const processResult = await importer.processRawData(sessionId);
    console.log('✅ Processing completed:', processResult);
    console.log();
    
    // Step 9: Test statistics
    console.log('9️⃣ Testing Statistics...');
    const stats = await importer.getProcessingStats(sessionId);
    console.log('📊 Session Statistics:', stats);
    console.log();
    
    console.log('🎉 All tests completed successfully!');
    console.log('🚀 Admin interface is ready to use!');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
    process.exit(1);
  } finally {
    await importer.close();
  }
}

// Run the test if this file is executed directly
if (require.main === module) {
  testAdminIntegration();
}

module.exports = { testAdminIntegration };
