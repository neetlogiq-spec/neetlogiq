const XLSX = require('xlsx');
const path = require('path');

function analyzeExcelFiles() {
  const files = ['medical.xlsx', 'dental.xlsx', 'dnb.xlsx'];
  const basePath = '/Users/kashyapanand/Desktop/DBcopy/processed_files_recursive/';

  files.forEach(file => {
    try {
      console.log(`\n📁 File: ${file}`);
      const filePath = path.join(basePath, file);
      const workbook = XLSX.readFile(filePath);
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      
      // Get all data
      const jsonData = XLSX.utils.sheet_to_json(sheet, { header: 1 });
      console.log(`📊 Total rows: ${jsonData.length - 1}`);
      
      let nonEmptyRows = 0;
      let validColleges = 0;
      let skippedRows = 0;
      let emptyRows = 0;
      
      for (let i = 1; i < jsonData.length; i++) {
        const row = jsonData[i];
        
        // Check if row is completely empty
        if (!row || row.every(cell => !cell || cell.toString().trim() === '')) {
          emptyRows++;
          continue;
        }
        
        nonEmptyRows++;
        const name = row[1] ? row[1].toString().trim() : '';
        const state = row[0] ? row[0].toString().trim() : '';
        
        if (name && state) {
          validColleges++;
        } else {
          skippedRows++;
        }
      }
      
      console.log(`  ✅ Non-empty rows: ${nonEmptyRows}`);
      console.log(`  🏫 Valid colleges: ${validColleges}`);
      console.log(`  ⚠️  Skipped rows: ${skippedRows}`);
      console.log(`  🚫 Empty rows: ${emptyRows}`);
      
      // Show some problematic rows
      console.log(`  🔍 Sample problematic rows:`);
      let problemCount = 0;
      for (let i = 1; i < jsonData.length && problemCount < 5; i++) {
        const row = jsonData[i];
        if (row && !row.every(cell => !cell || cell.toString().trim() === '')) {
          const name = row[1] ? row[1].toString().trim() : '';
          const state = row[0] ? row[0].toString().trim() : '';
          
          if (!name || !state) {
            console.log(`    Row ${i + 1}: Name="${name}", State="${state}"`);
            problemCount++;
          }
        }
      }
      
    } catch (error) {
      console.log(`❌ Error reading ${file}: ${error.message}`);
    }
  });
}

analyzeExcelFiles();
