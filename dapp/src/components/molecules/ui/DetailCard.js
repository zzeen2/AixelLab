import React from 'react';
import styled from 'styled-components';

const Card = styled.div`
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 16px;
  transition: all 0.2s ease;
  
  &:hover {
    background: rgba(255, 255, 255, 0.08);
    border-color: rgba(255, 255, 255, 0.2);
  }
`;

const CardTitle = styled.h3`
  color: rgba(255, 255, 255, 0.9);
  font-size: 16px;
  font-weight: 600;
  margin: 0 0 12px 0;
`;

const CardContent = styled.div`
  color: rgba(255, 255, 255, 0.7);
  font-size: 14px;
  line-height: 1.5;
`;

const DetailCard = ({ title, children, ...props }) => {
  return (
    <Card {...props}>
      {title && <CardTitle>{title}</CardTitle>}
      <CardContent>
        {children}
      </CardContent>
    </Card>
  );
};

export default DetailCard; 