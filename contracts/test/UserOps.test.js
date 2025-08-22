const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("AixelLab UserOps Integration", function () {
    let entryPoint, paymaster, smartAccountFactory, artworkNFT;
    let owner, googleUser, artist;

    beforeEach(async function () {
        [owner, googleUser, artist] = await ethers.getSigners();

        const EntryPoint = await ethers.getContractFactory("EntryPoint");
        entryPoint = await EntryPoint.deploy();

        const Paymaster = await ethers.getContractFactory("Paymaster");
        paymaster = await Paymaster.deploy(entryPoint.target);

        const SmartAccountFactory = await ethers.getContractFactory("SmartAccountFactory");
        smartAccountFactory = await SmartAccountFactory.deploy(entryPoint.target, paymaster.target);

        const ArtworkNFT = await ethers.getContractFactory("ArtworkNFT");
        artworkNFT = await ArtworkNFT.deploy();

        await paymaster.depositFunds({ value: ethers.parseEther("10") });
        await paymaster.authorizeFactory(smartAccountFactory.target);
    });

    describe("Paymaster 기본 기능", function () {
        it("Paymaster 초기화 확인", async function () {
            expect(await paymaster.entryPoint()).to.equal(entryPoint.target);
            expect(await paymaster.owner()).to.equal(owner.address);
            expect(await paymaster.getPlatformBalance()).to.equal(ethers.parseEther("10"));
        });

        it("사용자 등록 및 검증", async function () {
            // 사용자 등록
            await paymaster.addSponsoredUser(googleUser.address);
            expect(await paymaster.sponsoredUsers(googleUser.address)).to.be.true;
            
            // 검증 테스트 (공개 함수 사용)
            const cost = ethers.parseEther("0.001");
            const result = await paymaster.validatePaymasterUserOpPublic(googleUser.address, cost);
            expect(result).to.be.true;
        });

        it("스마트 계정 생성 시 자동 등록", async function () {
            // 스마트 계정 생성
            const salt = ethers.keccak256(ethers.toUtf8Bytes("test_salt"));
            await smartAccountFactory.createAccount(googleUser.address, salt);
            
            // 생성된 계정 주소 확인
            const accountAddress = await smartAccountFactory.getAccountBySalt(googleUser.address, salt);
            expect(accountAddress).to.not.equal(ethers.ZeroAddress);
            
            // Paymaster에 자동 등록되었는지 확인
            expect(await paymaster.sponsoredUsers(accountAddress)).to.be.true;
        });
    });

    describe("스마트 계정 생성", function () {
        it("CREATE2로 스마트 계정 생성", async function () {
            const salt = ethers.keccak256(ethers.toUtf8Bytes("test_salt"));
            
            // 예상 주소 계산 (CREATE2 방식)
            const predictedAddress = await smartAccountFactory.getAddress(googleUser.address, salt);
            expect(predictedAddress).to.not.equal(ethers.ZeroAddress);
            
            // 실제 계정 생성
            await smartAccountFactory.createAccount(googleUser.address, salt);
            
            // 생성된 계정 확인 (매핑에서 가져오기)
            const actualAddress = await smartAccountFactory.getAccountBySalt(googleUser.address, salt);
            expect(actualAddress).to.not.equal(ethers.ZeroAddress);
            expect(await smartAccountFactory.isAccountDeployed(googleUser.address, salt)).to.be.true;
            
            // Paymaster에 등록되었는지 확인
            expect(await paymaster.sponsoredUsers(actualAddress)).to.be.true;
        });

        it("중복 생성 방지", async function () {
            const salt = ethers.keccak256(ethers.toUtf8Bytes("test_salt"));
            
            // 첫 번째 생성
            await smartAccountFactory.createAccount(googleUser.address, salt);
            const firstAddress = await smartAccountFactory.getAccountBySalt(googleUser.address, salt);
            
            // 두 번째 생성 (같은 주소 반환)
            await smartAccountFactory.createAccount(googleUser.address, salt);
            const secondAddress = await smartAccountFactory.getAccountBySalt(googleUser.address, salt);
            
            expect(firstAddress).to.equal(secondAddress);
        });
    });

    describe("NFT 민팅", function () {
        it("직접 민팅", async function () {
            const proposalId = 1;
            const tokenURI = "https://example.com/token/1";
            const voteCount = 10;
            
            await expect(artworkNFT.mintApprovedArtwork(artist.address, proposalId, tokenURI, voteCount))
                .to.emit(artworkNFT, "ArtworkMinted");
            
            expect(await artworkNFT.ownerOf(0)).to.equal(artist.address);
            expect(await artworkNFT.tokenURI(0)).to.equal(tokenURI);
            expect(await artworkNFT.getTotalSupply()).to.equal(1);
        });

        it("스마트 계정으로 민팅", async function () {
            // 스마트 계정 생성
            const salt = ethers.keccak256(ethers.toUtf8Bytes("test_salt"));
            await smartAccountFactory.createAccount(googleUser.address, salt);
            const smartAccountAddress = await smartAccountFactory.getAccountBySalt(googleUser.address, salt);
            
            // 스마트 계정으로 민팅
            const proposalId = 999;
            const tokenURI = "https://example.com/token/999";
            const voteCount = 10;
            
            await expect(artworkNFT.mintApprovedArtwork(smartAccountAddress, proposalId, tokenURI, voteCount))
                .to.emit(artworkNFT, "ArtworkMinted");
            
            expect(await artworkNFT.ownerOf(0)).to.equal(smartAccountAddress);
            expect(await artworkNFT.tokenURI(0)).to.equal(tokenURI);
        });
    });

    describe("Paymaster 가스비 대납", function () {
        it("Paymaster 잔액 확인", async function () {
            const initialBalance = await paymaster.getPlatformBalance();
            expect(initialBalance).to.equal(ethers.parseEther("10"));
            
            // 추가 자금 예치
            await paymaster.depositFunds({ value: ethers.parseEther("5") });
            const newBalance = await paymaster.getPlatformBalance();
            expect(newBalance).to.equal(ethers.parseEther("15"));
        });

        it("최대 비용 제한 확인", async function () {
            await paymaster.addSponsoredUser(googleUser.address);
            
            // 최대 비용 이하 (성공) - 0.02 ETH 이하
            const validCost = ethers.parseEther("0.009");
            expect(await paymaster.validatePaymasterUserOpPublic(googleUser.address, validCost)).to.be.true;
            
            // 최대 비용 초과 (실패)
            const invalidCost = ethers.parseEther("0.03");
            await expect(paymaster.validatePaymasterUserOpPublic(googleUser.address, invalidCost))
                .to.be.revertedWith("Exceeds limit");
        });

        it("잔액 부족 시 실패", async function () {
            await paymaster.addSponsoredUser(googleUser.address);
            
            // 잔액보다 큰 비용 (실패)
            const highCost = ethers.parseEther("15");
            await expect(paymaster.validatePaymasterUserOpPublic(googleUser.address, highCost))
                .to.be.revertedWith("Insufficient funds");
        });
    });
});