import React from "react";
import styled from "styled-components";
import { HexColorPicker } from "react-colorful";

const ColorWheel = ({ color, onChange }) => {
    return (
        <ColorWheelContainer>
            <HexColorPicker color={color} onChange={onChange} />
        </ColorWheelContainer>
    );
};

const ColorWheelContainer = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 12px;
    
    .react-colorful {
        width: 200px;
        height: 200px;
    }
    
    .react-colorful__saturation {
        border-radius: 8px;
        border: 2px solid #2a2a2a;
    }
    
    .react-colorful__hue {
        height: 20px;
        border-radius: 10px;
        border: 2px solid #2a2a2a;
    }
    
    .react-colorful__pointer {
        width: 20px;
        height: 20px;
        border: 2px solid #ffffff;
        border-radius: 50%;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
    }
`;

export default ColorWheel;