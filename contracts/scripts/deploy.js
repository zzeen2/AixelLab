const hardhat = require("hardhat");

async function main() {
    const [deployer] = await hardhat.ethers.getSigners();
    console.log("배포자 주소:", deployer.address);
    console.log("배포자 잔액:", hardhat.ethers.formatEther(await hardhat.ethers.provider.getBalance(deployer.address)), "ETH");

    // EntryPoint 배포
    console.log("EntryPoint 배포 중...");
    const EntryPoint = await hardhat.ethers.getContractFactory("EntryPoint");
    const entryPoint = await EntryPoint.deploy();
    await entryPoint.waitForDeployment();
    const entryPointAddress = await entryPoint.getAddress();
    console.log("EntryPoint 배포됨:", entryPointAddress);

    // Paymaster 배포
    console.log("Paymaster 배포 중...");
    const Paymaster = await hardhat.ethers.getContractFactory("Paymaster");
    const paymaster = await Paymaster.deploy(entryPointAddress);
    await paymaster.waitForDeployment();
    const paymasterAddress = await paymaster.getAddress();
    console.log("Paymaster 배포됨:", paymasterAddress);

    // SmartAccountFactory 배포
    console.log("SmartAccountFactory 배포 중...");
    const SmartAccountFactory = await hardhat.ethers.getContractFactory("SmartAccountFactory");
    const smartAccountFactory = await SmartAccountFactory.deploy(entryPointAddress, paymasterAddress);
    await smartAccountFactory.waitForDeployment();
    const smartAccountFactoryAddress = await smartAccountFactory.getAddress();
    console.log("SmartAccountFactory 배포됨:", smartAccountFactoryAddress);

    // ArtworkNFT 배포
    console.log("ArtworkNFT 배포 중...");
    const ArtworkNFT = await hardhat.ethers.getContractFactory("ArtworkNFT");
    const artworkNFT = await ArtworkNFT.deploy();
    await artworkNFT.waitForDeployment();
    const artworkNFTAddress = await artworkNFT.getAddress();
    console.log("ArtworkNFT 배포됨:", artworkNFTAddress);

    // 권한 설정
    console.log("권한 설정 중...");
    await paymaster.authorizeFactory(smartAccountFactoryAddress);
    console.log("권한 설정 완료");

    // 배포 완료 정보 출력
    console.log("\n배포 완료\n");
    console.log("배포된 주소들:");
    console.log("EntryPoint:", entryPointAddress);
    console.log("Paymaster:", paymasterAddress);
    console.log("SmartAccountFactory:", smartAccountFactoryAddress);
    console.log("ArtworkNFT:", artworkNFTAddress);

    return {
        entryPoint: entryPointAddress,
        paymaster: paymasterAddress,
        smartAccountFactory: smartAccountFactoryAddress,
        artworkNFT: artworkNFTAddress
    };
}

main()
    .then((addresses) => {
        console.log("\n배포 성공!");
        process.exit(0);
    })
    .catch((error) => {
        console.error("\n배포 실패:", error);
        process.exit(1);
    });