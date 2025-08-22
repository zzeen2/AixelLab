import React, { useState } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { MainTemplate } from '../templates';
import { generateImage } from '../../api/openai';

const PageContainer = styled.div`
    display: flex;
    height: 100%;
    gap: 32px;
    padding: 32px;
    overflow: hidden;
    box-sizing: border-box;
    position: relative;
    background-color: #0d1017;
`;

const LeftPanel = styled.div`
    width: 35%;
    background-color: transparent;
    padding: 32px;
    height: 100%;
    display: flex;
    flex-direction: column;
    box-sizing: border-box;
    overflow: hidden;
    gap: 24px;
    position: relative;
    
    &::after {
        content: '';
        position: absolute;
        right: 0;
        top: 0;
        bottom: 0;
        width: 1px;
        background: linear-gradient(to bottom, transparent, rgba(255, 255, 255, 0.1), transparent);
    }
`;

const RightPanel = styled.div`
    width: 65%;
    background-color: transparent;
    padding: 32px;
    height: 100%;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    box-sizing: border-box;
    min-height: 0;
`;

const Title = styled.h1`
    font-size: 36px;
    font-weight: 700;
    color: #ffffff;
    margin: 0 0 16px 0;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
    background: linear-gradient(135deg, #8b5cf6, #ec4899);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
`;

const Subtitle = styled.p`
    font-size: 16px;
    color: rgba(255, 255, 255, 0.7);
    margin: 0 0 24px 0;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
    line-height: 1.6;
`;

const SectionTitle = styled.h2`
    font-size: 24px;
    font-weight: 600;
    color: #ffffff;
    margin: 0 0 20px 0;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
`;

const ToolTitle = styled.h3`
    font-size: 18px;
    font-weight: 500;
    color: #ffffff;
    margin: 0 0 8px 0;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
`;

const ToolDescription = styled.p`
    font-size: 14px;
    color: rgba(255, 255, 255, 0.6);
    margin: 0;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
`;

const PromptInput = styled.textarea`
    width: 100%;
    min-height: 140px;
    padding: 20px;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 12px;
    color: #ffffff;
    font-size: 16px;
    resize: vertical;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
    transition: all 0.2s ease;
    box-sizing: border-box;
    line-height: 1.6;
    
    &:focus {
        outline: none;
        border-color: #8b5cf6;
        background: rgba(255, 255, 255, 0.08);
        box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.1);
    }
    
    &::placeholder {
        color: rgba(255, 255, 255, 0.4);
    }
`;

const GenerateButton = styled.button`
    background: linear-gradient(135deg, #8b5cf6, #ec4899);
    color: #ffffff;
    border: none;
    border-radius: 12px;
    padding: 16px 32px;
    font-size: 16px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
    margin-top: 16px;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
    box-shadow: 0 4px 12px rgba(139, 92, 246, 0.3);
    
    &:hover:not(:disabled) {
        transform: translateY(-2px);
        box-shadow: 0 6px 20px rgba(139, 92, 246, 0.4);
    }
    
    &:disabled {
        opacity: 0.5;
        cursor: not-allowed;
        transform: none;
        box-shadow: none;
    }
`;

const PreviewArea = styled.div`
    flex: 1;
    background: transparent;
    border: 2px dashed rgba(255, 255, 255, 0.1);
    border-radius: 16px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 24px;
    overflow: hidden;
    box-sizing: border-box;
    min-height: 0;
    transition: all 0.2s ease;
    
    &:hover {
        border-color: rgba(255, 255, 255, 0.2);
        background: transparent;
    }
`;

const PreviewText = styled.p`
    color: rgba(255, 255, 255, 0.5);
    font-size: 16px;
    text-align: center;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
`;

const ActionButtons = styled.div`
    display: flex;
    gap: 16px;
    flex-shrink: 0;
`;

const ActionButton = styled.button`
    background: ${props => props.primary ? 'linear-gradient(135deg, #8b5cf6, #ec4899)' : 'rgba(255, 255, 255, 0.05)'};
    color: #ffffff;
    border: 1px solid ${props => props.primary ? 'transparent' : 'rgba(255, 255, 255, 0.1)'};
    border-radius: 12px;
    padding: 14px 28px;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
    
    &:hover:not(:disabled) {
        background: ${props => props.primary ? 'linear-gradient(135deg, #7c3aed, #db2777)' : 'rgba(255, 255, 255, 0.1)'};
        border-color: ${props => props.primary ? 'transparent' : 'rgba(255, 255, 255, 0.2)'};
        transform: translateY(-1px);
    }
    
    &:disabled {
        opacity: 0.5;
        cursor: not-allowed;
        transform: none;
    }
`;

const ButtonText = styled.span`
    font-size: 14px;
    font-weight: 500;
    color: #ffffff;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
`;

const LoadingText = styled.p`
    font-size: 16px;
    color: rgba(255, 255, 255, 0.6);
    text-align: center;
    margin: 16px 0 0 0;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
`;

const GeneratedImage = styled.img`
    width: 90%;
    height: 90%;
    max-width: 90%;
    max-height: 90%;
    border-radius: 12px;
    object-fit: contain;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
    image-rendering: pixelated;
    image-rendering: crisp-edges;
`;

const buildPixelArtPrompt = (subject) => {
    return `${subject} in pixel art style, 8-bit, retro gaming aesthetic`;
};

const AIDraftPage = () => {
    const navigate = useNavigate();
    const [prompt, setPrompt] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [generatedImage, setGeneratedImage] = useState(null);
    const [error, setError] = useState(null);

    const drawWithPadding = (srcUrl, paddingPx = 16) => {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.crossOrigin = 'anonymous';
            img.onload = () => {
                const size = 256;
                const canvas = document.createElement('canvas');
                canvas.width = size;
                canvas.height = size;
                const ctx = canvas.getContext('2d');
                if (!ctx) {
                    resolve(srcUrl);
                    return;
                }
                ctx.imageSmoothingEnabled = false;
                ctx.clearRect(0, 0, size, size);
                const drawSize = size - paddingPx * 2;
                ctx.drawImage(img, paddingPx, paddingPx, drawSize, drawSize);
                resolve(canvas.toDataURL('image/png'));
            };
            img.onerror = () => resolve(srcUrl);
            img.src = srcUrl;
        });
    };

    const handleGenerate = async () => {
        if (!prompt.trim()) return;
        
        setIsGenerating(true);
        setError(null);
        
        try {
            const enhancedPrompt = buildPixelArtPrompt(prompt);
            
            const imageUrl = await generateImage(enhancedPrompt);
            // 2px@32 => 16px@256 패딩 적용해 가장자리 여백을 보장
            const paddedUrl = await drawWithPadding(imageUrl, 16);
            setGeneratedImage(paddedUrl);
        } catch (error) {
            console.error(error);
            setError('Failed to generate image. Please try again.');
        } finally {
            setIsGenerating(false); 
        }
    };

    const handleSave = () => {
        // TODO 이미지 저장 
        console.log('Saving image...');
    };

    const handleEdit = () => {
        if (generatedImage) {
            localStorage.setItem('draftImageUrl', generatedImage);
            navigate('/editor/ai-draft');
        }
    };

    return (
        <MainTemplate>
            <PageContainer>
                <LeftPanel>
                    <Title>AI Draft Generator</Title>
                    <Subtitle>
                        Describe your vision and let AI create a pixel art draft for you. 
                        Perfect for getting started with your creative journey.
                    </Subtitle>
                    
                    <PromptInput
                        placeholder="Describe the pixel art you want to create... (e.g., 'A cute cat in a magical forest', 'A futuristic city skyline', 'A medieval castle on a hill')"
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
                            <PreviewText>🎨 Generating your pixel art masterpiece...</PreviewText>
                        ) : error ? (
                            <PreviewText style={{ color: '#ef4444' }}>❌ {error}</PreviewText>
                        ) : generatedImage ? (
                            <GeneratedImage 
                                src={generatedImage} 
                                alt="Generated draft" 
                                onError={(e) => {
                                    console.error('Image load error:', e);
                                    setError('Failed to load generated image.');
                                }}
                            />
                        ) : (
                            <PreviewText>✨ Your generated image will appear here</PreviewText>
                        )}
                    </PreviewArea>
                    
                    <ActionButtons>
                        <ActionButton onClick={handleSave} disabled={!generatedImage || isGenerating}>
                            💾 Save Draft
                        </ActionButton>
                        <ActionButton primary onClick={handleEdit} disabled={!generatedImage || isGenerating}>
                            🎨 Open in Editor
                        </ActionButton>
                    </ActionButtons>
                </RightPanel>
            </PageContainer>
        </MainTemplate>
    );
};

export default AIDraftPage; 