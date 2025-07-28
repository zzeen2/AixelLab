import React, { useState } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { MainTemplate } from '../templates';
import { generateImage } from '../../api/openai';

const PageContainer = styled.div`
    display: flex;
    height: 100%;
    gap: 24px;
    padding: 15px;
    overflow: hidden;
    box-sizing: border-box;
    position: relative;
`;

const LeftPanel = styled.div`
    width: 30%;
    background-color: #1a1a1a;
    border-radius: 12px;
    padding: 24px;
    border: 1px solid #2a2a2a;
    height: 100%;
    display: flex;
    flex-direction: column;
    box-sizing: border-box;
    overflow: hidden;
`;

const RightPanel = styled.div`
    width: 70%;
    background-color: #1a1a1a;
    /* border-radius: 12px; */
    padding: 24px;
    border: 1px solid #2a2a2a;
    height: 100%;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    box-sizing: border-box;
    min-height: 0;
`;

const Title = styled.h1`
  font-size: 32px;
  font-weight: 700;
  color: #ffffff;
  margin: 0 0 16px 0;
`;

const Subtitle = styled.p`
  font-size: 16px;
  color: #8b949e;
  margin: 0 0 32px 0;
  font-weight: 400;
`;

const SectionTitle = styled.h2`
  font-size: 24px;
  font-weight: 600;
  color: #ffffff;
  margin: 0 0 16px 0;
`;

const ToolTitle = styled.h3`
  font-size: 20px;
  font-weight: 600;
  color: #ffffff;
  margin: 0 0 8px 0;
`;

const ToolDescription = styled.p`
  font-size: 14px;
  color: #8b949e;
  margin: 0;
  font-weight: 400;
`;

const PromptInput = styled.textarea`
  width: 100%;
  min-height: 120px;
  padding: 16px;
  background: #1a1a1a;
  border: 1px solid #2a2a2a;
  border-radius: 8px;
  color: #ffffff;
  font-size: 14px;
  resize: vertical;
  font-family: inherit;
  transition: border-color 0.2s ease;
  
  &:focus {
    outline: none;
    border-color: #8b5cf6;
  }
  
  &::placeholder {
    color: #8b949e;
  }
`;


const GenerateButton = styled.button`
  background: #8b5cf6;
  color: #ffffff;
  border: none;
  padding: 12px 24px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover:not(:disabled) {
    background: #7c3aed;
    transform: translateY(-1px);
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const PreviewArea = styled.div`
    flex: 1;
    background-color: #0d1017;
    border: 2px dashed #2a2a2a;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 20px;
    overflow: hidden;
    box-sizing: border-box;
    min-height: 0;
`;

const PreviewText = styled.p`
    color: #8b949e;
    font-size: 16px;
    text-align: center;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
`;

const ActionButtons = styled.div`
    display: flex;
    gap: 12px;
    flex-shrink: 0;
`;

const ActionButton = styled.button`
  background: ${props => props.primary ? '#8b5cf6' : 'transparent'};
  color: #ffffff;
  border: 1px solid ${props => props.primary ? '#8b5cf6' : '#2a2a2a'};
  padding: 10px 20px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover:not(:disabled) {
    background: ${props => props.primary ? '#7c3aed' : 'rgba(139, 92, 246, 0.1)'};
    border-color: #8b5cf6;
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const ButtonText = styled.span`
  font-size: 14px;
  font-weight: 600;
  color: #ffffff;
`;

const LoadingText = styled.p`
  font-size: 16px;
  color: #8b949e;
  text-align: center;
  margin: 16px 0 0 0;
  font-weight: 400;
`;

const AIDraftPage = () => {
    const navigate = useNavigate();
    const [prompt, setPrompt] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [generatedImage, setGeneratedImage] = useState(null);
    const [error, setError] = useState(null);

    const handleGenerate = async () => {
        if (!prompt.trim()) return;
        
        setIsGenerating(true);
        setError(null);
        
        try {
            //todo 프롬프트 수정
            const enhancedPrompt = `${prompt} in pixel art style, 8-bit, retro gaming aesthetic`;
            
            const imageUrl = await generateImage(enhancedPrompt);
            console.log("imageUrl", imageUrl)
            setGeneratedImage(imageUrl);
        } catch (error) {
            console.error(error);
        }finally {
        setIsGenerating(false); 
    }
    };

    const handleSave = () => {
        // TODO 이미지 저장 
        console.log('Saving image...');
    };

    const handleEdit = () => {
        if (generatedImage) {
            // 생성된 이미지 URL을 state로 전달하거나 localStorage에 저장
            localStorage.setItem('draftImageUrl', generatedImage);
            navigate('/editor/ai-draft');
        }
    };

    return (
        <MainTemplate>
            <PageContainer>
                <LeftPanel>
                    <SectionTitle>AI Draft Generator</SectionTitle>
                    
                    <PromptInput
                        placeholder="Describe the pixel art you want to create... (e.g., 'A cute cat')"
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                    />
                    
                    <GenerateButton
                        onClick={handleGenerate}
                        disabled={!prompt.trim() || isGenerating}
                    >
                        {isGenerating ? 'Generating...' : 'Generate Draft'}
                    </GenerateButton>
                </LeftPanel>
                
                <RightPanel>
                    <SectionTitle>Preview</SectionTitle>
                    
                    <PreviewArea>
                        {isGenerating ? (
                            <PreviewText>Generating your AI draft...</PreviewText>
                        ) : error ? (
                            <PreviewText style={{ color: '#ef4444' }}>{error}</PreviewText>
                        ) : generatedImage ? (
                            <img 
                                src={generatedImage} 
                                alt="Generated draft" 
                                style={{ 
                                    width: 'auto', 
                                    height: 'auto', 
                                    maxWidth: '80%', 
                                    maxHeight: '80%', 
                                    borderRadius: '8px',
                                    objectFit: 'contain'
                                }}
                                onError={(e) => {
                                    console.error('Image load error:', e);
                                }}
                            />
                        ) : (
                            <PreviewText>Your generated image will appear here</PreviewText>
                        )}
                    </PreviewArea>
                    
                    <ActionButtons>
                        <ActionButton onClick={handleSave} disabled={!generatedImage || isGenerating}>
                            Save Draft
                        </ActionButton>
                        <ActionButton primary onClick={handleEdit} disabled={!generatedImage || isGenerating}>
                            Open in Editor
                        </ActionButton>
                    </ActionButtons>
                </RightPanel>
            </PageContainer>
        </MainTemplate>
    );
};

export default AIDraftPage; 