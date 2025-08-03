// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

contract Paymaster {
    address public immutable entryPoint;
    address public immutable owner;
    uint256 public platformFunds; // 가스 대납용 자금
    uint256 constant MAX_COST = 0.005 ether; // 트랜잭션 최대 가스비
    
    // 사용자 관리
    mapping(address => bool) public sponsoredUsers;
    mapping(address => bool) public authorizedFactories;
    
    event FundsDeposited(uint256 amount);
    event UserAdded(address indexed user);
    
    constructor(address _entryPoint) {
        entryPoint = _entryPoint;
        owner = msg.sender;
    }
    
    modifier onlyEntryPoint() {
        require(msg.sender == entryPoint, "Only EntryPoint");
        _;
    }
    
    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner");
        _;
    }
    
    modifier onlyOwnerOrFactory() {
        require(msg.sender == owner || authorizedFactories[msg.sender], "Only owner or factory");
        _;
    }
    
    // 자금 예치
    function depositFunds() external payable onlyOwner {
        platformFunds += msg.value;
        emit FundsDeposited(msg.value);
    }
    
    // 팩토리 승인
    function authorizeFactory(address factory) external onlyOwner {
        authorizedFactories[factory] = true;
    }
    
    // 사용자 추가
    function addSponsoredUser(address user) external onlyOwnerOrFactory {
        sponsoredUsers[user] = true;
        emit UserAdded(user);
    }
    
    // EntryPoint용 검증 함수
    function validatePaymasterUserOp(address account, uint256 maxCost) external view onlyEntryPoint returns(bool) {
        require(sponsoredUsers[account], "User not sponsored");
        require(platformFunds >= maxCost, "Insufficient funds");
        require(maxCost <= MAX_COST, "Exceeds limit");
        return true;
    }
    
    // 테스트용 공개 검증 함수
    function validatePaymasterUserOpPublic(address account, uint256 maxCost) external view returns(bool) {
        require(sponsoredUsers[account], "User not sponsored");
        require(platformFunds >= maxCost, "Insufficient funds");
        require(maxCost <= MAX_COST, "Exceeds limit");
        return true;
    }
    
    // 잔액 확인
    function getPlatformBalance() external view returns (uint256) {
        return platformFunds;
    }
    
    receive() external payable {
        platformFunds += msg.value;
    }
}