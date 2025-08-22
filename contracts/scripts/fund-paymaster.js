const hardhat = require("hardhat");

async function main() {
    const [deployer] = await hardhat.ethers.getSigners();
    console.log("배포자 주소:", deployer.address);
    console.log("배포자 잔액:", hardhat.ethers.formatEther(await hardhat.ethers.provider.getBalance(deployer.address)), "ETH");

    // Paymaster 주소 (배포된 주소)
    const paymasterAddress = "0x1D3B3097BE7F9b3EcE90F00F0956b9cB794f0a0A";
    
    // Paymaster 컨트랙트 인스턴스 생성
    const Paymaster = await hardhat.ethers.getContractFactory("Paymaster");
    const paymaster = Paymaster.attach(paymasterAddress);

    // 예치할 금액 (0.1 ETH)
    const depositAmount = hardhat.ethers.parseEther("0.1");
    
    console.log("Paymaster에 자금 예치 중...");
    console.log("예치 금액:", hardhat.ethers.formatEther(depositAmount), "ETH");
    
    // 자금 예치
    const tx = await paymaster.depositFunds({ value: depositAmount });
    await tx.wait();
    
    console.log("자금 예치 완료!");
    
    // 잔액 확인
    const balance = await paymaster.getPlatformBalance();
    console.log("Paymaster 잔액:", hardhat.ethers.formatEther(balance), "ETH");
}

main()
    .then(() => {
        console.log("자금 예치 성공!");
        process.exit(0);
    })
    .catch((error) => {
        console.error("자금 예치 실패:", error);
        process.exit(1);
    }); 