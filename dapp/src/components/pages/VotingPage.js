import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import MainTemplate from '../templates/MainTemplate';

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
  margin: 0 0 8px 0;
`;

const Subtitle = styled.p`
  font-size: 16px;
  color: #9ca3af;
  margin: 0;
`;

const VotingGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 16px;
  margin-top: 24px;
`;

const VoteCard = styled.div`
  background: #1a1a1a;
  border: 1px solid #2a2a2a;
  border-radius: 8px;
  padding: 0;
  transition: all 0.2s ease;
  cursor: pointer;
  overflow: hidden;

  &:hover {
    border-color: #3b82f6;
    transform: translateY(-2px);
  }
`;

const VoteImage = styled.img`
  width: 100%;
  height: 180px;
  object-fit: cover;
  display: block;
`;

const VoteInfo = styled.div`
  padding: 16px;
`;

const VoteTitle = styled.h3`
  font-size: 16px;
  font-weight: 600;
  color: #ffffff;
  margin: 0 0 8px 0;
  line-height: 1.2;
`;

const VoteDescription = styled.p`
  font-size: 14px;
  color: #8b949e;
  margin: 0 0 12px 0;
  line-height: 1.4;
`;

const VoteMeta = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const VoteStatus = styled.span`
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 500;
  
  &.active {
    background: #10b981;
    color: #ffffff;
  }
  
  &.closed {
    background: #6b7280;
    color: #ffffff;
  }
  
  &.approved {
    background: #3b82f6;
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
  font-size: 12px;
  color: #8b949e;
`;

const VoteStat = styled.span`
  display: flex;
  align-items: center;
  gap: 4px;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 60px 20px;
  color: #9ca3af;
`;

const EmptyTitle = styled.h3`
  font-size: 20px;
  font-weight: 600;
  margin: 0 0 8px 0;
`;

const EmptyDescription = styled.p`
  font-size: 14px;
  margin: 0;
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
      //TODO: 실제 API 호출
      // const response = await getVotes();
      // setVotes(response.data);
      
      // 임시 데이터
      setVotes([
        {
          id: 1,
          title: "Cat Pixel Art",
          description: "Cute cat pixel art artwork.",
          imageUrl: "https://via.placeholder.com/320x200/8b5cf6/ffffff?text=Vote+1",
          status: "active",
          startAt: "2024-01-15",
          endAt: "2024-01-22",
          votesFor: 12,
          votesAgainst: 3
        },
        {
          id: 2,
          title: "Space Background Pixel Art",
          description: "Pixel art artwork with space theme.",
          imageUrl: "https://via.placeholder.com/320x200/3b82f6/ffffff?text=Vote+2",
          status: "closed",
          startAt: "2024-01-10",
          endAt: "2024-01-17",
          votesFor: 8,
          votesAgainst: 5
        }
      ]);
    } catch (error) {
      console.error('Failed to load votes:', error);
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
                      <VoteStat>👍 {vote.votesFor}</VoteStat>
                      <VoteStat>👎 {vote.votesAgainst}</VoteStat>
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