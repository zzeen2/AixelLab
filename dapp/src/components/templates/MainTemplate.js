import React from "react";
import CarouselSection from "../organisms";
import SectionTitle from "../atoms";

const MainTemplate = () => {
    return (
        <div>
        <header style={{ padding: "16px", borderBottom: "1px solid #ccc" }}>
            <h1>🎨 Aixel DAO</h1>
        </header>

        <main style={{ padding: "24px" }}>
            <SectionTitle title="현재 투표 중인 작품" />
            <CarouselSection />
        </main>
        </div>
    );
};

export default MainTemplate;