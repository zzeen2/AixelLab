const express = require("express");
const app = express();
const cors = require('cors');
const session = require('express-session');
const passport = require('passport');
const db = require('./models');
const contractManager = require('./utils/contractManager');
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

// 서버 시작 및 ContractManager 초기화
async function startServer() {
    try {
        // ContractManager 초기화
        console.log('🔧 ContractManager 초기화 중...');
        await contractManager.initialize();
        console.log('✅ ContractManager 초기화 완료');
        
        // 서버 시작
        app.listen(4000, (error) => {
            if (error) {
                console.error('❌ 서버 시작 실패:', error);
            } else {
                console.log('🚀 서버가 포트 4000에서 실행중입니다');
                console.log('📋 사용 가능한 API:');
                console.log('   - POST /voting/:id/vote (자동 민팅 포함)');
                console.log('   - GET  /voting/:id/minting-status');
                console.log('   - POST /voting/:id/mint (수동 민팅)');
                console.log('   - GET  /voting/admin/contract-status');
            }
        });
        
    } catch (error) {
        console.error('❌ 서버 초기화 실패:', error);
        console.log('⚠️  블록체인 기능이 비활성화된 상태로 서버를 시작합니다...');
        
        // ContractManager 초기화 실패 시에도 서버는 시작
        app.listen(4000, (error) => {
            if (error) {
                console.error('❌ 서버 시작 실패:', error);
            } else {
                console.log('🚀 서버가 포트 4000에서 실행중입니다 (블록체인 기능 비활성화)');
            }
        });
    }
}

startServer();

