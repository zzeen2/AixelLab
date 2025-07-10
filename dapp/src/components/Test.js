import React, {useState} from 'react'
import axios from "axios"

const Test = () => {
    const [imageUrl, setImageUrl] = useState("");
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
            setImageUrl(response.data.data[0].url)
        } catch (error) {
            console.log(error)
        }
    }
    return (
        <div>
            <button onClick={generateImg}>create duck</button>
            {imageUrl && <img src = {imageUrl}/>}
        </div>
    )
}

export default Test