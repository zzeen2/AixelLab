const express = require('express');
const axios = require('axios');
const router = express.Router();

// 이미지 프록시
router.get('', async (req, res) => {
    const { url } = req.query;
    console.log("url : ", url);
    
    if (!url) {
        return res.json({ state: 500, message: "이미지가 없습니다." });
    }

    try {
        const response = await axios.get(url, {
            responseType: 'arraybuffer' // arraybuffer : 이미지 데이터를 binary형태로 
        });
        
        const contentType = response.headers['content-type'];
        res.set('Content-Type', contentType || 'image/png');
        res.send(response.data);
    } catch (error) {
        console.log("이미지 에러");
        console.log(error);
        res.status(500).json({ error: "이미지 프록시 실패" });
    }
});

module.exports = router; 