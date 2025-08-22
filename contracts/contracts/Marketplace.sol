// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract Marketplace is Ownable {
    IERC721 public immutable nft;
    IERC20 public immutable payment; // AXC

    uint96 public feeBps = 250; // 2.5%
    address public feeRecipient;

    struct Listing {
        address seller;
        uint256 price; // in AXC (6 decimals)
        bool active;
    }

    mapping(uint256 => Listing) public listings;

    event Listed(uint256 indexed tokenId, address indexed seller, uint256 price);
    event Canceled(uint256 indexed tokenId, address indexed seller);
    event Bought(uint256 indexed tokenId, address indexed buyer, address indexed seller, uint256 price, uint256 fee);

    constructor(address _nft, address _payment, address _feeRecipient) Ownable(msg.sender) {
        nft = IERC721(_nft);
        payment = IERC20(_payment);
        feeRecipient = _feeRecipient;
    }

    function setFee(uint96 _bps) external onlyOwner {
        require(_bps <= 1000, "fee too high");
        feeBps = _bps;
    }

    function setFeeRecipient(address _to) external onlyOwner {
        require(_to != address(0), "zero");
        feeRecipient = _to;
    }

    function list(uint256 tokenId, uint256 price) external {
        require(price > 0, "price=0");
        require(nft.ownerOf(tokenId) == msg.sender, "not owner");
        require(nft.isApprovedForAll(msg.sender, address(this)), "not approved");
        listings[tokenId] = Listing({ seller: msg.sender, price: price, active: true });
        emit Listed(tokenId, msg.sender, price);
    }

    function cancel(uint256 tokenId) external {
        Listing memory l = listings[tokenId];
        require(l.active, "no listing");
        require(l.seller == msg.sender, "not seller");
        delete listings[tokenId];
        emit Canceled(tokenId, msg.sender);
    }

    function buy(uint256 tokenId) external {
        Listing memory l = listings[tokenId];
        require(l.active, "no listing");

        // fee and payout
        uint256 fee = (l.price * feeBps) / 10000;
        uint256 payout = l.price - fee;

        // transfers
        require(payment.transferFrom(msg.sender, l.seller, payout), "pay seller failed");
        if (fee > 0) {
            require(payment.transferFrom(msg.sender, feeRecipient, fee), "pay fee failed");
        }

        // transfer NFT last
        nft.safeTransferFrom(l.seller, msg.sender, tokenId);

        delete listings[tokenId];
        emit Bought(tokenId, msg.sender, l.seller, l.price, fee);
    }
} 