import React from "react";
import styled from "styled-components";

const NetworkBox = styled.div`
    display: flex;
    align-items: center;
    background-color: #2a2a2a;
    color: white;
    padding: 6px 12px;
    border-radius: 8px;
    font-size: 13px;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
`;

const Circle = styled.div`
    width: 10px;
    height: 10px;
    background-color: #00ff88;
    border-radius: 50%;
    margin-right: 8px;
`;

const NetworkInfo = ({ network = "Ethereum Mainnet" }) => {
    return (
        <NetworkBox>
            <Circle />
            <span>{network}</span>
        </NetworkBox>
    );
};

export default NetworkInfo;
