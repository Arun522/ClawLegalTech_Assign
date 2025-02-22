// backend/server.js
const express = require('express');
const connectDB = require('./config/db');
const cors =require('cors');
require('dotenv').config();



connectDB();

const app = express();

// Middleware for JSON parsing
app.use(express.json());
app.use(cors());

// Define routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/resignations', require('./routes/resignations'));

const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0',() => console.log(`Server running on port ${PORT}`));
