const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const { validateEnv } = require('./config/env');
const routes = require('./routes');
const { notFound, errorHandler } = require('./middleware/errorHandler');

const app = express();

const allowedOrigins = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:5000',
  'http://127.0.0.1:5000',
  ...(process.env.CLIENT_URL ? process.env.CLIENT_URL.split(',').map((origin) => origin.trim()) : [])
];

app.use(cors({
  origin(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
    return callback(new Error(`CORS blocked origin: ${origin}`));
  },
  credentials: true
}));
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true }));

app.get('/health', (req, res) => {
  res.status(200).json({ success: true, message: 'LearnLoop API is healthy' });
});

app.use('/api/v1', routes);
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

function handleServerError(error) {
  if (error.code === 'EADDRINUSE') {
    console.error(`Port ${PORT} is already in use.`);
    console.error('Stop the process using that port, or start the API with a different PORT value.');
    process.exit(1);
  }

  console.error('Server error:', error);
  process.exit(1);
}

async function start() {
  validateEnv();
  await connectDB();
  const server = app.listen(PORT, () => {
    console.log(`LearnLoop API running on port ${PORT}`);
  });
  server.on('error', handleServerError);
}

if (require.main === module) {
  start().catch((error) => {
    console.error('Failed to start server:', error);
    process.exit(1);
  });
}

module.exports = app;
