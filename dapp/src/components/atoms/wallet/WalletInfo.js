import React from "react";
import styled from "styled-components";

const WalletBox = styled.div`
    display: flex;
    align-items: center;
    background-color: #2a2a2a;
    color: white;
    padding: 6px 12px;
    border-radius: 8px;
    font-size: 0.9rem;
`;

const Avatar = styled.div`
    width: 28px;
    height: 28px;
    border-radius: 50%;
    background-color: #444;
    margin-right: 8px;
`;

const Address = styled.span`
    font-family: monospace;
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
