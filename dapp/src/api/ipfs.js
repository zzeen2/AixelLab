import axios from 'axios';

export const uploadToIPFS = async (imageData) => {
    try {
        console.log("업로드 시작")

        const responce = await axios.post('http://localhost:4000/upload-to-ipfs', {
            imageData : imageData
        });

        console.log(responce.data.data);
        return responce.data;
    } catch (error) {
        console.log("IPFS 업로드 실패")
    }
};