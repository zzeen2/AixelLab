// SPDX-License-Identifier: MIT
pragma solidity 0.8.30;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "hardhat/console.sol";

contract ArtworkNFT is ERC721URIStorage, Ownable{
    constructor () ERC721("AixelLab Artwork", "AIXEL") Ownable(msg.sender) {}
        
    uint private tokenId;

    // 제안 ID 별로 민팅상태 추적
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

    // 승인된 작품 민팅 > 백엔드에서 조건 만족시 민팅
    function mintApprovedArtwork(address artist, uint256 proposalId, string memory _tokenURI, uint voteCount) external onlyOwner returns (uint) { 
        require(!proposalMinted[proposalId]);
        require(artist != address(0));
        require(bytes(_tokenURI).length > 0);

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