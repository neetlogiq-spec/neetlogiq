const ProductionCutoffImporter = require('./productionCutoffImporter');

async function testProductionImporter() {
  console.log('🧪 Testing Production Cutoff Importer with AIQ File...\n');
  
  const importer = new ProductionCutoffImporter();
  
  try {
    // Step 1: Initialize the importer
    console.log('1️⃣ Initializing Production Importer...');
    const initialized = await importer.initialize();
    
    if (!initialized) {
      throw new Error('Failed to initialize importer');
    }
    
    console.log('✅ Importer initialized successfully!\n');
    
    // Step 2: Process AIQ file
    const aiqFile = '/Users/kashyapanand/Desktop/data/counselling/AIQ PG 2024/AIQ_PG_2024_R1.xlsx';
    
    console.log('2️⃣ Processing AIQ File...');
    console.log(`   📁 File: ${aiqFile}`);
    
    const result = await importer.processAIQFile(aiqFile);
    
    if (result.success) {
      console.log('\n🎉 AIQ File Processing Completed Successfully!');
      console.log(`   📊 Total records: ${result.total}`);
      console.log(`   ✅ Successful: ${result.successful}`);
      console.log(`   ❌ Errors: ${result.errors}`);
      console.log(`   📈 Success rate: ${((result.successful/result.total)*100).toFixed(1)}%`);
      
      if (result.errorDetails && result.errorDetails.length > 0) {
        console.log('\n🔍 Error Analysis:');
        console.log('   Common error patterns:');
        
        const errorPatterns = {};
        result.errorDetails.forEach(error => {
          const errorType = error.error.split(':')[0];
          errorPatterns[errorType] = (errorPatterns[errorType] || 0) + 1;
        });
        
        Object.entries(errorPatterns)
          .sort(([,a], [,b]) => b - a)
          .forEach(([pattern, count]) => {
            console.log(`      ${pattern}: ${count} occurrences`);
          });
      }
      
      // Step 3: Recommendations
      console.log('\n3️⃣ Recommendations:');
      
      const successRate = (result.successful / result.total) * 100;
      
      if (successRate >= 95) {
        console.log('🎉 EXCELLENT! Success rate is 95%+ - Ready for production import!');
        console.log('🚀 Proceed with importing the complete dataset');
        console.log('💡 Consider implementing database insertion logic');
      } else if (successRate >= 90) {
        console.log('✅ GOOD! Success rate is 90%+ - Minor improvements needed');
        console.log('🔧 Review failed matches and improve algorithms');
        console.log('📝 Consider manual review of unmatched records');
      } else if (successRate >= 80) {
        console.log('⚠️  FAIR! Success rate is 80%+ - Significant improvements needed');
        console.log('🔧 Major algorithm improvements required');
        console.log('📝 Manual review of many records needed');
      } else {
        console.log('❌ POOR! Success rate below 80% - Major issues detected');
        console.log('🔧 Complete algorithm overhaul required');
        console.log('📝 Manual review of most records needed');
        console.log('🚫 Do not proceed with import until success rate improves');
      }
      
      // Step 4: Next Steps
      console.log('\n4️⃣ Next Steps:');
      
      if (successRate >= 90) {
        console.log('   🔧 Implement database insertion logic');
        console.log('   📊 Process remaining AIQ files (R2-R5)');
        console.log('   🎯 Set up automated import pipeline');
        console.log('   📈 Monitor success rates and improve algorithms');
      } else {
        console.log('   🔍 Analyze failed matches in detail');
        console.log('   🔧 Improve matching algorithms');
        console.log('   📝 Add more OCR corrections');
        console.log('   🗺️ Enhance location awareness');
        console.log('   🔄 Retest with improved algorithms');
      }
      
    } else {
      console.error('❌ AIQ File Processing Failed:', result.error);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error);
    process.exit(1);
  }
}

// Run the test if this file is executed directly
if (require.main === module) {
  testProductionImporter();
}

module.exports = { testProductionImporter };
