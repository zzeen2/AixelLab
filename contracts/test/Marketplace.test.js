const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Marketplace MVP", function () {
  let admin, seller, buyer, feeReceiver;
  let nft, axc, market;

  beforeEach(async function () {
    [admin, seller, buyer, feeReceiver] = await ethers.getSigners();

    // ArtworkNFT 배포 및 토큰 민팅
    const ArtworkNFT = await ethers.getContractFactory("ArtworkNFT");
    nft = await ArtworkNFT.deploy();
    await nft.waitForDeployment();

    await nft.grantMinter(await admin.getAddress());
    await nft.mintApprovedArtwork(await seller.getAddress(), 1, "ipfs://token", 10);

    // AXC 배포 및 초기 지급
    const AixelCredit = await ethers.getContractFactory("AixelCredit");
    axc = await AixelCredit.deploy();
    await axc.waitForDeployment();

    const hundred = ethers.parseUnits("100", 6);
    await axc.mint(await buyer.getAddress(), hundred);

    // Marketplace 배포
    const Marketplace = await ethers.getContractFactory("Marketplace");
    market = await Marketplace.deploy(await nft.getAddress(), await axc.getAddress(), await feeReceiver.getAddress());
    await market.waitForDeployment();
  });

  it("리스트 후 구매하면 오너 이전 및 수수료/정산 발생", async function () {
    const tokenId = 0;
    const price = ethers.parseUnits("10", 6);

    // 판매자 승인 및 리스트
    await nft.connect(seller).setApprovalForAll(await market.getAddress(), true);
    await expect(market.connect(seller).list(tokenId, price))
      .to.emit(market, "Listed").withArgs(tokenId, await seller.getAddress(), price);

    // 구매자 승인 (테스트에선 무제한)
    await axc.connect(buyer).approve(await market.getAddress(), ethers.MaxUint256);

    const balSellerBefore = await axc.balanceOf(await seller.getAddress());
    const balFeeBefore = await axc.balanceOf(await feeReceiver.getAddress());

    // 구매
    await expect(market.connect(buyer).buy(tokenId))
      .to.emit(market, "Bought");

    // 소유권 이전
    expect(await nft.ownerOf(tokenId)).to.equal(await buyer.getAddress());

    // 정산 검증
    const feeBps = await market.feeBps();
    const fee = (price * feeBps) / BigInt(10000);
    const payout = price - fee;

    const balSellerAfter = await axc.balanceOf(await seller.getAddress());
    const balFeeAfter = await axc.balanceOf(await feeReceiver.getAddress());

    expect(balSellerAfter - balSellerBefore).to.equal(payout);
    expect(balFeeAfter - balFeeBefore).to.equal(fee);
  });

  it("판매자만 취소 가능", async function () {
    const tokenId = 0;
    const price = ethers.parseUnits("5", 6);

    await nft.connect(seller).setApprovalForAll(await market.getAddress(), true);
    await market.connect(seller).list(tokenId, price);

    await expect(market.connect(buyer).cancel(tokenId)).to.be.revertedWith("not seller");
    await expect(market.connect(seller).cancel(tokenId)).to.emit(market, "Canceled");
  });

  it("승인 없이 리스트 불가", async function () {
    const tokenId = 0;
    const price = ethers.parseUnits("5", 6);
    await expect(market.connect(seller).list(tokenId, price)).to.be.revertedWith("not approved");
  });
}); 