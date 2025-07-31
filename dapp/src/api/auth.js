import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:4000';

// 현재 로그인된 사용자 정보 조회
export const getCurrentUser = async () => {
    try {
        const response = await axios.get(`${API_BASE_URL}/auth/user`, {
            withCredentials: true
        });
        return response.data;
    } catch (error) {
        console.error('사용자 정보 조회 실패:', error);
        throw error;
    }
};

// MetaMask 서명 메시지 요청
export const requestMetaMaskMessage = async (walletAddress) => {
    try {
        const response = await axios.post(`${API_BASE_URL}/auth/metamask/message`, {
            walletAddress
        }, {
            withCredentials: true
        });
        return response.data;
    } catch (error) {
        console.error('MetaMask 메시지 요청 실패:', error);
        throw error;
    }
};

// MetaMask 서명 검증 및 로그인
export const verifyMetaMaskSignature = async (walletAddress, signature, displayName) => {
    try {
        const response = await axios.post(`${API_BASE_URL}/auth/metamask/verify`, {
            walletAddress,
            signature,
            displayName
        }, {
            withCredentials: true
        });
        return response.data;
    } catch (error) {
        console.error('MetaMask 서명 검증 실패:', error);
        throw error;
    }
};

// 로그아웃
export const logout = async () => {
    try {
        const response = await axios.get(`${API_BASE_URL}/auth/logout`, {
            withCredentials: true
        });
        return response.data;
    } catch (error) {
        console.error('로그아웃 실패:', error);
        throw error;
    }
}; 
