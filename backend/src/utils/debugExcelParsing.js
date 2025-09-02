const xlsx = require('xlsx');
const path = require('path');

async function debugExcelParsing() {
  console.log('🔍 Debugging Excel File Parsing...\n');
  
  const referenceDataPath = '/Users/kashyapanand/Desktop/data/list';
  
  try {
    // Test colleges file
    console.log('1️⃣ Testing ALL COLLEGES OF INDIA.xlsx...');
    const collegesFile = path.join(referenceDataPath, 'ALL COLLEGES OF INDIA.xlsx');
    
    if (!require('fs').existsSync(collegesFile)) {
      throw new Error(`Colleges file not found: ${collegesFile}`);
    }
    
    const collegesWorkbook = xlsx.readFile(collegesFile);
    console.log('   Sheet names:', collegesWorkbook.SheetNames);
    
    const collegesSheet = collegesWorkbook.Sheets[collegesWorkbook.SheetNames[0]];
    console.log('   Sheet range:', collegesSheet['!ref']);
    
    // Try different parsing approaches
    console.log('\n   📊 Approach 1: Direct parsing (no row skipping)');
    const data1 = xlsx.utils.sheet_to_json(collegesSheet);
    console.log(`   Records found: ${data1.length}`);
    if (data1.length > 0) {
      console.log('   First record:', data1[0]);
      console.log('   Second record:', data1[1]);
      console.log('   Third record:', data1[2]);
    }
    
    // Try with row skipping
    console.log('\n   📊 Approach 2: With row skipping (start from row 2)');
    const range1 = xlsx.utils.decode_range(collegesSheet['!ref']);
    range1.s.r = 1; // Start from row 2
    collegesSheet['!ref'] = xlsx.utils.encode_range(range1);
    
    const data2 = xlsx.utils.sheet_to_json(collegesSheet);
    console.log(`   Records found: ${data2.length}`);
    if (data2.length > 0) {
      console.log('   First record:', data2[0]);
      console.log('   Second record:', data2[1]);
      console.log('   Third record:', data2[2]);
    }
    
    // Test courses file
    console.log('\n2️⃣ Testing Courses list.xlsx...');
    const coursesFile = path.join(referenceDataPath, 'Courses list.xlsx');
    
    if (!require('fs').existsSync(coursesFile)) {
      throw new Error(`Courses file not found: ${coursesFile}`);
    }
    
    const coursesWorkbook = xlsx.readFile(coursesFile);
    console.log('   Sheet names:', coursesWorkbook.SheetNames);
    
    const coursesSheet = coursesWorkbook.Sheets[coursesWorkbook.SheetNames[0]];
    console.log('   Sheet range:', coursesSheet['!ref']);
    
    // Try different parsing approaches for courses
    console.log('\n   📊 Approach 1: Direct parsing (no row skipping)');
    const coursesData1 = xlsx.utils.sheet_to_json(coursesSheet);
    console.log(`   Records found: ${coursesData1.length}`);
    if (coursesData1.length > 0) {
      console.log('   First record:', coursesData1[0]);
      console.log('   Second record:', coursesData1[1]);
      console.log('   Third record:', coursesData1[2]);
    }
    
    // Try with row skipping for courses
    console.log('\n   📊 Approach 2: With row skipping (start from row 3)');
    const range2 = xlsx.utils.decode_range(coursesSheet['!ref']);
    range2.s.r = 2; // Start from row 3
    coursesSheet['!ref'] = xlsx.utils.encode_range(range2);
    
    const coursesData2 = xlsx.utils.sheet_to_json(coursesSheet);
    console.log(`   Records found: ${coursesData2.length}`);
    if (coursesData2.length > 0) {
      console.log('   First record:', coursesData2[0]);
      console.log('   Second record:', coursesData2[1]);
      console.log('   Third record:', coursesData2[2]);
    }
    
    console.log('\n✅ Excel parsing debug completed');
    
  } catch (error) {
    console.error('❌ Debug failed:', error);
  }
}

// Run the debug if this file is executed directly
if (require.main === module) {
  debugExcelParsing();
}

module.exports = { debugExcelParsing };
