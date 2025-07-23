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

const PanelTitle = styled.h2`
    font-size: 20px;
    font-weight: 600;
    color: #ffffff;
    margin-bottom: 20px;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
`;

const PromptInput = styled.textarea`
    width: 100%;
    min-height: 120px;
    max-height: 200px;
    background-color: #0d1017;
    border: 1px solid #2a2a2a;
    border-radius: 8px;
    padding: 16px;
    color: #ffffff;
    font-size: 14px;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
    resize: vertical;
    margin-bottom: 20px;
    box-sizing: border-box;
    overflow: hidden; /* 추가 */
    
    &::-webkit-scrollbar {
        display: none;
    }
    -ms-overflow-style: none;
    scrollbar-width: none;
    
    &:focus {
        outline: none;
        border-color: #3b82f6;
    }
    
    &::placeholder {
        color: #8b949e;
    }
`;


const GenerateButton = styled.button`
    width: 100%;
    background-color: #8b5cf6;
    color: #ffffff;
    border: none;
    border-radius: 8px;
    padding: 16px;
    font-size: 16px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
    box-sizing: border-box;
    
    &:hover {
        background-color: #7c3aed;
        transform: translateY(-1px);
    }
    
    &:disabled {
        background-color: #6b7280;
        cursor: not-allowed;
        transform: none;
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
    flex: 1;
    background-color: ${props => props.primary ? '#8b5cf6' : '#2a2a2a'};
    color: #ffffff;
    border: none;
    border-radius: 8px;
    padding: 12px 16px;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
    
    &:hover {
        background-color: ${props => props.primary ? '#7c3aed' : '#3a3a3a'};
        transform: translateY(-1px);
    }
    
    &:disabled {
        background-color: #6b7280;
        cursor: not-allowed;
        transform: none;
    }
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
                    <PanelTitle>AI Draft Generator</PanelTitle>
                    
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
                    <PanelTitle>Preview</PanelTitle>
                    
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