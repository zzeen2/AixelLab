// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

contract SmartAccount {
    address public owner;  
    address public entryPoint;
    
    event Executed(address indexed target, uint value, bytes data);
    event ExecutionFailed(address indexed target, uint value, bytes data, string reason);

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
        (bool success, bytes memory returnData) = to.call{value: value}(data);
        if (!success) {
            // Return the revert reason if available
            if (returnData.length > 0) {
                assembly {
                    let returnDataSize := mload(returnData)
                    revert(add(32, returnData), returnDataSize)
                }
            } else {
                revert("Execution failed");
            }
        }
        emit Executed(to, value, data);
    }

    // 배치 실행
    function executeBatch(address[] calldata targets, uint[] calldata values, bytes[] calldata datas) external onlyEntryPoint {
        require(targets.length == values.length && values.length == datas.length, "Array length mismatch");
        
        for (uint i = 0; i < targets.length; i++) {
            (bool success, bytes memory returnData) = targets[i].call{value: values[i]}(datas[i]);
            if (!success) {
                string memory reason = "Unknown error";
                if (returnData.length > 0) {
                    assembly {
                        let returnDataSize := mload(returnData)
                        reason := add(32, returnData)
                    }
                }
                emit ExecutionFailed(targets[i], values[i], datas[i], reason);
                revert(string(abi.encodePacked("Batch execution failed at index ", i, ": ", reason)));
            }
            emit Executed(targets[i], values[i], datas[i]);
        }
    }

    // 서명 검증 // useroperation의 서명이 유효한지 확인할 때
    function isValidSignature(bytes32 _hash, bytes calldata sig) external view returns (bool) {
        // EntryPoint에서 이미 ethSignedMessageHash로 전달되므로 그대로 사용
        address recovered = _recoverSigner(_hash, sig);
        return recovered == owner;
    }

    // 서명 복원 - ethSignedMessageHash를 직접 사용
    function _recoverSigner(bytes32 _ethSignedHash, bytes memory sig) internal pure returns (address) {
        (bytes32 r, bytes32 s, uint8 v) = _splitSignature(sig);
        return ecrecover(_ethSignedHash, v, r, s);
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