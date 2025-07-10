import React, {useRef, useState} from 'react'
import axios from "axios"

const Test = () => {
    const [imageUrl, setImageUrl] = useState("");
    const canvasRef = useRef(); // useRef : Dom 직접 제어, 값 기억, 컴포넌트가 리렌더링 되어도 ref.current 값이 기억됨
    //console.log("api", process.env.REACT_APP_OPENAI_API_KEY)

    const generateImg = async() => {
        try {
            const response = await axios.post("https://api.openai.com/v1/images/generations", {
                model: "dall-e-2",
                prompt: "128x128 pixel art of a cat character, NES 8bit style, minimal details",
                n: 1,
                size: "256x256"
            },{
                headers : {
                    "Content-Type" : "application/json",
                    Authorization : `Bearer ${process.env.REACT_APP_OPENAI_API_KEY}`
                }
            })
            console.log("response", response.data);
            const url = response.data.data[0].url
            
            setImageUrl(url)
            drawPixelImage(url)
        } catch (error) {
            console.log(error)
        }
    }

    // 캔버스
    const drawPixelImage = (url) => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const img = new Image();
    
    // Proxy 서버 경유 URL
    const proxiedUrl = `http://localhost:4000/proxy-image?url=${encodeURIComponent(url)}`;
    
    img.crossOrigin = "anonymous";
    img.src = proxiedUrl;

    img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;

        ctx.imageSmoothingEnabled = false;

        const pixelSize = 64;
        ctx.drawImage(img, 0, 0, pixelSize, pixelSize);
        ctx.drawImage(canvas, 0, 0, pixelSize, pixelSize, 0, 0, img.width, img.height);
    };
};

    return (
        <div>
            <button onClick={generateImg}>create duck</button>
            {imageUrl && <img src = {imageUrl}/>}
            <br />
            <canvas ref={canvasRef} style={{ border: "1px solid black" }} />
            <br />
            {imageUrl && <img src={imageUrl} alt="Generated" />}
        </div>
    )
}

export default Test