const hardhat = require("hardhat");

async function main() {
  const { ethers } = hardhat;
  const [deployer] = await ethers.getSigners();

  console.log("배포자:", deployer.address);

  const nftAddress = process.env.ARTWORK_NFT_ADDRESS;
  if (!nftAddress) throw new Error("ARTWORK_NFT_ADDRESS env가 필요합니다");

  const feeRecipient = process.env.MARKET_FEE_RECIPIENT || deployer.address;

  console.log("ArtworkNFT:", nftAddress);
  console.log("수수료 수령자:", feeRecipient);

  // AXC 배포
  console.log("AixelCredit(AXC) 배포 중...");
  const AXC = await ethers.getContractFactory("AixelCredit");
  const axc = await AXC.deploy();
  await axc.waitForDeployment();
  const axcAddress = await axc.getAddress();
  console.log("AXC 배포됨:", axcAddress);

  // Marketplace 배포
  console.log("Marketplace 배포 중...");
  const Market = await ethers.getContractFactory("Marketplace");
  const market = await Market.deploy(nftAddress, axcAddress, feeRecipient);
  await market.waitForDeployment();
  const marketAddress = await market.getAddress();
  console.log("Marketplace 배포됨:", marketAddress);

  // 결과 출력
  console.log("\n배포 완료");
  console.log("AXC_ADDRESS=", axcAddress);
  console.log("MARKETPLACE_ADDRESS=", marketAddress);
}

main().then(()=>process.exit(0)).catch((e)=>{console.error(e);process.exit(1);}); 