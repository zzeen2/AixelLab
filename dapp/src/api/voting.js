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