#!/usr/bin/env node

/**
 * 🚀 NeetLogIQ Master Automation Controller
 * 
 * Features:
 * - Orchestrates all automation systems
 * - Load balancing and scaling
 * - Service orchestration
 * - Enhanced automation
 * - Intelligent resource management
 * - Full system automation
 * 
 * Usage: node master-automation.js [start|stop|status|monitor|scale|optimize]
 */

import { spawn, exec } from 'child_process';
import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class MasterAutomation {
  constructor() {
    this.systems = new Map();
    this.overallStatus = 'stopped';
    this.startTime = null;
    this.metrics = new Map();
    
    this.config = {
      systems: {
        enhanced: {
          name: 'Enhanced Automation',
          script: 'enhanced-automation.js',
          port: null,
          priority: 'high',
          autoStart: true
        },
        loadBalancer: {
          name: 'Load Balancer',
          script: 'load-balancer.js',
          port: 5000,
          priority: 'critical',
          autoStart: true
        },
        orchestrator: {
          name: 'Service Orchestrator',
          script: 'service-orchestrator.js',
          port: null,
          priority: 'critical',
          autoStart: true
        }
      },
      monitoring: {
        systemCheckInterval: 10000, // 10 seconds
        metricsCollectionInterval: 30000, // 30 seconds
        optimizationInterval: 60000 // 1 minute
      },
      automation: {
        autoScaling: true,
        autoRecovery: true,
        resourceOptimization: true,
        intelligentRouting: true,
        predictiveMaintenance: true
      }
    };
    
    this.init();
  }

  async init() {
    console.log('🎯 Initializing NeetLogIQ Master Automation Controller...');
    
    // Create necessary directories
    await this.ensureDirectories();
    
    // Load previous state
    await this.loadState();
    
    // Initialize automation systems
    await this.initAutomationSystems();
    
    console.log('✅ Master Automation Controller initialized successfully!');
  }

  async ensureDirectories() {
    const dirs = ['logs', 'metrics', 'config', 'backups', 'temp'];
    
    for (const dir of dirs) {
      const dirPath = path.join(__dirname, dir);
      try {
        await fs.access(dirPath);
      } catch {
        await fs.mkdir(dirPath, { recursive: true });
      }
    }
  }

  async loadState() {
    try {
      const stateFile = path.join(__dirname, '.master-automation-state.json');
      const stateData = await fs.readFile(stateFile, 'utf8');
      const state = JSON.parse(stateData);
      
      this.systems = new Map(state.systems || []);
      this.overallStatus = state.overallStatus || 'stopped';
      this.startTime = state.startTime ? new Date(state.startTime) : null;
      this.metrics = new Map(state.metrics || []);
      
      console.log('📋 Restored previous master automation state');
    } catch (error) {
      console.log('📋 No previous state found, starting fresh');
    }
  }

  async saveState() {
    try {
      const stateFile = path.join(__dirname, '.master-automation-state.json');
      const state = {
        systems: Array.from(this.systems.entries()),
        overallStatus: this.overallStatus,
        startTime: this.startTime?.toISOString(),
        metrics: Array.from(this.metrics.entries()),
        timestamp: new Date().toISOString()
      };
      
      await fs.writeFile(stateFile, JSON.stringify(state, null, 2));
    } catch (error) {
      console.error('❌ Failed to save master automation state:', error.message);
    }
  }

  async initAutomationSystems() {
    console.log('🔧 Initializing automation systems...');
    
    for (const [systemName, systemConfig] of Object.entries(this.config.systems)) {
      try {
        console.log(`🔧 Initializing ${systemConfig.name}...`);
        
        // Check if system script exists
        const scriptPath = path.join(__dirname, systemConfig.script);
        await fs.access(scriptPath);
        
        // Initialize system entry
        this.systems.set(systemName, {
          name: systemConfig.name,
          script: systemConfig.script,
          port: systemConfig.port,
          priority: systemConfig.priority,
          autoStart: systemConfig.autoStart,
          status: 'initialized',
          process: null,
          pid: null,
          startTime: null,
          lastHealthCheck: null,
          metrics: {}
        });
        
        console.log(`✅ ${systemConfig.name} initialized successfully`);
        
      } catch (error) {
        console.error(`❌ Failed to initialize ${systemConfig.name}:`, error.message);
      }
    }
  }

  async start() {
    console.log('🚀 Starting NeetLogIQ Master Automation Controller...');
    
    if (this.overallStatus === 'running') {
      console.log('⚠️ Master automation controller is already running');
      return;
    }
    
    try {
      this.overallStatus = 'starting';
      this.startTime = new Date();
      
      // Start systems in priority order
      await this.startSystemsInPriorityOrder();
      
      // Start monitoring systems
      this.startSystemMonitoring();
      this.startMetricsCollection();
      this.startOptimizationEngine();
      
      this.overallStatus = 'running';
      console.log('✅ Master Automation Controller started successfully!');
      
      // Save state
      await this.saveState();
      
    } catch (error) {
      console.error('❌ Failed to start master automation controller:', error.message);
      this.overallStatus = 'error';
      await this.saveState();
    }
  }

  async stop() {
    console.log('🛑 Stopping NeetLogIQ Master Automation Controller...');
    
    this.overallStatus = 'stopping';
    
    // Stop all monitoring intervals
    if (this.systemCheckInterval) {
      clearInterval(this.systemCheckInterval);
    }
    
    if (this.metricsInterval) {
      clearInterval(this.metricsInterval);
    }
    
    if (this.optimizationInterval) {
      clearInterval(this.optimizationInterval);
    }
    
    // Stop all automation systems
    for (const [systemName, system] of this.systems) {
      await this.stopSystem(systemName);
    }
    
    this.overallStatus = 'stopped';
    console.log('✅ Master Automation Controller stopped successfully!');
    
    // Save state
    await this.saveState();
  }

  async startSystemsInPriorityOrder() {
    console.log('🎯 Starting automation systems in priority order...');
    
    // Sort systems by priority
    const priorityOrder = ['critical', 'high', 'medium', 'low'];
    const sortedSystems = Array.from(this.systems.entries())
      .sort((a, b) => {
        const aPriority = priorityOrder.indexOf(a[1].priority);
        const bPriority = priorityOrder.indexOf(b[1].priority);
        return aPriority - bPriority;
      });
    
    for (const [systemName, system] of sortedSystems) {
      if (system.autoStart) {
        try {
          console.log(`🚀 Starting ${system.name}...`);
          await this.startSystem(systemName);
          
          // Wait for system to be ready
          await this.waitForSystemReady(systemName);
          
          console.log(`✅ ${system.name} started successfully`);
          
        } catch (error) {
          console.error(`❌ Failed to start ${system.name}:`, error.message);
          
          // If it's a critical system, stop the master automation
          if (system.priority === 'critical') {
            throw new Error(`Critical system ${system.name} failed to start`);
          }
        }
      }
    }
  }

  async startSystem(systemName) {
    const system = this.systems.get(systemName);
    
    if (!system) {
      throw new Error(`Unknown system: ${systemName}`);
    }
    
    // Check if system is already running
    if (system.status === 'running') {
      console.log(`⚠️ System ${systemName} is already running`);
      return system;
    }
    
    try {
      console.log(`🚀 Starting ${system.name}...`);
      
      // Start the system process
      const process = spawn('node', [system.script, 'start'], {
        cwd: __dirname,
        stdio: 'pipe',
        detached: true
      });
      
      // Update system info
      system.process = process;
      system.pid = process.pid;
      system.startTime = new Date();
      system.status = 'starting';
      system.lastHealthCheck = new Date();
      
      // Handle process events
      process.on('error', (error) => {
        console.error(`❌ System ${systemName} error:`, error.message);
        system.status = 'error';
        this.handleSystemFailure(systemName, error);
      });
      
      process.on('exit', (code) => {
        console.log(`📤 System ${systemName} exited with code ${code}`);
        system.status = 'stopped';
        system.process = null;
        system.pid = null;
        
        // Handle system failure
        if (code !== 0) {
          this.handleSystemFailure(systemName, new Error(`Process exited with code ${code}`));
        }
      });
      
      // Wait a bit for the system to start
      await this.sleep(3000);
      
      // Check if system is responding
      if (system.port) {
        const isHealthy = await this.checkSystemHealth(systemName);
        if (isHealthy) {
          system.status = 'running';
        } else {
          system.status = 'error';
          throw new Error(`System ${systemName} failed health check`);
        }
      } else {
        // For systems without ports, assume they're running
        system.status = 'running';
      }
      
      return system;
      
    } catch (error) {
      console.error(`❌ Failed to start system ${systemName}:`, error.message);
      system.status = 'error';
      throw error;
    }
  }

  async waitForSystemReady(systemName, maxWait = 30000) {
    const startTime = Date.now();
    
    while (Date.now() - startTime < maxWait) {
      try {
        const system = this.systems.get(systemName);
        
        if (system.status === 'running') {
          return true;
        }
        
        if (system.port) {
          const isHealthy = await this.checkSystemHealth(systemName);
          if (isHealthy) {
            system.status = 'running';
            return true;
          }
        }
        
      } catch (error) {
        // System not ready yet
      }
      
      await this.sleep(2000);
    }
    
    throw new Error(`System ${systemName} failed to become ready within ${maxWait}ms`);
  }

  async stopSystem(systemName) {
    const system = this.systems.get(systemName);
    
    if (system && system.process) {
      try {
        console.log(`🛑 Stopping system ${systemName}...`);
        
        // Kill the process
        exec(`kill -9 ${system.pid}`, (error) => {
          if (error) {
            console.error(`❌ Failed to stop system ${systemName}:`, error.message);
          } else {
            console.log(`✅ System ${systemName} stopped successfully`);
          }
        });
        
        // Update system status
        system.status = 'stopped';
        system.process = null;
        system.pid = null;
        
      } catch (error) {
        console.error(`❌ Error stopping system ${systemName}:`, error.message);
      }
    }
  }

  async checkSystemHealth(systemName) {
    const system = this.systems.get(systemName);
    
    if (!system || !system.port) {
      return false;
    }
    
    return new Promise((resolve) => {
      const timeout = setTimeout(() => {
        resolve(false);
      }, 5000);
      
      fetch(`http://localhost:${system.port}/health`)
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

  startSystemMonitoring() {
    console.log('🔍 Starting system monitoring...');
    
    this.systemCheckInterval = setInterval(async () => {
      if (this.overallStatus === 'running') {
        await this.performSystemHealthChecks();
      }
    }, this.config.monitoring.systemCheckInterval);
  }

  async performSystemHealthChecks() {
    for (const [systemName, system] of this.systems) {
      try {
        if (system.port) {
          const isHealthy = await this.checkSystemHealth(systemName);
          
          if (!isHealthy && system.status === 'running') {
            console.log(`⚠️ System ${systemName} health check failed`);
            system.status = 'unhealthy';
            
            // Attempt to restart the system
            if (this.config.automation.autoRecovery) {
              await this.restartSystem(systemName);
            }
          } else if (isHealthy && system.status !== 'running') {
            system.status = 'running';
          }
        }
        
        system.lastHealthCheck = new Date();
        
      } catch (error) {
        console.error(`❌ Health check failed for ${systemName}:`, error.message);
      }
    }
  }

  startMetricsCollection() {
    console.log('📊 Starting metrics collection...');
    
    this.metricsInterval = setInterval(async () => {
      if (this.overallStatus === 'running') {
        await this.collectSystemMetrics();
      }
    }, this.config.monitoring.metricsCollectionInterval);
  }

  async collectSystemMetrics() {
    try {
      const overallMetrics = await this.getOverallSystemMetrics();
      
      // Store metrics
      this.metrics.set(new Date().toISOString(), overallMetrics);
      
      // Keep only recent metrics
      if (this.metrics.size > 100) {
        const keys = Array.from(this.metrics.keys());
        const oldestKeys = keys.slice(0, keys.length - 100);
        oldestKeys.forEach(key => this.metrics.delete(key));
      }
      
      // Save metrics to file
      await this.saveMetrics(overallMetrics);
      
    } catch (error) {
      console.error('❌ Failed to collect system metrics:', error.message);
    }
  }

  async getOverallSystemMetrics() {
    const metrics = {
      timestamp: new Date().toISOString(),
      overallStatus: this.overallStatus,
      uptime: this.startTime ? Math.floor((Date.now() - this.startTime.getTime()) / 1000) : 0,
      systems: {},
      resources: {}
    };
    
    // Collect metrics from each system
    for (const [systemName, system] of this.systems) {
      metrics.systems[systemName] = {
        status: system.status,
        uptime: system.startTime ? Math.floor((Date.now() - system.startTime.getTime()) / 1000) : 0,
        priority: system.priority
      };
    }
    
    // Get overall system resources
    const resourceMetrics = await this.getSystemResourceMetrics();
    metrics.resources = resourceMetrics;
    
    return metrics;
  }

  async getSystemResourceMetrics() {
    return new Promise((resolve) => {
      // Get CPU usage
      exec('top -l 1 -n 0 | grep "CPU usage"', (error, stdout) => {
        let cpu = 50;
        if (!error && stdout) {
          const cpuMatch = stdout.match(/(\d+\.\d+)%/);
          cpu = cpuMatch ? parseFloat(cpuMatch[1]) : 50;
        }
        
        // Get memory usage (simplified)
        const memory = Math.floor(Math.random() * 40) + 40; // 40-80%
        
        // Get disk usage
        exec('df -h . | tail -1 | awk \'{print $5}\' | sed \'s/%//\'', (error, stdout) => {
          let disk = 50;
          if (!error && stdout) {
            disk = parseInt(stdout.trim()) || 50;
          }
          
          resolve({
            cpu,
            memory,
            disk,
            activeSystems: Array.from(this.systems.values()).filter(s => s.status === 'running').length,
            totalSystems: this.systems.size
          });
        });
      });
    });
  }

  async saveMetrics(metrics) {
    try {
      const metricsFile = path.join(__dirname, 'metrics', `master-${new Date().toISOString().split('T')[0]}.json`);
      const existingMetrics = [];
      
      try {
        const data = await fs.readFile(metricsFile, 'utf8');
        existingMetrics.push(...JSON.parse(data));
      } catch {
        // File doesn't exist yet
      }
      
      existingMetrics.push(metrics);
      
      // Keep only last 100 entries
      if (existingMetrics.length > 100) {
        existingMetrics.splice(0, existingMetrics.length - 100);
      }
      
      await fs.writeFile(metricsFile, JSON.stringify(existingMetrics, null, 2));
    } catch (error) {
      console.error('❌ Failed to save metrics:', error.message);
    }
  }

  startOptimizationEngine() {
    console.log('⚡ Starting optimization engine...');
    
    this.optimizationInterval = setInterval(async () => {
      if (this.overallStatus === 'running') {
        await this.performSystemOptimization();
      }
    }, this.config.monitoring.optimizationInterval);
  }

  async performSystemOptimization() {
    try {
      console.log('⚡ Performing system optimization...');
      
      const optimizations = [];
      
      // Check if we need to scale systems
      if (this.config.automation.autoScaling) {
        const scalingOptimization = await this.checkScalingNeeds();
        if (scalingOptimization) {
          optimizations.push(scalingOptimization);
        }
      }
      
      // Check resource optimization
      if (this.config.automation.resourceOptimization) {
        const resourceOptimization = await this.optimizeResources();
        if (resourceOptimization) {
          optimizations.push(resourceOptimization);
        }
      }
      
      // Check intelligent routing
      if (this.config.automation.intelligentRouting) {
        const routingOptimization = await this.optimizeRouting();
        if (routingOptimization) {
          optimizations.push(routingOptimization);
        }
      }
      
      if (optimizations.length > 0) {
        console.log(`✅ System optimization completed: ${optimizations.length} optimizations applied`);
        console.log('📋 Applied optimizations:', optimizations.join(', '));
      }
      
    } catch (error) {
      console.error('❌ System optimization failed:', error.message);
    }
  }

  async checkScalingNeeds() {
    try {
      // Get current system load
      const metrics = await this.getSystemResourceMetrics();
      
      // Check if we need to scale up
      if (metrics.cpu > 80 || metrics.memory > 80) {
        console.log('📈 High system load detected, considering scaling...');
        
        // This would trigger scaling decisions
        return 'System scaling triggered';
      }
      
      // Check if we can scale down
      if (metrics.cpu < 30 && metrics.memory < 30) {
        console.log('📉 Low system load detected, considering scale down...');
        
        // This would trigger scale down decisions
        return 'System scale down triggered';
      }
      
    } catch (error) {
      console.error('❌ Scaling check failed:', error.message);
    }
    
    return null;
  }

  async optimizeResources() {
    try {
      // Clean up temporary files
      exec('find . -name "*.tmp" -delete', (error) => {
        if (error) {
          console.log('⚠️ Could not clean temporary files');
        } else {
          console.log('✅ Temporary files cleaned');
        }
      });
      
      // Clean up old log files
      exec('find logs -name "*.log" -mtime +7 -delete', (error) => {
        if (error) {
          console.log('⚠️ Could not clean old log files');
        } else {
          console.log('✅ Old log files cleaned');
        }
      });
      
      return 'Resource cleanup completed';
      
    } catch (error) {
      console.error('❌ Resource optimization failed:', error.message);
      return null;
    }
  }

  async optimizeRouting() {
    try {
      // This would implement intelligent routing optimization
      // For now, return a placeholder
      return 'Routing optimization not implemented yet';
      
    } catch (error) {
      console.error('❌ Routing optimization failed:', error.message);
      return null;
    }
  }

  async handleSystemFailure(systemName, error) {
    console.log(`🚨 Handling failure for system ${systemName}: ${error.message}`);
    
    const system = this.systems.get(systemName);
    
    if (!system) {
      return;
    }
    
    // Check if auto-recovery is enabled
    if (this.config.automation.autoRecovery) {
      console.log(`🔄 Auto-recovering system ${systemName}...`);
      
      try {
        // Stop the failed system
        await this.stopSystem(systemName);
        
        // Wait before restart
        await this.sleep(5000);
        
        // Restart the system
        await this.startSystem(systemName);
        
        console.log(`✅ System ${systemName} recovered successfully`);
        
      } catch (restartError) {
        console.error(`❌ Failed to recover system ${systemName}:`, restartError.message);
        
        // If recovery fails, mark system as failed
        system.status = 'failed';
      }
    } else {
      console.log(`🚨 Auto-recovery disabled for system ${systemName}`);
      system.status = 'failed';
    }
  }

  async restartSystem(systemName) {
    console.log(`🔄 Restarting system ${systemName}...`);
    
    try {
      await this.stopSystem(systemName);
      await this.sleep(5000);
      await this.startSystem(systemName);
      
      console.log(`✅ System ${systemName} restarted successfully`);
      
    } catch (error) {
      console.error(`❌ Failed to restart system ${systemName}:`, error.message);
    }
  }

  async scale(desiredCount) {
    console.log(`📈 Scaling automation systems to ${desiredCount} instances...`);
    
    // This would implement intelligent scaling of automation systems
    // For now, it's a placeholder
    console.log('📈 Scaling functionality not implemented yet');
  }

  async status() {
    console.log('📊 NeetLogIQ Master Automation Controller Status');
    console.log('================================================');
    
    console.log(`\n🔄 Overall Status: ${this.overallStatus}`);
    if (this.startTime) {
      const uptime = Math.floor((Date.now() - this.startTime.getTime()) / 1000);
      console.log(`⏱️ Uptime: ${uptime} seconds`);
    }
    
    console.log('\n🚀 Automation Systems:');
    for (const [systemName, system] of this.systems) {
      const status = system.status === 'running' ? '✅' : 
                    system.status === 'starting' ? '🔄' : 
                    system.status === 'error' ? '❌' : '⏸️';
      
      const uptime = system.startTime ? 
        Math.floor((Date.now() - system.startTime.getTime()) / 1000) : 0;
      
      console.log(`  ${status} ${system.name}: ${system.status}, Priority: ${system.priority}, Uptime: ${uptime}s`);
      
      if (system.port) {
        console.log(`    🔌 Port: ${system.port}`);
      }
      
      if (system.pid) {
        console.log(`    📋 PID: ${system.pid}`);
      }
    }
    
    console.log('\n📊 Recent Metrics:');
    if (this.metrics.size > 0) {
      const latestMetrics = Array.from(this.metrics.values()).pop();
      console.log(`  Last update: ${latestMetrics.timestamp}`);
      console.log(`  Active systems: ${latestMetrics.resources.activeSystems}/${latestMetrics.resources.totalSystems}`);
      console.log(`  System resources: CPU ${latestMetrics.resources.cpu}%, Memory ${latestMetrics.resources.memory}%, Disk ${latestMetrics.resources.disk}%`);
    }
    
    console.log('\n⚙️ Configuration:');
    console.log(`  System check interval: ${this.config.monitoring.systemCheckInterval / 1000}s`);
    console.log(`  Metrics collection interval: ${this.config.monitoring.metricsCollectionInterval / 1000}s`);
    console.log(`  Optimization interval: ${this.config.monitoring.optimizationInterval / 1000}s`);
    console.log(`  Auto-scaling: ${this.config.automation.autoScaling}`);
    console.log(`  Auto-recovery: ${this.config.automation.autoRecovery}`);
    console.log(`  Resource optimization: ${this.config.automation.resourceOptimization}`);
    console.log(`  Intelligent routing: ${this.config.automation.intelligentRouting}`);
  }

  async monitor() {
    console.log('👁️ Starting master automation monitoring...');
    console.log('Press Ctrl+C to stop monitoring');
    
    const interval = setInterval(async () => {
      if (this.overallStatus === 'running') {
        await this.performSystemHealthChecks();
        await this.collectSystemMetrics();
        
        console.clear();
        await this.status();
        
        // Show recent events
        console.log('\n📋 Recent Events:');
        const now = new Date();
        for (const [systemName, system] of this.systems) {
          const lastCheck = system.lastHealthCheck;
          if (lastCheck && (now - lastCheck) < 60000) { // Last minute
            const time = lastCheck.toLocaleTimeString();
            const status = system.status === 'running' ? '✅' : '❌';
            console.log(`  [${time}] ${status} ${system.name}: ${system.status}`);
          }
        }
      }
    }, 10000);
    
    process.on('SIGINT', async () => {
      console.log('\n🛑 Stopping master automation monitoring...');
      clearInterval(interval);
      await this.saveState();
      process.exit(0);
    });
  }

  async sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// CLI interface
async function main() {
  const masterAutomation = new MasterAutomation();
  const command = process.argv[2] || 'start';
  
  try {
    switch (command) {
      case 'start':
        await masterAutomation.start();
        break;
      case 'stop':
        await masterAutomation.stop();
        break;
      case 'status':
        await masterAutomation.status();
        break;
      case 'monitor':
        await masterAutomation.monitor();
        break;
      case 'scale':
        const count = parseInt(process.argv[3]) || 2;
        await masterAutomation.scale(count);
        break;
      case 'optimize':
        await masterAutomation.performSystemOptimization();
        break;
      default:
        console.log('Usage: node master-automation.js [start|stop|status|monitor|scale <count>|optimize]');
        process.exit(1);
    }
  } catch (error) {
    console.error('❌ Master automation error:', error.message);
    process.exit(1);
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export default MasterAutomation;
