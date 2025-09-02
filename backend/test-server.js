const express = require('express');
const adminRoutes = require('./src/routes/admin');

const app = express();
const PORT = 4001;

// Basic middleware
app.use(express.json());

// Test admin routes
app.use('/api/sector_xp_12', adminRoutes);

// Test endpoint
app.get('/test', (req, res) => {
  res.json({ message: 'Test server working' });
});

app.listen(PORT, () => {
  console.log(`🧪 Test server running on port ${PORT}`);
  console.log(`🔐 Admin routes available at /api/sector_xp_12`);
});
