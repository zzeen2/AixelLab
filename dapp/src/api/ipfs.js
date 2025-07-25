import axios from 'axios';

export const uploadToIPFS = async (imageData, title, description) => {
    try {
        const responce = await axios.post('http://localhost:4000/artwork/submit', {imageData, title, description}, { headers: { 'Content-Type': 'application/json' }, withCredentials: true });

        return responce.data;
    } catch (error) {
        console.error("IPFS 업로드 실패:", error);
        throw error;
    }
};