import React from "react";
import styled from "styled-components";

const Overlay = styled.div`
    position: fixed;
    top: 0; left: 0; right: 0; bottom: 0;
    background: rgba(0,0,0,0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 999;
`;

const ModalBox = styled.div`
    background: white;
    padding: 20px;
    border-radius: 8px;
    text-align: center;
`;

const Button = styled.button`
    margin-top: 12px;
`;

const PreviewModal = ({ isOpen, imageUrl, onClose }) => {
    if (!isOpen) return null;

    return (
        <Overlay>
        <ModalBox>
            <h3>미리보기</h3>
            <img src={imageUrl} alt="Preview" style={{ width: "256px" }} />
            <br />
            <Button onClick={onClose}>닫기</Button>
        </ModalBox>
        </Overlay>
    );
};

export default PreviewModal;
