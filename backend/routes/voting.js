const express = require("express");
const router = express.Router();
const { isAuthenticated } = require('../middleware/auth');
const { getCurrentUser } = require('../utils/auth');
const db = require("../models");
const { checkVoteAndMint, getMintingStatus } = require('../services/mintingService');
const contractManager = require('../utils/contractManager');

// 투표 목록 가져오기
router.get('/', async (req, res) => {
    try {
        const votes = await db.Proposal.findAll({
            include: [
                {
                    model: db.Artwork,
                    attributes: ["title", 'description', 'image_ipfs_uri']
                },
                {
                    model: db.Vote,
                    attributes: ['vote_type']
                },
            ],
            order: [['createdAt', 'DESC']]
        });

        // 전처리
        const formattedVotes = votes.map(vote => {
            const votesFor = vote.Votes ? vote.Votes.filter(v => v.vote_type === 'for').length : 0;
            const votesAgainst = vote.Votes ? vote.Votes.filter(v => v.vote_type === 'against').length : 0;
            
            return {
                id: vote.id,
                title: vote.Artwork?.title || 'Untitled',
                description: vote.Artwork?.description || '',
                imageUrl: vote.Artwork?.image_ipfs_uri || '',
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
        console.error(error);
        res.status(500).json({ error: "투표 불러오기 실패" });
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
                    attributes: ['title', 'description', 'image_ipfs_uri']
                },
                {
                    model: db.Vote,
                    attributes: ['vote_type', 'voter_user_id_fk']
                }
            ]
        });

        if (!vote) {
            return res.status(404).json({ error: "투표를 찾을 수 없습니다." });
        }

        const votesFor = vote.Votes ? vote.Votes.filter(v => v.vote_type === 'for').length : 0;
        const votesAgainst = vote.Votes ? vote.Votes.filter(v => v.vote_type === 'against').length : 0;

        // 사용자의 투표 확인
        let userVote = null;
        const { user: currentUser, userId, loginType, error } = await getCurrentUser(req);
        
        if (!error && userId) {
            const userVoteRecord = vote.Votes ? vote.Votes.find(v => v.voter_user_id_fk === userId) : null;
            userVote = userVoteRecord ? userVoteRecord.vote_type : null;
        }

        const formattedVote = {
            id: vote.id,
            title: vote.Artwork?.title || 'Untitled',
            description: vote.Artwork?.description || '',
            imageUrl: vote.Artwork?.image_ipfs_uri || '',
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
        console.error(error);
        res.status(500).json({ error: "투표를 불러오는데 실패했습니다." });
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

        // 자동 민팅 체크 
        setImmediate(async () => {
            try {
                await checkVoteAndMint(voteId);
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

// 컨트랙트 상태 확인
router.get('/contract-status', async (req, res) => {
    try {
        const status = await contractManager.getNetworkStatus();
        res.json({ status });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "컨트랙트 상태 조회에 실패했습니다." });
    }
});

module.exports = router; 