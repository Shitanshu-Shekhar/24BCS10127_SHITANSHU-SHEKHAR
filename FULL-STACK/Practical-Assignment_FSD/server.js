require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const registrationRoutes = require('./routes/registrations');

const app = express();
app.use(express.json());

app.get('/', (_req, res) => {
  res.status(200).json({
    success: true,
    message: 'Campus Event Registration API is running',
    endpoints: '/api/registrations'
  });
});
app.use('/api/registrations', registrationRoutes);

// Keep API errors readable instead of exposing stack traces.
app.use((err, _req, res, _next) => {
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: Object.values(err.errors).map((item) => item.message)
    });
  }
  if (err.code === 11000) {
    return res.status(409).json({
      success: false,
      message: 'This email is already registered for the event'
    });
  }
  if (err.name === 'CastError') {
    return res.status(400).json({ success: false, message: 'Invalid registration ID format' });
  }
  console.error(err);
  return res.status(500).json({ success: false, message: 'Internal server error' });
});

const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/campus_event_registration';

mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log('Connected to MongoDB');
    app.listen(PORT, () => console.log(`Server listening on port ${PORT}`));
  })
  .catch((error) => {
    console.error('Could not connect to MongoDB:', error.message);
    process.exit(1);
  });
