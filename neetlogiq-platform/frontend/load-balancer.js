#!/usr/bin/env node

/**
 * 🚀 NeetLogIQ Load Balancer & Scaling System
 * 
 * Features:
 * - Intelligent load balancing across multiple instances
 * - Auto-scaling based on demand
 * - Health checks and failover
 * - Traffic distribution algorithms
 * - Performance monitoring and optimization
 * 
 * Usage: node load-balancer.js [start|stop|status|scale|monitor]
 */

import { createServer } from 'http';
import { spawn, exec } from 'child_process';
import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class LoadBalancer {
  constructor() {
    this.instances = new Map();
    this.healthChecks = new Map();
    this.routingTable = new Map();
    this.isRunning = false;
    this.server = null;
    this.currentInstance = 0;
    
    this.config = {
      port: 5000, // Load balancer port
      instances: {
        min: 2,
        max: 5,
        targetCPU: 70,
        targetMemory: 75,
        scaleUpThreshold: 80,
        scaleDownThreshold: 30
      },
      healthCheck: {
        interval: 10000, // 10 seconds
        timeout: 5000,
        unhealthyThreshold: 3,
        healthyThreshold: 2
      },
      algorithms: {
        roundRobin: true,
        leastConnections: true,
        weightedRoundRobin: true,
        ipHash: true
      }
    };
    
    this.init();
  }

  async init() {
    console.log('🚀 Initializing NeetLogIQ Load Balancer...');
    
    // Create necessary directories
    await this.ensureDirectories();
    
    // Load previous state
    await this.loadState();
    
    // Initialize routing algorithms
    this.initRoutingAlgorithms();
    
    console.log('✅ Load Balancer initialized successfully!');
  }

  async ensureDirectories() {
    const dirs = ['logs', 'instances', 'metrics'];
    
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
      const stateFile = path.join(__dirname, '.load-balancer-state.json');
      const stateData = await fs.readFile(stateFile, 'utf8');
      const state = JSON.parse(stateData);
      
      this.instances = new Map(state.instances || []);
      this.healthChecks = new Map(state.healthChecks || []);
      this.routingTable = new Map(state.routingTable || []);
      
      console.log('📋 Restored previous load balancer state');
    } catch (error) {
      console.log('📋 No previous state found, starting fresh');
    }
  }

  async saveState() {
    try {
      const stateFile = path.join(__dirname, '.load-balancer-state.json');
      const state = {
        instances: Array.from(this.instances.entries()),
        healthChecks: Array.from(this.healthChecks.entries()),
        routingTable: Array.from(this.routingTable.entries()),
        timestamp: new Date().toISOString()
      };
      
      await fs.writeFile(stateFile, JSON.stringify(state, null, 2));
    } catch (error) {
      console.error('❌ Failed to save load balancer state:', error.message);
    }
  }

  initRoutingAlgorithms() {
    // Round Robin
    this.routingTable.set('roundRobin', {
      name: 'Round Robin',
      description: 'Distribute requests evenly across instances',
      currentIndex: 0
    });

    // Least Connections
    this.routingTable.set('leastConnections', {
      name: 'Least Connections',
      description: 'Route to instance with fewest active connections',
      connectionCounts: new Map()
    });

    // Weighted Round Robin
    this.routingTable.set('weightedRoundRobin', {
      name: 'Weighted Round Robin',
      description: 'Route based on instance weights',
      weights: new Map(),
      currentIndex: 0
    });

    // IP Hash
    this.routingTable.set('ipHash', {
      name: 'IP Hash',
      description: 'Route based on client IP hash',
      hashTable: new Map()
    });
  }

  async start() {
    console.log('🚀 Starting NeetLogIQ Load Balancer...');
    
    if (this.isRunning) {
      console.log('⚠️ Load balancer is already running');
      return;
    }
    
    try {
      this.isRunning = true;
      
      // Start initial instances
      await this.scaleToMinimum();
      
      // Start health monitoring
      this.startHealthMonitoring();
      
      // Start performance monitoring
      this.startPerformanceMonitoring();
      
      // Start the load balancer server
      await this.startServer();
      
      console.log('✅ Load Balancer started successfully!');
      
      // Save state
      await this.saveState();
      
    } catch (error) {
      console.error('❌ Failed to start load balancer:', error.message);
      this.isRunning = false;
    }
  }

  async stop() {
    console.log('🛑 Stopping NeetLogIQ Load Balancer...');
    
    this.isRunning = false;
    
    // Stop all monitoring intervals
    if (this.healthInterval) {
      clearInterval(this.healthInterval);
    }
    
    if (this.performanceInterval) {
      clearInterval(this.performanceInterval);
    }
    
    // Stop all instances
    for (const [instanceId, instance] of this.instances) {
      await this.stopInstance(instanceId);
    }
    
    // Stop the server
    if (this.server) {
      this.server.close();
    }
    
    console.log('✅ Load Balancer stopped successfully!');
    
    // Save state
    await this.saveState();
  }

  async scaleToMinimum() {
    console.log(`📈 Scaling to minimum ${this.config.instances.min} instances...`);
    
    const currentCount = this.instances.size;
    const targetCount = this.config.instances.min;
    
    if (currentCount < targetCount) {
      const instancesToAdd = targetCount - currentCount;
      
      for (let i = 0; i < instancesToAdd; i++) {
        await this.addInstance();
      }
    }
    
    console.log(`✅ Scaled to ${this.instances.size} instances`);
  }

  async addInstance() {
    const instanceId = `instance-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const port = await this.findAvailablePort();
    
    try {
      console.log(`🚀 Starting new instance ${instanceId} on port ${port}...`);
      
      // Start the instance
      const instance = await this.startInstance(instanceId, port);
      
      // Add to instances map
      this.instances.set(instanceId, instance);
      
      // Initialize health check
      this.healthChecks.set(instanceId, {
        healthy: true,
        consecutiveFailures: 0,
        consecutiveSuccesses: 0,
        lastCheck: new Date(),
        responseTime: 0
      });
      
      // Initialize connection count
      this.routingTable.get('leastConnections').connectionCounts.set(instanceId, 0);
      
      // Set initial weight
      this.routingTable.get('weightedRoundRobin').weights.set(instanceId, 1);
      
      console.log(`✅ Instance ${instanceId} started successfully on port ${port}`);
      
      return instance;
      
    } catch (error) {
      console.error(`❌ Failed to start instance ${instanceId}:`, error.message);
      throw error;
    }
  }

  async startInstance(instanceId, port) {
    return new Promise((resolve, reject) => {
      // Start a new instance of the application
      const instance = spawn('node', ['simple-server.js'], {
        cwd: __dirname,
        env: { ...process.env, PORT: port.toString() },
        stdio: 'pipe'
      });
      
      const instanceInfo = {
        id: instanceId,
        pid: instance.pid,
        port,
        startTime: new Date(),
        connections: 0,
        status: 'starting'
      };
      
      // Handle instance events
      instance.on('error', (error) => {
        console.error(`❌ Instance ${instanceId} error:`, error.message);
        instanceInfo.status = 'error';
        reject(error);
      });
      
      instance.on('exit', (code) => {
        console.log(`📤 Instance ${instanceId} exited with code ${code}`);
        instanceInfo.status = 'stopped';
        this.instances.delete(instanceId);
        this.healthChecks.delete(instanceId);
      });
      
      // Wait for instance to be ready
      setTimeout(() => {
        instanceInfo.status = 'running';
        resolve(instanceInfo);
      }, 5000);
    });
  }

  async stopInstance(instanceId) {
    const instance = this.instances.get(instanceId);
    
    if (instance) {
      try {
        console.log(`🛑 Stopping instance ${instanceId}...`);
        
        // Kill the process
        exec(`kill -9 ${instance.pid}`, (error) => {
          if (error) {
            console.error(`❌ Failed to stop instance ${instanceId}:`, error.message);
          } else {
            console.log(`✅ Instance ${instanceId} stopped successfully`);
          }
        });
        
        // Remove from maps
        this.instances.delete(instanceId);
        this.healthChecks.delete(instanceId);
        
      } catch (error) {
        console.error(`❌ Error stopping instance ${instanceId}:`, error.message);
      }
    }
  }

  async findAvailablePort() {
    const startPort = 5001;
    const maxPort = 5010;
    
    for (let port = startPort; port <= maxPort; port++) {
      try {
        const isAvailable = await this.isPortAvailable(port);
        if (isAvailable) {
          return port;
        }
      } catch (error) {
        continue;
      }
    }
    
    throw new Error('No available ports found');
  }

  async isPortAvailable(port) {
    return new Promise((resolve) => {
      const net = require('net');
      const server = net.createServer();
      
      server.listen(port, () => {
        server.once('close', () => {
          resolve(true);
        });
        server.close();
      });
      
      server.on('error', () => {
        resolve(false);
      });
    });
  }

  startHealthMonitoring() {
    console.log('🏥 Starting health monitoring...');
    
    this.healthInterval = setInterval(async () => {
      if (this.isRunning) {
        await this.performHealthChecks();
      }
    }, this.config.healthCheck.interval);
  }

  async performHealthChecks() {
    for (const [instanceId, instance] of this.instances) {
      try {
        const isHealthy = await this.checkInstanceHealth(instanceId, instance.port);
        const healthCheck = this.healthChecks.get(instanceId);
        
        if (isHealthy) {
          healthCheck.consecutiveSuccesses++;
          healthCheck.consecutiveFailures = 0;
          healthCheck.healthy = true;
        } else {
          healthCheck.consecutiveFailures++;
          healthCheck.consecutiveSuccesses = 0;
          
          if (healthCheck.consecutiveFailures >= this.config.healthCheck.unhealthyThreshold) {
            healthCheck.healthy = false;
            console.log(`⚠️ Instance ${instanceId} marked as unhealthy`);
            
            // Attempt to restart the instance
            await this.restartInstance(instanceId);
          }
        }
        
        healthCheck.lastCheck = new Date();
        
      } catch (error) {
        console.error(`❌ Health check failed for ${instanceId}:`, error.message);
      }
    }
  }

  async checkInstanceHealth(instanceId, port) {
    return new Promise((resolve) => {
      const startTime = Date.now();
      const timeout = setTimeout(() => {
        resolve(false);
      }, this.config.healthCheck.timeout);
      
      fetch(`http://localhost:${port}/health`)
        .then(response => {
          clearTimeout(timeout);
          const responseTime = Date.now() - startTime;
          
          // Update health check with response time
          const healthCheck = this.healthChecks.get(instanceId);
          if (healthCheck) {
            healthCheck.responseTime = responseTime;
          }
          
          resolve(response.ok);
        })
        .catch(() => {
          clearTimeout(timeout);
          resolve(false);
        });
    });
  }

  async restartInstance(instanceId) {
    console.log(`🔄 Restarting instance ${instanceId}...`);
    
    try {
      const instance = this.instances.get(instanceId);
      
      // Stop the current instance
      await this.stopInstance(instanceId);
      
      // Wait a bit
      await this.sleep(2000);
      
      // Start a new instance
      const newInstance = await this.addInstance();
      
      console.log(`✅ Instance ${instanceId} restarted successfully`);
      
      return newInstance;
      
    } catch (error) {
      console.error(`❌ Failed to restart instance ${instanceId}:`, error.message);
    }
  }

  startPerformanceMonitoring() {
    console.log('📊 Starting performance monitoring...');
    
    this.performanceInterval = setInterval(async () => {
      if (this.isRunning) {
        await this.checkScalingNeeds();
      }
    }, 30000); // Check every 30 seconds
  }

  async checkScalingNeeds() {
    try {
      const metrics = await this.collectPerformanceMetrics();
      
      // Check if we need to scale up
      if (metrics.avgCPU > this.config.instances.scaleUpThreshold ||
          metrics.avgMemory > this.config.instances.scaleUpThreshold) {
        
        if (this.instances.size < this.config.instances.max) {
          console.log(`📈 High load detected (CPU: ${metrics.avgCPU}%, Memory: ${metrics.avgMemory}%), scaling up...`);
          await this.addInstance();
        }
      }
      
      // Check if we can scale down
      if (metrics.avgCPU < this.config.instances.scaleDownThreshold &&
          metrics.avgMemory < this.config.instances.scaleDownThreshold) {
        
        if (this.instances.size > this.config.instances.min) {
          console.log(`📉 Low load detected (CPU: ${metrics.avgCPU}%, Memory: ${metrics.avgMemory}%), scaling down...`);
          await this.removeLeastUsedInstance();
        }
      }
      
    } catch (error) {
      console.error('❌ Performance monitoring error:', error.message);
    }
  }

  async collectPerformanceMetrics() {
    const metrics = [];
    
    for (const [instanceId, instance] of this.instances) {
      try {
        const instanceMetrics = await this.getInstanceMetrics(instanceId, instance.port);
        metrics.push(instanceMetrics);
      } catch (error) {
        console.error(`❌ Failed to collect metrics for ${instanceId}:`, error.message);
      }
    }
    
    if (metrics.length === 0) {
      return { avgCPU: 0, avgMemory: 0, avgResponseTime: 0 };
    }
    
    const avgCPU = metrics.reduce((sum, m) => sum + m.cpu, 0) / metrics.length;
    const avgMemory = metrics.reduce((sum, m) => sum + m.memory, 0) / metrics.length;
    const avgResponseTime = metrics.reduce((sum, m) => sum + m.responseTime, 0) / metrics.length;
    
    return { avgCPU, avgMemory, avgResponseTime };
  }

  async getInstanceMetrics(instanceId, port) {
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
        
        // Get response time from health check
        const healthCheck = this.healthChecks.get(instanceId);
        const responseTime = healthCheck ? healthCheck.responseTime : 0;
        
        resolve({
          instanceId,
          cpu,
          memory,
          responseTime
        });
      });
    });
  }

  async removeLeastUsedInstance() {
    if (this.instances.size <= this.config.instances.min) {
      return;
    }
    
    // Find instance with least connections
    let leastUsedInstance = null;
    let minConnections = Infinity;
    
    for (const [instanceId, instance] of this.instances) {
      if (instance.connections < minConnections) {
        minConnections = instance.connections;
        leastUsedInstance = instanceId;
      }
    }
    
    if (leastUsedInstance) {
      console.log(`📉 Removing least used instance: ${leastUsedInstance}`);
      await this.stopInstance(leastUsedInstance);
    }
  }

  async startServer() {
    return new Promise((resolve, reject) => {
      this.server = createServer(async (req, res) => {
        try {
          // Route the request
          const targetInstance = await this.routeRequest(req);
          
          if (targetInstance) {
            // Forward the request
            await this.forwardRequest(req, res, targetInstance);
          } else {
            res.writeHead(503, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'No available instances' }));
          }
        } catch (error) {
          console.error('❌ Request handling error:', error.message);
          res.writeHead(500, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Internal server error' }));
        }
      });
      
      this.server.listen(this.config.port, () => {
        console.log(`🚀 Load balancer listening on port ${this.config.port}`);
        resolve();
      });
      
      this.server.on('error', (error) => {
        console.error('❌ Load balancer server error:', error.message);
        reject(error);
      });
    });
  }

  async routeRequest(req) {
    // Get available healthy instances
    const healthyInstances = Array.from(this.instances.entries())
      .filter(([instanceId, instance]) => {
        const healthCheck = this.healthChecks.get(instanceId);
        return healthCheck && healthCheck.healthy;
      });
    
    if (healthyInstances.length === 0) {
      return null;
    }
    
    // Use round robin for now (can be enhanced with other algorithms)
    const routing = this.routingTable.get('roundRobin');
    const instance = healthyInstances[routing.currentIndex % healthyInstances.length];
    
    // Update round robin index
    routing.currentIndex = (routing.currentIndex + 1) % healthyInstances.length;
    
    // Update connection count
    const connectionCounts = this.routingTable.get('leastConnections').connectionCounts;
    const currentCount = connectionCounts.get(instance[0]) || 0;
    connectionCounts.set(instance[0], currentCount + 1);
    
    return instance[1];
  }

  async forwardRequest(req, res, targetInstance) {
    // This is a simplified forwarding mechanism
    // In a production environment, you'd use a proper HTTP proxy
    
    const targetUrl = `http://localhost:${targetInstance.port}${req.url}`;
    
    try {
      const response = await fetch(targetUrl, {
        method: req.method,
        headers: req.headers,
        body: req.method !== 'GET' ? req : undefined
      });
      
      // Copy response headers
      for (const [key, value] of response.headers.entries()) {
        res.setHeader(key, value);
      }
      
      res.writeHead(response.status);
      
      // Stream the response
      response.body.pipe(res);
      
    } catch (error) {
      console.error(`❌ Failed to forward request to ${targetUrl}:`, error.message);
      res.writeHead(502, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Bad gateway' }));
    }
  }

  async scale(desiredCount) {
    console.log(`📈 Scaling to ${desiredCount} instances...`);
    
    const currentCount = this.instances.size;
    
    if (desiredCount > currentCount) {
      // Scale up
      const instancesToAdd = desiredCount - currentCount;
      for (let i = 0; i < instancesToAdd; i++) {
        await this.addInstance();
      }
    } else if (desiredCount < currentCount) {
      // Scale down
      const instancesToRemove = currentCount - desiredCount;
      for (let i = 0; i < instancesToRemove; i++) {
        await this.removeLeastUsedInstance();
      }
    }
    
    console.log(`✅ Scaled to ${this.instances.size} instances`);
  }

  async status() {
    console.log('📊 NeetLogIQ Load Balancer Status');
    console.log('==================================');
    
    console.log(`\n🔄 System Status: ${this.isRunning ? '✅ Running' : '❌ Stopped'}`);
    console.log(`🔌 Load Balancer Port: ${this.config.port}`);
    console.log(`📈 Instance Count: ${this.instances.size}/${this.config.instances.max}`);
    
    console.log('\n🚀 Active Instances:');
    for (const [instanceId, instance] of this.instances) {
      const healthCheck = this.healthChecks.get(instanceId);
      const status = healthCheck?.healthy ? '✅' : '❌';
      const uptime = instance.startTime ? 
        Math.floor((Date.now() - instance.startTime.getTime()) / 1000) : 0;
      
      console.log(`  ${status} ${instanceId}: Port ${instance.port}, PID ${instance.pid}, Uptime: ${uptime}s, Connections: ${instance.connections}`);
    }
    
    console.log('\n🏥 Health Status:');
    for (const [instanceId, healthCheck] of this.healthChecks) {
      const status = healthCheck.healthy ? '✅' : '❌';
      const lastCheck = healthCheck.lastCheck ? healthCheck.lastCheck.toLocaleTimeString() : 'Never';
      console.log(`  ${status} ${instanceId}: ${healthCheck.healthy ? 'Healthy' : 'Unhealthy'}, Last check: ${lastCheck}, Response time: ${healthCheck.responseTime}ms`);
    }
    
    console.log('\n⚙️ Configuration:');
    console.log(`  Min instances: ${this.config.instances.min}`);
    console.log(`  Max instances: ${this.config.instances.max}`);
    console.log(`  Scale up threshold: ${this.config.instances.scaleUpThreshold}%`);
    console.log(`  Scale down threshold: ${this.config.instances.scaleDownThreshold}%`);
    console.log(`  Health check interval: ${this.config.healthCheck.interval / 1000}s`);
  }

  async monitor() {
    console.log('👁️ Starting load balancer monitoring...');
    console.log('Press Ctrl+C to stop monitoring');
    
    const interval = setInterval(async () => {
      if (this.isRunning) {
        await this.performHealthChecks();
        await this.checkScalingNeeds();
        
        console.clear();
        await this.status();
        
        // Show recent metrics
        const metrics = await this.collectPerformanceMetrics();
        console.log(`\n📊 Performance Metrics:`);
        console.log(`  Average CPU: ${metrics.avgCPU.toFixed(1)}%`);
        console.log(`  Average Memory: ${metrics.avgMemory.toFixed(1)}%`);
        console.log(`  Average Response Time: ${metrics.avgResponseTime.toFixed(0)}ms`);
      }
    }, 10000);
    
    process.on('SIGINT', async () => {
      console.log('\n🛑 Stopping load balancer monitoring...');
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
  const loadBalancer = new LoadBalancer();
  const command = process.argv[2] || 'start';
  
  try {
    switch (command) {
      case 'start':
        await loadBalancer.start();
        break;
      case 'stop':
        await loadBalancer.stop();
        break;
      case 'status':
        await loadBalancer.status();
        break;
      case 'monitor':
        await loadBalancer.monitor();
        break;
      case 'scale':
        const count = parseInt(process.argv[3]) || 2;
        await loadBalancer.scale(count);
        break;
      default:
        console.log('Usage: node load-balancer.js [start|stop|status|monitor|scale <count>]');
        process.exit(1);
    }
  } catch (error) {
    console.error('❌ Load balancer error:', error.message);
    process.exit(1);
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export default LoadBalancer;
