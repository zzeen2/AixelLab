const express = require("express");
const router = express.Router();
const {isAuthenticated} = require('../middleware/auth')
const db = require("../models");

// 투표 목록 가져오기
router.get('/', async (req,res) => {
    try {
        const votes = await db.Proposal.findAll({
            include : [
                {
                    model : db.Artwork,
                    as : 'artwork',
                    attributes: ["title", 'description', 'image_ipfs_uri']
                },
                {
                    model : db.Vote,
                    as : 'votes',
                    attributes : ['vote_type']
                },
            ],
            order:[['created_at', 'DESC']]
        });
        console.log("votes", votes)
        // 전처리
        const formattedVotes = votes.map(vote => {
            const votesFor = vote.votes.filter(v => v.vote_type === 'for').length;
            const votesAgainst = vote.votes.filter(v => v.vote_type === 'against').length;
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
                totalVotes: votesFor + votesAgainst
            }
        });

        res.json({ votes : formattedVotes});
    } catch (error) {
        console.log(error);
        res.status(500).json({error: "투표 불러오기 실패"})
    }
})

// 투표 상세정보 불러오기
router.get('/:id', async(req,res) => {
    try {
        const voteId = req.params.id;

        const vote = await db.Proposal.findByPk(voteId, {
            include : [
                {
                    model: db.Artwork,
                    as : 'artwork',
                    attributes : ['title', 'description', 'image_ipfs_uri']
                },
                {
                    model : db.Vote,
                    as : 'votes',
                    attributes : ['vote_type', 'voter_google_id_fk']
                }
            ]
        });
        const votesFor = vote.votes.filter(v => v.vote_type === 'for').length;
        const votesAgainst = vote.votes.filter(v => v.vote_type === 'against').length;

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
            minVotes: vote.min_votes
        };
        res.json({ vote: formattedVote })
        if(!vote) { 
            return res.status(400).json({error:"투표를 찾을수 없습니다."})
        }
    } catch (error) {
        console.log(error);
        res.status(500).json({error : "투표를 불러오는데 실패했습니다."})
    }
})

// 투표 제출
router.post('/:id/vote', isAuthenticated, async(req,res) => {
    try {
        const voteId = req.params.id;
        const {voteType} = req.body;
        const userId = req.user.google_id;
    
        // 투표가 진행중인지 확인
        const proposal = await db.Proposal.findByPk(voteId);
        if(!proposal) return res.status(404).json({error : "투표를 찾을 수 없습니다"});
    
        if(!proposal.status !== 'active') return res.status(400).json({error : "투표가 진행중이지 않습니다"});
    
        // 투표했는지 확인
        const extingVote = await db.Vote.findOne({
            where : {
                proposal_id_fk: voteId,
                voter_google_id_fk: userId
            }
        });
    
        if(extingVote) res.status(400).json({error : "이미 투표되었습니다."});
    
        await db.Vote.create({
            proposal_id_fk: voteId,
            voter_google_id_fk: userId,
            vote_type: voteType,
            vote_weight: 1 
        });
        
        res.json({message : "투표 제출이 완료되었습니다."})
        
    } catch (error) {
        console.log(error);
        res.status(500).json({error : "투표 제출에 실패했습니다."})
    }
})