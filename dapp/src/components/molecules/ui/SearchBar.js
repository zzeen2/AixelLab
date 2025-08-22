import React from "react";
import styled from "styled-components";

const SearchWrapper = styled.div`
    background-color: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 12px;
    padding: 8px 16px;
    display: flex;
    align-items: center;
    width: 400px;
    transition: all 0.2s ease;
    
    &:focus-within {
        border-color: rgba(255, 255, 255, 0.2);
        background-color: rgba(255, 255, 255, 0.08);
    }
`;

const SearchIcon = styled.div`
    color: rgba(255, 255, 255, 0.6);
    margin-right: 12px;
    font-size: 16px;
`;

const Input = styled.input`
    background: transparent;
    border: none;
    outline: none;
    color: white;
    width: 100%;
    font-size: 14px;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;

    &::placeholder {
        color: rgba(255, 255, 255, 0.5);
    }
`;

const ShortcutKey = styled.div`
    background-color: rgba(255, 255, 255, 0.1);
    border-radius: 6px;
    padding: 4px 8px;
    color: rgba(255, 255, 255, 0.6);
    font-size: 12px;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
    font-weight: 500;
    margin-left: 12px;
`;

const SearchBar = ({ placeholder = "Search AixelLab..." }) => {
    return (
        <SearchWrapper>
            <SearchIcon>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" stroke="currentColor" strokeWidth="2" fill="none"/>
                </svg>
            </SearchIcon>
            <Input type="text" placeholder={placeholder} />
            <ShortcutKey>/</ShortcutKey>
        </SearchWrapper>
    );
};

export default SearchBar;
