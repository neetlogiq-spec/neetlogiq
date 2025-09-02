#!/usr/bin/env node

const { program } = require('commander');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// ASCII Art Banner
const banner = `
╔══════════════════════════════════════════════════════════════╗
║                    🚀 MEDGUIDE DEV TOOL 🚀                  ║
║              AI-Powered Development Assistant                ║
╚══════════════════════════════════════════════════════════════╝
`;

// Utility functions
const log = (message, type = 'info') => {
  const colors = {
    info: '\x1b[36m',    // Cyan
    success: '\x1b[32m', // Green
    warning: '\x1b[33m', // Yellow
    error: '\x1b[31m',   // Red
    reset: '\x1b[0m'     // Reset
  };
  console.log(`${colors[type]}${message}${colors.reset}`);
};

const runCommand = (command, cwd = process.cwd()) => {
  try {
    log(`Running: ${command}`, 'info');
    execSync(command, { cwd, stdio: 'inherit' });
    return true;
  } catch (error) {
    log(`Error running command: ${command}`, 'error');
    return false;
  }
};

const checkPort = (port) => {
  try {
    execSync(`lsof -i :${port}`, { stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
};

const killProcessOnPort = (port) => {
  if (checkPort(port)) {
    log(`Killing process on port ${port}`, 'warning');
    try {
      execSync(`lsof -ti :${port} | xargs kill -9`, { stdio: 'ignore' });
      log(`Process killed on port ${port}`, 'success');
    } catch (error) {
      log(`Failed to kill process on port ${port}`, 'error');
    }
  }
};

// Main CLI program
program
  .name('medguide-dev')
  .description('AI-Powered Development Tool for MedGuide')
  .version('1.0.0');

// Development commands
program
  .command('start')
  .description('Start the development environment')
  .option('-f, --frontend', 'Start only frontend')
  .option('-b, --backend', 'Start only backend')
  .option('-p, --port <port>', 'Custom port for frontend', '4000')
  .action((options) => {
    log(banner, 'info');
    
    if (options.frontend) {
      log('🚀 Starting Frontend Only...', 'info');
      killProcessOnPort(options.port);
      runCommand(`cd frontend && PORT=${options.port} npm run dev`);
    } else if (options.backend) {
      log('🚀 Starting Backend Only...', 'info');
      killProcessOnPort(4001);
      runCommand('cd backend && npm run dev');
    } else {
      log('🚀 Starting Full Stack Development...', 'info');
      killProcessOnPort(options.port);
      killProcessOnPort(4001);
      runCommand(`PORT=${options.port} npm run dev`);
    }
  });

program
  .command('stop')
  .description('Stop all development servers')
  .action(() => {
    log('🛑 Stopping all development servers...', 'warning');
    killProcessOnPort(4000);
    killProcessOnPort(4001);
    killProcessOnPort(4002);
    log('✅ All servers stopped', 'success');
  });

program
  .command('restart')
  .description('Restart development environment')
  .option('-p, --port <port>', 'Custom port for frontend', '4000')
  .action((options) => {
    log('🔄 Restarting development environment...', 'info');
    killProcessOnPort(options.port);
    killProcessOnPort(4001);
    setTimeout(() => {
      runCommand(`PORT=${options.port} npm run dev`);
    }, 1000);
  });

program
  .command('status')
  .description('Check development environment status')
  .action(() => {
    log('📊 Development Environment Status:', 'info');
    log(`Frontend (Port 4000): ${checkPort(4000) ? '🟢 Running' : '🔴 Stopped'}`, 'info');
    log(`Backend (Port 4001): ${checkPort(4001) ? '🟢 Running' : '🔴 Stopped'}`, 'info');
    log(`Alt Frontend (Port 4002): ${checkPort(4002) ? '🟢 Running' : '🔴 Stopped'}`, 'info');
  });

// Code quality commands
program
  .command('lint')
  .description('Run code linting and formatting')
  .action(() => {
    log('🔍 Running code quality checks...', 'info');
    runCommand('cd frontend && npm run lint');
  });

program
  .command('test')
  .description('Run tests')
  .action(() => {
    log('🧪 Running tests...', 'info');
    runCommand('cd frontend && npm test');
  });

// Database commands
program
  .command('db:reset')
  .description('Reset database to clean state')
  .action(() => {
    log('🗄️ Resetting database...', 'warning');
    if (fs.existsSync('backend/clean-unified.db')) {
      fs.unlinkSync('backend/clean-unified.db');
      log('✅ Database reset complete', 'success');
    } else {
      log('ℹ️ No database file found to reset', 'info');
    }
  });

program
  .command('db:backup')
  .description('Create database backup')
  .action(() => {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupDir = 'backups';
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir);
    }
    
    if (fs.existsSync('backend/clean-unified.db')) {
      const backupPath = `backups/db-backup-${timestamp}.db`;
      fs.copyFileSync('backend/clean-unified.db', backupPath);
      log(`✅ Database backed up to ${backupPath}`, 'success');
    } else {
      log('ℹ️ No database file found to backup', 'info');
    }
  });

// AI Development Assistant
program
  .command('ai:generate')
  .description('Generate code using AI assistance')
  .argument('<type>', 'Type of code to generate (component, page, api, test, feature)')
  .argument('<name>', 'Name of the item to generate')
  .option('-t, --template <template>', 'Template to use', 'default')
  .option('-p, --preview', 'Preview generated code without saving')
  .action((type, name, options) => {
    try {
      const AICodeGenerator = require('./ai-generator');
      const generator = new AICodeGenerator();
      
      log(`🤖 AI Code Generation: ${type} - ${name}`, 'info');
      log(`Template: ${options.template}`, 'info');
      
      let result;
      switch (type) {
        case 'component':
          result = generator.generateComponent(name, options);
          log(`✅ Generated React component: ${result}`, 'success');
          break;
        case 'page':
          result = generator.generatePage(name, options);
          log(`✅ Generated React page: ${result}`, 'success');
          break;
        case 'api':
          result = generator.generateAPIEndpoint(name, options);
          log(`✅ Generated API endpoint: ${result}`, 'success');
          break;
        case 'test':
          result = generator.generateTest(name, options);
          log(`✅ Generated test file: ${result}`, 'success');
          break;
        case 'feature':
          result = generator.generateFeature(name, options);
          log(`✅ Generated complete feature:`, 'success');
          result.forEach(item => {
            log(`   - ${item.type}: ${item.path}`, 'success');
          });
          break;
        default:
          log(`❌ Unknown type: ${type}`, 'error');
          log('Available types: component, page, api, test, feature', 'info');
          return;
      }
      
      if (options.preview) {
        log('📝 Preview generated code:', 'info');
        const preview = generator.previewTemplate(type, {
          [type === 'feature' ? 'featureName' : type + 'Name']: name,
          templateType: options.template,
          generatedDate: new Date().toISOString().split('T')[0]
        });
        console.log('\n' + preview + '\n');
      }
      
    } catch (error) {
      log(`❌ Error generating code: ${error.message}`, 'error');
    }
  });

program
  .command('ai:templates')
  .description('List available AI code generation templates')
  .action(() => {
    try {
      const AICodeGenerator = require('./ai-generator');
      const generator = new AICodeGenerator();
      
      const templates = generator.listTemplates();
      log('📚 Available AI Code Generation Templates:', 'info');
      templates.forEach(template => {
        log(`   - ${template}`, 'info');
      });
      log('', 'info');
      log('Usage: npm run dev-tool ai:generate <type> <name>', 'info');
      log('Example: npm run dev-tool ai:generate component Button', 'info');
    } catch (error) {
      log(`❌ Error listing templates: ${error.message}`, 'error');
    }
  });

// Memory Bank Commands
program
  .command('memory:create')
  .description('Create a new memory in the knowledge bank')
  .argument('<category>', 'Memory category')
  .argument('<title>', 'Memory title')
  .argument('[content]', 'Memory content')
  .option('-t, --tags <tags>', 'Comma-separated tags')
  .option('-p, --priority <priority>', 'Priority (high/medium/low)', 'medium')
  .option('-s, --status <status>', 'Status (active/archived/completed)', 'active')
  .action((category, title, content, options) => {
    try {
      const MemoryBank = require('../memory-bank/memory-bank');
      const memoryBank = new MemoryBank();
      
      if (!content) {
        content = 'Memory content not provided';
      }
      
      const tags = options.tags ? options.tags.split(',').map(t => t.trim()) : [];
      
      const memory = memoryBank.createMemory(category, title, content, {
        tags,
        priority: options.priority,
        status: options.status
      });
      
      log(`🧠 Memory created successfully!`, 'success');
      log(`ID: ${memory.id}`, 'info');
      log(`Category: ${memory.category}`, 'info');
      log(`Title: ${memory.title}`, 'info');
    } catch (error) {
      log(`❌ Error creating memory: ${error.message}`, 'error');
    }
  });

program
  .command('memory:search')
  .description('Search memories in the knowledge bank')
  .argument('<query>', 'Search query')
  .option('-c, --category <category>', 'Filter by category')
  .option('-p, --priority <priority>', 'Filter by priority')
  .option('--limit <number>', 'Limit results', '5')
  .action((query, options) => {
    try {
      const MemoryBank = require('../memory-bank/memory-bank');
      const memoryBank = new MemoryBank();
      
      const searchOptions = {};
      if (options.category) searchOptions.category = options.category;
      if (options.priority) searchOptions.priority = options.priority;
      
      const results = memoryBank.searchMemories(query, searchOptions);
      const limitedResults = results.slice(0, parseInt(options.limit));
      
      if (limitedResults.length === 0) {
        log('🔍 No memories found matching your search.', 'warning');
        return;
      }
      
      log(`🔍 Found ${limitedResults.length} memories:`, 'success');
      log('', 'info');
      
      limitedResults.forEach((memory, index) => {
        log(`${index + 1}. ${memory.title}`, 'info');
        log(`   Category: ${memory.category}`, 'info');
        log(`   Priority: ${memory.priority}`, 'info');
        log(`   Tags: ${memory.tags.join(', ')}`, 'info');
        log(`   Content: ${memory.content.substring(0, 80)}${memory.content.length > 80 ? '...' : ''}`, 'info');
        log('', 'info');
      });
    } catch (error) {
      log(`❌ Error searching memories: ${error.message}`, 'error');
    }
  });

program
  .command('memory:list')
  .description('List memories by category')
  .argument('[category]', 'Category to list (optional)')
  .action((category) => {
    try {
      const MemoryBank = require('../memory-bank/memory-bank');
      const memoryBank = new MemoryBank();
      
      if (category) {
        const memories = memoryBank.getMemoriesByCategory(category);
        if (memories.length === 0) {
          log(`📁 No memories found in category '${category}'.`, 'warning');
          return;
        }
        
        log(`📁 Memories in category '${category}':`, 'success');
        log('', 'info');
        
        memories.forEach((memory, index) => {
          log(`${index + 1}. ${memory.title}`, 'info');
          log(`   Priority: ${memory.priority}`, 'info');
          log(`   Tags: ${memory.tags.join(', ')}`, 'info');
          log('', 'info');
        });
      } else {
        const stats = memoryBank.getStats();
        log('📁 Memory Bank Categories:', 'success');
        log('', 'info');
        
        Object.entries(stats.categories).forEach(([cat, data]) => {
          log(`${cat}: ${data.count} memories`, 'info');
          log(`   ${data.description}`, 'info');
          log('', 'info');
        });
      }
    } catch (error) {
      log(`❌ Error listing memories: ${error.message}`, 'error');
    }
  });

program
  .command('memory:stats')
  .description('Show memory bank statistics')
  .action(() => {
    try {
      const MemoryBank = require('../memory-bank/memory-bank');
      const memoryBank = new MemoryBank();
      
      const stats = memoryBank.getStats();
      
      log('📊 Memory Bank Statistics:', 'success');
      log('', 'info');
      log(`Total Memories: ${stats.totalMemories}`, 'info');
      log(`Last Updated: ${stats.lastUpdated}`, 'info');
      log('', 'info');
      
      log('Categories:', 'info');
      Object.entries(stats.categories).forEach(([category, data]) => {
        log(`  ${category}: ${data.count} memories`, 'info');
        log(`    ${data.description}`, 'info');
      });
    } catch (error) {
      log(`❌ Error getting statistics: ${error.message}`, 'error');
    }
  });

// Project management
program
  .command('project:info')
  .description('Show project information and statistics')
  .action(() => {
    log('📋 Project Information:', 'info');
    
    // Count files
    const countFiles = (dir, ext) => {
      if (!fs.existsSync(dir)) return 0;
      const files = fs.readdirSync(dir, { recursive: true });
      return files.filter(file => file.endsWith(ext)).length;
    };
    
    const reactFiles = countFiles('frontend/src', '.jsx');
    const jsFiles = countFiles('frontend/src', '.js');
    const cssFiles = countFiles('frontend/src', '.css');
    const backendFiles = countFiles('backend', '.js');
    
    log(`📁 Frontend: ${reactFiles} React components, ${jsFiles} JS files, ${cssFiles} CSS files`, 'info');
    log(`📁 Backend: ${backendFiles} JavaScript files`, 'info');
    log(`📁 Total: ${reactFiles + jsFiles + cssFiles + backendFiles} files`, 'info');
    
    // Package info
    try {
      const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
      log(`📦 Project: ${packageJson.name}`, 'info');
      log(`📦 Version: ${packageJson.version}`, 'info');
      log(`📦 Dependencies: ${Object.keys(packageJson.dependencies || {}).length}`, 'info');
      log(`📦 Dev Dependencies: ${Object.keys(packageJson.devDependencies || {}).length}`, 'info');
    } catch (error) {
      log('❌ Could not read package.json', 'error');
    }
  });

// Help command
program
  .command('help:examples')
  .description('Show usage examples')
  .action(() => {
    log('📚 Usage Examples:', 'info');
    log('', 'info');
    log('🚀 Start development:', 'info');
    log('  medguide-dev start                    # Start full stack', 'info');
    log('  medguide-dev start --frontend         # Start only frontend', 'info');
    log('  medguide-dev start --port 4002       # Start on custom port', 'info');
    log('', 'info');
    log('🛑 Stop servers:', 'info');
    log('  medguide-dev stop                     # Stop all servers', 'info');
    log('', 'info');
    log('🔄 Restart:', 'info');
    log('  medguide-dev restart                  # Restart everything', 'info');
    log('', 'info');
    log('📊 Check status:', 'info');
    log('  medguide-dev status                   # Show server status', 'info');
    log('', 'info');
    log('🔍 Code quality:', 'info');
    log('  medguide-dev lint                     # Run linting', 'info');
    log('  medguide-dev test                     # Run tests', 'info');
    log('', 'info');
    log('🗄️ Database:', 'info');
    log('  medguide-dev db:reset                 # Reset database', 'info');
    log('  medguide-dev db:backup                # Backup database', 'info');
    log('', 'info');
    log('🤖 AI Assistant:', 'info');
    log('  medguide-dev ai:generate component Button', 'info');
    log('  medguide-dev ai:generate page Dashboard', 'info');
    log('', 'info');
    log('🧠 Memory Bank:', 'info');
    log('  medguide-dev memory:create bugs "Port conflict issue" "How to resolve port conflicts"', 'info');
    log('  medguide-dev memory:search "port conflict"', 'info');
    log('  medguide-dev memory:list bugs', 'info');
    log('  medguide-dev memory:stats', 'info');
    log('', 'info');
    log('📋 Project info:', 'info');
    log('  medguide-dev project:info             # Show project stats', 'info');
  });

// Parse command line arguments
program.parse();

// Show help if no command provided
if (!process.argv.slice(2).length) {
  log(banner, 'info');
  program.help();
}
