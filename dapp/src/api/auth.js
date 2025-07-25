import axios from 'axios';

// 현재 로그인된 사용자 정보 조회
export const getCurrentUser = async () => {
    try {
        const response = await axios.get(`http://localhost:4000/auth/user`, {
            withCredentials: true
        });
        return response.data;
    } catch (error) {
        console.error('사용자 정보 조회 실패:', error);
        throw new Error('사용자 정보 조회 실패');
    }
};

// 로그아웃
export const logout = async () => {
    try {
        const response = await axios.get(`http://localhost:4000/auth/logout`, {
            withCredentials: true
        });
        return response.data;
    } catch (error) {
        console.error('로그아웃 실패:', error);
        throw new Error('로그아웃 실패');
    }
}; 
