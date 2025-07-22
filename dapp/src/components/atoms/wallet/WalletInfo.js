import React from "react";
import styled from "styled-components";

const WalletBox = styled.div`
    display: flex;
    align-items: center;
    background-color: #2a2a2a;
    color: white;
    padding: 6px 12px;
    border-radius: 8px;
    font-size: 13px;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
`;

const Avatar = styled.div`
    width: 28px;
    height: 28px;
    border-radius: 50%;
    background-color: #444;
    margin-right: 8px;
`;

const Address = styled.span`
    font-family: 'SF Mono', Monaco, 'Cascadia Code', 'Roboto Mono', Consolas, 'Courier New', monospace;
    font-size: 12px;
`;

const WalletInfo = ({ address = "0x0000...0000" }) => {
    return (
        <WalletBox>
            <Avatar />
            <Address>{address}</Address>
        </WalletBox>
    );
};

export default WalletInfo;
