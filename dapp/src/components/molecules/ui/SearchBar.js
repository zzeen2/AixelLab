import React from "react";
import styled from "styled-components";

const SearchWrapper = styled.div`
    background-color: #1e1e1e;
    border-radius: 8px;
    padding: 4px 12px;
    display: flex;
    align-items: center;
    width: 300px;
`;

const Input = styled.input`
    background: transparent;
    border: none;
    outline: none;
    color: white;
    width: 100%;
    font-size: 0.95rem;

    &::placeholder {
        color: #aaa;
    }
`;

const SearchBar = ({ placeholder = "Search..." }) => {
    return (
        <SearchWrapper>
            <Input type="text" placeholder={placeholder} />
        </SearchWrapper>
    );
};

export default SearchBar;
