const { expect } = require("chai");
const { ethers } = require("hardhat");
const { utils } = require("ethers");
console.log(ethers.version)
describe("SmartAccount", function () {
    let smartAccount;
    let owner; // 스마트계정 만든사람
    let entryPoint; //  SmartAccount를 실행할 수 있는 특별한 컨트랙트처럼 동작할 계정
    const message = "AixelLab"; // 서명생성할때

    beforeEach(async () => {
        [owner, entryPoint, user] = await ethers.getSigners();

        const SmartAccount = await ethers.getContractFactory("SmartAccount");
        smartAccount = await SmartAccount.deploy(owner.address, entryPoint.address);
        await smartAccount.waitForDeployment();
    });

    it("entrypoint 확인", async () => {
        expect(await smartAccount.entryPoint()).to.equal(entryPoint.address);
    });

    it("이더 송금 및 잔액", async () => {
        const value = ethers.parseEther("0.1");
        await user.sendTransaction({
            to : smartAccount.target,
            value,
        })

        const balance = await smartAccount.getBalance();
        expect(balance).to.equal(value);
    })

    it("onlyEntryPoint 호출 권한 확인(modifier 동작 확인)", async ()=> {
        const target = user.address;
        const data = "0x"
        const value = 0;

        // EntryPoint가 아닌 사용자(user.address)가 호출하면 revert
        // user.address는 제 3자이므로 msg.sender가 아님 
        await expect(smartAccount.connect(user).execute(target, value, data)).to.be.revertedWith("Only entrypoint");

        //EntryPoint가 호출하면 성공하고 이벤트 발생
        await expect(smartAccount.connect(entryPoint).execute(target, value,data)).to.emit(smartAccount,"Executed");
    });
    
    it("올바른 서명 검증", async () => {
        const msgHash = ethers.hashMessage(message); // 서명데이터
        // ethers.utils.arrayify() : mshhash를 바이트 배열로 변환 > 65바이트 ECDSA 서명
        const sig = await owner.signMessage(message) // owner가 msgHash에 서명
        console.log("Message Hash:", msgHash);
        console.log("Signature:", sig);
        const result = await smartAccount.isValidSignature(msgHash, sig);
        expect(result).to.equal(true);
    })
});