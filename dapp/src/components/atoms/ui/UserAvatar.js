import React from 'react';
import styled from 'styled-components';

const AvatarContainer = styled.div`
    width: ${props => props.size || '40px'};
    height: ${props => props.size || '40px'};
    border-radius: 50%;
    background: ${props => props.color || '#8b5cf6'};
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-weight: bold;
    font-size: ${props => {
        const size = parseInt(props.size) || 40;
        return `${Math.round(size * 0.4)}px`;
    }};
    cursor: ${props => props.clickable ? 'pointer' : 'default'};
    transition: transform 0.2s ease;
    
    &:hover {
        ${props => props.clickable && 'transform: scale(1.05);'}
    }
`;

const UserAvatar = ({ 
    user, 
    size = '40px', 
    clickable = false, 
    onClick,
    className 
}) => {
    // Google 사용자는 프로필 이미지 사용
    if (user?.picture) {
        return (
            <img
                src={user.picture}
                alt={user.display_name || 'Profile'}
                style={{
                    width: size,
                    height: size,
                    borderRadius: '50%',
                    objectFit: 'cover',
                    cursor: clickable ? 'pointer' : 'default',
                    transition: 'transform 0.2s ease'
                }}
                onClick={onClick}
                onMouseEnter={clickable ? (e) => e.target.style.transform = 'scale(1.05)' : undefined}
                onMouseLeave={clickable ? (e) => e.target.style.transform = 'scale(1)' : undefined}
                className={className}
            />
        );
    }

    // MetaMask 사용자는 랜덤 색상 + 첫 글자
    const backgroundColor = user?.avatar_color || '#8b5cf6';
    const initial = user?.display_name?.[0]?.toUpperCase() || 'W';

    return (
        <AvatarContainer
            size={size}
            color={backgroundColor}
            clickable={clickable}
            onClick={onClick}
            className={className}
        >
            {initial}
        </AvatarContainer>
    );
};

export default UserAvatar; 