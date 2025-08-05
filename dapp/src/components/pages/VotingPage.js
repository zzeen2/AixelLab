import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import MainTemplate from '../templates/MainTemplate';
import { getVotes } from '../../api/voting';

const PageContainer = styled.div`
  height: 100%;
  margin-left: 55px;
  margin-top: 52px;
  padding: 24px;
  box-sizing: border-box;
  overflow-y: auto;
`;

const Header = styled.div`
  margin-bottom: 32px;
`;

const Title = styled.h1`
  font-size: 32px;
  font-weight: 700;
  color: #ffffff;
  margin: 0 0 16px 0;
`;

const Subtitle = styled.p`
  font-size: 16px;
  color: #8b949e;
  margin: 0 0 32px 0;
  font-weight: 400;
`;

const VotingGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 20px;
  margin-top: 24px;
`;

const VoteCard = styled.div`
  background: #1a1a1a;
  border: 1px solid #2a2a2a;
  border-radius: 12px;
  padding: 0;
  transition: all 0.3s ease;
  cursor: pointer;
  overflow: hidden;
  position: relative;

  &:hover {
    border-color: #8b5cf6;
    transform: translateY(-2px);
    box-shadow: 0 4px 20px rgba(139, 92, 246, 0.15);
  }
`;

const VoteImage = styled.img`
  width: 100%;
  height: 240px;
  object-fit: cover;
  display: block;
  background: #0f0f0f;
`;

const VoteInfo = styled.div`
  padding: 16px;
`;

const VoteTitle = styled.h3`
  font-size: 18px;
  font-weight: 600;
  color: #ffffff;
  margin: 0 0 8px 0;
  line-height: 1.3;
`;

const VoteDescription = styled.p`
  font-size: 14px;
  color: #8b949e;
  margin: 0 0 12px 0;
  font-weight: 400;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

const VoteMeta = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 12px;
`;

const VoteStatus = styled.span`
  padding: 4px 10px;
  border-radius: 16px;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  
  &.active {
    background: #10b981;
    color: #ffffff;
  }
  
  &.closed {
    background: #6b7280;
    color: #ffffff;
  }
  
  &.approved {
    background: #8b5cf6;
    color: #ffffff;
  }
  
  &.rejected {
    background: #ef4444;
    color: #ffffff;
  }
`;

const VoteStats = styled.div`
  display: flex;
  gap: 12px;
  font-size: 13px;
  color: #8b949e;
  font-weight: 500;
`;

const VoteStat = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  
  &:first-child {
    color: #10b981;
  }
  
  &:last-child {
    color: #ef4444;
  }
`;

const VoteStatIcon = styled.span`
  font-size: 14px;
`;

const VoteStatNumber = styled.span`
  font-weight: 600;
  color: #ffffff;
`;

const StatusBadge = styled.span`
  font-size: 12px;
  font-weight: 500;
`;

const VoteCount = styled.div`
  font-size: 14px;
  color: #8b949e;
  font-weight: 400;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 60px 20px;
  color: #9ca3af;
`;

const EmptyTitle = styled.h2`
  font-size: 24px;
  font-weight: 600;
  color: #8b949e;
  text-align: center;
  margin: 0 0 16px 0;
`;

const EmptyDescription = styled.p`
  font-size: 16px;
  color: #8b949e;
  text-align: center;
  margin: 0;
  font-weight: 400;
`;

const VotingPage = () => {
  const navigate = useNavigate();
  const [votes, setVotes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    //TODO: API에서 투표 목록 가져오기
    loadVotes();
  }, []);

  const loadVotes = async () => {
    try {
      const response = await getVotes();
      console.log("API Response:", response);
      console.log("Response type:", typeof response);
      console.log("Response keys:", Object.keys(response));
      
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
            mintedAt: proposal.minted_at
          };
        });
        
        setVotes(formattedVotes);
      } else {
        console.error('Unexpected response structure:', response);
        setVotes([]);
      }
    } catch (error) {
      console.error('Failed to load votes:', error);
      setVotes([]);
    } finally {
      setLoading(false);
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'active': return 'Active';
      case 'closed': return 'Closed';
      case 'approved': return 'Approved';
      case 'rejected': return 'Rejected';
      default: return status;
    }
  };

  const getStatusClass = (status) => {
    return status;
  };

  const handleVoteClick = (voteId) => {
    navigate(`/voting/${voteId}`);
  };
  
  if (loading) {
    return (
      <MainTemplate>
              <PageContainer>
        <div>Loading...</div>
      </PageContainer>
      </MainTemplate>
    );
  }

  return (
    <MainTemplate>
      <PageContainer>
        <Header>
          <Title>Voting</Title>
          <Subtitle>Vote and evaluate artworks in the community</Subtitle>
        </Header>

        {votes.length === 0 ? (
          <EmptyState>
            <EmptyTitle>No votes yet</EmptyTitle>
            <EmptyDescription>New artworks will appear here when submitted</EmptyDescription>
          </EmptyState>
        ) : (
          <VotingGrid>
            {votes.map((vote) => (
              <VoteCard key={vote.id} onClick={() => handleVoteClick(vote.id)}>
                <VoteImage src={vote.imageUrl} alt={vote.title} />
                <VoteInfo>
                  <VoteTitle>{vote.title}</VoteTitle>
                  <VoteDescription>{vote.description}</VoteDescription>
                  <VoteMeta>
                    <VoteStatus className={getStatusClass(vote.status)}>
                      {getStatusText(vote.status)}
                    </VoteStatus>
                    <VoteStats>
                      <VoteStat>
                        <VoteStatIcon>👍</VoteStatIcon>
                        <VoteStatNumber>{vote.votesFor}</VoteStatNumber>
                      </VoteStat>
                      <VoteStat>
                        <VoteStatIcon>👎</VoteStatIcon>
                        <VoteStatNumber>{vote.votesAgainst}</VoteStatNumber>
                      </VoteStat>
                    </VoteStats>
                  </VoteMeta>
                </VoteInfo>
              </VoteCard>
            ))}
          </VotingGrid>
        )}
      </PageContainer>
    </MainTemplate>
  );
};

export default VotingPage; 