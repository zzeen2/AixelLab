const express = require('express');
const axios = require('axios');
const FormData = require('form-data');
const router = express.Router();
const db = require('../models');
const { isAuthenticated } = require('../middleware/auth');
const { getCurrentUser } = require('../utils/auth');

const PINATA_JWT = process.env.PINATA_JWT;

// 작품 목록 조회
router.get('/', async (req, res) => {
    try {
        const artworks = await db.Artwork.findAll({
            include: [
                {
                    model: db.User,
                    as: 'User',
                    attributes: ['id', 'display_name', 'email']
                },
                {
                    model: db.Proposal,
                    as: 'Proposal',
                    include: [
                        {
                            model: db.Vote,
                            as: 'votes'
                        }
                    ]
                }
            ],
            order: [['createdAt', 'DESC']]
        });

        const artworksWithVoteCount = artworks.map(artwork => {
            const proposal = artwork.Proposal;
            const votesFor = proposal?.votes?.filter(v => v.vote_type === 'for').length || 0;
            const votesAgainst = proposal?.votes?.filter(v => v.vote_type === 'against').length || 0;
            
            return {
                id: artwork.id,
                title: artwork.title,
                description: artwork.description,
                image_url: artwork.image_ipfs_uri,
                metadata_uri: artwork.metadata_ipfs_uri,
                status: artwork.status,
                created_at: artwork.createdAt,
                user: artwork.User,
                proposal: proposal ? {
                    id: proposal.id,
                    status: proposal.status,
                    votes_for: votesFor,
                    votes_against: votesAgainst,
                    total_votes: votesFor + votesAgainst,
                    end_at: proposal.end_at
                } : null
            };
        });

        res.json({
            success: true,
            artworks: artworksWithVoteCount
        });
    } catch (error) {
        console.error('작품 목록 조회 실패:', error);
        res.status(500).json({ success: false, message: "작품 목록을 가져오는데 실패했습니다." });
    }
});

// 민팅된 NFT 목록 조회
router.get('/minted', async (req, res) => {
    try {
        console.log('민팅된 NFT 조회 시작');
        
        const mintedArtworks = await db.Artwork.findAll({
            where: {
                status: 'minted'
            },
            include: [
                {
                    model: db.User,
                    as: 'User',
                    attributes: ['id', 'display_name', 'email']
                }
            ],
            order: [['updatedAt', 'DESC']]
        });
        
        console.log('조회된 민팅된 작품 수:', mintedArtworks.length);
        console.log('작품 목록:', mintedArtworks.map(a => ({ id: a.id, title: a.title, status: a.status })));

        // Proposal 정보를 별도로 조회
        const mintedNFTs = await Promise.all(mintedArtworks.map(async (artwork) => {
            let proposal = null;
            if (artwork.proposal_id) {
                proposal = await db.Proposal.findByPk(artwork.proposal_id);
            }
            
            return {
                id: artwork.id,
                title: artwork.title,
                description: artwork.description,
                image_url: artwork.image_ipfs_uri,
                metadata_uri: artwork.metadata_ipfs_uri,
                status: artwork.status,
                token_id: artwork.token_id,
                created_at: artwork.createdAt,
                minted_at: proposal?.minted_at,
                transaction_hash: proposal?.nft_transaction_hash,
                artist_address: proposal?.artist_wallet_address,
                user: artwork.User
            };
        }));

        console.log('최종 결과:', mintedNFTs);
        
        res.json({
            success: true,
            minted_nfts: mintedNFTs
        });
    } catch (error) {
        console.error('민팅된 NFT 목록 조회 실패:', error);
        res.status(500).json({ success: false, message: "민팅된 NFT 목록을 가져오는데 실패했습니다." });
    }
});

// 작품 상세 조회
router.get('/:id', async (req, res) => {
    try {
        const artwork = await db.Artwork.findByPk(req.params.id, {
            include: [
                {
                    model: db.User,
                    as: 'User',
                    attributes: ['id', 'display_name', 'email', 'wallet_address']
                },
                {
                    model: db.Proposal,
                    as: 'Proposal',
                    include: [
                        {
                            model: db.Vote,
                            as: 'votes'
                        }
                    ]
                }
            ]
        });

        if (!artwork) {
            return res.status(404).json({ success: false, message: "작품을 찾을 수 없습니다." });
        }

        const proposal = artwork.Proposal;
        const votesFor = proposal?.votes?.filter(v => v.vote_type === 'for').length || 0;
        const votesAgainst = proposal?.votes?.filter(v => v.vote_type === 'against').length || 0;

        res.json({
            success: true,
            artwork: {
                id: artwork.id,
                title: artwork.title,
                description: artwork.description,
                image_url: artwork.image_ipfs_uri,
                metadata_uri: artwork.metadata_ipfs_uri,
                status: artwork.status,
                created_at: artwork.createdAt,
                user: artwork.User,
                proposal: proposal ? {
                    id: proposal.id,
                    status: proposal.status,
                    votes_for: votesFor,
                    votes_against: votesAgainst,
                    total_votes: votesFor + votesAgainst,
                    end_at: proposal.end_at
                } : null
            }
        });
    } catch (error) {
        console.error('작품 상세 조회 실패:', error);
        res.status(500).json({ success: false, message: "작품 정보를 가져오는데 실패했습니다." });
    }
});

// 작품 제출
router.post('/submit', isAuthenticated, async (req, res) => {
    console.log('=== 작품 제출 요청 시작 ===');
    console.log('req.isAuthenticated():', req.isAuthenticated ? req.isAuthenticated() : 'undefined');
    console.log('req.user:', req.user);
    console.log('req.session.user:', req.session?.user);
    console.log('req.sessionID:', req.sessionID);
    console.log('req.session:', req.session);
    
    try {
        // 사용자 정보 가져오기 (Google OAuth 또는 MetaMask)
        const { user: currentUser, userId, loginType, error } = await getCurrentUser(req);
        
        console.log('getCurrentUser 결과:');
        console.log('- user:', currentUser);
        console.log('- userId:', userId);
        console.log('- loginType:', loginType);
        console.log('- error:', error);
        
        if (error) {
            console.log('인증 실패:', error);
            return res.status(401).json({ success: false, message: "사용자 정보를 찾을 수 없습니다" });
        }
        
        const { title, description, imageData } = req.body;
        // 선택적 초기 가격
        let { price } = req.body;
 
        if (!title || !imageData) return res.status(400).json({ error: "작품 제목과 이미지를 확인해주세요." });
 
        console.log('작품 정보:', { title, description, imageDataLength: imageData?.length });
        if (price != null && price !== '') {
            // 가격 검증: 0보다 크고 소수점 6자리 이내
            const priceStr = String(price);
            const valid = /^([0-9]+)(\.[0-9]{1,6})?$/.test(priceStr) && parseFloat(priceStr) > 0;
            if (!valid) {
                return res.status(400).json({ success: false, message: '가격은 0보다 크고 소수점 6자리 이내여야 합니다.' });
            }
        } else {
            price = null;
        }
        
        // pinata에 이미지 업로드
        const base64Data = imageData.replace(/^data:image\/\w+;base64,/, '');
        const buffer = Buffer.from(base64Data, 'base64');
        const formData = new FormData();
        formData.append('file', buffer, {
            filename: `aixel-${Date.now()}.png`,
            contentType: 'image/png',
        });
        
        console.log('PINATA 이미지 업로드 시작...');
        console.log('PINATA_JWT 존재:', !!PINATA_JWT);
        
        let ipfsUri;
        
        try {
            const response = await axios.post("https://api.pinata.cloud/pinning/pinFileToIPFS", formData, {
                headers: {
                    'Authorization': `Bearer ${PINATA_JWT}`,
                    ...formData.getHeaders()
                }
            });
            
            console.log('PINATA 이미지 업로드 성공:', response.data.IpfsHash);
            
            const ipfsHash = response.data.IpfsHash;
            ipfsUri = `https://gateway.pinata.cloud/ipfs/${ipfsHash}`;
        } catch (pinataError) {
            console.error('PINATA 이미지 업로드 실패:');
            console.error('Status:', pinataError.response?.status);
            console.error('Data:', pinataError.response?.data);
            console.error('Headers:', pinataError.response?.headers);
            throw pinataError;
        }
        
        // 메타데이터 업로드
        const metadata = {
            name: title,
            description,
            image: ipfsUri,
            attributes: price ? [{ trait_type: 'initial_price_axc', value: String(price) }] : []
        };
        
        console.log('PINATA 메타데이터 업로드 시작...');
        
        try {
            const metadataResponse = await axios.post(
                'https://api.pinata.cloud/pinning/pinJSONToIPFS',
                metadata,
                { headers: { Authorization: `Bearer ${PINATA_JWT}` } }
            );
            
            console.log('PINATA 메타데이터 업로드 성공:', metadataResponse.data.IpfsHash);
            
            const metadataIpfsUri = `https://gateway.pinata.cloud/ipfs/${metadataResponse.data.IpfsHash}`;
            
            // db 저장
            const artwork = await db.Artwork.create({
                user_id_fk: userId,
                title,
                description,
                image_ipfs_uri: ipfsUri,
                metadata_ipfs_uri: metadataIpfsUri,
                status: 'pending'
            });

            console.log('작품 DB 저장 완료:', artwork.id);
            
            // Proposal 생성
            const proposal = await db.Proposal.create({
                artwork_id_fk: artwork.id,
                created_by: userId,
                start_at: new Date(),
                end_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7일 후 종료
                min_votes: 10,
                status: 'active',
                initial_price_units: price ? BigInt(Math.round(parseFloat(price) * 1e6)) : null
            });

            console.log('Proposal 생성 완료:', proposal.id);
            
            // Artwork에 proposal_id 업데이트
            await artwork.update({
                proposal_id: proposal.id
            });
            
            // 투표 임계값 확인 및 민팅 준비
            const { checkVoteThreshold } = require('../services/mintingService');
            const thresholdResult = await checkVoteThreshold(proposal.id);
            
            console.log('민팅 조건 확인:', thresholdResult);
            
            res.json({
                success: true,
                artwork: {
                    id: artwork.id,
                    title: artwork.title,
                    description: artwork.description,
                    image_url: artwork.image_ipfs_uri,
                    metadata_uri: artwork.metadata_ipfs_uri
                },
                proposal: {
                    id: proposal.id,
                    status: proposal.status,
                    end_at: proposal.end_at,
                    ready_for_minting: thresholdResult.readyForMinting,
                    vote_count: thresholdResult.voteCount,
                    threshold: thresholdResult.threshold,
                    initial_price_axc: price || null
                }
            });
            
        } catch (metadataError) {
            console.error('PINATA 메타데이터 업로드 실패:');
            console.error('Status:', metadataError.response?.status);
            console.error('Data:', metadataError.response?.data);
            throw metadataError;
        }
        
    } catch (error) {
        console.error('작품 제출 실패:', error);
        res.status(500).json({ success: false, message: "작품 제출 중 오류가 발생했습니다." });
    }
});

// 민팅 실행
router.post('/:id/mint', isAuthenticated, async (req, res) => {
    try {
        const { user: currentUser, userId, loginType, error } = await getCurrentUser(req);
        
        if (error) {
            return res.status(401).json({ success: false, message: "사용자 정보를 찾을 수 없습니다" });
        }

        const artworkId = req.params.id;
        const { password } = req.body;

        // 작품 조회
        const artwork = await db.Artwork.findByPk(artworkId, {
            include: [
                {
                    model: db.User,
                    as: 'User'
                },
                {
                    model: db.Proposal,
                    as: 'Proposal',
                    include: [
                        {
                            model: db.Vote,
                            as: 'votes'
                        }
                    ]
                }
            ]
        });

        if (!artwork) {
            return res.status(404).json({ success: false, message: "작품을 찾을 수 없습니다." });
        }

        // 작가 권한 확인
        if (artwork.user_id_fk !== userId) {
            return res.status(403).json({ success: false, message: "작품 작가만 민팅을 실행할 수 있습니다." });
        }

        const proposal = artwork.Proposal;
        if (!proposal) {
            return res.status(404).json({ success: false, message: "제안서를 찾을 수 없습니다." });
        }

        // 투표 임계값 확인
        const { checkVoteThreshold } = require('../services/mintingService');
        const thresholdResult = await checkVoteThreshold(proposal.id);
        
        if (!thresholdResult.readyForMinting) {
            return res.status(400).json({ 
                success: false, 
                message: "민팅 조건이 충족되지 않았습니다.",
                vote_count: thresholdResult.voteCount,
                threshold: thresholdResult.threshold
            });
        }

        // 작가 지갑 주소 가져오기
        const { getArtistWalletAddress } = require('../services/mintingService');
        const artistAddress = await getArtistWalletAddress(currentUser);
        
        if (!artistAddress) {
            return res.status(400).json({ success: false, message: "작가 지갑 주소를 찾을 수 없습니다." });
        }

        // 트랜잭션 지갑 생성 (Google 사용자인 경우)
        let transactionWallet = null;
        if (loginType === 'google' && password) {
            const { createPasswordBasedEOA } = require('../utils/walletGenerator');
            transactionWallet = createPasswordBasedEOA(currentUser.google_id, password);
        }

        // tokenURI 설정
        const tokenURI = artwork.metadata_ipfs_uri || `ipfs://QmDefaultTokenURI_${artworkId}`;

        // 사용자 타입 결정
        const userType = loginType === 'google' ? 'google' : 'metamask';
        
        // 메타마스크 사용자의 경우 서명된 signature를 받음
        let signature = null;
        if (userType === 'metamask' && req.body.signature) {
            signature = req.body.signature;
        }
        
        // 민팅 실행
        const contractManager = require('../utils/contractManager');
        const mintResult = await contractManager.mintApprovedArtwork(
            artistAddress,
            proposal.id,
            tokenURI,
            thresholdResult.voteCount,
            signature, // 메타마스크 사용자의 경우 서명된 signature
            userType
        );

        if (!mintResult.success) {
            return res.status(500).json({ 
                success: false, 
                message: `민팅 실패: ${mintResult.error}` 
            });
        }

        // 작품 상태 업데이트
        await artwork.update({
            status: 'minted',
            token_id: mintResult.tokenId || null
        });

        // 제안서 업데이트
        await proposal.update({
            nft_minted: true,
            nft_token_id: mintResult.tokenId || null,
            nft_transaction_hash: mintResult.transactionHash,
            minted_at: new Date(),
            artist_wallet_address: artistAddress
        });

        console.log('민팅 완료:', {
            artworkId: artwork.id,
            tokenId: mintResult.tokenId,
            transactionHash: mintResult.transactionHash
        });

        res.json({
            success: true,
            message: 'NFT 민팅이 완료되었습니다.',
            artwork: {
                id: artwork.id,
                title: artwork.title,
                status: artwork.status,
                token_id: artwork.token_id
            },
            nft: {
                token_id: mintResult.tokenId,
                transaction_hash: mintResult.transactionHash,
                artist_address: artistAddress
            }
        });

    } catch (error) {
        console.error('민팅 실행 실패:', error);
        res.status(500).json({ success: false, message: "민팅 실행 중 오류가 발생했습니다." });
    }
});

// 민팅 조건 자동 체크
router.get('/:id/mint-status', async (req, res) => {
    try {
        const artworkId = req.params.id;

        // 작품 조회
        const artwork = await db.Artwork.findByPk(artworkId, {
            include: [
                {
                    model: db.Proposal,
                    as: 'Proposal',
                    include: [
                        {
                            model: db.Vote,
                            as: 'votes'
                        }
                    ]
                }
            ]
        });

        if (!artwork) {
            return res.status(404).json({ success: false, message: "작품을 찾을 수 없습니다." });
        }

        const proposal = artwork.Proposal;
        if (!proposal) {
            return res.status(404).json({ success: false, message: "제안서를 찾을 수 없습니다." });
        }

        // 투표 임계값 확인
        const { checkVoteThreshold } = require('../services/mintingService');
        const thresholdResult = await checkVoteThreshold(proposal.id);

        const votesFor = proposal.votes ? proposal.votes.filter(v => v.vote_type === 'for').length : 0;
        const votesAgainst = proposal.votes ? proposal.votes.filter(v => v.vote_type === 'against').length : 0;

        res.json({
            success: true,
            artwork: {
                id: artwork.id,
                title: artwork.title,
                status: artwork.status,
                token_id: artwork.token_id
            },
            proposal: {
                id: proposal.id,
                status: proposal.status,
                votes_for: votesFor,
                votes_against: votesAgainst,
                total_votes: votesFor + votesAgainst,
                threshold: thresholdResult.threshold,
                ready_for_minting: thresholdResult.readyForMinting,
                end_at: proposal.end_at
            },
            minting_status: {
                ready: thresholdResult.readyForMinting,
                vote_count: thresholdResult.voteCount,
                threshold: thresholdResult.threshold,
                remaining_votes: Math.max(0, thresholdResult.threshold - thresholdResult.voteCount)
            }
        });

    } catch (error) {
        console.error('민팅 상태 확인 실패:', error);
        res.status(500).json({ success: false, message: "민팅 상태 확인 중 오류가 발생했습니다." });
    }
});

// 사용자 작품 목록 조회
router.get('/user/artworks', isAuthenticated, async (req, res) => {
    try {
        // 사용자 정보 가져오기
        const { user: currentUser, userId, loginType, error } = await getCurrentUser(req);
        
        if (error) return res.status(401).json({ success: false, message: "사용자 정보를 찾을 수 없습니다" });
        
        const artworks = await db.Artwork.findAll({
            where: { user_id_fk: userId },
            include: [
                {
                    model: db.Proposal,
                    as: 'Proposal',
                    include: [
                        {
                            model: db.Vote,
                            as: 'votes'
                        }
                    ]
                }
            ],
            order: [['createdAt', 'DESC']]
        });

        const artworksWithVoteCount = artworks.map(artwork => {
            const proposal = artwork.Proposal;
            const votesFor = proposal?.votes?.filter(v => v.vote_type === 'for').length || 0;
            const votesAgainst = proposal?.votes?.filter(v => v.vote_type === 'against').length || 0;
            
            return {
                id: artwork.id,
                title: artwork.title,
                description: artwork.description,
                image_ipfs_uri: artwork.image_ipfs_uri,
                metadata_ipfs_uri: artwork.metadata_ipfs_uri,
                status: artwork.status,
                token_id: artwork.token_id,
                created_at: artwork.createdAt,
                proposal: proposal ? {
                    id: proposal.id,
                    status: proposal.status,
                    votes_for: votesFor,
                    votes_against: votesAgainst,
                    total_votes: votesFor + votesAgainst,
                    threshold: proposal.min_votes,
                    end_at: proposal.end_at,
                    nft_minted: proposal.nft_minted
                } : null
            };
        });
        
        return res.json({ success: true, artworks: artworksWithVoteCount });
    } catch (error) {
        console.error('작품 조회 실패:', error);
        return res.status(500).json({ success: false, message: '작품 조회 실패' });
    }
});

// 사용자 통계 조회
router.get('/user/stats', isAuthenticated, async (req, res) => {
    try {
        // 사용자 정보 가져오기
        const { user: currentUser, userId, loginType, error } = await getCurrentUser(req);
        
        if (error) {
            return res.status(401).json({ success: false, message: "사용자 정보를 찾을 수 없습니다" });
        }
        
        const artworkCount = await db.Artwork.count({
            where: { user_id_fk: userId }
        });
        
        const approvedCount = await db.Artwork.count({
            where: { user_id_fk: userId, status: 'approved' }
        });
        
        return res.json({
            success: true,
            stats: {
                vote_weight: currentUser.vote_weight,
                total_artworks: artworkCount,
                approved_artworks: approvedCount
            }
        });
    } catch (error) {
        console.error('통계 조회 실패:', error);
        return res.status(500).json({ success: false, message: '통계 조회 실패' });
    }
});



// NFT 상세 정보 조회
router.get('/nft/:id', async (req, res) => {
    try {
        const artworkId = req.params.id;

        const artwork = await db.Artwork.findByPk(artworkId, {
            include: [
                {
                    model: db.User,
                    as: 'User',
                    attributes: ['id', 'display_name', 'email', 'wallet_address']
                },
                {
                    model: db.Proposal,
                    as: 'Proposal',
                    include: [
                        {
                            model: db.Vote,
                            as: 'votes'
                        }
                    ]
                }
            ]
        });

        if (!artwork) {
            return res.status(404).json({ success: false, message: "NFT를 찾을 수 없습니다." });
        }

        console.log('NFT 상세 조회 - artwork.User:', artwork.User);
        console.log('NFT 상세 조회 - artwork.User.wallet_address:', artwork.User?.wallet_address);

        if (artwork.status !== 'minted') {
            return res.status(400).json({ success: false, message: "이 작품은 아직 NFT로 민팅되지 않았습니다." });
        }

        const proposal = artwork.Proposal;
        const votesFor = proposal?.votes?.filter(v => v.vote_type === 'for').length || 0;
        const votesAgainst = proposal?.votes?.filter(v => v.vote_type === 'against').length || 0;

        // NFT 정보 구성
        const nftInfo = {
            id: artwork.id,
            title: artwork.title,
            description: artwork.description,
            image_url: artwork.image_ipfs_uri,
            metadata_uri: artwork.metadata_ipfs_uri,
            status: artwork.status,
            token_id: artwork.token_id,
            created_at: artwork.createdAt,
            minted_at: proposal?.minted_at,
            transaction_hash: proposal?.nft_transaction_hash,
            artist_address: proposal?.artist_wallet_address,
            artist: artwork.User,
            proposal: proposal ? {
                id: proposal.id,
                status: proposal.status,
                votes_for: votesFor,
                votes_against: votesAgainst,
                total_votes: votesFor + votesAgainst,
                threshold: proposal.min_votes,
                end_at: proposal.end_at,
                nft_minted: proposal.nft_minted
            } : null
        };
        
        console.log('NFT 상세 정보 - artwork:', artwork.toJSON());
        console.log('NFT 상세 정보 - artwork.token_id:', artwork.token_id);
        console.log('NFT 상세 정보 - proposal.nft_token_id:', proposal?.nft_token_id);
        console.log('NFT 상세 정보 - nftInfo.token_id:', nftInfo.token_id);

        res.json({
            success: true,
            nft: nftInfo
        });
    } catch (error) {
        console.error('NFT 상세 정보 조회 실패:', error);
        res.status(500).json({ success: false, message: "NFT 정보를 가져오는데 실패했습니다." });
    }
});

module.exports = router; 