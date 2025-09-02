const xlsx = require('xlsx');
const path = require('path');

async function analyzeAIQFile() {
  console.log('🔍 Analyzing AIQ PG 2024 R1 File Structure...\n');
  
  const filePath = '/Users/kashyapanand/Desktop/data/counselling/AIQ PG 2024/AIQ_PG_2024_R1.xlsx';
  
  try {
    if (!require('fs').existsSync(filePath)) {
      throw new Error(`File not found: ${filePath}`);
    }
    
    const workbook = xlsx.readFile(filePath);
    console.log('📊 File Analysis:');
    console.log(`   📁 File: ${path.basename(filePath)}`);
    console.log(`   📋 Sheets: ${workbook.SheetNames.join(', ')}`);
    console.log(`   📏 Size: ${(require('fs').statSync(filePath).size / 1024 / 1024).toFixed(2)} MB`);
    
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    
    console.log(`\n📋 Sheet: ${sheetName}`);
    console.log(`   📍 Range: ${worksheet['!ref']}`);
    
    // Parse the data
    const data = xlsx.utils.sheet_to_json(worksheet);
    console.log(`   📊 Total rows: ${data.length}`);
    
    if (data.length > 0) {
      console.log('\n🔍 Column Analysis:');
      const firstRow = data[0];
      const columns = Object.keys(firstRow);
      
      columns.forEach((col, index) => {
        console.log(`   ${index + 1}. ${col}`);
      });
      
      console.log('\n📋 Sample Data (First 5 rows):');
      for (let i = 0; i < Math.min(5, data.length); i++) {
        console.log(`\n   Row ${i + 1}:`);
        const row = data[i];
        columns.forEach(col => {
          const value = row[col];
          if (value !== undefined && value !== null && value !== '') {
            console.log(`      ${col}: ${String(value).substring(0, 100)}${String(value).length > 100 ? '...' : ''}`);
          }
        });
      }
      
      // Analyze data patterns
      console.log('\n🔍 Data Pattern Analysis:');
      
      // Check for common patterns in college names
      const collegeColumn = columns.find(col => 
        col.toLowerCase().includes('college') || 
        col.toLowerCase().includes('institute') ||
        col.toLowerCase().includes('medical') ||
        col.toLowerCase().includes('hospital')
      );
      
      if (collegeColumn) {
        console.log(`   🏥 College column: ${collegeColumn}`);
        const collegeNames = data.slice(0, 10).map(row => row[collegeColumn]).filter(Boolean);
        console.log(`   📋 Sample colleges: ${collegeNames.join(', ')}`);
      }
      
      // Check for program/course columns
      const programColumn = columns.find(col => 
        col.toLowerCase().includes('course') || 
        col.toLowerCase().includes('program') ||
        col.toLowerCase().includes('specialty') ||
        col.toLowerCase().includes('subject')
      );
      
      if (programColumn) {
        console.log(`   📚 Program column: ${programColumn}`);
        const programs = data.slice(0, 10).map(row => row[programColumn]).filter(Boolean);
        console.log(`   📋 Sample programs: ${programs.join(', ')}`);
      }
      
      // Check for rank/score columns
      const rankColumns = columns.filter(col => 
        col.toLowerCase().includes('rank') || 
        col.toLowerCase().includes('score') ||
        col.toLowerCase().includes('mark') ||
        col.toLowerCase().includes('percentile')
      );
      
      if (rankColumns.length > 0) {
        console.log(`   🎯 Rank/Score columns: ${rankColumns.join(', ')}`);
        rankColumns.forEach(col => {
          const values = data.slice(0, 10).map(row => row[col]).filter(Boolean);
          console.log(`      ${col}: ${values.join(', ')}`);
        });
      }
      
      // Check for quota/category columns
      const quotaColumns = columns.filter(col => 
        col.toLowerCase().includes('quota') || 
        col.toLowerCase().includes('category') ||
        col.toLowerCase().includes('reservation') ||
        col.toLowerCase().includes('type')
      );
      
      if (quotaColumns.length > 0) {
        console.log(`   🏛️ Quota/Category columns: ${quotaColumns.join(', ')}`);
        quotaColumns.forEach(col => {
          const values = data.slice(0, 10).map(row => row[col]).filter(Boolean);
          console.log(`      ${col}: ${values.join(', ')}`);
        });
      }
      
      // Check for location columns
      const locationColumns = columns.filter(col => 
        col.toLowerCase().includes('state') || 
        col.toLowerCase().includes('city') ||
        col.toLowerCase().includes('location') ||
        col.toLowerCase().includes('address')
      );
      
      if (locationColumns.length > 0) {
        console.log(`   🗺️ Location columns: ${locationColumns.join(', ')}`);
        locationColumns.forEach(col => {
          const values = data.slice(0, 10).map(row => row[col]).filter(Boolean);
          console.log(`      ${col}: ${values.join(', ')}`);
        });
      }
      
      // Check for round/iteration columns
      const roundColumns = columns.filter(col => 
        col.toLowerCase().includes('round') || 
        col.toLowerCase().includes('iteration') ||
        col.toLowerCase().includes('phase') ||
        col.toLowerCase().includes('session')
      );
      
      if (roundColumns.length > 0) {
        console.log(`   🔄 Round/Iteration columns: ${roundColumns.join(', ')}`);
        roundColumns.forEach(col => {
          const values = data.slice(0, 10).map(row => row[col]).filter(Boolean);
          console.log(`      ${col}: ${values.join(', ')}`);
        });
      }
      
      // Check for year columns
      const yearColumns = columns.filter(col => 
        col.toLowerCase().includes('year') || 
        col.toLowerCase().includes('session') ||
        col.toLowerCase().includes('academic')
      );
      
      if (yearColumns.length > 0) {
        console.log(`   📅 Year columns: ${yearColumns.join(', ')}`);
        yearColumns.forEach(col => {
          const values = data.slice(0, 10).map(row => row[col]).filter(Boolean);
          console.log(`      ${col}: ${values.join(', ')}`);
        });
      }
      
      // Check for seats columns
      const seatsColumns = columns.filter(col => 
        col.toLowerCase().includes('seat') || 
        col.toLowerCase().includes('vacancy') ||
        col.toLowerCase().includes('available') ||
        col.toLowerCase().includes('total')
      );
      
      if (seatsColumns.length > 0) {
        console.log(`   🪑 Seats columns: ${seatsColumns.join(', ')}`);
        seatsColumns.forEach(col => {
          const values = data.slice(0, 10).map(row => row[col]).filter(Boolean);
          console.log(`      ${col}: ${values.join(', ')}`);
        });
      }
      
      console.log('\n📊 Summary:');
      console.log(`   📋 Total columns: ${columns.length}`);
      console.log(`   📊 Total rows: ${data.length}`);
      console.log(`   🏥 College column: ${collegeColumn || 'Not found'}`);
      console.log(`   📚 Program column: ${programColumn || 'Not found'}`);
      console.log(`   🎯 Rank columns: ${rankColumns.length}`);
      console.log(`   🏛️ Quota columns: ${quotaColumns.length}`);
      console.log(`   🗺️ Location columns: ${locationColumns.length}`);
      
    } else {
      console.log('❌ No data found in the file');
    }
    
  } catch (error) {
    console.error('❌ Analysis failed:', error);
  }
}

// Run the analysis if this file is executed directly
if (require.main === module) {
  analyzeAIQFile();
}

module.exports = { analyzeAIQFile };
