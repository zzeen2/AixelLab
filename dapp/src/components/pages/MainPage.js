import React from "react";
import { useNavigate } from "react-router-dom";
import {MainTemplate} from "../templates";
import styled from "styled-components";

const PageContainer = styled.div`
    color: #ffffff;
    padding: 40px;
    max-width: 1200px;
    margin: 0 auto;
`;

const HeroSection = styled.div`
    text-align: center;
    margin-bottom: 60px;
`;

const Title = styled.h1`
    font-size: 48px;
    font-weight: 700;
    margin-bottom: 16px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
`;

const Subtitle = styled.p`
    font-size: 20px;
    color: #8b949e;
    margin-bottom: 32px;
`;

const ContentGrid = styled.div`
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 40px;
    margin-top: 40px;
`;

const ContentCard = styled.div`
    background: #1a1a1a;
    border-radius: 12px;
    padding: 24px;
    border: 1px solid #2a2a2a;
`;

const CardTitle = styled.h3`
    font-size: 20px;
    font-weight: 600;
    margin-bottom: 12px;
    color: #ffffff;
`;

const CardText = styled.p`
    color: #8b949e;
    line-height: 1.6;
`;

const MainPage = () => {
    const navigate = useNavigate();
    
    return (
        <MainTemplate>
            <PageContainer>
                <HeroSection>
                    <Title>🎨 AixelLab</Title>
                    <Subtitle>AI Pixel Creation Lab powered by DAO</Subtitle>
                </HeroSection>

                <ContentGrid>
                    <ContentCard>
                        <CardTitle>투표중인 작품들</CardTitle>
                        <CardText>
                            현재 커뮤니티에서 투표 중인 픽셀 아트 작품들을 확인하세요.
                        </CardText>
                    </ContentCard>
                    
                    <ContentCard>
                        <CardTitle>민팅된 NFTs</CardTitle>
                        <CardText>
                            선정되어 민팅된 NFT 컬렉션을 둘러보세요.
                        </CardText>
                    </ContentCard>
                </ContentGrid>
            </PageContainer>
        </MainTemplate>
    );
};

export default MainPage;
