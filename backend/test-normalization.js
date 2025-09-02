#!/usr/bin/env node

const DatabaseManager = require('./src/database/DatabaseManager');

async function previewNormalization() {
  try {
    console.log('🔍 NeetLogIQ Database Normalization Preview');
    console.log('============================================\n');
    
    // Initialize database connections
    await DatabaseManager.initialize();
    const collegesDb = DatabaseManager.getDatabase('colleges.db');
    
    console.log('📚 Sample data that will be normalized:\n');
    
    // Show sample colleges
    console.log('🏫 Sample Colleges (Before → After):');
    const colleges = await collegesDb.all('SELECT college_name, state, city FROM comprehensive_colleges LIMIT 5');
    
    colleges.forEach((college, index) => {
      console.log(`\n${index + 1}. College Name:`);
      console.log(`   Before: "${college.college_name}"`);
      console.log(`   After:  "${college.college_name?.toUpperCase()}"`);
      
      console.log(`   State: "${college.state}" → "${college.state?.toUpperCase()}"`);
      console.log(`   City:  "${college.city}" → "${college.city?.toUpperCase()}"`);
    });
    
    // Show sample courses
    console.log('\n📖 Sample Courses (Before → After):');
    const courses = await collegesDb.all('SELECT course_name, course_type FROM comprehensive_courses LIMIT 5');
    
    courses.forEach((course, index) => {
      console.log(`\n${index + 1}. Course Name:`);
      console.log(`   Before: "${course.course_name}"`);
      console.log(`   After:  "${course.course_name?.toUpperCase()}"`);
      
      console.log(`   Type: "${course.course_type}" → "${course.course_type?.toUpperCase()}"`);
    });
    
    // Show counts
    const collegeCount = await collegesDb.get('SELECT COUNT(*) as count FROM comprehensive_colleges');
    const courseCount = await collegesDb.get('SELECT COUNT(*) as count FROM comprehensive_courses');
    
    console.log('\n📊 Database Statistics:');
    console.log(`   • Total Colleges: ${collegeCount.count}`);
    console.log(`   • Total Courses: ${courseCount.count}`);
    console.log(`   • Estimated text fields to normalize: ${collegeCount.count * 10 + courseCount.count * 5}`);
    
    console.log('\n⚠️  This is just a preview. No changes have been made.');
    console.log('\n🔄 To proceed with normalization:');
    console.log('   1. Run: node normalize-db.js');
    console.log('   2. Test the application');
    console.log('   3. If issues occur, run: node revert-db.js');
    
  } catch (error) {
    console.error('❌ Error previewing normalization:', error);
  }
}

// Run the preview
previewNormalization().catch(console.error);
