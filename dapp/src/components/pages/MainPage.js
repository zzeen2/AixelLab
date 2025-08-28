import React from "react";
import { useNavigate } from "react-router-dom";
import {MainTemplate} from "../templates";
import styled, { keyframes } from "styled-components";

// 애니메이션 키프레임
const float = keyframes`
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-20px); }
`;

const pulse = keyframes`
  0%, 100% { opacity: 1; }
  50% { opacity: 0.7; }
`;

const slideInUp = keyframes`
  from { transform: translateY(100px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
`;

const glow = keyframes`
  0%, 100% { box-shadow: 0 0 20px rgba(102, 126, 234, 0.5); }
  50% { box-shadow: 0 0 40px rgba(102, 126, 234, 0.8); }
`;

const PageContainer = styled.div`
    color: #ffffff;
    width: 100%;
    min-height: 100vh;
    background: linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 50%, #16213e 100%);
    position: relative;
    overflow-x: hidden;
    
    &::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: 
            radial-gradient(circle at 20% 80%, rgba(102, 126, 234, 0.1) 0%, transparent 50%),
            radial-gradient(circle at 80% 20%, rgba(118, 75, 162, 0.1) 0%, transparent 50%),
            radial-gradient(circle at 40% 40%, rgba(240, 147, 251, 0.05) 0%, transparent 50%);
        pointer-events: none;
    }
`;

const HeroSection = styled.div`
    text-align: center;
    padding: 120px 40px 80px;
    position: relative;
    z-index: 2;
`;

const HeroTitle = styled.h1`
    font-size: clamp(2.5rem, 6vw, 4.5rem);
    font-weight: 800;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    margin: 0 0 24px 0;
    line-height: 1.1;
    animation: ${slideInUp} 1s ease-out;
`;

const HeroSubtitle = styled.p`
    font-size: clamp(1rem, 2.5vw, 1.4rem);
    color: #a8b2d1;
    margin: 0 0 48px 0;
    font-weight: 400;
    line-height: 1.6;
    max-width: 800px;
    margin-left: auto;
    margin-right: auto;
    animation: ${slideInUp} 1s ease-out 0.2s both;
`;

const HeroButtons = styled.div`
    display: flex;
    gap: 24px;
    justify-content: center;
    flex-wrap: wrap;
    animation: ${slideInUp} 1s ease-out 0.4s both;
`;

const PrimaryButton = styled.button`
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    border: none;
    padding: 18px 36px;
    border-radius: 50px;
    font-size: 1.1rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
    position: relative;
    overflow: hidden;
    
    &:hover {
        transform: translateY(-3px);
        box-shadow: 0 20px 40px rgba(102, 126, 234, 0.4);
    }
    
    &::before {
        content: '';
        position: absolute;
        top: 0;
        left: -100%;
        width: 100%;
        height: 100%;
        background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
        transition: left 0.5s;
    }
    
    &:hover::before {
        left: 100%;
    }
`;

const SecondaryButton = styled.button`
    background: transparent;
    color: #667eea;
    border: 2px solid #667eea;
    padding: 16px 34px;
    border-radius: 50px;
    font-size: 1.1rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
    
    &:hover {
        background: #667eea;
        color: white;
        transform: translateY(-3px);
        box-shadow: 0 20px 40px rgba(102, 126, 234, 0.3);
    }
`;

const StatsSection = styled.div`
    padding: 80px 40px;
    text-align: center;
    position: relative;
    z-index: 2;
`;

const StatsGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 40px;
    max-width: 1200px;
    margin: 0 auto;
`;

const StatCard = styled.div`
    background: rgba(255, 255, 255, 0.05);
    border-radius: 20px;
    padding: 40px 20px;
    border: 1px solid rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(10px);
    transition: all 0.3s ease;
    
    &:hover {
        transform: translateY(-10px);
        border-color: rgba(102, 126, 234, 0.3);
        box-shadow: 0 20px 60px rgba(102, 126, 234, 0.2);
    }
`;

const StatNumber = styled.div`
    font-size: 2.5rem;
    font-weight: 800;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    margin-bottom: 12px;
`;

const StatLabel = styled.div`
    font-size: 1rem;
    color: #a8b2d1;
    font-weight: 500;
`;

const FeaturesSection = styled.div`
    padding: 80px 40px;
    position: relative;
    z-index: 2;
`;

const SectionTitle = styled.h2`
    font-size: clamp(1.8rem, 4vw, 2.5rem);
    font-weight: 700;
    color: #ffffff;
    text-align: center;
    margin: 0 0 16px 0;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    -webkit-background-clip: text;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
`;

const SectionSubtitle = styled.p`
    font-size: 1rem;
    color: #a8b2d1;
    text-align: center;
    margin: 0 0 60px 0;
    max-width: 600px;
    margin-left: auto;
    margin-right: auto;
`;

const FeaturesGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 40px;
    max-width: 1400px;
    margin: 0 auto;
`;

const FeatureCard = styled.div`
    background: rgba(255, 255, 255, 0.05);
    border-radius: 24px;
    padding: 40px 30px;
    border: 1px solid rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(10px);
    transition: all 0.3s ease;
    cursor: pointer;
    position: relative;
    overflow: hidden;
    
    &:hover {
        transform: translateY(-8px);
        border-color: rgba(102, 126, 234, 0.4);
        box-shadow: 0 25px 80px rgba(102, 126, 234, 0.3);
    }
    
    &::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        height: 4px;
        background: linear-gradient(90deg, #667eea, #764ba2, #f093fb);
        transform: scaleX(0);
        transition: transform 0.3s ease;
    }
    
    &:hover::before {
        transform: scaleX(1);
    }
`;

const FeatureIcon = styled.div`
    width: 80px;
    height: 80px;
    border-radius: 20px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 2.5rem;
    margin-bottom: 24px;
    animation: ${float} 3s ease-in-out infinite;
`;

const FeatureTitle = styled.h3`
    font-size: 1.3rem;
    font-weight: 600;
    color: #ffffff;
    margin-bottom: 16px;
`;

const FeatureDescription = styled.p`
    color: #a8b2d1;
    line-height: 1.6;
    font-size: 0.9rem;
`;

const LatestSection = styled.div`
    padding: 80px 40px;
    position: relative;
    z-index: 2;
`;

const LatestGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 30px;
    max-width: 1400px;
    margin: 0 auto;
`;

const LatestCard = styled.div`
    background: rgba(255, 255, 255, 0.05);
    border-radius: 20px;
    overflow: hidden;
    border: 1px solid rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(10px);
    transition: all 0.3s ease;
    cursor: pointer;
    
    &:hover {
        transform: translateY(-8px);
        border-color: rgba(102, 126, 234, 0.4);
        box-shadow: 0 20px 60px rgba(102, 126, 234, 0.3);
    }
`;

const LatestImage = styled.div`
    width: 100%;
    height: 200px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 3rem;
    position: relative;
    
    &::after {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: linear-gradient(45deg, transparent 30%, rgba(255, 255, 255, 0.1) 50%, transparent 70%);
        animation: ${pulse} 2s ease-in-out infinite;
    }
`;

const LatestContent = styled.div`
    padding: 24px;
`;

const LatestTitle = styled.h4`
    font-size: 1.1rem;
    font-weight: 600;
    color: #ffffff;
    margin-bottom: 8px;
`;

const LatestMeta = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 16px;
`;

const LatestPrice = styled.div`
    font-size: 1rem;
    font-weight: 600;
    color: #667eea;
`;

const LatestStatus = styled.div`
    font-size: 0.8rem;
    padding: 6px 12px;
    border-radius: 20px;
    background: rgba(102, 126, 234, 0.1);
    color: #667eea;
    font-weight: 500;
`;

const CTAButton = styled.button`
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    border: none;
    padding: 16px 32px;
    border-radius: 50px;
    font-size: 1rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
    margin-top: 20px;
    
    &:hover {
        transform: translateY(-3px);
        box-shadow: 0 15px 40px rgba(102, 126, 234, 0.4);
    }
`;

const MainPage = () => {
    const navigate = useNavigate();
    
    const features = [
        {
            icon: "🎨",
            title: "AI Pixel Art Creation",
            description: "Create creative pixel art with artificial intelligence. Anyone can easily become an artist."
        },
        {
            icon: "🗳️",
            title: "Community Voting",
            description: "Appreciate artworks and vote to decide the next NFT. Your opinion changes the fate of artworks."
        },
        {
            icon: "🪙",
            title: "NFT Minting",
            description: "Preserve selected artworks as NFTs on the blockchain. Discover new value in digital art."
        },
        {
            icon: "💰",
            title: "Marketplace",
            description: "Buy and sell NFTs to realize the economic value of digital art. Transparent and secure transactions guaranteed."
        }
    ];
    
    const latestItems = [
        { title: "Cosmic Warriors", price: "0.8 ETH", icon: "⚔️", status: "Hot" },
        { title: "Digital Dreams", price: "0.6 ETH", icon: "💭", status: "New" },
        { title: "Pixel Galaxy", price: "0.4 ETH", icon: "🌌", status: "Trending" },
        { title: "Cyber Art", price: "0.9 ETH", icon: "🤖", status: "Popular" }
    ];
    
    return (
        <MainTemplate>
            <PageContainer>
                <HeroSection>
                    <HeroTitle>🎨 AixelLab</HeroTitle>
                    <HeroSubtitle>
                        An innovative pixel art platform where you create with AI, communicate with the community, 
                        and build value through NFTs
                    </HeroSubtitle>
                    <HeroButtons>
                        <PrimaryButton onClick={() => navigate('/blank-canvas')}>
                            🚀 Get Started Now
                        </PrimaryButton>
                        <SecondaryButton onClick={() => navigate('/explore')}>
                            🎭 Explore Artworks
                        </SecondaryButton>
                    </HeroButtons>
                </HeroSection>

                <StatsSection>
                    <SectionTitle>📊 AixelLab Status</SectionTitle>
                    <SectionSubtitle>
                        Check the growth and active activities of our community
                    </SectionSubtitle>
                    <StatsGrid>
                        <StatCard>
                            <StatNumber>1,247</StatNumber>
                            <StatLabel>Active Users</StatLabel>
                        </StatCard>
                        <StatCard>
                            <StatNumber>3,891</StatNumber>
                            <StatLabel>Created Artworks</StatLabel>
                        </StatCard>
                        <StatCard>
                            <StatNumber>156</StatNumber>
                            <StatLabel>Minted NFTs</StatLabel>
                        </StatCard>
                        <StatCard>
                            <StatNumber>89.2 ETH</StatNumber>
                            <StatLabel>Total Volume</StatLabel>
                        </StatCard>
                    </StatsGrid>
                </StatsSection>

                <FeaturesSection>
                    <SectionTitle>✨ AixelLab's Special Features</SectionTitle>
                    <SectionSubtitle>
                        Innovative creation experience combining AI technology and blockchain
                    </SectionSubtitle>
                    <FeaturesGrid>
                        {features.map((feature, index) => (
                            <FeatureCard key={index} onClick={() => navigate('/blank-canvas')}>
                                <FeatureIcon>{feature.icon}</FeatureIcon>
                                <FeatureTitle>{feature.title}</FeatureTitle>
                                <FeatureDescription>{feature.description}</FeatureDescription>
                            </FeatureCard>
                        ))}
                    </FeaturesGrid>
                </FeaturesSection>

                <LatestSection>
                    <SectionTitle>🔥 Latest Popular Artworks</SectionTitle>
                    <SectionSubtitle>
                        Check out the latest artworks that are getting the most attention in our community
                    </SectionSubtitle>
                    <LatestGrid>
                        {latestItems.map((item, index) => (
                            <LatestCard key={index} onClick={() => navigate('/explore')}>
                                <LatestImage>{item.icon}</LatestImage>
                                <LatestContent>
                                    <LatestTitle>{item.title}</LatestTitle>
                                    <LatestMeta>
                                        <LatestPrice>{item.price}</LatestPrice>
                                        <LatestStatus>{item.status}</LatestStatus>
                                    </LatestMeta>
                                </LatestContent>
                            </LatestCard>
                        ))}
                    </LatestGrid>
                    <div style={{ textAlign: 'center', marginTop: '40px' }}>
                        <CTAButton onClick={() => navigate('/explore')}>
                            🎭 View More Artworks
                        </CTAButton>
                    </div>
                </LatestSection>
            </PageContainer>
        </MainTemplate>
    );
};

export default MainPage;
