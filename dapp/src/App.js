import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import MainPage from './components/pages/MainPage';
import PixelEditorPage from './components/pages/PixelEditorPage';
import AIDraftPage from './components/pages/AIDraftPage';
import BlankCanvasPage from './components/pages/BlankCanvasPage';
import ProfilePage from './components/pages/ProfilePage';
import LoginPage from './components/pages/LoginPage';
import VotingPage from './components/pages/VotingPage';
import VoteDetailPage from './components/pages/VoteDetailPage';
import NFTDetailPage from './components/pages/NFTDetailPage';
import NFTsPage from './components/pages/NFTsPage';

function AppRoutes() {
  const location = useLocation();
  const state = location.state;

  return (
    <>
      <Routes location={state?.backgroundLocation || location}>
        <Route path="/" element={<MainPage />} />
        <Route path="/editor" element={<PixelEditorPage />} />
        <Route path="/editor/ai-draft" element={<PixelEditorPage mode="ai-draft" />} />
        <Route path="/blank-canvas" element={<BlankCanvasPage />} />
        <Route path="/editor/blank-canvas" element={<PixelEditorPage mode="blank-canvas" />} />
        <Route path="/ai-draft" element={<AIDraftPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/voting" element={<VotingPage />} />
        <Route path="/voting/:id" element={<VoteDetailPage />} />
        <Route path="/nfts" element={<NFTsPage />} />
        {/* /artwork/:id 라우트는 아래에서 분기 처리 */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      {state?.backgroundLocation && (
        <Routes>
          <Route path="/artwork/:id" element={<NFTDetailPage isModal />} />
        </Routes>
      )}
      {!state?.backgroundLocation && (
        <Routes>
          <Route path="/artwork/:id" element={<NFTDetailPage />} />
        </Routes>
      )}
    </>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
}

export default App;