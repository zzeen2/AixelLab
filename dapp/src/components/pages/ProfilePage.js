import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { MainTemplate } from '../templates';
import { getUserArtworks, getUserStats } from '../../api/user';
import UserAvatar from '../atoms/ui/UserAvatar';

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
    border: 1px solid #333;
    padding: 24px;
    margin-bottom: 24px;
`;

const ProfileMainInfo = styled.div`
    display: flex;
    align-items: flex-start;
    gap: 16px;
    margin-bottom: 24px;
`;

const UserDetails = styled.div`
    flex: 1;
`;

const ProfileName = styled.h1`
    font-size: 28px;
    font-weight: 600;
    color: #ffffff;
    margin: 0 0 8px 0;
`;

const JoinedInfo = styled.div`
    font-size: 12px;
    color: #666;
    margin-bottom: 8px;
    text-transform: uppercase;
`;

const ProfileEmail = styled.p`
    font-size: 14px;
    color: #999;
    margin: 0 0 8px 0;
`;

const WalletAddress = styled.div`
    font-size: 12px;
    color: #666;
    font-family: monospace;
    background: #222;
    padding: 6px 8px;
    border: 1px solid #333;
    display: inline-block;
`;

const StatsGrid = styled.div`
    display: flex;
    gap: 32px;
    padding-top: 16px;
    border-top: 1px solid #333;
`;

const StatItem = styled.div``;

const StatValue = styled.div`
    font-size: 18px;
    font-weight: 500;
    color: #ffffff;
    margin-bottom: 2px;
`;

const StatLabel = styled.div`
    font-size: 11px;
    color: #666;
    text-transform: uppercase;
`;

const ContentSection = styled.div`
    background: #1a1a1a;
    border: 1px solid #333;
    padding: 24px;
`;

const SectionTitle = styled.h2`
    font-size: 20px;
    font-weight: 500;
    color: #ffffff;
    margin: 0 0 16px 0;
`;

const TabContainer = styled.div`
    display: flex;
    border-bottom: 1px solid #333;
    margin-bottom: 24px;
`;

const Tab = styled.button`
    padding: 12px 16px;
    background: none;
    border: none;
    color: ${props => props.active ? '#ffffff' : '#666'};
    font-size: 14px;
    font-weight: 400;
    cursor: pointer;
    border-bottom: 2px solid ${props => props.active ? '#ffffff' : 'transparent'};

    &:hover {
        color: #ffffff;
    }
`;

const ArtworkGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 16px;
`;

const ArtworkCard = styled.div`
    background: #222;
    border: 1px solid #333;
    cursor: pointer;

    &:hover {
        border-color: #444;
    }
`;

const ArtworkImage = styled.img`
    width: 100%;
    height: 200px;
    object-fit: cover;
    display: block;
`;

const ArtworkInfo = styled.div`
    padding: 12px;
`;

const ArtworkTitle = styled.h3`
    font-size: 14px;
    font-weight: 400;
    color: #ffffff;
    margin: 0 0 4px 0;
`;

const ArtworkDescription = styled.p`
    font-size: 12px;
    color: #666;
    margin: 0;
`;

const EmptyState = styled.div`
    text-align: center;
    padding: 48px 24px;
    color: #666;
`;

const ProfilePage = () => {
    const [activeTab, setActiveTab] = useState('created');
    const [userInfo, setUserInfo] = useState(null);
    const [artworks, setArtworks] = useState([]);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchUserInfo = async () => {
            try {
                const userInfo = localStorage.getItem('userInfo');
                if (userInfo) {
                    setUserInfo(JSON.parse(userInfo));
                }

                setArtworks([]);

                setStats({
                    eth: "0.00",
                    weth: "0.00", 
                    nfts: "0",
                    tokens: "0"
                });

            } catch (error) {
                console.error('사용자 정보 조회 실패:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchUserInfo();
    }, []);

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
                <ProfileHeader>
                    {userInfo && (
                        <>
                            <ProfileMainInfo>
                                <UserAvatar user={userInfo} size="80px" />
                                <UserDetails>
                                    <ProfileName>{userInfo.display_name}</ProfileName>
                                    <JoinedInfo>joined jul 2025</JoinedInfo>
                                    <ProfileEmail>
                                        {userInfo.email || `${userInfo.login_type || 'wallet'} user`}
                                    </ProfileEmail>
                                    <WalletAddress>
                                        {userInfo.wallet_address === '0x0000000000000000000000000000000000000000' 
                                            ? 'no wallet' 
                                            : `${userInfo.wallet_address.slice(0, 6)}...${userInfo.wallet_address.slice(-4)}`
                                        }
                                    </WalletAddress>
                                </UserDetails>
                            </ProfileMainInfo>
                            
                            <StatsGrid>
                                <StatItem>
                                    <StatValue>0.00</StatValue>
                                    <StatLabel>eth</StatLabel>
                                </StatItem>
                                <StatItem>
                                    <StatValue>0.00</StatValue>
                                    <StatLabel>weth</StatLabel>
                                </StatItem>
                                <StatItem>
                                    <StatValue>0</StatValue>
                                    <StatLabel>nfts</StatLabel>
                                </StatItem>
                                <StatItem>
                                    <StatValue>0</StatValue>
                                    <StatLabel>tokens</StatLabel>
                                </StatItem>
                            </StatsGrid>
                        </>
                    )}
                </ProfileHeader>

                <ContentSection>
                    <TabContainer>
                        <Tab 
                            active={activeTab === 'created'} 
                            onClick={() => setActiveTab('created')}
                        >
                            created
                        </Tab>
                        <Tab 
                            active={activeTab === 'collected'} 
                            onClick={() => setActiveTab('collected')}
                        >
                            collected
                        </Tab>
                        <Tab 
                            active={activeTab === 'favorited'} 
                            onClick={() => setActiveTab('favorited')}
                        >
                            favorited
                        </Tab>
                        <Tab 
                            active={activeTab === 'activity'} 
                            onClick={() => setActiveTab('activity')}
                        >
                            activity
                        </Tab>
                    </TabContainer>

                    {activeTab === 'created' && (
                        <>
                            <SectionTitle>created</SectionTitle>
                            {artworks.length > 0 ? (
                                <ArtworkGrid>
                                    {artworks.map((artwork, index) => (
                                        <ArtworkCard key={index}>
                                            <ArtworkImage 
                                                src={artwork.image_url} 
                                                alt={artwork.title}
                                            />
                                            <ArtworkInfo>
                                                <ArtworkTitle>{artwork.title}</ArtworkTitle>
                                                <ArtworkDescription>{artwork.description}</ArtworkDescription>
                                            </ArtworkInfo>
                                        </ArtworkCard>
                                    ))}
                                </ArtworkGrid>
                            ) : (
                                <EmptyState>
                                    <div>no items</div>
                                </EmptyState>
                            )}
                        </>
                    )}

                    {activeTab === 'collected' && (
                        <EmptyState>
                            <div>no collected items</div>
                        </EmptyState>
                    )}

                    {activeTab === 'favorited' && (
                        <EmptyState>
                            <div>no favorited items</div>
                        </EmptyState>
                    )}

                    {activeTab === 'activity' && (
                        <EmptyState>
                            <div>no activity</div>
                        </EmptyState>
                    )}
                </ContentSection>
            </PageContainer>
        </MainTemplate>
    );
};

export default ProfilePage; 