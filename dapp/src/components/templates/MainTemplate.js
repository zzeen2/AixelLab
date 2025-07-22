import React from 'react';
import {CarouselSection} from '../organism';
import styled from 'styled-components';
import {Header} from '../organism';

const Container = styled.div`
    display: flex;
    flex-direction: column;
    height: 100vh;
`;

const Content = styled.main`
    flex: 1;
    overflow-y: auto;
    background-color: #1a1a1a;
    padding: 24px;
`;

const MainTemplate = ({ children }) => {
    return (
        <Container>
            <Header />
            <Content>{children}</Content>
        </Container>
    );
};

export default MainTemplate;