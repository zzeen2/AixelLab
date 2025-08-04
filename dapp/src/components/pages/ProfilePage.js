import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import MainTemplate from '../templates/MainTemplate';
import UserAvatar from '../atoms/ui/UserAvatar';
import { getUserArtworks, getUserStats } from '../../api/user';
import { getWalletStatus, createWallet } from '../../api/auth';

const PageContainer = styled.div`
    padding: 24px 0;
    background-color: #0d1017;
    min-height: 100vh;
    color: #ffffff;
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
    text-transform: uppercase;
    margin-bottom: 8px;
`;

const ProfileEmail = styled.div`
    font-size: 14px;
    color: #999;
    margin-bottom: 8px;
`;

const WalletAddress = styled.div`
    font-size: 12px;
    color: #666;
    font-family: monospace;
    background: #222;
    padding: 6px 8px;
    border: 1px solid #333;
    display: inline-block;
    cursor: pointer;
    transition: background 0.2s;
    
    &:hover {
        background: #333;
        color: #fff;
    }
`;

const WalletSection = styled.div`
    display: flex;
    align-items: center;
    gap: 12px;
    margin-top: 8px;
`;

const CreateWalletButton = styled.button`
    background: #007bff;
    color: white;
    border: none;
    padding: 8px 16px;
    border-radius: 4px;
    font-size: 12px;
    cursor: pointer;
    transition: background 0.2s;
    
    &:hover {
        background: #0056b3;
    }
    
    &:disabled {
        background: #666;
        cursor: not-allowed;
    }
`;

const WalletStatus = styled.div`
    font-size: 12px;
    color: #28a745;
    display: flex;
    align-items: center;
    gap: 4px;
`;

const Modal = styled.div`
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
`;

const ModalContent = styled.div`
    background: #1a1a1a;
    border: 1px solid #333;
    border-radius: 8px;
    padding: 24px;
    width: 400px;
    max-width: 90vw;
`;

const ModalTitle = styled.h2`
    color: #ffffff;
    margin: 0 0 16px 0;
    font-size: 18px;
`;

const PasswordInput = styled.input`
    width: 100%;
    padding: 12px;
    background: #222;
    border: 1px solid #333;
    border-radius: 4px;
    color: #ffffff;
    font-size: 14px;
    margin-bottom: 16px;
    
    &:focus {
        outline: none;
        border-color: #007bff;
    }
`;

const ModalButtons = styled.div`
    display: flex;
    gap: 12px;
    justify-content: flex-end;
`;

const ModalButton = styled.button`
    padding: 8px 16px;
    border: none;
    border-radius: 4px;
    font-size: 14px;
    cursor: pointer;
    
    &.primary {
        background: #007bff;
        color: white;
        
        &:hover {
            background: #0056b3;
        }
    }
    
    &.secondary {
        background: #666;
        color: white;
        
        &:hover {
            background: #555;
        }
    }
    
    &:disabled {
        background: #444;
        cursor: not-allowed;
    }
`;

const StatsGrid = styled.div`
    display: flex;
    gap: 32px;
    padding-top: 16px;
    border-top: 1px solid #333;
`;

const StatItem = styled.div`
    text-align: left;
`;

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
    margin: 0 0 8px 0;
`;

const ArtworkStatus = styled.span`
    font-size: 10px;
    color: #999;
    background-color: #333;
    padding: 2px 6px;
    border-radius: 4px;
    display: inline-block;
`;

const EmptyState = styled.div`
    text-align: center;
    padding: 48px 24px;
    color: #666;
`;

const LoadingSpinner = styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
    height: 200px;
    color: #666;
`;

const ProfilePage = () => {
    const [activeTab, setActiveTab] = useState('created');
    const [userInfo, setUserInfo] = useState(null);
    const [artworks, setArtworks] = useState([]);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    
    // 지갑 관련 state
    const [walletStatus, setWalletStatus] = useState(null);
    const [showCreateWalletModal, setShowCreateWalletModal] = useState(false);
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isCreatingWallet, setIsCreatingWallet] = useState(false);

    // 지갑 상태 조회
    const fetchWalletStatus = async () => {
        try {
            const response = await getWalletStatus();
            console.log('지갑 상태 응답:', response); // 디버깅용
            
            // 백엔드에서 wallet 객체 안에 데이터를 보냄
            if (response.success && response.wallet) {
                setWalletStatus(response.wallet);
            } else {
                setWalletStatus(response);
            }
        } catch (error) {
            console.error('지갑 상태 조회 실패:', error);
        }
    };

    // 지갑 생성
    const handleCreateWallet = async () => {
        if (!password || !confirmPassword) {
            alert('비밀번호를 입력해주세요.');
            return;
        }
        
        if (password !== confirmPassword) {
            alert('비밀번호가 일치하지 않습니다.');
            return;
        }
        
        if (password.length < 8) {
            alert('비밀번호는 8자 이상이어야 합니다.');
            return;
        }
        
        setIsCreatingWallet(true);
        try {
            const response = await createWallet(password);
            console.log('지갑 생성 응답:', response); // 디버깅용
            
            if (response.success) {
                alert('지갑이 성공적으로 생성되었습니다!');
                setShowCreateWalletModal(false);
                setPassword('');
                setConfirmPassword('');
                
                // 지갑 상태 새로고침
                await fetchWalletStatus();
                
                // 사용자 정보도 업데이트 (localStorage)
                const currentUserInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
                const updatedUserInfo = {
                    ...currentUserInfo,
                    wallet_created: true,
                    eoa_address: response.eoaAddress
                };
                localStorage.setItem('userInfo', JSON.stringify(updatedUserInfo));
                setUserInfo(updatedUserInfo);
                
                // 지갑 상태도 즉시 업데이트
                setWalletStatus({
                    walletCreated: true,
                    eoaAddress: response.eoaAddress,
                    loginType: 'google'
                });
            }
        } catch (error) {
            alert('지갑 생성에 실패했습니다: ' + (error.response?.data?.message || error.message));
        } finally {
            setIsCreatingWallet(false);
        }
    };

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                // 로컬 스토리지에서 사용자 정보 가져오기
                const userInfo = localStorage.getItem('userInfo');
                if (userInfo) {
                    setUserInfo(JSON.parse(userInfo));
                    // Google 사용자인 경우 지갑 상태 조회
                    if (JSON.parse(userInfo).login_type === 'google') {
                        await fetchWalletStatus();
                    }
                }

                // 실제 작품 데이터 가져오기
                try {
                    const artworksResponse = await getUserArtworks();
                    if (artworksResponse.success) {
                        setArtworks(artworksResponse.artworks);
                    }
                } catch (error) {
                    console.error('작품 조회 실패:', error);
                    setArtworks([]);
                }

                // 실제 통계 데이터 가져오기
                try {
                    const statsResponse = await getUserStats();
                    if (statsResponse.success) {
                        setStats({
                            eth: "0.00",
                            weth: "0.00", 
                            artworks: statsResponse.stats.total_artworks.toString(),
                            approved: statsResponse.stats.approved_artworks.toString()
                        });
                    }
                } catch (error) {
                    console.error('통계 조회 실패:', error);
                    setStats({
                        eth: "0.00",
                        weth: "0.00", 
                        artworks: "0",
                        approved: "0"
                    });
                }

            } catch (error) {
                console.error('사용자 정보 조회 실패:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchUserData();
    }, []);

    if (loading) {
        return (
            <MainTemplate>
                <PageContainer>
                    <LoadingSpinner>
                        Loading...
                    </LoadingSpinner>
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
                                    <ProfileName>{userInfo.display_name || 'Anonymous User'}</ProfileName>
                                    <JoinedInfo>joined jul 2025</JoinedInfo>
                                    <ProfileEmail>{userInfo.email || `${userInfo.login_type || 'wallet'} user`}</ProfileEmail>
                                    
                                    {/* Google 사용자의 경우 지갑 상태 표시 */}
                                    {userInfo.login_type === 'google' ? (
                                        <WalletSection>
                                            {walletStatus?.walletCreated ? (
                                                /* 지갑 생성 완료 - 주소만 표시 */
                                                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                                    <div style={{ fontSize: '12px', color: '#666' }}>지갑 주소:</div>
                                                    <WalletAddress
                                                        onClick={() => {
                                                            if (walletStatus.eoaAddress) {
                                                                navigator.clipboard.writeText(walletStatus.eoaAddress);
                                                                alert('주소가 복사되었습니다!');
                                                            }
                                                        }}
                                                        title="클릭하여 전체 주소 복사"
                                                    >
                                                        {walletStatus.eoaAddress 
                                                            ? `${walletStatus.eoaAddress.slice(0, 6)}...${walletStatus.eoaAddress.slice(-4)}`
                                                            : 'loading...'
                                                        }
                                                    </WalletAddress>
                                                    <WalletStatus>✓ 지갑 사용 가능 (클릭하여 주소 복사)</WalletStatus>
                                                </div>
                                            ) : (
                                                /* 지갑 미생성 - 생성 버튼 표시 */
                                                <>
                                                    <WalletAddress>지갑이 생성되지 않음</WalletAddress>
                                                    <CreateWalletButton onClick={() => setShowCreateWalletModal(true)}>
                                                        지갑 생성
                                                    </CreateWalletButton>
                                                </>
                                            )}
                                        </WalletSection>
                                    ) : (
                                        /* MetaMask 사용자의 경우 기존 방식 */
                                        <WalletAddress>
                                            {userInfo.wallet_address && userInfo.wallet_address !== '0x0000000000000000000000000000000000000000' 
                                                ? `${userInfo.wallet_address.slice(0, 6)}...${userInfo.wallet_address.slice(-4)}`
                                                : 'no wallet connected'
                                            }
                                        </WalletAddress>
                                    )}
                                </UserDetails>
                            </ProfileMainInfo>
                            
                            <StatsGrid>
                                <StatItem>
                                    <StatValue>{stats?.eth || '0.00'}</StatValue>
                                    <StatLabel>eth</StatLabel>
                                </StatItem>
                                <StatItem>
                                    <StatValue>{stats?.weth || '0.00'}</StatValue>
                                    <StatLabel>weth</StatLabel>
                                </StatItem>
                                <StatItem>
                                    <StatValue>{stats?.artworks || '0'}</StatValue>
                                    <StatLabel>artworks</StatLabel>
                                </StatItem>
                                <StatItem>
                                    <StatValue>{stats?.approved || '0'}</StatValue>
                                    <StatLabel>approved</StatLabel>
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
                            created ({artworks.length})
                        </Tab>
                        <Tab 
                            active={activeTab === 'collected'} 
                            onClick={() => setActiveTab('collected')}
                        >
                            collected (0)
                        </Tab>
                        <Tab 
                            active={activeTab === 'favorited'} 
                            onClick={() => setActiveTab('favorited')}
                        >
                            favorited (0)
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
                            {artworks.length > 0 ? (
                                <ArtworkGrid>
                                    {artworks.map((artwork) => (
                                        <ArtworkCard key={artwork.id}>
                                            <ArtworkImage 
                                                src={artwork.image_ipfs_uri} 
                                                alt={artwork.title}
                                                onError={(e) => {
                                                    e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjMzMzIi8+Cjx0ZXh0IHg9IjEwMCIgeT0iMTAwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSIjNjY2IiBmb250LXNpemU9IjE0Ij5Image not found</text></svg>';
                                                }}
                                            />
                                            <ArtworkInfo>
                                                <ArtworkTitle>{artwork.title}</ArtworkTitle>
                                                <ArtworkDescription>
                                                    {artwork.description || 'No description'}
                                                </ArtworkDescription>
                                                <ArtworkStatus>
                                                    {artwork.status}
                                                </ArtworkStatus>
                                            </ArtworkInfo>
                                        </ArtworkCard>
                                    ))}
                                </ArtworkGrid>
                            ) : (
                                <EmptyState>
                                    <div>작품이 없습니다</div>
                                </EmptyState>
                            )}
                        </>
                    )}

                    {activeTab === 'collected' && (
                        <EmptyState>
                            <div>수집한 작품이 없습니다</div>
                        </EmptyState>
                    )}

                    {activeTab === 'favorited' && (
                        <EmptyState>
                            <div>좋아하는 작품이 없습니다</div>
                        </EmptyState>
                    )}

                    {activeTab === 'activity' && (
                        <EmptyState>
                            <div>활동 내역이 없습니다</div>
                        </EmptyState>
                    )}
                </ContentSection>
            </PageContainer>
            
            {/* 지갑 생성 모달 */}
            {showCreateWalletModal && (
                <Modal>
                    <ModalContent>
                        <ModalTitle>지갑 생성</ModalTitle>
                        <p style={{ color: '#999', fontSize: '14px', marginBottom: '16px' }}>
                            안전한 비밀번호를 입력하여 지갑을 생성하세요. 이 비밀번호는 민팅 시 필요합니다.
                        </p>
                        
                        <PasswordInput
                            type="password"
                            placeholder="비밀번호 (8자 이상)"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                        
                        <PasswordInput
                            type="password"
                            placeholder="비밀번호 확인"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                        />
                        
                        <ModalButtons>
                            <ModalButton 
                                className="secondary" 
                                onClick={() => {
                                    setShowCreateWalletModal(false);
                                    setPassword('');
                                    setConfirmPassword('');
                                }}
                            >
                                취소
                            </ModalButton>
                            <ModalButton 
                                className="primary" 
                                onClick={handleCreateWallet}
                                disabled={isCreatingWallet}
                            >
                                {isCreatingWallet ? '생성 중...' : '지갑 생성'}
                            </ModalButton>
                        </ModalButtons>
                    </ModalContent>
                </Modal>
            )}
        </MainTemplate>
    );
};

export default ProfilePage; 