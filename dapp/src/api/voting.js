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