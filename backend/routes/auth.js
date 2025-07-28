const express = require('express');
const passport = require('passport');
const router = express.Router();
const db = require('../models');

// Google 로그인
router.get('/google', passport.authenticate('google', {
    scope: ['profile', 'email']
}));

// Google 인증 후 콜백
router.get('/google/callback', 
    passport.authenticate('google', { failureRedirect: 'http://localhost:3000/login' }),
    async (req, res) => {
        try {
            // DB에 사용자 저장/업데이트
            const [user, created] = await db.User.findOrCreate({
                where: { google_id: req.user.id },
                defaults: {
                    email: req.user.email,
                    display_name: req.user.name,
                    wallet_address: req.user.walletAddress,
                    is_eligible_voter: true,
                    vote_weight: 0
                }
            });
            
            if (!created) {
                await user.update({
                    email: req.user.email,
                    display_name: req.user.name,
                    wallet_address: req.user.walletAddress
                });
            }
            
            res.redirect('http://localhost:3000/');
        } catch (error) {
            console.error(error);
            res.redirect('http://localhost:3000/login');
        }
    }
);

// 현재 로그인된 유저 정보
router.get('/user', async (req, res) => {
    try {
        if (req.isAuthenticated()) {
            const user = await db.User.findOne({
                where: { google_id: req.user.id }
            });
            if (user) {
                return res.json({
                    success: true,
                    user: {
                        google_id: user.google_id,
                        email: user.email,
                        display_name: user.display_name,
                        wallet_address: user.wallet_address,
                        is_eligible_voter: user.is_eligible_voter,
                        vote_weight: user.vote_weight,
                        picture: req.user.picture
                    }
                });
            }
        }
        return res.json({ success: false, user: null });
    } catch (error) {
        console.error('사용자 조회 실패:', error);
        return res.status(500).json({ success: false, message: '사용자 조회 실패' });
    }
});

// 로그아웃
router.get('/logout', (req, res) => {
    req.logout((err) => {
        if (err) {
            return res.status(500).json({ error: '로그아웃 실패' });
        }
        res.json({ success: true, message: '로그아웃 완료' });
    });
});

module.exports = router;