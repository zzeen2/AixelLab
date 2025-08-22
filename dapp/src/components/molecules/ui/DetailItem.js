import React from 'react';
import styled from 'styled-components';
import ExternalLink from '../../atoms/ui/ExternalLink';

const MintedDetailItem = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px 0;
    border-bottom: 1.5px solid #353840;
    &:last-child { border-bottom: none; }
`;

const MintedDetailLabel = styled.div`
    font-size: 14px;
    color: #8a939b;
    font-weight: 600;
`;

const MintedDetailValue = styled.div`
    font-size: 14px;
    color: #2081e2;
    font-family: monospace;
    cursor: pointer;
    &:hover { text-decoration: underline; }
`;

const DetailItem = ({ label, value, href, isExternal = false }) => (
    <MintedDetailItem>
        <MintedDetailLabel>{label}</MintedDetailLabel>
        <MintedDetailValue>
            {href && isExternal ? (
                <ExternalLink href={href} target="_blank" rel="noopener noreferrer">
                    {value}
                    <span style={{fontSize: '1em', marginLeft: 2}}>↗</span>
                </ExternalLink>
            ) : (
                value
            )}
        </MintedDetailValue>
    </MintedDetailItem>
);

export default DetailItem; 