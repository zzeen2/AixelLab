// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

contract SmartAccount {
    address private owner; 
    address public entryPoint;
    
    event Executed(address indexed target, uint value, bytes data);

    // 스마트 계정 생성자
    constructor(address _owner, address _entryPoint) {
        owner = _owner;
        entryPoint = _entryPoint;
    }

    // entrypoint만 호출 가능하도록 제한
    modifier onlyEntryPoint() {
        require(msg.sender == entryPoint, "Only entrypoint");
        _;
    }

    // 소유자만 호출 가능
    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner");
        _;
    }

    // nft 민팅
    function execute(address to, uint value, bytes calldata data) external onlyEntryPoint {
        (bool success,) = to.call{value: value}(data);
        require(success, "Execution failed");
        emit Executed(to, value, data);
    }

    // 배치 실행
    function executeBatch(address[] calldata targets, uint[] calldata values, bytes[] calldata datas) external onlyEntryPoint {
        require(targets.length == values.length && values.length == datas.length, "Array length mismatch");
        
        for (uint i = 0; i < targets.length; i++) {
            (bool success,) = targets[i].call{value: values[i]}(datas[i]);
            require(success, "Batch execution failed");
            emit Executed(targets[i], values[i], datas[i]);
        }
    }

    // 서명 검증 // useroperation의 서명이 유효한지 확인할 때
    function isValidSignature(bytes32 _hash, bytes calldata sig) external view returns (bool) {
        address recovered = _recoverSigner(_hash, sig);
        return recovered == owner;
    }

    // 서명 복원
    function _recoverSigner(bytes32 _hash, bytes memory sig) internal pure retu  (address) {
        (bytes32 r, bytes32 s, uint8 v) = _splitSignature(sig);
        return ecrecover(_hash, v, r, s);
    }

    function _splitSignature(bytes memory sig) internal pure returns (bytes32 r, bytes32 s, uint8 v) {
        require(sig.length == 65, "Invalid signature length");
        assembly {
            r := mload(add(sig, 32))     
            s := mload(add(sig, 64))
            v := byte(0, mload(add(sig, 96))) 
        }
    }

    // 소유자 변경
    function changeOwner(address newOwner) external onlyOwner {
        require(newOwner != address(0), "Invalid new owner");
        owner = newOwner;
    }

    function getBalance() external view returns (uint256) {
        return address(this).balance; // 스마트 계정이 가지고있는 이더 잔액 
    }

    // ERC721 토큰 수신 가능하도록 설정
    function onERC721Received(
        address operator,
        address from,
        uint256 tokenId,
        bytes calldata data
    ) external pure returns (bytes4) {
        return this.onERC721Received.selector;
    }
    
    receive() external payable {}
}