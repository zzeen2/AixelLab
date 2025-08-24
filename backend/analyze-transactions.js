const { ethers } = require('ethers');
require('dotenv').config();

const RPC_URL = process.env.RPC_URL;
require('dotenv').config();
const ARTWORK_NFT_ADDRESS = process.env.ARTWORK_NFT_ADDRESS;

// 분석할 트랜잭션 해시들
const transactions = [
    '0x036a2bec0e7349dc9e1ccf6f9185a617dfe4465e6543230b2b323a144bf20b60',
    '0xed638fc4ddeb59c5423e7155283d1dbdd4871d7ae79caa4c32057dc55c731f1b',
    '0x391e871a2545f1753d1c08f566f146a7f4e35de9e89f0fa7d6f7f1545382b3dd',
    '0xcf3d72dbd7723e3e7008bd0d898717a5b5d8799509d0e7f2f146018cd3511afd'
];

async function analyzeTransactions() {
    try {
        const provider = new ethers.JsonRpcProvider(RPC_URL);
        
        console.log('=== 트랜잭션 분석 시작 ===');
        
        for (let i = 0; i < transactions.length; i++) {
            const txHash = transactions[i];
            console.log(`\n트랜잭션 ${i + 1}: ${txHash}`);
            
            try {
                const receipt = await provider.getTransactionReceipt(txHash);
                console.log('트랜잭션 상태:', receipt.status === 1 ? '성공' : '실패');
                console.log('로그 개수:', receipt.logs.length);
                
                // ArtworkMinted 이벤트 찾기
                for (let j = 0; j < receipt.logs.length; j++) {
                    const log = receipt.logs[j];
                    
                    // ArtworkNFT 컨트랙트 주소와 비교
                    if (log.address.toLowerCase() === ARTWORK_NFT_ADDRESS.toLowerCase()) {
                        console.log(`ArtworkNFT 컨트랙트 로그 발견:`, log);
                        
                        // 이벤트 시그니처 확인
                        const eventSignature = log.topics[0];
                        console.log('이벤트 시그니처:', eventSignature);
                        
                        // ArtworkMinted 이벤트 시그니처: keccak256("ArtworkMinted(uint256,address,uint256,string,uint256)")
                        const expectedSignature = ethers.keccak256(ethers.toUtf8Bytes("ArtworkMinted(uint256,address,uint256,string,uint256)"));
                        console.log('예상 시그니처:', expectedSignature);
                        
                        if (eventSignature === expectedSignature) {
                            console.log('ArtworkMinted 이벤트 발견!');
                            
                            // 토픽에서 tokenId 추출 (첫 번째 indexed 파라미터)
                            const tokenIdHex = log.topics[1];
                            const tokenId = Number(tokenIdHex);
                            console.log('민팅된 Token ID:', tokenId);
                            
                            // DB 업데이트 쿼리 출력
                            console.log(`UPDATE artworks SET token_id = ${tokenId} WHERE id = ${i + 1};`);
                            console.log(`UPDATE proposals SET nft_token_id = ${tokenId} WHERE id = ${i + 1};`);
                        }
                    }
                }
                
            } catch (error) {
                console.log('트랜잭션 분석 실패:', error.message);
            }
        }
        
    } catch (error) {
        console.error('오류:', error);
    }
}

analyzeTransactions(); 