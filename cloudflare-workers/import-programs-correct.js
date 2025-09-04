import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { exec } from 'child_process';
import { promisify } from 'util';
import { parse } from 'csv-parse/sync';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const execAsync = promisify(exec);

async function importProgramsData() {
  try {
    console.log('📚 Starting programs data import with college ID mapping...');

    // Clear existing programs data in D1
    await execAsync('wrangler d1 execute neetlogiq-db --local --command="DELETE FROM programs;"');
    console.log('🗑️ Cleared existing programs data');

    // First, create a mapping between original college IDs and D1 college IDs
    console.log('🔗 Creating college ID mapping...');
    
    // Get college mapping from original database
    const originalColleges = await execAsync('sqlite3 -header -csv ../backend/database/clean-unified.db "SELECT id, name FROM colleges ORDER BY id;"');
    const originalCollegesData = parse(originalColleges.stdout, {
      columns: true,
      skip_empty_lines: true,
      trim: true
    });

    // Get college mapping from D1 database
    const d1Colleges = await execAsync('wrangler d1 execute neetlogiq-db --local --command="SELECT id, name FROM colleges ORDER BY id;"');
    const d1CollegesData = parse(d1Colleges.stdout, {
      columns: true,
      skip_empty_lines: true,
      trim: true
    });

    // Create mapping: original_id -> d1_id
    const collegeIdMapping = new Map();
    for (let i = 0; i < originalCollegesData.length && i < d1CollegesData.length; i++) {
      const originalId = originalCollegesData[i].id;
      const d1Id = d1CollegesData[i].id;
      collegeIdMapping.set(originalId, d1Id);
    }
    
    console.log(`✅ Created mapping for ${collegeIdMapping.size} colleges`);

    // Export programs data from SQLite to CSV
    console.log('📊 Exporting programs data from SQLite...');
    const csvPath = path.join(__dirname, 'programs_clean.csv');
    
    // Map the schema: name -> course_name, and include all relevant fields
    await execAsync(`sqlite3 -header -csv ../backend/database/clean-unified.db "SELECT id, college_id, name, level, course_type, specialization, duration, entrance_exam, total_seats, fee_structure, status, created_at, updated_at FROM programs;" > "${csvPath}"`);
    console.log('✅ Data exported to CSV');

    // Read and process the CSV data
    const csvData = fs.readFileSync(csvPath, 'utf8');
    const records = parse(csvData, {
      columns: true,
      skip_empty_lines: true,
      trim: true,
      cast: (value, context) => {
        if (context.column === 'duration' && value === '') {
          return 'NULL';
        }
        if (context.column === 'total_seats' && value === '') {
          return 'NULL';
        }
        return value;
      }
    });
    
    console.log(`📋 Processing ${records.length} programs...`);

    // Process in batches
    const batchSize = 100;
    let imported = 0;
    let skipped = 0;

    for (let i = 0; i < records.length; i += batchSize) {
      const batch = records.slice(i, i + batchSize);

      if (batch.length === 0) continue;

      const sqlStatements = [];
      
      for (const record of batch) {
        const originalCollegeId = record.college_id;
        const d1CollegeId = collegeIdMapping.get(originalCollegeId);
        
        if (!d1CollegeId) {
          skipped++;
          continue; // Skip if no mapping found
        }

        const name = (record.name || '').replace(/'/g, "''");
        const level = (record.level || '').replace(/'/g, "''");
        const courseType = (record.course_type || '').replace(/'/g, "''");
        const specialization = (record.specialization || '').replace(/'/g, "''");
        const duration = record.duration === 'NULL' ? 'NULL' : `'${record.duration}'`;
        const entranceExam = (record.entrance_exam || '').replace(/'/g, "''");
        const totalSeats = record.total_seats === 'NULL' ? 'NULL' : parseInt(record.total_seats) || 'NULL';
        const feeStructure = (record.fee_structure || '').replace(/'/g, "''");
        const status = (record.status || 'active').replace(/'/g, "''");
        const createdAt = record.created_at || 'datetime("now")';
        const updatedAt = record.updated_at || 'datetime("now")';

        sqlStatements.push(`INSERT INTO programs (college_id, course_name, level, course_type, specialization, duration, entrance_exam, total_seats, fee_structure, status, created_at, updated_at) VALUES (${d1CollegeId}, '${name}', '${level}', '${courseType}', '${specialization}', ${duration}, '${entranceExam}', ${totalSeats}, '${feeStructure}', '${status}', '${createdAt}', '${updatedAt}');`);
      }

      if (sqlStatements.length === 0) {
        console.log(`⏭️ Skipping batch ${Math.floor(i / batchSize) + 1} - no valid mappings`);
        continue;
      }

      // Write batch to temporary file
      const batchFile = path.join(__dirname, `temp_batch_${Math.floor(i / batchSize)}.sql`);
      fs.writeFileSync(batchFile, sqlStatements.join('\n'));

      // Import batch to D1
      console.log(`📦 Importing batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(records.length / batchSize)} (${sqlStatements.length} programs)...`);

      try {
        await execAsync(`wrangler d1 execute neetlogiq-db --local --file="${batchFile}"`);
        imported += sqlStatements.length;
        console.log(`✅ Batch imported successfully (${imported} total, ${skipped} skipped)`);
      } catch (error) {
        console.error(`❌ Error importing batch:`, error.message);
        // Continue with next batch
      }

      // Clean up temporary file
      fs.unlinkSync(batchFile);
    }

    // Clean up CSV file
    fs.unlinkSync(csvPath);

    console.log(`🎉 Import completed! ${imported} programs imported successfully, ${skipped} skipped`);

    // Verify the import
    console.log('🔍 Verifying import...');
    try {
      const { stdout } = await execAsync('wrangler d1 execute neetlogiq-db --local --command="SELECT COUNT(*) as total FROM programs;"');
      console.log('📊 Database verification:', stdout);

      // Show sample data
      const { stdout: sampleData } = await execAsync('wrangler d1 execute neetlogiq-db --local --command="SELECT id, college_id, course_name, level, course_type FROM programs LIMIT 5;"');
      console.log('📋 Sample data:', sampleData);

    } catch (error) {
      console.error('❌ Error verifying import:', error.message);
    }

  } catch (error) {
    console.error('❌ Error importing programs data:', error);
    process.exit(1);
  }
}

// Run the import
importProgramsData();
