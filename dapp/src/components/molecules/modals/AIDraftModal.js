// for test

import React from 'react'
import styled from "styled-components"

const Overlay = styled.div`
    position: fixed;
    top: 0; left: 0; right: 0; bottom: 0;
    background-color: rgba(0,0,0,0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
`;

const ModalContainer = styled.div`
    background: white;
    padding: 20px;
    border-radius: 8px;
    width: 400px;
`;

const Form = styled.form`
    display: flex;
    flex-direction: column;
`;

const Input = styled.input`
    width: 100%;
    margin-bottom: 10px;
    padding: 8px;
`;

const ButtonGroup = styled.div`
    display: flex;
    justify-content: flex-end;
    gap: 8px;
`;

const Button = styled.button`
    padding: 8px 12px;
    cursor: pointer;
`;

const AIDraftModal = ({ isOpen, onClose, onSubmit }) => {
    if (!isOpen) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        const subject = e.target.elements.prompt.value.trim();
        if (!subject) return;
        onSubmit(subject);
        onClose();
    }

    return (
        <Overlay>
        <ModalContainer>
            <h3>AI 드래프트 생성</h3>
            <Form onSubmit={handleSubmit}>
            <Input
                name="prompt"
                placeholder="예: duck"
                maxLength={10}
            />
            <ButtonGroup>
                <Button type="button" onClick={onClose}>취소</Button>
                <Button type="submit">생성하기</Button>
            </ButtonGroup>
            </Form>
        </ModalContainer>
        </Overlay>
    );
};

export default AIDraftModal;
