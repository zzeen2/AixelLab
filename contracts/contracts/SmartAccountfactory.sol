// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import "./SmartAccount.sol";

contract SmartAccountFactory {
    address public immutable entryPoint;
    address public immutable paymaster;
    address public owner;

    // 생성된 계정 추적
    mapping(address => mapping(bytes32 => address)) public accounts;
    
    event AccountCreated(address indexed owner, address indexed account, bytes32 salt);

    constructor(address _entryPoint, address _paymaster) {
        entryPoint = _entryPoint;
        paymaster = _paymaster;
        owner = msg.sender;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner");
        _;
    }

    // CREATE2를 사용한 계정 생성
    function createAccount(address userEOA, bytes32 salt) external returns (address smartAccount) {
        // 이미 생성된 계정이 있는지 확인
        if (accounts[userEOA][salt] != address(0)) {
            return accounts[userEOA][salt];
        }
        
        // CREATE2로 스마트 계정 생성
        SmartAccount account = new SmartAccount{salt: salt}(userEOA, entryPoint);
        smartAccount = address(account);
        
        // 매핑에 저장
        accounts[userEOA][salt] = smartAccount;
        
        // Paymaster에 사용자 추가
        (bool success,) = paymaster.call(
            abi.encodeWithSignature("addSponsoredUser(address)", smartAccount)
        );
        require(success, "Failed to add to paymaster");

        emit AccountCreated(userEOA, smartAccount, salt);
    }

    // CREATE2 주소 미리 계산 - JavaScript 방식과 동일하게
    function getAddress(address userEOA, bytes32 salt) public view returns (address predicted) {
        // 이미 생성된 계정이 있으면 반환
        if (accounts[userEOA][salt] != address(0)) {
            return accounts[userEOA][salt];
        }
        
        // JavaScript에서 성공한 방식 그대로 구현
        // initCode = SmartAccount.bytecode + abi.encode(userEOA, entryPoint)
        bytes memory initCode = abi.encodePacked(
            type(SmartAccount).creationCode,
            abi.encode(userEOA, entryPoint)
        );
        
        // CREATE2 address = address(uint160(uint256(keccak256(
        //     abi.encodePacked(bytes1(0xff), factory, salt, keccak256(initCode))
        // ))))
        predicted = address(uint160(uint256(keccak256(
            abi.encodePacked(
                bytes1(0xff),
                address(this),
                salt,
                keccak256(initCode)
            )
        ))));
        
    }

    // 계정 조회 (userEOA와 salt로)
    function getAccountBySalt(address userEOA, bytes32 salt) external view returns (address) {
        return accounts[userEOA][salt];
    }

    // 계정 존재 여부 확인
    function isAccountDeployed(address userEOA, bytes32 salt) external view returns (bool) {
        return accounts[userEOA][salt] != address(0);
    }
}