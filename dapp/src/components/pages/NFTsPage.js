import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { MainTemplate } from '../templates';
import { getMintedNFTs } from '../../api/user';

// 헤더 컴포넌트
const Header = styled.div`
  padding: 24px 32px;
  background: linear-gradient(135deg, #0d1017 0%, #1a1a1a 100%);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
`;

const HeaderTitle = styled.h1`
  font-size: 32px;
  font-weight: 700;
  color: #ffffff;
  margin: 0 0 16px 0;
  background: linear-gradient(135deg, #8b5cf6, #ec4899);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
`;

const HeaderSubtitle = styled.p`
  color: rgba(255, 255, 255, 0.7);
  font-size: 16px;
  margin: 0;
  line-height: 1.5;
`;

// 검색 및 필터 섹션
const SearchSection = styled.div`
  padding: 16px 32px;
  background: rgba(255, 255, 255, 0.02);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
`;

const SearchContainer = styled.div`
  display: flex;
  gap: 12px;
  align-items: center;
  margin-bottom: 12px;
`;

const SearchInput = styled.input`
  flex: 1;
  padding: 8px 12px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  color: #ffffff;
  font-size: 13px;
  transition: all 0.2s ease;
  
  &:focus {
    outline: none;
    border-color: #8b5cf6;
    background: rgba(255, 255, 255, 0.08);
  }
  
  &::placeholder {
    color: rgba(255, 255, 255, 0.5);
  }
`;

const FilterButton = styled.button`
  padding: 8px 16px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  color: rgba(255, 255, 255, 0.8);
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 6px;
  
  &:hover {
    background: rgba(255, 255, 255, 0.1);
    border-color: rgba(255, 255, 255, 0.2);
  }
`;

const SortButton = styled(FilterButton)`
  background: ${props => props.active ? '#8b5cf6' : 'rgba(255, 255, 255, 0.05)'};
  border-color: ${props => props.active ? '#8b5cf6' : 'rgba(255, 255, 255, 0.1)'};
  color: ${props => props.active ? '#ffffff' : 'rgba(255, 255, 255, 0.8)'};
`;

const FilterRow = styled.div`
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
`;

// 메인 컨텐츠
const MainContent = styled.div`
  display: flex;
  min-height: calc(100vh - 300px);
`;

const Sidebar = styled.div`
  width: 240px;
  background: rgba(255, 255, 255, 0.02);
  border-right: 1px solid rgba(255, 255, 255, 0.1);
  padding: 16px;
`;

const SidebarSection = styled.div`
  margin-bottom: 24px;
`;

const SidebarTitle = styled.h3`
  color: #ffffff;
  font-size: 14px;
  font-weight: 600;
  margin: 0 0 12px 0;
`;

const FilterOption = styled.label`
  display: flex;
  align-items: center;
  gap: 6px;
  color: rgba(255, 255, 255, 0.7);
  font-size: 13px;
  cursor: pointer;
  padding: 6px 0;
  transition: color 0.2s ease;
  
  &:hover {
    color: rgba(255, 255, 255, 0.9);
  }
`;

const Checkbox = styled.input`
  accent-color: #8b5cf6;
`;

const PriceRange = styled.div`
  display: flex;
  gap: 8px;
  align-items: center;
`;

const PriceInput = styled.input`
  width: 80px;
  padding: 6px 8px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 6px;
  color: #ffffff;
  font-size: 11px;
  
  &:focus {
    outline: none;
    border-color: #8b5cf6;
  }
`;

const NFTGrid = styled.div`
  flex: 1;
  padding: 24px 32px;
`;

const GridHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
`;

const ResultCount = styled.span`
  color: rgba(255, 255, 255, 0.7);
  font-size: 14px;
`;

const GridContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 24px;
`;

// NFT 카드
const NFTCard = styled.div`
  position: relative;
  width: 100%;
  aspect-ratio: 1;
  border-radius: 16px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s ease;
  background: rgba(0, 0, 0, 0.3);

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 12px 40px rgba(139, 92, 246, 0.2);
  }
`;

const NFTImage = styled.div`
  width: 100%;
  height: 100%;
  background: ${props => props.imageUrl ? `url(${props.imageUrl})` : 'linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%)'};
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #ffffff;
  font-size: 48px;
`;

const NFTInfo = styled.div`
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  padding: 16px;
  background: linear-gradient(180deg, transparent 0%, rgba(0, 0, 0, 0.6) 50%, rgba(0, 0, 0, 0.8) 100%);
`;

const NFTTitle = styled.h3`
  display: none;
  color: #ffffff;
  font-size: 16px;
  font-weight: 600;
  margin: 0;
`;

const NFTMetaRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
`;

const NFTToken = styled.div`
  color: rgba(255, 255, 255, 0.9);
  font-size: 12px;
  font-weight: 600;
  display: inline-block;
`;

const NFTPrice = styled.div`
  color: #ffffff;
  font-size: 14px;
  font-weight: 700;
  text-shadow: 0 2px 6px rgba(0, 0, 0, 0.4);
`;



const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 400px;
  color: rgba(255, 255, 255, 0.7);
  font-size: 16px;
`;

const EmptyContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 400px;
  color: rgba(255, 255, 255, 0.7);
  text-align: center;
`;

const EmptyTitle = styled.h3`
  color: #ffffff;
  font-size: 20px;
  margin: 0 0 8px 0;
`;

const EmptyText = styled.p`
  color: rgba(255, 255, 255, 0.5);
  font-size: 14px;
  margin: 0;
`;

const NFTsPage = () => {
  // 실제 데이터 (빈 배열로 시작)
  const [nfts, setNfts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('recent');
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [priceRange, setPriceRange] = useState({ min: '', max: '' });
  const [filteredNFTs, setFilteredNFTs] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const categories = [
    'Art', 'Gaming', 'Music', 'Photography', 'Sports', 'Trading Cards'
  ];

  const sortOptions = [
    { value: 'recent', label: 'Recently Listed' },
    { value: 'price-low', label: 'Price: Low to High' },
    { value: 'price-high', label: 'Price: High to Low' },
    { value: 'popular', label: 'Most Popular' }
  ];

  const handleCategoryChange = (category) => {
    setSelectedCategories(prev => 
      prev.includes(category) 
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  const handleNFTClick = (nftId) => {
    navigate(`/artwork/${nftId}`);
  };

  // 실제 데이터 가져오기
  useEffect(() => {
    const fetchNFTs = async () => {
      try {
        setLoading(true);
        const response = await getMintedNFTs();
        console.log('Minted NFTs Response:', response);
        
        if (response.success && response.minted_nfts && response.minted_nfts.length > 0) {
          const nftData = response.minted_nfts.map(nft => ({
            id: nft.id,
            title: nft.title || `NFT #${nft.id}`,
            price: nft.price ? `${nft.price} ETH` : '0.1 ETH',
            image: nft.image_url || '🎨',
            creator: nft.creator,
            tokenId: nft.token_id,
            contractAddress: nft.contract_address
          }));
          setNfts(nftData);
          setFilteredNFTs(nftData);
        } else {
          console.log('No minted NFTs found');
          setNfts([]);
          setFilteredNFTs([]);
        }
      } catch (error) {
        console.error('Failed to fetch NFTs:', error);
        setNfts([]);
        setFilteredNFTs([]);
      } finally {
        setLoading(false);
      }
    };

    fetchNFTs();
  }, []);

  useEffect(() => {
    let filtered = nfts;

    // 검색 필터
    if (searchTerm) {
      filtered = filtered.filter(nft => 
        nft.title.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // 카테고리 필터
    if (selectedCategories.length > 0) {
      // 실제로는 NFT에 카테고리 정보가 있어야 함
      filtered = filtered.filter(nft => 
        selectedCategories.includes('Art') // 임시로 모든 NFT를 Art로 처리
      );
    }

    // 정렬
    switch (sortBy) {
      case 'price-low':
        filtered.sort((a, b) => parseFloat(a.price) - parseFloat(b.price));
        break;
      case 'price-high':
        filtered.sort((a, b) => parseFloat(b.price) - parseFloat(a.price));
        break;
      case 'popular':
        filtered.sort((a, b) => b.likes - a.likes);
        break;
      default:
        // 최신순 (기본값)
        break;
    }

    setFilteredNFTs(filtered);
  }, [searchTerm, sortBy, selectedCategories, priceRange]);

  return (
    <MainTemplate>
      <div>
        <Header>
          <HeaderTitle>Explore NFTs</HeaderTitle>
          <HeaderSubtitle>
            Discover, collect, and sell extraordinary NFTs on AixelLab
          </HeaderSubtitle>
        </Header>

        <SearchSection>
          <SearchContainer>
            <SearchInput
              placeholder="Search by name, creator, or collection..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <FilterButton>
              <span>🎨</span>
              Filters
            </FilterButton>
          </SearchContainer>
          
          <FilterRow>
            {sortOptions.map(option => (
              <SortButton
                key={option.value}
                active={sortBy === option.value}
                onClick={() => setSortBy(option.value)}
              >
                {option.label}
              </SortButton>
            ))}
          </FilterRow>
        </SearchSection>

        <MainContent>
          <Sidebar>
            <SidebarSection>
              <SidebarTitle>Categories</SidebarTitle>
                          {categories.map(category => (
              <FilterOption key={category}>
                <Checkbox
                  type="checkbox"
                  checked={selectedCategories.includes(category)}
                  onChange={() => handleCategoryChange(category)}
                  disabled
                />
                {category}
              </FilterOption>
            ))}
            </SidebarSection>

            <SidebarSection>
              <SidebarTitle>Price Range</SidebarTitle>
              <PriceRange>
                <PriceInput
                  placeholder="Min"
                  value={priceRange.min}
                  onChange={(e) => setPriceRange(prev => ({ ...prev, min: e.target.value }))}
                />
                <span style={{ color: 'rgba(255, 255, 255, 0.5)' }}>to</span>
                <PriceInput
                  placeholder="Max"
                  value={priceRange.max}
                  onChange={(e) => setPriceRange(prev => ({ ...prev, max: e.target.value }))}
                />
              </PriceRange>
            </SidebarSection>


          </Sidebar>

          <NFTGrid>
            <GridHeader>
              <ResultCount>{filteredNFTs.length} items</ResultCount>
            </GridHeader>
            
            {loading ? (
              <LoadingContainer>
                Loading NFTs...
              </LoadingContainer>
            ) : filteredNFTs.length === 0 ? (
              <EmptyContainer>
                <EmptyTitle>No NFTs found</EmptyTitle>
                <EmptyText>
                  {nfts.length === 0 
                    ? "No NFTs have been minted yet. Check back later!"
                    : "No NFTs match your current filters."
                  }
                </EmptyText>
              </EmptyContainer>
            ) : (
              <GridContainer>
                {filteredNFTs.map(nft => (
                                  <NFTCard key={nft.id} onClick={() => handleNFTClick(nft.id)}>
                  <NFTImage imageUrl={nft.image.startsWith('http') ? nft.image : null}>
                    {!nft.image.startsWith('http') && nft.image}
                  </NFTImage>
                  <NFTInfo>
                    <NFTTitle>{nft.title}</NFTTitle>
                    <NFTMetaRow>
                      <NFTToken>#{nft.tokenId ?? 'N/A'}</NFTToken>
                      <NFTPrice>{nft.price}</NFTPrice>
                    </NFTMetaRow>
                  </NFTInfo>
                  </NFTCard>
                ))}
              </GridContainer>
            )}
          </NFTGrid>
        </MainContent>
      </div>
    </MainTemplate>
  );
};

export default NFTsPage; 