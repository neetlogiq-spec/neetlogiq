const XLSX = require('xlsx');
const path = require('path');

function debugMissingColleges() {
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
      
      // Analyze data quality issues
      let missingName = 0;
      let missingState = 0;
      let missingAddress = 0;
      let missingCourse = 0;
      let rowsWithIssues = [];
      
      for (let i = 1; i < jsonData.length; i++) {
        const row = jsonData[i];
        if (!row || row.every(cell => !cell || cell.toString().trim() === '')) continue;
        
        const state = row[0]?.toString().trim();
        const name = row[1]?.toString().trim();
        const address = row[2]?.toString().trim();
        const course = row[6]?.toString().trim() || row[5]?.toString().trim(); // Handle DNB format
        
        if (!name) missingName++;
        if (!state) missingState++;
        if (!address) missingAddress++;
        if (!course) missingCourse++;
        
        // Collect rows with issues for analysis
        if (!name || !state || !address) {
          rowsWithIssues.push({
            row: i + 1,
            name: name || 'MISSING',
            state: state || 'MISSING',
            address: address || 'MISSING',
            course: course || 'MISSING'
          });
        }
      }
      
      console.log(`  📋 Data Quality Issues:`);
      console.log(`    Missing Name: ${missingName}`);
      console.log(`    Missing State: ${missingState}`);
      console.log(`    Missing Address: ${missingAddress}`);
      console.log(`    Missing Course: ${missingCourse}`);
      
      // Show some problematic rows
      if (rowsWithIssues.length > 0) {
        console.log(`  🔍 Sample problematic rows (first 10):`);
        rowsWithIssues.slice(0, 10).forEach(issue => {
          console.log(`    Row ${issue.row}: Name="${issue.name}", State="${issue.state}", Address="${issue.address}"`);
        });
      }
      
      // Try alternative grouping strategies
      console.log(`  🔧 Testing alternative grouping strategies:`);
      
      // Strategy 1: Name + State (original)
      const nameStateMap = new Map();
      for (let i = 1; i < jsonData.length; i++) {
        const row = jsonData[i];
        if (!row || row.every(cell => !cell || cell.toString().trim() === '')) continue;
        
        const state = row[0]?.toString().trim();
        const name = row[1]?.toString().trim();
        
        if (name && state) {
          const key = `${name.toLowerCase()}_${state.toLowerCase()}`;
          if (!nameStateMap.has(key)) {
            nameStateMap.set(key, { name, state, count: 0 });
          }
          nameStateMap.get(key).count++;
        }
      }
      console.log(`    Name + State grouping: ${nameStateMap.size} colleges`);
      
      // Strategy 2: Name + State + University
      const nameStateUnivMap = new Map();
      for (let i = 1; i < jsonData.length; i++) {
        const row = jsonData[i];
        if (!row || row.every(cell => !cell || cell.toString().trim() === '')) continue;
        
        const state = row[0]?.toString().trim();
        const name = row[1]?.toString().trim();
        const university = row[3]?.toString().trim();
        
        if (name && state) {
          const key = `${name.toLowerCase()}_${state.toLowerCase()}_${(university || 'unknown').toLowerCase()}`;
          if (!nameStateUnivMap.has(key)) {
            nameStateUnivMap.set(key, { name, state, university, count: 0 });
          }
          nameStateUnivMap.get(key).count++;
        }
      }
      console.log(`    Name + State + University grouping: ${nameStateUnivMap.size} colleges`);
      
      // Strategy 3: Name + State + Management Type
      const nameStateMgmtMap = new Map();
      for (let i = 1; i < jsonData.length; i++) {
        const row = jsonData[i];
        if (!row || row.every(cell => !cell || cell.toString().trim() === '')) continue;
        
        const state = row[0]?.toString().trim();
        const name = row[1]?.toString().trim();
        const management = row[4]?.toString().trim();
        
        if (name && state) {
          const key = `${name.toLowerCase()}_${state.toLowerCase()}_${(management || 'unknown').toLowerCase()}`;
          if (!nameStateMgmtMap.has(key)) {
            nameStateMgmtMap.set(key, { name, state, management, count: 0 });
          }
          nameStateMgmtMap.get(key).count++;
        }
      }
      console.log(`    Name + State + Management grouping: ${nameStateMgmtMap.size} colleges`);
      
    } catch (error) {
      console.log(`❌ Error reading ${file}: ${error.message}`);
    }
  });
}

debugMissingColleges();
