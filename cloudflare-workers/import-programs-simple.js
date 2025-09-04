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
    console.log('📚 Starting programs data import with college name mapping...');

    // Clear existing programs data in D1
    await execAsync('wrangler d1 execute neetlogiq-db --local --command="DELETE FROM programs;"');
    console.log('🗑️ Cleared existing programs data');

    // Get college mapping by name from original database
    console.log('🔗 Getting college mapping from original database...');
    const originalColleges = await execAsync('sqlite3 -header -csv ../backend/database/clean-unified.db "SELECT id, name FROM colleges ORDER BY name;"');
    const originalCollegesData = parse(originalColleges.stdout, {
      columns: true,
      skip_empty_lines: true,
      trim: true
    });

    // Get college mapping by name from D1 database
    console.log('🔗 Getting college mapping from D1 database...');
    const d1Colleges = await execAsync('sqlite3 -header -csv .wrangler/state/v3/d1/miniflare-D1DatabaseObject/410ea2107cfcec4d95c1f97f2deeff0b9973c56db7a696a992245e60c4bf0a63.sqlite "SELECT id, name FROM colleges ORDER BY name;"');
    const d1CollegesData = parse(d1Colleges.stdout, {
      columns: true,
      skip_empty_lines: true,
      trim: true
    });

    // Create mapping: original_id -> d1_id by matching names
    const collegeIdMapping = new Map();
    let mappedCount = 0;
    
    for (const originalCollege of originalCollegesData) {
      const matchingD1College = d1CollegesData.find(d1College => 
        d1College.name.trim().toLowerCase() === originalCollege.name.trim().toLowerCase()
      );
      
      if (matchingD1College) {
        collegeIdMapping.set(parseInt(originalCollege.id), parseInt(matchingD1College.id));
        mappedCount++;
      }
    }
    
    console.log(`✅ Created mapping for ${mappedCount} colleges out of ${originalCollegesData.length}`);

    // Export programs data from SQLite to CSV
    console.log('📊 Exporting programs data from SQLite...');
    const csvPath = path.join(__dirname, 'programs_clean.csv');
    
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
        const originalCollegeId = parseInt(record.college_id);
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
