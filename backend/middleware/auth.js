const isAuthenticated = (req, res, next) => {
    // Google OAuth 인증 확인
    if (req.isAuthenticated()) {
        return next();
    }
    
    // MetaMask 세션 인증 확인
    if (req.session && req.session.user && req.session.user.login_type === 'metamask') {
        return next();
    }
    
    return res.status(401).json({ error: "로그인이 필요합니다" });
};

module.exports = { isAuthenticated }; 