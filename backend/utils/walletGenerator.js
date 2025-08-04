const { ethers } = require('ethers');

// 구글 아이디 + 입력 비밀번호 기반 EOA 생성
const createPasswordBasedEOA = (googleId, password) => {
    try {
        const seedString = `aixellab_${googleId}_${password}`;
        
        // 시드를 해시화해서 개인키 생성
        const seed = ethers.keccak256(ethers.toUtf8Bytes(seedString));
        const wallet = new ethers.Wallet(seed);

        return wallet.address;
    } catch (error) {
        console.error(error);
        throw error;
    }
};

// 주소 검증
const isValidAddress = (address) => {
    try {
        return ethers.isAddress(address);
    } catch {
        return false;
    }
};

module.exports = {createPasswordBasedEOA, isValidAddress};
