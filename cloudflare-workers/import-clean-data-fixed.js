#!/usr/bin/env node

/**
 * Import Clean College Data from SQLite to Cloudflare D1 (Fixed Version)
 * This script properly handles CSV parsing and data import
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { exec } from 'child_process';
import { promisify } from 'util';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const execAsync = promisify(exec);

// Simple CSV parser that handles quoted fields with commas
function parseCSVLine(line) {
  const result = [];
  let current = '';
  let inQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  
  result.push(current.trim());
  return result;
}

async function importCleanData() {
  try {
    console.log('🏥 Starting clean data import from SQLite to D1...');
    
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
    const lines = csvData.split('\n').filter(line => line.trim());
    const headers = parseCSVLine(lines[0]);
    
    console.log(`📋 Processing ${lines.length - 1} colleges...`);
    console.log('📋 Headers:', headers);
    
    // Process in batches
    const batchSize = 50; // Smaller batches to avoid issues
    let imported = 0;
    
    for (let i = 1; i < lines.length; i += batchSize) {
      const batch = lines.slice(i, i + batchSize).filter(line => line.trim());
      
      if (batch.length === 0) continue;
      
      const sqlStatements = batch.map((line, index) => {
        const values = parseCSVLine(line);
        
        // Ensure we have enough values
        while (values.length < headers.length) {
          values.push('');
        }
        
        // Map values to proper variables
        const id = values[0] || 'NULL';
        const name = (values[1] || '').replace(/'/g, "''").replace(/"/g, '');
        const code = (values[2] || '').replace(/'/g, "''").replace(/"/g, '');
        const city = (values[3] || '').replace(/'/g, "''").replace(/"/g, '');
        const state = (values[4] || '').replace(/'/g, "''").replace(/"/g, '');
        const district = (values[5] || '').replace(/'/g, "''").replace(/"/g, '');
        const address = (values[6] || '').replace(/'/g, "''").replace(/"/g, '');
        const pincode = (values[7] || '').replace(/'/g, "''").replace(/"/g, '');
        const collegeType = (values[8] || 'MEDICAL').replace(/'/g, "''").replace(/"/g, '');
        const managementType = (values[9] || 'GOVERNMENT').replace(/'/g, "''").replace(/"/g, '');
        const establishmentYear = values[10] && values[10] !== 'null' && values[10] !== '' ? values[10] : 'NULL';
        const university = (values[11] || '').replace(/'/g, "''").replace(/"/g, '');
        const website = (values[12] || '').replace(/'/g, "''").replace(/"/g, '');
        const email = (values[13] || '').replace(/'/g, "''").replace(/"/g, '');
        const phone = (values[14] || '').replace(/'/g, "''").replace(/"/g, '');
        const accreditation = (values[15] || '').replace(/'/g, "''").replace(/"/g, '');
        const status = (values[16] || 'active').replace(/'/g, "''").replace(/"/g, '');
        const createdAt = values[17] || 'datetime("now")';
        const updatedAt = values[18] || 'datetime("now")';
        const collegeTypeCategory = (values[19] || '').replace(/'/g, "''").replace(/"/g, '');
        
        return `INSERT OR IGNORE INTO colleges (id, name, code, city, state, district, address, pincode, college_type, management_type, establishment_year, university, website, email, phone, accreditation, status, created_at, updated_at, college_type_category) VALUES (${id}, '${name}', '${code}', '${city}', '${state}', '${district}', '${address}', '${pincode}', '${collegeType}', '${managementType}', ${establishmentYear}, '${university}', '${website}', '${email}', '${phone}', '${accreditation}', '${status}', '${createdAt}', '${updatedAt}', '${collegeTypeCategory}');`;
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
        // Show first few lines of the problematic batch for debugging
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
