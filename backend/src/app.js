const express = require('express');
const cors = require('cors');

const app = express();
//temoprary
// app.use(cors({
//   origin: 'FRONTEND_URL',
// }));

app.use(cors());

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));



app.get("/", (req,res)=>{
    res.send("/ endpoint is running")
})


app.get('/health', (req, res) => {
  res.json({ 
    success: true, 
    message: 'SHEALTH API is running'
});
});


app.use('/api/auth',        require('./routes/auth.routes'));
app.use('/api/users',       require('./routes/user.routes'));
app.use('/api/assessment',  require('./routes/assessment.routes'));
app.use('/api/vitals',      require('./routes/vitals.routes'));
app.use('/api/ai',          require('./routes/ai.routes'));
// app.use('/api/consult',     require('./routes/consult.routes'));
// app.use('/api/diagnostics', require('./routes/diagnostics.routes'));
// app.use('/api/slots',       require('./routes/slot.routes'));
app.use('/api/whf',         require('./routes/whf.routes'));


app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found` });
});

app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({ success: false, message: err.message || 'Internal server error' });
});

module.exports = app;