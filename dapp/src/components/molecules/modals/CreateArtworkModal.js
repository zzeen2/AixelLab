import React from 'react';
import styled from 'styled-components';

const ModalOverlay = styled.div`
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.8);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
`;

const ModalContainer = styled.div`
    background-color: #0d1017;
    border-radius: 12px;
    width: 100%;
    max-width: 1100px;
    max-height: 90vh;
    overflow-y: auto;
    position: relative;
    border: 1px solid #2a2a2a;
`;

const ModalHeader = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 7px 7px 0 10px;
    border-bottom: 1px solid #2a2a2a;
    padding-bottom: 7px;
`;

const CloseButton = styled.button`
    background: none;
    border: none;
    color: #8b949e;
    font-size: 24px;
    cursor: pointer;
    padding: 8px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s ease;
    
    &:hover {
        // background-color: #2a2a2a;
        color: #ffffff;
    }
`;

const ModalContent = styled.div`
    display: flex;
    padding: 32px;
    gap: 50px;
`;

const LeftSection = styled.div`
    flex: 1;
    max-width: 350px;
`;

const RightSection = styled.div`
    flex: 2;
    display: flex;
    gap: 30px;
`;

const Title = styled.h1`
    font-size: 32px;
    font-weight: 600;
    color: #ffffff;
    margin-bottom: 16px;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
`;

const GuideText = styled.p`
    color: #8b949e;
    font-size: 14px;
    margin-bottom: 16px;
    line-height: 1.5;
`;

const GuideButton = styled.button`
    background-color: #2a2a2a;
    color: #ffffff;
    border: none;
    padding: 8px 16px;
    border-radius: 8px;
    font-size: 14px;
    cursor: pointer;
    transition: background-color 0.2s ease;
    
    &:hover {
        background-color: #3a3a3a;
    }
`;

const OptionCard = styled.div`
    background-color: #1a1a1a;
    border: 1px solid #2a2a2a;
    border-radius: 12px;
    padding: 32px;
    flex: 1;
    cursor: pointer;
    transition: all 0.2s ease;
    
    &:hover {
        border-color: #8b5cf6;
        transform: translateY(-2px);
    }
`;

const CardIcon = styled.div`
    width: 80px;
    height: 80px;
    border-radius: 16px;
    margin-bottom: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: ${props => props.gradient || 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'};
    position: relative;
    
    &::after {
        content: '';
        position: absolute;
        width: 32px;
        height: 32px;
        background: rgba(255, 255, 255, 0.9);
        border-radius: 6px;
        ${props => props.iconStyle || ''}
    }
`;

const CardTitle = styled.h3`
    font-size: 20px;
    font-weight: 600;
    color: #ffffff;
    margin-bottom: 12px;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
`;

const CardButton = styled.button`
    background: ${props => props.primary ? '#8b5cf6' : '#2a2a2a'};
    color: #ffffff;
    border: none;
    padding: 12px 24px;
    border-radius: 8px;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    margin-bottom: 16px;
    transition: all 0.2s ease;
    
    &:hover {
        background: ${props => props.primary ? '#2563eb' : '#3a3a3a'};
        transform: translateY(-1px);
    }
`;

const CardDescription = styled.p`
    color: #8b949e;
    font-size: 14px;
    line-height: 1.5;
    margin-bottom: 16px;
`;

const FeatureList = styled.ul`
    list-style: none;
    padding: 0;
    margin: 0;
`;

const FeatureItem = styled.li`
    display: flex;
    align-items: center;
    gap: 8px;
    color: #8b949e;
    font-size: 13px;
    margin-bottom: 8px;
    position: relative;
    padding-left: 20px;
    
    &:before {
        content: '';
        position: absolute;
        left: 0;
        top: 50%;
        transform: translateY(-50%);
        width: 4px;
        height: 4px;
        background: #8b5cf6;
        border-radius: 50%;
    }
`;

const Input = styled.input`
  width: 100%;
  padding: 12px 16px;
  background: #1a1a1a;
  border: 1px solid #2a2a2a;
  border-radius: 8px;
  color: #ffffff;
  font-size: 14px;
  transition: border-color 0.2s ease;
  
  &:focus {
    outline: none;
    border-color: #8b5cf6;
  }
`;

const Button = styled.button`
  background: ${props => props.primary ? '#8b5cf6' : '#2a2a2a'};
  color: #ffffff;
  border: none;
  padding: 12px 24px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: ${props => props.primary ? '#7c3aed' : '#3a3a3a'};
  }
`;

const SubmitButton = styled.button`
  background: #8b5cf6;
  color: #ffffff;
  border: none;
  padding: 12px 24px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: #7c3aed;
  }
`;

const GradientBackground = styled.div`
  background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%);
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 24px;
`;

const CreateArtworkModal = ({ isOpen, onClose, onSelectOption }) => {
    if (!isOpen) return null;

    const handleAIDraft = () => {
        onSelectOption('ai-draft');
        onClose();
    };

    const handleBlankCanvas = () => {
        onSelectOption('blank-canvas');
        onClose();
    };

    return (
        <ModalOverlay onClick={onClose}>
            <ModalContainer onClick={(e) => e.stopPropagation()}>
                <ModalHeader>
                    <div></div>
                    <CloseButton onClick={onClose}>×</CloseButton>
                </ModalHeader>
                
                <ModalContent>
                    <LeftSection>
                        <Title>What do you want to create?</Title>
                        <GuideText>
                            View our guide to help decide between AI draft and blank canvas creation.
                        </GuideText>
                        <GuideButton>View Guide</GuideButton>
                    </LeftSection>
                    
                    <RightSection>
                        <OptionCard onClick={handleAIDraft}>
                            <CardIcon 
                                gradient="linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)"
                                iconStyle="clip-path: polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%);"
                            />
                            <CardTitle>AI Draft</CardTitle>
                            <CardButton primary>Create Draft</CardButton>
                            <CardDescription>
                                Start with AI-generated pixel art drafts and refine them to perfection. 
                                Quickly materialize your creative ideas with AI assistance.
                            </CardDescription>
                            <FeatureList>
                                <FeatureItem>AI DALL-E powered draft generation</FeatureItem>
                                <FeatureItem>Rapid idea visualization</FeatureItem>
                                <FeatureItem>Prompt-based precise direction</FeatureItem>
                                <FeatureItem>Unlimited draft creation</FeatureItem>
                                <FeatureItem>High-quality pixel art style</FeatureItem>
                            </FeatureList>
                        </OptionCard>
                        
                        <OptionCard onClick={handleBlankCanvas}>
                            <CardIcon 
                                gradient="linear-gradient(135deg, #f59e0b 0%, #ef4444 100%)"
                                iconStyle="clip-path: polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%);"
                            />
                            <CardTitle>Blank Canvas</CardTitle>
                            <CardButton>Open Canvas</CardButton>
                            <CardDescription>
                                Start from scratch with a completely blank canvas. 
                                Enjoy complete creative freedom and precise pixel-level control.
                            </CardDescription>
                            <FeatureList>
                                <FeatureItem>Complete creative freedom</FeatureItem>
                                <FeatureItem>Precise pixel-level control</FeatureItem>
                                <FeatureItem>Accurate design implementation</FeatureItem>
                                <FeatureItem>Pure creative ideas</FeatureItem>
                                <FeatureItem>Instant work start</FeatureItem>
                            </FeatureList>
                        </OptionCard>
                    </RightSection>
                </ModalContent>
            </ModalContainer>
        </ModalOverlay>
    );
};

export default CreateArtworkModal; 