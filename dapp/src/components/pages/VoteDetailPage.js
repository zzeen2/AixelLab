import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import MainTemplate from '../templates/MainTemplate';
import { submitVote, getVoteDetail } from '../../api/voting';
import { getCurrentUser } from '../../api/auth';

const PageContainer = styled.div`
  height: 100%;
  overflow-y: auto;
  max-width: 1400px;
  margin: 0 auto;
  padding: 24px;
  box-sizing: border-box;
`;

const Header = styled.div`
  margin-bottom: 32px;
  text-align: left;
`;

const BackButton = styled.button`
  background: none;
  border: none;
  color: #8b949e;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 16px;
  padding: 0;
  
  &:hover {
    color: #8b5cf6;
  }
`;

const Title = styled.h1`
  font-size: 32px;
  font-weight: 700;
  color: #ffffff;
  margin: 0 0 12px 0;
`;

const Subtitle = styled.p`
  font-size: 16px;
  color: #8b949e;
  margin: 0;
  font-weight: 400;
`;

const ContentGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 400px;
  gap: 20px;
  margin-top: 24px;
  align-items: start;
  margin-bottom: 40px;
`;

const ImageSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
  align-items: center;
  justify-content: flex-start;
  padding: 20px;
`;

const ArtworkImage = styled.img`
  width: 100%;
  max-width: 350px;
  height: auto;
  border-radius: 12px;
  display: block;
  object-fit: contain;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
`;

const InfoSection = styled.div`
  background: #1a1a1a;
  border: 1px solid #2a2a2a;
  border-radius: 16px;
  padding: 32px;
  height: fit-content;
  position: sticky;
  top: 24px;
  max-height: calc(100vh - 120px);
  overflow-y: auto;
`;

const InfoTitle = styled.h2`
  font-size: 24px;
  font-weight: 600;
  color: #ffffff;
  margin: 0 0 16px 0;
`;

const InfoDescription = styled.p`
  font-size: 16px;
  color: #8b949e;
  line-height: 1.6;
  margin: 0 0 28px 0;
  font-weight: 400;
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
    background: #8b5cf6;
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
  font-weight: 500;
`;

const VoteButtons = styled.div`
  display: flex;
  gap: 12px;
  margin-bottom: 24px;
`;

const VoteButton = styled.button`
  flex: 1;
  padding: 12px 16px;
  border: 1px solid ${props => props.voted ? '#8b5cf6' : '#2a2a2a'};
  border-radius: 8px;
  background: ${props => props.voted ? '#8b5cf6' : 'transparent'};
  color: #ffffff;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    border-color: #8b5cf6;
    background: ${props => props.voted ? '#8b5cf6' : 'rgba(139, 92, 246, 0.1)'};
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
  background: #8b5cf6;
  width: ${props => props.percentage}%;
  transition: width 0.3s ease;
`;

const ProgressText = styled.div`
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  color: #8b949e;
  font-weight: 500;
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
  font-weight: 500;
`;

const TimeValue = styled.span`
  font-size: 12px;
  color: #ffffff;
  font-weight: 400;
`;

const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 400px;
  color: #8b949e;
  font-size: 16px;
`;

const VotedMessage = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
  background: #2a2a2a;
  border: 1px solid #3a3a3a;
  border-radius: 8px;
  color: #8b949e;
  font-size: 14px;
  font-weight: 500;
  text-align: center;
  width: 100%;
`;



const VoteDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [vote, setVote] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userVote, setUserVote] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const initializePage = async () => {
      await checkLoginStatus();
      await loadVoteDetail();
    };
    initializePage();
  }, [id]);

  const checkLoginStatus = async () => {
    try {
      await getCurrentUser();
      setIsLoggedIn(true);
    } catch (error) {
      setIsLoggedIn(false);
    }
  };

  const loadVoteDetail = async () => {
    try {
      const response = await getVoteDetail(id);
      if (response && response.vote) {
        setVote(response.vote);
        
        // 사용자의 기존 투표 확인
        if (isLoggedIn && response.vote.userVote) {
          setUserVote(response.vote.userVote);
        }
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleVote = async (voteType) => {
    try {
      // 로그인 상태 재확인
      if (!isLoggedIn) {
        alert('Login required');
        return;
      }
      
      await submitVote(id, voteType);
      setUserVote(voteType);
      await loadVoteDetail();
    } catch (error) {
      console.error('투표 실패:', error);
      if (error.response?.status === 401) {
        alert('Login required. Please login again.');
        setIsLoggedIn(false);
      }
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
                {userVote ? (
                  <VotedMessage>
                    You have already voted {userVote === 'for' ? 'FOR' : 'AGAINST'} this proposal
                  </VotedMessage>
                ) : (
                  <>
                    <VoteButton
                      voted={false}
                      onClick={() => isLoggedIn ? handleVote('for') : alert('Login required')}
                      disabled={false}
                    >
                      Vote For
                    </VoteButton>
                    <VoteButton
                      voted={false}
                      onClick={() => isLoggedIn ? handleVote('against') : alert('Login required')}
                      disabled={false}
                    >
                      Vote Against
                    </VoteButton>
                  </>
                )}
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