#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

class MemoryBank {
  constructor() {
    this.memoryDir = path.join(__dirname, 'memories');
    this.indexFile = path.join(this.memoryDir, 'index.json');
    this.categories = {
      'decisions': 'Development decisions and architectural choices',
      'bugs': 'Bugs encountered and their solutions',
      'features': 'Feature implementations and requirements',
      'learnings': 'Key learnings and insights',
      'todos': 'Future tasks and improvements',
      'configs': 'Configuration settings and environment setup',
      'apis': 'API documentation and usage patterns',
      'components': 'Component library and design patterns',
      'database': 'Database schemas and migrations',
      'deployment': 'Deployment procedures and environments'
    };
    
    this.initializeMemoryBank();
  }

  // Initialize memory bank structure
  initializeMemoryBank() {
    if (!fs.existsSync(this.memoryDir)) {
      fs.mkdirSync(this.memoryDir, { recursive: true });
    }

    // Create category directories
    Object.keys(this.categories).forEach(category => {
      const categoryDir = path.join(this.memoryDir, category);
      if (!fs.existsSync(categoryDir)) {
        fs.mkdirSync(categoryDir, { recursive: true });
      }
    });

    // Initialize index if it doesn't exist
    if (!fs.existsSync(this.indexFile)) {
      this.saveIndex({
        totalMemories: 0,
        categories: {},
        tags: {},
        lastUpdated: new Date().toISOString(),
        version: '1.0.0'
      });
    }
  }

  // Save memory index
  saveIndex(index) {
    fs.writeFileSync(this.indexFile, JSON.stringify(index, null, 2));
  }

  // Load memory index
  loadIndex() {
    try {
      return JSON.parse(fs.readFileSync(this.indexFile, 'utf8'));
    } catch (error) {
      return {
        totalMemories: 0,
        categories: {},
        tags: {},
        lastUpdated: new Date().toISOString(),
        version: '1.0.0'
      };
    }
  }

  // Create a new memory
  createMemory(category, title, content, options = {}) {
    const index = this.loadIndex();
    const memoryId = crypto.randomUUID();
    const timestamp = new Date().toISOString();
    
    const memory = {
      id: memoryId,
      category,
      title,
      content,
      tags: options.tags || [],
      priority: options.priority || 'medium',
      status: options.status || 'active',
      relatedMemories: options.relatedMemories || [],
      createdAt: timestamp,
      updatedAt: timestamp,
      author: options.author || 'system',
      version: options.version || '1.0.0'
    };

    // Save memory file
    const memoryFile = path.join(this.memoryDir, category, `${memoryId}.json`);
    fs.writeFileSync(memoryFile, JSON.stringify(memory, null, 2));

    // Update index
    if (!index.categories[category]) {
      index.categories[category] = { count: 0, memories: [] };
    }
    index.categories[category].count++;
    index.categories[category].memories.push(memoryId);

    // Update tags
    memory.tags.forEach(tag => {
      if (!index.tags[tag]) {
        index.tags[tag] = [];
      }
      index.tags[tag].push(memoryId);
    });

    index.totalMemories++;
    index.lastUpdated = timestamp;
    this.saveIndex(index);

    return memory;
  }

  // Retrieve a memory by ID
  getMemory(memoryId) {
    const index = this.loadIndex();
    
    // Search in all categories
    for (const [category, categoryData] of Object.entries(index.categories)) {
      if (categoryData.memories.includes(memoryId)) {
        const memoryFile = path.join(this.memoryDir, category, `${memoryId}.json`);
        if (fs.existsSync(memoryFile)) {
          return JSON.parse(fs.readFileSync(memoryFile, 'utf8'));
        }
      }
    }
    
    return null;
  }

  // Search memories
  searchMemories(query, options = {}) {
    const index = this.loadIndex();
    const results = [];
    const searchTerm = query.toLowerCase();

    // Search in all categories
    for (const [category, categoryData] of Object.entries(index.categories)) {
      for (const memoryId of categoryData.memories) {
        const memory = this.getMemory(memoryId);
        if (memory) {
          const searchableText = `${memory.title} ${memory.content} ${memory.tags.join(' ')}`.toLowerCase();
          
          if (searchableText.includes(searchTerm)) {
            // Apply filters
            if (options.category && memory.category !== options.category) continue;
            if (options.priority && memory.priority !== options.priority) continue;
            if (options.status && memory.status !== options.status) continue;
            if (options.tags && !options.tags.some(tag => memory.tags.includes(tag))) continue;
            
            results.push(memory);
          }
        }
      }
    }

    // Sort results
    if (options.sortBy === 'priority') {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      results.sort((a, b) => priorityOrder[b.priority] - priorityOrder[a.priority]);
    } else if (options.sortBy === 'date') {
      results.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
    }

    return results;
  }

  // Update a memory
  updateMemory(memoryId, updates) {
    const memory = this.getMemory(memoryId);
    if (!memory) return null;

    // Update fields
    Object.assign(memory, updates, { updatedAt: new Date().toISOString() });

    // Save updated memory
    const memoryFile = path.join(this.memoryDir, memory.category, `${memoryId}.json`);
    fs.writeFileSync(memoryFile, JSON.stringify(memory, null, 2));

    // Update index if category changed
    const index = this.loadIndex();
    if (updates.category && updates.category !== memory.category) {
      // Remove from old category
      const oldCategory = index.categories[memory.category];
      if (oldCategory) {
        oldCategory.memories = oldCategory.memories.filter(id => id !== memoryId);
        oldCategory.count--;
      }

      // Add to new category
      if (!index.categories[updates.category]) {
        index.categories[updates.category] = { count: 0, memories: [] };
      }
      index.categories[updates.category].memories.push(memoryId);
      index.categories[updates.category].count++;
    }

    this.saveIndex(index);
    return memory;
  }

  // Delete a memory
  deleteMemory(memoryId) {
    const memory = this.getMemory(memoryId);
    if (!memory) return false;

    const index = this.loadIndex();
    
    // Remove from category
    if (index.categories[memory.category]) {
      index.categories[memory.category].memories = index.categories[memory.category].memories.filter(id => id !== memoryId);
      index.categories[memory.category].count--;
    }

    // Remove from tags
    memory.tags.forEach(tag => {
      if (index.tags[tag]) {
        index.tags[tag] = index.tags[tag].filter(id => id !== memoryId);
      }
    });

    // Delete memory file
    const memoryFile = path.join(this.memoryDir, memory.category, `${memoryId}.json`);
    if (fs.existsSync(memoryFile)) {
      fs.unlinkSync(memoryFile);
    }

    index.totalMemories--;
    index.lastUpdated = new Date().toISOString();
    this.saveIndex(index);

    return true;
  }

  // Get memories by category
  getMemoriesByCategory(category, options = {}) {
    const index = this.loadIndex();
    if (!index.categories[category]) return [];

    const memories = [];
    for (const memoryId of index.categories[category].memories) {
      const memory = this.getMemory(memoryId);
      if (memory) {
        // Apply filters
        if (options.priority && memory.priority !== options.priority) continue;
        if (options.status && memory.status !== options.status) continue;
        memories.push(memory);
      }
    }

    // Sort
    if (options.sortBy === 'priority') {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      memories.sort((a, b) => priorityOrder[b.priority] - priorityOrder[a.priority]);
    } else if (options.sortBy === 'date') {
      memories.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
    }

    return memories;
  }

  // Get memories by tag
  getMemoriesByTag(tag) {
    const index = this.loadIndex();
    if (!index.tags[tag]) return [];

    const memories = [];
    for (const memoryId of index.tags[tag]) {
      const memory = this.getMemory(memoryId);
      if (memory) {
        memories.push(memory);
      }
    }

    return memories;
  }

  // Get memory statistics
  getStats() {
    const index = this.loadIndex();
    const stats = {
      totalMemories: index.totalMemories,
      categories: {},
      tags: {},
      lastUpdated: index.lastUpdated,
      version: index.version
    };

    // Category stats
    Object.entries(index.categories).forEach(([category, data]) => {
      stats.categories[category] = {
        count: data.count,
        description: this.categories[category]
      };
    });

    // Tag stats
    Object.entries(index.tags).forEach(([tag, memories]) => {
      stats.tags[tag] = memories.length;
    });

    return stats;
  }

  // Export memories
  exportMemories(format = 'json', options = {}) {
    const memories = [];
    const index = this.loadIndex();

    for (const [category, categoryData] of Object.entries(index.categories)) {
      for (const memoryId of categoryData.memories) {
        const memory = this.getMemory(memoryId);
        if (memory) {
          // Apply filters
          if (options.category && memory.category !== options.category) continue;
          if (options.priority && memory.priority !== options.priority) continue;
          if (options.status && memory.status !== options.status) continue;
          
          memories.push(memory);
        }
      }
    }

    if (format === 'json') {
      return JSON.stringify(memories, null, 2);
    } else if (format === 'csv') {
      return this.convertToCSV(memories);
    } else if (format === 'markdown') {
      return this.convertToMarkdown(memories);
    }

    return memories;
  }

  // Convert to CSV
  convertToCSV(memories) {
    if (memories.length === 0) return '';
    
    const headers = ['ID', 'Category', 'Title', 'Content', 'Tags', 'Priority', 'Status', 'Created', 'Updated'];
    const rows = memories.map(memory => [
      memory.id,
      memory.category,
      memory.title,
      memory.content.replace(/\n/g, ' '),
      memory.tags.join(';'),
      memory.priority,
      memory.status,
      memory.createdAt,
      memory.updatedAt
    ]);

    return [headers, ...rows].map(row => row.map(field => `"${field}"`).join(',')).join('\n');
  }

  // Convert to Markdown
  convertToMarkdown(memories) {
    if (memories.length === 0) return '# No Memories Found\n';
    
    let markdown = '# Memory Bank Export\n\n';
    markdown += `Generated on: ${new Date().toISOString()}\n\n`;
    
    const byCategory = {};
    memories.forEach(memory => {
      if (!byCategory[memory.category]) {
        byCategory[memory.category] = [];
      }
      byCategory[memory.category].push(memory);
    });

    Object.entries(byCategory).forEach(([category, categoryMemories]) => {
      markdown += `## ${category.charAt(0).toUpperCase() + category.slice(1)}\n\n`;
      
      categoryMemories.forEach(memory => {
        markdown += `### ${memory.title}\n\n`;
        markdown += `**ID:** ${memory.id}\n\n`;
        markdown += `**Priority:** ${memory.priority}\n\n`;
        markdown += `**Status:** ${memory.status}\n\n`;
        markdown += `**Tags:** ${memory.tags.map(tag => `\`${tag}\``).join(', ')}\n\n`;
        markdown += `**Created:** ${memory.createdAt}\n\n`;
        markdown += `**Updated:** ${memory.updatedAt}\n\n`;
        markdown += `${memory.content}\n\n`;
        markdown += `---\n\n`;
      });
    });

    return markdown;
  }

  // Backup memory bank
  backup() {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupDir = path.join(process.cwd(), 'backups', 'memory-bank');
    
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }

    const backupPath = path.join(backupDir, `memory-bank-${timestamp}.zip`);
    
    // For now, just copy the directory
    const tempBackup = path.join(backupDir, `memory-bank-${timestamp}`);
    if (fs.existsSync(tempBackup)) {
      fs.rmSync(tempBackup, { recursive: true, force: true });
    }
    
    // Copy memory bank
    this.copyDirectory(this.memoryDir, tempBackup);
    
    return tempBackup;
  }

  // Copy directory recursively
  copyDirectory(src, dest) {
    if (!fs.existsSync(dest)) {
      fs.mkdirSync(dest, { recursive: true });
    }

    const entries = fs.readdirSync(src, { withFileTypes: true });
    
    for (const entry of entries) {
      const srcPath = path.join(src, entry.name);
      const destPath = path.join(dest, entry.name);
      
      if (entry.isDirectory()) {
        this.copyDirectory(srcPath, destPath);
      } else {
        fs.copyFileSync(srcPath, destPath);
      }
    }
  }

  // Restore memory bank from backup
  restore(backupPath) {
    if (!fs.existsSync(backupPath)) {
      throw new Error('Backup path does not exist');
    }

    // Clear current memory bank
    if (fs.existsSync(this.memoryDir)) {
      fs.rmSync(this.memoryDir, { recursive: true, force: true });
    }

    // Restore from backup
    this.copyDirectory(backupPath, this.memoryDir);
    
    // Reinitialize
    this.initializeMemoryBank();
    
    return true;
  }
}

module.exports = MemoryBank;
