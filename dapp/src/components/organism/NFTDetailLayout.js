import React from 'react';
import styled from 'styled-components';

const MintedDetailWrapper = styled.div`
    display: flex;
    width: 100%;
    max-width: 1600px;
    margin: 0 auto;
    padding: 0;
    min-height: 700px;
    align-items: flex-start;
    gap: 0;
    @media (max-width: 1100px) {
        flex-direction: column;
        min-height: 0;
    }
`;

const MintedDetailLeft = styled.div`
    flex: 0 0 45%;
    min-width: 0;
    display: flex;
    align-items: flex-start;
    justify-content: center;
`;

const MintedImageBox = styled.div`
    background: #23262a;
    border-radius: 16px;
    border: 1.5px solid #353840;
    width: 100%;
    max-width: 600px;
    aspect-ratio: 1/1;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
    img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        background: #23262a;
        display: block;
    }
`;

const MintedDetailRight = styled.div`
    flex: 1 1 0;
    min-width: 0;
    max-width: none;
    display: flex;
    flex-direction: column;
    gap: 0;
    align-items: flex-start;
    padding-left: 16px;
    width: 100%;
    box-sizing: border-box;
    @media (max-width: 1100px) {
        padding-left: 0;
    }
`;

const NFTDetailLayout = ({ artwork, children, isModal = false }) => {
    const getImageUrl = (artwork) => {
        if (!artwork) return '/default-image.png';
        
        return artwork.image_ipfs_uri || 
               artwork.imageUrl || 
               artwork.image_url || 
               artwork.image || 
               artwork.thumbnail || 
               '/default-image.png';
    };

    if (isModal) {
        return <>{children}</>;
    }

    return (
        <MintedDetailWrapper>
            <MintedDetailLeft>
                <MintedImageBox>
                    <img src={getImageUrl(artwork)} alt={artwork?.title || 'No Image'} />
                </MintedImageBox>
            </MintedDetailLeft>
            <MintedDetailRight>
                {children}
            </MintedDetailRight>
        </MintedDetailWrapper>
    );
};

export default NFTDetailLayout; 