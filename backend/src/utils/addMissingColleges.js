const CutoffImportPreparer = require('./cutoffImportPreparer');
const path = require('path');
const fs = require('fs');

async function addMissingColleges() {
  console.log('🏥 Adding Missing Colleges from Cutoff Dataset...\n');
  
  const preparer = new CutoffImportPreparer();
  
  try {
    // Initialize the system
    console.log('1️⃣ Initializing system...');
    await preparer.initialize();
    console.log('✅ System initialized successfully\n');
    
    // Test with the dental file to find missing colleges
    const sampleFile = '/Users/kashyapanand/Desktop/output/KEA_2024_DENTAL_R1_aggregated_20250826_132647.csv';
    
    if (!fs.existsSync(sampleFile)) {
      throw new Error(`Sample file not found: ${sampleFile}`);
    }
    
    console.log('2️⃣ Processing file to find unique colleges...');
    const rawData = await preparer.parseCSVFile(sampleFile);
    console.log(`   📊 Total records: ${rawData.length}`);
    
    // Extract unique colleges
    const uniqueColleges = new Map();
    rawData.forEach(record => {
      const mainCollegeName = record.college_name.split(',')[0].trim();
      if (!uniqueColleges.has(mainCollegeName)) {
        uniqueColleges.set(mainCollegeName, {
          name: mainCollegeName,
          full_name: record.college_name,
          quota: record.quota,
          round: record.round
        });
      }
    });
    
    console.log(`   🏥 Unique colleges found: ${uniqueColleges.size}\n`);
    
    // Check which colleges exist in database
    console.log('3️⃣ Checking existing colleges in database...\n');
    
    const missingColleges = [];
    const existingColleges = [];
    
    for (const [collegeName, collegeData] of uniqueColleges) {
      console.log(`   🔍 Checking: ${collegeName}`);
      
      const college = await preparer.findMatchingCollege(collegeData.full_name);
      if (college) {
        console.log(`      ✅ Found: ${college.name} (ID: ${college.id}, Type: ${college.college_type})`);
        existingColleges.push({
          csv_name: collegeName,
          db_name: college.name,
          db_id: college.id,
          db_type: college.college_type
        });
      } else {
        console.log(`      ❌ Missing: ${collegeName}`);
        missingColleges.push(collegeData);
      }
    }
    
    // Summary
    console.log('\n4️⃣ Summary:');
    console.log(`   📊 Total unique colleges: ${uniqueColleges.size}`);
    console.log(`   ✅ Existing in database: ${existingColleges.length}`);
    console.log(`   ❌ Missing from database: ${missingColleges.length}`);
    
    if (missingColleges.length > 0) {
      console.log('\n📋 Missing colleges:');
      missingColleges.forEach((college, index) => {
        console.log(`   ${index + 1}. ${college.name}`);
        console.log(`      Full name: ${college.full_name}`);
        console.log(`      Quota: ${college.quota}, Round: ${college.round}`);
      });
      
      console.log('\n💡 Recommendation:');
      console.log('   These colleges need to be added to the database before import.');
      console.log('   You can either:');
      console.log('   1. Add them manually through the admin interface');
      console.log('   2. Create a bulk import script for colleges');
      console.log('   3. Update the college names in the CSV to match existing ones');
      
    } else {
      console.log('\n🎉 All colleges are present in the database!');
      console.log('🚀 Ready for full cutoff import');
    }
    
    // Show existing college matches
    if (existingColleges.length > 0) {
      console.log('\n📋 Existing college matches:');
      existingColleges.forEach((match, index) => {
        console.log(`   ${index + 1}. CSV: "${match.csv_name}"`);
        console.log(`      → DB: "${match.db_name}" (ID: ${match.db_id}, Type: ${match.db_type})`);
      });
    }
    
  } catch (error) {
    console.error('❌ Process failed:', error);
    process.exit(1);
  }
}

// Run the function if this file is executed directly
if (require.main === module) {
  addMissingColleges();
}

module.exports = { addMissingColleges };
