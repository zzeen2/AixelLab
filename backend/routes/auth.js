const express = require('express');
const passport = require('passport');
const router = express.Router();
const db = require('../models');
const { ethers } = require('ethers');

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
                    wallet_address: req.user.walletAddress || '0x0000000000000000000000000000000000000000',
                    login_type: 'google',
                    is_eligible_voter: true,
                    vote_weight: 0
                }
            });
            
            if (!created) {
                await user.update({
                    email: req.user.email,
                    display_name: req.user.name,
                });
            }
            
            res.redirect('http://localhost:3000/');
        } catch (error) {
            console.error(error);
            res.redirect('http://localhost:3000/login');
        }
    }
);

// MetaMask 서명 메시지 생성
router.post('/metamask/message', async (req, res) => {
    try {
        const { walletAddress } = req.body;
        
        if (!walletAddress) {
            return res.status(400).json({ success: false, message: '지갑 주소가 필요합니다.' });
        }

        // 타임스탬프를 포함한 고유 메시지 생성
        const timestamp = Date.now();
        const message = `AixelLab에 로그인하려고 합니다.\n\n지갑 주소: ${walletAddress}\n타임스탬프: ${timestamp}\n\n이 서명은 인증 목적으로만 사용됩니다.`;
        
        // 세션에 메시지와 주소 저장 (5분 후 만료)
        req.session.authMessage = message;
        req.session.authWalletAddress = walletAddress;
        req.session.authTimestamp = timestamp;
        
        res.json({
            success: true,
            message: message
        });
    } catch (error) {
        console.error('메시지 생성 실패:', error);
        res.status(500).json({ success: false, message: '메시지 생성 실패' });
    }
});

// MetaMask 서명 검증 및 로그인
router.post('/metamask/verify', async (req, res) => {
    try {
        const { walletAddress, signature, displayName } = req.body;
        
        if (!walletAddress || !signature) {
            return res.status(400).json({ success: false, message: '지갑 주소와 서명이 필요합니다.' });
        }

        // 세션에서 메시지 확인
        const message = req.session.authMessage;
        const sessionWalletAddress = req.session.authWalletAddress;
        const sessionTimestamp = req.session.authTimestamp;
        
        if (!message || !sessionWalletAddress || !sessionTimestamp) {
            return res.status(400).json({ success: false, message: '인증 세션이 만료되었습니다.' });
        }

        // 타임스탬프 검증 (5분 이내)
        if (Date.now() - sessionTimestamp > 5 * 60 * 1000) {
            return res.status(400).json({ success: false, message: '인증 시간이 만료되었습니다.' });
        }

        // 지갑 주소 일치 확인
        if (walletAddress.toLowerCase() !== sessionWalletAddress.toLowerCase()) {
            return res.status(400).json({ success: false, message: '지갑 주소가 일치하지 않습니다.' });
        }

        try {
            // 서명 검증
            const recoveredAddress = ethers.verifyMessage(message, signature);
            
            if (recoveredAddress.toLowerCase() !== walletAddress.toLowerCase()) {
                return res.status(400).json({ success: false, message: '서명 검증 실패' });
            }
        } catch (verifyError) {
            console.error('서명 검증 오류:', verifyError);
            return res.status(400).json({ success: false, message: '서명 검증 실패' });
        }

        // DB에 사용자 저장/업데이트
        const [user, created] = await db.User.findOrCreate({
            where: { wallet_address: walletAddress.toLowerCase() },
            defaults: {
                google_id: null,
                email: null,
                display_name: displayName || `User_${walletAddress.slice(0, 6)}`,
                wallet_address: walletAddress.toLowerCase(),
                login_type: 'metamask',
                is_eligible_voter: true,
                vote_weight: 0
            }
        });
        
        if (!created && displayName) {
            await user.update({
                display_name: displayName
            });
        }

        // 세션에 사용자 정보 저장
        req.session.user = {
            id: user.id,
            wallet_address: user.wallet_address,
            login_type: 'metamask'
        };

        // 인증 세션 정리
        delete req.session.authMessage;
        delete req.session.authWalletAddress;
        delete req.session.authTimestamp;
        
        res.json({
            success: true,
            user: {
                id: user.id,
                display_name: user.display_name,
                wallet_address: user.wallet_address,
                login_type: user.login_type,
                is_eligible_voter: user.is_eligible_voter,
                vote_weight: user.vote_weight
            }
        });
    } catch (error) {
        console.error('MetaMask 인증 실패:', error);
        res.status(500).json({ success: false, message: 'MetaMask 인증 실패' });
    }
});

// 현재 로그인된 유저 정보
router.get('/user', async (req, res) => {
    try {
        let user = null;
        
        // Google OAuth 사용자 확인
        if (req.isAuthenticated() && req.user) {
            user = await db.User.findOne({
                where: { google_id: req.user.id }
            });
            if (user) {
                return res.json({
                    success: true,
                    user: {
                        id: user.id,
                        google_id: user.google_id,
                        email: user.email,
                        display_name: user.display_name,
                        wallet_address: user.wallet_address,
                        login_type: user.login_type,
                        is_eligible_voter: user.is_eligible_voter,
                        vote_weight: user.vote_weight,
                        picture: req.user.picture
                    }
                });
            }
        }
        
        // MetaMask 사용자 확인
        if (req.session.user && req.session.user.login_type === 'metamask') {
            user = await db.User.findOne({
                where: { id: req.session.user.id }
            });
            if (user) {
                return res.json({
                    success: true,
                    user: {
                        id: user.id,
                        google_id: user.google_id,
                        email: user.email,
                        display_name: user.display_name,
                        wallet_address: user.wallet_address,
                        login_type: user.login_type,
                        is_eligible_voter: user.is_eligible_voter,
                        vote_weight: user.vote_weight,
                        picture: null // MetaMask 사용자는 프로필 이미지 없음
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
    // Google OAuth 로그아웃
    req.logout((err) => {
        if (err) {
            console.error('Google 로그아웃 오류:', err);
        }
    });
    
    // MetaMask 세션 정리
    if (req.session.user) {
        delete req.session.user;
    }
    
    // 인증 관련 세션 정리
    delete req.session.authMessage;
    delete req.session.authWalletAddress;
    delete req.session.authTimestamp;
    
    res.json({ success: true, message: '로그아웃 완료' });
});

module.exports = router;