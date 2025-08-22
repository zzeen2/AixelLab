import React, { useState } from 'react';
import styled from 'styled-components';
import {Header as HeaderComponent, Sidebar as SidebarComponent} from '../organism';

const Container = styled.div`
    display: flex;
    flex-direction: column;
    height: 100vh;
    background-color: #0d1017;
    overflow: hidden; 
`;

const HeaderWrapper = styled.header`
    height: 50px;
    background-color: #0d1017;
    border-bottom: 1px solid #2a2a2a;
    z-index: 998;
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    transition: all 0.3s ease;
`;

const Body = styled.div`
    margin-top: 52px;
    margin-left: 64px;
    height: calc(100vh - 52px);
    transition: all 0.3s ease;
    overflow-y: auto;
    overflow-x: hidden;
    background-color: #0d1017;
`;

const Overlay = styled.div`
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.5);
    z-index: 999;
    opacity: ${props => props.isSidebarExpanded ? 1 : 0};
    visibility: ${props => props.isSidebarExpanded ? 'visible' : 'hidden'};
    transition: all 0.3s ease;
    pointer-events: ${props => props.isSidebarExpanded ? 'auto' : 'none'};
`;

const Sidebar = styled.aside`
    width: ${props => props.isExpanded ? '240px' : '64px'};
    background-color: #0d1017;
    border-right: 1px solid #2a2a2a;
    padding: 0;
    overflow: hidden;
    transition: width 0.3s ease;
    position: fixed;
    top: 0;
    left: 0;
    height: 100vh;
    z-index: 1000;
    pointer-events: auto;
`;

const MainContent = styled.main`
    background-color: #0d1017;
    padding: 0;
    overflow: visible;
    min-height: 100%;
    pointer-events: auto;
`;

const MainTemplate = ({ children }) => {
    const [isSidebarExpanded, setIsSidebarExpanded] = useState(false);

    const handleSidebarMouseEnter = (e) => {
        e.stopPropagation();
        setIsSidebarExpanded(true);
    };

    const handleSidebarMouseLeave = (e) => {
        e.stopPropagation();
        setIsSidebarExpanded(false);
    };

    // 사이드바 상태를 안정적으로 유지
    const stableSidebarState = isSidebarExpanded;

    return (
        <Container>
            <Overlay isSidebarExpanded={stableSidebarState} />
            <Sidebar
                isExpanded={stableSidebarState}
                onMouseEnter={handleSidebarMouseEnter}
                onMouseLeave={handleSidebarMouseLeave}
            >
                <SidebarComponent isExpanded={stableSidebarState} />
            </Sidebar>
            <HeaderWrapper isSidebarExpanded={stableSidebarState}>
                <HeaderComponent />
            </HeaderWrapper>
            <Body isSidebarExpanded={stableSidebarState}>
                <MainContent onMouseEnter={handleSidebarMouseLeave}>
                    {children}
                </MainContent>
            </Body>
        </Container>
    );
};

export default MainTemplate;