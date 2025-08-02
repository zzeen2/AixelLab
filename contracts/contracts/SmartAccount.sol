// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

contract SmartAccount {
    address private owner; 
    address public entryPoint;
    
    event Executed (address indexed target, uint value, bytes data);

    // 스마트 계정 생성자
    constructor(address _owner, address _entryPoint) {
        owner = _owner;
        entryPoint = _entryPoint;
    }

    // entrypoint만 호출 가능하도록 제한
    modifier onlyEntryPoint () {
        require(msg.sender == entryPoint, "Only entrypoint");
        _;
    }

    // 소유자만 호출 가능
    modifier onlyOwner () {
        require(msg.sender == owner, "Only owner");
        _;
    }
    // nft 민팅
    function execute(address to, uint value, bytes calldata data) external onlyEntryPoint {
        (bool success,) = to.call{value : value}(data);
        require(success, "Execution failed");

        emit Executed(to, value, data);
    }

    // 서명 검증 // useroperation의 서명이 유효한지 확인할 때
    function isValidSignature(bytes32 _hash, bytes calldata sig) external view returns (bool) {
        address recovered = _recoverSigner(_hash, sig);
        return recovered == owner;
    }

    // 서명 복원
    function _recoverSigner(bytes32 _hash, bytes memory sig) internal pure returns (address) {
        (bytes32 r, bytes32 s, uint8 v) = _splitSign(sig);
        return ecrecover(_hash, v, r, s);
    }

    function _splitSign(bytes memory sig) internal pure returns (bytes32 r, bytes32 s, uint8 v) {
        require(sig.length == 65, "Invalid signature length");
        assembly {
            r := mload(add(sig, 32))     
            s := mload(add(sig, 64))
            v := byte(0, mload(add(sig, 96))) 
        }
    }
    
    receive() external payable {}

    function getBalance() external view returns (uint256) {
        return address(this).balance; // 스마트 계정이 가지고있는 이더 잔액 
    }
}