const { ethers } = require('ethers');

// 구글 아이디 + 입력 비밀번호 기반 EOA 생성 (주소 반환)
const createPasswordBasedEOA = (googleId, password) => {
    try {
        const seedString = `aixellab_${googleId}_${password}`;
        const seed = ethers.keccak256(ethers.toUtf8Bytes(seedString));
        const wallet = new ethers.Wallet(seed);
        return wallet.address;
    } catch (error) {
        console.error(error);
        throw error;
    }
};

// 구글 아이디 + 입력 비밀번호 기반 EOA 월렛(개인키 포함) 생성
const createPasswordBasedWallet = (googleId, password, provider = null) => {
    const seedString = `aixellab_${googleId}_${password}`;
    const seed = ethers.keccak256(ethers.toUtf8Bytes(seedString));
    return provider ? new ethers.Wallet(seed, provider) : new ethers.Wallet(seed);
};

// 주소 검증
const isValidAddress = (address) => {
    try {
        return ethers.isAddress(address);
    } catch {
        return false;
    }
};

module.exports = {createPasswordBasedEOA, createPasswordBasedWallet, isValidAddress};
