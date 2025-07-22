const express = require("express");
const axios = require('axios');
const app = express();
const cors = require('cors')
app.use(cors()); 

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

app.listen(4000, (error) => {
    console.log("server on")
    console.log(error);
})