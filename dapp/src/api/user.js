import axios from 'axios';

// 사용자 작품 목록 조회
export const getUserArtworks = async () => {
    try {
        const response = await axios.get('http://localhost:4000/artwork/user/artworks', {
            withCredentials: true
        });
        return response.data;
    } catch (error) {
        console.error('작품 조회 실패:', error);
        throw new Error('작품 조회 실패');
    }
};

// 사용자 통계 조회
export const getUserStats = async () => {
    try {
        const response = await axios.get('http://localhost:4000/artwork/user/stats', {
            withCredentials: true
        });
        return response.data;
    } catch (error) {
        console.error('통계 조회 실패:', error);
        throw new Error('통계 조회 실패');
    }
};

// 민팅된 NFT 목록 조회
export const getMintedNFTs = async () => {
    try {
        const response = await axios.get('http://localhost:4000/artwork/minted', {
            withCredentials: true
        });
        return response.data;
    } catch (error) {
        console.error('민팅된 NFT 조회 실패:', error);
        if (error.response?.status === 404) {
            throw new Error('민팅된 NFT가 없습니다.');
        }
        throw new Error('민팅된 NFT 조회 실패');
    }
};

// NFT 상세 정보 조회
export const getNFTDetail = async (nftId) => {
    try {
        const response = await axios.get(`http://localhost:4000/artwork/nft/${nftId}`, {
            withCredentials: true
        });
        return response.data;
    } catch (error) {
        console.error('NFT 상세 정보 조회 실패:', error);
        throw new Error('NFT 상세 정보 조회 실패');
    }
};

// 작품 상세 정보 조회
export const getArtworkDetail = async (artworkId) => {
    try {
        const response = await axios.get(`http://localhost:4000/artwork/${artworkId}`, {
            withCredentials: true
        });
        console.log("api responce 상세: ", response)
        return response.data;
    } catch (error) {
        console.error('작품 상세 정보 조회 실패:', error);
        throw new Error('작품 상세 정보 조회 실패');
    }
}; 