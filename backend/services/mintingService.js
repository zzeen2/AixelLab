const db = require('../models');

const checkVoteThreshold = async (proposalId) => {
    try {
        const proposal = await db.Proposal.findByPk(proposalId, {
            include: [
                {
                    model: db.Vote,
                    as: 'votes'
                }
            ]
        });

        if (!proposal) {
            return { success: false, error: 'Proposal not found' };
        }

        // 'for' 투표만 카운트
        const voteCount = proposal.votes ? proposal.votes.filter(vote => vote.vote_type === 'for').length : 0;
        const threshold = 10; // 민팅 임계값

        const readyForMinting = voteCount >= threshold;

        return {
            success: true,
            readyForMinting,
            voteCount,
            threshold,
            proposalId
        };
    } catch (error) {
        console.error(error);
        return { success: false, error: error.message };
    }
};

const getArtistWalletAddress = async (user) => {
    try {
        // Google 사용자인 경우 - EOA 주소 우선 사용
        if (user.login_type === 'google' && user.eoa_address) {
            return user.eoa_address;
        }
        // MetaMask 사용자인 경우
        if (user.wallet_address && user.wallet_address !== '0x0000000000000000000000000000000000000000') {
            return user.wallet_address;
        }
        // Google 사용자인 경우 - 스마트 계정 생성/조회 
        if (user.google_id && user.eoa_address) {
            const contractManager = require('../utils/contractManager');
            const accountResult = await contractManager.createGoogleUserAccount(user.eoa_address);
            if (accountResult.success) {
                return accountResult.accountAddress;
            }
        }
        return null;
    } catch (error) {
        console.error('Error in getArtistWalletAddress:', error);
        return null;
    }
};

module.exports = {
    checkVoteThreshold,
    getArtistWalletAddress
}; 