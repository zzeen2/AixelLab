const express = require('express');
const axios = require('axios');
const FormData = require('form-data');
const router = express.Router();
const db = require('../models');
const { isAuthenticated } = require('../middleware/auth');
const { getCurrentUser } = require('../utils/auth');

const PINATA_JWT = process.env.PINATA_JWT;

// 작품 제출
router.post('/submit', isAuthenticated, async (req, res) => {
    // 사용자 정보 가져오기 (Google OAuth 또는 MetaMask)
    const { user: currentUser, userId, loginType, error } = await getCurrentUser(req);
    
    if (error) return res.status(401).json({ success: false, message: "사용자 정보를 찾을 수 없습니다" });
    
    const { title, description, imageData } = req.body;

    if (!title || !imageData) return res.status(400).json({ error: "작품 제목과 이미지를 확인해주세요." });

    try {
        // pinata에 이미지 업로드
        const base64Data = imageData.replace(/^data:image\/\w+;base64,/, '');
        const buffer = Buffer.from(base64Data, 'base64');
        const formData = new FormData();
        formData.append('file', buffer, {
            filename: `aixel-${Date.now()}.png`,
            contentType: 'image/png',
        });
        
        const response = await axios.post("https://api.pinata.cloud/pinning/pinFileToIPFS", formData, {
            headers: {
                'Authorization': `Bearer ${PINATA_JWT}`,
                ...formData.getHeaders()
            }
        });
        
        const ipfsHash = response.data.IpfsHash;
        const ipfsUri = `https://gateway.pinata.cloud/ipfs/${ipfsHash}`;

        // 메타데이터 업로드
        const metadata = {
            name: title,
            description,
            image: ipfsUri,
            attributes: []
        };
        
        const metadataResponse = await axios.post(
            'https://api.pinata.cloud/pinning/pinJSONToIPFS',
            metadata,
            { headers: { Authorization: `Bearer ${PINATA_JWT}` } }
        );
        
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

        // 투표권 부여
        if (!currentUser.is_eligible_voter) {
            await currentUser.update({
                is_eligible_voter: true,
                vote_weight: 1
            });
        }

        // proposal 생성
        const proposalData = {
            artwork_id_fk: artwork.id,
            created_by: userId, // 변경된 사용자 ID 사용
            start_at: new Date(), 
            end_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), //todo 7일후 종료
            min_votes: 10, 
            status: 'active'
        };

        const proposal = await db.Proposal.create(proposalData);

        return res.status(201).json({
            success: true,
            message: '작품이 성공적으로 등록되었습니다.',
            artwork: {
                id: artwork.id,
                title: artwork.title,
                description: artwork.description,
                image_url: ipfsUri,
                metadata_url: metadataIpfsUri,
                status: artwork.status
            },
            proposal: {
                id: proposal.id,
                status: proposal.status,
                end_at: proposal.end_at
            }
        });

    } catch (error) {
        console.error('작품 제출 실패:', error);
        return res.status(500).json({ success: false, message: '작품 제출 중 오류가 발생했습니다.' });
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
            order: [['createdAt', 'DESC']]
        });
        
        return res.json({ success: true, artworks: artworks });
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

module.exports = router; 