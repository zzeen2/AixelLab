import React, { useState } from "react";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";
import { uploadToIPFS } from "../../../api/ipfs";

// Overlay: 풀스크린 반투명 배경
const Overlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.75);
  backdrop-filter: blur(6px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 999;
`;

// Panel: 화면을 거의 꽉 채우는 메인 컨테이너
const Panel = styled.div`
  width: calc(100vw - 64px);
  max-width: 1600px;
  height: calc(100vh - 64px);
  max-height: 100vh;
  background: #111318;
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 16px;
  box-shadow: 0 24px 64px rgba(0, 0, 0, 0.6);
  overflow: visible; /* 내부 포커스 섀도우가 잘리지 않도록 */
  display: flex;
  flex-direction: column;
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
`;

const Title = styled.h2`
  margin: 0;
  font-size: 18px;
  color: #fff;
  font-weight: 700;
`;

const CloseBtn = styled.button`
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: 1px solid rgba(255, 255, 255, 0.16);
  background: transparent;
  color: rgba(255, 255, 255, 0.85);
  cursor: pointer;
  display: grid;
  place-items: center;
  transition: 0.2s ease;
  &:hover {
    background: rgba(255, 255, 255, 0.08);
  }
`;

// Main: 2컬럼 그리드 (좌측 캔버스 유동, 우측 폼 고정폭)
const Main = styled.div`
  flex: 1;
  display: grid;
  grid-template-columns: minmax(0, 1fr) 440px; /* 우측 고정폭 */
  gap: 24px;
  padding: 20px;
  overflow: hidden;

  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
    grid-auto-rows: minmax(0, auto);
  }
`;

// Stage: 이미지 프리뷰 영역 (독립 스크롤)
const Stage = styled.div`
  background: #0d1017;
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 12px;
  height: 100%;
  overflow: auto;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const PreviewImg = styled.img`
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
  border-radius: 10px;
`;

// FormSection: 우측 입력 폼 영역 (독립 스크롤)
const FormSection = styled.div`
  height: 100%;
  background: #111318;
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 12px;
  overflow: auto;
  padding: 20px;
  box-sizing: border-box; /* 패딩/보더 포함하여 그리드 폭을 초과하지 않도록 */
`;

const Label = styled.label`
  display: block;
  margin: 14px 0 8px;
  font-size: 13px;
  color: #e5e7eb;
  font-weight: 600;
`;

const Hint = styled.p`
  margin: 6px 0 0;
  font-size: 12px;
  color: rgba(229, 231, 235, 0.6);
`;

const Input = styled.input`
  width: 100%;
  height: 42px;
  padding: 10px 12px;
  background: #1a1f26;
  border: 1px solid rgba(255, 255, 255, 0.14);
  border-radius: 8px;
  color: #fff;
  transition: 0.2s ease;
  box-sizing: border-box; /* 컨테이너 폭을 넘지 않도록 */
  &:focus {
    outline: none;
    border-color: #8b5cf6;
    box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.25);
  }
  &::placeholder {
    color: rgba(229, 231, 235, 0.4);
  }
`;

const TextArea = styled.textarea`
  width: 100%;
  min-height: 120px;
  padding: 10px 12px;
  background: #1a1f26;
  border: 1px solid rgba(255, 255, 255, 0.14);
  border-radius: 8px;
  color: #fff;
  resize: vertical;
  transition: 0.2s ease;
  box-sizing: border-box; /* 컨테이너 폭을 넘지 않도록 */
  &:focus {
    outline: none;
    border-color: #8b5cf6;
    box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.25);
  }
  &::placeholder {
    color: rgba(229, 231, 235, 0.4);
  }
`;

const Footer = styled.div`
  padding: 14px 20px;
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
`;

const PrimaryBtn = styled.button`
  background: #8b5cf6;
  color: #fff;
  border: none;
  border-radius: 8px;
  height: 40px;
  padding: 0 16px;
  font-weight: 700;
  cursor: pointer;
  transition: 0.2s ease;
  &:hover {
    background: #7c3aed;
  }
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const GhostBtn = styled.button`
  background: transparent;
  color: #cbd5e1;
  border: 1px solid rgba(255, 255, 255, 0.16);
  border-radius: 8px;
  height: 40px;
  padding: 0 16px;
  font-weight: 700;
  cursor: pointer;
  transition: 0.2s ease;
  &:hover {
    border-color: #8b5cf6;
    color: #8b5cf6;
  }
`;

const FreeForSubscribersSection = styled.div`
  margin-top: 20px;
  padding: 16px;
  background: rgba(139, 92, 246, 0.05);
  border: 1px solid rgba(139, 92, 246, 0.2);
  border-radius: 8px;
`;

const FreeForSubscribersLabel = styled.label`
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
  color: #8b5cf6;
  cursor: pointer;
  margin-bottom: 8px;
  
  span {
    font-size: 14px;
  }
`;

const Checkbox = styled.input`
  width: 16px;
  height: 16px;
  accent-color: #8b5cf6;
  cursor: pointer;
`;

const FreeForSubscribersHint = styled.div`
  font-size: 12px;
  color: rgba(139, 92, 246, 0.8);
  line-height: 1.5;
  
  strong {
    color: #8b5cf6;
  }
`;

const PreviewModal = ({ isOpen, imageUrl, onClose }) => {
  const [isUploading, setIsUploading] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [isFreeForSubscribers, setIsFreeForSubscribers] = useState(false);
  const navigate = useNavigate();

  if (!isOpen) return null;

  const handleUploadToIPFS = async () => {
    try {
      if (!title) return;
      const isValidPrice = (val) => /^([0-9]+)(\.[0-9]{1,6})?$/.test(val) && parseFloat(val) > 0;
      if (price && !isValidPrice(price)) return;
      setIsUploading(true);
      await uploadToIPFS(imageUrl, title, description, price || null, isFreeForSubscribers);
      onClose();
      navigate("/");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Overlay onClick={onClose}>
      <Panel onClick={(e) => e.stopPropagation()}>
        <Header>
          <Title>Artwork preview</Title>
          <CloseBtn onClick={onClose}>✕</CloseBtn>
        </Header>
        <Main>
          <Stage>
            <PreviewImg src={imageUrl} alt="preview" />
          </Stage>
          <FormSection>
            <Label>Title</Label>
            <Input
              placeholder="Enter artwork title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />

            <Label>Description</Label>
            <TextArea
              placeholder="Enter artwork description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
            <Hint>(Optional) Add a description to your artwork.</Hint>

            <Label>Initial Price (AXC)</Label>
            <Input
              placeholder="e.g. 10.25"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
            />
            <Hint>(Optional) Used as a reference for voting. Up to 6 decimals.</Hint>

            <FreeForSubscribersSection>
              <FreeForSubscribersLabel>
                <Checkbox
                  type="checkbox"
                  checked={isFreeForSubscribers}
                  onChange={(e) => setIsFreeForSubscribers(e.target.checked)}
                />
                <span>구독 기업들이 리워드 없이 사용 가능한 음원</span>
              </FreeForSubscribersLabel>
              <FreeForSubscribersHint>
                이 음원은 구독한 기업들이 추가 혜택으로 무료 사용할 수 있습니다.
                <br />
                <strong>구독은 필요하지만, 아티스트에게 추가 수익은 발생하지 않습니다.</strong>
              </FreeForSubscribersHint>
            </FreeForSubscribersSection>
          </FormSection>
        </Main>
        <Footer>
          <PrimaryBtn onClick={handleUploadToIPFS} disabled={isUploading}>
            {isUploading ? "Uploading..." : "Upload to IPFS"}
          </PrimaryBtn>
          <GhostBtn onClick={onClose}>Cancel</GhostBtn>
        </Footer>
      </Panel>
    </Overlay>
  );
};

export default PreviewModal;
