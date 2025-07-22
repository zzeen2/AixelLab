import React from "react";
import { HexColorPicker, HslColorPicker } from "react-colorful";

const ColorWheel = ({ color, onChange }) => {
    return (
        <div>
            <HexColorPicker color={color} onChange={onChange} />
        </div>
    );
};

export default ColorWheel;