// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";

contract ArtworkNFT is ERC721URIStorage, AccessControl {
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");

    constructor () ERC721("AixelLab Artwork", "AIXEL") {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(MINTER_ROLE, msg.sender);
    }
        
    uint private tokenId;

    // 제안id 별로 민팅상태 추적
    mapping(uint256 => bool) public proposalMinted;

    // 작품 정보
    mapping(uint256 => ArtworkInfo) public artworks;

    struct ArtworkInfo {
        address artist;
        uint256 proposalId;
        uint256 voteCount;
        uint256 mintedAt;
    }

    event ArtworkMinted( uint256 indexed tokenId, address indexed artist, uint256 indexed proposalId,string tokenURI, uint256 voteCount );

    // 승인된 작품 민팅 > 승인된 계정만 민팅 가능
    function mintApprovedArtwork(address artist, uint256 proposalId, string memory _tokenURI, uint voteCount) external onlyRole(MINTER_ROLE) returns (uint) { 
        require(!proposalMinted[proposalId], "Already minted");
        require(artist != address(0), "Invalid artist");
        require(bytes(_tokenURI).length > 0, "Empty URI");

        uint _nextTokenId = tokenId;

        // 민팅
        _safeMint(artist, _nextTokenId);
        
        _setTokenURI(_nextTokenId, _tokenURI);

        // 작품 정보 저장
        artworks[_nextTokenId] = ArtworkInfo({
            artist: artist,
            proposalId : proposalId,
            voteCount : voteCount,
            mintedAt : block.timestamp
        });

        proposalMinted[proposalId] = true;
        tokenId++;
        
        emit ArtworkMinted(_nextTokenId, artist, proposalId, _tokenURI, voteCount);
        
        return _nextTokenId;
    }

    // 어드민이 MINTER 권한을 부여/회수할 수 있게 도우미 제공
    function grantMinter(address account) external onlyRole(DEFAULT_ADMIN_ROLE) {
        _grantRole(MINTER_ROLE, account);
    }

    function revokeMinter(address account) external onlyRole(DEFAULT_ADMIN_ROLE) {
        _revokeRole(MINTER_ROLE, account);
    }

    // 다중 상속 지원 인터페이스 처리
    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721URIStorage, AccessControl)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }

    // 작품 정보 조회
    function getArtworkInfo(uint _tokenId) external view returns(ArtworkInfo memory) {
        require(ownerOf(_tokenId) != address(0), "Token not exist");
        return artworks[_tokenId];
    }
    
    // 총 공급량 조회
    function getTotalSupply() external view returns(uint) {
        return tokenId;
    }
}