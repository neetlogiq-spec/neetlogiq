const XLSX = require('xlsx');
const path = require('path');

function debugCollegeCounts() {
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
      
      // Group by college name and state
      const collegeMap = new Map();
      
      for (let i = 1; i < jsonData.length; i++) {
        const row = jsonData[i];
        if (!row || row.every(cell => !cell || cell.toString().trim() === '')) continue;
        
        const state = row[0]?.toString().trim();
        const name = row[1]?.toString().trim();
        
        if (name && state) {
          const key = `${name.toLowerCase()}_${state.toLowerCase()}`;
          if (!collegeMap.has(key)) {
            collegeMap.set(key, { name, state, count: 0 });
          }
          collegeMap.get(key).count++;
        }
      }
      
      console.log(`🏫 Unique colleges found: ${collegeMap.size}`);
      
      // Show some sample colleges with their program counts
      console.log(`  📋 Sample colleges (first 10):`);
      let count = 0;
      for (const [key, college] of collegeMap) {
        if (count < 10) {
          console.log(`    ${college.name} (${college.state}) - ${college.count} programs`);
          count++;
        } else break;
      }
      
      // Check for potential duplicates (same name, different states)
      const nameMap = new Map();
      for (const [key, college] of collegeMap) {
        const name = college.name.toLowerCase();
        if (!nameMap.has(name)) {
          nameMap.set(name, []);
        }
        nameMap.get(name).push(college.state);
      }
      
      let duplicateNames = 0;
      for (const [name, states] of nameMap) {
        if (states.length > 1) {
          duplicateNames++;
        }
      }
      
      console.log(`  🔍 Colleges with same name in different states: ${duplicateNames}`);
      
      // Show some examples of duplicates
      if (duplicateNames > 0) {
        console.log(`  📋 Sample duplicates:`);
        let count = 0;
        for (const [name, states] of nameMap) {
          if (states.length > 1 && count < 5) {
            console.log(`    "${name}" appears in: ${states.join(', ')}`);
            count++;
          }
        }
      }
      
    } catch (error) {
      console.log(`❌ Error reading ${file}: ${error.message}`);
    }
  });
}

debugCollegeCounts();
