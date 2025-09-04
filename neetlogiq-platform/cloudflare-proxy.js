// Simple proxy to simulate Cloudflare Worker on port 8787
const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const cors = require('cors');

const app = express();
const PORT = 8787;

// Enable CORS
app.use(cors());

// Proxy all requests to the Node.js backend on port 5001
app.use('/', createProxyMiddleware({
  target: 'http://localhost:5001',
  changeOrigin: true,
  logLevel: 'debug'
}));

app.listen(PORT, () => {
  console.log(`🚀 Cloudflare Simulation Proxy running on http://localhost:${PORT}`);
  console.log(`📡 Proxying requests to http://localhost:5001`);
});
