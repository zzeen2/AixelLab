import React, { useState } from "react";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";
import { uploadToIPFS } from "../../../api/ipfs";

const Overlay = styled.div`
    position: fixed;
    top: 0; 
    left: 0; 
    right: 0; 
    bottom: 0;
    background: rgba(0, 0, 0, 0.8);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 999;
    backdrop-filter: blur(4px);
`;

const ModalBox = styled.div`
    background: #1a1a1a;
    border: 1px solid #2a2a2a;
    border-radius: 16px;
    padding: 32px;
    text-align: center;
    max-width: 90vw;
    max-height: 90vh;
    overflow: auto;
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.5);
`;

const ModalTitle = styled.h2`
    color: #ffffff;
    font-size: 24px;
    font-weight: 600;
    margin: 0 0 24px 0;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
`;

const ImageContainer = styled.div`
    background: #0d1017;
    border: 2px solid #2a2a2a;
    border-radius: 12px;
    padding: 24px;
    margin: 0 0 24px 0;
    display: inline-block;
`;

const PreviewImage = styled.img`
    max-width: 100%;
    max-height: 60vh;
    border-radius: 8px;
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.3);
`;

const ButtonContainer = styled.div`
    display: flex;
    gap: 12px;
    justify-content: center;
`;

const CloseButton = styled.button`
    background: #2a2a2a;
    color: #ffffff;
    border: none;
    border-radius: 8px;
    padding: 12px 24px;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
    
    &:hover {
        background: #3a3a3a;
        transform: translateY(-1px);
    }
`;

const DownloadButton = styled.button`
    background: #8b5cf6;
    color: #ffffff;
    border: none;
    border-radius: 8px;
    padding: 12px 24px;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
    
    &:hover {
        background: #7c3aed;
        transform: translateY(-1px);
    }
`;

const UploadButton = styled.button`
    background: #10b981;
    color: #ffffff;
    border: none;
    border-radius: 8px;
    padding: 12px 24px;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
    
    &:hover {
        background: #059669;
        transform: translateY(-1px);
    }
    
    &:disabled {
        background: #6b7280;
        cursor: not-allowed;
        transform: none;
    }
`;


const PreviewModal = ({ isOpen, imageUrl, onClose }) => {
    const [isUploading, setIsUploading] = useState(false);
    const [uploadStatus, setUploadStatus] = useState('');
    const navigate = useNavigate();

    if (!isOpen) return null;

    // 이미지 다운로드
    const handleDownload = () => {
        const link = document.createElement('a');
        link.href = imageUrl;
        link.download = 'pixel-art.png';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleUploadToIPFS = async () => {
        try {
            setIsUploading(true);
            setUploadStatus('Uploading...');
            
            const result = await uploadToIPFS(imageUrl);
            
            //todo 라우팅처리
            setTimeout(() => {
                onClose();
                navigate('/');
            }, 2000);
            
        } catch (error) {
            setUploadStatus('업로드 실패: ' + error.message);
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <Overlay onClick={onClose}>
            <ModalBox onClick={(e) => e.stopPropagation()}>
                <ModalTitle>Preview</ModalTitle>
                
                <ImageContainer>
                    <PreviewImage src={imageUrl} alt="Pixel Art Preview" />
                </ImageContainer>
                
                <ButtonContainer>
                    <UploadButton 
                        onClick={handleUploadToIPFS}
                        disabled={isUploading}
                    >
                        {isUploading ? 'Uploading...' : 'Upload to IPFS'}
                    </UploadButton>
                    <DownloadButton onClick={handleDownload}>
                        Download
                    </DownloadButton>
                    <CloseButton onClick={onClose}>
                        ✕ Close
                    </CloseButton>
                </ButtonContainer>
            </ModalBox>
        </Overlay>
    );
};

export default PreviewModal;
