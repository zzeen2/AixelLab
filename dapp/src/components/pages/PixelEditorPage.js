import React, { useRef, useState, useEffect } from 'react'
import styled from 'styled-components';
import { MainTemplate } from '../templates';
import { PixelEditor } from '../organism';

const PageContainer = styled.div`
    padding: 24px;
    background-color: #0d1017;
    height: 100%;
    color: #ffffff;
    box-sizing: border-box;
    overflow: auto;
`;

const HeaderSection = styled.div`
    display: flex;
    align-items: center;
    gap: 16px;
    margin-bottom: 24px;
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

const ModeBadge = styled.span`
    background-color: #8b5cf6;
    color: #ffffff;
    padding: 6px 12px;
    border-radius: 20px;
    font-size: 12px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.5px;
`;


const EditorContainer = styled.div`
    background-color: #1a1a1a;
    border-radius: 12px;
    padding: 24px;
    border: 1px solid #2a2a2a;
    margin-bottom: 24px;
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow: auto;
`;

const ToolLabel = styled.div`
  font-size: 12px;
  color: #8b949e;
  font-weight: 500;
  text-align: center;
  margin-top: 8px;
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
