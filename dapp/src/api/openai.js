import axios from "axios"

const OPEN_API_KEY = process.env.REACT_APP_OPENAI_API_KEY;

export const generateImage = async(prompt) => {
    try {
        const response = await axios.post(
            "https://api.openai.com/v1/images/generations",
            {
                model: "dall-e-2",
                prompt: prompt,
                n: 1,
                size: "256x256",
            },{
                headers : {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${OPEN_API_KEY}`,
                }
            }
        )
        console.log(response.data);
        return response.data.data[0].url;
    } catch (error) {
        console.log("이미지 생성 에러")
        console.log(error)
        alert("Image creation failed. Please try again in a moment.")
    }
}