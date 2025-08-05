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

    // Sepolia 테스트넷에서 실제 민팅 테스트
    describe("Sepolia Network Tests", function () {
        let deployedContract, deployer, testArtist;

        before(async function () {
            // Sepolia 네트워크에서 배포된 컨트랙트에 연결
            const ArtworkNFT = await ethers.getContractFactory("ArtworkNFT");
            deployedContract = ArtworkNFT.attach("0x0f83F6CE8479346C9376fB4dB87BD1eb18B25402");
            
            // 테스트용 계정들
            [deployer, testArtist] = await ethers.getSigners();
        });

        it("Sepolia에서 컨트랙트 소유자 확인", async function () {
            const owner = await deployedContract.owner();
            console.log("컨트랙트 소유자:", owner);
            console.log("배포자 주소:", deployer.address);
            
            // 배포자가 소유자인지 확인
            expect(owner).to.equal(deployer.address);
        });

        it("Sepolia에서 실제 민팅 테스트", async function () {
            const proposalId = 999; // 테스트용 고유 ID
            const tokenURI = "ipfs://QmTestTokenURI_999";
            const voteCount = 15;
            const artistAddress = "0x718efec4c7de3c491e23bcae0ba18e7b5b49218b"; // 실제 아티스트 주소

            console.log("민팅 시작...");
            console.log("Artist:", artistAddress);
            console.log("Proposal ID:", proposalId);
            console.log("Token URI:", tokenURI);
            console.log("Vote Count:", voteCount);

            // 민팅 실행 (배포자가 소유자이므로 배포자로 실행)
            const tx = await deployedContract.mintApprovedArtwork(
                artistAddress, 
                proposalId, 
                tokenURI, 
                voteCount
            );

            console.log("트랜잭션 해시:", tx.hash);
            
            // 트랜잭션 완료 대기
            const receipt = await tx.wait();
            console.log("트랜잭션 완료:", receipt.hash);

            // 이벤트 확인
            const mintEvent = receipt.logs.find(log => {
                try {
                    const parsed = deployedContract.interface.parseLog(log);
                    return parsed.name === 'ArtworkMinted';
                } catch {
                    return false;
                }
            });

            expect(mintEvent).to.not.be.undefined;
            console.log("민팅 이벤트 발생:", mintEvent);

            // 토큰 정보 확인
            const totalSupply = await deployedContract.getTotalSupply();
            console.log("총 토큰 수:", totalSupply.toString());

            const tokenId = totalSupply.toNumber() - 1; // 마지막 민팅된 토큰 ID
            const artworkInfo = await deployedContract.getArtworkInfo(tokenId);
            
            console.log("토큰 정보:");
            console.log("- Artist:", artworkInfo.artist);
            console.log("- Proposal ID:", artworkInfo.proposalId.toString());
            console.log("- Vote Count:", artworkInfo.voteCount.toString());
            console.log("- Minted At:", artworkInfo.mintedAt.toString());

            // 검증
            expect(artworkInfo.artist).to.equal(testArtist.address);
            expect(artworkInfo.proposalId).to.equal(proposalId);
            expect(artworkInfo.voteCount).to.equal(voteCount);
            expect(artworkInfo.mintedAt).to.be.greaterThan(0);
        });

        it("Sepolia에서 권한 확인", async function () {
            const proposalId = 1000;
            const tokenURI = "ipfs://QmTestTokenURI_1000";
            const voteCount = 20;

            // 소유자가 아닌 계정으로 민팅 시도
            const nonOwner = testArtist;
            const nonOwnerContract = deployedContract.connect(nonOwner);

            await expect(
                nonOwnerContract.mintApprovedArtwork(
                    testArtist.address, 
                    proposalId, 
                    tokenURI, 
                    voteCount
                )
            ).to.be.revertedWith("Ownable: caller is not the owner");
        });
    });
})

// 확장
// 여러 proposal로 연속 민팅 테스트
// 민팅후 실제 소유자가 올바른지
// 오너만 민팅 가능하게