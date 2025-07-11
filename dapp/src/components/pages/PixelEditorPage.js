import React, { useRef, useState } from 'react'
import { PixelEditor } from '../organism';
import AIDraftModal from '../molecules/AIDraftModal';
import { generateImage } from '../../api/openai';

const PixelEditorPage = () => {
    const [isModalOpen, setModalOpen] = useState(false);
    const [draftImageUrl, setDraftImageUrl] = useState("");

    const handleOpenModal =() => setModalOpen(true);
    const handleCloseModal = () => setModalOpen(false);

    const handleSubmitPrompt = async(finalPrompt) => {
        console.log("foinal prompt" , finalPrompt);
        try {
            const url = await generateImage(finalPrompt);
            setDraftImageUrl(url);
            console.log("url", url)

        } catch (error) {
            alert("이미지 생성에 실패했습니다.")
        }
        setModalOpen(false);
    }
    return (
    <div>
        <h1>Pixel Editor Page</h1>

        <button onClick={handleOpenModal}>AI 드래프트 생성하기</button>

        <PixelEditor draftImageUrl={draftImageUrl} />

        <AIDraftModal
            isOpen={isModalOpen}
            onClose={handleCloseModal}
            onSubmit={handleSubmitPrompt}
        />

        {draftImageUrl && (
            <div style={{ marginTop: "16px" }}>
            <img src={draftImageUrl} alt="AI Draft" width={200} />
            </div>
        )}
    </div>
    )
}

export default PixelEditorPage
