const express = require("express");
const router = express.Router();
const { isAuthenticated } = require('../middleware/auth');
const { getCurrentUser } = require('../utils/auth');
const db = require("../models");
const { checkVoteThreshold, getMintingStatus } = require('../services/mintingService');
const contractManager = require('../utils/contractManager');
const { verifyPassword } = require('../utils/passwordValidator');
const { ethers } = require('ethers');

// 투표 목록 가져오기
router.get('/', async (req, res) => {
    try {
        // 먼저 간단한 조회부터 테스트
        const proposalCount = await db.Proposal.count();
        console.log('Proposal 테이블 레코드 수:', proposalCount);
        
        // include 없이 기본 조회
        const votes = await db.Proposal.findAll({
            order: [['createdAt', 'DESC']]
        });
        
        console.log('조회된 Proposal 수:', votes.length);

        // 관계 포함한 조회
        const votesWithRelations = await db.Proposal.findAll({
            include: [
                {
                    model: db.Artwork,
                    as: 'artwork',
                    attributes: ["title", 'description', 'image_ipfs_uri'],
                    required: false
                },
                {
                    model: db.Vote,
                    as: 'votes',
                    attributes: ['vote_type'],
                    required: false
                },
            ],
            order: [['createdAt', 'DESC']]
        });

        // 전처리
        const formattedVotes = votesWithRelations.map(vote => {
            const votesFor = vote.votes ? vote.votes.filter(v => v.vote_type === 'for').length : 0;
            const votesAgainst = vote.votes ? vote.votes.filter(v => v.vote_type === 'against').length : 0;
            
            return {
                id: vote.id,
                title: vote.artwork?.title || 'Untitled',
                description: vote.artwork?.description || '',
                imageUrl: vote.artwork?.image_ipfs_uri || '',
                status: vote.status,
                startAt: vote.start_at,
                endAt: vote.end_at,
                votesFor,
                votesAgainst,
                totalVotes: votesFor + votesAgainst,
                nftMinted: vote.nft_minted,
                nftTokenId: vote.nft_token_id
            }
        });

        res.json({ votes: formattedVotes });
    } catch (error) {
        console.error('투표 목록 조회 실패:', error);
        console.error('에러 스택:', error.stack);
        res.status(500).json({ error: "투표 불러오기 실패", details: error.message });
    }
});

// 투표 상세정보 불러오기
router.get('/:id', async (req, res) => {
    try {
        const voteId = req.params.id;

        const vote = await db.Proposal.findByPk(voteId, {
            include: [
                {
                    model: db.Artwork,
                    as: 'artwork',
                    attributes: ['title', 'description', 'image_ipfs_uri'],
                    required: false
                },
                {
                    model: db.Vote,
                    as: 'votes',
                    attributes: ['vote_type', 'voter_user_id_fk'],
                    required: false
                }
            ]
        });

        if (!vote) {
            return res.status(404).json({ error: "투표를 찾을 수 없습니다." });
        }

        const votesFor = vote.votes ? vote.votes.filter(v => v.vote_type === 'for').length : 0;
        const votesAgainst = vote.votes ? vote.votes.filter(v => v.vote_type === 'against').length : 0;

        // 사용자의 투표 확인
        let userVote = null;
        const { user: currentUser, userId, loginType, error } = await getCurrentUser(req);
        
        if (!error && userId) {
            const userVoteRecord = vote.votes ? vote.votes.find(v => v.voter_user_id_fk === userId) : null;
            userVote = userVoteRecord ? userVoteRecord.vote_type : null;
        }

        const formattedVote = {
            id: vote.id,
            title: vote.artwork?.title || 'Untitled',
            description: vote.artwork?.description || '',
            imageUrl: vote.artwork?.image_ipfs_uri || '',
            status: vote.status,
            startAt: vote.start_at,
            endAt: vote.end_at,
            votesFor,
            votesAgainst,
            totalVotes: votesFor + votesAgainst,
            minVotes: vote.min_votes,
            userVote: userVote,
            nftMinted: vote.nft_minted,
            nftTokenId: vote.nft_token_id,
            nftTransactionHash: vote.nft_transaction_hash,
            mintedAt: vote.minted_at
        };

        res.json({ vote: formattedVote });
    } catch (error) {
        console.error('투표 상세 조회 실패:', error);
        console.error('에러 스택:', error.stack);
        res.status(500).json({ error: "투표를 불러오는데 실패했습니다.", details: error.message });
    }
});

// 투표 제출
router.post('/:id/vote', isAuthenticated, async (req, res) => {
    try {
        // 사용자 정보 가져오기
        const { user: currentUser, userId, loginType, error } = await getCurrentUser(req);
        
        if (error) return res.status(401).json({ success: false, message: "사용자 정보를 찾을 수 없습니다" });

        const voteId = req.params.id;
        const { voteType } = req.body;
        
        // 투표가 진행중인지 확인
        const proposal = await db.Proposal.findByPk(voteId);
        if (!proposal) return res.status(404).json({ error: "투표를 찾을 수 없습니다" });
    
        if (proposal.status !== 'active') return res.status(400).json({ error: "투표가 진행중이지 않습니다" });
    
        // 투표했는지 확인
        const existingVote = await db.Vote.findOne({
            where: {
                proposal_id_fk: voteId,
                voter_user_id_fk: userId
            }
        });
    
        if (existingVote) return res.status(400).json({ error: "이미 투표되었습니다." });
    
        // 투표 생성
        await db.Vote.create({
            proposal_id_fk: voteId,
            voter_user_id_fk: userId,
            vote_type: voteType,
            vote_weight: 1 
        });

        // 투표 임계점 체크 (민팅 준비 상태 확인)
        setImmediate(async () => {
            try {
                const result = await checkVoteThreshold(voteId);
                if (result.success && result.mintingReady) {
                    console.log(`Proposal ${voteId} is ready for minting!`);
                }
            } catch (error) {
                console.error(error);
            }
        });
        res.json({ message: "투표 제출이 완료되었습니다." });
        
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "투표 제출에 실패했습니다." });
    }
});

// 민팅 상태 조회
router.get('/:id/minting-status', async (req, res) => {
    try {
        const proposalId = req.params.id;
        const status = await getMintingStatus(proposalId);
        res.json({ status });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "민팅 상태 조회에 실패했습니다." });
    }
});



// NFT 민팅 실행
router.post('/:id/mint', isAuthenticated, async (req, res) => {
    try {
        const { id: proposalId } = req.params;
        const { password } = req.body;
        const currentUser = await getCurrentUser(req);

        if (!password) return res.status(400).json({ error: "비밀번호를 입력해주세요."});

        // 제안 정보 조회
        const proposal = await db.Proposal.findByPk(proposalId, {
            include: [{ model: db.User, as: 'author' }]
        });

        if (!proposal) return res.status(404).json({ error: "해당 제안을 찾을 수 없습니다."});

        // 작가 권한 확인
        if (proposal.author.id !== currentUser.id) {
            return res.status(403).json({ error: "작품 작가만 민팅을 실행할 수 있습니다."});
        }

        // 이미 민팅되었는지 확인
        if (proposal.nft_minted) {
            return res.status(400).json({ error: "이미 민팅된 작품입니다."});
        }

        // Google 사용자 비밀번호 검증
        if (currentUser.login_type === 'google') {
            if (!currentUser.password_hash) {
                return res.status(400).json({ error: "지갑이 생성되지 않았습니다. 먼저 지갑을 생성해주세요."});
            }

            const isPasswordValid = await verifyPassword(password, currentUser.password_hash);
            if (!isPasswordValid) {
                return res.status(401).json({ error: "비밀번호가 일치하지 않습니다." });
            }
        }

        // 투표 임계점 재확인
        const thresholdResult = await checkVoteThreshold(proposalId);
        if (!thresholdResult.success || !thresholdResult.mintingReady) {
            return res.status(400).json({ error: "아직 민팅 조건이 충족되지 않았습니다." });
        }

        // 작가 지갑 주소 결정
        let artistAddress = thresholdResult.artistAddress;

        // Google 사용자의 경우 EOA 기반 트랜잭션 지갑 생성
        let transactionWallet = null;
        if (currentUser.login_type === 'google') {
            const seedString = `aixellab_${currentUser.google_id}_${password}`;
            const seed = ethers.keccak256(ethers.toUtf8Bytes(seedString));
            transactionWallet = new ethers.Wallet(seed);
            
            // Smart Account 주소 사용
            artistAddress = thresholdResult.artistAddress;
        }

        // 민팅 실행
        const mintResult = await contractManager.mintApprovedArtwork(
            artistAddress,
            proposalId,
            proposal.artwork_url,
            thresholdResult.voteCount,
            transactionWallet 
        );

        if (!mintResult.success) {
            return res.status(500).json({ error: "민팅 실행에 실패했습니다." });
        }

        // DB 업데이트
        await proposal.update({
            nft_minted: true,
            nft_token_id: mintResult.tokenId,
            nft_transaction_hash: mintResult.transactionHash,
            minted_at: new Date(),
            artist_wallet_address: artistAddress
        });

        res.json({
            success: true,
            message: "NFT 민팅이 성공적으로 완료되었습니다!",
            tokenId: mintResult.tokenId,
            transactionHash: mintResult.transactionHash,
            artistAddress: artistAddress,
            voteCount: thresholdResult.voteCount
        });

    } catch (error) {
        console.error('민팅 실행 실패:', error);
        res.status(500).json({ error: "민팅 실행 중 오류가 발생했습니다." });
    }
});

module.exports = router; 