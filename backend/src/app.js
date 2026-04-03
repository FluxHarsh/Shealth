const express = require('express');
const cors = require('cors');
const helmet = require('helmet');

const app = express();
app.use(helmet());

app.use(cors({
  origin: process.env.FRONTEND_URL,
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));


app.get('/health', (req, res) => {
  res.json({ success: true, message: 'SHEALTH API is running', timestamp: new Date() });
});


app.use('/api/auth',        require('./routes/auth.routes'));
app.use('/api/users',       require('./routes/user.routes'));
app.use('/api/whf',         require('./routes/whf.routes'));


app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found` });
});


module.exports = app;