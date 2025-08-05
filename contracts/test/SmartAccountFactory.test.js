const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("SmartAccountFactory", function () {
    let entryPoint, paymaster, smartAccountFactory, artworkNFT;
    let owner, user1, user2;

    beforeEach(async function () {
        [owner, user1, user2] = await ethers.getSigners();

        // EntryPoint 배포
        const EntryPoint = await ethers.getContractFactory("EntryPoint");
        entryPoint = await EntryPoint.deploy();
        await entryPoint.waitForDeployment();

        // Paymaster 배포 (entryPoint 주소 필요)
        const Paymaster = await ethers.getContractFactory("Paymaster");
        paymaster = await Paymaster.deploy(await entryPoint.getAddress());
        await paymaster.waitForDeployment();

        // SmartAccountFactory 배포
        const SmartAccountFactory = await ethers.getContractFactory("SmartAccountFactory");
        smartAccountFactory = await SmartAccountFactory.deploy(
            await entryPoint.getAddress(),
            await paymaster.getAddress()
        );
        await smartAccountFactory.waitForDeployment();

        console.log("EntryPoint:", await entryPoint.getAddress());
        console.log("Paymaster:", await paymaster.getAddress());
        console.log("SmartAccountFactory:", await smartAccountFactory.getAddress());
    });

    describe("CREATE2 로직 테스트", function () {
        it("JavaScript로 CREATE2 계산 테스트", async function () {
            const userEOA = user1.address;
            const salt = ethers.keccak256(ethers.toUtf8Bytes('js_test'));
            const factoryAddress = smartAccountFactory.target;
            const entryPointAddress = await entryPoint.getAddress();
            
            console.log("=== JavaScript CREATE2 계산 ===");
            console.log("User EOA:", userEOA);
            console.log("Salt:", salt);
            console.log("Factory:", factoryAddress);
            console.log("EntryPoint:", entryPointAddress);
            
            // SmartAccount 컨트랙트의 bytecode 가져오기
            const SmartAccount = await ethers.getContractFactory("SmartAccount");
            const creationCode = SmartAccount.bytecode;
            const constructorArgs = ethers.AbiCoder.defaultAbiCoder().encode(
                ["address", "address"], 
                [userEOA, entryPointAddress]
            );
            
            // initCode = creationCode + constructorArgs
            const initCode = creationCode + constructorArgs.slice(2); // 0x 제거
            const initCodeHash = ethers.keccak256(initCode);
            
            // CREATE2 주소 계산
            const create2Input = ethers.solidityPacked(
                ["bytes1", "address", "bytes32", "bytes32"],
                ["0xff", factoryAddress, salt, initCodeHash]
            );
            const predictedAddressJS = ethers.getAddress("0x" + ethers.keccak256(create2Input).slice(-40));
            
            console.log("JS로 예측한 주소:", predictedAddressJS);
            
            // 실제 생성
            const tx = await smartAccountFactory.createAccount(userEOA, salt);
            await tx.wait();
            
            const actualAddress = await smartAccountFactory.getAccountBySalt(userEOA, salt);
            console.log("실제 생성된 주소:", actualAddress);
            
            // Solidity에서 예측한 주소
            const solidityPredicted = await smartAccountFactory.getAddress(userEOA, salt);
            console.log("Solidity 예측 주소:", solidityPredicted);
            
            // JS 예측과 실제가 같은지 확인
            expect(predictedAddressJS).to.equal(actualAddress);
        });

        it("CREATE2 디버깅 테스트", async function () {
            const userEOA = user1.address;
            const salt = ethers.keccak256(ethers.toUtf8Bytes('debug_salt'));
            
            console.log("=== CREATE2 디버깅 ===");
            console.log("User EOA:", userEOA);
            console.log("Salt:", salt);
            console.log("Factory 주소:", smartAccountFactory.target);
            console.log("EntryPoint 주소:", await entryPoint.getAddress());
            
            // 실제 생성해보기
            const tx = await smartAccountFactory.createAccount(userEOA, salt);
            const receipt = await tx.wait();
            
            // 생성된 주소 확인
            const actualAddress = await smartAccountFactory.getAccountBySalt(userEOA, salt);
            console.log("실제 생성된 주소:", actualAddress);
            
            // 예측 주소 확인
            const predictedAddress = await smartAccountFactory.getAddress(userEOA, salt);
            console.log("예측된 주소:", predictedAddress);
            
            // 둘이 같은지 확인
            console.log("주소 일치 여부:", actualAddress === predictedAddress);
            
            expect(predictedAddress).to.equal(actualAddress);
        });

        it("CREATE2 기본 동작 테스트", async function () {
            const userEOA = user1.address;
            const salt = ethers.keccak256(ethers.toUtf8Bytes('test_salt'));
            
            console.log("=== CREATE2 기본 테스트 ===");
            console.log("User EOA:", userEOA);
            console.log("Salt:", salt);
            console.log("Factory 주소:", smartAccountFactory.target);
            
            // 1단계: 예측된 주소 계산
            const predictedAddress = await smartAccountFactory.getAddress(userEOA, salt);
            console.log("예측된 주소:", predictedAddress);
            
            // 2단계: 실제 생성
            const tx = await smartAccountFactory.createAccount(userEOA, salt);
            const receipt = await tx.wait();
            console.log("생성 완료");
            
            // 3단계: 생성 후 주소 확인
            const actualAddress = await smartAccountFactory.getAccountBySalt(userEOA, salt);
            console.log("실제 생성된 주소:", actualAddress);
            
            // 4단계: 예측과 실제가 같은지 확인
            expect(predictedAddress).to.equal(actualAddress);
            
            // 5단계: Factory 주소와 다른지 확인
            expect(actualAddress).to.not.equal(smartAccountFactory.target);
        });

        it("같은 파라미터로 호출시 같은 주소를 반환해야 함", async function () {
            const userEOA = user1.address;
            const salt = ethers.keccak256(ethers.toUtf8Bytes('google_user_' + userEOA));
            
            const address1 = await smartAccountFactory.getAddress(userEOA, salt);
            const address2 = await smartAccountFactory.getAddress(userEOA, salt);
            
            expect(address1).to.equal(address2);
        });

        it("다른 salt로 호출시 다른 주소를 반환해야 함", async function () {
            const userEOA = user1.address;
            const salt1 = ethers.keccak256(ethers.toUtf8Bytes('google_user_' + userEOA));
            const salt2 = ethers.keccak256(ethers.toUtf8Bytes('different_salt_' + userEOA));
            
            const address1 = await smartAccountFactory.getAddress(userEOA, salt1);
            const address2 = await smartAccountFactory.getAddress(userEOA, salt2);
            
            console.log("Salt1 주소:", address1);
            console.log("Salt2 주소:", address2);
            
            expect(address1).to.not.equal(address2);
        });

        it("실제 Smart Account 생성 테스트", async function () {
            const userEOA = user1.address;
            const salt = ethers.keccak256(ethers.toUtf8Bytes('google_user_' + userEOA));
            
            // 예측된 주소 확인
            const predictedAddress = await smartAccountFactory.getAddress(userEOA, salt);
            console.log("예측된 주소:", predictedAddress);
            
            // 배포 전 코드 확인
            const codeBefore = await ethers.provider.getCode(predictedAddress);
            console.log("배포 전 코드:", codeBefore);
            expect(codeBefore).to.equal("0x");
            
            // Smart Account 생성
            const tx = await smartAccountFactory.createAccount(userEOA, salt);
            const receipt = await tx.wait();
            console.log("생성 트랜잭션:", receipt.hash);
            
            // 배포 후 코드 확인
            const codeAfter = await ethers.provider.getCode(predictedAddress);
            console.log("배포 후 코드 길이:", codeAfter.length);
            expect(codeAfter).to.not.equal("0x");
            
            // Smart Account의 owner 확인
            const SmartAccount = await ethers.getContractFactory("SmartAccount");
            const smartAccount = SmartAccount.attach(predictedAddress);
            
            const actualOwner = await smartAccount.owner();
            console.log("실제 Owner:", actualOwner);
            console.log("예상 Owner:", userEOA);
            
            expect(actualOwner).to.equal(userEOA);
        });
    });
}); 