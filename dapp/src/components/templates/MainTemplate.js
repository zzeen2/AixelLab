import React, { useState } from 'react';
import styled from 'styled-components';
import {Header as HeaderComponent, Sidebar as SidebarComponent} from '../organism';
import {Logo as LogoComponent} from '../atoms';

const Container = styled.div`
    display: flex;
    flex-direction: column;
    height: 100vh;
    background-color: #0d1017;
    overflow: hidden;
`;

const HeaderWrapper = styled.header`
    height: 50px;
    background-color: #1a1a1a;
    border-bottom: 1px solid #2a2a2a;
    z-index: 100;
    position: fixed;
    top: 0;
    left: ${props => props.isSidebarExpanded ? '180px' : '55px'};
    right: 0;
    transition: left 0.3s ease;
`;

const Body = styled.div`
    margin-top: 52px;
    margin-left: ${props => props.isSidebarExpanded ? '180px' : '55px'};
    height: calc(100vh - 52px);
    transition: margin-left 0.3s ease;
    overflow: hidden;
`;

const Sidebar = styled.aside`
    width: 55px;
    background-color: #1a1a1a;
    border-right: 1px solid #2a2a2a;
    padding: 0;
    overflow: hidden;
    transition: width 0.3s ease;
    position: fixed;
    top: 0;
    left: 0;
    height: 100vh;
    z-index: 101;

    &:hover {
        width: 180px;
    }
`;

const MainContent = styled.main`
    background-color: #0d1017;
    padding: 0;
    overflow: hidden;
    height: 100%;
`;

const MainTemplate = ({ children }) => {
    const [isSidebarExpanded, setIsSidebarExpanded] = useState(false);

    return (
        <Container>
            <LogoComponent isExpanded={isSidebarExpanded} />
            <Sidebar
                onMouseEnter={() => setIsSidebarExpanded(true)}
                onMouseLeave={() => setIsSidebarExpanded(false)}
            >
                <SidebarComponent isExpanded={isSidebarExpanded} />
            </Sidebar>
            <HeaderWrapper isSidebarExpanded={isSidebarExpanded}>
                <HeaderComponent />
            </HeaderWrapper>
            <Body isSidebarExpanded={isSidebarExpanded}>
                <MainContent>
                    {children}
                </MainContent>
            </Body>
        </Container>
    );
};

export default MainTemplate;