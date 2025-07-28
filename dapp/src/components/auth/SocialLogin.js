import React from 'react'
import styled from 'styled-components'

const LoginContainer = styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 20px;
`;

const LoginButton = styled.button`
  background: #4285f4;
  color: #ffffff;
  border: none;
  padding: 12px 24px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: background-color 0.2s;
  
  &:hover {
    background: #3367d6;
  }
`;

const ButtonText = styled.span`
  font-size: 16px;
  font-weight: 600;
  color: #ffffff;
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
            <LoginButton onClick={handleGoogleLogin}>
                <ButtonText>G</ButtonText>
            </LoginButton>
        </LoginContainer>
    )
}

export default SocialLogin
