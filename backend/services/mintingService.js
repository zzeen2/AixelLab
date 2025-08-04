const contractManager = require('../utils/contractManager');
const db = require('../models');

const VOTE_THRESHOLD = process.env.VOTE_THRESHOLD || 10;

// 투표 임계점 체크 (민팅 준비 상태 확인)
const checkVoteThreshold = async (proposalId) => {
    try {
        // 제안 정보 조회
        const proposal = await db.Proposal.findByPk(proposalId, { include: [{ model: db.User, as: 'author' }]});

        if (!proposal) return { success: false, error: "proposalId를 찾을 수 없습니다." };

        // 이미 민팅되었는지 확인
        if (proposal.nft_minted) { return { success: false, error: "이미 민팅된 nft입니다." }}

        // 투표 수 확인
        const voteCount = await db.Vote.count({where: { proposal_id_fk: proposalId}});
        console.log(`Current vote count: ${voteCount}, Threshold: ${VOTE_THRESHOLD}`);

        // 임계점 여부 확인
        if (voteCount < VOTE_THRESHOLD) {
            return { 
                success: false, 
                error: "임계점에 도달하지 않았습니다.",
                voteCount,
                threshold: VOTE_THRESHOLD,
                eligible: false
            };
        }

        // 작가 지갑 주소 결정
        const artistAddress = await getArtistWalletAddress(proposal.author);
        if (!artistAddress) return { success: false, error: "작가의 지갑주소를 찾을 수 없습니다." };

        // 민팅 준비 완료 상태
        return {
            success: true, 
            mintingReady: true,
            voteCount, 
            threshold: VOTE_THRESHOLD,
            artistAddress,
            proposalId: proposalId,
            eligible: true,
        };

    } catch (error) {
        console.error(error);
        return { success: false, error: "임계점 체크 중 오류가 발생했습니다." };
    }
};

// 작가지갑 주소 결정 (Google vs MetaMask)
const getArtistWalletAddress = async (user) => {
    try {
        // MetaMask 사용자인 경우
        if (user.wallet_address && user.wallet_address !== '0x0000000000000000000000000000000000000000') {
            return user.wallet_address;
        }

        // Google 사용자인 경우 - 스마트 계정 생성/조회
        if (user.google_id && user.eoa_address) {
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

// 민팅 상태 조회
const getMintingStatus = async (proposalId) => {
    try {
        const proposal = await db.Proposal.findByPk(proposalId);
        if (!proposal) return {success: false, error: "proposalId를 찾을 수 없습니다."};

        const voteCount = await db.Vote.count({where: { proposal_id_fk: proposalId } });

        return {
            success: true,
            proposalId,
            voteCount,
            threshold: VOTE_THRESHOLD,
            nftMinted: proposal.nft_minted,
            tokenId: proposal.nft_token_id,
            transactionHash: proposal.nft_transaction_hash,
            mintedAt: proposal.minted_at,
            artistWalletAddress: proposal.artist_wallet_address,
            eligible: voteCount >= VOTE_THRESHOLD && !proposal.nft_minted,
            mintingReady: voteCount >= VOTE_THRESHOLD && !proposal.nft_minted
        };

    } catch (error) {
        console.error(error);
        return { success: false, error: "민팅 상태 조회 중 오류가 발생했습니다." };
    }
};

module.exports = { checkVoteThreshold, getMintingStatus, VOTE_THRESHOLD }; 