const express = require("express");
const app = express();
const cors = require('cors');
const session = require('express-session');
const passport = require('passport');
const db = require('./models');
require('dotenv').config();

// 환경변수
const SESSION_SECRET = process.env.SESSION_SECRET;

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

app.use(cors({
    origin: 'http://localhost:3000',
    credentials: true
}));

app.use(session({
    secret: SESSION_SECRET,
    resave: true,
    saveUninitialized: true,
    cookie: { 
        secure: false, 
        httpOnly: true,
        sameSite: 'lax',
        maxAge: 24 * 60 * 60 * 1000
    }
}));

// Passport 설정
require('./config/passport');
app.use(passport.initialize());
app.use(passport.session());



// 라우터 설정
app.use('/auth', require('./routes/auth'));
app.use('/artwork', require('./routes/artwork'));
app.use('/proxy-image', require('./routes/proxy'));
app.use('/voting', require('./routes/voting'))



app.listen(4000, (error) => {
    if (error) {
        console.error(error);
    } else {
        console.log("server on");
    }
});

