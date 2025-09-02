const sqlite3 = require('sqlite3');
const { open } = require('sqlite');
const path = require('path');
const XLSX = require('xlsx');

async function importYourExcelDataCorrected() {
  try {
    console.log('🚀 Starting corrected import with proper unique key logic...');
    
    // Database path
    const dbPath = path.join(__dirname, 'database', 'clean-unified.db');
    
    // Connect to database
    const db = await open({ 
      filename: dbPath, 
      driver: sqlite3.Database 
    });
    
    console.log('🔌 Connected to clean database');
    
    // Enable foreign keys
    await db.exec('PRAGMA foreign_keys = ON;');
    
    // Start transaction
    await db.exec('BEGIN TRANSACTION;');
    
    try {
      // Clear existing data
      console.log('\n🧹 Clearing existing data...');
      await db.exec('DELETE FROM cutoffs;');
      await db.exec('DELETE FROM programs;');
      await db.exec('DELETE FROM colleges;');
      console.log('✅ Existing data cleared');
      
      const importStats = {
        colleges: { total: 0, imported: 0, errors: 0 },
        programs: { total: 0, imported: 0, errors: 0 }
      };
      
      // Import Medical Colleges
      console.log('\n🏥 Importing Medical Colleges...');
      const medicalResult = await importFileCorrected(db, '/Users/kashyapanand/Desktop/DBcopy/processed_files_recursive/medical.xlsx', 'MEDICAL', importStats);
      
      // Import Dental Colleges
      console.log('\n🦷 Importing Dental Colleges...');
      const dentalResult = await importFileCorrected(db, '/Users/kashyapanand/Desktop/DBcopy/processed_files_recursive/dental.xlsx', 'DENTAL', importStats);
      
      // Import DNB Colleges
      console.log('\n🏥 Importing DNB Colleges...');
      const dnbResult = await importFileCorrected(db, '/Users/kashyapanand/Desktop/DBcopy/processed_files_recursive/dnb.xlsx', 'DNB', importStats);
      
      // Commit transaction
      await db.exec('COMMIT;');
      console.log('💾 Transaction committed successfully');
      
      // Print summary
      console.log('\n📊 Import Summary:');
      console.log('==================');
      console.log(`🏫 Colleges: ${importStats.colleges.imported} imported, ${importStats.colleges.errors} errors`);
      console.log(`📚 Programs: ${importStats.programs.imported} imported, ${importStats.programs.errors} errors`);
      
      // Final verification
      console.log('\n🔍 Final database verification...');
      const collegeCount = await db.get('SELECT COUNT(*) as count FROM colleges');
      const programCount = await db.get('SELECT COUNT(*) as count FROM programs');
      
      console.log(`🏫 Total colleges in database: ${collegeCount.count}`);
      console.log(`📚 Total programs in database: ${programCount.count}`);
      
      // Show breakdown by type
      const collegeBreakdown = await db.all('SELECT college_type, COUNT(*) as count FROM colleges GROUP BY college_type');
      console.log('\n🏫 College breakdown by type:');
      collegeBreakdown.forEach(row => {
        console.log(`  ${row.college_type}: ${row.count} colleges`);
      });
      
      // Show expected vs actual
      console.log('\n🎯 Expected vs Actual:');
      console.log('  Medical: Expected 848, Got', collegeBreakdown.find(r => r.college_type === 'MEDICAL')?.count || 0);
      console.log('  Dental: Expected 328, Got', collegeBreakdown.find(r => r.college_type === 'DENTAL')?.count || 0);
      console.log('  DNB: Expected 1224, Got', collegeBreakdown.find(r => r.college_type === 'DNB')?.count || 0);
      
      await db.close();
      
      console.log('\n🎉 Import completed successfully!');
      
    } catch (error) {
      // Rollback on error
      await db.exec('ROLLBACK;');
      throw error;
    }
    
  } catch (error) {
    console.error('❌ Import process failed:', error);
    process.exit(1);
  }
}

async function importFileCorrected(db, filePath, collegeType, importStats) {
  try {
    console.log(`📁 Loading file: ${path.basename(filePath)}`);
    
    // Read Excel file
    const workbook = XLSX.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    
    // Convert to JSON
    const jsonData = XLSX.utils.sheet_to_json(sheet, { header: 1 });
    const headers = jsonData[0] || [];
    
    console.log(`📋 Headers: ${headers.join(', ')}`);
    console.log(`📊 Total rows: ${jsonData.length - 1}`);
    
    // Process each row and group by college name + address (not state)
    const collegeMap = new Map(); // Map to group programs by college
    
    for (let i = 1; i < jsonData.length; i++) {
      const row = jsonData[i];
      if (!row || row.every(cell => !cell || cell.toString().trim() === '')) continue;
      
      try {
        // Extract data based on file type
        let collegeData;
        
        if (collegeType === 'MEDICAL') {
          collegeData = {
            state: row[0]?.toString().trim(),
            name: row[1]?.toString().trim(),
            address: row[2]?.toString().trim(),
            university: row[3]?.toString().trim(),
            management_type: row[4]?.toString().trim(),
            establishment_year: row[5] ? parseInt(row[5]) : null,
            course: row[6]?.toString().trim(),
            seats: row[7] ? parseInt(row[7]) : 0
          };
        } else if (collegeType === 'DENTAL') {
          collegeData = {
            state: row[0]?.toString().trim(),
            name: row[1]?.toString().trim(),
            address: row[2]?.toString().trim(),
            university: row[3]?.toString().trim(),
            management_type: row[4]?.toString().trim(),
            establishment_year: row[5] ? parseInt(row[5]) : null,
            course: row[6]?.toString().trim(),
            seats: row[7] ? parseInt(row[7]) : 0
          };
        } else if (collegeType === 'DNB') {
          collegeData = {
            state: row[0]?.toString().trim(),
            name: row[1]?.toString().trim(),
            address: row[2]?.toString().trim(),
            university: row[3]?.toString().trim(),
            management_type: row[4]?.toString().trim(),
            establishment_year: null, // DNB doesn't have this
            course: row[5]?.toString().trim(),
            seats: row[7] ? parseInt(row[7]) : 0
          };
        }
        
        // Skip if essential data is missing
        if (!collegeData.name || !collegeData.state) {
          console.log(`⚠️  Skipping row ${i + 1}: Missing name or state`);
          continue;
        }
        
        // Clean and standardize data
        const cleanedCollege = cleanCollegeData(collegeData, collegeType);
        
        // Use college name + address as unique key (not state)
        const collegeKey = `${cleanedCollege.name.toLowerCase()}_${cleanedCollege.address.toLowerCase()}`;
        
        // Add or update college in map
        if (!collegeMap.has(collegeKey)) {
          collegeMap.set(collegeKey, {
            ...cleanedCollege,
            programs: []
          });
        }
        
        // Add program to college
        if (collegeData.course) {
          collegeMap.get(collegeKey).programs.push({
            course: collegeData.course,
            seats: collegeData.seats
          });
        }
        
      } catch (error) {
        console.log(`⚠️  Error processing row ${i + 1}: ${error.message}`);
        importStats.colleges.errors++;
      }
    }
    
    console.log(`🏫 Unique colleges found: ${collegeMap.size}`);
    
    // Count total programs
    let totalPrograms = 0;
    for (const [key, college] of collegeMap) {
      totalPrograms += college.programs.length;
    }
    console.log(`📚 Total programs found: ${totalPrograms}`);
    
    // Show some sample colleges to verify uniqueness
    console.log(`  📋 Sample unique colleges (first 5):`);
    let count = 0;
    for (const [key, college] of collegeMap) {
      if (count < 5) {
        console.log(`    ${college.name} - ${college.address} (${college.state})`);
        count++;
      } else break;
    }
    
    // Import colleges first
    const collegeIdMap = new Map(); // Map from college key to database ID
    
    for (const [key, college] of collegeMap) {
      try {
        const result = await db.run(`
          INSERT INTO colleges (
            name, city, state, college_type, management_type, 
            establishment_year, university, address, status
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'active')
        `, [
          college.name,
          college.city,
          college.state,
          college.college_type,
          college.management_type,
          college.establishment_year,
          college.university,
          college.address
        ]);
        
        collegeIdMap.set(key, result.lastID);
        importStats.colleges.imported++;
        
      } catch (error) {
        console.log(`❌ Error inserting college ${college.name}: ${error.message}`);
        importStats.colleges.errors++;
      }
    }
    
    // Import programs
    for (const [key, college] of collegeMap) {
      const collegeId = collegeIdMap.get(key);
      if (!collegeId) continue;
      
      for (const program of college.programs) {
        try {
          // Determine program details based on course name
          const programDetails = getProgramDetails(program.course, college.college_type);
          
          await db.run(`
            INSERT INTO programs (
              college_id, name, level, course_type, specialization,
              duration, entrance_exam, total_seats, status
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'active')
          `, [
            collegeId,
            programDetails.name,
            programDetails.level,
            programDetails.course_type,
            programDetails.specialization,
            programDetails.duration,
            programDetails.entrance_exam,
            program.seats || 0
          ]);
          
          importStats.programs.imported++;
          
        } catch (error) {
          console.log(`❌ Error inserting program ${program.course}: ${error.message}`);
          importStats.programs.errors++;
        }
      }
    }
    
    return { colleges: collegeMap.size, programs: totalPrograms };
    
  } catch (error) {
    console.error(`❌ Error importing file ${filePath}: ${error.message}`);
    throw error;
  }
}

function cleanCollegeData(data, collegeType) {
  // Extract city from address
  let city = 'Unknown';
  if (data.address) {
    const addressParts = data.address.split(',').map(part => part.trim());
    city = addressParts[0] || 'Unknown';
  }
  
  // Standardize management type
  let managementType = 'PRIVATE';
  if (data.management_type) {
    const management = data.management_type.toUpperCase();
    if (management.includes('GOVERNMENT') || management.includes('GOVT')) {
      managementType = 'GOVERNMENT';
    } else if (management.includes('TRUST')) {
      managementType = 'TRUST';
    } else if (management.includes('DEEMED')) {
      managementType = 'DEEMED';
    } else if (management.includes('AUTONOMOUS')) {
      managementType = 'AUTONOMOUS';
    }
  }
  
  // Standardize state names
  const state = standardizeStateName(data.state);
  
  return {
    name: data.name,
    city: city,
    state: state,
    college_type: collegeType,
    management_type: managementType,
    establishment_year: data.establishment_year,
    university: data.university || null,
    address: data.address || null
  };
}

function getProgramDetails(courseName, collegeType) {
  const course = courseName.toUpperCase();
  
  // Default values
  let name = courseName;
  let level = 'UG';
  let course_type = collegeType;
  let specialization = null;
  let duration = null;
  let entrance_exam = 'NEET';
  
  // Determine level and details based on course name
  if (course.includes('MBBS')) {
    name = 'MBBS';
    level = 'UG';
    duration = 66;
    entrance_exam = 'NEET';
  } else if (course.includes('BDS')) {
    name = 'BDS';
    level = 'UG';
    duration = 60;
    entrance_exam = 'NEET';
  } else if (course.includes('MD') || course.includes('MS')) {
    level = 'PG';
    duration = 36;
    entrance_exam = 'NEET-PG';
    
    // Extract specialization
    if (course.includes('GENERAL MEDICINE')) {
      specialization = 'General Medicine';
    } else if (course.includes('SURGERY')) {
      specialization = 'General Surgery';
    } else if (course.includes('PEDIATRICS')) {
      specialization = 'Pediatrics';
    } else if (course.includes('OBSTETRICS')) {
      specialization = 'Obstetrics & Gynecology';
    } else if (course.includes('ORTHOPEDICS')) {
      specialization = 'Orthopedics';
    }
  } else if (course.includes('DNB')) {
    name = 'DNB';
    level = 'PG';
    duration = 36;
    entrance_exam = 'NEET-PG';
  }
  
  return {
    name,
    level,
    course_type,
    specialization,
    duration,
    entrance_exam
  };
}

function standardizeStateName(stateName) {
  if (!stateName) return 'Unknown';
  
  const stateMappings = {
    'AP': 'Andhra Pradesh',
    'AR': 'Arunachal Pradesh',
    'AS': 'Assam',
    'BR': 'Bihar',
    'CG': 'Chhattisgarh',
    'GA': 'Goa',
    'GJ': 'Gujarat',
    'HR': 'Haryana',
    'HP': 'Himachal Pradesh',
    'JH': 'Jharkhand',
    'KA': 'Karnataka',
    'KL': 'Kerala',
    'MP': 'Madhya Pradesh',
    'MH': 'Maharashtra',
    'MN': 'Manipur',
    'ML': 'Meghalaya',
    'MZ': 'Mizoram',
    'NL': 'Nagaland',
    'OD': 'Odisha',
    'PB': 'Punjab',
    'RJ': 'Rajasthan',
    'SK': 'Sikkim',
    'TN': 'Tamil Nadu',
    'TS': 'Telangana',
    'TR': 'Tripura',
    'UP': 'Uttar Pradesh',
    'UK': 'Uttarakhand',
    'WB': 'West Bengal',
    'DL': 'Delhi',
    'JK': 'Jammu and Kashmir',
    'LA': 'Ladakh',
    'CH': 'Chandigarh',
    'DN': 'Dadra and Nagar Haveli and Daman and Diu',
    'LD': 'Lakshadweep',
    'PY': 'Puducherry',
    'AN': 'Andaman and Nicobar Islands'
  };
  
  // Check if it's a code
  if (stateMappings[stateName.toUpperCase()]) {
    return stateMappings[stateName.toUpperCase()];
  }
  
  // Check if it's a full name
  const upperState = stateName.toUpperCase();
  for (const [code, name] of Object.entries(stateMappings)) {
    if (name.toUpperCase() === upperState) {
      return name;
    }
  }
  
  return stateName;
}

// Run if called directly
if (require.main === module) {
  importYourExcelDataCorrected();
}

module.exports = { importYourExcelDataCorrected };
