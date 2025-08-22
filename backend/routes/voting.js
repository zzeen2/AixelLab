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
        const currentUser = await getCurrentUser(req);
        
        const proposal = await db.Proposal.findByPk(req.params.id, {
            include: [
                {
                    model: db.Artwork,
                    as: 'artwork',
                    include: [
                        {
                            model: db.User,
                            as: 'User'
                        }
                    ]
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

        // 현재 사용자의 투표 상태 확인
        let userVote = null;
        if (currentUser) {
            console.log('Checking vote for user:', currentUser.userId, 'proposal:', req.params.id);
            const userVoteRecord = await db.Vote.findOne({
                where: {
                    proposal_id_fk: req.params.id,
                    voter_user_id_fk: currentUser.userId
                }
            });
            console.log('User vote record:', userVoteRecord);
            if (userVoteRecord) {
                userVote = userVoteRecord.vote_type;
                console.log('User vote type:', userVote);
            }
        }

        // 응답에 사용자 투표 상태 추가
        const response = proposal.toJSON();
        response.userVote = userVote;
        console.log('Final response userVote:', response.userVote);

        res.json(response);
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

        // 사용자 타입 결정
        const userType = currentUser.loginType === 'google' ? 'google' : 'metamask';

        // 구글 사용자: 비밀번호 기반 월렛 생성하여 서버 서명에 사용
        let signerOrSignature = null;
        if (userType === 'google') {
            if (!password) {
                return res.status(400).json({ error: '구글 로그인 사용자는 비밀번호가 필요합니다.' });
            }
            const { createPasswordBasedWallet } = require('../utils/walletGenerator');
            // provider는 서명에는 필수가 아니지만, 일관성을 위해 서버 provider를 사용하지 않고 로컬 월렛 사용
            signerOrSignature = createPasswordBasedWallet(currentUser.user.google_id, password);
        } else {
            // 메타마스크 사용자: 클라이언트에서 전달한 서명 사용
            signerOrSignature = req.body.signature || null;
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
            signerOrSignature,
            userType
        );

        if (!mintResult.success) {
            return res.status(500).json({ error: `민팅 실패: ${mintResult.error}` });
        }

        // 작품 상태 업데이트
        if (proposal.artwork) {
            await proposal.artwork.update({
                status: 'minted',
                token_id: mintResult.tokenId || null
            });
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

// 메타마스크 사용자를 위한 UserOperation 서명 API
router.post('/:id/sign-userop', async (req, res) => {
    try {
        const currentUser = await getCurrentUser(req);
        if (!currentUser) {
            return res.status(401).json({ error: 'Authentication required' });
        }

        const proposalId = req.params.id;
        const { signature } = req.body;

        if (!signature) {
            return res.status(400).json({ error: '서명이 필요합니다.' });
        }

        // 제안서 조회
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
            return res.status(403).json({ error: "작품 작가만 서명할 수 있습니다." });
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

        // tokenURI 설정
        const tokenURI = proposal.artwork?.metadata_ipfs_uri || proposal.artwork_url || `ipfs://QmDefaultTokenURI_${proposalId}`;

        // 민팅 실행 (메타마스크 사용자)
        const mintResult = await contractManager.mintApprovedArtwork(
            artistAddress,
            proposalId,
            tokenURI,
            thresholdResult.voteCount,
            signature,
            'metamask'
        );

        if (!mintResult.success) {
            return res.status(500).json({ error: `민팅 실패: ${mintResult.error}` });
        }

        // 작품 상태 업데이트
        if (proposal.artwork) {
            await proposal.artwork.update({
                status: 'minted',
                token_id: mintResult.tokenId || null
            });
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
        console.error('Error executing minting with signature:', error);
        res.status(500).json({ error: '민팅 실행 중 오류가 발생했습니다.' });
    }
});

// UserOperation Hash 생성 API
router.post('/:id/userop-hash', async (req, res) => {
    try {
        const currentUser = await getCurrentUser(req);
        if (!currentUser) {
            return res.status(401).json({ error: 'Authentication required' });
        }

        const proposalId = req.params.id;
        const { userOp } = req.body;

        if (!userOp) {
            return res.status(400).json({ error: 'UserOperation이 필요합니다.' });
        }

        // 제안서 조회
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
            return res.status(403).json({ error: "작품 작가만 접근할 수 있습니다." });
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

        // UserOperation Hash 생성
        const contractManager = require('../utils/contractManager');
        const userOpHash = await contractManager.getUserOpHash(userOp);

        res.json({
            success: true,
            userOpHash: userOpHash
        });

    } catch (error) {
        console.error('Error generating UserOperation hash:', error);
        res.status(500).json({ error: 'UserOperation Hash 생성 중 오류가 발생했습니다.' });
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