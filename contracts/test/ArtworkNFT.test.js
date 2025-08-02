const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("ArtworkNFT", function () {
    let nftContract, owner, artist

    // test init
    beforeEach(async function () {
        [owner, artist] = await ethers.getSigners();
        const ArtworkNFT = await ethers.getContractFactory("ArtworkNFT");
        nftContract = await ArtworkNFT.deploy();
        await nftContract.waitForDeployment();
    })

    it("승인된 작품 민팅", async function () {
        const proposalId = 1; 
        const tokenURI = "https://ipfs.tech/developers/";
        const voteCount = 10;

        await expect(nftContract.mintApprovedArtwork(artist.address, proposalId, tokenURI, voteCount))
        .to.emit(nftContract, "ArtworkMinted")

        const info = await nftContract.getArtworkInfo(0);
        expect(info.artist).to.equal(artist.address);
        expect(info.proposalId).to.equal(proposalId);
        expect(info.voteCount).to.equal(voteCount);
        expect(info.mintedAt).to.be.greaterThan(0); // 0이상의 값이 있는지 확인
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
})

// 확장
// 여러 proposal로 연속 민팅 테스트
// 민팅후 실제 소유자가 올바른지
// 오너만 민팅 가능하게