import React from 'react';
import ExternalLink from '../../atoms/ui/ExternalLink';

const formatAddress = (address) => {
    if (!address) return '';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
};

const CreatorInfo = ({ artwork }) => (
    <span>
        by {(() => {
            const creatorAddress = artwork.artist_address || artwork.proposal?.artist_wallet_address || artwork.user?.wallet_address;
            return creatorAddress ? (
                <ExternalLink href={`https://sepolia.etherscan.io/address/${creatorAddress}`} target="_blank" rel="noopener noreferrer">
                    {formatAddress(creatorAddress)}
                    <span style={{fontSize: '1em', marginLeft: 2}}>↗</span>
                </ExternalLink>
            ) : '';
        })()}
    </span>
);

export default CreatorInfo; 