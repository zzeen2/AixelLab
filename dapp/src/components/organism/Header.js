import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { NetworkInfo, WalletInfo} from "../atoms";
import { SearchBar } from "../molecules";
import { useNavigate } from 'react-router-dom';
import { getCurrentUser } from '../../api/auth';

const HeaderContainer = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    height: 100%;
    padding: 0 24px;
    background-color: #1a1a1a;
`;

const Left = styled.div`
    display: flex;
    align-items: center;
    gap: 20px;
`;

const Center = styled.div`
    flex: 1;
    max-width: 500px;
    margin: 0 40px;
`;

const Right = styled.div`
    display: flex;
    align-items: center;
    gap: 16px;
`;

const TokenBalance = styled.div`
    display: flex;
    align-items: center;
    gap: 12px;
    color: #ffffff;
    font-size: 14px;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
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
    border: 2px solid #333;
    transition: all 0.2s;
    background: #2a2a2a;
    
    &:hover {
        border-color: #007bff;
        transform: scale(1.05);
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
    color: #999;
`;

const Header = () => {
    const navigate = useNavigate();
    const [userInfo, setUserInfo] = useState(null);

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

    const handleProfileClick = () => {
        if(userInfo) {
            // 로그인된 경우: 프로필 페이지로 이동
            navigate('/profile');
        } else {
            // 로그인 안된 경우: 로그인 페이지로 이동
            navigate('/login');
        }
    }
    
    return (
        <HeaderContainer>
            <Left>
            </Left>
            <Center>
                <SearchBar />
            </Center>
            <Right>
                <TokenBalance>
                    <BalanceItem>0.00 ETH</BalanceItem>
                    <BalanceItem>0.00 WETH</BalanceItem>
                </TokenBalance>
                <NetworkInfo />
                <WalletInfo />
                <ProfileIcon onClick={handleProfileClick}>
                    {userInfo ? (
                        <ProfileImage src={userInfo.picture} alt="Profile" />
                    ) : (
                        <QuestionMark>?</QuestionMark>
                    )}
                </ProfileIcon>
            </Right>
        </HeaderContainer>
    );
};

export default Header;
