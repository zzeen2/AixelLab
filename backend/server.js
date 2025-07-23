const express = require("express");
const axios = require('axios');
const app = express();
const cors = require('cors');
const FormData = require('form-data');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
session = require('express-session');
require('dotenv').config();

app.use(cors());
app.use(session({
    secret: SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false }
}));

app.use(passport.initialize());
app.use(passport.session());

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true })); 

// pinata
const PINATA_API_KEY = process.env.PINATA_API_KEY;
const PINATA_SECRET_API_KEY = process.env.PINATA_SECRET_API_KEY;
const PINATA_JWT = process.env.PINATA_JWT;
// google
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const GOOGLE_CALLBACK_URL = process.env.GOOGLE_CALLBACK_URL;
const SESSION_SECRET = process.env.SESSION_SECRET;


//passport 설정
// 사용자 직렬화
passport.serializeUser((user, done) => {
    done(null, user);
});

passport.deserializeUser((user, done) => {
    done(null, user);
});

// Google Strategy 설정
passport.use(new GoogleStrategy({
    clientID: GOOGLE_CLIENT_ID,
    clientSecret: GOOGLE_CLIENT_SECRET,
    callbackURL: GOOGLE_CALLBACK_URL
}, async (accessToken, refreshToken, profile, done) => {
    try {
        // 계정 추상화 지갑 주소
        const walletAddress = `0x${profile.id.slice(0, 40)}`;
        
        const user = {
            id: profile.id,
            email: profile.emails[0].value,
            name: profile.displayName,
            picture: profile.photos[0].value,
            walletAddress: walletAddress,
            provider: 'google'
        };
        
        return done(null, user);
    } catch (error) {
        return done(error, null);
    }
}));

// // Pinata 테스트
// app.get('/test-pinata', async (req, res) => {
//     try {
//         console.log('Pinata API 키 확인:', PINATA_API_KEY ? '설정됨' : '설정되지 않음');
        
//         if (!PINATA_API_KEY) {
//             return res.status(400).json({ 
//                 error: 'Pinata API 키가 설정되지 않았습니다. .env 파일을 확인해주세요.' 
//             });
//         }

//         // Pinata API 테스트 (사용자 정보 가져오기)
//         const response = await axios.get('https://api.pinata.cloud/data/testAuthentication', {
//             headers: {
//                 'Authorization': `Bearer ${PINATA_JWT}`
//             }
//         });

//         console.log('Pinata 연결 성공:', response.data);
//         res.json({ 
//             success: true, 
//             message: 'Pinata 연결 성공!',
//             data: response.data 
//         });
//     } catch (error) {
//         console.error('Pinata 연결 실패:', error.response?.data || error.message);
//         res.status(500).json({ 
//             error: 'Pinata 연결 실패', 
//             details: error.response?.data || error.message 
//         });
//     }
// });

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
// todo 소셜로그인 구현하고 유저정보 메타데이터로 넣기
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

// Google 로그인
app.get('/auth/google', passport.authenticate('google', {
    scope: ['profile', 'email']
}));

// Google 인증 후 콜백
app.get('/auth/google/callback', 
    passport.authenticate('google', { failureRedirect: '/login' }),
    (req, res) => {
        res.redirect('http://localhost:3000/auth/success');
    }
);

// 현재 로그인된 유저 정보
app.get('/auth/user', (req, res) => {
    if (req.isAuthenticated()) {
        res.json({
            success: true,
            user: req.user
        });
    } else {
        res.json({
            success: false,
            user: null
        });
    }
});

// 로그아웃
app.get('/auth/logout', (req, res) => {
    req.logout((err) => {
        if (err) {
            return res.status(500).json({ error: '로그아웃 실패' });
        }
        res.json({ success: true, message: '로그아웃 완료' });
    });
});


app.get('/auth/test', (req, res) => {
    res.json({
        googleClientId: GOOGLE_CLIENT_ID ? '설정됨' : '설정 안됨',
        googleClientSecret: GOOGLE_CLIENT_SECRET ? '설정됨' : '설정 안됨',
        callbackUrl: GOOGLE_CALLBACK_URL
    });
});

app.listen(4000, (error) => {
    console.log("server on")
    console.log("error", error);
})