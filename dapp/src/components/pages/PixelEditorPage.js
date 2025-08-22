import React, { useRef, useState, useEffect } from 'react'
import styled from 'styled-components';
import { MainTemplate } from '../templates';
import { PixelEditor } from '../organism';

const PageContainer = styled.div`
    padding: 32px;
    background-color: #0d1017;
    height: 100%;
    color: #ffffff;
    box-sizing: border-box;
    overflow: auto;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
`;

const HeaderSection = styled.div`
    display: flex;
    align-items: center;
    gap: 16px;
    margin-bottom: 32px;
    padding-bottom: 24px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
`;

const Title = styled.h1`
    font-size: 36px;
    font-weight: 700;
    color: #ffffff;
    margin: 0;
    background: linear-gradient(135deg, #8b5cf6, #ec4899);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
`;

const Subtitle = styled.p`
    font-size: 16px;
    color: rgba(255, 255, 255, 0.7);
    margin: 0 0 32px 0;
    font-weight: 400;
    line-height: 1.6;
`;

const ModeBadge = styled.span`
    background: linear-gradient(135deg, #8b5cf6, #ec4899);
    color: #ffffff;
    padding: 8px 16px;
    border-radius: 20px;
    font-size: 12px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    box-shadow: 0 2px 8px rgba(139, 92, 246, 0.3);
`;

const EditorContainer = styled.div`
    background-color: transparent;
    border-radius: 16px;
    padding: 0;
    margin-bottom: 24px;
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow: auto;
    height: calc(100vh - 200px);
`;

const ToolLabel = styled.div`
    font-size: 12px;
    color: rgba(255, 255, 255, 0.6);
    font-weight: 500;
    text-align: center;
    margin-top: 8px;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
`;

const PixelEditorPage = ({ mode }) => {
    const [draftImageUrl, setDraftImageUrl] = useState("");

    // localStorage에서 이미지 URL 가져오기
    useEffect(() => {
        const savedImageUrl = localStorage.getItem('draftImageUrl');
        if (savedImageUrl) {
            setDraftImageUrl(savedImageUrl);
            localStorage.removeItem('draftImageUrl'); // 사용 후 삭제
        }
    }, []);
    
    return (
        <MainTemplate>
            <PageContainer>
                <HeaderSection>
                    <Title>Pixel Editor</Title>
                    {mode && <ModeBadge>{mode === 'ai-draft' ? 'AI Draft' : 'Blank Canvas'}</ModeBadge>}
                </HeaderSection>

                <EditorContainer>
                    <PixelEditor draftImageUrl={draftImageUrl} />
                </EditorContainer>
            </PageContainer>
        </MainTemplate>
    )
}

export default PixelEditorPage
