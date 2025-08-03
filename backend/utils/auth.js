const db = require('../models');

const getCurrentUser = async (req) => {
    try {
        let currentUser = null;
        let userId = null;
        let loginType = null;
        
        // Google OAuth 사용자 확인
        if (req.isAuthenticated() && req.user) {
            const userGoogleId = req.user.id;
            currentUser = await db.User.findOne({ where: { google_id: userGoogleId } });
            userId = currentUser?.id;
            loginType = 'google';
            
            if (currentUser) {
                return {
                    user: currentUser,
                    userId,
                    loginType,
                    error: null
                };
            }
        }
        
        // MetaMask 세션 사용자 확인  
        if (req.session?.user?.login_type === 'metamask') {
            userId = req.session.user.id;
            currentUser = await db.User.findOne({ where: { id: userId } });
            loginType = 'metamask';
            
            if (currentUser) {
                return {
                    user: currentUser,
                    userId,
                    loginType,
                    error: null
                };
            }
        }
        
        // 사용자 없음
        return {
            user: null,
            userId: null,
            loginType: null,
            error: 'AUTHENTICATION_REQUIRED'
        };
        
    } catch (error) {
        console.error(error);
        return {
            user: null,
            userId: null,
            loginType: null,
            error: 'DATABASE_ERROR'
        };
    }
};

module.exports = { getCurrentUser };