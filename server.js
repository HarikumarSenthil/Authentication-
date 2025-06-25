// server.js or index.js or app.js
const express = require('express');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const dotenv = require('dotenv');
const cors = require('cors');
const { initializeDatabase } = require('./utils/db');
const authRoutes = require('./routes/authRoutes');

dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;


app.use(cors({
  origin: ['http://localhost:5173', 'https://task-board-c99j.vercel.app'],
  credentials: true
}));

app.use(express.json());
app.use(cookieParser());
app.use(morgan('dev'));

app.use('/api/auth', authRoutes);

app.get('/', (req, res) => res.send('Auth Backend Running'));

initializeDatabase().then(() => {
  app.listen(PORT, () => console.log(`Server is running at http://localhost:${PORT}`));
}).catch((err) => {
  console.error('Database initialization failed:', err);
});
