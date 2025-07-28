import React from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import SocialLogin from '../auth/SocialLogin';

const LoginPage = () => {
    const navigate = useNavigate();

    return (
        <LoginContainer>
            <LoginCard>
                <Logo>AixelLab</Logo>
                <Title>Login</Title>
                <Subtitle>Create an Account Abstraction Wallet with your Google Account</Subtitle>
                
                <SocialLogin />
                
                <BackButton onClick={() => navigate('/')}>
                    ← Go to main
                </BackButton>
            </LoginCard>
        </LoginContainer>
    );
};

const LoginContainer = styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 100vh;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
`;

const LoginCard = styled.div`
    background: white;
    padding: 40px;
    border-radius: 16px;
    box-shadow: 0 10px 30px rgba(0,0,0,0.2);
    text-align: center;
    max-width: 400px;
    width: 100%;
`;

const Logo = styled.h1`
  color: #333;
  margin-bottom: 20px;
  font-size: 32px;
  font-weight: 700;
`;

const Title = styled.h2`
  color: #333;
  margin-bottom: 10px;
  font-size: 24px;
  font-weight: 600;
`;

const Subtitle = styled.p`
  color: #666;
  margin-bottom: 30px;
  font-size: 16px;
  line-height: 1.5;
  font-weight: 400;
`;

const BackButton = styled.button`
  background: none;
  border: none;
  color: #666;
  cursor: pointer;
  margin-top: 20px;
  font-size: 14px;
  font-weight: 600;
  padding: 8px 16px;
  border-radius: 6px;
  transition: all 0.2s;
  
  &:hover {
    color: #333;
    background: #f8f9fa;
  }
`;

export default LoginPage; 