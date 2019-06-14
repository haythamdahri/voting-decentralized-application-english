const express = require('express')
const expressLayouts = require('express-ejs-layouts');
const bodyParser = require('body-parser')
const flash = require('express-flash');
const session = require('express-session');
const app = express()

// Load configuration from .env ffile for production mode
require('dotenv').config()

// Use port 3000 if development mode or load it from .env file
const port = process.env.PORT

const indexRouter = require('./routes/index');

app.set('view engine', 'ejs')
app.set('views', __dirname + '/views')
app.set('layout', 'layouts/layout')
app.use(expressLayouts)
app.use(bodyParser.urlencoded({limit: '10mb', extended: false}));
app.use(express.static('public'))
app.use(session({resave: false, saveUninitialized: true, secret: 'secretsession' }));
app.use(flash());

app.use('/', indexRouter);


app.listen(port, () => {
    console.log(`Server is running on port ${port}...`);
});