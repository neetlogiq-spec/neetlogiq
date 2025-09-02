#!/usr/bin/env node

const { program } = require('commander');
const MemoryBank = require('../memory-bank/memory-bank');

// Colors for output
const colors = {
  info: '\x1b[36m',    // Cyan
  success: '\x1b[32m', // Green
  warning: '\x1b[33m', // Yellow
  error: '\x1b[31m',   // Red
  reset: '\x1b[0m'     // Reset
};

const log = (message, type = 'info') => {
  console.log(`${colors[type]}${message}${colors.reset}`);
};

// Initialize memory bank
const memoryBank = new MemoryBank();

// ASCII Art Banner
const banner = `
╔══════════════════════════════════════════════════════════════╗
║                    🧠 MEMORY BANK 🧠                        ║
║              AI-Powered Knowledge Management                ║
╚══════════════════════════════════════════════════════════════╝
`;

program
  .name('memory-bank')
  .description('AI-Powered Memory Bank for Development Knowledge')
  .version('1.0.0');

// Create memory
program
  .command('create')
  .description('Create a new memory')
  .argument('<category>', 'Memory category')
  .argument('<title>', 'Memory title')
  .argument('[content]', 'Memory content')
  .option('-t, --tags <tags>', 'Comma-separated tags')
  .option('-p, --priority <priority>', 'Priority (high/medium/low)', 'medium')
  .option('-s, --status <status>', 'Status (active/archived/completed)', 'active')
  .option('-a, --author <author>', 'Author name', 'system')
  .option('-v, --version <version>', 'Version number', '1.0.0')
  .action((category, title, content, options) => {
    try {
      // Get content from stdin if not provided
      if (!content) {
        content = require('fs').readFileSync(0, 'utf8').trim();
      }

      const tags = options.tags ? options.tags.split(',').map(t => t.trim()) : [];
      
      const memory = memoryBank.createMemory(category, title, content, {
        tags,
        priority: options.priority,
        status: options.status,
        author: options.author,
        version: options.version
      });

      log(`✅ Memory created successfully!`, 'success');
      log(`ID: ${memory.id}`, 'info');
      log(`Category: ${memory.category}`, 'info');
      log(`Title: ${memory.title}`, 'info');
      log(`Tags: ${memory.tags.join(', ')}`, 'info');
      log(`Priority: ${memory.priority}`, 'info');
      log(`Status: ${memory.status}`, 'info');
    } catch (error) {
      log(`❌ Error creating memory: ${error.message}`, 'error');
    }
  });

// Search memories
program
  .command('search')
  .description('Search memories')
  .argument('<query>', 'Search query')
  .option('-c, --category <category>', 'Filter by category')
  .option('-p, --priority <priority>', 'Filter by priority')
  .option('-s, --status <status>', 'Filter by status')
  .option('-t, --tags <tags>', 'Filter by tags (comma-separated)')
  .option('--sort-by <field>', 'Sort by (priority/date)')
  .option('--limit <number>', 'Limit results', '10')
  .action((query, options) => {
    try {
      const searchOptions = {};
      if (options.category) searchOptions.category = options.category;
      if (options.priority) searchOptions.priority = options.priority;
      if (options.status) searchOptions.status = options.status;
      if (options.tags) searchOptions.tags = options.tags.split(',').map(t => t.trim());
      if (options.sortBy) searchOptions.sortBy = options.sortBy;

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
        log(`   ID: ${memory.id}`, 'info');
        log(`   Category: ${memory.category}`, 'info');
        log(`   Priority: ${memory.priority}`, 'info');
        log(`   Status: ${memory.status}`, 'info');
        log(`   Tags: ${memory.tags.join(', ')}`, 'info');
        log(`   Created: ${memory.createdAt}`, 'info');
        log(`   Content: ${memory.content.substring(0, 100)}${memory.content.length > 100 ? '...' : ''}`, 'info');
        log('', 'info');
      });
    } catch (error) {
      log(`❌ Error searching memories: ${error.message}`, 'error');
    }
  });

// Get memory by ID
program
  .command('get')
  .description('Get a specific memory by ID')
  .argument('<id>', 'Memory ID')
  .action((id) => {
    try {
      const memory = memoryBank.getMemory(id);
      if (!memory) {
        log(`❌ Memory with ID ${id} not found.`, 'error');
        return;
      }

      log(`📖 Memory Details:`, 'success');
      log('', 'info');
      log(`Title: ${memory.title}`, 'info');
      log(`ID: ${memory.id}`, 'info');
      log(`Category: ${memory.category}`, 'info');
      log(`Priority: ${memory.priority}`, 'info');
      log(`Status: ${memory.status}`, 'info');
      log(`Tags: ${memory.tags.join(', ')}`, 'info');
      log(`Author: ${memory.author}`, 'info');
      log(`Version: ${memory.version}`, 'info');
      log(`Created: ${memory.createdAt}`, 'info');
      log(`Updated: ${memory.updatedAt}`, 'info');
      log('', 'info');
      log(`Content:`, 'info');
      log(memory.content, 'info');
    } catch (error) {
      log(`❌ Error getting memory: ${error.message}`, 'error');
    }
  });

// List memories by category
program
  .command('list')
  .description('List memories by category')
  .argument('[category]', 'Category to list (optional)')
  .option('-p, --priority <priority>', 'Filter by priority')
  .option('-s, --status <status>', 'Filter by status')
  .option('--sort-by <field>', 'Sort by (priority/date)')
  .action((category, options) => {
    try {
      if (category) {
        const memories = memoryBank.getMemoriesByCategory(category, options);
        if (memories.length === 0) {
          log(`📁 No memories found in category '${category}'.`, 'warning');
          return;
        }

        log(`📁 Memories in category '${category}':`, 'success');
        log('', 'info');

        memories.forEach((memory, index) => {
          log(`${index + 1}. ${memory.title}`, 'info');
          log(`   ID: ${memory.id}`, 'info');
          log(`   Priority: ${memory.priority}`, 'info');
          log(`   Status: ${memory.status}`, 'info');
          log(`   Tags: ${memory.tags.join(', ')}`, 'info');
          log(`   Created: ${memory.createdAt}`, 'info');
          log('', 'info');
        });
      } else {
        // Show all categories with counts
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

// Update memory
program
  .command('update')
  .description('Update a memory')
  .argument('<id>', 'Memory ID')
  .option('-t, --title <title>', 'New title')
  .option('-c, --content <content>', 'New content')
  .option('--category <category>', 'New category')
  .option('--tags <tags>', 'New tags (comma-separated)')
  .option('--priority <priority>', 'New priority')
  .option('--status <status>', 'New status')
  .option('--version <version>', 'New version')
  .action((id, options) => {
    try {
      const updates = {};
      if (options.title) updates.title = options.title;
      if (options.content) updates.content = options.content;
      if (options.category) updates.category = options.category;
      if (options.tags) updates.tags = options.tags.split(',').map(t => t.trim());
      if (options.priority) updates.priority = options.priority;
      if (options.status) updates.status = options.status;
      if (options.version) updates.version = options.version;

      const memory = memoryBank.updateMemory(id, updates);
      if (!memory) {
        log(`❌ Memory with ID ${id} not found.`, 'error');
        return;
      }

      log(`✅ Memory updated successfully!`, 'success');
      log(`ID: ${memory.id}`, 'info');
      log(`Title: ${memory.title}`, 'info');
      log(`Updated: ${memory.updatedAt}`, 'info');
    } catch (error) {
      log(`❌ Error updating memory: ${error.message}`, 'error');
    }
  });

// Delete memory
program
  .command('delete')
  .description('Delete a memory')
  .argument('<id>', 'Memory ID')
  .option('-f, --force', 'Force deletion without confirmation')
  .action((id, options) => {
    try {
      const memory = memoryBank.getMemory(id);
      if (!memory) {
        log(`❌ Memory with ID ${id} not found.`, 'error');
        return;
      }

      if (!options.force) {
        log(`⚠️  Are you sure you want to delete memory '${memory.title}'?`, 'warning');
        log(`   ID: ${memory.id}`, 'info');
        log(`   Category: ${memory.category}`, 'info');
        log(`   Use --force to confirm deletion.`, 'info');
        return;
      }

      const deleted = memoryBank.deleteMemory(id);
      if (deleted) {
        log(`✅ Memory '${memory.title}' deleted successfully.`, 'success');
      } else {
        log(`❌ Failed to delete memory.`, 'error');
      }
    } catch (error) {
      log(`❌ Error deleting memory: ${error.message}`, 'error');
    }
  });

// Export memories
program
  .command('export')
  .description('Export memories')
  .option('-f, --format <format>', 'Export format (json/csv/markdown)', 'json')
  .option('-c, --category <category>', 'Filter by category')
  .option('-p, --priority <priority>', 'Filter by priority')
  .option('-s, --status <status>', 'Filter by status')
  .option('-o, --output <file>', 'Output file path')
  .action((options) => {
    try {
      const exportOptions = {};
      if (options.category) exportOptions.category = options.category;
      if (options.priority) exportOptions.priority = options.priority;
      if (options.status) exportOptions.status = options.status;

      const exportData = memoryBank.exportMemories(options.format, exportOptions);
      
      if (options.output) {
        require('fs').writeFileSync(options.output, exportData);
        log(`✅ Memories exported to ${options.output}`, 'success');
      } else {
        console.log(exportData);
      }
    } catch (error) {
      log(`❌ Error exporting memories: ${error.message}`, 'error');
    }
  });

// Backup memory bank
program
  .command('backup')
  .description('Create a backup of the memory bank')
  .option('-o, --output <path>', 'Custom backup output path')
  .action((options) => {
    try {
      const backupPath = memoryBank.backup();
      log(`✅ Memory bank backed up to: ${backupPath}`, 'success');
      
      if (options.output) {
        // Copy to custom location
        const fs = require('fs');
        const path = require('path');
        if (fs.existsSync(options.output)) {
          fs.rmSync(options.output, { recursive: true, force: true });
        }
        memoryBank.copyDirectory(backupPath, options.output);
        log(`✅ Backup also copied to: ${options.output}`, 'success');
      }
    } catch (error) {
      log(`❌ Error creating backup: ${error.message}`, 'error');
    }
  });

// Restore memory bank
program
  .command('restore')
  .description('Restore memory bank from backup')
  .argument('<backup-path>', 'Path to backup directory')
  .option('-f, --force', 'Force restoration without confirmation')
  .action((backupPath, options) => {
    try {
      if (!options.force) {
        log(`⚠️  Are you sure you want to restore the memory bank from backup?`, 'warning');
        log(`   This will overwrite all current memories!`, 'warning');
        log(`   Backup path: ${backupPath}`, 'info');
        log(`   Use --force to confirm restoration.`, 'info');
        return;
      }

      memoryBank.restore(backupPath);
      log(`✅ Memory bank restored successfully from: ${backupPath}`, 'success');
    } catch (error) {
      log(`❌ Error restoring memory bank: ${error.message}`, 'error');
    }
  });

// Show statistics
program
  .command('stats')
  .description('Show memory bank statistics')
  .action(() => {
    try {
      const stats = memoryBank.getStats();
      
      log('📊 Memory Bank Statistics:', 'success');
      log('', 'info');
      log(`Total Memories: ${stats.totalMemories}`, 'info');
      log(`Last Updated: ${stats.lastUpdated}`, 'info');
      log(`Version: ${stats.version}`, 'info');
      log('', 'info');
      
      log('Categories:', 'info');
      Object.entries(stats.categories).forEach(([category, data]) => {
        log(`  ${category}: ${data.count} memories`, 'info');
        log(`    ${data.description}`, 'info');
      });
      log('', 'info');
      
      log('Top Tags:', 'info');
      const sortedTags = Object.entries(stats.tags)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 10);
      
      sortedTags.forEach(([tag, count]) => {
        log(`  ${tag}: ${count} memories`, 'info');
      });
    } catch (error) {
      log(`❌ Error getting statistics: ${error.message}`, 'error');
    }
  });

// Show available categories
program
  .command('categories')
  .description('Show available memory categories')
  .action(() => {
    try {
      const stats = memoryBank.getStats();
      
      log('📁 Available Memory Categories:', 'success');
      log('', 'info');
      
      Object.entries(stats.categories).forEach(([category, data]) => {
        log(`${category}:`, 'info');
        log(`  Description: ${data.description}`, 'info');
        log(`  Count: ${data.count} memories`, 'info');
        log('', 'info');
      });
    } catch (error) {
      log(`❌ Error getting categories: ${error.message}`, 'error');
    }
  });

// Parse command line arguments
program.parse();

// Show help if no command provided
if (!process.argv.slice(2).length) {
  log(banner, 'info');
  program.help();
}
