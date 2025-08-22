import React, { useRef, useEffect, useState } from "react";
import styled from "styled-components";
import {Palette} from "../molecules";
import { ColorWheel } from "../atoms";
import {PreviewModal} from "../molecules";

const EditorLayout = styled.div`
    display: flex;
    height: 100%;
    gap: 32px;
    overflow: visible;
    justify-content: center;
    align-items: center;
`;

const CanvasSection = styled.div`
    flex: 0 0 auto;
    display: flex;
    justify-content: center;
    align-items: center;
    background-color: transparent;
    padding: 24px;
    overflow: visible;
    height: 688px;
`;

const Canvas = styled.canvas`
    border: 2px solid rgba(255, 255, 255, 0.2);
    border-radius: 12px;
    background-color: #ffffff;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
`;

const SidebarSection = styled.div`
    display: flex;
    flex-direction: column;
    gap: 16px;
    width: 500px;
    height: 688px;
    
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
    color: rgba(255, 255, 255, 0.6);
    font-size: 14px;
    margin: 0;
    line-height: 1.6;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
`;

const ToolButton = styled.button`
    background-color: ${props => props.active ? 'linear-gradient(135deg, #8b5cf6, #ec4899)' : 'rgba(255, 255, 255, 0.05)'};
    color: #ffffff;
    border: 1px solid ${props => props.active ? 'transparent' : 'rgba(255, 255, 255, 0.1)'};
    border-radius: 12px;
    padding: 14px 20px;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
    
    &:hover {
        background-color: ${props => props.active ? 'linear-gradient(135deg, #7c3aed, #db2777)' : 'rgba(255, 255, 255, 0.1)'};
        border-color: ${props => props.active ? 'transparent' : 'rgba(255, 255, 255, 0.2)'};
        transform: translateY(-1px);
    }
`;

const ColorPickerButton = styled.button`
    background: ${props => props.active ? 'linear-gradient(135deg, #8b5cf6, #ec4899)' : 'rgba(255, 255, 255, 0.1)'};
    color: #ffffff;
    border: 1px solid ${props => props.active ? 'transparent' : 'rgba(255, 255, 255, 0.2)'};
    border-radius: 50%;
    width: 40px;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.2s ease;
    font-size: 16px;
    
    &:hover {
        background: ${props => props.active ? 'linear-gradient(135deg, #7c3aed, #db2777)' : 'rgba(255, 255, 255, 0.15)'};
        transform: scale(1.05);
    }
`;

const CompleteButton = styled.button`
  background: linear-gradient(135deg, #8b5cf6, #ec4899);
  color: #ffffff;
  border: none;
  border-radius: 12px;
  padding: 16px 24px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
  box-shadow: 0 4px 12px rgba(139, 92, 246, 0.3);
  
  &:hover {
    background: linear-gradient(135deg, #7c3aed, #db2777);
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(139, 92, 246, 0.4);
  }
`;

const ColumnSection = styled.div`
    display: flex;
    gap: 24px;
    flex: 1;
`;

const GridSection = styled.div`
    background-color: rgba(255, 255, 255, 0.02);
    border-radius: 16px;
    padding: 16px;
    border: 1px solid rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(10px);
    display: flex;
    flex-direction: column;
    gap: 8px;
    flex: 1;
    width: 50%;
`;

const PaletteSection = styled.div`
    background-color: rgba(255, 255, 255, 0.02);
    border-radius: 16px;
    padding: 20px;
    border: 1px solid rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(10px);
    display: flex;
    flex-direction: column;
    gap: 12px;
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
    margin: 0;
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

const ToolLabel = styled.div`
  font-size: 12px;
  color: #8b949e;
  font-weight: 500;
  text-align: center;
  margin-top: 8px;
`;

const ToolTitle = styled.h4`
  font-size: 16px;
  font-weight: 600;
  color: #ffffff;
  margin: 0 0 8px 0;
`;

const ColorLabel = styled.div`
  font-size: 14px;
  color: #8b949e;
  font-weight: 400;
  margin-bottom: 8px;
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

    const canvasWidth = 640;
    const canvasHeight = 640;
    const pixelSize = 20;
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
        };
        
        // 이미지 로딩 실패 시 빈 그리드로 초기화
        img.onerror = (err) => {
            console.error('이미지 로딩 실패:', err);
            initializeEmptyGrid();
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
                {/* 2컬럼 레이아웃 */}
                <ColumnSection>
                    {/* Left Column - Color Wheel */}
                    <GridSection>
                        <SectionTitle>Color Wheel</SectionTitle>
                        <SelectedColorBox color={selectedColor} />
                        <ColorWheel color={selectedColor} onChange={handleColorWheelChange} />
                    </GridSection>
                    
                    {/* Right Column - Palette with Color Picker */}
                    <GridSection>
                        <SectionTitle>Palette</SectionTitle>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '12px' }}>
                            <ColorPickerButton 
                                onClick={() => setIsEyedropperMode(!isEyedropperMode)}
                                active={isEyedropperMode}
                            >
                                💧
                            </ColorPickerButton>
                            <ToolDescription style={{ margin: 0, fontSize: '12px' }}>
                                {isEyedropperMode ? "Click pixels to add colors" : "Pick colors from artwork"}
                            </ToolDescription>
                        </div>
                        <Palette palette={palette} onSelectColor={handleSelectColor} />
                    </GridSection>
                </ColumnSection>
                
                {/* Complete Button */}
                <div style={{ display: 'flex', gap: '24px' }}>
                    <CompleteButton onClick={handleShowPreview}>
                        Complete (Preview)
                    </CompleteButton>
                </div>
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
