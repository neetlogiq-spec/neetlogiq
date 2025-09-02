const sqlite3 = require('sqlite3');
const { open } = require('sqlite');
const path = require('path');
const ExcelImporter = require('./utils/excel-importer');

async function importExcelData() {
  try {
    console.log('🚀 Starting Excel data import process...');
    
    // Initialize Excel importer
    const dbPath = path.join(__dirname, 'database', 'clean-unified.db');
    const importer = new ExcelImporter(dbPath);
    
    // Connect to database
    const db = await open({ 
      filename: dbPath, 
      driver: sqlite3.Database 
    });
    
    console.log('🔌 Connected to clean database');
    
    // Example usage - you'll need to provide the actual Excel file path
    const excelFilePath = process.argv[2];
    
    if (!excelFilePath) {
      console.log('\n📋 Usage: node import-excel-data.js <path-to-excel-file>');
      console.log('\n📁 Expected Excel structure:');
      console.log('  Sheet 1: Colleges (college details)');
      console.log('  Sheet 2: Programs (course information)');
      console.log('  Sheet 3: Cutoffs (optional - quota data)');
      console.log('\n📊 Required columns for Colleges sheet:');
      console.log('  - name, city, state, college_type, management_type');
      console.log('  - Optional: code, district, address, pincode, establishment_year, university, website, email, phone, accreditation');
      console.log('\n📊 Required columns for Programs sheet:');
      console.log('  - college_name, program_name, level, course_type, entrance_exam');
      console.log('  - Optional: specialization, duration, total_seats, fee_structure');
      return;
    }
    
    // Load Excel file
    const loaded = await importer.loadExcelFile(excelFilePath);
    if (!loaded) {
      console.error('❌ Failed to load Excel file');
      return;
    }
    
    // Process Colleges sheet
    console.log('\n🏫 Processing Colleges sheet...');
    const collegesData = importer.getSheetData('Colleges');
    if (collegesData.length > 0) {
      importer.importStats.colleges.total = collegesData.length;
      
      // Clean and validate data
      const cleanedColleges = importer.cleanData(collegesData, 'colleges');
      const collegeErrors = importer.validateCollegeData(cleanedColleges);
      
      if (collegeErrors.length > 0) {
        console.log(`⚠️  Found ${collegeErrors.length} validation errors in colleges data`);
        importer.validationErrors.push(...collegeErrors);
        importer.importStats.colleges.errors = collegeErrors.length;
      }
      
      // Import valid colleges
      const validColleges = cleanedColleges.filter((_, index) => 
        !collegeErrors.some(error => error.row === index + 2)
      );
      
      console.log(`📝 Importing ${validColleges.length} valid colleges...`);
      
      for (const college of validColleges) {
        try {
          await db.run(`
            INSERT INTO colleges (
              name, code, city, state, district, address, pincode,
              college_type, management_type, establishment_year, university,
              website, email, phone, accreditation, status
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'active')
          `, [
            college.name,
            college.code || null,
            college.city,
            college.state,
            college.district || null,
            college.address || null,
            college.pincode || null,
            college.college_type,
            college.management_type,
            college.establishment_year || null,
            college.university || null,
            college.website || null,
            college.email || null,
            college.phone || null,
            college.accreditation || null
          ]);
          
          importer.importStats.colleges.imported++;
        } catch (error) {
          console.error(`❌ Error importing college ${college.name}: ${error.message}`);
          importer.importStats.colleges.errors++;
        }
      }
    }
    
    // Process Programs sheet
    console.log('\n📚 Processing Programs sheet...');
    const programsData = importer.getSheetData('Programs');
    if (programsData.length > 0) {
      importer.importStats.programs.total = programsData.length;
      
      // Clean and validate data
      const cleanedPrograms = importer.cleanData(programsData, 'programs');
      const programErrors = importer.validateProgramData(cleanedPrograms);
      
      if (programErrors.length > 0) {
        console.log(`⚠️  Found ${programErrors.length} validation errors in programs data`);
        importer.validationErrors.push(...programErrors);
        importer.importStats.programs.errors = programErrors.length;
      }
      
      // Import valid programs
      const validPrograms = cleanedPrograms.filter((_, index) => 
        !programErrors.some(error => error.row === index + 2)
      );
      
      console.log(`📝 Importing ${validPrograms.length} valid programs...`);
      
      for (const program of validPrograms) {
        try {
          // Find college ID by name
          const college = await db.get('SELECT id FROM colleges WHERE name = ?', [program.college_name]);
          
          if (!college) {
            console.warn(`⚠️  College not found: ${program.college_name}`);
            importer.importStats.programs.errors++;
            continue;
          }
          
          await db.run(`
            INSERT INTO programs (
              college_id, name, level, course_type, specialization,
              duration, entrance_exam, total_seats, fee_structure, status
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'active')
          `, [
            college.id,
            program.program_name,
            program.level,
            program.course_type,
            program.specialization || null,
            program.duration || null,
            program.entrance_exam,
            program.total_seats || 0,
            program.fee_structure || null
          ]);
          
          importer.importStats.programs.imported++;
        } catch (error) {
          console.error(`❌ Error importing program ${program.program_name}: ${error.message}`);
          importer.importStats.programs.errors++;
        }
      }
    }
    
    // Process Cutoffs sheet (if exists)
    console.log('\n📊 Processing Cutoffs sheet...');
    const cutoffsData = importer.getSheetData('Cutoffs');
    if (cutoffsData.length > 0) {
      importer.importStats.cutoffs.total = cutoffsData.length;
      console.log(`📝 Found ${cutoffsData.length} cutoff records`);
      console.log('💡 Cutoff data will be imported when you have official quota data');
    }
    
    // Close database
    await db.close();
    
    // Generate and display report
    importer.printSummary();
    
    // Export validation errors if any
    if (importer.validationErrors.length > 0) {
      const errorReportPath = path.join(__dirname, 'validation-errors.csv');
      await importer.exportValidationErrors(errorReportPath);
    }
    
    // Final verification
    console.log('\n🔍 Final database verification...');
    const verifyDb = await open({ 
      filename: dbPath, 
      driver: sqlite3.Database 
    });
    
    const collegeCount = await verifyDb.get('SELECT COUNT(*) as count FROM colleges');
    const programCount = await verifyDb.get('SELECT COUNT(*) as count FROM programs');
    const cutoffCount = await verifyDb.get('SELECT COUNT(*) as count FROM cutoffs');
    
    console.log(`🏫 Colleges in database: ${collegeCount.count}`);
    console.log(`📚 Programs in database: ${programCount.count}`);
    console.log(`📊 Cutoffs in database: ${cutoffCount.count}`);
    
    await verifyDb.close();
    
    console.log('\n🎉 Excel data import completed!');
    
  } catch (error) {
    console.error('❌ Import process failed:', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  importExcelData();
}

module.exports = { importExcelData };
