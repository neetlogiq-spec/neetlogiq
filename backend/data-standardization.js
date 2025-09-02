const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Database path
const dbPath = path.join(__dirname, 'database', 'clean-unified.db');

// Standard state names mapping (35 states + UTs of India)
const STANDARD_STATES = {
  // Union Territories
  'ANDAMAN NICOBAR ISLANDS': 'Andaman and Nicobar Islands',
  'Andaman and Nicobar Islands': 'Andaman and Nicobar Islands',
  'CHANDIGARH': 'Chandigarh',
  'Chandigarh': 'Chandigarh',
  'DADRA AND NAGAR HAVELI': 'Dadra and Nagar Haveli',
  'DAMAN & DIU': 'Daman and Diu',
  'DELHI (NCT)': 'Delhi',
  'Delhi': 'Delhi',
  'JAMMU & KASHMIR': 'Jammu and Kashmir',
  'Jammu and Kashmir': 'Jammu and Kashmir',
  'LADAKH': 'Ladakh',
  'Ladakh': 'Ladakh',
  'PONDICHERRY': 'Puducherry',
  'Puducherry': 'Puducherry',
  
  // States
  'ANDHRA PRADESH': 'Andhra Pradesh',
  'Andhra Pradesh': 'Andhra Pradesh',
  'ARUNACHAL PRADESH': 'Arunachal Pradesh',
  'Arunachal Pradesh': 'Arunachal Pradesh',
  'ASSAM': 'Assam',
  'Assam': 'Assam',
  'BIHAR': 'Bihar',
  'Bihar': 'Bihar',
  'CHATTISGARH': 'Chhattisgarh',
  'Chhattisgarh': 'Chhattisgarh',
  'GOA': 'Goa',
  'Goa': 'Goa',
  'GUJARAT': 'Gujarat',
  'Gujarat': 'Gujarat',
  'HARYANA': 'Haryana',
  'Haryana': 'Haryana',
  'HIMACHAL PRADESH': 'Himachal Pradesh',
  'Himachal Pradesh': 'Himachal Pradesh',
  'JHARKHAND': 'Jharkhand',
  'Jharkhand': 'Jharkhand',
  'KARNATAKA': 'Karnataka',
  'Karnataka': 'Karnataka',
  'KERALA': 'Kerala',
  'Kerala': 'Kerala',
  'MADHYA PRADESH': 'Madhya Pradesh',
  'Madhya Pradesh': 'Madhya Pradesh',
  'MAHARASHTRA': 'Maharashtra',
  'Maharashtra': 'Maharashtra',
  'MANIPUR': 'Manipur',
  'Manipur': 'Manipur',
  'MEGHALAYA': 'Meghalaya',
  'Meghalaya': 'Meghalaya',
  'MIZORAM': 'Mizoram',
  'Mizoram': 'Mizoram',
  'NAGALAND': 'Nagaland',
  'Nagaland': 'Nagaland',
  'ORISSA': 'Odisha',
  'Odisha': 'Odisha',
  'PUNJAB': 'Punjab',
  'Punjab': 'Punjab',
  'RAJASTHAN': 'Rajasthan',
  'Rajasthan': 'Rajasthan',
  'SIKKIM': 'Sikkim',
  'Sikkim': 'Sikkim',
  'TAMIL NADU': 'Tamil Nadu',
  'Tamil Nadu': 'Tamil Nadu',
  'TELANGANA': 'Telangana',
  'Telangana': 'Telangana',
  'TRIPURA': 'Tripura',
  'Tripura': 'Tripura',
  'UTTRAKHAND': 'Uttarakhand',
  'Uttarakhand': 'Uttarakhand',
  'UTTAR PRADESH': 'Uttar Pradesh',
  'Uttar Pradesh': 'Uttar Pradesh',
  'WEST BENGAL': 'West Bengal',
  'West Bengal': 'West Bengal'
};

// College type categorization
const COLLEGE_TYPE_CATEGORIES = {
  'Government': ['GOVERNMENT', 'Government'],
  'Private': ['PRIVATE', 'Private', 'TRUST', 'Trust', 'SOCIETY', 'Society'],
  'Deemed': ['DEEMED', 'Deemed'],
  'DNB': ['DNB']
};

// Management type to college type mapping
const MANAGEMENT_TO_COLLEGE_TYPE = {
  'GOVERNMENT': 'Government',
  'Government': 'Government',
  'PRIVATE': 'Private',
  'Private': 'Private',
  'TRUST': 'Private',
  'Trust': 'Private',
  'SOCIETY': 'Private',
  'Society': 'Private',
  'DEEMED': 'Deemed',
  'Deemed': 'Deemed',
  'DNB': 'DNB'
};

function standardizeData() {
  return new Promise((resolve, reject) => {
    const db = new sqlite3.Database(dbPath, (err) => {
      if (err) {
        console.error('Error opening database:', err.message);
        reject(err);
        return;
      }
      console.log('Connected to the database for standardization.');
    });

    db.serialize(() => {
      // 1. Standardize state names
      console.log('🔄 Standardizing state names...');
      Object.entries(STANDARD_STATES).forEach(([oldName, newName]) => {
        if (oldName !== newName) {
          const updateQuery = `
            UPDATE colleges 
            SET state = ? 
            WHERE state = ?
          `;
          db.run(updateQuery, [newName, oldName], function(err) {
            if (err) {
              console.error(`Error updating state ${oldName}:`, err.message);
            } else if (this.changes > 0) {
              console.log(`✅ Updated ${this.changes} colleges: ${oldName} → ${newName}`);
            }
          });
        }
      });

      // 2. Add college_type_category column if it doesn't exist
      console.log('🔄 Adding college_type_category column...');
      db.run(`
        ALTER TABLE colleges 
        ADD COLUMN college_type_category TEXT
      `, function(err) {
        if (err && !err.message.includes('duplicate column name')) {
          console.error('Error adding college_type_category column:', err.message);
        } else {
          console.log('✅ college_type_category column ready');
        }
      });

      // 3. Update college_type_category based on management_type
      console.log('🔄 Updating college type categories...');
      Object.entries(MANAGEMENT_TO_COLLEGE_TYPE).forEach(([managementType, category]) => {
        const updateQuery = `
          UPDATE colleges 
          SET college_type_category = ? 
          WHERE management_type = ?
        `;
        db.run(updateQuery, [category, managementType], function(err) {
          if (err) {
            console.error(`Error updating category for ${managementType}:`, err.message);
          } else if (this.changes > 0) {
            console.log(`✅ Updated ${this.changes} colleges: ${managementType} → ${category}`);
          }
        });
      });

      // 4. Update college_type_category for DNB colleges based on college_type
      console.log('🔄 Updating DNB college categories...');
      db.run(`
        UPDATE colleges 
        SET college_type_category = 'DNB' 
        WHERE college_type = 'DNB'
      `, function(err) {
        if (err) {
          console.error('Error updating DNB categories:', err.message);
        } else if (this.changes > 0) {
          console.log(`✅ Updated ${this.changes} DNB colleges`);
        }
      });

      // 5. Verify the standardization
      setTimeout(() => {
        console.log('\n🔍 Verifying standardization results...');
        
        // Check unique states
        db.all('SELECT DISTINCT state FROM colleges ORDER BY state', [], (err, rows) => {
          if (err) {
            console.error('Error checking states:', err.message);
          } else {
            console.log(`\n📊 Unique states after standardization (${rows.length}):`);
            rows.forEach(row => console.log(`  - ${row.state}`));
          }
        });

        // Check college type categories
        db.all('SELECT DISTINCT college_type_category FROM colleges ORDER BY college_type_category', [], (err, rows) => {
          if (err) {
            console.error('Error checking college type categories:', err.message);
          } else {
            console.log(`\n📊 College type categories (${rows.length}):`);
            rows.forEach(row => console.log(`  - ${row.college_type_category}`));
          }
        });

        // Count by category
        db.all(`
          SELECT college_type_category, COUNT(*) as count 
          FROM colleges 
          GROUP BY college_type_category 
          ORDER BY college_type_category
        `, [], (err, rows) => {
          if (err) {
            console.error('Error counting by category:', err.message);
          } else {
            console.log(`\n📊 College count by category:`);
            rows.forEach(row => console.log(`  - ${row.college_type_category}: ${row.count}`));
          }
          
          db.close((err) => {
            if (err) {
              console.error('Error closing database:', err.message);
            } else {
              console.log('\n✅ Database standardization completed!');
              resolve();
            }
          });
        });
      }, 2000); // Wait for updates to complete
    });
  });
}

// Run standardization if called directly
if (require.main === module) {
  standardizeData()
    .then(() => {
      console.log('🎉 Data standardization completed successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Data standardization failed:', error);
      process.exit(1);
    });
}

module.exports = { standardizeData, STANDARD_STATES, COLLEGE_TYPE_CATEGORIES };
