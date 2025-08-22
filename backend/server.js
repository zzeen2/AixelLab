const express = require('express');
const session = require('express-session');
const passport = require('passport');
const cors = require('cors');
const path = require('path');
require('./config/passport');
const authRoutes = require('./routes/auth');
const artworkRoutes = require('./routes/artwork');
const votingRoutes = require('./routes/voting');
const proxyRoutes = require('./routes/proxy');
const contractManager = require('./utils/contractManager');
const marketplaceRoutes = require('./routes/marketplace');

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(session({
    secret: process.env.SESSION_SECRET || 'your-secret-key',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: process.env.NODE_ENV === 'production',
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
}));


app.use(passport.initialize());
app.use(passport.session());


const db = require('./models');
app.locals.db = db;


const startServer = async () => {
    try {
        try {
            await db.sequelize.sync({ force: false });
            console.log('데이터베이스 테이블 재생성 완료');
        } catch (error) {
            console.error('데이터베이스 동기화 오류:', error);
            throw error;
        }
        console.log('Database synchronized');

        const contractInitResult = await contractManager.initialize();
        if (!contractInitResult.success) {
            console.error('Contract manager initialization failed:', contractInitResult.error);
        } else {
            console.log('Contract manager initialized successfully');
        }

        // Start server
        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });
    } catch (error) {
        console.error('Server startup failed:', error);
        process.exit(1);
    }
};

app.use('/auth', authRoutes);
app.use('/artwork', artworkRoutes);
app.use('/voting', votingRoutes);
app.use('/proxy', proxyRoutes);
app.use('/proxy-image', proxyRoutes);
app.use('/marketplace', marketplaceRoutes);

app.get('/health', (req, res) => {
    res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Something went wrong!' });
});

startServer();


