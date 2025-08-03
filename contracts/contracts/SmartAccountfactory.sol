// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import "./SmartAccount.sol";

contract SmartAccountFactory {
    address public immutable entryPoint;
    address public immutable paymaster;
    address public owner;

    // 생성된 계정 추적
    mapping(address => address) public accounts;
    
    event AccountCreated(address indexed owner, address indexed account);

    constructor(address _entryPoint, address _paymaster) {
        entryPoint = _entryPoint;
        paymaster = _paymaster;
        owner = msg.sender;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner");
        _;
    }

    // Google 사용자용 계정 생성
    function createAccountForGoogleUser(address userEOA) external onlyOwner returns (address smartAccount) {
        require(accounts[userEOA] == address(0), "Account already exists");
        
        // 스마트 계정 생성
        smartAccount = address(new SmartAccount(userEOA, entryPoint));
        
        // 매핑 저장
        accounts[userEOA] = smartAccount;
        
        // Paymaster에 사용자 추가
        (bool success,) = paymaster.call(
            abi.encodeWithSignature("addSponsoredUser(address)", smartAccount)
        );
        require(success, "Failed to add to paymaster");

        emit AccountCreated(userEOA, smartAccount);
    }

    // EOA로 스마트 계정 조회
    function getAccount(address userEOA) external view returns (address) {
        return accounts[userEOA];
    }

    // 계정 존재 여부 확인
    function isAccountDeployed(address userEOA) external view returns (bool) {
        return accounts[userEOA] != address(0);
    }
}