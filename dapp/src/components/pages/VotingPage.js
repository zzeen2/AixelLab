import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import MainTemplate from '../templates/MainTemplate';
import { getVotes } from '../../api/voting';

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

const VoteGrid = styled.div`
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

// Voting 카드 스타일 (기존 스타일 유지)
const VoteCard = styled.div`
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

const VoteImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
`;

const VoteOverlay = styled.div`
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: linear-gradient(180deg, transparent 0%, rgba(0, 0, 0, 0.6) 50%, rgba(0, 0, 0, 0.8) 100%);
  padding: 16px;
  color: #ffffff;
`;

const VoteHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 8px;
`;

const VoteTitle = styled.h3`
  font-size: 18px;
  font-weight: 600;
  color: #ffffff;
  margin: 0;
  line-height: 1.3;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
`;

const VoteDescription = styled.p`
  font-size: 12px;
  color: rgba(255, 255, 255, 0.8);
  margin: 0 0 12px 0;
  line-height: 1.4;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
`;

const VoteStats = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const VoteStatsLeft = styled.div`
  display: flex;
  gap: 12px;
`;

const VoteStat = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  color: rgba(255, 255, 255, 0.8);
`;

const VoteStatIcon = styled.span`
  font-size: 14px;
`;

const VoteStatNumber = styled.span`
  font-size: 14px;
  font-weight: 600;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
`;

const DdayBadge = styled.div`
  color: rgba(255, 255, 255, 0.7);
  font-size: 12px;
  font-weight: 500;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
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

const VotingPage = () => {
  const navigate = useNavigate();
  const [votes, setVotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('recent');
  const [filteredVotes, setFilteredVotes] = useState([]);

  const sortOptions = [
    { value: 'recent', label: 'Recently Listed' },
    { value: 'votes-high', label: 'Most Votes' },
    { value: 'votes-low', label: 'Least Votes' },
    { value: 'ending-soon', label: 'Ending Soon' }
  ];

  useEffect(() => {
    loadVotes();
  }, []);

  const loadVotes = async () => {
    try {
      const response = await getVotes();
      console.log("API Response:", response);
      
      if (response && Array.isArray(response)) {
        console.log("Votes length:", response.length);
        
        const formattedVotes = response.map(proposal => {
          const votesFor = proposal.votes ? proposal.votes.filter(v => v.vote_type === 'for').length : 0;
          const votesAgainst = proposal.votes ? proposal.votes.filter(v => v.vote_type === 'against').length : 0;
          
          return {
            id: proposal.id,
            title: proposal.artwork?.title || 'Untitled',
            description: proposal.artwork?.description || '',
            imageUrl: proposal.artwork?.image_ipfs_uri || '',
            status: proposal.status,
            votesFor,
            votesAgainst,
            totalVotes: votesFor + votesAgainst,
            nftMinted: proposal.nft_minted,
            tokenId: proposal.nft_token_id,
            transactionHash: proposal.nft_transaction_hash,
            mintedAt: proposal.minted_at,
          };
        });
        
        setVotes(formattedVotes);
        setFilteredVotes(formattedVotes);
      } else {
        console.error('Unexpected response structure:', response);
        setVotes([]);
        setFilteredVotes([]);
      }
    } catch (error) {
      console.error('Failed to load votes:', error);
      setVotes([]);
      setFilteredVotes([]);
    } finally {
      setLoading(false);
    }
  };

  const handleVoteClick = (voteId) => {
    navigate(`/voting/${voteId}`);
  };

  // 검색 및 필터링
  useEffect(() => {
    let filtered = votes.filter(vote => !vote.nftMinted);

    // 검색 필터
    if (searchTerm) {
      filtered = filtered.filter(vote => 
        vote.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        vote.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // 정렬
    switch (sortBy) {
      case 'votes-high':
        filtered.sort((a, b) => b.totalVotes - a.totalVotes);
        break;
      case 'votes-low':
        filtered.sort((a, b) => a.totalVotes - b.totalVotes);
        break;
      case 'ending-soon':
        // 임시로 ID 기준 정렬 (실제로는 종료일 기준)
        filtered.sort((a, b) => a.id - b.id);
        break;
      default:
        // 최신순 (기본값)
        filtered.sort((a, b) => b.id - a.id);
        break;
    }

    setFilteredVotes(filtered);
  }, [votes, searchTerm, sortBy]);

  // D-day 계산 함수
  const calculateDday = (voteId) => {
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + 7);
    const today = new Date();
    const diffTime = endDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  return (
    <MainTemplate>
      <div>
        <Header>
          <HeaderTitle>Voting</HeaderTitle>
          <HeaderSubtitle>
            Vote and evaluate artworks in the community
          </HeaderSubtitle>
        </Header>

        <SearchSection>
          <SearchContainer>
            <SearchInput
              placeholder="Search by title or description..."
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
              <SidebarTitle>Status</SidebarTitle>
              <FilterOption>
                <Checkbox type="checkbox" defaultChecked />
                Active Votes
              </FilterOption>
              <FilterOption>
                <Checkbox type="checkbox" />
                Ending Soon
              </FilterOption>
              <FilterOption>
                <Checkbox type="checkbox" />
                High Engagement
              </FilterOption>
            </SidebarSection>

            <SidebarSection>
              <SidebarTitle>Vote Count</SidebarTitle>
              <FilterOption>
                <Checkbox type="checkbox" />
                0-10 votes
              </FilterOption>
              <FilterOption>
                <Checkbox type="checkbox" />
                11-50 votes
              </FilterOption>
              <FilterOption>
                <Checkbox type="checkbox" />
                50+ votes
              </FilterOption>
            </SidebarSection>
          </Sidebar>

          <VoteGrid>
            <GridHeader>
              <ResultCount>{filteredVotes.length} items</ResultCount>
            </GridHeader>
            
            {loading ? (
              <LoadingContainer>
                Loading votes...
              </LoadingContainer>
            ) : filteredVotes.length === 0 ? (
              <EmptyContainer>
                <EmptyTitle>No votes found</EmptyTitle>
                <EmptyText>
                  {votes.length === 0 
                    ? "No active votes available. Check back later!"
                    : "No votes match your current filters."
                  }
                </EmptyText>
              </EmptyContainer>
            ) : (
              <GridContainer>
                {filteredVotes.map((vote) => (
                  <VoteCard key={vote.id} onClick={() => handleVoteClick(vote.id)}>
                    <VoteImage src={vote.imageUrl} alt={vote.title} />
                    <VoteOverlay>
                      <VoteHeader>
                        <VoteTitle>{vote.title}</VoteTitle>
                      </VoteHeader>
                      
                      <VoteDescription>{vote.description}</VoteDescription>
                      
                      <VoteStats>
                        <VoteStatsLeft>
                          <VoteStat>
                            <VoteStatIcon>👍</VoteStatIcon>
                            <VoteStatNumber>{vote.votesFor}</VoteStatNumber>
                          </VoteStat>
                          <VoteStat>
                            <VoteStatIcon>👎</VoteStatIcon>
                            <VoteStatNumber>{vote.votesAgainst}</VoteStatNumber>
                          </VoteStat>
                        </VoteStatsLeft>
                        
                        <DdayBadge>D-{calculateDday(vote.id)}</DdayBadge>
                      </VoteStats>
                    </VoteOverlay>
                  </VoteCard>
                ))}
              </GridContainer>
            )}
          </VoteGrid>
        </MainContent>
      </div>
    </MainTemplate>
  );
};

export default VotingPage; 