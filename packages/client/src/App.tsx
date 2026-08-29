import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import { HomePage } from './pages/HomePage';
import { LobbyPage } from './pages/LobbyPage';
import { GamePage } from './pages/GamePage';
import { ToastContainer } from './components/UI/ToastContainer';
import { connectSocket } from './socket/socketClient';
import { useUIStore } from './store/uiStore';


export default function App() {
  const addToast = useUIStore(s => s.addToast);

  useEffect(() => {
    // Connect socket on app mount
    const socket = connectSocket();

    socket.on('connect_error', (err) => {
      addToast({ type: 'error', message: `Connection failed: ${err.message}` });
    });

    return () => {
      socket.off('connect_error');
    };
  }, [addToast]);

  return (
    <BrowserRouter>
      <div className="app-root">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/lobby/:roomCode" element={<LobbyPage />} />
          <Route path="/game/:roomCode" element={<GamePage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        <ToastContainer />
      </div>
    </BrowserRouter>
  );
}
