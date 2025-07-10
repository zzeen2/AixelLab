const express = require("express");
const axios = require('axios');
const app = express();
const cors = require('cors')
app.use(cors()); // ahems origin 허용

// react에서 요청보내면 url 받아서 proxy 전달
app.get('/proxy-image', async(req,res) => {
    const {url} = req.query;
    console.log("url : ", url)
    if(!url) return json({state : 500, message : "이미지가 없습니다."})

    try {
        const response = await axios.get(url, {
            responseType : 'arraybuffer' // arraybuffer : 이미지 데이터를 binary형태로 
        });
        //console.log("response:", response)
        const contentType = response.headers['content-type'];
        res.set('Content-Type', contentType ||'image/png');
        res.send(response.data);
    } catch (error) {
        console.log(error)
        // console.log("Status:", error.response.status);
        // console.log("Headers:", error.response.headers);
        // console.log("Data:", error.response.data);
    }
})

app.listen(4000, () => {
    console.log("server on")
})