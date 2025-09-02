const StagingCutoffImporter = require('./stagingCutoffImporter');
const ErrorCorrectionDictionary = require('./errorCorrectionDictionary');

async function initializeStagingSystem() {
  try {
    console.log('🚀 Initializing Staging System...');
    
    // Initialize Error Correction Dictionary
    console.log('📚 Initializing Error Correction Dictionary...');
    const errorDict = new ErrorCorrectionDictionary();
    await errorDict.initializeDatabase();
    await errorDict.loadDefaultCorrections();
    console.log('✅ Error Correction Dictionary initialized');
    await errorDict.close();
    
    // Initialize Staging Cutoff Importer
    console.log('🗄️ Initializing Staging Database...');
    const stagingImporter = new StagingCutoffImporter();
    await stagingImporter.initializeStagingDatabase();
    console.log('✅ Staging Database initialized');
    
    // Load reference data
    console.log('📖 Loading reference data...');
    await stagingImporter.loadReferenceData();
    console.log('✅ Reference data loaded');
    
    console.log('🎉 Staging System initialization complete!');
    console.log('📍 Staging database: ./staging_cutoffs.db');
    console.log('📍 Error corrections: error_corrections.db');
    
  } catch (error) {
    console.error('❌ Failed to initialize staging system:', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  initializeStagingSystem();
}

module.exports = { initializeStagingSystem };
