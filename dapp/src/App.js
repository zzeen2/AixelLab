import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import MainPage from './components/pages/MainPage';
import PixelEditorPage from './components/pages/PixelEditorPage';
import AIDraftPage from './components/pages/AIDraftPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MainPage />} />
        <Route path="/editor" element={<PixelEditorPage />} />
        <Route path="/editor/ai-draft" element={<PixelEditorPage mode="ai-draft" />} />
        <Route path="/editor/blank-canvas" element={<PixelEditorPage mode="blank-canvas" />} />
        <Route path="/ai-draft" element={<AIDraftPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;