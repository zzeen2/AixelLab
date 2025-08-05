import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import MainTemplate from '../templates/MainTemplate';
import { getNFTDetail } from '../../api/user';

const PageContainer = styled.div`
    padding: 24px 0;
    background-color: #0d1017;
    min-height: 100vh;
    color: #ffffff;
`;

const NFTContainer = styled.div`
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 24px;
`;

const NFTHeader = styled.div`
    display: flex;
    gap: 32px;
    margin-bottom: 48px;
    
    @media (max-width: 768px) {
        flex-direction: column;
    }
`;

const NFTImage = styled.div`
    flex: 1;
    max-width: 500px;
    
    img {
        width: 100%;
        height: auto;
        border-radius: 12px;
        border: 1px solid #333;
    }
`;

const NFTInfo = styled.div`
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 16px;
`;

const NFTTitle = styled.h1`
    font-size: 32px;
    font-weight: 600;
    color: #ffffff;
    margin: 0;
`;

const NFTDescription = styled.p`
    font-size: 16px;
    color: #999;
    line-height: 1.6;
    margin: 0;
`;

const NFTStats = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 16px;
    margin-top: 24px;
`;

const StatCard = styled.div`
    background: #1a1a1a;
    border: 1px solid #333;
    border-radius: 8px;
    padding: 16px;
`;

const StatLabel = styled.div`
    font-size: 12px;
    color: #666;
    text-transform: uppercase;
    margin-bottom: 4px;
`;

const StatValue = styled.div`
    font-size: 18px;
    font-weight: 500;
    color: #ffffff;
`;

const NFTDetails = styled.div`
    background: #1a1a1a;
    border: 1px solid #333;
    border-radius: 12px;
    padding: 24px;
    margin-top: 32px;
`;

const DetailSection = styled.div`
    margin-bottom: 24px;
    
    &:last-child {
        margin-bottom: 0;
    }
`;

const SectionTitle = styled.h3`
    font-size: 18px;
    font-weight: 500;
    color: #ffffff;
    margin: 0 0 16px 0;
`;

const DetailGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 16px;
`;

const DetailItem = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px 0;
    border-bottom: 1px solid #333;
    
    &:last-child {
        border-bottom: none;
    }
`;

const DetailLabel = styled.span`
    font-size: 14px;
    color: #666;
`;

const DetailValue = styled.span`
    font-size: 14px;
    color: #ffffff;
    font-family: monospace;
`;

const CopyButton = styled.button`
    background: #007bff;
    color: white;
    border: none;
    padding: 4px 8px;
    border-radius: 4px;
    font-size: 12px;
    cursor: pointer;
    margin-left: 8px;
    
    &:hover {
        background: #0056b3;
    }
`;

const BackButton = styled.button`
    background: #333;
    color: white;
    border: none;
    padding: 12px 24px;
    border-radius: 8px;
    font-size: 14px;
    cursor: pointer;
    margin-bottom: 24px;
    
    &:hover {
        background: #444;
    }
`;

const LoadingSpinner = styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
    height: 400px;
    color: #666;
`;

const ErrorMessage = styled.div`
    text-align: center;
    padding: 48px 24px;
    color: #ff6b6b;
`;

const NFTDetailPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [nft, setNft] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchNFTDetail = async () => {
            try {
                setLoading(true);
                const response = await getNFTDetail(id);
                if (response.success) {
                    setNft(response.nft);
                } else {
                    setError(response.message || 'NFT 정보를 가져오는데 실패했습니다.');
                }
            } catch (error) {
                setError(error.message || 'NFT 정보를 가져오는데 실패했습니다.');
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchNFTDetail();
        }
    }, [id]);

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text);
        alert('클립보드에 복사되었습니다!');
    };

    const formatAddress = (address) => {
        if (!address) return 'N/A';
        return `${address.slice(0, 6)}...${address.slice(-4)}`;
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('ko-KR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    if (loading) {
        return (
            <MainTemplate>
                <PageContainer>
                    <LoadingSpinner>Loading...</LoadingSpinner>
                </PageContainer>
            </MainTemplate>
        );
    }

    if (error) {
        return (
            <MainTemplate>
                <PageContainer>
                    <ErrorMessage>
                        <div>{error}</div>
                        <BackButton onClick={() => navigate(-1)}>뒤로 가기</BackButton>
                    </ErrorMessage>
                </PageContainer>
            </MainTemplate>
        );
    }

    if (!nft) {
        return (
            <MainTemplate>
                <PageContainer>
                    <ErrorMessage>
                        <div>NFT를 찾을 수 없습니다.</div>
                        <BackButton onClick={() => navigate(-1)}>뒤로 가기</BackButton>
                    </ErrorMessage>
                </PageContainer>
            </MainTemplate>
        );
    }

    return (
        <MainTemplate>
            <PageContainer>
                <NFTContainer>
                    <BackButton onClick={() => navigate(-1)}>← 뒤로 가기</BackButton>
                    
                    <NFTHeader>
                        <NFTImage>
                            <img 
                                src={nft.image_url} 
                                alt={nft.title}
                                onError={(e) => {
                                    e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTAwIiBoZWlnaHQ9IjUwMCIgdmlld0JveD0iMCAwIDUwMCA1MDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI1MDAiIGhlaWdodD0iNTAwIiBmaWxsPSIjMzMzIi8+Cjx0ZXh0IHg9IjI1MCIgeT0iMjUwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSIjNjY2IiBmb250LXNpemU9IjE4Ij5JbWFnZSBub3QgZm91bmQ8L3RleHQ+Cjwvc3ZnPgo=';
                                }}
                            />
                        </NFTImage>
                        
                        <NFTInfo>
                            <NFTTitle>{nft.title}</NFTTitle>
                            <NFTDescription>{nft.description || '설명이 없습니다.'}</NFTDescription>
                            
                            <NFTStats>
                                <StatCard>
                                    <StatLabel>Token ID</StatLabel>
                                    <StatValue>#{nft.token_id || 'N/A'}</StatValue>
                                </StatCard>
                                
                                <StatCard>
                                    <StatLabel>Status</StatLabel>
                                    <StatValue style={{ color: '#28a745' }}>✓ Minted</StatValue>
                                </StatCard>
                                
                                <StatCard>
                                    <StatLabel>Artist</StatLabel>
                                    <StatValue>{nft.artist?.display_name || 'Unknown'}</StatValue>
                                </StatCard>
                                
                                <StatCard>
                                    <StatLabel>Created</StatLabel>
                                    <StatValue>{formatDate(nft.created_at)}</StatValue>
                                </StatCard>
                            </NFTStats>
                        </NFTInfo>
                    </NFTHeader>

                    <NFTDetails>
                        <DetailSection>
                            <SectionTitle>NFT 정보</SectionTitle>
                            <DetailGrid>
                                <DetailItem>
                                    <DetailLabel>Token ID</DetailLabel>
                                    <DetailValue>{nft.token_id || 'N/A'}</DetailValue>
                                </DetailItem>
                                
                                <DetailItem>
                                    <DetailLabel>Status</DetailLabel>
                                    <DetailValue style={{ color: '#28a745' }}>Minted</DetailValue>
                                </DetailItem>
                                
                                <DetailItem>
                                    <DetailLabel>Created</DetailLabel>
                                    <DetailValue>{formatDate(nft.created_at)}</DetailValue>
                                </DetailItem>
                                
                                <DetailItem>
                                    <DetailLabel>Minted</DetailLabel>
                                    <DetailValue>{formatDate(nft.minted_at)}</DetailValue>
                                </DetailItem>
                            </DetailGrid>
                        </DetailSection>

                        <DetailSection>
                            <SectionTitle>블록체인 정보</SectionTitle>
                            <DetailGrid>
                                <DetailItem>
                                    <DetailLabel>Artist Address</DetailLabel>
                                    <div style={{ display: 'flex', alignItems: 'center' }}>
                                        <DetailValue>{formatAddress(nft.artist_address)}</DetailValue>
                                        <CopyButton onClick={() => copyToClipboard(nft.artist_address)}>
                                            Copy
                                        </CopyButton>
                                    </div>
                                </DetailItem>
                                
                                <DetailItem>
                                    <DetailLabel>Transaction Hash</DetailLabel>
                                    <div style={{ display: 'flex', alignItems: 'center' }}>
                                        <DetailValue>{formatAddress(nft.transaction_hash)}</DetailValue>
                                        <CopyButton onClick={() => copyToClipboard(nft.transaction_hash)}>
                                            Copy
                                        </CopyButton>
                                    </div>
                                </DetailItem>
                                
                                <DetailItem>
                                    <DetailLabel>Metadata URI</DetailLabel>
                                    <div style={{ display: 'flex', alignItems: 'center' }}>
                                        <DetailValue>{formatAddress(nft.metadata_uri)}</DetailValue>
                                        <CopyButton onClick={() => copyToClipboard(nft.metadata_uri)}>
                                            Copy
                                        </CopyButton>
                                    </div>
                                </DetailItem>
                            </DetailGrid>
                        </DetailSection>

                        {nft.proposal && (
                            <DetailSection>
                                <SectionTitle>투표 정보</SectionTitle>
                                <DetailGrid>
                                    <DetailItem>
                                        <DetailLabel>총 투표 수</DetailLabel>
                                        <DetailValue>{nft.proposal.total_votes}</DetailValue>
                                    </DetailItem>
                                    
                                    <DetailItem>
                                        <DetailLabel>찬성 투표</DetailLabel>
                                        <DetailValue style={{ color: '#28a745' }}>{nft.proposal.votes_for}</DetailValue>
                                    </DetailItem>
                                    
                                    <DetailItem>
                                        <DetailLabel>반대 투표</DetailLabel>
                                        <DetailValue style={{ color: '#ff6b6b' }}>{nft.proposal.votes_against}</DetailValue>
                                    </DetailItem>
                                    
                                    <DetailItem>
                                        <DetailLabel>임계값</DetailLabel>
                                        <DetailValue>{nft.proposal.threshold}</DetailValue>
                                    </DetailItem>
                                </DetailGrid>
                            </DetailSection>
                        )}
                    </NFTDetails>
                </NFTContainer>
            </PageContainer>
        </MainTemplate>
    );
};

export default NFTDetailPage; 