import React from "react";
import styled from "styled-components";

const LogoContainer = styled.div`
    position: fixed;
    top: 0;
    left: 0;
    width: ${props => props.isExpanded ? '200px' : '60px'};
    height: 52px;
    background-color: #1a1a1a;
    display: flex;
    align-items: center;
    padding: 0 20px;
    z-index: 102;
    transition: width 0.3s ease;
    border-bottom: 1px solid #2a2a2a;
    box-sizing: border-box;
`;

const LogoIcon = styled.div`
    width: 20px;
    height: 20px;
    background: #8b5cf6;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    position: relative;
    
    &::after {
        content: '';
        position: absolute;
        right: 2px;
        top: 50%;
        transform: translateY(-50%);
        width: 4px;
        height: 4px;
        background: #1a1a1a;
        border-radius: 50%;
    }
`;

const LogoText = styled.div`
    font-size: 18px;
    font-weight: 600;
    color: #ffffff;
    margin-left: 12px;
    opacity: ${props => props.isExpanded ? '1' : '0'};
    transition: opacity 0.3s ease;
    white-space: nowrap;
    overflow: hidden;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
`;

const Logo = ({ isExpanded }) => {
    return (
        <LogoContainer isExpanded={isExpanded}>
            <LogoIcon />
            <LogoText isExpanded={isExpanded}>
                AixelLab
            </LogoText>
        </LogoContainer>
    );
};

export default Logo;
