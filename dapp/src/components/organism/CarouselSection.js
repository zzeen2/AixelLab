import React from 'react';
import styled from 'styled-components';
import {SectionTitle} from '../atoms';

const Section = styled.section`
    padding: 32px;
`;

const SliderWrapper = styled.div`
    display: flex;
    gap: 16px;
    overflow-x: auto;
`;

const Slide = styled.div`
    min-width: 200px;
    height: 200px;
    background-color: #eee;
    border-radius: 8px;
`;

const CarouselSection = () => {
    return (
        <Section>
        <SectionTitle>투표 중인 드래프트</SectionTitle>
        <SliderWrapper>
            {[1, 2, 3, 4, 5].map((item) => (
            <Slide key={item}>드래프트 {item}</Slide>
            ))}
        </SliderWrapper>
        </Section>
    );
};

export default CarouselSection;
