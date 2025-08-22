import React from 'react';
import styled from 'styled-components';
import MainTemplate from './MainTemplate';
import NFTDetailModal from '../organism/NFTDetailModal';
import NFTDetailLayout from '../organism/NFTDetailLayout';

const PageContainer = styled.div`
    background: #1a1a1a;
    min-height: 100vh;
    color: #ffffff;
`;

const NFTContainer = styled.div`
    max-width: 1600px;
    margin: 0 auto;
    padding: 0;
`;

const BackButton = styled.button`
    background: #353840;
    color: #8a939b;
    border: none;
    padding: 12px 16px;
    border-radius: 10px;
    font-size: 14px;
    cursor: pointer;
    margin: 16px 32px;
    
    &:hover {
        background: #4a4f57;
        color: #ffffff;
    }
`;

const LoadingSpinner = styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
    height: 400px;
    color: #666;
`;

const ErrorMessage = styled.div`
    text-align: center;
    padding: 48px 24px;
    color: #ff6b6b;
`;

const NFTDetailTemplate = ({ 
    artwork, 
    loading, 
    error, 
    isModal, 
    onClose, 
    children 
}) => {
    if (loading) {
        return isModal ? (
            <NFTDetailModal artwork={artwork} onClose={onClose}>
                <LoadingSpinner>Loading...</LoadingSpinner>
            </NFTDetailModal>
        ) : (
            <MainTemplate>
                <PageContainer>
                    <LoadingSpinner>Loading...</LoadingSpinner>
                </PageContainer>
            </MainTemplate>
        );
    }

    if (error || !artwork) {
        return isModal ? (
            <NFTDetailModal artwork={artwork} onClose={onClose}>
                <ErrorMessage>{error || '작품을 찾을 수 없습니다.'}</ErrorMessage>
            </NFTDetailModal>
        ) : (
            <MainTemplate>
                <PageContainer>
                    <ErrorMessage>{error || '작품을 찾을 수 없습니다.'}</ErrorMessage>
                    <BackButton onClick={onClose}>뒤로 가기</BackButton>
                </PageContainer>
            </MainTemplate>
        );
    }

    if (isModal) {
        return (
            <NFTDetailModal artwork={artwork} onClose={onClose}>
                {children}
            </NFTDetailModal>
        );
    }

    return (
        <MainTemplate>
            <PageContainer>
                <NFTContainer>
                    <BackButton onClick={onClose}>← 뒤로 가기</BackButton>
                    <NFTDetailLayout artwork={artwork}>
                        {children}
                    </NFTDetailLayout>
                </NFTContainer>
            </PageContainer>
        </MainTemplate>
    );
};

export default NFTDetailTemplate; 