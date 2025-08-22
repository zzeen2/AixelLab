import React, { useEffect, useState, useRef } from "react";
import styled from "styled-components";
import { NetworkInfo, WalletInfo} from "../atoms";
import { SearchBar } from "../molecules";
import { useNavigate } from 'react-router-dom';
import { getCurrentUser, requestMetaMaskMessage, verifyMetaMaskSignature } from '../../api/auth';
import UserAvatar from '../atoms/ui/UserAvatar';
import { ethers } from 'ethers';

const HeaderContainer = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    height: 100%;
    padding: 0 24px;
    background-color: #0d1017;
    border-bottom: 1px solid var(--border-primary);
    box-shadow: var(--shadow-sm);
`;

const Left = styled.div`
    display: flex;
    align-items: center;
    gap: 20px;
`;

const Center = styled.div`
    flex: 1;
    margin-left: 40px;
    margin-right: 40px;
`;

const Right = styled.div`
    display: flex;
    align-items: center;
    gap: 16px;
    position: relative;
    padding-right: 24px;
`;

const UserStats = styled.div`
    display: flex;
    align-items: center;
    color: var(--text-secondary);
    font-size: 14px;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
`;

const Divider = styled.div`
    width: 1px;
    height: 20px;
    background-color: rgba(255, 255, 255, 0.1);
    margin: 0 12px;
`;

const StatItem = styled.div`
    display: flex;
    align-items: center;
    padding: 8px 16px;
    background: rgba(255, 255, 255, 0.05);
    border-radius: 12px;
    border: 1px solid rgba(255, 255, 255, 0.1);
    transition: all 0.2s;
    cursor: pointer;
    
    &:hover {
        background: rgba(255, 255, 255, 0.1);
        border-color: rgba(255, 255, 255, 0.2);
    }
`;

const StatValue = styled.span`
    font-weight: 600;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
    color: var(--text-primary);
    font-size: 14px;
`;

const BalanceItem = styled.span`
    font-family: 'SF Mono', Monaco, 'Cascadia Code', 'Roboto Mono', Consolas, 'Courier New', monospace;
    font-size: 13px;
`;

const ProfileIcon = styled.div`
    width: 40px;
    height: 40px;
    border-radius: 50%;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s;
    
    &:hover {
        transform: scale(1.05);
        box-shadow: var(--shadow-md);
    }
`;

const ProfileImage = styled.img`
    width: 100%;
    height: 100%;
    border-radius: 50%;
    object-fit: cover;
`;

const QuestionMark = styled.div`
    font-size: 20px;
    font-weight: bold;
    color: var(--text-tertiary);
`;

const LoginModal = styled.div`
    position: absolute;
    top: 50px;
    right: 0;
    background: #1a1a1a;
    border: 1px solid #333;
    border-radius: 12px;
    padding: 20px;
    min-width: 280px;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.6);
    z-index: 1000;
    opacity: ${props => props.show ? 1 : 0};
    visibility: ${props => props.show ? 'visible' : 'hidden'};
    transform: translateY(${props => props.show ? '0' : '-10px'});
    transition: all 0.3s ease;
`;

const ModalTitle = styled.h3`
    font-size: 18px;
    font-weight: 600;
    color: #ffffff;
    margin: 0 0 16px 0;
    text-align: center;
`;

const LoginOption = styled.div`
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px 16px;
    border: 1px solid #333;
    border-radius: 8px;
    cursor: pointer;
    margin-bottom: 12px;
    transition: all 0.2s;
    background: #2a2a2a;
    
    &:hover {
        border-color: #8b5cf6;
        background: #333;
        transform: translateY(-1px);
    }
    
    &:last-child {
        margin-bottom: 0;
    }
`;

const OptionIcon = styled.div`
    width: 24px;
    height: 24px;
    border-radius: 4px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 16px;
`;

const OptionText = styled.div`
    flex: 1;
`;

const OptionTitle = styled.div`
    font-size: 14px;
    font-weight: 600;
    color: #ffffff;
    margin-bottom: 2px;
`;

const OptionDesc = styled.div`
    font-size: 12px;
    color: #999;
`;

const Overlay = styled.div`
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 999;
    opacity: ${props => props.show ? 1 : 0};
    visibility: ${props => props.show ? 'visible' : 'hidden'};
    transition: all 0.3s ease;
`;


const ProfileModal = styled.div`
    position: absolute;
    top: 50px;
    right: 0;
    background: #1a1a1a;
    border: 1px solid #333;
    border-radius: 12px;
    padding: 20px;
    min-width: 320px;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.6);
    z-index: 1000;
    opacity: ${props => props.show ? 1 : 0};
    visibility: ${props => props.show ? 'visible' : 'hidden'};
    transform: translateY(${props => props.show ? '0' : '-10px'});
    transition: all 0.3s ease;
`;

const ProfileHeader = styled.div`
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 16px;
    padding-bottom: 16px;
    border-bottom: 1px solid #333;
`;

const ProfileImageLarge = styled.img`
    width: 48px;
    height: 48px;
    border-radius: 50%;
    object-fit: cover;
`;

const ProfileInfo = styled.div`
    flex: 1;
`;

const ProfileDisplayName = styled.div`
    font-size: 16px;
    font-weight: 600;
    color: #ffffff;
    margin-bottom: 4px;
`;

const ProfileEmail = styled.div`
    font-size: 14px;
    color: #999;
`;

const MenuSection = styled.div`
    margin-bottom: 16px;
    
    &:last-child {
        margin-bottom: 0;
    }
`;

const MenuItem = styled.div`
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px 16px;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.2s;
    
    &:hover {
        background: #333;
        transform: translateX(4px);
    }
`;

const MenuIcon = styled.div`
    width: 20px;
    height: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 16px;
`;

const MenuText = styled.div`
    flex: 1;
    font-size: 14px;
    font-weight: 500;
    color: ${props => props.danger ? '#ef4444' : '#ffffff'};
`;

const WalletAddress = styled.div`
    font-size: 12px;
    color: #999;
    font-family: 'SF Mono', Monaco, monospace;
    background: #2a2a2a;
    padding: 8px 12px;
    border-radius: 6px;
    margin-bottom: 12px;
    word-break: break-all;
`;

const Header = () => {
    const navigate = useNavigate();
    const [userInfo, setUserInfo] = useState(null);
    const [showLoginModal, setShowLoginModal] = useState(false);
    const [showProfileModal, setShowProfileModal] = useState(false);
    const [isMetaMaskLoading, setIsMetaMaskLoading] = useState(false);
    const modalRef = useRef(null);

    // 유저 정보 가져오기
    useEffect(() => {
        const fetchUserInfo = async () => {
            const user = localStorage.getItem('userInfo');
            if(user) {
                setUserInfo(JSON.parse(user));
            } else {
                try {
                    const data = await getCurrentUser();
                    if (data.success && data.user) {
                        localStorage.setItem('userInfo', JSON.stringify(data.user));
                        setUserInfo(data.user);
                    }
                } catch (error) {
                    console.error('사용자 정보 조회 실패:', error);
                }
            }
        };
        
        fetchUserInfo();
    }, []);

    // localStorage 변경 감지
    useEffect(() => {
        const handleStorageChange = () => {
            const user = localStorage.getItem('userInfo');
            if(user) {
                setUserInfo(JSON.parse(user));
            } else {
                setUserInfo(null);
            }
        };

        // 페이지 로드 시 유저 정보 확인
        const user = localStorage.getItem('userInfo');
        if(user) {
            setUserInfo(JSON.parse(user));
        }

        window.addEventListener('storage', handleStorageChange);
        return () => window.removeEventListener('storage', handleStorageChange);
    }, []);

    // 사용자 통계 가져오기
    useEffect(() => {
        if (userInfo) {
            fetchUserStats();
            fetchWalletBalance();
        }
    }, [userInfo]);

    // 모달 외부 클릭 감지
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (modalRef.current && !modalRef.current.contains(event.target)) {
                setShowLoginModal(false);
                setShowProfileModal(false);
            }
        };

        if (showLoginModal || showProfileModal) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [showLoginModal, showProfileModal]);

    const handleProfileClick = () => {
        if(userInfo) {
            // 로그인된 경우: 프로필 모달 표시
            setShowProfileModal(!showProfileModal);
            setShowLoginModal(false);
        } else {
            // 로그인 안된 경우: 로그인 옵션 모달 표시
            setShowLoginModal(!showLoginModal);
            setShowProfileModal(false);
        }
    };

    const handleGoogleLogin = () => {
        window.location.href = 'http://localhost:4000/auth/google';
        setShowLoginModal(false);
    };

    const handleMetaMaskLogin = async () => {
        if (isMetaMaskLoading) return;
        
        setIsMetaMaskLoading(true);
        
        try {
            // 메타마스크 연결 확인
            if (typeof window.ethereum === 'undefined') {
                alert('MetaMask is not installed.');
                return;
            }

            // 계정 연결 요청
            const accounts = await window.ethereum.request({
                method: 'eth_requestAccounts'
            });
            
            if (accounts.length === 0) {
                alert('Please select an account in MetaMask.');
                return;
            }

            const walletAddress = accounts[0];
            console.log('연결된 지갑 주소', walletAddress);

            // 서버에서 서명할 메시지 요청
            const messageResponse = await requestMetaMaskMessage(walletAddress);
            
            if (!messageResponse.success) {
                alert('Signature message generation failed.');
                return;
            }

            const message = messageResponse.message;
            // console.log('서명할 메시지:', message);

            // 사용자에게 서명 요청
            const signature = await window.ethereum.request({
                method: 'personal_sign',
                params: [message, walletAddress]
            });

            console.log('서명 완료', signature);

            const verifyResponse = await verifyMetaMaskSignature(
                walletAddress, 
                signature
            );

            if (verifyResponse.success) {
                const userData = verifyResponse.user;
                
                localStorage.setItem('userInfo', JSON.stringify(userData));
                setUserInfo(userData);
                setShowLoginModal(false);
                
                window.location.reload();
            } else {
                alert('Login failed. Please try again in a moment');
            }
        } catch (error) {
            console.error('MetaMask 로그인 오류:', error);
        } finally {
            setIsMetaMaskLoading(false);
        }
    };

    const handleProfilePage = () => {
        navigate('/profile');
        setShowProfileModal(false);
    };

    const handleLogout = async () => {
        try {
            const response = await fetch('http://localhost:4000/auth/logout', {
                credentials: 'include'
            });
            
            if (response.ok) {
                // 로컬 스토리지 삭제
                localStorage.removeItem('userInfo');
                setUserInfo(null);
                setShowProfileModal(false);
                
                // 메인 페이지로 이동
                navigate('/');
                
                // 페이지 새로고침으로 상태 완전 초기화
                window.location.reload();
            }
        } catch (error) {
            console.error('로그아웃 실패:', error);
            alert('로그아웃에 실패했습니다.');
        }
    };

    const [userStats, setUserStats] = useState({
        nftCount: 0,
        voteCount: 0,
        artworkCount: 0,
        ethBalance: '0.00',
        wethBalance: '0.00'
    });

    // 사용자 통계 가져오기
    const fetchUserStats = async () => {
        if (!userInfo) return;
        
        try {
            // 실제 API 호출로 교체 가능
            // const response = await fetch('/api/user/stats');
            // const stats = await response.json();
            
            // 임시 더미 데이터
            setUserStats({
                nftCount: Math.floor(Math.random() * 10),
                voteCount: Math.floor(Math.random() * 50),
                artworkCount: Math.floor(Math.random() * 20),
                ethBalance: (Math.random() * 2).toFixed(4),
                wethBalance: (Math.random() * 1).toFixed(4)
            });
        } catch (error) {
            console.error('사용자 통계 가져오기 실패:', error);
        }
    };

    // 주소 유효성 보장: 공백 제거 후 체크섬 주소로 정규화, 실패 시 null 반환
    const normalizeAddress = (maybeAddress) => {
        try {
            if (!maybeAddress) return null;
            const trimmed = String(maybeAddress).trim();
            return ethers.getAddress(trimmed);
        } catch {
            return null;
        }
    };

    // 지갑 잔액 가져오기 (로그인 타입별 분기)
    const fetchWalletBalance = async () => {
        if (!userInfo) return;
        try {
            const hasProvider = typeof window.ethereum !== 'undefined';

            // 표시할 주소 결정
            const displayAddress = userInfo.login_type === 'google'
                ? (userInfo.eoa_address || userInfo.wallet_address)
                : userInfo.wallet_address;

            const normalizedDisplay = normalizeAddress(displayAddress);
            if (!normalizedDisplay || normalizedDisplay === '0x0000000000000000000000000000000000000000') {
                setUserStats(prev => ({ ...prev, ethBalance: '0.00' }));
                return;
            }

            if (hasProvider) {
                // 메타마스크 로그인: 현재 연결 계정의 잔액
                if (userInfo.login_type === 'metamask') {
                    const accounts = await window.ethereum.request({ method: 'eth_accounts' });
                    if (accounts.length > 0) {
                        const accountAddr = normalizeAddress(accounts[0]);
                        if (!accountAddr) throw new Error('Invalid MetaMask account address');
                        const balance = await window.ethereum.request({
                            method: 'eth_getBalance',
                            params: [accountAddr, 'latest']
                        });
                        const ethBalance = (parseInt(balance, 16) / 1e18).toFixed(4);
                        setUserStats(prev => ({ ...prev, ethBalance }));
                        return;
                    }
                }

                // 구글 로그인: 해당 사용자의 지갑 주소로 직접 잔액 조회
                const balance = await window.ethereum.request({
                    method: 'eth_getBalance',
                    params: [normalizedDisplay, 'latest']
                });
                const ethBalance = (parseInt(balance, 16) / 1e18).toFixed(4);
                setUserStats(prev => ({ ...prev, ethBalance }));
            } else {
                // Provider 없음: 잔액 조회 불가
                setUserStats(prev => ({ ...prev, ethBalance: '0.00' }));
            }
        } catch (error) {
            console.error('지갑 잔액 가져오기 실패:', error);
            setUserStats(prev => ({ ...prev, ethBalance: '0.00' }));
        }
    };

    const formatWalletAddress = (address) => {
        if (!address || address === '0x0000000000000000000000000000000000000000') {
            return 'No wallet connected';
        }
        return `${address.slice(0, 6)}...${address.slice(-4)}`;
    };

    const getDisplayAddress = () => {
        if (!userInfo) return '';
        return userInfo.login_type === 'google'
            ? (userInfo.eoa_address || userInfo.wallet_address || '')
            : (userInfo.wallet_address || '');
    };
    
    return (
        <HeaderContainer>
            <Left>
            </Left>
            <div style={{ marginLeft: '80px' }}>
                <SearchBar />
            </div>
            <Center>
            </Center>
            <Right>
                {userInfo ? (
                    <UserStats>
                        <StatItem>
                            <StatValue>{userStats.ethBalance} ETH</StatValue>
                        </StatItem>
                        <Divider />
                        <StatItem>
                            <StatValue>{formatWalletAddress(getDisplayAddress())}</StatValue>
                        </StatItem>
                    </UserStats>
                ) : (
                    <UserStats>
                        <StatItem>
                            <StatValue>Connect to start</StatValue>
                        </StatItem>
                    </UserStats>
                )}
                <div ref={modalRef}>
                    <ProfileIcon onClick={handleProfileClick}>
                        {userInfo ? (
                            <UserAvatar 
                                user={userInfo} 
                                size="32px" 
                                clickable={true}
                            />
                        ) : (
                            <QuestionMark>?</QuestionMark>
                        )}
                    </ProfileIcon>
                    
                    {/* 로그인 안된 상태 모달 */}
                    <LoginModal show={showLoginModal}>
                        <ModalTitle>🔐 Connect Wallet</ModalTitle>
                        
                        <LoginOption onClick={handleGoogleLogin}>
                            <OptionIcon style={{ background: '#4285F4', color: 'white' }}>
                                G
                            </OptionIcon>
                            <OptionText>
                                <OptionTitle>Google Login</OptionTitle>
                                <OptionDesc>Continue with your Google account</OptionDesc>
                            </OptionText>
                        </LoginOption>
                        
                        <LoginOption onClick={handleMetaMaskLogin} disabled={isMetaMaskLoading}>
                            <OptionIcon style={{ 
                                background: isMetaMaskLoading ? '#666' : '#F6851B', 
                                color: 'white' 
                            }}>
                                {isMetaMaskLoading ? '⏳' : '🦊'}
                            </OptionIcon>
                            <OptionText>
                                <OptionTitle>
                                    {isMetaMaskLoading ? 'Connecting...' : 'MetaMask'}
                                </OptionTitle>
                                <OptionDesc>
                                    {isMetaMaskLoading ? 'Please wait...' : 'Connect using browser wallet'}
                                </OptionDesc>
                            </OptionText>
                        </LoginOption>
                    </LoginModal>

                    {/* 로그인된 상태 모달 */}
                    <ProfileModal show={showProfileModal}>
                        <ProfileHeader>
                            <UserAvatar 
                                user={userInfo} 
                                size="48px" 
                                clickable={false}
                            />
                            <ProfileInfo>
                                <ProfileDisplayName>{userInfo?.display_name}</ProfileDisplayName>
                                <ProfileEmail>
                                    {userInfo?.email || `${userInfo?.login_type || 'wallet'} user`}
                                </ProfileEmail>
                            </ProfileInfo>
                        </ProfileHeader>

                        <MenuSection>
                            <MenuItem onClick={handleLogout}>
                                <MenuIcon>🚪</MenuIcon>
                                <MenuText danger>Logout</MenuText>
                            </MenuItem>
                        </MenuSection>
                    </ProfileModal>
                </div>
            </Right>
            
            <Overlay show={showLoginModal || showProfileModal} onClick={() => {
                setShowLoginModal(false);
                setShowProfileModal(false);
            }} />
        </HeaderContainer>
    );
};

export default Header;
