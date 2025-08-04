const { ethers } = require('ethers');
const fs = require('fs');
const path = require('path');

const ARTWORK_NFT_ADDRESS = process.env.ARTWORK_NFT_ADDRESS;
const SMART_ACCOUNT_FACTORY_ADDRESS = process.env.SMART_ACCOUNT_FACTORY_ADDRESS;
const RPC_URL = process.env.RPC_URL || 'http://localhost:8545';
const PRIVATE_KEY = process.env.PRIVATE_KEY;
 
let provider;
let serverWallet;
let artworkNFT;
let smartAccountFactory;

// 컨트랙트 abi 가져오기
const loadContractABI = (contractName) => {
    try {
        const abiPath = path.join(__dirname, '../../contracts/artifacts/contracts', `${contractName}.sol`, `${contractName}.json`);
        const contractArtifact = JSON.parse(fs.readFileSync(abiPath, 'utf8'));
        return contractArtifact.abi;
    } catch (error) {
        console.error(error);
    }
};

// 초기화
const initialize = async () => {
    try {
        // provider 설정
        provider = new ethers.JsonRpcProvider(RPC_URL);
        
        // 서버 지갑 설정
        if (!PRIVATE_KEY) return ;

        serverWallet = new ethers.Wallet(PRIVATE_KEY, provider);
        
        // 컨트랙트 인스턴스 생성
        const artworkNFTABI = loadContractABI('ArtworkNFT');
        const smartAccountFactoryABI = loadContractABI('SmartAccountFactory');
        
        if (!artworkNFTABI || !smartAccountFactoryABI) return ;
        
        artworkNFT = new ethers.Contract(ARTWORK_NFT_ADDRESS, artworkNFTABI, serverWallet);
        smartAccountFactory = new ethers.Contract(SMART_ACCOUNT_FACTORY_ADDRESS, smartAccountFactoryABI, serverWallet);
        
        return true;
    } catch (error) {
        console.error(error);
    }
};

// 승인된 작품 민팅
const mintApprovedArtwork = async (artistAddress, proposalId, tokenURI, voteCount, transactionWallet = null) => {
    try {
        if (!artworkNFT) return ;

        // 사용할 지갑 결정
        const signerWallet = transactionWallet ? transactionWallet.connect(provider) : serverWallet; // transactionWallet이 있으면 그것을 사용, 없으면 서버 지갑
        const contractWithSigner = artworkNFT.connect(signerWallet);

        // 민팅 트랜잭션 실행
        const tx = await contractWithSigner.mintApprovedArtwork(
            artistAddress,
            proposalId,
            tokenURI,
            voteCount
        );
        
        // 트랜잭션 확인 대기
        const receipt = await tx.wait();
        console.log(receipt.hash);
        
        // 이벤트에서 tokenId 추출
        const mintEvent = receipt.logs.find(log => {
            try {
                const parsed = artworkNFT.interface.parseLog(log);
                return parsed.name === 'Transfer' && parsed.args.from === ethers.ZeroAddress;
            } catch {
                return false;
            }
        });
        
        const tokenId = mintEvent ? Number(mintEvent.args.tokenId) : null;
        
        return {
            success: true,
            tokenId,
            transactionHash: receipt.hash,
            gasUsed: receipt.gasUsed.toString()
        };
        
    } catch (error) {
        console.error(error);
        return {success: false,error: error.message};
    }
};

// Google 사용자 계정 생성
const createGoogleUserAccount = async (eoaAddress) => {
    try {
        if (!smartAccountFactory) return ;
        
        // 이미 배포된 계정이 있는지 확인
        const isDeployed = await smartAccountFactory.isAccountDeployed(eoaAddress);
        
        if (isDeployed) {
            // 기존 계정 주소 계산
            const accountAddress = await smartAccountFactory.getAccountAddress(eoaAddress);
            
            return {success: true,accountAddress, isNew: false
            };
        }
        
        // 새 계정 생성
        const tx = await smartAccountFactory.createAccountForGoogleUser(eoaAddress);
        console.log("새계정 주소", tx.hash);
        
        const receipt = await tx.wait();
        console.log(receipt.hash);
        
        // 이벤트에서 계정 주소 추출
        const accountCreatedEvent = receipt.logs.find(log => {
            try {
                const parsed = smartAccountFactory.interface.parseLog(log);
                return parsed.name === 'AccountCreated';
            } catch {
                return false;
            }
        });
        
        const accountAddress = accountCreatedEvent ? accountCreatedEvent.args.account : null;
        
        return {
            success: true,
            accountAddress,
            transactionHash: receipt.hash,
            isNew: true
        };
        
    } catch (error) {
        console.error(error);
        return {success: false,error: error.message};
    }
};



module.exports = {initialize,mintApprovedArtwork,createGoogleUserAccount};
