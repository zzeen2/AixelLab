const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("ArtworkNFT", function () {
    let nftContract, admin, artist, other

    // test init
    beforeEach(async function () {
        [admin, artist, other] = await ethers.getSigners();
        const ArtworkNFT = await ethers.getContractFactory("ArtworkNFT");
        nftContract = await ArtworkNFT.deploy();
        await nftContract.waitForDeployment();
    })

    it("승인된 작품 민팅", async function () {
        const proposalId = 1; 
        const tokenURI = "https://ipfs.tech/developers/";
        const voteCount = 10;

        // 기본 배포자는 DEFAULT_ADMIN_ROLE & MINTER_ROLE 보유
        await expect(nftContract.mintApprovedArtwork(artist.address, proposalId, tokenURI, voteCount))
            .to.emit(nftContract, "ArtworkMinted")

        const info = await nftContract.getArtworkInfo(0);
        expect(info.artist).to.equal(artist.address);
        expect(info.proposalId).to.equal(proposalId);
        expect(info.voteCount).to.equal(voteCount);
        expect(info.mintedAt).to.be.greaterThan(0);
    })

    it("이미 민팅된 proposalId는 다시 민팅불가", async function () {
        const proposalId = 1; 
        const tokenURI = "https://ipfs.tech/developers/";
        const voteCount = 10;

        await nftContract.mintApprovedArtwork(artist.address, proposalId, tokenURI, voteCount);

        await expect( nftContract.mintApprovedArtwork(artist.address, proposalId, tokenURI, voteCount)).to.be.revertedWith("Already minted");
    })
    
    it("잘못된 작품 제출자의 주소는 에러", async function() {
        const proposalId = 1; 
        const tokenURI = "https://ipfs.tech/developers/";
        const voteCount = 10;

        await expect(nftContract.mintApprovedArtwork("0x0000000000000000000000000000000000000000", proposalId, tokenURI, voteCount)).to.be.revertedWith("Invalid artist");
    });

    it("tokenURI 빈값이면 에러", async function () {
        const proposalId = 1; 
        const tokenURI = "";
        const voteCount = 10;

        await expect(nftContract.mintApprovedArtwork(artist.address, proposalId, tokenURI, voteCount)).to.be.revertedWith("Empty URI");
    })

    it("MINTER_ROLE 없는 계정은 민팅 불가", async function () {
        const proposalId = 2; 
        const tokenURI = "ipfs://QmTest";
        const voteCount = 5;

        const minterRole = await nftContract.MINTER_ROLE();
        // other 계정으로 시도 → revert
        const connected = nftContract.connect(other);
        await expect(
            connected.mintApprovedArtwork(artist.address, proposalId, tokenURI, voteCount)
        ).to.be.reverted; // AccessControl revert

        // admin이 other에 권한 부여 후 성공
        await nftContract.grantMinter(await other.getAddress());
        await expect(connected.mintApprovedArtwork(artist.address, proposalId, tokenURI, voteCount))
            .to.emit(nftContract, "ArtworkMinted");
    })

    it("getTotalSupply로 총량 확인", async function () {
        const tokenURI = "ipfs://QmTest";
        await nftContract.mintApprovedArtwork(artist.address, 1, tokenURI, 1);
        await nftContract.mintApprovedArtwork(artist.address, 2, tokenURI, 2);
        const total = await nftContract.getTotalSupply();
        expect(total).to.equal(2);
    })

    // Sepolia 네트워크 테스트는 AccessControl로 변경됨에 따라 owner() 검사는 제거하거나 ADMIN_ROLE 검사로 대체 필요
});