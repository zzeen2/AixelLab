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
    padding: 0;
    max-width: 90vw;
    max-height: 90vh;
    overflow: hidden;
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.5);
    position: relative;
    width: 900px;
    height: 500px;
`;

const CloseButton = styled.button`
    position: absolute;
    top: 16px;
    right: 16px;
    background: rgba(42, 42, 42, 0.8);
    color: #ffffff;
    border: none;
    border-radius: 50%;
    width: 40px;
    height: 40px;
    font-size: 18px;
    cursor: pointer;
    transition: all 0.2s ease;
    z-index: 10;
    
    &:hover {
        background: rgba(58, 58, 58, 0.9);
        transform: scale(1.1);
    }
`;

const ModalContent = styled.div`
    display: flex;
    height: 100%;
`;

const LeftSection = styled.div`
    flex: 1;
    padding: 24px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    background: #0d1017;
`;

const RightSection = styled.div`
    flex: 1;
    padding: 32px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
`;

const ImageContainer = styled.div`
    background: #0d1017;
    border: 2px solid #2a2a2a;
    border-radius: 12px;
    padding: 16px;
    display: inline-block;
    max-width: 100%;
`;

const PreviewImage = styled.img`
    max-width: 100%;
    max-height: 350px;
    border-radius: 8px;
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.3);
`;

const FormTitle = styled.h2`
    color: #ffffff;
    font-size: 24px;
    font-weight: 600;
    margin: 0 0 24px 0;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
`;

const InputGroup = styled.div`
    margin-bottom: 20px;
`;

const Label = styled.label`
    display: block;
    color: #ffffff;
    font-size: 14px;
    font-weight: 500;
    margin-bottom: 8px;
`;

const Input = styled.input`
    width: 93%;
    padding: 12px 16px;
    background: #2a2a2a;
    border: 1px solid #3a3a3a;
    border-radius: 8px;
    color: #ffffff;
    font-size: 14px;
    transition: border-color 0.2s ease;
    
    &:focus {
        outline: none;
        border-color: #8b5cf6;
    }
    
    &::placeholder {
        color: #6b7280;
    }
`;

const TextArea = styled.textarea`
    width: 93%;
    padding: 12px 16px;
    background: #2a2a2a;
    border: 1px solid #3a3a3a;
    border-radius: 8px;
    color: #ffffff;
    font-size: 14px;
    resize: vertical;
    min-height: 100px;
    transition: border-color 0.2s ease;
    
    &:focus {
        outline: none;
        border-color: #8b5cf6;
    }
    
    &::placeholder {
        color: #6b7280;
    }
`;

const ButtonContainer = styled.div`
    display: flex;
    gap: 12px;
    margin-top: auto;
`;

const DownloadButton = styled.button`
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
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
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
            
            // 제목과 설명을 메타데이터로 포함
            const metadata = {
                title: title,
                description: description,
                createdAt: new Date().toISOString()
            };
            
            const result = await uploadToIPFS(imageUrl, metadata);
            
            setTimeout(() => {
                onClose();
                navigate('/');
            }, 2000);
            
        } catch (error) {
            setUploadStatus('Upload failed: ' + error.message);
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <Overlay onClick={onClose}>
            <ModalBox onClick={(e) => e.stopPropagation()}>
                <CloseButton onClick={onClose}>✕</CloseButton>
                
                <ModalContent>
                    <LeftSection>
                        <ImageContainer>
                            <PreviewImage src={imageUrl} alt="Pixel Art Preview" />
                        </ImageContainer>
                    </LeftSection>
                    
                    <RightSection>
                        <div>
                            <FormTitle>Artwork preview</FormTitle>
                            
                            <InputGroup>
                                <Label>Title</Label>
                                <Input
                                    type="text"
                                    placeholder="Enter artwork title"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    maxLength={200}
                                />
                            </InputGroup>
                            
                            <InputGroup>
                                <Label>Description</Label>
                                <TextArea
                                    placeholder="Enter artwork description"
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                />
                            </InputGroup>
                        </div>
                        
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
                        </ButtonContainer>
                    </RightSection>
                </ModalContent>
            </ModalBox>
        </Overlay>
    );
};

export default PreviewModal;
