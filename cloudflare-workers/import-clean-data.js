#!/usr/bin/env node

/**
 * Import Clean College Data from SQLite to Cloudflare D1
 * This script imports properly structured data from clean-unified.db
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { exec } from 'child_process';
import { promisify } from 'util';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const execAsync = promisify(exec);

async function importCleanData() {
  try {
    console.log('🏥 Starting clean data import from SQLite to D1...');
    
    // First, let's update the D1 schema to match the clean database
    console.log('📋 Updating D1 schema...');
    
    const schemaUpdate = `
      -- Add missing columns to colleges table
      ALTER TABLE colleges ADD COLUMN code TEXT;
      ALTER TABLE colleges ADD COLUMN district TEXT;
      ALTER TABLE colleges ADD COLUMN address TEXT;
      ALTER TABLE colleges ADD COLUMN pincode TEXT;
      ALTER TABLE colleges ADD COLUMN establishment_year INTEGER;
      ALTER TABLE colleges ADD COLUMN website TEXT;
      ALTER TABLE colleges ADD COLUMN email TEXT;
      ALTER TABLE colleges ADD COLUMN phone TEXT;
      ALTER TABLE colleges ADD COLUMN accreditation TEXT;
      ALTER TABLE colleges ADD COLUMN status TEXT DEFAULT 'active';
      ALTER TABLE colleges ADD COLUMN updated_at DATETIME DEFAULT CURRENT_TIMESTAMP;
      ALTER TABLE colleges ADD COLUMN college_type_category TEXT;
    `;
    
    // Clear existing data
    await execAsync('wrangler d1 execute neetlogiq-db --local --command="DELETE FROM colleges;"');
    console.log('🗑️ Cleared existing college data');
    
    // Export data from SQLite to CSV
    console.log('📊 Exporting data from SQLite...');
    const csvPath = path.join(__dirname, 'colleges_clean.csv');
    
    // Export to CSV with proper formatting
    await execAsync(`sqlite3 -header -csv ../backend/database/clean-unified.db "SELECT id, name, code, city, state, district, address, pincode, college_type, management_type, establishment_year, university, website, email, phone, accreditation, status, created_at, updated_at, college_type_category FROM colleges;" > "${csvPath}"`);
    
    console.log('✅ Data exported to CSV');
    
    // Read and process the CSV data
    const csvData = fs.readFileSync(csvPath, 'utf8');
    const lines = csvData.split('\n');
    const headers = lines[0].split(',');
    
    console.log(`📋 Processing ${lines.length - 1} colleges...`);
    
    // Process in batches
    const batchSize = 100;
    let imported = 0;
    
    for (let i = 1; i < lines.length; i += batchSize) {
      const batch = lines.slice(i, i + batchSize).filter(line => line.trim());
      
      if (batch.length === 0) continue;
      
      const sqlStatements = batch.map(line => {
        const values = line.split(',').map(v => v.trim().replace(/"/g, ''));
        
        // Handle CSV parsing issues
        const id = values[0] || 'NULL';
        const name = (values[1] || '').replace(/'/g, "''");
        const code = (values[2] || '').replace(/'/g, "''");
        const city = (values[3] || '').replace(/'/g, "''");
        const state = (values[4] || '').replace(/'/g, "''");
        const district = (values[5] || '').replace(/'/g, "''");
        const address = (values[6] || '').replace(/'/g, "''");
        const pincode = (values[7] || '').replace(/'/g, "''");
        const collegeType = (values[8] || 'MEDICAL').replace(/'/g, "''");
        const managementType = (values[9] || 'GOVERNMENT').replace(/'/g, "''");
        const establishmentYear = values[10] || 'NULL';
        const university = (values[11] || '').replace(/'/g, "''");
        const website = (values[12] || '').replace(/'/g, "''");
        const email = (values[13] || '').replace(/'/g, "''");
        const phone = (values[14] || '').replace(/'/g, "''");
        const accreditation = (values[15] || '').replace(/'/g, "''");
        const status = (values[16] || 'active').replace(/'/g, "''");
        const createdAt = values[17] || 'datetime("now")';
        const updatedAt = values[18] || 'datetime("now")';
        const collegeTypeCategory = (values[19] || '').replace(/'/g, "''");
        
        return `INSERT INTO colleges (id, name, code, city, state, district, address, pincode, college_type, management_type, establishment_year, university, website, email, phone, accreditation, status, created_at, updated_at, college_type_category) VALUES (${id}, '${name}', '${code}', '${city}', '${state}', '${district}', '${address}', '${pincode}', '${collegeType}', '${managementType}', ${establishmentYear}, '${university}', '${website}', '${email}', '${phone}', '${accreditation}', '${status}', '${createdAt}', '${updatedAt}', '${collegeTypeCategory}');`;
      });
      
      // Write batch to temporary file
      const batchFile = path.join(__dirname, `temp_batch_${Math.floor(i / batchSize)}.sql`);
      fs.writeFileSync(batchFile, sqlStatements.join('\n'));
      
      // Import batch to D1
      console.log(`📦 Importing batch ${Math.floor(i / batchSize) + 1}/${Math.ceil((lines.length - 1) / batchSize)} (${batch.length} colleges)...`);
      
      try {
        await execAsync(`wrangler d1 execute neetlogiq-db --local --file="${batchFile}"`);
        imported += batch.length;
        console.log(`✅ Batch imported successfully (${imported}/${lines.length - 1} total)`);
      } catch (error) {
        console.error(`❌ Error importing batch:`, error.message);
        // Continue with next batch
      }
      
      // Clean up temporary file
      fs.unlinkSync(batchFile);
    }
    
    // Clean up CSV file
    fs.unlinkSync(csvPath);
    
    console.log(`🎉 Import completed! ${imported} colleges imported successfully`);
    
    // Verify the import
    console.log('🔍 Verifying import...');
    try {
      const { stdout } = await execAsync('wrangler d1 execute neetlogiq-db --local --command="SELECT COUNT(*) as total FROM colleges;"');
      console.log('📊 Database verification:', stdout);
      
      // Show sample data
      const { stdout: sampleData } = await execAsync('wrangler d1 execute neetlogiq-db --local --command="SELECT id, name, city, state, college_type, management_type, establishment_year FROM colleges LIMIT 3;"');
      console.log('📋 Sample data:', sampleData);
      
    } catch (error) {
      console.error('❌ Error verifying import:', error.message);
    }
    
  } catch (error) {
    console.error('❌ Error importing clean data:', error);
    process.exit(1);
  }
}

// Run the import
importCleanData();
