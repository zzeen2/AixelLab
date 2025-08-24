import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { getArtworkDetail, getNFTDetail } from '../../api/user';
import { listNFT, getListing } from '../../api/marketplace';
import { getCurrentUser } from '../../api/auth';
import NFTDetailTemplate from '../templates/NFTDetailTemplate';
import CreatorInfo from '../molecules/ui/CreatorInfo';
import DetailItem from '../molecules/ui/DetailItem';
import DetailCard from '../molecules/ui/DetailCard';

// Contract address (TODO: replace with env/prop)
const CONTRACT_ADDRESS = '0x8F5C6638F909794c50800DC8Da484E531c8F7571';

// ===== 모달 스타일 컴포넌트들 =====
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
  
  /* 스크롤바 숨기기 */
  scrollbar-width: none; /* Firefox */
  -ms-overflow-style: none; /* IE and Edge */
  
  &::-webkit-scrollbar {
    display: none; /* Chrome, Safari, Opera */
  }
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

// ===== Voting 스타일 컴포넌트들 =====
const ContentLayout = styled.div`
  display: grid;
  grid-template-columns: 1.2fr 0.8fr;
  gap: 40px;
  margin-top: 24px;
  align-items: stretch;
`;

const ImageSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
`;

const ArtworkImage = styled.img`
  width: 100%;
  height: auto;
  object-fit: cover;
  border-radius: 16px;
  display: block;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
`;

const InfoSection = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
`;

const InfoCard = styled.div`
  background: rgba(255, 255, 255, 0.05);
  border-radius: 16px;
  padding: 24px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow-y: auto;

  /* Firefox */
  scrollbar-width: thin;
  scrollbar-color: #222631 rgba(255, 255, 255, 0.06);

  /* WebKit */
  &::-webkit-scrollbar {
    width: 10px;
  }
  &::-webkit-scrollbar-track {
    background: rgba(255, 255, 255, 0.06);
    border-radius: 8px;
  }
  &::-webkit-scrollbar-thumb {
    background: #222631; /* solid dark */
    border-radius: 8px;
    border: 2px solid rgba(13, 16, 23, 0.9); /* matches modal background */
  }
  &::-webkit-scrollbar-thumb:hover {
    background: #2a2f3a; /* slightly lighter on hover */
  }
`;

const InfoTitle = styled.h2`
  font-size: 24px;
  font-weight: 700;
  color: #ffffff;
  margin: 0 0 16px 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
`;

const InfoDescription = styled.p`
  font-size: 16px;
  color: rgba(255, 255, 255, 0.7);
  margin: 0 0 24px 0;
  line-height: 1.6;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
`;

const ArtistInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 24px;
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
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
`;

const ArtistDetails = styled.div`
  display: flex;
  flex-direction: column;
`;

const ArtistName = styled.div`
  font-size: 16px;
  font-weight: 600;
  color: #ffffff;
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
  margin-bottom: 24px;
`;

const StatCard = styled.div`
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  padding: 16px;
  text-align: center;
  border: 1px solid rgba(255, 255, 255, 0.1);
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
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
`;

const ProgressSection = styled.div`
  margin-bottom: 24px;
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
  background: linear-gradient(90deg, #8b5cf6, #ec4899);
  width: ${props => props.percentage}%;
  transition: width 0.3s ease;
`;

const ProgressText = styled.div`
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.6);
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
`;

const VoteButtons = styled.div`
  display: flex;
  gap: 12px;
  margin-top: auto;
`;

const VoteButton = styled.button`
  flex: 1;
  background: ${props => props.voted ? 'linear-gradient(135deg, #8b5cf6, #ec4899)' : 'rgba(255, 255, 255, 0.1)'};
  color: #ffffff;
  border: 1px solid ${props => props.voted ? 'transparent' : 'rgba(255, 255, 255, 0.2)'};
  border-radius: 12px;
  padding: 12px 16px;
  font-size: 14px;
  font-weight: 600;
  cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
  transition: all 0.2s ease;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
  
  &:hover {
    background: ${props => props.voted ? 'linear-gradient(135deg, #8b5cf6, #ec4899)' : 'rgba(255, 255, 255, 0.15)'};
    transform: ${props => props.disabled ? 'none' : 'translateY(-1px)'};
  }
  
  &:disabled {
    opacity: 0.5;
  }
`;

const VotedMessage = styled.div`
  background: rgba(139, 92, 246, 0.1);
  border: 1px solid rgba(139, 92, 246, 0.3);
  border-radius: 12px;
  padding: 16px;
  text-align: center;
  color: #8b5cf6;
  font-size: 14px;
  font-weight: 600;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
`;

// ===== 유틸리티 함수들 =====
const formatAddress = (address) => {
    if (!address) return '';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
};

const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('ko-KR', {
        year: 'numeric', 
        month: 'long', 
        day: 'numeric', 
        hour: '2-digit', 
        minute: '2-digit'
    });
};

// ===== OpenSea 스타일 컴포넌트들 =====
const MintedTitle = styled.h1`
    font-size: 32px;
    font-weight: 700;
    color: #fff;
    margin: 0 0 8px 0;
    width: 100%;
    text-align: left;
`;

const MintedSubInfo = styled.div`
    font-size: 16px;
    color: #8a939b;
    margin-bottom: 8px;
    display: flex;
    align-items: center;
    gap: 8px;
    width: 100%;
    justify-content: flex-start;
`;

const MintedDivider = styled.div`
    height: 1.5px;
    background: #353840;
    margin: 32px 0 24px 0;
    width: 100%;
    box-sizing: border-box;
`;

const MintedPriceRow = styled.div`
    display: flex;
    align-items: center;
    gap: 16px;
    margin-bottom: 8px;
    width: 100%;
    justify-content: flex-start;
`;

const MintedPriceLabel = styled.div`
    font-size: 14px;
    color: #8a939b;
    font-weight: 600;
    margin-right: 8px;
`;

const MintedPriceValue = styled.div`
    font-size: 32px;
    font-weight: 700;
    color: #fff;
    letter-spacing: -1px;
    &::before {
        content: 'Ξ ';
        font-size: 24px;
        color: #2081e2;
        margin-right: 2px;
    }
`;

const MintedButtonRow = styled.div`
    display: flex;
    gap: 16px;
    margin-bottom: 8px;
    width: 100%;
`;

const MintedBuyButton = styled.button`
    flex: 1;
    background: #2081e2;
    color: #fff;
    border: none;
    border-radius: 10px;
    font-size: 18px;
    font-weight: 600;
    padding: 20px 0;
    cursor: pointer;
    transition: background 0.2s;
    &:hover { background: #1868b7; }
`;

const MintedOfferButton = styled.button`
    flex: 1;
    background: transparent;
    color: #2081e2;
    border: 2px solid #2081e2;
    border-radius: 10px;
    font-size: 18px;
    font-weight: 600;
    padding: 20px 0;
    cursor: pointer;
    transition: background 0.2s, color 0.2s;
    &:hover { background: #2081e2; color: #fff; }
`;

// 판매 등록 섹션 컴포넌트 제거
const Hint = styled.div`
  margin-top: 8px; font-size: 12px; color: rgba(255,255,255,.6);
`;
// 탭 제거
const Section = styled.div``;
// 판매 액션 바 및 버튼
const ActionBar = styled.div`
  margin-top: auto;
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  padding-top: 16px;
`;
const PrimaryButton = styled.button`
  padding: 10px 14px; border-radius: 10px;
  background: #8b5cf6;
  color: #fff; border: none; font-weight: 700; cursor: pointer;
  transition: opacity .2s ease;
  &:disabled { opacity: .6; cursor: not-allowed; }
`;
// (사용 안 함) MintedTabRow/MintedTab/MintedTabPanel 제거

// ===== 상태별 상세 컴포넌트들 =====
const MintedArtworkDetail = ({ artwork }) => {
    const [detailsOpen, setDetailsOpen] = useState(true);
    const [historyOpen, setHistoryOpen] = useState(false);
    return (
        <>
            <InfoTitle>{artwork.title}</InfoTitle>
            <InfoDescription>{artwork.description}</InfoDescription>

            <ArtistInfo>
                <ArtistAvatar>
                    {(artwork.user?.display_name || artwork.User?.display_name) ? (artwork.user?.display_name || artwork.User?.display_name).charAt(0).toUpperCase() : '?'}
                </ArtistAvatar>
                <ArtistDetails>
                    <ArtistName>{artwork.user?.display_name || artwork.User?.display_name || 'Unknown Artist'}</ArtistName>
                    <ArtistAddress>{formatAddress(artwork.artist_address || artwork.proposal?.artist_wallet_address || artwork.user?.wallet_address || artwork.User?.wallet_address)}</ArtistAddress>
                </ArtistDetails>
            </ArtistInfo>


            <div style={{ marginTop: '24px', padding: '16px', background: 'rgba(255, 255, 255, 0.05)', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
                <div onClick={() => setDetailsOpen(!detailsOpen)} style={{ fontSize: '14px', fontWeight: '600', color: '#fff', marginBottom: detailsOpen ? '12px' : 0, display: 'flex', justifyContent: 'space-between', cursor: 'pointer' }}>
                    <span>NFT Details</span>
                    <span style={{ color: '#8b5cf6' }}>{detailsOpen ? '▾' : '▸'}</span>
                </div>
                {detailsOpen && (
                    <div style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.7)', lineHeight: '1.6' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                            <span>Token ID:</span>
                            <span>{artwork.token_id || 'N/A'}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                            <span>Token Standard:</span>
                            <span>ERC-721</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                            <span>Network:</span>
                            <span>Sepolia Testnet</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', alignItems: 'center' }}>
                            <span>Contract:</span>
                            <a 
                                href={`https://sepolia.etherscan.io/address/${CONTRACT_ADDRESS}`}
                                target="_blank" 
                                rel="noopener noreferrer"
                                style={{ color: '#8b5cf6', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px' }}
                            >
                                {formatAddress(CONTRACT_ADDRESS)}
                                <span style={{ fontSize: '12px' }}>↗</span>
                            </a>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', alignItems: 'center' }}>
                            <span>Transaction:</span>
                            {artwork.transaction_hash ? (
                                <a 
                                    href={`https://sepolia.etherscan.io/tx/${artwork.transaction_hash}`}
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    style={{ color: '#8b5cf6', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px' }}
                                >
                                    {formatAddress(artwork.transaction_hash)}
                                    <span style={{ fontSize: '12px' }}>↗</span>
                                </a>
                            ) : (
                                <span>N/A</span>
                            )}
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                            <span>Creator:</span>
                            <span>{formatAddress(artwork.artist_address || artwork.proposal?.artist_wallet_address || artwork.creator_address || artwork.owner_address)}</span>
                        </div>
                    </div>
                )}
            </div>

            <div style={{ marginTop: '16px', padding: '16px', background: 'rgba(139, 92, 246, 0.1)', borderRadius: '12px', border: '1px solid rgba(139, 92, 246, 0.3)' }}>
                <div onClick={() => setHistoryOpen(!historyOpen)} style={{ fontSize: '14px', fontWeight: '600', color: '#8b5cf6', marginBottom: historyOpen ? '12px' : 0, display: 'flex', justifyContent: 'space-between', cursor: 'pointer' }}>
                    <span>Voting History</span>
                    <span>{historyOpen ? '▾' : '▸'}</span>
                </div>
                {historyOpen && (
                    <div style={{ fontSize: '12px', color: 'rgba(139, 92, 246, 0.9)', lineHeight: '1.6' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                            <span>Votes For:</span>
                            <span>{artwork.proposal?.votes_for || 0}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                            <span>Votes Against:</span>
                            <span>{artwork.proposal?.votes_against || 0}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                            <span>Total Votes:</span>
                            <span>{(artwork.proposal?.votes_for || 0) + (artwork.proposal?.votes_against || 0)}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                            <span>Threshold:</span>
                            <span>{artwork.proposal?.threshold || 10}</span>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
};

const VotingArtworkDetail = ({ artwork }) => {
    const votesFor = artwork.proposal?.votes_for || 0;
    const votesAgainst = artwork.proposal?.votes_against || 0;
    const threshold = artwork.proposal?.threshold || 10;
    const percentage = Math.min((votesFor / threshold) * 100, 100);

    return (
        <>
            <InfoTitle>{artwork.title}</InfoTitle>
            <InfoDescription>{artwork.description}</InfoDescription>

            <ArtistInfo>
                <ArtistAvatar>
                    {(artwork.user?.display_name || artwork.User?.display_name) ? (artwork.user?.display_name || artwork.User?.display_name).charAt(0).toUpperCase() : '?'}
                </ArtistAvatar>
                <ArtistDetails>
                    <ArtistName>{artwork.user?.display_name || artwork.User?.display_name || 'Unknown Artist'}</ArtistName>
                    <ArtistAddress>{formatAddress(artwork.user?.wallet_address || artwork.User?.wallet_address)}</ArtistAddress>
                </ArtistDetails>
            </ArtistInfo>

            <div style={{ marginTop: '24px', padding: '16px', background: 'rgba(255, 255, 255, 0.05)', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
                <div style={{ fontSize: '14px', fontWeight: '600', color: '#fff', marginBottom: '8px' }}>Voting Progress</div>
                <div style={{ fontSize: '24px', fontWeight: '700', color: '#8b5cf6' }}>{votesFor}/{threshold}</div>
                <div style={{ marginTop: '12px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ flex: 1, height: '8px', background: 'rgba(255, 255, 255, 0.1)', borderRadius: '4px', overflow: 'hidden' }}>
                        <div style={{ height: '100%', background: 'linear-gradient(90deg, #8b5cf6, #ec4899)', width: `${percentage}%` }}></div>
                    </div>
                    <span style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.7)', fontWeight: '600' }}>{percentage.toFixed(1)}%</span>
                </div>
            </div>

            <div style={{ marginTop: '24px', padding: '16px', background: 'rgba(139, 92, 246, 0.1)', borderRadius: '12px', border: '1px solid rgba(139, 92, 246, 0.3)' }}>
                <div style={{ fontSize: '14px', fontWeight: '600', color: '#8b5cf6', marginBottom: '12px' }}>Voting Progress</div>
                <div style={{ fontSize: '24px', fontWeight: '700', color: '#8b5cf6', marginBottom: '12px' }}>{votesFor}/{threshold}</div>
                <div style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ flex: 1, height: '8px', background: 'rgba(255, 255, 255, 0.1)', borderRadius: '4px', overflow: 'hidden' }}>
                        <div style={{ height: '100%', background: 'linear-gradient(90deg, #8b5cf6, #ec4899)', width: `${percentage}%` }}></div>
                    </div>
                    <span style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.7)', fontWeight: '600' }}>{percentage.toFixed(1)}%</span>
                </div>
                <div style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.7)', lineHeight: '1.6' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                        <span>Votes For:</span>
                        <span>{votesFor}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                        <span>Votes Against:</span>
                        <span>{votesAgainst}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                        <span>Total Votes:</span>
                        <span>{votesFor + votesAgainst}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                        <span>Threshold:</span>
                        <span>{threshold}</span>
                    </div>
                </div>
            </div>

            <div style={{ marginTop: '16px', padding: '16px', background: 'rgba(255, 255, 255, 0.05)', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
                <div style={{ fontSize: '14px', fontWeight: '600', color: '#fff', marginBottom: '12px' }}>Voting Details</div>
                <div style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.7)', lineHeight: '1.6' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                        <span>Proposal ID:</span>
                        <span>{artwork.proposal?.id || 'N/A'}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                        <span>Status:</span>
                        <span>{artwork.status}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                        <span>Created:</span>
                        <span>{formatDate(artwork.created_at)}</span>
                    </div>
                </div>
            </div>
        </>
    );
};

const FailedArtworkDetail = ({ artwork }) => {
    return (
        <>
            <InfoTitle>{artwork.title}</InfoTitle>
            <InfoDescription>{artwork.description}</InfoDescription>

            <ArtistInfo>
                <ArtistAvatar>
                    {(artwork.user?.display_name || artwork.User?.display_name) ? (artwork.user?.display_name || artwork.User?.display_name).charAt(0).toUpperCase() : '?'}
                </ArtistAvatar>
                <ArtistDetails>
                    <ArtistName>{artwork.user?.display_name || artwork.User?.display_name || 'Unknown Artist'}</ArtistName>
                    <ArtistAddress>{formatAddress(artwork.user?.wallet_address || artwork.User?.wallet_address)}</ArtistAddress>
                </ArtistDetails>
            </ArtistInfo>

            <div style={{ marginTop: '24px', padding: '16px', background: 'rgba(255, 255, 255, 0.05)', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
                <div style={{ fontSize: '14px', fontWeight: '600', color: '#fff', marginBottom: '8px' }}>Status</div>
                <div style={{ fontSize: '24px', fontWeight: '700', color: '#dc3545' }}>Failed</div>
                <div style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.7)', marginTop: '8px' }}>
                    This proposal did not receive enough votes to be minted as an NFT.
                </div>
            </div>

            <div style={{ marginTop: '24px', padding: '16px', background: 'rgba(220, 53, 69, 0.1)', borderRadius: '12px', border: '1px solid rgba(220, 53, 69, 0.3)' }}>
                <div style={{ fontSize: '14px', fontWeight: '600', color: '#dc3545', marginBottom: '12px' }}>Failed Details</div>
                <div style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.7)', lineHeight: '1.6' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                        <span>Proposal ID:</span>
                        <span>{artwork.proposal?.id || 'N/A'}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                        <span>Status:</span>
                        <span style={{ color: '#dc3545' }}>Failed</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                        <span>Created:</span>
                        <span>{formatDate(artwork.created_at)}</span>
                    </div>
                </div>
            </div>
        </>
    );
};

// ===== 메인 컴포넌트 =====
const NFTDetailPage = ({ isModal }) => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [artwork, setArtwork] = useState(null);
    const [nft, setNft] = useState(null);
    const [loading, setLoading] = useState(true);
    const [listingInfo, setListingInfo] = useState(null);
    const [listing, setListing] = useState({ busy: false, msg: '' });
    const [currentUser, setCurrentUser] = useState(null);
    // 탭 상태 제거
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const artworkDetail = await getArtworkDetail(id);
                setArtwork(artworkDetail.artwork);
                if (artworkDetail.artwork?.status === 'minted') {
                    const nftDetail = await getNFTDetail(id);
                    console.log('NFTDetailPage - nftDetail:', nftDetail);
                    setNft(nftDetail.nft);
                    // NFT 데이터를 artwork에 병합
                    setArtwork(prev => {
                        const merged = {
                            ...prev,
                            ...nftDetail.nft,
                            token_id: nftDetail.nft?.token_id || prev.token_id,
                            transaction_hash: nftDetail.nft?.transaction_hash || prev.transaction_hash,
                            artist_address: nftDetail.nft?.artist_address || prev.artist_address
                        };
                        console.log('NFTDetailPage - merged artwork:', merged);
                        return merged;
                    });
                    try {
                        const l = await getListing(nftDetail.nft.token_id);
                        setListingInfo(l.success ? l.listing : null);
                    } catch {}
                }
            } catch (error) {
                console.error('Failed to load details:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [id]);

    useEffect(() => {
        (async () => {
            try {
                const me = await getCurrentUser();
                if (me?.success) setCurrentUser(me.user);
            } catch {}
        })();
    }, []);

    useEffect(() => {
        if (artwork) {
            console.log('NFTDetailPage artwork:', artwork);
            console.log('NFTDetailPage artwork.token_id:', artwork.token_id);
            console.log('NFTDetailPage artwork.proposal?.nft_token_id:', artwork.proposal?.nft_token_id);
            console.log('NFTDetailPage nft:', nft);
        }
    }, [artwork, nft]);

    const handleClose = () => {
        navigate(-1); // 이전 페이지로 돌아가기
    };

    const handleList = async () => {
        if (!nft || !nft.token_id) {
            alert('NFT 정보를 찾을 수 없습니다.');
            return;
        }
        
        // 가격 입력 받기
        const price = window.prompt('판매 가격을 AXC로 입력하세요 (예: 10.5)', '10') || '';
        if (!price) return;
        
        let password = '';
        try {
            if (currentUser?.login_type === 'google') {
                password = window.prompt('Google 지갑 비밀번호를 입력하세요 (빈칸이면 취소)') || '';
                if (!password) return;
            }
            setListing({ busy: true, msg: 'Listing...' });
            const res = await listNFT(nft.token_id, price, password);
            if (res.success) {
                setListing({ busy: false, msg: 'Listed successfully' });
                try {
                    const l = await getListing(nft.token_id);
                    setListingInfo(l.success ? l.listing : null);
                } catch {}
                alert('판매 등록 완료! Profile 페이지의 On Sale 탭에서 확인하세요.');
                navigate('/profile?tab=onSale&refresh=true', { replace: true });
            } else {
                setListing({ busy: false, msg: res.error || 'List failed' });
                alert('등록 실패: ' + (res.error || 'List failed'));
            }
        } catch (e) {
            console.error(e);
            setListing({ busy: false, msg: 'List error' });
            alert('등록 실패: ' + (e.message || 'List error'));
        }
    };

    const renderArtworkDetail = () => {
        if (!artwork) return null;
        
        if (artwork.status === 'minted') {
            return <MintedArtworkDetail artwork={artwork} />;
        } else if (artwork.status === 'failed') {
            return <FailedArtworkDetail artwork={artwork} />;
        } else {
            return <VotingArtworkDetail artwork={artwork} />;
        }
    };

    // 이미지 섹션 높이에 맞춰 정보 섹션 높이를 맞춤
    const imageSectionRef = React.useRef(null);
    const imageRef = React.useRef(null);
    const [infoHeight, setInfoHeight] = useState(0);
    const handleImageLoad = () => {
        if (imageRef.current) setInfoHeight(imageRef.current.clientHeight);
    };
    React.useEffect(() => {
        const onResize = () => {
            if (imageRef.current) setInfoHeight(imageRef.current.clientHeight);
        };
        window.addEventListener('resize', onResize);
        return () => window.removeEventListener('resize', onResize);
    }, []);

    if (loading) {
        return (
            <ModalOverlay>
                <ModalContainer>
                    <div style={{ padding: '32px', textAlign: 'center', color: '#fff' }}>Loading...</div>
                </ModalContainer>
            </ModalOverlay>
        );
    }

    if (error) {
        return (
            <ModalOverlay>
                <ModalContainer>
                    <div style={{ padding: '32px', textAlign: 'center', color: '#fff' }}>Error: {error}</div>
                </ModalContainer>
            </ModalOverlay>
        );
    }

    if (!artwork) {
        return (
            <ModalOverlay>
                <ModalContainer>
                    <div style={{ padding: '32px', textAlign: 'center', color: '#fff' }}>Artwork not found</div>
                </ModalContainer>
            </ModalOverlay>
        );
    }

    return (
        <ModalOverlay onClick={handleClose}>
            <ModalContainer onClick={(e) => e.stopPropagation()}>
                <ModalHeader>
                    <div></div>
                    <CloseButton onClick={handleClose}>×</CloseButton>
                </ModalHeader>
                <ModalContent>
                    <ContentLayout>
                        <ImageSection>
                            <ArtworkImage src={artwork.image_url} alt={artwork.title} />
                        </ImageSection>
                        <InfoSection>
                            <InfoCard>
                                <Section>
                                    {renderArtworkDetail()}
                                </Section>

                                <ActionBar>
                                  {artwork.status === 'minted' && (!listingInfo || !listingInfo.active) && (
                                    <PrimaryButton onClick={handleList} disabled={listing.busy}>
                                      {listing.busy ? 'Listing...' : 'List for sale'}
                                    </PrimaryButton>
                                  )}
                                </ActionBar>

                            </InfoCard>
                        </InfoSection>
                    </ContentLayout>
                </ModalContent>
            </ModalContainer>
        </ModalOverlay>
    );
};

export default NFTDetailPage; 