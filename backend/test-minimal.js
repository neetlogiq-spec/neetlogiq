const express = require('express');
const app = express();
const PORT = 4001;

app.get('/test', (req, res) => {
  res.json({ message: 'Minimal server working!' });
});

app.listen(PORT, () => {
  console.log(`Minimal test server running on port ${PORT}`);
});
