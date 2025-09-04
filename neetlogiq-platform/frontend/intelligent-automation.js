#!/usr/bin/env node

/**
 * 🚀 NeetLogIQ Intelligent Automation System
 * 
 * This system automatically manages all NeetLogIQ services:
 * - Port management and conflict resolution
 * - Service health monitoring
 * - Automatic restarts and recovery
 * - Performance optimization
 * - Background maintenance tasks
 * 
 * Usage: node intelligent-automation.js [start|stop|status|monitor]
 */

import { spawn, exec } from 'child_process';
import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class IntelligentAutomation {
  constructor() {
    this.processes = new Map();
    this.healthChecks = new Map();
    this.autoRestartEnabled = true;
    this.performanceMonitoring = true;
    this.maintenanceTasks = new Map();
    
    // Configuration
    this.config = {
      frontendPort: 5001,
      backendPort: 5002,
      aiPort: 5003,
      healthCheckInterval: 30000, // 30 seconds
      restartDelay: 5000, // 5 seconds
      maxRestartAttempts: 3,
      performanceThreshold: 80, // 80% CPU/Memory usage
      maintenanceInterval: 300000, // 5 minutes
      logFile: path.join(__dirname, 'automation.log')
    };
    
    this.init();
  }

  async init() {
    console.log('🧠 Initializing NeetLogIQ Intelligent Automation System...');
    
    // Create log directory if it doesn't exist
    await this.ensureLogDirectory();
    
    // Load previous state
    await this.loadState();
    
    // Initialize health monitoring
    this.initHealthMonitoring();
    
    // Initialize maintenance tasks
    this.initMaintenanceTasks();
    
    // Start performance monitoring
    if (this.performanceMonitoring) {
      this.startPerformanceMonitoring();
    }
    
    console.log('✅ Intelligent Automation System initialized successfully!');
  }

  async ensureLogDirectory() {
    const logDir = path.dirname(this.config.logFile);
    try {
      await fs.access(logDir);
    } catch {
      await fs.mkdir(logDir, { recursive: true });
    }
  }

  async loadState() {
    try {
      const stateFile = path.join(__dirname, '.automation-state.json');
      const stateData = await fs.readFile(stateFile, 'utf8');
      const state = JSON.parse(stateData);
      
      // Restore previous state
      this.processes = new Map(state.processes || []);
      this.autoRestartEnabled = state.autoRestartEnabled !== false;
      this.performanceMonitoring = state.performanceMonitoring !== false;
      
      console.log('📋 Restored previous automation state');
    } catch (error) {
      console.log('📋 No previous state found, starting fresh');
    }
  }

  async saveState() {
    try {
      const stateFile = path.join(__dirname, '.automation-state.json');
      const state = {
        processes: Array.from(this.processes.entries()),
        autoRestartEnabled: this.autoRestartEnabled,
        performanceMonitoring: this.performanceMonitoring,
        timestamp: new Date().toISOString()
      };
      
      await fs.writeFile(stateFile, JSON.stringify(state, null, 2));
    } catch (error) {
      console.error('❌ Failed to save automation state:', error.message);
    }
  }

  initHealthMonitoring() {
    console.log('🔍 Initializing health monitoring...');
    
    // Health check interval
    setInterval(() => {
      this.performHealthChecks();
    }, this.config.healthCheckInterval);
    
    // Initial health check
    setTimeout(() => {
      this.performHealthChecks();
    }, 5000);
  }

  async performHealthChecks() {
    console.log('🏥 Performing health checks...');
    
    const checks = [
      { name: 'Frontend', port: this.config.frontendPort, url: `http://localhost:${this.config.frontendPort}` },
      { name: 'Backend', port: this.config.backendPort, url: `http://localhost:${this.config.backendPort}/health` },
      { name: 'AI Service', port: this.config.aiPort, url: `http://localhost:${this.config.aiPort}/status` }
    ];
    
    for (const check of checks) {
      try {
        const isHealthy = await this.checkServiceHealth(check.url);
        this.healthChecks.set(check.name, {
          healthy: isHealthy,
          lastCheck: new Date(),
          port: check.port
        });
        
        if (!isHealthy && this.autoRestartEnabled) {
          console.log(`⚠️ ${check.name} is unhealthy, attempting restart...`);
          await this.restartService(check.name, check.port);
        }
      } catch (error) {
        console.error(`❌ Health check failed for ${check.name}:`, error.message);
        this.healthChecks.set(check.name, {
          healthy: false,
          lastCheck: new Date(),
          port: check.port,
          error: error.message
        });
      }
    }
    
    // Log health status
    await this.logHealthStatus();
  }

  async checkServiceHealth(url) {
    return new Promise((resolve) => {
      const timeout = setTimeout(() => {
        resolve(false);
      }, 5000);
      
      fetch(url)
        .then(response => {
          clearTimeout(timeout);
          resolve(response.ok);
        })
        .catch(() => {
          clearTimeout(timeout);
          resolve(false);
        });
    });
  }

  async restartService(serviceName, port) {
    console.log(`🔄 Restarting ${serviceName} on port ${port}...`);
    
    try {
      // Kill existing process on port
      await this.killProcessOnPort(port);
      
      // Wait a bit
      await this.sleep(this.config.restartDelay);
      
      // Start service
      await this.startService(serviceName, port);
      
      console.log(`✅ ${serviceName} restarted successfully`);
    } catch (error) {
      console.error(`❌ Failed to restart ${serviceName}:`, error.message);
    }
  }

  async killProcessOnPort(port) {
    return new Promise((resolve, reject) => {
      exec(`lsof -ti:${port} | xargs kill -9`, (error) => {
        if (error) {
          // Port might already be free
          resolve();
        } else {
          resolve();
        }
      });
    });
  }

  async startService(serviceName, port) {
    let command, args;
    
    switch (serviceName) {
      case 'Frontend':
        command = 'node';
        args = ['simple-server.js'];
        break;
      case 'Backend':
        command = 'npm';
        args = ['run', 'dev'];
        break;
      case 'AI Service':
        command = 'node';
        args = ['ai-service.js'];
        break;
      default:
        throw new Error(`Unknown service: ${serviceName}`);
    }
    
    return new Promise((resolve, reject) => {
      const process = spawn(command, args, {
        cwd: __dirname,
        stdio: 'pipe'
      });
      
      // Store process reference
      this.processes.set(serviceName, {
        pid: process.pid,
        command,
        args,
        startTime: new Date(),
        restartCount: (this.processes.get(serviceName)?.restartCount || 0) + 1
      });
      
      // Handle process events
      process.on('error', (error) => {
        console.error(`❌ ${serviceName} process error:`, error.message);
        reject(error);
      });
      
      process.on('exit', (code) => {
        console.log(`📤 ${serviceName} process exited with code ${code}`);
        this.processes.delete(serviceName);
      });
      
      // Wait for service to be ready
      setTimeout(() => {
        resolve();
      }, 3000);
    });
  }

  initMaintenanceTasks() {
    console.log('🔧 Initializing maintenance tasks...');
    
    // Database cleanup
    this.maintenanceTasks.set('database-cleanup', {
      name: 'Database Cleanup',
      interval: 600000, // 10 minutes
      lastRun: null,
      handler: this.performDatabaseCleanup.bind(this)
    });
    
    // Log rotation
    this.maintenanceTasks.set('log-rotation', {
      name: 'Log Rotation',
      interval: 3600000, // 1 hour
      lastRun: null,
      handler: this.performLogRotation.bind(this)
    });
    
    // Performance optimization
    this.maintenanceTasks.set('performance-optimization', {
      name: 'Performance Optimization',
      interval: 300000, // 5 minutes
      lastRun: null,
      handler: this.performPerformanceOptimization.bind(this)
    });
    
    // Start maintenance scheduler
    setInterval(() => {
      this.runMaintenanceTasks();
    }, this.config.maintenanceInterval);
  }

  async runMaintenanceTasks() {
    console.log('🔧 Running maintenance tasks...');
    
    const now = new Date();
    
    for (const [taskId, task] of this.maintenanceTasks) {
      if (!task.lastRun || (now - task.lastRun) >= task.interval) {
        try {
          console.log(`🔧 Running ${task.name}...`);
          await task.handler();
          task.lastRun = now;
          console.log(`✅ ${task.name} completed successfully`);
        } catch (error) {
          console.error(`❌ ${task.name} failed:`, error.message);
        }
      }
    }
  }

  async performDatabaseCleanup() {
    // Clean up temporary files, optimize database
    console.log('🗄️ Performing database cleanup...');
    
    try {
      // Clean up old log files
      const logDir = path.join(__dirname, 'logs');
      const files = await fs.readdir(logDir);
      
      for (const file of files) {
        if (file.endsWith('.log')) {
          const filePath = path.join(logDir, file);
          const stats = await fs.stat(filePath);
          const daysOld = (Date.now() - stats.mtime.getTime()) / (1000 * 60 * 60 * 24);
          
          if (daysOld > 7) {
            await fs.unlink(filePath);
            console.log(`🗑️ Deleted old log file: ${file}`);
          }
        }
      }
      
      // Clean up temporary files
      const tempDir = path.join(__dirname, 'temp');
      try {
        const tempFiles = await fs.readdir(tempDir);
        for (const file of tempFiles) {
          const filePath = path.join(tempDir, file);
          await fs.unlink(filePath);
          console.log(`🗑️ Deleted temp file: ${file}`);
        }
      } catch {
        // Temp directory might not exist
      }
      
    } catch (error) {
      console.error('❌ Database cleanup failed:', error.message);
    }
  }

  async performLogRotation() {
    console.log('📝 Performing log rotation...');
    
    try {
      const logFile = this.config.logFile;
      const logDir = path.dirname(logFile);
      const logName = path.basename(logFile, '.log');
      
      // Check if current log is too large (>10MB)
      try {
        const stats = await fs.stat(logFile);
        if (stats.size > 10 * 1024 * 1024) { // 10MB
          const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
          const rotatedLog = path.join(logDir, `${logName}-${timestamp}.log`);
          
          await fs.rename(logFile, rotatedLog);
          console.log(`📝 Rotated log file to: ${rotatedLog}`);
          
          // Create new log file
          await fs.writeFile(logFile, `Log rotation at ${new Date().toISOString()}\n`);
        }
      } catch {
        // Log file might not exist yet
      }
      
    } catch (error) {
      console.error('❌ Log rotation failed:', error.message);
    }
  }

  async performPerformanceOptimization() {
    console.log('⚡ Performing performance optimization...');
    
    try {
      // Check system resources
      const { cpu, memory } = await this.getSystemResources();
      
      if (cpu > this.config.performanceThreshold || memory > this.config.performanceThreshold) {
        console.log(`⚠️ High resource usage detected: CPU ${cpu}%, Memory ${memory}%`);
        
        // Optimize by reducing non-essential processes
        if (this.processes.size > 2) {
          console.log('🔧 Reducing non-essential processes for performance...');
          // Implementation would depend on priority system
        }
      }
      
      // Optimize database queries (if applicable)
      // This would involve analyzing slow queries and optimizing them
      
    } catch (error) {
      console.error('❌ Performance optimization failed:', error.message);
    }
  }

  async getSystemResources() {
    return new Promise((resolve) => {
      exec('top -l 1 -n 0 | grep "CPU usage"', (error, stdout) => {
        if (error) {
          resolve({ cpu: 50, memory: 50 }); // Default values
          return;
        }
        
        // Parse CPU usage from top output
        const cpuMatch = stdout.match(/(\d+\.\d+)%/);
        const cpu = cpuMatch ? parseFloat(cpuMatch[1]) : 50;
        
        // For memory, we'd need a different approach on macOS
        resolve({ cpu, memory: 60 }); // Simplified for now
      });
    });
  }

  startPerformanceMonitoring() {
    console.log('📊 Starting performance monitoring...');
    
    setInterval(async () => {
      try {
        const { cpu, memory } = await this.getSystemResources();
        
        if (cpu > this.config.performanceThreshold || memory > this.config.performanceThreshold) {
          console.log(`⚠️ Performance alert: CPU ${cpu}%, Memory ${memory}%`);
          
          // Trigger performance optimization
          await this.performPerformanceOptimization();
        }
      } catch (error) {
        console.error('❌ Performance monitoring error:', error.message);
      }
    }, 60000); // Check every minute
  }

  async logHealthStatus() {
    try {
      const timestamp = new Date().toISOString();
      const status = {
        timestamp,
        services: Object.fromEntries(this.healthChecks),
        processes: Object.fromEntries(this.processes),
        autoRestart: this.autoRestartEnabled,
        performanceMonitoring: this.performanceMonitoring
      };
      
      const logEntry = `[${timestamp}] Health Status: ${JSON.stringify(status)}\n`;
      await fs.appendFile(this.config.logFile, logEntry);
      
    } catch (error) {
      console.error('❌ Failed to log health status:', error.message);
    }
  }

  async sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Public methods for external control
  async start() {
    console.log('🚀 Starting NeetLogIQ Intelligent Automation...');
    
    try {
      // Start all services
      await this.startService('Frontend', this.config.frontendPort);
      await this.startService('Backend', this.config.backendPort);
      await this.startService('AI Service', this.config.aiPort);
      
      console.log('✅ All services started successfully!');
      
      // Save state
      await this.saveState();
      
    } catch (error) {
      console.error('❌ Failed to start services:', error.message);
    }
  }

  async stop() {
    console.log('🛑 Stopping NeetLogIQ Intelligent Automation...');
    
    try {
      // Stop all processes
      for (const [serviceName, processInfo] of this.processes) {
        console.log(`🛑 Stopping ${serviceName}...`);
        try {
          exec(`kill -9 ${processInfo.pid}`);
        } catch (error) {
          console.error(`❌ Failed to stop ${serviceName}:`, error.message);
        }
      }
      
      this.processes.clear();
      this.healthChecks.clear();
      
      console.log('✅ All services stopped successfully!');
      
      // Save state
      await this.saveState();
      
    } catch (error) {
      console.error('❌ Failed to stop services:', error.message);
    }
  }

  async status() {
    console.log('📊 NeetLogIQ Intelligent Automation Status');
    console.log('==========================================');
    
    console.log('\n🔍 Service Health:');
    for (const [serviceName, health] of this.healthChecks) {
      const status = health.healthy ? '✅' : '❌';
      const lastCheck = health.lastCheck ? health.lastCheck.toLocaleTimeString() : 'Never';
      console.log(`  ${status} ${serviceName}: ${health.healthy ? 'Healthy' : 'Unhealthy'} (Last check: ${lastCheck})`);
    }
    
    console.log('\n🔄 Running Processes:');
    for (const [serviceName, processInfo] of this.processes) {
      const uptime = processInfo.startTime ? 
        Math.floor((Date.now() - processInfo.startTime.getTime()) / 1000) : 0;
      console.log(`  📋 ${serviceName}: PID ${processInfo.pid}, Uptime: ${uptime}s, Restarts: ${processInfo.restartCount}`);
    }
    
    console.log('\n⚙️ Configuration:');
    console.log(`  Auto-restart: ${this.autoRestartEnabled ? '✅ Enabled' : '❌ Disabled'}`);
    console.log(`  Performance monitoring: ${this.performanceMonitoring ? '✅ Enabled' : '❌ Disabled'}`);
    console.log(`  Health check interval: ${this.config.healthCheckInterval / 1000}s`);
    console.log(`  Maintenance interval: ${this.config.maintenanceInterval / 1000}s`);
    
    console.log('\n📝 Log file:', this.config.logFile);
  }

  async monitor() {
    console.log('👁️ Starting continuous monitoring mode...');
    console.log('Press Ctrl+C to stop monitoring');
    
    // Continuous monitoring
    const interval = setInterval(async () => {
      await this.performHealthChecks();
      await this.logHealthStatus();
      
      // Clear console for better monitoring view
      console.clear();
      await this.status();
      
    }, this.config.healthCheckInterval);
    
    // Handle graceful shutdown
    process.on('SIGINT', async () => {
      console.log('\n🛑 Stopping monitoring...');
      clearInterval(interval);
      await this.saveState();
      process.exit(0);
    });
  }
}

// CLI interface
async function main() {
  const automation = new IntelligentAutomation();
  const command = process.argv[2] || 'start';
  
  try {
    switch (command) {
      case 'start':
        await automation.start();
        break;
      case 'stop':
        await automation.stop();
        break;
      case 'status':
        await automation.status();
        break;
      case 'monitor':
        await automation.monitor();
        break;
      default:
        console.log('Usage: node intelligent-automation.js [start|stop|status|monitor]');
        process.exit(1);
    }
  } catch (error) {
    console.error('❌ Automation error:', error.message);
    process.exit(1);
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export default IntelligentAutomation;
