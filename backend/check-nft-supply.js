const { ethers } = require('ethers');
require('dotenv').config();

const ARTWORK_NFT_ADDRESS = '0xc7c57c6baE0B782316bD7478051A01bCf729e83e';
const RPC_URL = process.env.RPC_URL || 'https://sepolia.infura.io/v3/your_infura_api_key_here';

// ArtworkNFT ABI (필요한 함수만)
const ARTWORK_NFT_ABI = [
    "function totalSupply() view returns (uint256)",
    "function tokenURI(uint256 tokenId) view returns (string)",
    "function ownerOf(uint256 tokenId) view returns (address)",
    "function tokenByIndex(uint256 index) view returns (uint256)"
];

async function checkNFTSupply() {
    try {
        const provider = new ethers.JsonRpcProvider(RPC_URL);
        const artworkNFT = new ethers.Contract(ARTWORK_NFT_ADDRESS, ARTWORK_NFT_ABI, provider);
        
        console.log('=== NFT 컨트랙트 정보 확인 ===');
        console.log('컨트랙트 주소:', ARTWORK_NFT_ADDRESS);
        
        // totalSupply 확인
        const totalSupply = await artworkNFT.totalSupply();
        console.log('총 NFT 개수:', totalSupply.toString());
        
        // 각 NFT 정보 확인
        for (let i = 0; i < totalSupply; i++) {
            try {
                const tokenId = await artworkNFT.tokenByIndex(i);
                const owner = await artworkNFT.ownerOf(tokenId);
                const tokenURI = await artworkNFT.tokenURI(tokenId);
                
                console.log(`\nToken ID ${tokenId}:`);
                console.log('  Owner:', owner);
                console.log('  Token URI:', tokenURI);
            } catch (error) {
                console.log(`Token ${i} 조회 실패:`, error.message);
            }
        }
        
    } catch (error) {
        console.error('오류:', error);
    }
}

checkNFTSupply(); 