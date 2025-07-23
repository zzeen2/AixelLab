import React, { useRef, useEffect, useState } from "react";
import styled from "styled-components";
import {Palette} from "../molecules";
import { ColorWheel } from "../atoms";
import {PreviewModal} from "../molecules";

const EditorLayout = styled.div`
    display: flex;
    height: 100%;
    gap: 24px;
    overflow: visible;
`;

const CanvasSection = styled.div`
    flex: 1;
    display: flex;
    justify-content: center;
    align-items: center;
    background-color: #1a1a1a;
    border-radius: 12px;
    padding: 24px;
    border: 1px solid #2a2a2a;
    overflow: visible;
`;

const Canvas = styled.canvas`
    border: 2px solid #2a2a2a;
    border-radius: 8px;
    background-color: #ffffff;
`;

const SidebarSection = styled.div`
    display: flex;
    flex-direction: column;
    gap: 24px;
    min-width: 280px;
    max-width: 320px;
    overflow-y: auto;
    max-height: 100%;
    
    &::-webkit-scrollbar {
        display: none;
    }
    -ms-overflow-style: none;
    scrollbar-width: none;
`;

const ToolsSection = styled.div`
    display: flex;
    flex-direction: column;
    gap: 12px;
`;

const ToolDescription = styled.p`
    color: #8b949e;
    font-size: 12px;
    margin: 0;
    line-height: 1.4;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
`;

const ToolButton = styled.button`
    background-color: ${props => props.active ? '#8b5cf6' : '#2a2a2a'};
    color: #ffffff;
    border: none;
    border-radius: 8px;
    padding: 12px 16px;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
    
    &:hover {
        background-color: ${props => props.active ? '#7c3aed' : '#3a3a3a'};
        transform: translateY(-1px);
    }
`;

const CompleteButton = styled.button`
    background-color: #10b981;
    color: #ffffff;
    border: none;
    border-radius: 8px;
    padding: 12px 16px;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
    
    &:hover {
        background-color: #059669;
        transform: translateY(-1px);
    }
`;

const PaletteSection = styled.div`
    background-color: #1a1a1a;
    border-radius: 12px;
    padding: 20px;
    border: 1px solid #2a2a2a;
`;

const ColorSection = styled.div`
    background-color: #1a1a1a;
    border-radius: 12px;
    padding: 20px;
    border: 1px solid #2a2a2a;
    display: flex;
    flex-direction: column;
    gap: 16px;
`;

const SectionTitle = styled.h3`
    font-size: 16px;
    font-weight: 600;
    color: #ffffff;
    margin: 0 0 16px 0;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
`;

const SelectedColorBox = styled.div`
    width: 80px;
    height: 80px;
    background-color: ${props => props.color};
    border: 3px solid #2a2a2a;
    border-radius: 12px;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
    align-self: center;
`;

const PixelEditor = ({ draftImageUrl }) => {
    const canvasRef = useRef(null);
    const [gridColors, setGridColors] = useState([]);
    const [selectedColor, setSelectedColor] = useState("#ff0000");
    const [palette, setPalette] = useState(["#ffffff"]);
    const [isEyedropperMode, setIsEyedropperMode] = useState(false);
    const [isPainting, setIsPainting] = useState(false);
    const [isPreviewOpen, setIsPreviewOpen] = useState(false);
    const [previewUrl, setPreviewUrl] = useState("");
    const [grid, setGrid] = useState([]);

    const canvasWidth = 512;
    const canvasHeight = 512;
    const pixelSize = 16;
    const cols = canvasWidth / pixelSize; // 32
    const rows = canvasHeight / pixelSize;
    //const previewImage = canvasRef.current.toDataURL("image/png");

    const rgbToHex = (r, g, b) => {
        return "#" + [r, g, b].map(x => x.toString(16).padStart(2, "0")).join(""); // #ffffff
    };

    const drawGridColors = () => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d");
        console.log("ctx", ctx)

        ctx.clearRect(0, 0, canvasWidth, canvasHeight);

        // 색상 매핑
        for (let y = 0; y < rows; y++) {
            for (let x = 0; x < cols; x++) {
                const color = gridColors[y]?.[x] || "#ffffff";
                ctx.fillStyle = color;
                ctx.fillRect(x * pixelSize, y * pixelSize, pixelSize, pixelSize);
            }
        }

        // 그리드 라인
        ctx.strokeStyle = "#ccc";
        for (let y = 0; y < rows; y++) {
            for (let x = 0; x < cols; x++) {
                ctx.strokeRect(x * pixelSize, y * pixelSize, pixelSize, pixelSize);
            }
        }
    };

    const drawImageAndMapGridColors = () => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d");

        const img = new Image();
        img.crossOrigin = "anonymous";
        const proxiedUrl = `http://localhost:4000/proxy-image?url=${encodeURIComponent(draftImageUrl)}`;
        img.src = proxiedUrl;

        img.onload = () => {
        ctx.clearRect(0, 0, canvasWidth, canvasHeight);
        ctx.drawImage(img, 0, 0, canvasWidth, canvasHeight);
        
        // 이미지 색상 추출
        const imageData = ctx.getImageData(0, 0, canvasWidth, canvasHeight).data;

        const newGridColors = [];

        for (let y = 0; y < rows; y++) {
            const row = [];
            for (let x = 0; x < cols; x++) {
            const px = x * pixelSize; 
            const py = y * pixelSize; 
            const i = (py * canvasWidth + px) * 4; 

            const r = imageData[i];
            const g = imageData[i + 1];
            const b = imageData[i + 2];
            const a = imageData[i + 3];

            if (a === 0) {
                    row.push("#ffffff");
                } else {
                    row.push(rgbToHex(r, g, b));
                }
            }
            newGridColors.push(row);
        }

        setGridColors(newGridColors);
        console.log("newGridColors");
        };
        // 이미지 로딩 디버깅
        img.onerror = (err) => {
            console.log(err);
        };
    };

    const initializeEmptyGrid = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        
        const emptyGridColors = [];
        for (let y = 0; y < rows; y++) {
            const row = [];
            for (let x = 0; x < cols; x++) {
                row.push("#ffffff"); 
            }
            emptyGridColors.push(row);
        }
        
        setGridColors(emptyGridColors);
        
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvasWidth, canvasHeight);
        
        ctx.strokeStyle = "#ccc";
        for (let y = 0; y < rows; y++) {
            for (let x = 0; x < cols; x++) {
                ctx.strokeRect(x * pixelSize, y * pixelSize, pixelSize, pixelSize);
            }
        }
    };


    useEffect(() => {
        if (draftImageUrl) {
            drawImageAndMapGridColors();
        } else {
            initializeEmptyGrid();
        }
    }, [draftImageUrl]);

    // gridColors state 변경 시 캔버스 렌더링
    useEffect(() => {
        if (gridColors.length > 0) {
            drawGridColors();
        }
    }, [gridColors]);

    const handleCanvasClick = (event) => {
        const canvas = canvasRef.current;
        const rect = canvas.getBoundingClientRect();
        const x = Math.floor((event.clientX - rect.left) / pixelSize);
        const y = Math.floor((event.clientY - rect.top) / pixelSize);

        if (x >= 0 && x < cols && y >= 0 && y < rows) {
            if (isEyedropperMode) {
                const color = gridColors[y]?.[x];
                if (color) {
                    setSelectedColor(color);
                    if (!palette.includes(color)) {
                        setPalette((prev) => [...prev, color]);
                    }
                }
                setIsEyedropperMode(false);
            } else {
                const newGrid = [...gridColors];
                newGrid[y][x] = selectedColor;
                setGridColors(newGrid);
            }
        }
    };

    useEffect(() => {
        const canvas = canvasRef.current;

        const getXY = (event) => {
            const rect = canvas.getBoundingClientRect();
            const x = Math.floor((event.clientX - rect.left) / pixelSize);
            const y = Math.floor((event.clientY - rect.top) / pixelSize);
            return { x, y };
        };

        const paintPixel = (x, y, color) => {
            if (!gridColors || gridColors.length === 0) return;
            
            if (x >= 0 && x < cols && y >= 0 && y < rows) {
                const newGrid = [...gridColors];
                newGrid[y][x] = color;
                setGridColors(newGrid);
                
                // 캔버스에 그리기
                const ctx = canvasRef.current.getContext('2d');
                ctx.fillStyle = color;
                ctx.fillRect(x * pixelSize, y * pixelSize, pixelSize, pixelSize);
                
                // 그리드 라인 다시 그리기
                ctx.strokeStyle = "#ccc";
                ctx.strokeRect(x * pixelSize, y * pixelSize, pixelSize, pixelSize);
            }
        };

        const handleMouseDown = (e) => {
            const { x, y } = getXY(e);

            if (isEyedropperMode) {
                const color = gridColors[y]?.[x];
                if (color) {
                    setSelectedColor(color);
                    if (!palette.includes(color)) {
                        setPalette((prev) => [...prev, color]);
                    }
                }
                setIsEyedropperMode(false);
                return;
            }

            setIsPainting(true);
            paintPixel(x, y, selectedColor);
        };

        const handleMouseMove = (e) => {
            if (!isPainting || isEyedropperMode) return;
            const { x, y } = getXY(e);
            paintPixel(x, y, selectedColor);
        };

        const handleMouseUp = () => {
            setIsPainting(false);
        };

        canvas.addEventListener("mousedown", handleMouseDown);
        canvas.addEventListener("mousemove", handleMouseMove);
        window.addEventListener("mouseup", handleMouseUp); 

        // 정리
        return () => {
            canvas.removeEventListener("mousedown", handleMouseDown);
            canvas.removeEventListener("mousemove", handleMouseMove);
            window.removeEventListener("mouseup", handleMouseUp);
        };
    }, [gridColors, selectedColor, isPainting, isEyedropperMode, palette]);


    const handleSelectColor = (color) => {
        setSelectedColor(color);
    };

    const handleColorWheelChange = (newColor) => {
        setSelectedColor(newColor);
    };
    
    const handleShowPreview = () => {
        const tempCanvas = document.createElement("canvas");
        tempCanvas.width = canvasWidth;
        tempCanvas.height = canvasHeight;
        const ctx = tempCanvas.getContext("2d");

        // 그리드 없이 픽셀색상만
        for (let y = 0; y < rows; y++) {
            for (let x = 0; x < cols; x++) {
                const color = gridColors[y]?.[x] || "#ffffff";
                ctx.fillStyle = color;
                ctx.fillRect(x * pixelSize, y * pixelSize, pixelSize, pixelSize);
            }
        }

        const url = tempCanvas.toDataURL("image/png");
        setPreviewUrl(url);
        setIsPreviewOpen(true);
    };

    
    return (
        <EditorLayout>
            <CanvasSection>
                <Canvas
                    ref={canvasRef}
                    width={canvasWidth}
                    height={canvasHeight}
                />
            </CanvasSection>
            
            <SidebarSection>
                <ToolsSection>
                <ToolButton 
                    onClick={() => setIsEyedropperMode(!isEyedropperMode)}
                    active={isEyedropperMode}
                >
                    💧 {isEyedropperMode ? "Color Picker ON" : "Color Picker OFF"}
                </ToolButton>
                <ToolDescription>
                    {isEyedropperMode 
                        ? "Click on any pixel to add its color to your palette"
                        : "Enable to pick colors from your artwork"
                    }
                </ToolDescription>
                
                <CompleteButton onClick={handleShowPreview}>
                    Complete (Preview)
                </CompleteButton>
            </ToolsSection>
                
                            <PaletteSection>
                <SectionTitle>Palette</SectionTitle>
                <Palette palette={palette} onSelectColor={handleSelectColor} />
            </PaletteSection>
            
            <ColorSection>
                <SectionTitle>Color Selection</SectionTitle>
                <SelectedColorBox color={selectedColor} />
                <ColorWheel color={selectedColor} onChange={handleColorWheelChange} />
            </ColorSection>
            </SidebarSection>

            <PreviewModal
                isOpen={isPreviewOpen}
                imageUrl={previewUrl}
                onClose={() => setIsPreviewOpen(false)}
            />
        </EditorLayout>
    );
};

export default PixelEditor;
