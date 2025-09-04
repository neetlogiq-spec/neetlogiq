// backend/scripts/build-ai-index.js
const { execSync } = require('child_process');
const crypto = require('crypto');

/**
 * ==============================================================================
 * AI-Powered Indexer for NeetLogiq
 * ==============================================================================
 * This script transforms your standard database records into AI-native embeddings
 * and populates a Cloudflare Vectorize database for intelligent semantic search.
 *
 * How it works:
 * 1. Fetches college data from your Cloudflare D1 database.
 * 2. For each college, it creates a rich, descriptive text block.
 * 3. It calls a secure endpoint on your Cloudflare Worker to convert this text
 *    into a vector embedding using an AI model.
 * 4. It then "upserts" (inserts or updates) this embedding and its associated
 *    metadata into your Vectorize database via the Worker.
 * ==============================================================================
 */

// --- Configuration ---
// IMPORTANT: Replace with your actual Cloudflare Worker URL.
const WORKER_URL = 'http://localhost:8787'; // Using local development URL
// IMPORTANT: Set this in your environment variables for security.
const AUTH_SECRET = process.env.INDEXER_AUTH_SECRET || 'dev-secret-key'; 
const D1_DATABASE_NAME = 'neetlogiq-db';

/**
 * Creates a rich text description of a college for the AI model.
 * This helps the AI understand the college's key attributes.
 * @param {object} college - The college data from D1.
 * @returns {string} A descriptive string for embedding.
 */
function createCollegeDescription(college) {
  const parts = [];
  
  // Basic info
  parts.push(`Medical College: ${college.name}`);
  parts.push(`Location: ${college.city}, ${college.state}`);
  
  // Management and type
  if (college.management_type) {
    parts.push(`Management: ${college.management_type}`);
  }
  if (college.college_type) {
    parts.push(`Type: ${college.college_type}`);
  }
  
  // Establishment year
  if (college.establishment_year) {
    parts.push(`Established: ${college.establishment_year}`);
  }
  
  // Additional context for AI understanding
  parts.push(`This is a medical college in India offering undergraduate and postgraduate medical education.`);
  
  // Add location context for better search
  if (college.state) {
    parts.push(`Located in ${college.state} state.`);
  }
  
  return parts.join('. ') + '.';
}

/**
 * Main function to build and populate the AI search index.
 */
async function buildAIIndex() {
  if (!AUTH_SECRET) {
    console.error('❌ ERROR: INDEXER_AUTH_SECRET environment variable is not set.');
    console.error('   Please set a secret and configure it in your Cloudflare Worker.');
    process.exit(1);
  }

  console.log('🚀 Starting AI index build...');
  console.log(`📡 Worker URL: ${WORKER_URL}`);
  console.log(`🔐 Auth Secret: ${AUTH_SECRET.substring(0, 8)}...`);

  // 1. Fetch Colleges Data from D1
  console.log(`\n📊 Fetching colleges from D1 database "${D1_DATABASE_NAME}"...`);
  let colleges;
  try {
    const d1Result = execSync(
      `npx wrangler d1 execute ${D1_DATABASE_NAME} --local --command "SELECT id, name, city, state, management_type, college_type, establishment_year FROM colleges LIMIT 10;" --json`
    );
    const result = JSON.parse(d1Result.toString());
    colleges = result[0]?.results || [];
    console.log(`  ✅ Found ${colleges.length} colleges.`);
    
    if (colleges.length === 0) {
      console.log('  ⚠️  No colleges found. Make sure your D1 database is populated.');
      return;
    }
  } catch (error) {
    console.error('\n❌ Failed to fetch data from D1.');
    console.error('   Error:', error.message);
    console.error('   Make sure your Cloudflare Worker is running on localhost:8787');
    process.exit(1);
  }

  // 2. Test Worker Connection
  console.log('\n🔗 Testing Worker connection...');
  try {
    const testResponse = await fetch(`${WORKER_URL}/api/health`);
    if (!testResponse.ok) {
      throw new Error(`Worker not responding: ${testResponse.status}`);
    }
    console.log('  ✅ Worker is responding');
  } catch (error) {
    console.error('\n❌ Cannot connect to Worker.');
    console.error('   Error:', error.message);
    console.error('   Make sure to run: wrangler dev src/index.js --local --port 8787');
    process.exit(1);
  }

  // 3. Process and Upsert each college
  console.log('\n🧠 Processing and upserting colleges into Vectorize DB...');
  let successCount = 0;
  let errorCount = 0;
  
  for (const college of colleges) {
    const description = createCollegeDescription(college);
    // Use a consistent ID for the vector
    const vectorId = `college-${college.id}`;

    try {
      const response = await fetch(`${WORKER_URL}/api/internal/upsert-vector`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Indexer-Auth': AUTH_SECRET,
        },
        body: JSON.stringify({
          id: vectorId,
          text: description,
          metadata: {
            id: college.id,
            name: college.name,
            city: college.city,
            state: college.state,
            management_type: college.management_type,
            college_type: college.college_type,
            establishment_year: college.establishment_year,
            type: 'College',
          },
        }),
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed with status ${response.status}: ${errorText}`);
      }

      const result = await response.json();
      console.log(`  ✅ Upserted: ${college.name} (ID: ${result.ids?.[0] || vectorId})`);
      successCount++;

    } catch (error) {
      console.error(`\n❌ Failed to upsert college ID ${college.id}: ${college.name}`);
      console.error('   Error:', error.message);
      errorCount++;
    }
  }

  console.log(`\n🎉 AI search index build complete!`);
  console.log(`   ✅ Successfully indexed: ${successCount} colleges`);
  console.log(`   ❌ Errors: ${errorCount} colleges`);
  console.log(`\n🔍 Your search is now intelligent! Try searching for natural language queries.`);
}

// Run the indexer
buildAIIndex().catch(error => {
  console.error('\n💥 Fatal error:', error.message);
  process.exit(1);
});
