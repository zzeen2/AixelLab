import axios from "axios";

// 투표 목록 가져오기
export const getVotes = async () => {
    try {
        const response = await axios.get(`http://localhost:4000/voting`, {withCredentials: true});
        console.log("response", response);
        return response.data;
    } catch (error) {
        console.error(error)
    }
}

// 투표 상세정보
export const getVoteDetail = async(voteId) => {
    try {
        const responce = await axios.get(`http://localhost:4000/voting/${voteId}`, {
            withCredentials: true
        });
        console.log("responce",responce);
        return responce.data;
    } catch (error) {
        console.error(error);
    }
}

// 투표 제출
export const submitVote = async( voteId, voteType) => {
    try {
        const response = await axios.post(`http://localhost:4000/voting/${voteId}/vote`, {voteType}, {
            withCredentials: true
        });
        console.log("response", response);
        return response.data;
    } catch (error) {
        console.error(error)
    }
}

// 민팅 대기 목록 조회
export const getPendingMints = async () => {
    try {
        const response = await axios.get(`http://localhost:4000/voting/user/pending-mints`, {
            withCredentials: true
        });
        return response.data;
    } catch (error) {
        console.error('민팅 대기 목록 조회 실패:', error);
        throw error;
    }
}

// 민팅 실행
export const executeMinting = async (proposalId, password) => {
    try {
        const response = await axios.post(`http://localhost:4000/voting/${proposalId}/mint`, {
            password
        }, {
            withCredentials: true
        });
        return response.data;
    } catch (error) {
        console.error('민팅 실행 실패:', error);
        throw error;
    }
}

// 민팅 상태 조회
export const getMintingStatus = async (proposalId) => {
    try {
        const response = await axios.get(`http://localhost:4000/voting/${proposalId}/minting-status`, {
            withCredentials: true
        });
        return response.data;
    } catch (error) {
        console.error('민팅 상태 조회 실패:', error);
        throw error;
    }
}

// 메타마스크 사용자를 위한 UserOperation 서명
export const signUserOperationWithMetaMask = async (proposalId, userOp) => {
    try {
        // 1. UserOperation Hash 생성 (백엔드에서)
        const response = await fetch(`/api/voting/${proposalId}/userop-hash`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ userOp }),
            credentials: 'include'
        });

        if (!response.ok) {
            throw new Error('UserOperation Hash 생성 실패');
        }

        const { userOpHash } = await response.json();

        // 2. 메타마스크로 서명
        const accounts = await window.ethereum.request({
            method: 'eth_requestAccounts'
        });
        
        const userAddress = accounts[0];
        
        const signature = await window.ethereum.request({
            method: 'personal_sign',
            params: [userOpHash, userAddress]
        });

        // 3. 서명된 UserOperation을 백엔드로 전송
        const mintResponse = await fetch(`/api/voting/${proposalId}/sign-userop`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ signature }),
            credentials: 'include'
        });

        if (!mintResponse.ok) {
            const errorData = await mintResponse.json();
            throw new Error(errorData.error || '민팅 실패');
        }

        return await mintResponse.json();

    } catch (error) {
        console.error('메타마스크 서명 실패:', error);
        throw error;
    }
};