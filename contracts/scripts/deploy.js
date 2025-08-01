const hardhat = require("hardhat");

async function test () {
    const [deployer] = await hardhat.ethers.getSigners(); // 테스트 계정 10개 불러오기 // 그중에 첫번째 구조분해할당(배포주소)
    // console.log(deployer) 
    console.log("배포자 주소", deployer.address);

    const ArtworkNFT = await hardhat.ethers.getContractFactory("ArtworkNFT"); //ABI와 바이트코드를 기반으로 배포준비
    // console.log("ArtworkNFT", ArtworkNFT);
    const artworkNFT = await ArtworkNFT.deploy(); // 컨트랙트를 블록체인에 배포하는 트랜잭션 생성히고 배포
    await artworkNFT.waitForDeployment();
    console.log("ArtworkNFT 배포된 주소", await artworkNFT.getAddress());
}

test().catch((error) => console.log(error))