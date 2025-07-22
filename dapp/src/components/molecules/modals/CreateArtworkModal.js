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
    width: 90%;
    max-width: 800px;
    max-height: 90vh;
    overflow-y: auto;
    position: relative;
    border: 1px solid #2a2a2a;
`;

const ModalHeader = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 24px 24px 0 24px;
    border-bottom: 1px solid #2a2a2a;
    padding-bottom: 24px;
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
        background-color: #2a2a2a;
        color: #ffffff;
    }
`;

const ModalContent = styled.div`
    display: flex;
    padding: 24px;
    gap: 40px;
`;

const LeftSection = styled.div`
    flex: 1;
    max-width: 300px;
`;

const RightSection = styled.div`
    flex: 2;
    display: flex;
    gap: 20px;
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
    padding: 24px;
    flex: 1;
    cursor: pointer;
    transition: all 0.2s ease;
    
    &:hover {
        border-color: #3b82f6;
        transform: translateY(-2px);
    }
`;

const CardIcon = styled.div`
    width: 60px;
    height: 60px;
    border-radius: 12px;
    margin-bottom: 16px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 24px;
    background: ${props => props.gradient || 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'};
`;

const CardTitle = styled.h3`
    font-size: 20px;
    font-weight: 600;
    color: #ffffff;
    margin-bottom: 12px;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
`;

const CardButton = styled.button`
    background: ${props => props.primary ? '#3b82f6' : '#2a2a2a'};
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
    
    &:before {
        content: '${props => props.icon}';
        font-size: 14px;
    }
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
                        <Title>어떤 방식으로 작품을 만들까요?</Title>
                        <GuideText>
                            AI 초안을 활용하거나 빈 캔버스에서 시작할 수 있습니다.
                        </GuideText>
                        <GuideButton>가이드 보기</GuideButton>
                    </LeftSection>
                    
                    <RightSection>
                        <OptionCard onClick={handleAIDraft}>
                            <CardIcon gradient="linear-gradient(135deg, #8b5cf6 0%, #3b82f6 100%)">
                                🎨
                            </CardIcon>
                            <CardTitle>AI 초안으로 시작</CardTitle>
                            <CardButton primary>AI 초안 생성</CardButton>
                            <CardDescription>
                                AI가 생성한 픽셀 아트 초안을 기반으로 수정하고 완성하세요. 
                                창작 아이디어를 빠르게 구체화할 수 있습니다.
                            </CardDescription>
                            <FeatureList>
                                <FeatureItem icon="🤖">AI DALL-E 기반 초안 생성</FeatureItem>
                                <FeatureItem icon="⚡">빠른 아이디어 구체화</FeatureItem>
                                <FeatureItem icon="🎯">프롬프트 기반 정확한 방향성</FeatureItem>
                                <FeatureItem icon="🔄">무제한 초안 생성 가능</FeatureItem>
                                <FeatureItem icon="✨">고품질 픽셀 아트 스타일</FeatureItem>
                            </FeatureList>
                        </OptionCard>
                        
                        <OptionCard onClick={handleBlankCanvas}>
                            <CardIcon gradient="linear-gradient(135deg, #f59e0b 0%, #ef4444 100%)">
                                ✏️
                            </CardIcon>
                            <CardTitle>빈 캔버스에서 시작</CardTitle>
                            <CardButton>캔버스 열기</CardButton>
                            <CardDescription>
                                완전히 빈 캔버스에서 처음부터 픽셀 아트를 그려보세요. 
                                자유로운 창작과 세밀한 제어가 가능합니다.
                            </CardDescription>
                            <FeatureList>
                                <FeatureItem icon="🎨">완전한 창작 자유도</FeatureItem>
                                <FeatureItem icon="🔧">세밀한 픽셀 단위 제어</FeatureItem>
                                <FeatureItem icon="🎯">정확한 디자인 구현</FeatureItem>
                                <FeatureItem icon="💡">순수한 창작 아이디어</FeatureItem>
                                <FeatureItem icon="⚡">즉시 작업 시작</FeatureItem>
                            </FeatureList>
                        </OptionCard>
                    </RightSection>
                </ModalContent>
            </ModalContainer>
        </ModalOverlay>
    );
};

export default CreateArtworkModal; 