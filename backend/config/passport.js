const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
require('dotenv').config();

// 환경변수
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const GOOGLE_CALLBACK_URL = process.env.GOOGLE_CALLBACK_URL;

passport.serializeUser((user, done) => {
    done(null, user);
});

passport.deserializeUser((user, done) => {
    if (user) {
        done(null, user);
    } else {
        done(null, false);
    }
});

// Google Strategy 설정
passport.use(new GoogleStrategy({
    clientID: GOOGLE_CLIENT_ID,
    clientSecret: GOOGLE_CLIENT_SECRET,
    callbackURL: GOOGLE_CALLBACK_URL
}, async (accessToken, refreshToken, profile, done) => {
    try {
        // 계정 추상화 지갑 주소
        const walletAddress = `0x${profile.id.slice(0, 40)}`;
        
        const user = {
            id: profile.id,
            email: profile.emails[0].value,
            name: profile.displayName,
            picture: profile.photos[0].value,
            walletAddress: walletAddress,
            provider: 'google'
        };
        
        return done(null, user);
    } catch (error) {
        console.error('Google Strategy 에러:', error);
        return done(error, null);
    }
}));

module.exports = passport; 