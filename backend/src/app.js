require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');
const path = require('path');

const connectDB = require('./config/db');          // ← changed
const authRoutes = require('./modules/auth/auth.routes');
const taskRoutes = require('./modules/tasks/tasks.routes');
const { error } = require('./utils/apiResponse');

const app = express();

const corsOptions = {
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

app.use(helmet());
app.use(cors(corsOptions));
app.options(/.*/, cors(corsOptions));
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/tasks', taskRoutes);

try {
  const swaggerDoc = YAML.load(path.join(__dirname, '../swagger.yaml'));
  app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerDoc));
} catch (e) {
  console.warn('Swagger YAML not found, skipping docs route');
}

app.get('/health', (req, res) => res.json({ status: 'ok', timestamp: new Date() }));
app.use((req, res) => error(res, `Route ${req.originalUrl} not found`, 404));
app.use((err, req, res, next) => {
  console.error(err.stack);
  error(res, 'Internal server error', 500);
});

const PORT = process.env.PORT || 5050;

connectDB().then(() => {                           // ← changed
  app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
});