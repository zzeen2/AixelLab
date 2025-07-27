import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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

const BackButton = styled.button`
  background: none;
  border: none;
  color: #8b949e;
  font-size: 14px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 16px;
  padding: 0;
  
  &:hover {
    color: #ffffff;
  }
`;

const Title = styled.h1`
  font-size: 32px;
  font-weight: 700;
  color: #ffffff;
  margin: 0 0 8px 0;
`;

const Subtitle = styled.p`
  font-size: 16px;
  color: #8b949e;
  margin: 0;
`;

const ContentGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 400px;
  gap: 40px;
  margin-top: 24px;
  align-items: start;
  
  @media (max-width: 1200px) {
    grid-template-columns: 1fr;
    gap: 24px;
  }
`;

const ImageSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
  align-items: flex-start;
`;

const ArtworkImage = styled.img`
  width: 100%;
  max-width: 600px;
  height: auto;
  border-radius: 12px;
  display: block;
`;

const InfoSection = styled.div`
  background: #1a1a1a;
  border: 1px solid #2a2a2a;
  border-radius: 12px;
  padding: 24px;
  height: fit-content;
  margin-top: 0;
`;

const InfoTitle = styled.h3`
  font-size: 20px;
  font-weight: 600;
  color: #ffffff;
  margin: 0 0 16px 0;
`;

const InfoDescription = styled.p`
  font-size: 14px;
  color: #8b949e;
  line-height: 1.5;
  margin: 0 0 24px 0;
`;

const VoteStatus = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 24px;
`;

const StatusBadge = styled.span`
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 12px;
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
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  margin-bottom: 24px;
`;

const StatCard = styled.div`
  background: #2a2a2a;
  border-radius: 8px;
  padding: 16px;
  text-align: center;
`;

const StatNumber = styled.div`
  font-size: 24px;
  font-weight: 700;
  color: #ffffff;
  margin-bottom: 4px;
`;

const StatLabel = styled.div`
  font-size: 12px;
  color: #8b949e;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const VoteButtons = styled.div`
  display: flex;
  gap: 12px;
  margin-bottom: 24px;
`;

const VoteButton = styled.button`
  flex: 1;
  padding: 12px 16px;
  border: 1px solid ${props => props.voted ? '#3b82f6' : '#2a2a2a'};
  border-radius: 8px;
  background: ${props => props.voted ? '#3b82f6' : 'transparent'};
  color: #ffffff;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    border-color: #3b82f6;
    background: ${props => props.voted ? '#3b82f6' : 'rgba(59, 130, 246, 0.1)'};
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const ProgressBar = styled.div`
  width: 100%;
  height: 8px;
  background: #2a2a2a;
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 8px;
`;

const ProgressFill = styled.div`
  height: 100%;
  background: #3b82f6;
  width: ${props => props.percentage}%;
  transition: width 0.3s ease;
`;

const ProgressText = styled.div`
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  color: #8b949e;
`;

const TimeInfo = styled.div`
  margin-top: 24px;
  padding-top: 24px;
  border-top: 1px solid #2a2a2a;
`;

const TimeItem = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
  
  &:last-child {
    margin-bottom: 0;
  }
`;

const TimeLabel = styled.span`
  font-size: 12px;
  color: #8b949e;
`;

const TimeValue = styled.span`
  font-size: 12px;
  color: #ffffff;
`;

const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 400px;
  color: #8b949e;
  font-size: 16px;
`;

const VoteDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [vote, setVote] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userVote, setUserVote] = useState(null);

  useEffect(() => {
    loadVoteDetail();
  }, [id]);

  const loadVoteDetail = async () => {
    try {
      // TODO: 실제 API 호출
      // const response = await getVoteDetail(id);
      // setVote(response.data);
      
      // 임시 데이터
      setVote({
        id: parseInt(id),
        title: "Cat Pixel Art",
        description: "A beautiful pixel art featuring a cute cat in a garden setting. The artwork showcases vibrant colors and detailed pixel work that captures the essence of feline grace and charm.",
        imageUrl: "https://via.placeholder.com/600x600/8b5cf6/ffffff?text=Cat+Pixel+Art",
        status: "active",
        startAt: "2024-01-15T00:00:00Z",
        endAt: "2024-01-22T23:59:59Z",
        votesFor: 12,
        votesAgainst: 3,
        totalVotes: 15,
        minVotes: 10
      });
    } catch (error) {
      console.error('Failed to load vote detail:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleVote = async (voteType) => {
    try {
      // TODO: 실제 투표 API 호출
      // await submitVote(id, voteType);
      setUserVote(voteType);
      console.log('Vote submitted:', voteType);
    } catch (error) {
      console.error('Failed to submit vote:', error);
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

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getProgressPercentage = () => {
    if (!vote) return 0;
    return Math.round((vote.totalVotes / vote.minVotes) * 100);
  };

  const isVoteClosed = () => {
    if (!vote) return false;
    return new Date() > new Date(vote.endAt);
  };

  if (loading) {
    return (
      <MainTemplate>
        <PageContainer>
          <LoadingContainer>Loading...</LoadingContainer>
        </PageContainer>
      </MainTemplate>
    );
  }

  if (!vote) {
    return (
      <MainTemplate>
        <PageContainer>
          <div>Vote not found</div>
        </PageContainer>
      </MainTemplate>
    );
  }

  return (
    <MainTemplate>
      <PageContainer>
        <Header>
          <BackButton onClick={() => navigate('/voting')}>
            ← Back to Voting
          </BackButton>
          <Title>{vote.title}</Title>
          <Subtitle>Vote on this artwork</Subtitle>
        </Header>

        <ContentGrid>
          <ImageSection>
            <ArtworkImage src={vote.imageUrl} alt={vote.title} />
          </ImageSection>

          <InfoSection>
            <InfoTitle>About this artwork</InfoTitle>
            <InfoDescription>{vote.description}</InfoDescription>

            <VoteStatus>
              <StatusBadge className={getStatusClass(vote.status)}>
                {getStatusText(vote.status)}
              </StatusBadge>
            </VoteStatus>

            <VoteStats>
              <StatCard>
                <StatNumber>{vote.votesFor}</StatNumber>
                <StatLabel>Votes For</StatLabel>
              </StatCard>
              <StatCard>
                <StatNumber>{vote.votesAgainst}</StatNumber>
                <StatLabel>Votes Against</StatLabel>
              </StatCard>
            </VoteStats>

            <ProgressBar>
              <ProgressFill percentage={getProgressPercentage()} />
            </ProgressBar>
            <ProgressText>
              <span>{vote.totalVotes} votes cast</span>
              <span>{vote.minVotes} minimum required</span>
            </ProgressText>

            {!isVoteClosed() && (
              <VoteButtons>
                <VoteButton
                  voted={userVote === 'for'}
                  onClick={() => handleVote('for')}
                  disabled={userVote !== null}
                >
                  👍 Vote For
                </VoteButton>
                <VoteButton
                  voted={userVote === 'against'}
                  onClick={() => handleVote('against')}
                  disabled={userVote !== null}
                >
                  👎 Vote Against
                </VoteButton>
              </VoteButtons>
            )}

            <TimeInfo>
              <TimeItem>
                <TimeLabel>Started</TimeLabel>
                <TimeValue>{formatDate(vote.startAt)}</TimeValue>
              </TimeItem>
              <TimeItem>
                <TimeLabel>Ends</TimeLabel>
                <TimeValue>{formatDate(vote.endAt)}</TimeValue>
              </TimeItem>
            </TimeInfo>
          </InfoSection>
        </ContentGrid>
      </PageContainer>
    </MainTemplate>
  );
};

export default VoteDetailPage; 