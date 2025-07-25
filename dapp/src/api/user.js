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