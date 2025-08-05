const express = require('express');
const router = express.Router();
const { getCurrentUser } = require('../utils/auth');
const { checkVoteThreshold } = require('../services/mintingService');
const contractManager = require('../utils/contractManager');
const db = require('../models');

// 투표 목록 조회
router.get('/', async (req, res) => {
    try {
        const proposals = await db.Proposal.findAll({
            include: [
                {
                    model: db.Artwork,
                    as: 'artwork'
                },
                {
                    model: db.Vote,
                    as: 'votes'
                }
            ],
            order: [['createdAt', 'DESC']]
        });
        res.json(proposals);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch proposals' });
    }
});

// 투표 상세 조회
router.get('/:id', async (req, res) => {
    try {
        const proposal = await db.Proposal.findByPk(req.params.id, {
            include: [
                {
                    model: db.Artwork,
                    as: 'artwork'
                },
                {
                    model: db.Vote,
                    as: 'votes'
                }
            ]
        });

        if (!proposal) {
            return res.status(404).json({ error: 'Proposal not found' });
        }

        res.json(proposal);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch proposal' });
    }
});

// 투표하기
router.post('/:id/vote', async (req, res) => {
    try {
        const currentUser = await getCurrentUser(req);
        if (!currentUser) {
            return res.status(401).json({ error: 'Authentication required' });
        }

        const { voteType } = req.body;
        const proposalId = req.params.id;

        if (!['for', 'against'].includes(voteType)) {
            return res.status(400).json({ error: 'Invalid vote type' });
        }

        // 중복 투표 확인
        const existingVote = await db.Vote.findOne({
            where: {
                proposal_id_fk: proposalId,
                voter_user_id_fk: currentUser.userId
            }
        });

        if (existingVote) {
            return res.status(400).json({ error: '이미 투표한 제안입니다.' });
        }

        // 투표 생성
        await db.Vote.create({
            proposal_id_fk: proposalId,
            voter_user_id_fk: currentUser.userId,
            vote_type: voteType
        });

        // 투표 임계값 확인
        const thresholdResult = await checkVoteThreshold(proposalId);
        if (thresholdResult.readyForMinting) {
            console.log("민팅 조건이 충족되었습니다. 자동 민팅을 준비합니다.");
            
            // 작품 상태를 민팅 준비 상태로 변경
            const proposal = await db.Proposal.findByPk(proposalId, {
                include: [
                    {
                        model: db.Artwork,
                        as: 'artwork'
                    }
                ]
            });
            
            if (proposal && proposal.artwork) {
                await proposal.artwork.update({
                    status: 'approved'
                });
                
                console.log(`작품 ${proposal.artwork.id}가 승인 상태로 변경되었습니다.`);
            }
        }

        res.json({ success: true, message: 'Vote recorded successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to record vote' });
    }
});

// 민팅 실행
router.post('/:id/mint', async (req, res) => {
    try {
        const currentUser = await getCurrentUser(req);
        if (!currentUser) {
            return res.status(401).json({ error: 'Authentication required' });
        }

        const proposalId = req.params.id;
        const { password } = req.body;

        // 제안서 조회 (Artwork 포함)
        const proposal = await db.Proposal.findByPk(proposalId, {
            include: [
                {
                    model: db.User,
                    as: 'author'
                },
                {
                    model: db.Artwork,
                    as: 'artwork'
                }
            ]
        });

        if (!proposal) {
            return res.status(404).json({ error: 'Proposal not found' });
        }

        // 작가 권한 확인
        if (proposal.author.id !== currentUser.userId) {
            return res.status(403).json({ error: "작품 작가만 민팅을 실행할 수 있습니다." });
        }

        // 투표 임계값 확인
        const thresholdResult = await checkVoteThreshold(proposalId);
        if (!thresholdResult.readyForMinting) {
            return res.status(400).json({ 
                error: "민팅 조건이 충족되지 않았습니다." 
            });
        }

        // 작가 지갑 주소 가져오기
        const artistAddress = await getArtistWalletAddress(currentUser.user);
        if (!artistAddress) {
            return res.status(400).json({ error: '작가 지갑 주소를 찾을 수 없습니다.' });
        }

        // 트랜잭션 지갑 생성 (Google 사용자경우)
        let transactionWallet = null;
        if (currentUser.loginType === 'google' && password) {
            const { createPasswordBasedEOA } = require('../utils/walletGenerator');
            transactionWallet = createPasswordBasedEOA(currentUser.user.google_id, password);
        }

        // tokenURI 설정 - 실제 IPFS 메타데이터 URI 사용
        const tokenURI = proposal.artwork?.metadata_ipfs_uri || proposal.artwork_url || `ipfs://QmDefaultTokenURI_${proposalId}`;
        console.log('Token URI 설정:', tokenURI);

        // 민팅 실행
        const mintResult = await contractManager.mintApprovedArtwork(
            artistAddress,
            proposalId,
            tokenURI,
            thresholdResult.voteCount,
            transactionWallet
        );

        if (!mintResult.success) {
            return res.status(500).json({ error: `민팅 실패: ${mintResult.error}` });
        }

        // 제안서 업데이트
        await proposal.update({
            nft_minted: true,
            nft_token_id: mintResult.tokenId || null,
            nft_transaction_hash: mintResult.transactionHash,
            minted_at: new Date(),
            artist_wallet_address: artistAddress
        });

        res.json({
            success: true,
            message: 'NFT 민팅이 완료되었습니다.',
            transactionHash: mintResult.transactionHash,
            tokenId: mintResult.tokenId
        });

    } catch (error) {
        console.error('Error executing minting:', error);
        res.status(500).json({ error: '민팅 실행 중 오류가 발생했습니다.' });
    }
});

// 사용자의 민팅 대기 목록 조회
router.get('/user/pending-mints', async (req, res) => {
    try {
        const currentUser = await getCurrentUser(req);
        if (!currentUser) {
            return res.status(401).json({ error: 'Authentication required' });
        }

        console.log('=== Pending Mints 조회 ===');
        console.log('currentUser.userId:', currentUser.userId);

        const pendingMints = await db.Proposal.findAll({
            where: {
                created_by: currentUser.userId,
                nft_minted: false
            },
            include: [
                {
                    model: db.Artwork,
                    as: 'artwork'
                },
                {
                    model: db.Vote,
                    as: 'votes'
                }
            ],
            order: [['createdAt', 'DESC']]
        });

        const mintingReadyProposals = [];
        
        for (const proposal of pendingMints) {
            const voteCount = proposal.votes ? proposal.votes.filter(v => v.vote_type === 'for').length : 0;
            const threshold = 10;
            
            console.log(`Proposal ${proposal.id}: voteCount=${voteCount}, threshold=${threshold}`);
            
            if (voteCount >= threshold) {
                const votesFor = proposal.votes ? proposal.votes.filter(v => v.vote_type === 'for').length : 0;
                const votesAgainst = proposal.votes ? proposal.votes.filter(v => v.vote_type === 'against').length : 0;
                
                mintingReadyProposals.push({
                    id: proposal.id,
                    title: proposal.artwork?.title || 'Untitled',
                    description: proposal.artwork?.description || '',
                    imageUrl: proposal.artwork?.image_ipfs_uri || '',
                    status: proposal.status,
                    votesFor,
                    votesAgainst,
                    totalVotes: votesFor + votesAgainst,
                    threshold,
                    mintingReady: true,
                    createdAt: proposal.createdAt
                });
            }
        }

        res.json({ 
            success: true, 
            pendingMints: mintingReadyProposals,
            count: mintingReadyProposals.length
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch pending mints' });
    }
});

// NFT 확인 API
router.get('/nft/:tokenId', async (req, res) => {
    try {
        const { tokenId } = req.params;
        const result = await contractManager.checkMintedNFT(tokenId);
        
        if (result.success) {
            res.json({
                success: true,
                nft: result
            });
        } else {
            res.status(400).json({
                success: false,
                error: result.error
            });
        }
    } catch (error) {
        console.error('Error checking NFT:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
});

// 작가 지갑 주소 가져오기
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

module.exports = router; 