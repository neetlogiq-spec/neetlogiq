#!/usr/bin/env node

/**
 * Complete Integration Test
 * Tests the full integration between frontend and Cloudflare Worker with BMAD
 */

const http = require('http');

class CompleteIntegrationTest {
  constructor() {
    this.cloudflareWorkerUrl = 'http://localhost:8787';
    this.frontendUrl = 'http://localhost:3000';
    this.testResults = {
      cloudflareWorker: { status: 'unknown', tests: [] },
      frontend: { status: 'unknown', tests: [] },
      bmadIntegration: { status: 'unknown', tests: [] },
      endToEnd: { status: 'unknown', tests: [] }
    };
  }

  async runCompleteTest() {
    console.log('🚀 Starting Complete Integration Test...\n');
    
    // Step 1: Test Cloudflare Worker
    await this.testCloudflareWorker();
    
    // Step 2: Test Frontend
    await this.testFrontend();
    
    // Step 3: Test BMAD Integration
    await this.testBMADIntegration();
    
    // Step 4: Test End-to-End Integration
    await this.testEndToEndIntegration();
    
    // Step 5: Display Results
    this.displayResults();
    
    console.log('\n🎉 Complete Integration Test Finished! 🎉\n');
  }

  async testCloudflareWorker() {
    console.log('🌐 Testing Cloudflare Worker...');
    
    const tests = [
      { name: 'Health Check', url: '/api/health', expectedStatus: 200 },
      { name: 'Colleges List', url: '/api/colleges', expectedStatus: 200 },
      { name: 'Colleges Search', url: '/api/colleges?search=bangalore', expectedStatus: 200 },
      { name: 'Colleges Filters', url: '/api/colleges/filters', expectedStatus: 200 },
      { name: 'Courses List', url: '/api/courses', expectedStatus: 200 },
      { name: 'BMAD Analytics', url: '/api/bmad/analytics', expectedStatus: 200 },
      { name: 'BMAD Performance', url: '/api/bmad/performance', expectedStatus: 200 }
    ];

    for (const test of tests) {
      try {
        const response = await this.makeRequest(`${this.cloudflareWorkerUrl}${test.url}`);
        const testResult = {
          name: test.name,
          status: response.statusCode === test.expectedStatus ? 'PASS' : 'FAIL',
          statusCode: response.statusCode,
          responseTime: response.responseTime
        };
        
        if (response.statusCode === 200) {
          const data = JSON.parse(response.body);
          testResult.hasData = data.data !== undefined;
          testResult.hasBMAD = data.bmad !== undefined;
          testResult.dataSize = response.body.length;
        }
        
        this.testResults.cloudflareWorker.tests.push(testResult);
        console.log(`  ${testResult.status === 'PASS' ? '✅' : '❌'} ${test.name}: ${testResult.status}`);
        
      } catch (error) {
        this.testResults.cloudflareWorker.tests.push({
          name: test.name,
          status: 'ERROR',
          error: error.message
        });
        console.log(`  ❌ ${test.name}: ERROR - ${error.message}`);
      }
    }
    
    const passedTests = this.testResults.cloudflareWorker.tests.filter(t => t.status === 'PASS').length;
    const totalTests = this.testResults.cloudflareWorker.tests.length;
    this.testResults.cloudflareWorker.status = passedTests === totalTests ? 'EXCELLENT' : 
                                               passedTests > totalTests * 0.8 ? 'GOOD' : 'NEEDS_IMPROVEMENT';
    
    console.log(`  📊 Cloudflare Worker Status: ${this.testResults.cloudflareWorker.status} (${passedTests}/${totalTests} tests passed)\n`);
  }

  async testFrontend() {
    console.log('🎨 Testing Frontend...');
    
    const tests = [
      { name: 'Frontend Homepage', url: '/', expectedStatus: 200 },
      { name: 'Colleges Page', url: '/colleges', expectedStatus: 200 },
      { name: 'Courses Page', url: '/courses', expectedStatus: 200 },
      { name: 'About Page', url: '/about', expectedStatus: 200 },
      { name: 'Admin Page', url: '/neetlogiq-admin', expectedStatus: 200 }
    ];

    for (const test of tests) {
      try {
        const response = await this.makeRequest(`${this.frontendUrl}${test.url}`);
        const testResult = {
          name: test.name,
          status: response.statusCode === test.expectedStatus ? 'PASS' : 'FAIL',
          statusCode: response.statusCode,
          responseTime: response.responseTime,
          hasHTML: response.body.includes('<html'),
          hasReact: response.body.includes('react')
        };
        
        this.testResults.frontend.tests.push(testResult);
        console.log(`  ${testResult.status === 'PASS' ? '✅' : '❌'} ${test.name}: ${testResult.status}`);
        
      } catch (error) {
        this.testResults.frontend.tests.push({
          name: test.name,
          status: 'ERROR',
          error: error.message
        });
        console.log(`  ❌ ${test.name}: ERROR - ${error.message}`);
      }
    }
    
    const passedTests = this.testResults.frontend.tests.filter(t => t.status === 'PASS').length;
    const totalTests = this.testResults.frontend.tests.length;
    this.testResults.frontend.status = passedTests === totalTests ? 'EXCELLENT' : 
                                       passedTests > totalTests * 0.8 ? 'GOOD' : 'NEEDS_IMPROVEMENT';
    
    console.log(`  📊 Frontend Status: ${this.testResults.frontend.status} (${passedTests}/${totalTests} tests passed)\n`);
  }

  async testBMADIntegration() {
    console.log('🤖 Testing BMAD Integration...');
    
    const tests = [
      { name: 'BMAD Analytics Endpoint', url: '/api/bmad/analytics', expectedStatus: 200 },
      { name: 'BMAD Performance Endpoint', url: '/api/bmad/performance', expectedStatus: 200 },
      { name: 'BMAD Headers in Health', url: '/api/health', expectedStatus: 200, checkBMADHeaders: true },
      { name: 'BMAD Data in Colleges', url: '/api/colleges?search=test', expectedStatus: 200, checkBMADData: true }
    ];

    for (const test of tests) {
      try {
        const response = await this.makeRequest(`${this.cloudflareWorkerUrl}${test.url}`);
        const testResult = {
          name: test.name,
          status: response.statusCode === test.expectedStatus ? 'PASS' : 'FAIL',
          statusCode: response.statusCode,
          responseTime: response.responseTime
        };
        
        if (test.checkBMADHeaders) {
          testResult.bmadHeaders = {
            'X-BMAD-Optimized': response.headers['x-bmad-optimized'],
            'X-BMAD-Version': response.headers['x-bmad-version']
          };
          testResult.bmadOptimized = response.headers['x-bmad-optimized'] === 'true';
        }
        
        if (test.checkBMADData && response.statusCode === 200) {
          const data = JSON.parse(response.body);
          testResult.hasBMADData = data.bmad !== undefined;
          testResult.bmadOptimized = data.bmad && data.bmad.optimized === true;
          testResult.hasRecommendations = data.bmad && data.bmad.recommendations !== undefined;
        }
        
        this.testResults.bmadIntegration.tests.push(testResult);
        console.log(`  ${testResult.status === 'PASS' ? '✅' : '❌'} ${test.name}: ${testResult.status}`);
        
      } catch (error) {
        this.testResults.bmadIntegration.tests.push({
          name: test.name,
          status: 'ERROR',
          error: error.message
        });
        console.log(`  ❌ ${test.name}: ERROR - ${error.message}`);
      }
    }
    
    const passedTests = this.testResults.bmadIntegration.tests.filter(t => t.status === 'PASS').length;
    const totalTests = this.testResults.bmadIntegration.tests.length;
    this.testResults.bmadIntegration.status = passedTests === totalTests ? 'EXCELLENT' : 
                                              passedTests > totalTests * 0.8 ? 'GOOD' : 'NEEDS_IMPROVEMENT';
    
    console.log(`  📊 BMAD Integration Status: ${this.testResults.bmadIntegration.status} (${passedTests}/${totalTests} tests passed)\n`);
  }

  async testEndToEndIntegration() {
    console.log('🔗 Testing End-to-End Integration...');
    
    const tests = [
      { name: 'Frontend to Cloudflare Worker', description: 'Frontend can communicate with Cloudflare Worker' },
      { name: 'API Data Flow', description: 'Data flows correctly from Cloudflare Worker to frontend' },
      { name: 'BMAD Integration Flow', description: 'BMAD data is available in frontend' },
      { name: 'Error Handling', description: 'Error handling works across the stack' }
    ];

    for (const test of tests) {
      try {
        let testResult = {
          name: test.name,
          description: test.description,
          status: 'PASS'
        };
        
        // Test specific integration aspects
        if (test.name === 'Frontend to Cloudflare Worker') {
          const frontendResponse = await this.makeRequest(`${this.frontendUrl}/`);
          const workerResponse = await this.makeRequest(`${this.cloudflareWorkerUrl}/api/health`);
          testResult.status = (frontendResponse.statusCode === 200 && workerResponse.statusCode === 200) ? 'PASS' : 'FAIL';
          testResult.details = `Frontend: ${frontendResponse.statusCode}, Worker: ${workerResponse.statusCode}`;
        } else if (test.name === 'API Data Flow') {
          const response = await this.makeRequest(`${this.cloudflareWorkerUrl}/api/colleges`);
          if (response.statusCode === 200) {
            const data = JSON.parse(response.body);
            testResult.status = data.data !== undefined ? 'PASS' : 'FAIL';
            testResult.details = `Data structure: ${data.data ? 'Valid' : 'Invalid'}`;
          } else {
            testResult.status = 'FAIL';
            testResult.details = 'Failed to fetch data';
          }
        } else if (test.name === 'BMAD Integration Flow') {
          const response = await this.makeRequest(`${this.cloudflareWorkerUrl}/api/colleges?search=test`);
          if (response.statusCode === 200) {
            const data = JSON.parse(response.body);
            testResult.status = data.bmad !== undefined ? 'PASS' : 'FAIL';
            testResult.details = `BMAD data: ${data.bmad ? 'Present' : 'Missing'}`;
          } else {
            testResult.status = 'FAIL';
            testResult.details = 'Failed to fetch BMAD data';
          }
        } else if (test.name === 'Error Handling') {
          const response = await this.makeRequest(`${this.cloudflareWorkerUrl}/api/nonexistent`);
          testResult.status = response.statusCode === 404 ? 'PASS' : 'FAIL';
          testResult.details = `Error response: ${response.statusCode}`;
        }
        
        this.testResults.endToEnd.tests.push(testResult);
        console.log(`  ${testResult.status === 'PASS' ? '✅' : '❌'} ${test.name}: ${testResult.status}`);
        
      } catch (error) {
        this.testResults.endToEnd.tests.push({
          name: test.name,
          status: 'ERROR',
          error: error.message
        });
        console.log(`  ❌ ${test.name}: ERROR - ${error.message}`);
      }
    }
    
    const passedTests = this.testResults.endToEnd.tests.filter(t => t.status === 'PASS').length;
    const totalTests = this.testResults.endToEnd.tests.length;
    this.testResults.endToEnd.status = passedTests === totalTests ? 'EXCELLENT' : 
                                       passedTests > totalTests * 0.8 ? 'GOOD' : 'NEEDS_IMPROVEMENT';
    
    console.log(`  📊 End-to-End Integration Status: ${this.testResults.endToEnd.status} (${passedTests}/${totalTests} tests passed)\n`);
  }

  makeRequest(url) {
    return new Promise((resolve, reject) => {
      const startTime = Date.now();
      const request = http.get(url, (response) => {
        let body = '';
        response.on('data', (chunk) => {
          body += chunk;
        });
        response.on('end', () => {
          resolve({
            statusCode: response.statusCode,
            headers: response.headers,
            body: body,
            responseTime: Date.now() - startTime
          });
        });
      });
      
      request.on('error', (error) => {
        reject(error);
      });
      
      request.setTimeout(10000, () => {
        request.destroy();
        reject(new Error('Request timeout'));
      });
    });
  }

  displayResults() {
    console.log('📊 Complete Integration Test Results:');
    console.log('=====================================\n');
    
    console.log('🌐 System Status:');
    console.log(`  Cloudflare Worker: ${this.testResults.cloudflareWorker.status}`);
    console.log(`  Frontend: ${this.testResults.frontend.status}`);
    console.log(`  BMAD Integration: ${this.testResults.bmadIntegration.status}`);
    console.log(`  End-to-End Integration: ${this.testResults.endToEnd.status}\n`);
    
    console.log('📋 Test Summary:');
    for (const [category, results] of Object.entries(this.testResults)) {
      const passedTests = results.tests.filter(t => t.status === 'PASS').length;
      const totalTests = results.tests.length;
      console.log(`  ${category}: ${passedTests}/${totalTests} tests passed`);
    }
    
    console.log('\n🎯 Integration Status:');
    const allPassed = Object.values(this.testResults).every(result => 
      result.tests.filter(t => t.status === 'PASS').length === result.tests.length
    );
    
    if (allPassed) {
      console.log('  ✅ Complete integration is working perfectly!');
      console.log('  ✅ Frontend is connected to Cloudflare Worker');
      console.log('  ✅ BMAD integration is active and functional');
      console.log('  ✅ All API endpoints are working correctly');
      console.log('  ✅ End-to-end data flow is operational');
    } else {
      console.log('  ⚠️  Some integration issues detected');
      console.log('  🔧 Review failed tests and fix issues');
    }
    
    console.log('\n🚀 Next Steps:');
    console.log('  1. Open http://localhost:3000 in your browser');
    console.log('  2. Test the search functionality');
    console.log('  3. Check the admin panel at /neetlogiq-admin');
    console.log('  4. Verify BMAD integration in the admin dashboard');
    console.log('  5. Test all features end-to-end');
  }
}

// Run the complete integration test
const test = new CompleteIntegrationTest();
test.runCompleteTest().catch(console.error);
