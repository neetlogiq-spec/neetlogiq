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
    console.log('📚 Starting programs data import from SQLite to D1...');

    // Clear existing programs data in D1
    await execAsync('wrangler d1 execute neetlogiq-db --local --command="DELETE FROM programs;"');
    console.log('🗑️ Cleared existing programs data');

    // Export data from SQLite to CSV
    console.log('📊 Exporting programs data from SQLite...');
    const csvPath = path.join(__dirname, 'programs_clean.csv');
    // Map the schema: name -> course_name, and include all relevant fields
    await execAsync(`sqlite3 -header -csv ../backend/database/clean-unified.db "SELECT id, college_id, name as course_name, level, course_type as stream, specialization as branch, duration, entrance_exam, total_seats, fee_structure, status, created_at, updated_at FROM programs;" > "${csvPath}"`);
    console.log('✅ Programs data exported to CSV');

    // Read and process the CSV data
    const csvData = fs.readFileSync(csvPath, 'utf8');
    const records = parse(csvData, {
      columns: true,
      skip_empty_lines: true,
      trim: true,
      cast: (value, context) => {
        if (context.column === 'duration' && value === '') {
          return 'NULL'; // Handle empty duration
        }
        if (context.column === 'total_seats' && value === '') {
          return 'NULL'; // Handle empty total_seats
        }
        return value;
      }
    });
    console.log(`📋 Processing ${records.length} programs...`);
    console.log('📋 Headers:', Object.keys(records[0]));

    // Process in batches
    const batchSize = 100;
    let imported = 0;

    for (let i = 0; i < records.length; i += batchSize) {
      const batch = records.slice(i, i + batchSize);

      if (batch.length === 0) continue;

      const sqlStatements = batch.map(record => {
        const id = record.id || 'NULL';
        const collegeId = record.college_id || 'NULL';
        const courseName = (record.course_name || '').replace(/'/g, "''");
        const level = (record.level || '').replace(/'/g, "''");
        const stream = (record.stream || '').replace(/'/g, "''");
        const branch = (record.branch || '').replace(/'/g, "''");
        const duration = record.duration === 'NULL' ? 'NULL' : parseInt(record.duration) || 'NULL';
        const entranceExam = (record.entrance_exam || '').replace(/'/g, "''");
        const totalSeats = record.total_seats === 'NULL' ? 'NULL' : parseInt(record.total_seats) || 'NULL';
        const feeStructure = (record.fee_structure || '').replace(/'/g, "''");
        const status = (record.status || 'active').replace(/'/g, "''");
        const createdAt = record.created_at || 'datetime("now")';
        const updatedAt = record.updated_at || 'datetime("now")';

        return `INSERT INTO programs (id, college_id, course_name, level, stream, branch, duration, entrance_exam, total_seats, fee_structure, status, created_at, updated_at) VALUES (${id}, ${collegeId}, '${courseName}', '${level}', '${stream}', '${branch}', ${duration}, '${entranceExam}', ${totalSeats}, '${feeStructure}', '${status}', '${createdAt}', '${updatedAt}');`;
      });

      // Write batch to temporary file
      const batchFile = path.join(__dirname, `temp_programs_batch_${Math.floor(i / batchSize)}.sql`);
      fs.writeFileSync(batchFile, sqlStatements.join('\n'));

      // Import batch to D1
      console.log(`📦 Importing programs batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(records.length / batchSize)} (${batch.length} programs)...`);

      try {
        await execAsync(`wrangler d1 execute neetlogiq-db --local --file="${batchFile}"`);
        imported += batch.length;
        console.log(`✅ Batch imported successfully (${imported}/${records.length} total)`);
      } catch (error) {
        console.error(`❌ Error importing batch:`, error.message);
        console.log('🔍 First few lines of batch:');
        sqlStatements.slice(0, 3).forEach((stmt, idx) => {
          console.log(`${idx + 1}: ${stmt.substring(0, 100)}...`);
        });
        // Continue with next batch
      }

      // Clean up temporary file
      fs.unlinkSync(batchFile);
    }

    // Clean up CSV file
    fs.unlinkSync(csvPath);

    console.log(`🎉 Programs import completed! ${imported} programs imported successfully`);

    // Verify the import
    console.log('🔍 Verifying programs import...');
    try {
      const { stdout } = await execAsync('wrangler d1 execute neetlogiq-db --local --command="SELECT COUNT(*) as total FROM programs;"');
      console.log('📊 Programs database verification:', stdout);

      // Show sample data
      const { stdout: sampleData } = await execAsync('wrangler d1 execute neetlogiq-db --local --command="SELECT id, college_id, course_name, level, stream, duration FROM programs LIMIT 5;"');
      console.log('📋 Sample programs data:', sampleData);

    } catch (error) {
      console.error('❌ Error verifying programs import:', error.message);
    }

  } catch (error) {
    console.error('❌ Error importing programs data:', error);
    process.exit(1);
  }
}

// Run the import
importProgramsData();
