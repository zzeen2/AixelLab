import React from "react";
import styled from "styled-components";
import { NetworkInfo, WalletInfo} from "../atoms";
import { SearchBar } from "../molecules";

const HeaderContainer = styled.header`
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px 24px;
    background-color: #121212;
    border-bottom: 1px solid #2a2a2a;
`;

const Left = styled.div`
    display: flex;
    align-items: center;
    gap: 20px;
`;

const Logo = styled.h1`
    font-size: 1.4rem;
    font-weight: bold;
    color: #ffffff;
`;

const Right = styled.div`
    display: flex;
    align-items: center;
    gap: 16px;
`;

const Header = () => {
    return (
        <HeaderContainer>
        <Left>
            <Logo>AixelLab</Logo>
            <SearchBar />
        </Left>
        <Right>
            <NetworkInfo />
            <WalletInfo />
        </Right>
        </HeaderContainer>
    );
};

export default Header;
