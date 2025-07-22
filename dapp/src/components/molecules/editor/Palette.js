import React from "react";
import { ColorBlock } from "../../atoms";

const Palette = ({ palette, onSelectColor }) => {
    return (
        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
        {palette.map((color, i) => (
            <ColorBlock key={i} color={color} onClick={onSelectColor} />
        ))}
        </div>
    );
};

export default Palette;
