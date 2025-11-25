import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Lobby from './pages/Lobby';
import Game from './pages/Game';
import ThemeSwitcher from './components/ThemeSwitcher';

export default function App() {
  return (
    <div>
      <BrowserRouter>
        <ThemeSwitcher />
        <Routes>
          <Route path="/" element={<Lobby />} />
          <Route path="/game" element={<Game />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}
