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

    describe("구글사용자 플로우", function () {
        it("스마트 계정 생성", async function () {
            // 스마트 계정 생성
            await expect(smartAccountFactory.createAccountForGoogleUser(googleUser.address)).to.emit(smartAccountFactory, "AccountCreated");
            
            // 생성된 계정 확인
            const accountAddress = await smartAccountFactory.getAccount(googleUser.address);
            expect(accountAddress).to.not.equal(ethers.ZeroAddress);

            // 계정이 실제로 배포되었는지 확인
            expect(await smartAccountFactory.isAccountDeployed(googleUser.address)).to.be.true;
            
            // Paymaster에 등록되었는지 확인
            expect(await paymaster.sponsoredUsers(accountAddress)).to.be.true;
        });

        it("NFT 민팅", async function () {
            // NFT 민팅
            const proposalId = 1;
            const tokenURI = "https://";
            const voteCount = 10;
            
            await expect(artworkNFT.mintApprovedArtwork(artist.address, proposalId, tokenURI, voteCount)).to.emit(artworkNFT, "ArtworkMinted");
            
            expect(await artworkNFT.ownerOf(0)).to.equal(artist.address);
            expect(await artworkNFT.tokenURI(0)).to.equal(tokenURI);
            expect(await artworkNFT.getTotalSupply()).to.equal(1);
        });

        it("Paymaster 검증", async function () {
            // 사용자 등록
            await paymaster.addSponsoredUser(googleUser.address);
            
            // 검증 테스트
            const cost = ethers.parseEther("0.001");
            const result = await paymaster.validatePaymasterUserOpPublic(googleUser.address, cost);
            expect(result).to.be.true;
        });

        it("계정 생성 > NFT 민팅", async function () {
            // 구글 사용자 계정 생성
            await smartAccountFactory.createAccountForGoogleUser(googleUser.address);
            const smartAccount = await smartAccountFactory.getAccount(googleUser.address);
            
            // NFT 민팅(스마트 계정으로)
            const proposalId = 999;
            const tokenURI = "https://";
            const voteCount = 10;
            
            await expect(artworkNFT.mintApprovedArtwork(smartAccount, proposalId, tokenURI, voteCount)).to.emit(artworkNFT, "ArtworkMinted");
            
            // 확인
            expect(await artworkNFT.ownerOf(0)).to.equal(smartAccount);
            expect(await artworkNFT.tokenURI(0)).to.equal(tokenURI);
        });
    });
});