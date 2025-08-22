// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Permit.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";

contract AixelCredit is ERC20Permit, AccessControl {
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE"); // 이 역할을 가진 계정만 토큰발행 가능 

    constructor() ERC20("Aixel Credit", "AXC") ERC20Permit("Aixel Credit") {
        // DEFAULT_ADMIN_ROLE, msg.sender에게 MINTER_ROLE 역할 부여
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(MINTER_ROLE, msg.sender);
    }

    function decimals() public pure override returns (uint8) {
        return 6; // 토큰 소숫점 자릿수 6으로 고정
    }

    function mint(address to, uint256 amount) external onlyRole(MINTER_ROLE) {
        _mint(to, amount); // MINTER_ROLE을 가진 계정만 특정주소로 특정량의 토큰 발행 허용
    }
} 