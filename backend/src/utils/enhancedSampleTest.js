const CutoffImportPreparer = require('./cutoffImportPreparer');
const ReferenceDataAnalyzer = require('./referenceDataAnalyzer');
const path = require('path');
const fs = require('fs');

async function enhancedSampleTest() {
  console.log('🧪 Enhanced Sample Cutoff Import Test with Reference Data Validation...\n');
  
  const preparer = new CutoffImportPreparer();
  const referenceAnalyzer = new ReferenceDataAnalyzer();
  
  try {
    // Step 1: Load reference data
    console.log('1️⃣ Loading Reference Data...');
    await referenceAnalyzer.loadReferenceData();
    
    // Step 2: Initialize system
    console.log('\n2️⃣ Initializing Import System...');
    await preparer.initialize();
    console.log('✅ System initialized successfully');
    
    // Step 3: Prepare system
    console.log('\n3️⃣ Preparing System for Import...');
    const systemReady = await preparer.prepareSystem();
    if (!systemReady) {
      throw new Error('Failed to prepare system');
    }
    console.log('✅ System prepared successfully');
    
    // Step 4: Test with sample file
    const sampleFile = '/Users/kashyapanand/Desktop/output/KEA_2024_DENTAL_R1_aggregated_20250826_132647.csv';
    
    if (!fs.existsSync(sampleFile)) {
      throw new Error(`Sample file not found: ${sampleFile}`);
    }
    
    console.log('\n4️⃣ Processing Sample File...');
    console.log(`   📁 File: ${path.basename(sampleFile)}`);
    
    // Parse the CSV file
    const rawData = await preparer.parseCSVFile(sampleFile);
    console.log(`   📊 Raw records: ${rawData.length}`);
    
    // Extract file metadata
    const metadata = preparer.extractFileMetadata(path.basename(sampleFile));
    console.log(`   🏛️  Authority: ${metadata?.authority || 'N/A'}`);
    console.log(`   📅 Year: ${metadata?.year || 'N/A'}`);
    console.log(`   🔄 Round: ${metadata?.round || 'N/A'}`);
    
    // Step 5: Test with first 20 records for comprehensive validation
    const testRecords = rawData.slice(0, 20);
    console.log(`\n5️⃣ Testing with first ${testRecords.length} records...\n`);
    
    let successfulMatches = 0;
    let totalCutoffs = 0;
    let validationResults = {
      colleges: { found: 0, notFound: 0, accuracy: 0 },
      programs: { found: 0, notFound: 0, accuracy: 0 },
      quotas: { found: 0, notFound: 0, accuracy: 0 },
      categories: { found: 0, notFound: 0, accuracy: 0 }
    };
    
    for (let i = 0; i < testRecords.length; i++) {
      const record = testRecords[i];
      console.log(`   📋 Record ${i + 1}:`);
      console.log(`      Round: ${record.round}`);
      console.log(`      Quota: ${record.quota}`);
      console.log(`      College: ${record.college_name.substring(0, 60)}...`);
      console.log(`      Course: ${record.course_name.substring(0, 50)}...`);
      console.log(`      Ranks: ${record.all_ranks}`);
      
      // Step 6: Validate against reference data
      console.log(`      🔍 Validating against reference data...`);
      const referenceValidation = referenceAnalyzer.validateCutoffData(record);
      
      if (referenceValidation.errors.length > 0) {
        console.log(`      ❌ Reference validation failed: ${referenceValidation.errors.join(', ')}`);
        validationResults.colleges.notFound++;
        continue;
      }
      
      if (referenceValidation.warnings.length > 0) {
        console.log(`      ⚠️  Reference validation warnings: ${referenceValidation.warnings.join(', ')}`);
      }
      
      if (referenceValidation.suggestions.length > 0) {
        console.log(`      💡 Reference validation: ${referenceValidation.suggestions.join(', ')}`);
      }
      
      // Step 7: Test database matching
      console.log(`      🔍 Testing database matching...`);
      
      // Test college matching
      const college = await preparer.findMatchingCollege(record.college_name);
      if (college) {
        console.log(`      ✅ College matched: ${college.name.substring(0, 50)}...`);
        console.log(`         ID: ${college.id}, Type: ${college.college_type}`);
        validationResults.colleges.found++;
        
        // Test program matching
        const program = await preparer.findMatchingProgram(record.course_name, college.id);
        if (program) {
          console.log(`      ✅ Program matched: ${program.name.substring(0, 50)}...`);
          console.log(`         ID: ${program.id}, Type: ${program.course_type}`);
          validationResults.programs.found++;
          
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
          validationResults.programs.notFound++;
        }
      } else {
        console.log(`      ❌ College not found for: ${record.college_name.substring(0, 50)}...`);
        validationResults.colleges.notFound++;
      }
      
      console.log(''); // Empty line for readability
    }
    
    // Step 8: Calculate accuracy metrics
    console.log('6️⃣ Accuracy Analysis...\n');
    
    // Calculate college accuracy
    const totalColleges = validationResults.colleges.found + validationResults.colleges.notFound;
    validationResults.colleges.accuracy = totalColleges > 0 ? (validationResults.colleges.found / totalColleges) * 100 : 0;
    
    // Calculate program accuracy
    const totalPrograms = validationResults.programs.found + validationResults.programs.notFound;
    validationResults.programs.accuracy = totalPrograms > 0 ? (validationResults.programs.found / totalPrograms) * 100 : 0;
    
    // Overall accuracy
    const overallAccuracy = (successfulMatches / testRecords.length) * 100;
    
    console.log('📊 Validation Results:');
    console.log(`   🏥 Colleges: ${validationResults.colleges.found}/${totalColleges} (${validationResults.colleges.accuracy.toFixed(1)}%)`);
    console.log(`   📚 Programs: ${validationResults.programs.found}/${totalPrograms} (${validationResults.programs.accuracy.toFixed(1)}%)`);
    console.log(`   🎯 Overall: ${successfulMatches}/${testRecords.length} (${overallAccuracy.toFixed(1)}%)`);
    console.log(`   📈 Total cutoffs: ${totalCutoffs}`);
    
    // Step 9: Recommendations
    console.log('\n7️⃣ Recommendations:');
    
    if (overallAccuracy >= 95) {
      console.log('🎉 EXCELLENT! Accuracy is 95%+ - Ready for full import!');
      console.log('🚀 Proceed with importing the complete dataset');
    } else if (overallAccuracy >= 90) {
      console.log('✅ GOOD! Accuracy is 90%+ - Minor improvements needed');
      console.log('🔧 Review failed matches and improve algorithms');
      console.log('📝 Consider manual review of unmatched records');
    } else if (overallAccuracy >= 80) {
      console.log('⚠️  FAIR! Accuracy is 80%+ - Significant improvements needed');
      console.log('🔧 Major algorithm improvements required');
      console.log('📝 Manual review of many records needed');
    } else {
      console.log('❌ POOR! Accuracy below 80% - Major issues detected');
      console.log('🔧 Complete algorithm overhaul required');
      console.log('📝 Manual review of most records needed');
      console.log('🚫 Do not proceed with import until accuracy improves');
    }
    
    // Step 10: Show specific issues if any
    if (overallAccuracy < 95) {
      console.log('\n🔍 Areas for Improvement:');
      
      if (validationResults.colleges.accuracy < 95) {
        console.log(`   🏥 College matching: ${validationResults.colleges.accuracy.toFixed(1)}% accuracy`);
        console.log(`      - Review college name variations`);
        console.log(`      - Check for OCR errors in college names`);
        console.log(`      - Verify database college entries`);
      }
      
      if (validationResults.programs.accuracy < 95) {
        console.log(`   📚 Program matching: ${validationResults.programs.accuracy.toFixed(1)}% accuracy`);
        console.log(`      - Review program name variations`);
        console.log(`      - Check for OCR errors in program names`);
        console.log(`      - Verify database program entries`);
      }
    }
    
    console.log('\n📋 Summary:');
    console.log(`   📊 Records processed: ${testRecords.length}`);
    console.log(`   ✅ Successful matches: ${successfulMatches}`);
    console.log(`   🎯 Total cutoffs generated: ${totalCutoffs}`);
    console.log(`   📈 Overall accuracy: ${overallAccuracy.toFixed(1)}%`);
    
    if (overallAccuracy >= 95) {
      console.log('\n🎉 System is ready for full dataset import!');
      console.log('🚀 Proceed with confidence');
    } else {
      console.log('\n⚠️  System needs improvement before full import');
      console.log('🔧 Focus on improving matching algorithms');
      console.log('📝 Consider manual review of failed matches');
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error);
    process.exit(1);
  }
}

// Run the test if this file is executed directly
if (require.main === module) {
  enhancedSampleTest();
}

module.exports = { enhancedSampleTest };
