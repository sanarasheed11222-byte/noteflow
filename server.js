const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const authRoutes = require('./backend/routes/authRoutes');
const notesRoutes = require('./backend/routes/notesRoutes');
const errorMiddleware = require('./backend/middleware/errorMiddleware');

dotenv.config();

const app = express();

// Middleware
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/notes', notesRoutes);

// Health check
app.get('/', (req, res) => {
  res.json({ 
    message: 'Notes App API is running',
    version: '1.0.0',
    status: 'success'
  });
});

// Error handling middleware
app.use(errorMiddleware);

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});