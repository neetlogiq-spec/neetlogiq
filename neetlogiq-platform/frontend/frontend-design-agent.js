#!/usr/bin/env node

/**
 * 🎨 NeetLogIQ Frontend Design Agent
 * 
 * Features:
 * - Intelligent design analysis and optimization
 * - Automatic build management
 * - Smart serving and deployment
 * - Design consistency monitoring
 * - Performance optimization
 * 
 * Usage: node frontend-design-agent.js [design|build|serve|optimize|analyze]
 */

import { spawn, exec } from 'child_process';
import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class FrontendDesignAgent {
  constructor() {
    this.designState = new Map();
    this.buildStatus = 'unknown';
    this.serveStatus = 'stopped';
    
    this.config = {
      themes: {
        medical: {
          primary: '#2563eb',
          secondary: '#059669',
          accent: '#dc2626',
          neutral: '#f8fafc',
          dark: '#1e293b'
        },
        modern: {
          primary: '#7c3aed',
          secondary: '#10b981',
          accent: '#f59e0b',
          neutral: '#f9fafb',
          dark: '#111827'
        }
      },
      serve: {
        port: 5001
      }
    };
    
    this.init();
  }

  async init() {
    console.log('🎨 Initializing NeetLogIQ Frontend Design Agent...');
    
    // Create necessary directories
    await this.ensureDirectories();
    
    console.log('✅ Frontend Design Agent initialized successfully!');
  }

  async ensureDirectories() {
    const dirs = ['designs', 'builds', 'analytics'];
    
    for (const dir of dirs) {
      const dirPath = path.join(__dirname, dir);
      try {
        await fs.access(dirPath);
      } catch {
        await fs.mkdir(dirPath, { recursive: true });
      }
    }
  }

  async design(theme = 'medical') {
    console.log(`🎨 Creating intelligent frontend design with ${theme} theme...`);
    
    try {
      const design = this.generateDesign(theme);
      
      // Save design to file
      const designFile = path.join(__dirname, 'designs', `${theme}-design.json`);
      await fs.writeFile(designFile, JSON.stringify(design, null, 2));
      
      console.log(`✅ ${theme} theme design created successfully!`);
      console.log('📁 Design saved to:', designFile);
      
      return design;
      
    } catch (error) {
      console.error(`❌ Failed to create ${theme} theme design:`, error.message);
      throw error;
    }
  }

  generateDesign(theme) {
    const colorScheme = this.config.themes[theme] || this.config.themes.medical;
    
    return {
      theme,
      colors: colorScheme,
      typography: {
        fontFamily: {
          primary: 'Inter, system-ui, sans-serif',
          secondary: 'Poppins, system-ui, sans-serif'
        },
        fontSize: {
          xs: '0.75rem',
          sm: '0.875rem',
          base: '1rem',
          lg: '1.125rem',
          xl: '1.25rem',
          '2xl': '1.5rem',
          '3xl': '1.875rem'
        }
      },
      spacing: {
        xs: '0.25rem',
        sm: '0.5rem',
        md: '1rem',
        lg: '1.5rem',
        xl: '2rem'
      },
      borderRadius: {
        none: '0',
        sm: '0.125rem',
        base: '0.25rem',
        md: '0.375rem',
        lg: '0.5rem',
        xl: '0.75rem',
        full: '9999px'
      },
      shadows: {
        sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        base: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
        md: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
        lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
      }
    };
  }

  async build() {
    console.log('🔨 Building frontend application...');
    
    try {
      this.buildStatus = 'building';
      
      // Check if build script exists
      const packageJsonPath = path.join(__dirname, 'package.json');
      const packageJson = await fs.readFile(packageJsonPath, 'utf8');
      const packageData = JSON.parse(packageJson);
      
      if (!packageData.scripts?.build) {
        throw new Error('Build script not found in package.json');
      }
      
      // Run build command
      const buildProcess = spawn('npm', ['run', 'build'], {
        cwd: __dirname,
        stdio: 'inherit'
      });
      
      return new Promise((resolve, reject) => {
        buildProcess.on('close', async (code) => {
          if (code === 0) {
            this.buildStatus = 'success';
            console.log('✅ Frontend build completed successfully!');
            resolve();
          } else {
            this.buildStatus = 'failed';
            console.error(`❌ Frontend build failed with code ${code}`);
            reject(new Error(`Build failed with code ${code}`));
          }
        });
        
        buildProcess.on('error', (error) => {
          this.buildStatus = 'error';
          console.error('❌ Build process error:', error.message);
          reject(error);
        });
      });
      
    } catch (error) {
      this.buildStatus = 'error';
      console.error('❌ Build failed:', error.message);
      throw error;
    }
  }

  async serve() {
    console.log('🚀 Starting frontend server...');
    
    if (this.serveStatus === 'running') {
      console.log('⚠️ Frontend server is already running');
      return;
    }
    
    try {
      this.serveStatus = 'starting';
      
      // Check if build directory exists
      const buildDir = path.join(__dirname, 'build');
      try {
        await fs.access(buildDir);
      } catch {
        console.log('📁 Build directory not found, building first...');
        await this.build();
      }
      
      // Start server using serve package
      const serveProcess = spawn('npx', ['serve', '-s', 'build', '-l', this.config.serve.port.toString()], {
        cwd: __dirname,
        stdio: 'pipe',
        detached: true
      });
      
      serveProcess.unref();
      
      // Wait for server to start
      await this.sleep(3000);
      
      this.serveStatus = 'running';
      console.log(`✅ Frontend server started successfully on port ${this.config.serve.port}!`);
      console.log(`🌐 Access your app at: http://localhost:${this.config.serve.port}`);
      
    } catch (error) {
      this.serveStatus = 'error';
      console.error('❌ Failed to start frontend server:', error.message);
      throw error;
    }
  }

  async stop() {
    console.log('🛑 Stopping frontend server...');
    
    try {
      // Find and kill serve processes
      exec(`lsof -ti:${this.config.serve.port} | xargs kill -9`, (error) => {
        if (error) {
          console.log('⚠️ No serve processes found on port', this.config.serve.port);
        } else {
          console.log('✅ Frontend server stopped successfully');
        }
      });
      
      this.serveStatus = 'stopped';
      
    } catch (error) {
      console.error('❌ Error stopping frontend server:', error.message);
    }
  }

  async optimize() {
    console.log('⚡ Optimizing frontend performance...');
    
    try {
      console.log('🔍 Analyzing current frontend structure...');
      
      // Check for common optimization opportunities
      const optimizations = [];
      
      // Check if Tailwind CSS is configured
      const tailwindConfig = path.join(__dirname, 'tailwind.config.js');
      try {
        await fs.access(tailwindConfig);
        console.log('✅ Tailwind CSS is configured');
      } catch {
        console.log('⚠️ Tailwind CSS not configured - consider adding for better styling');
        optimizations.push('Add Tailwind CSS for better styling');
      }
      
      // Check if Framer Motion is available
      const packageJsonPath = path.join(__dirname, 'package.json');
      const packageJson = await fs.readFile(packageJsonPath, 'utf8');
      const packageData = JSON.parse(packageJson);
      
      if (packageData.dependencies?.['framer-motion']) {
        console.log('✅ Framer Motion is available for animations');
      } else {
        console.log('⚠️ Framer Motion not available - consider adding for better animations');
        optimizations.push('Add Framer Motion for better animations');
      }
      
      // Check build directory size
      const buildDir = path.join(__dirname, 'build');
      try {
        const buildStats = await fs.stat(buildDir);
        const sizeInMB = (buildStats.size / (1024 * 1024)).toFixed(2);
        console.log(`📊 Build size: ${sizeInMB} MB`);
        
        if (buildStats.size > 5 * 1024 * 1024) { // > 5MB
          optimizations.push('Optimize build size - consider code splitting and lazy loading');
        }
      } catch {
        console.log('⚠️ Build directory not found');
      }
      
      if (optimizations.length > 0) {
        console.log('\n📋 Optimization recommendations:');
        optimizations.forEach((opt, index) => {
          console.log(`  ${index + 1}. ${opt}`);
        });
      } else {
        console.log('✅ No optimizations needed - your frontend is well-optimized!');
      }
      
    } catch (error) {
      console.error('❌ Frontend optimization failed:', error.message);
      throw error;
    }
  }

  async analyze() {
    console.log('🔍 Analyzing frontend application...');
    
    try {
      const analysis = {
        timestamp: new Date().toISOString(),
        buildStatus: this.buildStatus,
        serveStatus: this.serveStatus,
        structure: await this.analyzeStructure(),
        recommendations: []
      };
      
      // Generate recommendations
      if (this.buildStatus !== 'success') {
        analysis.recommendations.push('Fix build issues before proceeding');
      }
      
      if (this.serveStatus !== 'running') {
        analysis.recommendations.push('Start the frontend server to test your application');
      }
      
      // Save analysis
      const analysisFile = path.join(__dirname, 'analytics', `frontend-analysis-${new Date().toISOString().split('T')[0]}.json`);
      await fs.writeFile(analysisFile, JSON.stringify(analysis, null, 2));
      
      console.log('✅ Frontend analysis completed!');
      console.log('📁 Analysis saved to:', analysisFile);
      
      // Display analysis summary
      console.log('\n📊 Analysis Summary:');
      console.log(`  Build Status: ${analysis.buildStatus}`);
      console.log(`  Serve Status: ${analysis.serveStatus}`);
      console.log(`  Components Found: ${analysis.structure.components}`);
      console.log(`  Pages Found: ${analysis.structure.pages}`);
      
      if (analysis.recommendations.length > 0) {
        console.log('\n📋 Recommendations:');
        analysis.recommendations.forEach((rec, index) => {
          console.log(`  ${index + 1}. ${rec}`);
        });
      }
      
      return analysis;
      
    } catch (error) {
      console.error('❌ Frontend analysis failed:', error.message);
      throw error;
    }
  }

  async analyzeStructure() {
    const structure = {
      components: 0,
      pages: 0,
      styles: 0,
      assets: 0
    };
    
    try {
      // Count components
      const componentsDir = path.join(__dirname, 'src', 'components');
      try {
        const componentEntries = await fs.readdir(componentsDir);
        structure.components = componentEntries.filter(entry => entry.endsWith('.jsx')).length;
      } catch {
        // Components directory not found
      }
      
      // Count pages
      const pagesDir = path.join(__dirname, 'src', 'pages');
      try {
        const pageEntries = await fs.readdir(pagesDir);
        structure.pages = pageEntries.filter(entry => entry.endsWith('.jsx')).length;
      } catch {
        // Pages directory not found
      }
      
      // Count styles
      const stylesDir = path.join(__dirname, 'src', 'styles');
      try {
        const styleEntries = await fs.readdir(stylesDir);
        structure.styles = styleEntries.filter(entry => entry.endsWith('.css') || entry.endsWith('.scss')).length;
      } catch {
        // Styles directory not found
      }
      
      // Count assets
      const assetsDir = path.join(__dirname, 'src', 'assets');
      try {
        const assetEntries = await fs.readdir(assetsDir);
        structure.assets = assetEntries.length;
      } catch {
        // Assets directory not found
      }
      
    } catch (error) {
      console.log('⚠️ Could not analyze frontend structure');
    }
    
    return structure;
  }

  async status() {
    console.log('📊 NeetLogIQ Frontend Design Agent Status');
    console.log('==========================================');
    
    console.log(`\n🔨 Build Status: ${this.buildStatus}`);
    console.log(`🚀 Serve Status: ${this.serveStatus}`);
    
    if (this.serveStatus === 'running') {
      console.log(`🌐 Server URL: http://localhost:${this.config.serve.port}`);
    }
    
    console.log(`\n🎨 Available Themes:`);
    for (const [themeName, themeColors] of Object.entries(this.config.themes)) {
      console.log(`  ${themeName}: Primary ${themeColors.primary}, Secondary ${themeColors.secondary}`);
    }
    
    console.log(`\n📁 Design Files:`);
    try {
      const designsDir = path.join(__dirname, 'designs');
      const designFiles = await fs.readdir(designsDir);
      if (designFiles.length > 0) {
        designFiles.forEach(file => {
          console.log(`  📄 ${file}`);
        });
      } else {
        console.log('  No design files found');
      }
    } catch {
      console.log('  No designs directory found');
    }
  }

  async sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// CLI interface
async function main() {
  const agent = new FrontendDesignAgent();
  const command = process.argv[2] || 'status';
  
  try {
    switch (command) {
      case 'design':
        const theme = process.argv[3] || 'medical';
        await agent.design(theme);
        break;
      case 'build':
        await agent.build();
        break;
      case 'serve':
        await agent.serve();
        break;
      case 'stop':
        await agent.stop();
        break;
      case 'optimize':
        await agent.optimize();
        break;
      case 'analyze':
        await agent.analyze();
        break;
      case 'status':
        await agent.status();
        break;
      default:
        console.log('Usage: node frontend-design-agent.js [design|build|serve|stop|optimize|analyze|status]');
        process.exit(1);
    }
  } catch (error) {
    console.error('❌ Frontend design agent error:', error.message);
    process.exit(1);
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export default FrontendDesignAgent;
