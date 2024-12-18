// Require All Packages
const express = require('express');
const colors = require('colors');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const errorHandler = require('./middlewares/error');
const fileUpload = require('express-fileupload');
const cookieParser = require('cookie-parser');
const path = require('path');

// Configuring DOTENV
dotenv.config({ path: './config.env' });
const PORT = process.env.PORT || 3000;

// Require Route Files
const user = require('./route/user');

// Initializations
const app = express();

// Setting View Engine
app.set('view engine', 'ejs');

// Connecting to the Database
connectDB();

// Use Server Middlewares
app.use(express.json());
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(fileUpload());

// Serving Static Files
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'views')));

// API Routes
app.use('/api/v1', user);

// Requiring Middlewares
app.use(errorHandler);

// Main Route (Default Route)
app.get('/', (req, res) => {
    res.render('homepage'); // Renders homepage.ejs from views
});

// Listen to Port
app.listen(PORT, () => {
    console.log(`Server Started at Port ${PORT}`.green.bold);
});
