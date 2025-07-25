const express = require('express');
const axios = require('axios');
const FormData = require('form-data');
const router = express.Router();
const db = require('../models');
const { isAuthenticated } = require('../middleware/auth');

const PINATA_JWT = process.env.PINATA_JWT;

// 작품 제출
router.post('/submit', async (req, res) => {
    // 세션 디버깅
    console.log('세션:', req.session);
    console.log('인증 상태:', req.isAuthenticated());
    console.log('사용자:', req.user);
    console.log('쿠키:', req.headers.cookie);
    
    // 로그인 체크
    if (!req.isAuthenticated()) {
        return res.status(401).json({ error: "로그인이 필요합니다" });
    }
    
    const { title, description, imageData } = req.body;
    if (!title || !imageData) {
        return res.status(400).json({ error: "작품 제목과 이미지를 확인해주세요." });
    }

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
            description: description || "No description",
            image: ipfsUri
        };
        
        const metadataResponse = await axios.post(
            'https://api.pinata.cloud/pinning/pinJSONToIPFS',
            metadata,
            { headers: { Authorization: `Bearer ${PINATA_JWT}` } }
        );
        
        const metadataIpfsUri = `https://gateway.pinata.cloud/ipfs/${metadataResponse.data.IpfsHash}`;
        
        // db 저장
        const artwork = await db.Artwork.create({
            google_id_fk: req.user.id,
            title,
            description,
            image_ipfs_uri: ipfsUri,
            metadata_ipfs_uri: metadataIpfsUri,
            status: 'pending'
        });

        // 투표권
        const user = await db.User.findOne({ where: { google_id: req.user.id } });
        if (!user.is_eligible_voter) {
            await db.User.update(
                { is_eligible_voter: true, vote_weight: 1 },
                { where: { google_id: req.user.id } }
            );
        }
        
        res.json({ success: true, artwork: { id: artwork.id, title, imageIpfsUri: ipfsUri } });
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: "작품제출 실패" });
    }
});

// 사용자 작품 목록 조회
router.get('/user/artworks', isAuthenticated, async (req, res) => {
    try {
        const artworks = await db.Artwork.findAll({
            where: { google_id_fk: req.user.id },
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
        const user = await db.User.findOne({ where: { google_id: req.user.id } });
        if (!user) {
            return res.status(404).json({ success: false, message: '사용자를 찾을 수 없습니다' });
        }
        
        const artworkCount = await db.Artwork.count({
            where: { google_id_fk: req.user.id }
        });
        
        const approvedCount = await db.Artwork.count({
            where: { google_id_fk: req.user.id, status: 'approved' }
        });
        
        return res.json({
            success: true,
            stats: {
                vote_weight: user.vote_weight,
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