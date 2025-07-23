const express = require("express");
const axios = require('axios');
const app = express();
const cors = require('cors');
const FormData = require('form-data');
require('dotenv').config();

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true })); 

// Pinata API 키 확인
const PINATA_API_KEY = process.env.PINATA_API_KEY;
const PINATA_SECRET_API_KEY = process.env.PINATA_SECRET_API_KEY;
const PINATA_JWT = process.env.PINATA_JWT;

// Pinata 테스트
app.get('/test-pinata', async (req, res) => {
    try {
        console.log('Pinata API 키 확인:', PINATA_API_KEY ? '설정됨' : '설정되지 않음');
        
        if (!PINATA_API_KEY) {
            return res.status(400).json({ 
                error: 'Pinata API 키가 설정되지 않았습니다. .env 파일을 확인해주세요.' 
            });
        }

        // Pinata API 테스트 (사용자 정보 가져오기)
        const response = await axios.get('https://api.pinata.cloud/data/testAuthentication', {
            headers: {
                'Authorization': `Bearer ${PINATA_JWT}`
            }
        });

        console.log('Pinata 연결 성공:', response.data);
        res.json({ 
            success: true, 
            message: 'Pinata 연결 성공!',
            data: response.data 
        });
    } catch (error) {
        console.error('Pinata 연결 실패:', error.response?.data || error.message);
        res.status(500).json({ 
            error: 'Pinata 연결 실패', 
            details: error.response?.data || error.message 
        });
    }
});

// react에서 요청보내면 url 받아서 proxy 전달
app.get('/proxy-image', async(req,res) => {
    const {url} = req.query;
    console.log("url : ", url)
    if(!url) return res.json({state : 500, message : "이미지가 없습니다."})

    try {
        const response = await axios.get(url, {
            responseType : 'arraybuffer' // arraybuffer : 이미지 데이터를 binary형태로 
        });
        //console.log("response:", response)
        const contentType = response.headers['content-type'];
        res.set('Content-Type', contentType ||'image/png');
        res.send(response.data);
    } catch (error) {
        console.log("이미지 에러")
        console.log(error)
        // console.log("status", error.response.status);
        // console.log("deaders:", error.response.headers);
        // console.log("data:", error.response.data);
    }
})

// 이미지 업로드
app.post('/upload-to-ipfs', async(req,res) => {
    try {
        const {imageData} = req.body; // base64이미지 데이터
        console.log("이미지 데이터: ", imageData)
        if(!imageData) {
            return res.status(400).json({ error : "이미지데이터가 없습니다." })
        }
        
        // base64 to buffer 
        // 메타데이터 제거
        const base64Data = imageData.replace(/^data:image\/\w+;base64,/, '');
        const buffer = Buffer.from(base64Data, 'base64'); 

        const formData = new FormData();
        formData.append('file', buffer, {
            filename: `aixel-${Date.now()}.png`,
            contentType : 'image/png'
        })

        // 업로드
        const response = await axios.post("https://api.pinata.cloud/pinning/pinFileToIPFS", formData, {
            headers : {
                'Authorization' : `Bearer ${PINATA_JWT}`,
                ...formData.getHeaders()
            }
        })

        console.log("response", response);
        const ipfsHash = response.data.IpfsHash;
        const ipfsUrl = `https://gateway.pinata.cloud/ipfs/${ipfsHash}`

        res.json({
            success: true,
            ipfsHash: ipfsHash,
            ipfsUrl: ipfsUrl,
            message : "이미지 IPFS 업로드 완료"
        })
    } catch (error) {
        console.log(error);
        res.status(500).json({
            error:"IPFS 업로드 실패"
        })
    }
})

app.listen(4000, (error) => {
    console.log("server on")
    console.log("error", error);
})