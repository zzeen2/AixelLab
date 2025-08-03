const contractManager = require('../utils/contractManager');
const db = require('../models');

const VOTE_THRESHOLD = process.env.VOTE_THRESHOLD || 10;

// 투표 임계점 체크 및 자동 민팅
const checkVoteAndMint = async (proposalId) => {
    try {
        console.log(proposalId);

        // 제안 정보 조회
        const proposal = await db.Proposal.findByPk(proposalId, { include: [{ model: User, as: 'author' }]});

        if (!proposal) return { success: false, error: "proposalId를 찾을 수 없습니다." };

        // 이미 민팅되었는지 확인
        if (proposal.nft_minted) { return { success: false, error: "이미 민팅된 nft입니다." }}

        // 투표 수 확인
        const voteCount = await db.Vote.count({where: { proposal_id_fk: proposalId}});
        console.log(voteCount);

        // 임계점 여부 확인
        if (voteCount < VOTE_THRESHOLD) {return { success: false, error: "임계점에 도달하지 않았습니다." }}

        // 작가 지갑 주소 결정
        const artistAddress = await getArtistWalletAddress(proposal.author);
        if (!artistAddress) return { success: false, error: "작가의 지갑 주소를 찾을 수 없습니다." };

        // 민팅 실행
        const mintResult = await contractManager.mintApprovedArtwork(
            artistAddress,
            proposalId,
            proposal.artwork_url, // IPFS URL을 tokenURI로 사용
            voteCount
        );

        // DB 업데이트
        await proposal.update({
            nft_minted: true,
            nft_token_id: mintResult.tokenId,
            nft_transaction_hash: mintResult.transactionHash,
            minted_at: new Date(),
            artist_wallet_address: artistAddress
        });

        return {success: true, tokenId: mintResult.tokenId, voteCount, transactionHash: mintResult.transactionHash, artistAddress}

    } catch (error) {
        console.error(error);
    }
};

// 작가지갑 주소 결정 (Google vs MetaMask)
const getArtistWalletAddress = async (user) => {
    try {
        // MetaMask 사용자인 경우
        if (user.wallet_address) {return user.wallet_address;}

        // Google 사용자인 경우
        if (user.google_id) {
            
            //TODO 사용자별 고유한 방식으로 EOA 생성
            const { ethers } = require('ethers');
            const tempEOA = ethers.Wallet.createRandom().address;
            
            const accountResult = await contractManager.createGoogleUserAccount(tempEOA);
            
            if (accountResult.success) {
                return accountResult.accountAddress;
            }
        }
        return null;
    } catch (error) {
        console.error(error);
    }
};

// 민팅 상태 조회
const getMintingStatus = async (proposalId) => {
    try {
        const proposal = await db.Proposal.findByPk(proposalId);
        if (!proposal) return {success: false, error: "proposalId를 찾을 수 없습니다."};

        const voteCount = await db.Vote.count({where: { proposal_id_fk: proposalId } });

        return {
            proposalId,
            voteCount,
            threshold: VOTE_THRESHOLD,
            nftMinted: proposal.nft_minted,
            tokenId: proposal.nft_token_id,
            transactionHash: proposal.nft_transaction_hash,
            mintedAt: proposal.minted_at,
            artistWalletAddress: proposal.artist_wallet_address,
            eligible: voteCount >= VOTE_THRESHOLD && !proposal.nft_minted
        };

    } catch (error) {
        console.error(error);
    }
};

module.exports = {checkVoteAndMint, getMintingStatus,VOTE_THRESHOLD }; 