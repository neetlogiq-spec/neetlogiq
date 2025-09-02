const StagingCutoffImporter = require('./stagingCutoffImporter');

async function testStagingImporter() {
  console.log('🧪 Testing Staging Cutoff Importer Workflow...\n');
  
  const importer = new StagingCutoffImporter();
  
  try {
    // Step 1: Initialize staging database
    console.log('1️⃣ Initializing Staging Database...');
    await importer.initializeStagingDatabase();
    console.log('✅ Staging database initialized successfully!\n');
    
    // Step 2: Start import session
    const aiqFile = '/Users/kashyapanand/Desktop/data/counselling/AIQ PG 2024/AIQ_PG_2024_R1.xlsx';
    const fileName = 'AIQ_PG_2024_R1.xlsx';
    const fileType = 'AIQ_PG_2024';
    
    console.log('2️⃣ Starting Import Session...');
    const sessionId = await importer.startImportSession(fileName, fileType);
    console.log(`✅ Import session started with ID: ${sessionId}\n`);
    
    // Step 3: Import raw data
    console.log('3️⃣ Importing Raw Data...');
    const importResult = await importer.importRawData(aiqFile, sessionId);
    
    if (importResult.success) {
      console.log(`✅ Raw import completed: ${importResult.imported} records`);
      console.log(`⚠️  Import errors: ${importResult.errors}\n`);
    } else {
      throw new Error(`Raw import failed: ${importResult.error}`);
    }
    
    // Step 4: Process raw data
    console.log('4️⃣ Processing Raw Data...');
    const processResult = await importer.processRawData(sessionId);
    
    if (processResult.success) {
      console.log(`✅ Processing completed:`);
      console.log(`   📊 Total: ${processResult.total}`);
      console.log(`   ✅ Successful: ${processResult.successful}`);
      console.log(`   ❌ Errors: ${processResult.errors}`);
      console.log(`   📈 Success rate: ${processResult.successRate.toFixed(1)}%\n`);
    } else {
      throw new Error(`Processing failed: ${processResult.error}`);
    }
    
    // Step 5: Get processing statistics
    console.log('5️⃣ Processing Statistics...');
    const stats = await importer.getProcessingStats(sessionId);
    
    console.log('📊 Session Statistics:');
    console.log(`   📁 File: ${stats.session.file_name}`);
    console.log(`   📋 Type: ${stats.session.file_type}`);
    console.log(`   📥 Raw imported: ${stats.rawCount}`);
    console.log(`   🔄 Processed: ${stats.processedCount}`);
    console.log(`   ⏰ Started: ${stats.session.started_at}`);
    console.log(`   📊 Status: ${stats.session.status}\n`);
    
    // Step 6: Recommendations
    console.log('6️⃣ Recommendations & Next Steps:');
    
    const successRate = processResult.successRate;
    
    if (successRate >= 95) {
      console.log('🎉 EXCELLENT! Success rate is 95%+ - Ready for migration!');
      console.log('🚀 Proceed with migrating to unified database');
      console.log('💡 Consider implementing migration logic');
    } else if (successRate >= 80) {
      console.log('✅ GOOD! Success rate is 80%+ - Minor improvements needed');
      console.log('🔧 Review failed matches and improve algorithms');
      console.log('📝 Consider manual verification of unmatched records');
    } else if (successRate >= 60) {
      console.log('⚠️  FAIR! Success rate is 60%+ - Significant improvements needed');
      console.log('🔧 Major algorithm improvements required');
      console.log('📝 Manual review of many records needed');
    } else {
      console.log('❌ POOR! Success rate below 60% - Major issues detected');
      console.log('🔧 Complete algorithm overhaul required');
      console.log('📝 Manual review of most records needed');
      console.log('🚫 Do not proceed with migration until success rate improves');
    }
    
    // Step 7: Workflow Summary
    console.log('\n7️⃣ Staging Workflow Summary:');
    console.log('   📥 Raw data imported to staging database');
    console.log('   🔄 Data processed with current algorithms');
    console.log('   📊 Success rate calculated');
    console.log('   🔍 Ready for iterative improvement');
    console.log('   📝 Manual verification possible');
    console.log('   🚀 Migration ready when 95%+ achieved');
    
    // Step 8: Next Actions
    console.log('\n8️⃣ Next Actions:');
    console.log('   🔧 Improve matching algorithms based on errors');
    console.log('   📝 Review failed matches manually');
    console.log('   🔄 Re-run processing with improvements');
    console.log('   ✅ Verify matches manually if needed');
    console.log('   🚀 Migrate to unified database when ready');
    console.log('   🗑️  Reset staging database for next file');
    
    console.log('\n🎯 Staging importer is ready for iterative refinement!');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
    process.exit(1);
  } finally {
    // Close staging database
    await importer.close();
  }
}

// Run the test if this file is executed directly
if (require.main === module) {
  testStagingImporter();
}

module.exports = { testStagingImporter };
