import React, { useState } from 'react';
import styled from 'styled-components';
import { MainTemplate } from '../templates';

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
    margin: 0 0 8px 0;
`;



const StatsGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
    gap: 12px;
    margin-top: 16px;
`;

const StatCard = styled.div`
    background: rgba(255, 255, 255, 0.03);
    border-radius: 8px;
    padding: 16px;
    text-align: center;
    border: 1px solid #2a2a2a;
`;

const StatNumber = styled.div`
    font-size: 18px;
    font-weight: 600;
    color: #ffffff;
    margin-bottom: 4px;
`;

const StatLabel = styled.div`
    font-size: 12px;
    color: #8b949e;
    text-transform: uppercase;
    letter-spacing: 0.5px;
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

    const tabs = [
        { id: 'creations', label: 'My Creations'},
        { id: 'voting', label: 'Voting'},
        { id: 'minted', label: 'Minted' },
        { id: 'favorites', label: 'Favorites' }
    ];

    // todo
    const mockStats = {
        totalCreations: 25,
        mintedNFTs: 8,
        votingNFTs: 3,
        totalEarnings: '2.5 ETH',
        followers: 1200,
        likes: 5600
    };
    //todo
    const mockNFTs = [
        { id: 1, title: 'Pixel Cat #1', status: 'Minted', price: '0.1 ETH' },
        { id: 2, title: 'AI Dragon', status: 'Voting', price: null },
        { id: 3, title: 'Retro Game', status: 'Draft', price: null },
        { id: 4, title: 'Pixel Landscape', status: 'Minted', price: '0.05 ETH' }
    ];

    return (
        <MainTemplate>
            <PageContainer>
                <ProfileHeader>
                    <ProfileInfo>
                        <Avatar></Avatar>
                        <UserInfo>
                            <Username>PixelArtist123</Username>
                            <UserHandle>@pixelartist123</UserHandle>
                        </UserInfo>
                    </ProfileInfo>
                    
                    <StatsGrid>
                        <StatCard>
                            <StatNumber>{mockStats.totalCreations}</StatNumber>
                            <StatLabel>Total Creations</StatLabel>
                        </StatCard>
                        <StatCard>
                            <StatNumber>{mockStats.mintedNFTs}</StatNumber>
                            <StatLabel>Minted NFTs</StatLabel>
                        </StatCard>
                        <StatCard>
                            <StatNumber>{mockStats.votingNFTs}</StatNumber>
                            <StatLabel>Voting Now</StatLabel>
                        </StatCard>
                        <StatCard>
                            <StatNumber>{mockStats.totalEarnings}</StatNumber>
                            <StatLabel>Total Earnings</StatLabel>
                        </StatCard>
                        <StatCard>
                            <StatNumber>{mockStats.followers}</StatNumber>
                            <StatLabel>Followers</StatLabel>
                        </StatCard>
                        <StatCard>
                            <StatNumber>{mockStats.likes}</StatNumber>
                            <StatLabel>Likes Received</StatLabel>
                        </StatCard>
                    </StatsGrid>
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
                        <GalleryGrid>
                            {mockNFTs.map(nft => (
                                <NFTCard key={nft.id}>
                                    <NFTImage></NFTImage>
                                    <NFTInfo>
                                        <NFTTitle>{nft.title}</NFTTitle>
                                        <NFTMeta>
                                            <span>{nft.status}</span>
                                            {nft.price && <span>{nft.price}</span>}
                                        </NFTMeta>
                                    </NFTInfo>
                                </NFTCard>
                            ))}
                        </GalleryGrid>
                    </TabContent>
                </TabContainer>
            </PageContainer>
        </MainTemplate>
    );
};

export default ProfilePage; 