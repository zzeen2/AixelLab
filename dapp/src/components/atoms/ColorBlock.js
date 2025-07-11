import React from "react";

const ColorBlock = ({ color, onClick }) => {
    return (
        <div
        onClick={() => onClick(color)}
        style={{
            width: 32,
            height: 32,
            backgroundColor: color,
            border: "1px solid black",
            cursor: "pointer"
        }}
        />
    );
};

export default ColorBlock;
