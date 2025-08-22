import styled from 'styled-components';

const ProgressBar = styled.div`
    width: 100%;
    height: 8px;
    background: #353840;
    border-radius: 4px;
    overflow: hidden;
    margin: 8px 0;
`;

const ProgressFill = styled.div`
    height: 100%;
    background: #2081e2;
    width: ${props => props.percentage}%;
    transition: width 0.3s ease;
`;

export { ProgressBar, ProgressFill }; 