require('dotenv').config();
const ethers = require('ethers');
const path = require('path');
const fs = require('fs');

const ENTRYPOINT_ADDRESS = process.env.ENTRYPOINT_ADDRESS;
const PAYMASTER_ADDRESS = process.env.PAYMASTER_ADDRESS;
const SMART_ACCOUNT_FACTORY_ADDRESS = process.env.SMART_ACCOUNT_FACTORY_ADDRESS;
const ARTWORK_NFT_ADDRESS = process.env.ARTWORK_NFT_ADDRESS;

let provider, serverWallet, artworkNFT, smartAccountFactory, global;

const initialize = async () => {
    try {
        provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
        serverWallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
        
        const artifactsPath = path.join(__dirname, '../../contracts/artifacts/contracts');
        
        try {
            const entryPointAbi = JSON.parse(fs.readFileSync(path.join(artifactsPath, 'EntryPoint.sol/EntryPoint.json'))).abi;
            const paymasterAbi = JSON.parse(fs.readFileSync(path.join(artifactsPath, 'Paymaster.sol/Paymaster.json'))).abi;
            const smartAccountFactoryAbi = JSON.parse(fs.readFileSync(path.join(artifactsPath, 'SmartAccountFactory.sol/SmartAccountFactory.json'))).abi;
            const smartAccountAbi = JSON.parse(fs.readFileSync(path.join(artifactsPath, 'SmartAccount.sol/SmartAccount.json'))).abi;
            const artworkNFTAbi = JSON.parse(fs.readFileSync(path.join(artifactsPath, 'ArtworkNFT.sol/ArtworkNFT.json'))).abi;
            
            artworkNFT = new ethers.Contract(ARTWORK_NFT_ADDRESS, artworkNFTAbi, serverWallet);
            smartAccountFactory = new ethers.Contract(SMART_ACCOUNT_FACTORY_ADDRESS, smartAccountFactoryAbi, serverWallet);
            
            global = { 
                ENTRYPOINT_ABI: entryPointAbi,
                PAYMASTER_ABI: paymasterAbi,
                SMART_ACCOUNT_ABI: smartAccountAbi
            };
            
            console.log('Contract Manager initialized successfully');
            return { success: true };
        } catch (abiError) {
            console.error('ABI loading failed:', abiError);
            return { success: false, error: 'Failed to load contract ABIs' };
        }
    } catch (error) {
        console.error('Contract Manager initialization failed:', error);
        return { success: false, error: error.message };
    }
};

const createGoogleUserAccount = async (eoaAddress) => {
    try {
        if (!smartAccountFactory) {
            return { success: false, error: 'SmartAccountFactory not initialized' };
        }

        console.log('=== Smart Account 생성 시작 ===');
        console.log('EOA 주소:', eoaAddress);
        console.log('SmartAccountFactory 주소:', SMART_ACCOUNT_FACTORY_ADDRESS);
        
        // 간단하고 고정적인 salt 생성 (Google 사용자용)
        const userSalt = ethers.keccak256(ethers.toUtf8Bytes('google_user_' + eoaAddress));
        
        console.log('사용할 Salt:', userSalt);
        
        try {
            // JavaScript 방식으로 CREATE2 주소 계산
            // SmartAccount bytecode를 artifacts에서 직접 로드
            const artifactsPath = path.join(__dirname, '../../contracts/artifacts/contracts');
            const smartAccountArtifact = JSON.parse(fs.readFileSync(path.join(artifactsPath, 'SmartAccount.sol/SmartAccount.json')));
            const creationCode = smartAccountArtifact.bytecode;
            const constructorArgs = ethers.AbiCoder.defaultAbiCoder().encode(
                ["address", "address"], 
                [eoaAddress, ENTRYPOINT_ADDRESS]
            );
            
            // initCode = creationCode + constructorArgs
            const initCode = creationCode + constructorArgs.slice(2); // 0x 제거
            const initCodeHash = ethers.keccak256(initCode);
            
            // CREATE2 주소 계산
            const create2Input = ethers.solidityPacked(
                ["bytes1", "address", "bytes32", "bytes32"],
                ["0xff", SMART_ACCOUNT_FACTORY_ADDRESS, userSalt, initCodeHash]
            );
            const predictedAddress = ethers.getAddress("0x" + ethers.keccak256(create2Input).slice(-40));
            
            console.log('JavaScript로 예측된 Smart Account 주소:', predictedAddress);
            
            // 예측된 주소가 Factory 주소와 같으면 에러
            if (predictedAddress.toLowerCase() === SMART_ACCOUNT_FACTORY_ADDRESS.toLowerCase()) {
                throw new Error('예측된 주소가 Factory 주소와 같음 - CREATE2 계산 오류');
            }
            
            // Smart Account가 이미 배포되었는지 확인
            const code = await provider.getCode(predictedAddress);
            
            if (code === '0x') {
                // Smart Account 배포
                console.log('새로운 Smart Account 배포 중...');
                const tx = await smartAccountFactory.createAccount(eoaAddress, userSalt);
                const receipt = await tx.wait();
                console.log('Smart Account 배포 완료:', receipt.hash);
                
                // 배포 후 다시 주소 확인
                const finalCode = await provider.getCode(predictedAddress);
                console.log('배포 후 코드 확인:', finalCode !== '0x' ? '배포됨' : '배포 실패');
            } else {
                console.log('Smart Account 이미 존재');
            }
            
            // Smart Account 인스턴스 생성 및 owner 확인
            const smartAccount = new ethers.Contract(predictedAddress, global.SMART_ACCOUNT_ABI, provider);
            const actualOwner = await smartAccount.owner();
            
            console.log('Smart Account 주소:', predictedAddress);
            console.log('Smart Account Owner:', actualOwner);
            console.log('예상 Owner:', eoaAddress);
            console.log('Owner 일치:', actualOwner.toLowerCase() === eoaAddress.toLowerCase());
            
            // Owner가 일치하지 않으면 에러
            if (actualOwner.toLowerCase() !== eoaAddress.toLowerCase()) {
                throw new Error(`Owner 불일치: expected ${eoaAddress}, got ${actualOwner}`);
            }
            
            await addUserToPaymaster(predictedAddress);
            
            return { 
                success: true, 
                accountAddress: predictedAddress, 
                ownerAddress: eoaAddress 
            };
            
        } catch (contractError) {
            console.error('컨트랙트 호출 에러:', contractError);
            throw contractError;
        }
        
    } catch (error) {
        console.error('Smart Account 생성 실패:', error);
        return { success: false, error: error.message };
    }
};

const addUserToPaymaster = async (accountAddress) => {
    try {
        const paymaster = new ethers.Contract(PAYMASTER_ADDRESS, global.PAYMASTER_ABI, serverWallet);
        const tx = await paymaster.addSponsoredUser(accountAddress);
        await tx.wait();
        return { success: true };
    } catch (error) {
        console.error('Error adding user to paymaster:', error);
        return { success: false, error: error.message };
    }
};

const depositFundsToPaymaster = async (amount) => {
    try {
        const paymaster = new ethers.Contract(PAYMASTER_ADDRESS, global.PAYMASTER_ABI, serverWallet);
        
        // depositFunds 함수 사용
        const tx = await paymaster.depositFunds({ value: ethers.parseEther(amount) });
        await tx.wait();
        return { success: true, hash: tx.hash };
    } catch (error) {
        console.error('Error depositing to paymaster:', error);
        return { success: false, error: error.message };
    }
};

const checkPaymasterStatus = async (accountAddress) => {
    try {
        console.log('=== Paymaster 상태 확인 시작 ===');
        console.log('계정 주소:', accountAddress);
        console.log('Paymaster 주소:', PAYMASTER_ADDRESS);
        
        const paymaster = new ethers.Contract(PAYMASTER_ADDRESS, global.PAYMASTER_ABI, serverWallet);
        console.log('Paymaster 컨트랙트 연결 완료');
        
        console.log('Paymaster 잔액 확인 중...');
        const balance = await provider.getBalance(PAYMASTER_ADDRESS);
        console.log('Paymaster 잔액:', balance.toString());
        
        let isSponsored = false;
        try {
            console.log('sponsoredUsers 호출 중...');
            isSponsored = await paymaster.sponsoredUsers(accountAddress);
            console.log('sponsoredUsers 결과:', isSponsored);
        } catch (error) {
            console.log('sponsoredUsers 호출 실패, 기본값 사용:', error.message);
            isSponsored = true; // 기본값으로 true 사용
        }
        
        // MAX_COST는 상수이므로 직접 계산 (0.005 ether)
        const MAX_COST = ethers.parseEther('0.005');
        
        const estimatedGas = 200000;
        const gasPrice = ethers.parseUnits('20', 'gwei');
        const estimatedCost = BigInt(estimatedGas) * BigInt(gasPrice.toString());
        
        console.log('예상 비용:', estimatedCost.toString());
        console.log('최대 비용:', MAX_COST.toString());
        
        if (balance < estimatedCost) {
            console.log('잔액 부족, 자금 추가 중...');
            const depositAmount = '0.005';
            await depositFundsToPaymaster(depositAmount);
        }
        
        const result = {
            success: true,
            balance: balance.toString(),
            isSponsored: isSponsored,
            estimatedCost: estimatedCost.toString(),
            maxCost: MAX_COST.toString()
        };
        
        console.log('Paymaster 상태 확인 완료:', result);
        return result;
    } catch (error) {
        console.error('Error checking paymaster status:', error);
        return { success: false, error: error.message };
    }
};

const getNonce = async (accountAddress) => {
    const entryPoint = new ethers.Contract(ENTRYPOINT_ADDRESS, global.ENTRYPOINT_ABI, serverWallet);
    return await entryPoint.getNonce(accountAddress);
};

const encodeMintCallData = async (artistAddress, proposalId, tokenURI, voteCount) => {
    const populatedTx = await artworkNFT.mintApprovedArtwork.populateTransaction(
        artistAddress,
        proposalId,
        tokenURI,
        voteCount
    );
    return populatedTx.data;
};

const encodePaymasterData = async () => {
    return PAYMASTER_ADDRESS + '0000000000000000000000000000000000000000';
};

const signUserOperation = async (userOp, wallet, ownerAddress) => {
    try {
        const entryPoint = new ethers.Contract(ENTRYPOINT_ADDRESS, global.ENTRYPOINT_ABI, serverWallet);
        const userOpHash = await entryPoint.getUserOpHash(userOp);
        console.log('UserOp Hash:', userOpHash);
        
        // Smart Account의 owner가 서명해야 함
        if (ownerAddress && ownerAddress !== '0x0000000000000000000000000000000000000000') {
            // owner의 private key를 생성 (deterministic)
            const salt = process.env.SECRET_SALT || 'aixellab_secret_salt_2024';
            console.log('사용할 Salt:', salt);
            const ownerPrivateKey = ethers.keccak256(ethers.toUtf8Bytes(ownerAddress + salt));
            const ownerWallet = new ethers.Wallet(ownerPrivateKey, provider);
            
            // 생성된 지갑의 주소 확인
            console.log('서명에 사용할 지갑 주소:', ownerWallet.address);
            console.log('예상 Owner 주소:', ownerAddress);
            console.log('주소 일치:', ownerWallet.address.toLowerCase() === ownerAddress.toLowerCase());
            
            // 주소가 일치하지 않으면 서버 월렛 사용
            if (ownerWallet.address.toLowerCase() !== ownerAddress.toLowerCase()) {
                console.log('주소 불일치로 서버 월렛 사용');
                const signature = await serverWallet.signMessage(ethers.getBytes(userOpHash));
                console.log('서버 월렛 서명 완료:', signature);
                return signature;
            }
            
            // userOpHash를 직접 서명 (EntryPoint에서 ethSignedMessageHash로 변환됨)
            const signature = await ownerWallet.signMessage(ethers.getBytes(userOpHash));
            console.log('Owner 서명 완료:', signature);
            return signature;
        } else {
            // fallback: 서버 월렛 사용
            const signature = await serverWallet.signMessage(ethers.getBytes(userOpHash));
            console.log('서버 월렛 서명 완료:', signature);
            return signature;
        }
    } catch (error) {
        console.error('Error signing user operation:', error);
        throw error;
    }
};

const getUserOpHash = async (userOp) => {
    const entryPoint = new ethers.Contract(ENTRYPOINT_ADDRESS, global.ENTRYPOINT_ABI, serverWallet);
    return await entryPoint.getUserOpHash(userOp);
};

const directMintArtwork = async (artistAddress, proposalId, tokenURI, voteCount) => {
    try {
        console.log('=== 직접 민팅 시작 ===');
        console.log('artistAddress:', artistAddress);
        console.log('proposalId:', proposalId);
        console.log('tokenURI:', tokenURI);
        console.log('voteCount:', voteCount);
        
        if (!artworkNFT) {
            console.log('컨트랙트 초기화 실패');
            return { success: false, error: 'Contract not initialized' };
        }

        console.log('서버 지갑으로 컨트랙트 연결...');
        const contractWithSigner = artworkNFT.connect(serverWallet);
        
        console.log('민팅 트랜잭션 전송 중...');
        const tx = await contractWithSigner.mintApprovedArtwork(
            artistAddress,
            proposalId,
            tokenURI,
            voteCount
        );
        
        console.log('트랜잭션 해시:', tx.hash);
        console.log('트랜잭션 완료 대기 중...');
        
        const receipt = await tx.wait();
        console.log('트랜잭션 완료!');
        console.log('Gas 사용량:', receipt.gasUsed.toString());
        
        const mintEvent = receipt.logs.find(log => {
            try {
                const parsed = artworkNFT.interface.parseLog(log);
                return parsed.name === 'ArtworkMinted';
            } catch {
                return false;
            }
        });
        
        if (mintEvent) {
            console.log('ArtworkMinted 이벤트 발견:', mintEvent);
            const tokenId = Number(mintEvent.args.tokenId);
            console.log('민팅된 Token ID:', tokenId);
            
            return {
                success: true,
                tokenId,
                transactionHash: receipt.hash,
                gasUsed: receipt.gasUsed.toString()
            };
        } else {
            console.log('ArtworkMinted 이벤트를 찾을 수 없습니다.');
            return {
                success: false,
                error: 'Minting event not found'
            };
        }
        
    } catch (error) {
        console.error('Direct minting error:', error);
        return { success: false, error: error.message };
    }
};

const mintApprovedArtwork = async (artistAddress, proposalId, tokenURI, voteCount, transactionWallet = null) => {
    try {
        console.log('=== AA 민팅 시작 ===');
        console.log('artistAddress:', artistAddress);
        console.log('proposalId:', proposalId);
        console.log('tokenURI:', tokenURI);
        console.log('voteCount:', voteCount);
        
        if (!artworkNFT) {
            console.log('컨트랙트 초기화 실패');
            return { success: false, error: 'Contracts not initialized' };
        }

        // 모든 사용자는 Paymaster를 통한 가스비 대납 사용
        console.log('Paymaster를 통한 가스비 대납 민팅 사용');

        // Google 사용자는 Smart Account 사용
        if (!smartAccountFactory) {
            console.log('SmartAccountFactory 초기화 실패');
            return { success: false, error: 'SmartAccountFactory not initialized' };
        }

        // 1. Smart Account 생성
        console.log('1. Smart Account 생성 중...');
        const accountResult = await createGoogleUserAccount(artistAddress);
        if (!accountResult.success) {
            console.log('Smart Account 생성 실패:', accountResult.error);
            return accountResult;
        }
        
        const smartAccountAddress = accountResult.accountAddress;
        console.log('Smart Account 주소:', smartAccountAddress);
        
        // 2. Paymaster 상태 확인
        console.log('2. Paymaster 상태 확인 중...');
        const paymasterStatus = await checkPaymasterStatus(smartAccountAddress);
        if (!paymasterStatus.success) {
            console.log('Paymaster 상태 확인 실패:', paymasterStatus.error);
            return { success: false, error: 'Paymaster status check failed' };
        }
        console.log('Paymaster 상태:', paymasterStatus);
        
        // 3. Nonce 가져오기
        console.log('3. Nonce 가져오는 중...');
        let nonce = 0;
        try {
            const entryPoint = new ethers.Contract(ENTRYPOINT_ADDRESS, global.ENTRYPOINT_ABI, serverWallet);
            nonce = await entryPoint.getNonce(smartAccountAddress);
            console.log('Nonce:', nonce.toString());
        } catch (error) {
            console.log('Nonce 가져오기 실패, 기본값 사용:', error.message);
            nonce = 0;
        }
        
        // 4. CallData 인코딩
        console.log('4. CallData 인코딩 중...');
        const callData = await encodeMintCallData(artistAddress, proposalId, tokenURI, voteCount);
        console.log('CallData:', callData);
        
        // 5. Paymaster 데이터 인코딩
        console.log('5. Paymaster 데이터 인코딩 중...');
        const paymasterAndData = await encodePaymasterData();
        console.log('PaymasterAndData:', paymasterAndData);
        
        // 6. UserOperation 생성
        console.log('6. UserOperation 생성 중...');
        const userOp = {
            sender: smartAccountAddress,
            nonce: nonce,
            initCode: '0x',
            callData: callData,
            callGasLimit: 200000,
            verificationGasLimit: 100000,
            preverificationGas: 50000,
            maxFeePerGas: ethers.parseUnits('20', 'gwei'),
            maxPriorityFeePerGas: ethers.parseUnits('2', 'gwei'),
            paymasterAndData: paymasterAndData,
            signature: '0x'
        };
        console.log('UserOperation:', userOp);
        
        // 7. UserOperation 서명
        console.log('7. UserOperation 서명 중...');
        let signature = '0x';
        try {
            signature = await signUserOperation(userOp, transactionWallet, artistAddress);
            console.log('서명 완료:', signature);
        } catch (error) {
            console.log('서명 실패:', error.message);
            return { success: false, error: 'Failed to sign user operation' };
        }
        
        userOp.signature = signature;
        
        // 8. EntryPoint로 전송
        console.log('8. EntryPoint로 전송 중...');
        try {
            const entryPoint = new ethers.Contract(ENTRYPOINT_ADDRESS, global.ENTRYPOINT_ABI, serverWallet);
            const tx = await entryPoint.handleOps([userOp]);
            console.log('트랜잭션 전송됨:', tx.hash);
            
            const receipt = await tx.wait();
            console.log('트랜잭션 완료:', receipt.hash);
            
            // ArtworkMinted 이벤트 파싱
            let tokenId = null;
            try {
                const mintEvent = receipt.logs.find(log => {
                    try {
                        const parsed = artworkNFT.interface.parseLog(log);
                        return parsed.name === 'ArtworkMinted';
                    } catch {
                        return false;
                    }
                });
                
                if (mintEvent) {
                    tokenId = Number(mintEvent.args.tokenId);
                    console.log('민팅된 Token ID:', tokenId);
                }
            } catch (error) {
                console.log('이벤트 파싱 실패:', error.message);
            }
            
            return {
                success: true,
                tokenId: tokenId,
                transactionHash: receipt.hash,
                gasUsed: receipt.gasUsed.toString()
            };
        } catch (error) {
            console.log('EntryPoint 전송 실패:', error.message);
            throw error;
        }
        
    } catch (error) {
        console.error('AA Minting Error:', error);
        
        // Fallback to direct minting
        console.log('AA failed, trying direct minting...');
        return await directMintArtwork(artistAddress, proposalId, tokenURI, voteCount);
    }
};

const checkMintedNFT = async (tokenId) => {
    try {
        if (!artworkNFT) {
            return { success: false, error: 'Contract not initialized' };
        }

        const owner = await artworkNFT.ownerOf(tokenId);
        const tokenURI = await artworkNFT.tokenURI(tokenId);
        
        return {
            success: true,
            tokenId: tokenId,
            owner: owner,
            tokenURI: tokenURI
        };
    } catch (error) {
        console.error('Error checking NFT:', error);
        return { success: false, error: error.message };
    }
};

module.exports = {
    initialize,
    createGoogleUserAccount,
    mintApprovedArtwork,
    checkPaymasterStatus,
    depositFundsToPaymaster,
    directMintArtwork,
    checkMintedNFT
};
