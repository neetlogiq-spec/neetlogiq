#!/usr/bin/env node

const DatabaseNormalizer = require('./src/utils/databaseNormalizer');

async function main() {
  const normalizer = new DatabaseNormalizer();
  
  console.log('🚀 NeetLogIQ Database Normalizer');
  console.log('=====================================\n');

  try {
    // Step 1: Create backup
    console.log('📋 Step 1: Creating database backup...');
    const backupSuccess = await normalizer.createBackup();
    
    if (!backupSuccess) {
      console.error('❌ Backup failed. Cannot proceed with normalization.');
      process.exit(1);
    }

    console.log('\n📋 Step 2: Starting database normalization...');
    console.log('⚠️  This will convert ALL text data to UPPERCASE');
    console.log('⚠️  This process cannot be undone without the backup\n');

    // Step 2: Normalize database
    const normalizeSuccess = await normalizer.normalizeDatabase();
    
    if (normalizeSuccess) {
      console.log('\n✅ Database normalization completed successfully!');
      console.log('\n📊 What was normalized:');
      console.log('   • College names → UPPERCASE');
      console.log('   • Course names → UPPERCASE');
      console.log('   • Course types → UPPERCASE');
      console.log('   • State names → UPPERCASE');
      console.log('   • City names → UPPERCASE');
      console.log('   • All other text fields → UPPERCASE');
      
      console.log('\n💾 Backup location:', normalizer.backupPath);
      console.log('\n🔄 To revert changes, run: node revert-db.js');
      
    } else {
      console.error('\n❌ Database normalization failed!');
      console.log('\n🔄 Reverting to backup...');
      await normalizer.revertToBackup();
      process.exit(1);
    }

  } catch (error) {
    console.error('\n❌ Unexpected error:', error);
    console.log('\n🔄 Attempting to revert to backup...');
    try {
      await normalizer.revertToBackup();
      console.log('✅ Successfully reverted to backup');
    } catch (revertError) {
      console.error('❌ Failed to revert:', revertError);
    }
    process.exit(1);
  }
}

// Run the main function
main().catch(console.error);
