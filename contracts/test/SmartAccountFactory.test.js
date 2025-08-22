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

        // Paymaster 기본 세팅 (자금 + 팩토리 승인)
        await paymaster.depositFunds({ value: ethers.parseEther("10") });

        // SmartAccountFactory 배포
        const SmartAccountFactory = await ethers.getContractFactory("SmartAccountFactory");
        smartAccountFactory = await SmartAccountFactory.deploy(
            await entryPoint.getAddress(),
            await paymaster.getAddress()
        );
        await smartAccountFactory.waitForDeployment();

        // 팩토리 승인 (paymaster가 factory를 호출 허용)
        await paymaster.authorizeFactory(smartAccountFactory.target);

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
            
            // SmartAccount 컨트랙트의 bytecode 가져오기
            const SmartAccount = await ethers.getContractFactory("SmartAccount");
            const creationCode = SmartAccount.bytecode;
            const constructorArgs = ethers.AbiCoder.defaultAbiCoder().encode(
                ["address", "address"], 
                [userEOA, entryPointAddress]
            );
            const initCode = creationCode + constructorArgs.slice(2);
            const initCodeHash = ethers.keccak256(initCode);
            const create2Input = ethers.solidityPacked(
                ["bytes1", "address", "bytes32", "bytes32"],
                ["0xff", factoryAddress, salt, initCodeHash]
            );
            const predictedAddressJS = ethers.getAddress("0x" + ethers.keccak256(create2Input).slice(-40));
            
            // 실제 생성
            await (await smartAccountFactory.createAccount(userEOA, salt)).wait();
            const actualAddress = await smartAccountFactory.getAccountBySalt(userEOA, salt);
            expect(predictedAddressJS).to.equal(actualAddress);
        });

        it("CREATE2 디버깅 테스트", async function () {
            const userEOA = user1.address;
            const salt = ethers.keccak256(ethers.toUtf8Bytes('debug_salt'));
            
            // JS 예측 먼저 계산
            const SmartAccount = await ethers.getContractFactory("SmartAccount");
            const creationCode = SmartAccount.bytecode;
            const constructorArgs = ethers.AbiCoder.defaultAbiCoder().encode(["address","address"],[userEOA, await entryPoint.getAddress()]);
            const initCode = creationCode + constructorArgs.slice(2);
            const initCodeHash = ethers.keccak256(initCode);
            const create2Input = ethers.solidityPacked(["bytes1","address","bytes32","bytes32"],["0xff", smartAccountFactory.target, salt, initCodeHash]);
            const predictedAddress = ethers.getAddress("0x" + ethers.keccak256(create2Input).slice(-40));
            
            // 실제 생성
            await (await smartAccountFactory.createAccount(userEOA, salt)).wait();
            const actualAddress = await smartAccountFactory.getAccountBySalt(userEOA, salt);
            expect(predictedAddress).to.equal(actualAddress);
        });

        it("CREATE2 기본 동작 테스트", async function () {
            const userEOA = user1.address;
            const salt = ethers.keccak256(ethers.toUtf8Bytes('test_salt'));
            
            // JS 예측 주소
            const SmartAccount = await ethers.getContractFactory("SmartAccount");
            const creationCode = SmartAccount.bytecode;
            const constructorArgs = ethers.AbiCoder.defaultAbiCoder().encode(["address","address"],[userEOA, await entryPoint.getAddress()]);
            const initCode = creationCode + constructorArgs.slice(2);
            const initCodeHash = ethers.keccak256(initCode);
            const create2Input = ethers.solidityPacked(["bytes1","address","bytes32","bytes32"],["0xff", smartAccountFactory.target, salt, initCodeHash]);
            const predictedAddress = ethers.getAddress("0x" + ethers.keccak256(create2Input).slice(-40));
            
            // 실제 생성
            await (await smartAccountFactory.createAccount(userEOA, salt)).wait();
            const actualAddress = await smartAccountFactory.getAccountBySalt(userEOA, salt);
            expect(predictedAddress).to.equal(actualAddress);
            expect(actualAddress).to.not.equal(smartAccountFactory.target);
        });

        it("같은 파라미터로 호출시 같은 주소를 반환해야 함", async function () {
            const userEOA = user1.address;
            const salt = ethers.keccak256(ethers.toUtf8Bytes('google_user_' + userEOA));
            const a1 = await smartAccountFactory.getAddress(userEOA, salt);
            const a2 = await smartAccountFactory.getAddress(userEOA, salt);
            expect(a1).to.equal(a2);
        });

        it("다른 salt로 호출시 다른 주소를 반환해야 함", async function () {
            const userEOA = user1.address;
            const salt1 = ethers.keccak256(ethers.toUtf8Bytes('google_user_' + userEOA));
            const salt2 = ethers.keccak256(ethers.toUtf8Bytes('different_salt_' + userEOA));
            
            // JS 예측으로 비교 (순수 계산)
            const SmartAccount = await ethers.getContractFactory("SmartAccount");
            const creationCode = SmartAccount.bytecode;
            const ep = await entryPoint.getAddress();
            const params = (user) => ethers.AbiCoder.defaultAbiCoder().encode(["address","address"],[user, ep]);
            const initHash = (user) => ethers.keccak256(creationCode + params(user).slice(2));
            const pred = (salt) => ethers.getAddress("0x" + ethers.keccak256(ethers.solidityPacked(["bytes1","address","bytes32","bytes32"],["0xff", smartAccountFactory.target, salt, initHash(userEOA)])).slice(-40));
            
            const addr1 = pred(salt1);
            const addr2 = pred(salt2);
            expect(addr1).to.not.equal(addr2);
        });

        it("실제 Smart Account 생성 테스트", async function () {
            const userEOA = user1.address;
            const salt = ethers.keccak256(ethers.toUtf8Bytes('google_user_' + userEOA));
            
            // JS 예측 주소
            const SmartAccount = await ethers.getContractFactory("SmartAccount");
            const creationCode = SmartAccount.bytecode;
            const constructorArgs = ethers.AbiCoder.defaultAbiCoder().encode(["address","address"],[userEOA, await entryPoint.getAddress()]);
            const initCode = creationCode + constructorArgs.slice(2);
            const initCodeHash = ethers.keccak256(initCode);
            const create2Input = ethers.solidityPacked(["bytes1","address","bytes32","bytes32"],["0xff", smartAccountFactory.target, salt, initCodeHash]);
            const predictedAddress = ethers.getAddress("0x" + ethers.keccak256(create2Input).slice(-40));
            
            // 배포 전 코드 확인
            const codeBefore = await ethers.provider.getCode(predictedAddress);
            expect(codeBefore).to.equal("0x");
            
            // 생성 및 확인
            await (await smartAccountFactory.createAccount(userEOA, salt)).wait();
            const codeAfter = await ethers.provider.getCode(predictedAddress);
            expect(codeAfter).to.not.equal("0x");
            
            const Smart = await ethers.getContractFactory("SmartAccount");
            const sa = Smart.attach(predictedAddress);
            expect(await sa.owner()).to.equal(userEOA);
        });
    });
}); 