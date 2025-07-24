// 현재 로그인된 사용자 정보 조회
export const getCurrentUser = async () => {
    try {
        const response = await fetch(`http://localhost:4000/auth/user`, {
            credentials: 'include'
        });
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('사용자 정보 조회 실패:', error);
        throw new Error('사용자 정보 조회 실패');
    }
};

// 로그아웃
export const logout = async () => {
    try {
        const response = await fetch(`http://localhost:4000/auth/logout`, {
            credentials: 'include'
        });
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('로그아웃 실패:', error);
        throw new Error('로그아웃 실패');
    }
}; 
