import styled from 'styled-components';

const CloseButtonCircle = styled.button`
    background: rgba(32,34,40,0.85);
    border: none;
    color: #fff;
    font-size: 1.7rem;
    cursor: pointer;
    z-index: 10;
    width: 44px;
    height: 44px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 2px 8px rgba(0,0,0,0.12);
    transition: background 0.15s;
    &:hover {
        background: #23272f;
    }
`;

export default CloseButtonCircle; 