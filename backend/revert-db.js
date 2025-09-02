#!/usr/bin/env node

const DatabaseNormalizer = require('./src/utils/databaseNormalizer');

async function main() {
  const normalizer = new DatabaseNormalizer();
  
  console.log('🔄 NeetLogIQ Database Reverter');
  console.log('================================\n');

  try {
    // List available backups
    const backups = normalizer.listBackups();
    
    if (backups.length === 0) {
      console.error('❌ No backups found!');
      console.log('   Make sure you have run the normalization script first.');
      process.exit(1);
    }

    console.log('📋 Available backups:');
    backups.forEach((backup, index) => {
      if (backup.error) {
        console.log(`   ${index + 1}. ${backup.name} - ${backup.error}`);
      } else {
        console.log(`   ${index + 1}. ${backup.name} - ${backup.createdAt}`);
      }
    });

    // Use the most recent backup
    const latestBackup = backups[0];
    if (latestBackup.error) {
      console.error('\n❌ Latest backup is corrupted. Cannot revert.');
      process.exit(1);
    }

    console.log(`\n🔄 Reverting to latest backup: ${latestBackup.name}`);
    console.log(`   Created: ${latestBackup.createdAt}`);
    console.log(`   Location: ${latestBackup.backupPath}`);
    
    // Confirm before reverting
    console.log('\n⚠️  This will overwrite your current database with the backup.');
    console.log('⚠️  All changes made after the backup will be lost.');
    
    // For now, auto-confirm (you can add readline for interactive confirmation)
    console.log('\n🔄 Proceeding with revert...');

    // Revert to backup
    const revertSuccess = await normalizer.revertToBackup();
    
    if (revertSuccess) {
      console.log('\n✅ Database successfully reverted to backup!');
      console.log('\n📊 What was restored:');
      console.log('   • All database files from backup');
      console.log('   • Original data (mixed case)');
      console.log('   • All tables and records');
      
      console.log('\n🔄 To normalize again, run: node normalize-db.js');
      
    } else {
      console.error('\n❌ Database revert failed!');
      console.log('\n💡 Manual recovery may be required.');
      console.log('   Backup location:', latestBackup.backupPath);
      process.exit(1);
    }

  } catch (error) {
    console.error('\n❌ Unexpected error:', error);
    process.exit(1);
  }
}

// Run the main function
main().catch(console.error);
