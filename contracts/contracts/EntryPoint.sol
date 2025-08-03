// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import "./SmartAccount.sol";

contract EntryPoint {
    struct UserOperation {
        address sender;
        uint nonce;
        bytes initCode; 
        bytes callData;
        uint callGasLimit;
        uint verificationGasLimit;
        uint preverificationGas;
        uint maxFeePerGas;
        uint maxPriorityFeePerGas;
        bytes paymasterAndData;
        bytes signature;
    }
    
    // 각 sender의 nonce
    mapping(address => uint) public nonces;

    // UserOp 처리
    function handleOps(UserOperation[] calldata ops) external {
        for (uint i = 0; i < ops.length; i++) {
            UserOperation calldata op = ops[i];
            
            // nonce 검증
            require(op.nonce == nonces[op.sender], "Invalid nonce");

            // Paymaster 검증 (있는 경우)
            if (op.paymasterAndData.length >= 20) {
                address paymaster = address(bytes20(op.paymasterAndData[:20]));
                uint maxCost = op.callGasLimit * op.maxFeePerGas;
                (bool success,) = paymaster.call(
                    abi.encodeWithSignature("validatePaymasterUserOp(address,uint256)", op.sender, maxCost)
                );
                require(success, "Paymaster failed");
            }

            // 서명 검증
            bytes32 userOpHash = _getUserOpHash(op);
            bytes32 ethSignHash = _toEthSignedMessageHash(userOpHash);
            (bool sigSuccess,) = op.sender.call(
                abi.encodeWithSignature("isValidSignature(bytes32,bytes)", ethSignHash, op.signature)
            );
            require(sigSuccess, "Invalid signature");

            // 실행
            (bool execSuccess,) = op.sender.call{gas: op.callGasLimit}(op.callData);
            if (execSuccess) {
                nonces[op.sender]++;
            }
        }
    }

    // nonce 조회
    function getNonce(address sender) public view returns (uint256) {
        return nonces[sender];
    }

    // UserOp 해시 생성
    function _getUserOpHash(UserOperation calldata op) internal pure returns (bytes32) {
        return keccak256(abi.encode(
            op.sender,
            op.nonce,
            keccak256(op.initCode),
            keccak256(op.callData),
            op.callGasLimit,
            op.verificationGasLimit,
            op.preverificationGas,
            op.maxFeePerGas,
            op.maxPriorityFeePerGas,
            keccak256(op.paymasterAndData),
            keccak256(op.signature)
        ));
    }

    function _toEthSignedMessageHash(bytes32 hash) internal pure returns (bytes32) {
        return keccak256(abi.encodePacked("\x19Ethereum Signed Message:\n32", hash));
    }

    // 테스트용
    function getUserOpHash(UserOperation calldata op) external pure returns (bytes32) {
        return _getUserOpHash(op);
    }

    function toEthSignedMessageHash(bytes32 hash) external pure returns (bytes32) {
        return _toEthSignedMessageHash(hash);
    }
}