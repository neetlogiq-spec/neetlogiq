const express = require('express');
const DatabaseManager = require('./src/database/DatabaseManager');

async function testStagingRoutes() {
  try {
    console.log('🚀 Testing Staging Routes...');
    
    // Initialize database connections
    await DatabaseManager.initialize();
    console.log('✅ Database connections initialized');
    
    // Test staging database access
    const stagingDb = DatabaseManager.getDatabase('staging_cutoffs.db');
    console.log('✅ Staging database accessed');
    
    // Test querying import_sessions table
    const sessions = await stagingDb.all('SELECT * FROM import_sessions ORDER BY started_at DESC');
    console.log(`✅ Import sessions query successful: ${sessions.length} sessions found`);
    
    // Test querying raw_cutoffs table
    const rawData = await stagingDb.all('SELECT COUNT(*) as count FROM raw_cutoffs');
    console.log(`✅ Raw cutoffs query successful: ${rawData[0].count} records found`);
    
    // Test querying processed_cutoffs table
    const processedData = await stagingDb.all('SELECT COUNT(*) as count FROM processed_cutoffs');
    console.log(`✅ Processed cutoffs query successful: ${processedData[0].count} records found`);
    
    console.log('🎉 All staging database queries successful!');
    console.log('📍 The staging cutoffs routes should now work in the admin interface');
    
  } catch (error) {
    console.error('❌ Error testing staging routes:', error);
  }
}

testStagingRoutes();
