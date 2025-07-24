import axios from 'axios';

export const uploadToIPFS = async (imageData, title, description) => {
    try {
        console.log("업로드 시작")

        const responce = await axios.post('http://localhost:4000/artwork/submit', {imageData, title, description});

        console.log(responce.data);
        return responce.data;
    } catch (error) {
        console.log("IPFS 업로드 실패")
    }
};