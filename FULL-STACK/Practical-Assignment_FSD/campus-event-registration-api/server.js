require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const registrationRoutes = require('./routes/registrations');

const app = express();
app.use(cors());
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => res.json({
  success: true,
  message: 'Campus Event Registration API is running',
  endpoints: {
    create: 'POST /api/registrations',
    list: 'GET /api/registrations',
    getOne: 'GET /api/registrations/:id',
    update: 'PUT /api/registrations/:id',
    delete: 'DELETE /api/registrations/:id'
  }
}));
app.get('/health', (req, res) => res.status(200).json({ success: true, database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected' }));
app.use('/api/registrations', registrationRoutes);
app.use((req, res) => res.status(404).json({ success: false, message: 'Route not found' }));
app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && 'body' in err) return res.status(400).json({ success: false, message: 'Invalid JSON body' });
  console.error(err);
  return res.status(500).json({ success: false, message: 'Internal server error' });
});

const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI;
async function start() {
  if (!MONGODB_URI) {
    console.error('MONGODB_URI is missing. Copy .env.example to .env and configure MongoDB.');
    process.exit(1);
  }
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('MongoDB connected');
    app.listen(PORT, () => console.log(`Campus Event Registration API listening on http://localhost:${PORT}`));
  } catch (error) {
    console.error('Unable to connect to MongoDB:', error.message);
    process.exit(1);
  }
}
if (require.main === module) start();
module.exports = { app, start };
