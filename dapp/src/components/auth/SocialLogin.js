import React from 'react'
import styled from 'styled-components'

const LoginContainer = styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 20px;
`;

const GoogleButton = styled.button`
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 12px 24px;
    background: white;
    border: 1px solid #ddd;
    border-radius: 8px;
    cursor: pointer;
    font-size: 16px;
    transition: all 0.2s;
    
    &:hover {
        background: #f8f9fa;
        box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }
`;

const GoogleIcon = styled.span`
    font-weight: bold;
    color: #4285f4;
`;

const SocialLogin = () => {
    const handleGoogleLogin = async () => {
        try {
            window.location.href = "http://localhost:4000/auth/google"
        } catch (error) {
            console.log("구글 로그인 실패", error)
        }
    }
    return (
        <LoginContainer>
            <GoogleButton onClick={handleGoogleLogin}>
                <GoogleIcon>G</GoogleIcon>
                
            </GoogleButton>
        </LoginContainer>
    )
}

export default SocialLogin
