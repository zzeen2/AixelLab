import React, { useRef, useEffect, useState } from "react";
import {Palette} from "../molecules";
import { ColorWheel } from "../atoms";

const PixelEditor = ({ draftImageUrl }) => {
    const canvasRef = useRef(null);
    const [gridColors, setGridColors] = useState([]);
    const [selectedColor, setSelectedColor] = useState("#ff0000");
    const [palette, setPalette] = useState(["#ffffff"]);
    const [isEyedropperMode, setIsEyedropperMode] = useState(false);
    const [isPainting, setIsPainting] = useState(false);



    const canvasWidth = 512;
    const canvasHeight = 512;
    const pixelSize = 16;
    const cols = canvasWidth / pixelSize; // 32
    const rows = canvasHeight / pixelSize;

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

    // 이미지 로딩 후 매핑
    useEffect(() => {
        if (draftImageUrl) {
            drawImageAndMapGridColors();
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

    const paintPixel = (x, y) => {
        if (x >= 0 && x < cols && y >= 0 && y < rows && !isEyedropperMode) {
            const newGrid = [...gridColors];
            newGrid[y][x] = selectedColor;
            setGridColors(newGrid);
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
        paintPixel(x, y);
    };

    const handleMouseMove = (e) => {
        if (!isPainting || isEyedropperMode) return;
        const { x, y } = getXY(e);
        paintPixel(x, y);
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
    
    return (
        <div>
        <canvas
            ref={canvasRef}
            width={canvasWidth}
            height={canvasHeight}
            style={{ border: "1px solid black" }}
        />

        <button onClick={() => setIsEyedropperMode(!isEyedropperMode)}>
            <img src="" alt="스포이드" />
        </button>
        <p>{isEyedropperMode ? "스포이드 ON" : "스포이드 OFF"}</p>

        <h3>팔레트</h3>
        <Palette palette={palette} onSelectColor={handleSelectColor} />

        <h4>선택된 색상</h4>
        <div
            style={{
            width: 32,
            height: 32,
            backgroundColor: selectedColor,
            border: "1px solid black",
            }}
        />

        <h3>컬러휠</h3>
        <ColorWheel color={selectedColor} onChange={handleColorWheelChange} />
        </div>
    );
};

export default PixelEditor;
