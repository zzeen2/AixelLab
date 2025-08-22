import React from 'react';
import styled from 'styled-components';
import CloseButtonCircle from '../atoms/ui/CloseButton';

const ModalOverlay = styled.div`
    position: fixed;
    top: 0; left: 0; right: 0; bottom: 0;
    background: rgba(0,0,0,0.92);
    z-index: 9999;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow-y: auto;
`;

const ModalContent = styled.div`
    background: #181a20;
    border-radius: 12px;
    max-width: 1600px;
    width: 96vw;
    max-height: 96vh;
    overflow-y: auto;
    position: relative;
    box-shadow: 0 8px 32px rgba(0,0,0,0.6);
    padding: 0;
    display: flex;
    flex-direction: column;
    scrollbar-width: none;
    -ms-overflow-style: none;
    &::-webkit-scrollbar {
        display: none;
    }
`;

const ModalHeader = styled.div`
    position: sticky;
    top: 0;
    z-index: 2;
    background: transparent;
    display: flex;
    align-items: flex-start;
    justify-content: flex-end;
    padding: 32px 40px 0 0;
    min-height: 56px;
    border-bottom: 1.5px solid #23272f;
`;

const ModalBody = styled.div`
    display: flex;
    flex-direction: row;
    width: 100%;
    min-height: 600px;
    padding: 0 0 40px 0;
    @media (max-width: 900px) {
        flex-direction: column;
        min-height: 0;
        padding: 0 0 24px 0;
    }
`;

const ModalImageBox = styled.div`
    flex: 0 0 45%;
    min-width: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 12px 0 0 12px;
    padding: 12px 8px 12px 12px;
    height: 100%;
    border-right: 1.5px solid #23272f;
    @media (max-width: 900px) {
        border-radius: 12px 12px 0 0;
        padding: 8px 4px;
        flex: none;
        height: auto;
        border-right: none;
        border-bottom: 1.5px solid #23272f;
    }
    img {
        width: 100%;
        height: 100%;
        max-width: 100%;
        max-height: 100%;
        border-radius: 12px;
        background: none;
        object-fit: cover;
        display: block;
    }
`;

const ModalInfoBox = styled.div`
    flex: 1 1 0;
    min-width: 0;
    padding: 48px 16px 48px 16px;
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    align-items: stretch;
    color: #fff;
    overflow-y: auto;
    max-height: 96vh;
    @media (max-width: 900px) {
        padding: 24px 16px;
        max-height: none;
        border-left: none;
        border-top: 1.5px solid #23272f;
    }
    scrollbar-width: none;
    -ms-overflow-style: none;
    &::-webkit-scrollbar {
        display: none;
    }
`;

const NFTDetailModal = ({ artwork, onClose, children }) => {
    const getImageUrl = (artwork) => {
        if (!artwork) return '/default-image.png';
        
        return artwork.image_ipfs_uri || 
               artwork.imageUrl || 
               artwork.image_url || 
               artwork.image || 
               artwork.thumbnail || 
               '/default-image.png';
    };

    return (
        <ModalOverlay>
            <ModalContent>
                <ModalHeader>
                    <CloseButtonCircle onClick={onClose}>×</CloseButtonCircle>
                </ModalHeader>
                <ModalBody>
                    <ModalImageBox>
                        <img src={getImageUrl(artwork)} alt={artwork?.title || 'No Image'} />
                    </ModalImageBox>
                    <ModalInfoBox>
                        {children}
                    </ModalInfoBox>
                </ModalBody>
            </ModalContent>
        </ModalOverlay>
    );
};

export default NFTDetailModal; 