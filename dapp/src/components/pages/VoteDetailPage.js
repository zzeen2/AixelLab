import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { submitVote, getVoteDetail } from '../../api/voting';
import { getCurrentUser } from '../../api/auth';

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(10px);
`;

const ModalContainer = styled.div`
  background: #0d1017;
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  max-width: 1200px;
  width: 90%;
  max-height: 90vh;
  overflow-y: auto;
  position: relative;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 32px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
`;

const CloseButton = styled.button`
  background: none;
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: rgba(255, 255, 255, 0.6);
  font-size: 18px;
  cursor: pointer;
  padding: 8px;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  
  &:hover {
    background: rgba(255, 255, 255, 0.1);
    color: rgba(255, 255, 255, 0.8);
    border-color: rgba(255, 255, 255, 0.3);
  }
`;

const ModalContent = styled.div`
  padding: 32px;
`;

const Title = styled.h1`
  font-size: 28px;
  font-weight: 700;
  background: linear-gradient(135deg, #8b5cf6, #ec4899);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
`;

const ContentLayout = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 40px;
  margin-top: 24px;
  align-items: stretch; /* 좌우 섹션 높이 동일 */
`;

const ImageSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
`;

const ImageWrapper = styled.div`
  height: 100%;
  border-radius: 16px;
  overflow: hidden;
`;

const ArtworkImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 16px;
  display: block;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
`;

const InfoSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
  height: 100%;
`;

const InfoCard = styled.div`
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  padding: 24px;
  backdrop-filter: blur(10px);
  height: 100%;
  display: flex;
  flex-direction: column;
`;

const InfoTitle = styled.h2`
  font-size: 20px;
  font-weight: 600;
  color: #ffffff;
  margin: 0 0 16px 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
`;




const PriceBox = styled.div`
  display: inline-flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  background: rgba(255, 255, 255, 0.04);
  border-radius: 12px;
  margin-bottom: 16px;
`;

const PriceLabel = styled.div`
  font-size: 13px;
  color: rgba(255, 255, 255, 0.7);
  font-weight: 600;
`;

const PriceValue = styled.div`
  font-size: 22px;
  font-weight: 700;
  color: #ffffff;
`;

// (차트 분석 섹션 제거)

const InfoDescription = styled.p`
  font-size: 14px;
  color: rgba(255, 255, 255, 0.7);
  line-height: 1.6;
  margin: 0 0 20px 0;
  font-weight: 400;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
`;

const ArtistInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 20px;
  padding: 16px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
`;

const ArtistAvatar = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: linear-gradient(135deg, #8b5cf6, #ec4899);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #ffffff;
  font-weight: 600;
  font-size: 16px;
`;

const ArtistDetails = styled.div`
  flex: 1;
`;

const ArtistName = styled.div`
  font-size: 14px;
  font-weight: 600;
  color: #ffffff;
  margin-bottom: 4px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
`;

const ArtistAddress = styled.div`
  font-size: 12px;
  color: rgba(255, 255, 255, 0.6);
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
`;

const VoteStats = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  margin-bottom: 20px;
`;

const StatCard = styled.div`
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 16px;
  text-align: center;
`;

const StatNumber = styled.div`
  font-size: 24px;
  font-weight: 700;
  color: #ffffff;
  margin-bottom: 4px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
`;

const StatLabel = styled.div`
  font-size: 12px;
  color: rgba(255, 255, 255, 0.6);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  font-weight: 500;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
`;

const ProgressSection = styled.div`
  margin-bottom: 20px;
`;

const ProgressBar = styled.div`
  width: 100%;
  height: 8px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 8px;
`;

const ProgressFill = styled.div`
  height: 100%;
  background: linear-gradient(135deg, #8b5cf6, #ec4899);
  width: ${props => props.percentage}%;
  transition: width 0.3s ease;
`;

const ProgressText = styled.div`
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.6);
  font-weight: 500;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
`;

const VoteButtons = styled.div`
  display: flex;
  gap: 12px;
  margin-bottom: 20px;
`;

const VoteButton = styled.button`
  flex: 1;
  padding: 14px 20px;
  border: 1px solid ${props => props.voted ? 'transparent' : 'rgba(255, 255, 255, 0.2)'};
  border-radius: 12px;
  background: ${props => props.voted ? 'linear-gradient(135deg, #8b5cf6, #ec4899)' : 'rgba(255, 255, 255, 0.05)'};
  color: #ffffff;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
  
  &:hover {
    background: ${props => props.voted ? 'linear-gradient(135deg, #7c3aed, #db2777)' : 'rgba(255, 255, 255, 0.1)'};
    transform: translateY(-1px);
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const VotedMessage = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  color: rgba(255, 255, 255, 0.8);
  font-size: 14px;
  font-weight: 500;
  text-align: center;
  width: 100%;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
`;

const TimeInfo = styled.div`
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  margin-top: auto;
`;

const TimeItem = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 12px;
  
  &:last-child {
    margin-bottom: 0;
  }
`;

const TimeLabel = styled.span`
  font-size: 12px;
  color: rgba(255, 255, 255, 0.6);
  font-weight: 500;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
`;

const TimeValue = styled.span`
  font-size: 12px;
  color: #ffffff;
  font-weight: 400;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
`;

const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 400px;
  color: rgba(255, 255, 255, 0.7);
  font-size: 16px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
`;

const VoteDetailPage = ({ isModal = false, onClose, voteId }) => {
  const params = useParams();
  const id = voteId || params.id;
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
      console.log('Vote detail response:', response);
      console.log('Response userVote:', response.userVote);
      console.log('Response keys:', Object.keys(response));
      
      if (response) {
        const votesFor = response.votes ? response.votes.filter(v => v.vote_type === 'for').length : 0;
        const votesAgainst = response.votes ? response.votes.filter(v => v.vote_type === 'against').length : 0;
        const initialPriceUnits = response.initial_price_units ?? null;
        let initialPriceAxc = null;
        if (initialPriceUnits !== null && initialPriceUnits !== undefined) {
          const numUnits = typeof initialPriceUnits === 'string' ? Number(initialPriceUnits) : Number(initialPriceUnits);
          if (!Number.isNaN(numUnits)) initialPriceAxc = (numUnits / 1e6).toFixed(2);
        }
        
        const formattedVote = {
          id: response.id,
          title: response.artwork?.title || 'Untitled',
          description: response.artwork?.description || '',
          imageUrl: response.artwork?.image_ipfs_uri || '',
          status: response.status,
          startAt: response.start_at,
          endAt: response.end_at,
          minVotes: response.min_votes,
          votesFor,
          votesAgainst,
          totalVotes: votesFor + votesAgainst,
          nftMinted: response.nft_minted,
          tokenId: response.nft_token_id,
          transactionHash: response.nft_transaction_hash,
          mintedAt: response.minted_at,
          userVote: response.userVote,
          artistAddress: response.artwork?.User?.wallet_address || '',
          artistName: response.artwork?.User?.display_name || response.artwork?.User?.username || 'Unknown Artist',
          initialPriceAxc
        };
        
        setVote(formattedVote);
        
        // 사용자의 기존 투표 확인
        if (isLoggedIn && response.userVote) {
          setUserVote(response.userVote);
        } else {
          // localStorage에서 투표 상태 확인
          const savedVote = localStorage.getItem(`vote_${id}`);
          if (savedVote) {
            setUserVote(savedVote);
          } else {
            setUserVote(null);
          }
        }
        
        // 디버깅용 로그
        console.log('Loaded vote detail - userVote:', response.userVote, 'isLoggedIn:', isLoggedIn, 'savedVote:', localStorage.getItem(`vote_${id}`));
      }
    } catch (error) {
      console.error('Error loading vote detail:', error);
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
      
      // localStorage에 투표 상태 저장
      localStorage.setItem(`vote_${id}`, voteType);
      
      // 투표 후 즉시 상태 업데이트
      setVote(prevVote => ({
        ...prevVote,
        votesFor: voteType === 'for' ? prevVote.votesFor + 1 : prevVote.votesFor,
        votesAgainst: voteType === 'against' ? prevVote.votesAgainst + 1 : prevVote.votesAgainst,
        totalVotes: prevVote.totalVotes + 1
      }));
    } catch (error) {
      console.error('투표 실패:', error);
      if (error.response?.status === 401) {
        alert('Login required. Please login again.');
        setIsLoggedIn(false);
      }
    }
  };

  const formatAddress = (address) => {
    if (!address) return '';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
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

  const handleClose = () => {
    if (isModal && onClose) {
      onClose();
    } else {
      navigate(-1); // 이전 페이지로 돌아가기
    }
  };

  if (loading) {
    return (
      <ModalOverlay>
        <ModalContainer>
          <LoadingContainer>Loading...</LoadingContainer>
        </ModalContainer>
      </ModalOverlay>
    );
  }

  if (!vote) {
    return (
      <ModalOverlay>
        <ModalContainer>
          <div>Vote not found</div>
        </ModalContainer>
      </ModalOverlay>
    );
  }

  const content = (
    <ModalContent>
      <ContentLayout>
        <ImageSection>
          <ImageWrapper>
            <ArtworkImage src={vote.imageUrl} alt={vote.title} />
          </ImageWrapper>
        </ImageSection>

        <InfoSection>
          <InfoCard>
            <InfoTitle>{vote.title}</InfoTitle>
            <InfoDescription>{vote.description}</InfoDescription>

            <ArtistInfo>
              <ArtistAvatar>
                {vote.artistName ? vote.artistName.charAt(0).toUpperCase() : '?'}
              </ArtistAvatar>
              <ArtistDetails>
                <ArtistName>{vote.artistName || 'Unknown Artist'}</ArtistName>
                <ArtistAddress>{formatAddress(vote.artistAddress)}</ArtistAddress>
              </ArtistDetails>
            </ArtistInfo>

            {vote.initialPriceAxc !== null && vote.initialPriceAxc !== undefined && (
              <PriceBox>
                <PriceLabel>Initial Price</PriceLabel>
                <PriceValue>{vote.initialPriceAxc} AXC</PriceValue>
              </PriceBox>
            )}

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

            <ProgressSection>
              <ProgressBar>
                <ProgressFill percentage={getProgressPercentage()} />
              </ProgressBar>
              <ProgressText>
                <span>{vote.totalVotes} votes cast</span>
                <span>{vote.minVotes} minimum required</span>
              </ProgressText>
            </ProgressSection>

            {/* (차트 분석 섹션 제거) */}

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
            
            {isVoteClosed() && (
              <VotedMessage>
                Voting period has ended
              </VotedMessage>
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
          </InfoCard>
        </InfoSection>
      </ContentLayout>
    </ModalContent>
  );

  if (isModal) {
    return (
      <ModalOverlay onClick={handleClose}>
        <ModalContainer onClick={(e) => e.stopPropagation()}>
          <ModalHeader>
            <div></div>
            <CloseButton onClick={handleClose}>×</CloseButton>
          </ModalHeader>
          {content}
        </ModalContainer>
      </ModalOverlay>
    );
  }

  return (
    <ModalOverlay>
      <ModalContainer>
        <ModalHeader>
          <div></div>
          <CloseButton onClick={handleClose}>×</CloseButton>
        </ModalHeader>
        {content}
      </ModalContainer>
    </ModalOverlay>
  );
};

export default VoteDetailPage; 