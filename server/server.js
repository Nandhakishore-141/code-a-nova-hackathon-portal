require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { connectDatabase, closeDatabase } = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const hackathonRoutes = require('./routes/hackathonRoutes');
const contactRoutes = require('./routes/contactRoutes');
const { notFound, errorHandler } = require('./middleware/errorMiddleware');

const app = express();
const port = Number(process.env.PORT) || 5000;

// Allow comma-separated frontend origins for local dev and deployed Vercel hosts (stripping trailing slashes)
const rawClientUrls = process.env.CLIENT_URL || 'http://localhost:5173';
const allowedOrigins = rawClientUrls
  .split(',')
  .map((origin) => origin.trim().replace(/\/+$/, ''))
  .filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (mobile apps, curl, uptime pingers)
      if (!origin) return callback(null, true);
      const cleanOrigin = origin.replace(/\/+$/, '');
      if (
        allowedOrigins.includes('*') ||
        allowedOrigins.includes(cleanOrigin) ||
        cleanOrigin.endsWith('.vercel.app')
      ) {
        return callback(null, true);
      }
      return callback(new Error(`Origin ${origin} not allowed by CORS policy.`));
    },
    credentials: true,
  })
);

app.use(express.json({ limit: '1mb' }));

// Root info endpoint (for browsers and service verifiers)
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    service: 'Code-a-Nova Hackathon Portal API',
    status: 'online',
    timestamp: new Date().toISOString(),
    endpoints: {
      health: '/api/health',
      auth: '/api/auth',
      user: '/api/user',
      hackathon: '/api/hackathon',
      contact: '/api/contact',
    },
  });
});

// Health check endpoint for Render/Railway monitoring
app.get('/api/health', (req, res) => {
  const mongoose = require('mongoose');
  const dbState = mongoose.connection.readyState;
  const states = ['disconnected', 'connected', 'connecting', 'disconnecting'];

  res.status(200).json({
    success: true,
    service: 'Code-a-Nova Hackathon Portal API',
    status: 'healthy',
    database: states[dbState] || 'unknown',
    timestamp: new Date().toISOString(),
  });
});

// Mount API route modules
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/hackathon', hackathonRoutes);
app.use('/api/contact', contactRoutes);

app.use(notFound);
app.use(errorHandler);

const startServer = async () => {
  try {
    const server = app.listen(port, '0.0.0.0', () => {
      console.log(`[Server] Code-a-Nova API running on port ${port}`);
    });

    // Connect to database without delaying port binding for Render health checks
    connectDatabase().catch((err) => {
      console.error('[DB] Connection error:', err.message);
    });

    const shutdown = async (signal) => {
      console.log(`\n[Server] ${signal} received. Shutting down gracefully...`);
      server.close(async () => {
        await closeDatabase();
        process.exit(0);
      });
    };

    process.on('SIGINT', () => shutdown('SIGINT'));
    process.on('SIGTERM', () => shutdown('SIGTERM'));
  } catch (error) {
    console.error('[Server] Startup failed:', error.message);
    process.exit(1);
  }
};

startServer();

