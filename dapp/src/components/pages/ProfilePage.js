import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { MainTemplate } from '../templates';
import { getUserArtworks, getUserStats } from '../../api/user';

const PageContainer = styled.div`
    padding: 24px;
    background-color: #0d1017;
    min-height: 100vh;
    color: #ffffff;
    overflow-y: auto;
    height: 100%;
`;

const ProfileHeader = styled.div`
    background: #1a1a1a;
    border-radius: 12px;
    padding: 24px;
    margin-bottom: 24px;
    border: 1px solid #2a2a2a;
`;

const ProfileInfo = styled.div`
    display: flex;
    align-items: center;
    gap: 16px;
    margin-bottom: 24px;
`;

const Avatar = styled.div`
    width: 80px;
    height: 80px;
    border-radius: 50%;
    background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 32px;
    font-weight: bold;
    border: 2px solid #2a2a2a;
`;

const UserInfo = styled.div`
    flex: 1;
`;

const Username = styled.h1`
    font-size: 24px;
    font-weight: 600;
    margin: 0 0 4px 0;
    color: #ffffff;
`;

const UserHandle = styled.p`
    font-size: 14px;
    color: #8b949e;
    margin: 0 0 4px 0;
`;

const WalletAddress = styled.p`
    font-size: 12px;
    color: #6b7280;
    margin: 0;
    font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
`;



const StatsGrid = styled.div`
    display: flex;
    gap: 48px;
    margin-top: 24px;
    align-items: center;
`;

const StatItem = styled.div`
    display: flex;
    flex-direction: column;
    align-items: flex-start;
`;

const StatNumber = styled.div`
    font-size: 20px;
    font-weight: 600;
    color: #ffffff;
    margin-bottom: 4px;
    line-height: 1;
`;

const StatLabel = styled.div`
    font-size: 14px;
    color: #8b949e;
    font-weight: 500;
`;

const TabContainer = styled.div`
    background: #1a1a1a;
    border-radius: 12px;
    border: 1px solid #2a2a2a;
    margin-bottom: 24px;
`;

const TabNavigation = styled.div`
    display: flex;
    border-bottom: 1px solid #2a2a2a;
`;

const TabButton = styled.button`
    background: none;
    border: none;
    color: ${props => props.active ? '#ffffff' : '#8b949e'};
    padding: 12px 20px;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    border-bottom: 2px solid ${props => props.active ? '#8b5cf6' : 'transparent'};
    transition: all 0.2s ease;
    
    &:hover {
        color: #ffffff;
        background: rgba(139, 92, 246, 0.1);
    }
`;

const TabContent = styled.div`
    padding: 24px;
    min-height: 400px;
    overflow-y: auto;
`;

const GalleryGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 24px;
    padding-bottom: 24px;
`;

const NFTCard = styled.div`
    background: #1a1a1a;
    border-radius: 12px;
    border: 1px solid #2a2a2a;
    overflow: hidden;
    transition: all 0.2s ease;
    cursor: pointer;
    
    &:hover {
        transform: translateY(-4px);
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
        border-color: #8b5cf6;
    }
`;

const NFTImage = styled.div`
    width: 100%;
    height: 300px;
    background: linear-gradient(135deg, #2a2a2a 0%, #1a1a1a 100%);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 48px;
    color: #8b949e;
`;

const NFTInfo = styled.div`
    padding: 16px;
`;

const NFTTitle = styled.h3`
    font-size: 14px;
    font-weight: 500;
    color: #ffffff;
    margin: 0 0 6px 0;
`;

const NFTMeta = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 12px;
    color: #8b949e;
`;

const ProfilePage = () => {
    const [activeTab, setActiveTab] = useState('creations');
    const [userInfo, setUserInfo] = useState(null);
    const [artworks, setArtworks] = useState([]);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    const tabs = [
        { id: 'creations', label: 'My Creations'},
        { id: 'voting', label: 'Voting'},
        { id: 'minted', label: 'Minted' },
        { id: 'favorites', label: 'Favorites' }
    ];

    // 데이터 로딩
    const loadUserData = async () => {
        try {
            setLoading(true);
            
            // 사용자 정보
            const userInfo = localStorage.getItem('userInfo');
            if (userInfo) {
                setUserInfo(JSON.parse(userInfo));
            } else {
                return;
            }
            
            // 작품 목록
            const artworksResponse = await getUserArtworks();
            if (artworksResponse.success) {
                setArtworks(artworksResponse.artworks);
            }
            
            // 통계
            const statsResponse = await getUserStats();
            if (statsResponse.success) {
                setStats(statsResponse.stats);
            }
            
        } catch (error) {
            console.error('데이터 로딩 실패:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadUserData();
    }, []);

    return (
        <MainTemplate>
            <PageContainer>
                <ProfileHeader>
                    {userInfo && (
                        <ProfileInfo>
                            <Avatar>
                                <img 
                                    src={userInfo.picture} 
                                    alt="Profile" 
                                    style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }}
                                />
                            </Avatar>
                            <UserInfo>
                                <Username>{userInfo.display_name}</Username>
                                <UserHandle>{userInfo.email}</UserHandle>
                                <WalletAddress>{userInfo.wallet_address}</WalletAddress>
                            </UserInfo>
                        </ProfileInfo>
                    )}
                    
                    {stats && (
                        <StatsGrid>
                            <StatItem>
                                <StatNumber>{stats.total_artworks}</StatNumber>
                                <StatLabel>Total Artworks</StatLabel>
                            </StatItem>
                            <StatItem>
                                <StatNumber>{stats.approved_artworks}</StatNumber>
                                <StatLabel>Approved</StatLabel>
                            </StatItem>
                            <StatItem>
                                <StatNumber>{stats.vote_weight}</StatNumber>
                                <StatLabel>Vote Weight</StatLabel>
                            </StatItem>
                        </StatsGrid>
                    )}
                </ProfileHeader>

                <TabContainer>
                    <TabNavigation>
                        {tabs.map(tab => (
                            <TabButton
                                key={tab.id}
                                active={activeTab === tab.id}
                                onClick={() => setActiveTab(tab.id)}
                            >
                                {tab.label}
                            </TabButton>
                        ))}
                    </TabNavigation>
                    
                    <TabContent>
                        {loading ? (
                            <div style={{ padding: '40px', textAlign: 'center', color: '#8b949e' }}>
                                Loading...
                            </div>
                        ) : (
                            <GalleryGrid>
                                {artworks.map(artwork => (
                                    <NFTCard key={artwork.id}>
                                        <NFTImage>
                                            <img 
                                                src={artwork.image_ipfs_uri} 
                                                alt={artwork.title}
                                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                            />
                                        </NFTImage>
                                        <NFTInfo>
                                            <NFTTitle>{artwork.title}</NFTTitle>
                                            <NFTMeta>
                                                <span>{artwork.status}</span>
                                                <span>{artwork.description}</span>
                                            </NFTMeta>
                                        </NFTInfo>
                                    </NFTCard>
                                ))}
                            </GalleryGrid>
                        )}
                    </TabContent>
                </TabContainer>
            </PageContainer>
        </MainTemplate>
    );
};

export default ProfilePage; 