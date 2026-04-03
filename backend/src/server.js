// this will load env, connection mongodb, starts express htttp server
const dotenv = require('dotenv');
dotenv.config();

const app = require('./app');
const connectDB = require('./config/db');

const PORT = process.env.PORT || 5000;

//database connect hone ke baad express listens
connectDB().then(() => {
    app.listen(PORT , () => {
        console.log("Database connnected & backend server is running on port" + PORT + "\n")
    })
})
