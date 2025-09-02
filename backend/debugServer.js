console.log('🚀 Starting debug server...');

try {
  const express = require('express');
  console.log('✅ Express loaded successfully');
  
  const app = express();
  const PORT = 4004;
  
  console.log('✅ Express app created');
  
  // Basic middleware
  app.use(express.json());
  console.log('✅ Middleware loaded');
  
  // Health check
  app.get('/health', (req, res) => {
    console.log('📡 Health check request received');
    res.json({ 
      status: 'UP', 
      timestamp: new Date().toISOString(),
      message: 'Debug server is running'
    });
  });
  
  console.log('✅ Routes configured');
  
  // Start server with explicit error handling
  const server = app.listen(PORT, '127.0.0.1', () => {
    console.log(`✅ Server started successfully on port ${PORT}`);
    console.log(`🔗 Health: http://127.0.0.1:${PORT}/health`);
  });
  
  server.on('error', (error) => {
    console.error('❌ Server error:', error);
    process.exit(1);
  });
  
  server.on('listening', () => {
    console.log('🎯 Server is listening');
  });
  
  console.log('✅ Server setup complete');
  
} catch (error) {
  console.error('❌ Fatal error:', error);
  process.exit(1);
}

console.log('🏁 Script execution completed');
