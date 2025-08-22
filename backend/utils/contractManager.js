require('dotenv').config();
const ethers = require('ethers');
const path = require('path');
const fs = require('fs');

const ENTRYPOINT_ADDRESS = process.env.ENTRYPOINT_ADDRESS;
const PAYMASTER_ADDRESS = process.env.PAYMASTER_ADDRESS;
const SMART_ACCOUNT_FACTORY_ADDRESS = process.env.SMART_ACCOUNT_FACTORY_ADDRESS;
const ARTWORK_NFT_ADDRESS = process.env.ARTWORK_NFT_ADDRESS;
const AXC_ADDRESS = process.env.AXC_ADDRESS;
const MARKETPLACE_ADDRESS = process.env.MARKETPLACE_ADDRESS;

let provider, serverWallet, artworkNFT, smartAccountFactory, global, axcToken, marketplace;

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
            const axcAbi = JSON.parse(fs.readFileSync(path.join(artifactsPath, 'AixelCredit.sol/AixelCredit.json'))).abi;
            const marketAbi = JSON.parse(fs.readFileSync(path.join(artifactsPath, 'Marketplace.sol/Marketplace.json'))).abi;
            
            artworkNFT = new ethers.Contract(ARTWORK_NFT_ADDRESS, artworkNFTAbi, serverWallet);
            smartAccountFactory = new ethers.Contract(SMART_ACCOUNT_FACTORY_ADDRESS, smartAccountFactoryAbi, serverWallet);
            if (AXC_ADDRESS) axcToken = new ethers.Contract(AXC_ADDRESS, axcAbi, serverWallet);
            if (MARKETPLACE_ADDRESS) marketplace = new ethers.Contract(MARKETPLACE_ADDRESS, marketAbi, serverWallet);
            
            global = { 
                ENTRYPOINT_ABI: entryPointAbi,
                PAYMASTER_ABI: paymasterAbi,
                SMART_ACCOUNT_ABI: smartAccountAbi,
                MARKETPLACE_ABI: marketAbi,
                AXC_ABI: axcAbi
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

// 메타마스크 사용자를 Paymaster에 등록
const addMetaMaskUserToPaymaster = async (userAddress) => {
    try {
        console.log('메타마스크 사용자를 Paymaster에 등록 중...');
        console.log('사용자 주소:', userAddress);
        
        const paymaster = new ethers.Contract(PAYMASTER_ADDRESS, global.PAYMASTER_ABI, serverWallet);
        
        // 이미 등록되어 있는지 확인
        const isSponsored = await paymaster.sponsoredUsers(userAddress);
        if (isSponsored) {
            console.log('이미 Paymaster에 등록됨');
            return { success: true };
        }
        
        // Paymaster에 사용자 추가
        const tx = await paymaster.addSponsoredUser(userAddress);
        await tx.wait();
        
        console.log('메타마스크 사용자 Paymaster 등록 완료');
        return { success: true };
        
    } catch (error) {
        console.error('메타마스크 사용자 Paymaster 등록 실패:', error);
        return { success: false, error: error.message };
    }
};

const depositFundsToPaymaster = async (amount) => {
    try {
        // Paymaster의 receive()가 platformFunds를 증가시키므로 직접 송금 사용
        const tx = await serverWallet.sendTransaction({
            to: PAYMASTER_ADDRESS,
            value: ethers.parseEther(amount)
        });
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
        
        console.log('Paymaster platformFunds 확인 중...');
        let platformFunds = await paymaster.getPlatformBalance();
        console.log('Paymaster platformFunds:', platformFunds.toString());
        
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
        const MAX_COST = ethers.parseEther('0.02');
        
        const estimatedGas = 450000; // SmartAccount.execute + mintApprovedArtwork 여유치 포함
        const gasPrice = ethers.parseUnits('20', 'gwei');
        const estimatedCost = BigInt(estimatedGas) * BigInt(gasPrice.toString());
        
        console.log('예상 비용:', estimatedCost.toString());
        console.log('최대 비용:', MAX_COST.toString());
        
        if (platformFunds < estimatedCost) {
            console.log('잔액 부족, 자금 추가 중...');
            const depositAmount = '0.02';
            const dep = await depositFundsToPaymaster(depositAmount);
            if (!dep.success) {
                console.log('자금 추가 실패:', dep.error);
            }
            // 재조회
            platformFunds = await paymaster.getPlatformBalance();
            console.log('충전 후 platformFunds:', platformFunds.toString());
        }
        
        const result = {
            success: true,
            balance: platformFunds.toString(),
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

// SmartAccount가 MINTER_ROLE을 가지고 있는지 확인하고 없으면 부여
const ensureMinterRole = async (accountAddress) => {
    try {
        const MINTER_ROLE = ethers.keccak256(ethers.toUtf8Bytes('MINTER_ROLE'));
        const hasRole = await artworkNFT.hasRole(MINTER_ROLE, accountAddress);
        if (hasRole) {
            console.log('이미 MINTER_ROLE 보유:', accountAddress);
            return { success: true, changed: false };
        }
        console.log('MINTER_ROLE 부여 중:', accountAddress);
        const tx = await artworkNFT.connect(serverWallet).grantMinter(accountAddress);
        await tx.wait();
        console.log('MINTER_ROLE 부여 완료');
        return { success: true, changed: true };
    } catch (error) {
        console.error('MINTER_ROLE 부여 실패:', error);
        return { success: false, error: error.message };
    }
};

const getNonce = async (accountAddress) => {
    const entryPoint = new ethers.Contract(ENTRYPOINT_ADDRESS, global.ENTRYPOINT_ABI, serverWallet);
    return await entryPoint.getNonce(accountAddress);
};

const encodeMintCallData = async (artistAddress, proposalId, tokenURI, voteCount) => {
    // 1) ArtworkNFT 민팅 데이터 생성
    const populatedTx = await artworkNFT.mintApprovedArtwork.populateTransaction(
        artistAddress,
        proposalId,
        tokenURI,
        voteCount
    );
    const mintCallData = populatedTx.data;

    // 2) SmartAccount의 execute(to, value, data)로 감싸기
    const smartAccountInterface = new ethers.Interface(global.SMART_ACCOUNT_ABI);
    const wrappedCallData = smartAccountInterface.encodeFunctionData(
        'execute',
        [ARTWORK_NFT_ADDRESS, 0, mintCallData]
    );

    return wrappedCallData;
};

const encodePaymasterData = async () => {
    // Paymaster 주소 + 0으로 채워진 32바이트 (실제 Paymaster 데이터가 없는 경우)
    // 또는 Paymaster 컨트랙트에서 필요한 데이터를 인코딩
    const paymasterAddress = PAYMASTER_ADDRESS;
    const paymasterData = '0x'; // 빈 데이터 (Paymaster가 추가 데이터를 요구하지 않는 경우)
    
    return paymasterAddress + paymasterData.slice(2); // 0x 제거하고 주소와 결합
};

// ===== Marketplace AA helpers =====
const encodeExecute = (to, value, data) => {
    const smartAccountInterface = new ethers.Interface(global.SMART_ACCOUNT_ABI);
    return smartAccountInterface.encodeFunctionData('execute', [to, value, data]);
};

const encodeExecuteBatch = (targets, values, datas) => {
    const smartAccountInterface = new ethers.Interface(global.SMART_ACCOUNT_ABI);
    return smartAccountInterface.encodeFunctionData('executeBatch', [targets, values, datas]);
};

const encodeListBatchCallData = async (tokenId, priceUnits) => {
    if (!marketplace || !axcToken) throw new Error('Marketplace or AXC not initialized');
    // approval for NFT operator + list
    const nftApproveData = await artworkNFT.setApprovalForAll.populateTransaction(MARKETPLACE_ADDRESS, true);
    const listData = await marketplace.list.populateTransaction(tokenId, priceUnits);
    return encodeExecuteBatch(
        [ARTWORK_NFT_ADDRESS, MARKETPLACE_ADDRESS],
        [0, 0],
        [nftApproveData.data, listData.data]
    );
};

const encodeCancelCallData = async (tokenId) => {
    if (!marketplace) throw new Error('Marketplace not initialized');
    const data = await marketplace.cancel.populateTransaction(tokenId);
    return encodeExecute(MARKETPLACE_ADDRESS, 0, data.data);
};

const getListingPrice = async (tokenId) => {
    const info = await marketplace.listings(tokenId);
    return info.price;
};

const encodeBuyBatchCallData = async (tokenId) => {
    if (!marketplace || !axcToken) throw new Error('Marketplace or AXC not initialized');
    const price = await getListingPrice(tokenId);
    const approveData = await axcToken.approve.populateTransaction(MARKETPLACE_ADDRESS, price);
    const buyData = await marketplace.buy.populateTransaction(tokenId);
    return encodeExecuteBatch(
        [AXC_ADDRESS, MARKETPLACE_ADDRESS],
        [0, 0],
        [approveData.data, buyData.data]
    );
};

const signUserOperation = async (userOp, signature, ownerAddress, userType = 'google') => {
    try {
        const entryPoint = new ethers.Contract(ENTRYPOINT_ADDRESS, global.ENTRYPOINT_ABI, serverWallet);
        const userOpHash = await entryPoint.getUserOpHash(userOp);
        console.log('UserOp Hash:', userOpHash);

        // 메타마스크 사용자는 프론트에서 서명된 값을 그대로 사용
        if (typeof signature === 'string' && signature.startsWith('0x') && signature.length > 2) {
            return signature;
        }

        // 구글 사용자는 서버에서 비밀번호 기반 월렛으로 서명 수행 (signature 자리에 월렛 인스턴스 전달)
        if (userType === 'google' && signature && typeof signature.signMessage === 'function') {
            const bytesToSign = ethers.getBytes(userOpHash);
            const signed = await signature.signMessage(bytesToSign);
            return signed;
        }

        throw new Error('Missing userOp signature from client');
    } catch (error) {
        console.error('Error accepting user operation signature:', error);
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

const mintApprovedArtwork = async (artistAddress, proposalId, tokenURI, voteCount, transactionWallet = null, userType = 'google') => {
    try {
        console.log('=== AA 민팅 시작 ===');
        console.log('artistAddress:', artistAddress);
        console.log('proposalId:', proposalId);
        console.log('tokenURI:', tokenURI);
        console.log('voteCount:', voteCount);
        console.log('userType:', userType);
        
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

        // 1. Smart Account 생성 (모든 사용자)
        let smartAccountAddress = artistAddress;
        
        if (userType === 'google') {
            console.log('1. Google 사용자 - Smart Account 생성 중...');
            const accountResult = await createGoogleUserAccount(artistAddress);
            if (!accountResult.success) {
                console.log('Smart Account 생성 실패:', accountResult.error);
                return accountResult;
            }
            smartAccountAddress = accountResult.accountAddress;
            console.log('Smart Account 주소:', smartAccountAddress);
        } else {
            console.log('1. 메타마스크 사용자 - Smart Account 생성 중...');
            // 메타마스크 사용자도 Smart Account 생성
            const accountResult = await createGoogleUserAccount(artistAddress);
            if (!accountResult.success) {
                console.log('Smart Account 생성 실패:', accountResult.error);
                return accountResult;
            }
            smartAccountAddress = accountResult.accountAddress;
            console.log('Smart Account 주소:', smartAccountAddress);
        }
        
        // 2. Paymaster 상태 확인 및 등록
        console.log('2. Paymaster 상태 확인 중...');
        let paymasterStatus = await checkPaymasterStatus(smartAccountAddress);
        
        // 메타마스크 사용자이고 Paymaster에 등록되지 않은 경우 등록
        if (userType === 'metamask' && !paymasterStatus.isSponsored) {
            console.log('메타마스크 사용자를 Paymaster에 등록 중...');
            const registerResult = await addMetaMaskUserToPaymaster(smartAccountAddress);
            if (!registerResult.success) {
                console.log('Paymaster 등록 실패:', registerResult.error);
                return { success: false, error: 'Paymaster registration failed' };
            }
            // 다시 상태 확인
            paymasterStatus = await checkPaymasterStatus(smartAccountAddress);
        }
        
        if (!paymasterStatus.success) {
            console.log('Paymaster 상태 확인 실패:', paymasterStatus.error);
            return { success: false, error: 'Paymaster status check failed' };
        }
        console.log('Paymaster 상태:', paymasterStatus);
        
        // SmartAccount에 MINTER_ROLE 보장
        const minterResult = await ensureMinterRole(smartAccountAddress);
        if (!minterResult.success) {
            console.log('MINTER_ROLE 설정 실패:', minterResult.error);
            return { success: false, error: 'Failed to grant MINTER_ROLE to smart account' };
        }
        
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
            callGasLimit: 450000,
            verificationGasLimit: 120000,
            preverificationGas: 60000,
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
            signature = await signUserOperation(userOp, transactionWallet, artistAddress, userType);
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
            console.log('트랜잭션 로그 개수:', receipt.logs.length);
            
            try {
                // 모든 로그를 확인
                for (let i = 0; i < receipt.logs.length; i++) {
                    const log = receipt.logs[i];
                    console.log(`로그 ${i}:`, log);
                    
                    // ArtworkNFT 컨트랙트 주소와 비교
                    if (log.address.toLowerCase() === ARTWORK_NFT_ADDRESS.toLowerCase()) {
                        console.log(`ArtworkNFT 컨트랙트 로그 발견:`, log);
                        
                        try {
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
                                tokenId = Number(tokenIdHex);
                                console.log('민팅된 Token ID:', tokenId);
                                break;
                            }
                        } catch (parseError) {
                            console.log(`로그 ${i} 파싱 실패:`, parseError.message);
                        }
                    }
                }
                
                if (tokenId === null) {
                    console.log('ArtworkMinted 이벤트를 찾을 수 없음');
                    // 대안: 직접 컨트랙트에서 최신 tokenId 확인
                    try {
                        const totalSupply = await artworkNFT.getTotalSupply();
                        tokenId = Number(totalSupply) - 1; // 0-based index
                        console.log('getTotalSupply로 계산된 Token ID:', tokenId);
                    } catch (supplyError) {
                        console.log('getTotalSupply 확인 실패:', supplyError.message);
                    }
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

const sendUserOpFromSmartAccount = async (smartAccountAddress, callData, transactionWallet, userType, gasOverrides = {}) => {
    // Paymaster 상태 확인
    let paymasterStatus = await checkPaymasterStatus(smartAccountAddress);
    if (!paymasterStatus.success) {
        return { success: false, error: 'Paymaster status check failed' };
    }
    // Nonce
    const entryPoint = new ethers.Contract(ENTRYPOINT_ADDRESS, global.ENTRYPOINT_ABI, serverWallet);
    let nonce = await entryPoint.getNonce(smartAccountAddress);
    // UserOp
    const userOp = {
        sender: smartAccountAddress,
        nonce: nonce,
        initCode: '0x',
        callData: callData,
        callGasLimit: gasOverrides.callGasLimit || 450000,
        verificationGasLimit: gasOverrides.verificationGasLimit || 120000,
        preverificationGas: gasOverrides.preverificationGas || 60000,
        maxFeePerGas: ethers.parseUnits('20', 'gwei'),
        maxPriorityFeePerGas: ethers.parseUnits('2', 'gwei'),
        paymasterAndData: await encodePaymasterData(),
        signature: '0x'
    };
    // Sign
    const signature = await signUserOperation(userOp, transactionWallet, smartAccountAddress, userType);
    userOp.signature = signature;
    // Send
    const tx = await entryPoint.handleOps([userOp]);
    const receipt = await tx.wait();
    return { success: true, transactionHash: receipt.hash };
};

const listOnMarketplace = async (userAddress, tokenId, price, transactionWallet = null, userType = 'google') => {
    // create/get smart account
    const acc = await createGoogleUserAccount(userAddress);
    if (!acc.success) return acc;
    const sa = acc.accountAddress;
    const priceUnits = ethers.parseUnits(String(price), 6);
    const callData = await encodeListBatchCallData(tokenId, priceUnits);
    return await sendUserOpFromSmartAccount(sa, callData, transactionWallet, userType);
};

const cancelListing = async (userAddress, tokenId, transactionWallet = null, userType = 'google') => {
    const acc = await createGoogleUserAccount(userAddress);
    if (!acc.success) return acc;
    const sa = acc.accountAddress;
    const callData = await encodeCancelCallData(tokenId);
    return await sendUserOpFromSmartAccount(sa, callData, transactionWallet, userType);
};

const buyOnMarketplace = async (userAddress, tokenId, transactionWallet = null, userType = 'google') => {
    const acc = await createGoogleUserAccount(userAddress);
    if (!acc.success) return acc;
    const sa = acc.accountAddress;
    const callData = await encodeBuyBatchCallData(tokenId);
    return await sendUserOpFromSmartAccount(sa, callData, transactionWallet, userType);
};

// 환영 토큰 지급 (스마트 계정으로 민팅)
const grantWelcomeAxc = async (userEOA, amount = '100') => {
    try {
        if (!axcToken) return { success: false, error: 'AXC not initialized' };
        const acc = await createGoogleUserAccount(userEOA);
        if (!acc.success) return acc;
        const sa = acc.accountAddress;
        const target = ethers.parseUnits(String(amount), 6);
        const current = await axcToken.balanceOf(sa);
        if (current >= target) {
            return { success: true, account: sa, amount: current.toString(), txHash: null, skipped: true };
        }
        const diff = target - current;
        const tx = await axcToken.connect(serverWallet).mint(sa, diff);
        const rc = await tx.wait();
        return { success: true, account: sa, amount: (current + diff).toString(), txHash: rc.hash };
    } catch (e) {
        console.error('grantWelcomeAxc error:', e);
        return { success: false, error: e.message };
    }
};

const getOrCreateSmartAccount = async (userEOA) => {
    const acc = await createGoogleUserAccount(userEOA);
    if (!acc.success) return acc;
    return { success: true, smartAccount: acc.accountAddress };
};

// READ-ONLY: Smart Account 주소 예측(필요 시 배포 여부만 확인). 트랜잭션 발생 없음
const getPredictedSmartAccount = async (eoaAddress) => {
    try {
        const artifactsPath = path.join(__dirname, '../../contracts/artifacts/contracts');
        const smartAccountArtifact = JSON.parse(fs.readFileSync(path.join(artifactsPath, 'SmartAccount.sol/SmartAccount.json')));
        const creationCode = smartAccountArtifact.bytecode;
        const constructorArgs = ethers.AbiCoder.defaultAbiCoder().encode(
            ["address", "address"], 
            [eoaAddress, ENTRYPOINT_ADDRESS]
        );
        const initCode = creationCode + constructorArgs.slice(2);
        const initCodeHash = ethers.keccak256(initCode);
        const userSalt = ethers.keccak256(ethers.toUtf8Bytes('google_user_' + eoaAddress));
        const create2Input = ethers.solidityPacked(
            ["bytes1", "address", "bytes32", "bytes32"],
            ["0xff", SMART_ACCOUNT_FACTORY_ADDRESS, userSalt, initCodeHash]
        );
        const predictedAddress = ethers.getAddress("0x" + ethers.keccak256(create2Input).slice(-40));
        const code = await provider.getCode(predictedAddress);
        return { success: true, smartAccount: predictedAddress, deployed: code !== '0x' };
    } catch (e) {
        console.error('getPredictedSmartAccount error:', e);
        return { success: false, error: e.message };
    }
};

const getAxcBalance = async (address) => {
    if (!axcToken) return { success: false, error: 'AXC not initialized' };
    const bal = await axcToken.balanceOf(address);
    return { success: true, balanceUnits: bal.toString(), balance: Number(ethers.formatUnits(bal, 6)) };
};

const getListing = async (tokenId) => {
    if (!marketplace) return { success: false, error: 'Marketplace not initialized' };
    const l = await marketplace.listings(tokenId);
    return { success: true, listing: { seller: l.seller, price: l.price.toString(), active: l.active } };
};

const getEthBalance = async (address) => {
    const bal = await provider.getBalance(address);
    return { success: true, balanceWei: bal.toString(), balance: Number(ethers.formatEther(bal)) };
};

module.exports = {
    initialize,
    createGoogleUserAccount,
    mintApprovedArtwork,
    checkPaymasterStatus,
    depositFundsToPaymaster,
    directMintArtwork,
    checkMintedNFT,
    listOnMarketplace,
    cancelListing,
    buyOnMarketplace,
    grantWelcomeAxc,
    getOrCreateSmartAccount,
    getPredictedSmartAccount,
    getAxcBalance,
    getListing,
    getEthBalance
};
