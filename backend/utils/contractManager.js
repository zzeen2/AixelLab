const { ethers } = require('ethers');
require('dotenv').config();

// ArtworkNFT 컨트랙트 ABI (필요한 함수들만)
const ARTWORK_NFT_ABI = [
    "function mintApprovedArtwork(address artist, uint256 proposalId, string memory tokenURI, uint256 voteCount) external returns (uint256)",
    "function proposalMinted(uint256 proposalId) external view returns (bool)",
    "function getTotalSupply() external view returns (uint256)",
    "function getArtworkInfo(uint256 tokenId) external view returns (tuple(address artist, uint256 proposalId, uint256 voteCount, uint256 mintedAt))",
    "function ownerOf(uint256 tokenId) external view returns (address)",
    "function tokenURI(uint256 tokenId) external view returns (string)"
];

// SmartAccountFactory 컨트랙트 ABI
const FACTORY_ABI = [
    "function createAccountForGoogleUser(address userEOA) external returns (address)",
    "function getAccount(address userEOA) external view returns (address)",
    "function isAccountDeployed(address userEOA) external view returns (bool)"
];

class ContractManager {
    constructor() {
        this.provider = null;
        this.wallet = null;
        this.artworkNFT = null;
        this.factory = null;
        this.initialized = false;
    }

    async initialize() {
        try {
            // Provider 설정
            this.provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
            
            // Wallet 설정 (서버 지갑)
            this.wallet = new ethers.Wallet(process.env.PRIVATE_KEY, this.provider);
            
            // 컨트랙트 인스턴스 생성
            if (process.env.ARTWORK_NFT_ADDRESS) {
                this.artworkNFT = new ethers.Contract(
                    process.env.ARTWORK_NFT_ADDRESS,
                    ARTWORK_NFT_ABI,
                    this.wallet
                );
            }

            if (process.env.SMART_ACCOUNT_FACTORY_ADDRESS) {
                this.factory = new ethers.Contract(
                    process.env.SMART_ACCOUNT_FACTORY_ADDRESS,
                    FACTORY_ABI,
                    this.wallet
                );
            }

            this.initialized = true;
            console.log('✅ ContractManager 초기화 완료');
            console.log(`📍 서버 지갑 주소: ${this.wallet.address}`);
            
        } catch (error) {
            console.error('❌ ContractManager 초기화 실패:', error);
            throw error;
        }
    }

    // NFT 민팅 함수
    async mintApprovedArtwork(artistAddress, proposalId, tokenURI, voteCount) {
        if (!this.initialized || !this.artworkNFT) {
            throw new Error('ContractManager가 초기화되지 않았습니다.');
        }

        try {
            console.log(`🎨 NFT 민팅 시작: Proposal ${proposalId}`);
            
            // 이미 민팅되었는지 확인
            const alreadyMinted = await this.artworkNFT.proposalMinted(proposalId);
            if (alreadyMinted) {
                throw new Error(`Proposal ${proposalId}는 이미 민팅되었습니다.`);
            }

            // 가스비 추정
            const gasEstimate = await this.artworkNFT.mintApprovedArtwork.estimateGas(
                artistAddress, proposalId, tokenURI, voteCount
            );
            
            // 민팅 실행
            const tx = await this.artworkNFT.mintApprovedArtwork(
                artistAddress,
                proposalId, 
                tokenURI,
                voteCount,
                {
                    gasLimit: gasEstimate * 120n / 100n // 20% 여유분
                }
            );

            console.log(`⏳ 트랜잭션 전송: ${tx.hash}`);
            
            // 트랜잭션 완료 대기
            const receipt = await tx.wait();
            
            // 이벤트에서 tokenId 추출
            const event = receipt.logs.find(log => {
                try {
                    const parsed = this.artworkNFT.interface.parseLog(log);
                    return parsed.name === 'ArtworkMinted';
                } catch {
                    return false;
                }
            });

            const tokenId = event ? this.artworkNFT.interface.parseLog(event).args.tokenId : null;

            console.log(`✅ NFT 민팅 완료! TokenID: ${tokenId}`);
            
            return {
                success: true,
                tokenId: tokenId ? Number(tokenId) : null,
                transactionHash: tx.hash,
                gasUsed: receipt.gasUsed.toString()
            };

        } catch (error) {
            console.error('❌ NFT 민팅 실패:', error);
            throw error;
        }
    }

    // Google 사용자용 스마트 계정 생성
    async createGoogleUserAccount(userEOA) {
        if (!this.initialized || !this.factory) {
            throw new Error('SmartAccountFactory가 초기화되지 않았습니다.');
        }

        try {
            console.log(`🔑 Google 사용자 계정 생성: ${userEOA}`);
            
            // 이미 계정이 있는지 확인
            const isDeployed = await this.factory.isAccountDeployed(userEOA);
            if (isDeployed) {
                const accountAddress = await this.factory.getAccount(userEOA);
                console.log(`✅ 이미 존재하는 계정: ${accountAddress}`);
                return { success: true, accountAddress };
            }

            // 새 계정 생성
            const tx = await this.factory.createAccountForGoogleUser(userEOA);
            const receipt = await tx.wait();

            const accountAddress = await this.factory.getAccount(userEOA);
            
            console.log(`✅ 새 계정 생성 완료: ${accountAddress}`);
            
            return {
                success: true,
                accountAddress,
                transactionHash: tx.hash
            };

        } catch (error) {
            console.error('❌ 계정 생성 실패:', error);
            throw error;
        }
    }

    // 네트워크 상태 확인
    async getNetworkStatus() {
        try {
            const network = await this.provider.getNetwork();
            const balance = await this.provider.getBalance(this.wallet.address);
            const blockNumber = await this.provider.getBlockNumber();

            return {
                networkName: network.name,
                chainId: Number(network.chainId),
                serverBalance: ethers.formatEther(balance),
                latestBlock: blockNumber
            };
        } catch (error) {
            console.error('❌ 네트워크 상태 확인 실패:', error);
            throw error;
        }
    }
}

// 싱글톤 인스턴스
const contractManager = new ContractManager();

module.exports = contractManager; 