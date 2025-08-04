const express = require("express");
const app = express();
const cors = require('cors');
const session = require('express-session');
const passport = require('passport');
const db = require('./models');
const contractManager = require('./utils/contractManager');
require('dotenv').config();

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

require('./config/passport');
app.use(passport.initialize());
app.use(passport.session());

app.use('/auth', require('./routes/auth'));
app.use('/artwork', require('./routes/artwork'));
app.use('/proxy-image', require('./routes/proxy'));
app.use('/voting', require('./routes/voting'));

async function startServer() {
    try {
        await contractManager.initialize();
        console.log('ContractManager 초기화 완료');
    } catch (error) {
        console.error('ContractManager 초기화 실패:', error);
    }
    
    app.listen(4000, (error) => {
        if (error) {
            console.error('서버 시작 실패:', error);
        } else {
            console.log('서버가 포트 4000에서 실행중입니다');
        }
    });
}

startServer();

