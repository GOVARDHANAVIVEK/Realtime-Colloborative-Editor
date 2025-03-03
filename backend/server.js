const express = require('express');
const cors = require('cors');
const bodyparser = require('body-parser');
const { rateLimit } = require('express-rate-limit');
const http = require('http');
const { Server } = require('socket.io');  // Importing correct WebSocket server
require('dotenv').config();
const connectMongooseDB = require('./config/db');
const passport = require('passport');
const session = require("express-session");
const configurePassport = require('./config/passport');

const app = express();
const server = http.createServer(app);  // Create HTTP server

const io = new Server(server, {
    cors: { origin: process.env.FRONTEND_URL, credentials: true }  // Corrected CORS setup
});



// Middleware
app.use(bodyparser.json());
app.use(bodyparser.urlencoded({ extended: false }));
app.use(cors({
    origin: process.env.FRONTEND_URL,
    credentials: true
}));

app.use(session({
    secret: process.env.SESSION_SECRET || "your_secret_key",
    resave: false,
    saveUninitialized: true,
}));

app.use(passport.initialize());
app.use(passport.session());

const limiter = rateLimit({
    windowMs: 25 * 60 * 1000, 
    limit: 500, 
    standardHeaders: 'draft-8',
    legacyHeaders: false,
});

// configurePassport(); // Make sure passport is correctly configured
// app.use(limiter);

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/documents', require('./routes/documents'));
app.use('/api/users', require('./routes/users'));

// Pass `io` to socket.js correctly
require('./sockets/socket')(io);
// Connect to MongoDB
connectMongooseDB();
// Start the server
server.listen(process.env.PORT || 3900, () => {
    console.log(`Running on port ${process.env.PORT || 3900}`);
});

module.exports = { server, io};
