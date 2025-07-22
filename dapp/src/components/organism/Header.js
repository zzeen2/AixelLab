import React from "react";
import styled from "styled-components";
import { NetworkInfo, WalletInfo} from "../atoms";
import { SearchBar } from "../molecules";

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

const Header = () => {
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
        </Right>
        </HeaderContainer>
    );
};

export default Header;
