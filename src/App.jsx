import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { UserProvider } from './context/UserProvider';
import { ToastProvider } from './components/ui/Toast';

// Import komponent
import Header from './components/Header';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';

// Import stránek
import HomePage from './pages/HomePage';
import GameDetailPage from './pages/GameDetailPage';
import TokenPage from './pages/TokenPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import UserLibraryPage from './pages/UserLibraryPage';
import GamesPage from './pages/GamesPage';

import './App.css';

function App() {
  return (
    <ToastProvider>
      <UserProvider>
        <Router>
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            minHeight: '100vh',
            width: '100%',
            margin: 0,
            padding: 0,
            overflowX: 'hidden',
            position: 'relative'
          }}>
            <Header />

            <main style={{
              flexGrow: 1,
              width: '100%',
              margin: 0,
              padding: 0,
              overflowX: 'hidden',
              position: 'relative'
            }}>
              <div style={{
                width: '100%',
                margin: 0,
                padding: 0,
                maxWidth: '100%',
                overflowX: 'hidden'
              }}>
                <Routes>
                  <Route path="/" element={<HomePage />} />
                  <Route path="/games" element={<GamesPage />} />
                  {/* Podpora jak pro slug tak pro ID */}
                  <Route path="/game/:gameSlug" element={<GameDetailPage />} />
                  <Route path="/tokens" element={<TokenPage />} />
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/register" element={<RegisterPage />} />

                  <Route
                    path="/library"
                    element={
                      <ProtectedRoute>
                        <UserLibraryPage />
                      </ProtectedRoute>
                    }
                  />
                </Routes>
              </div>
            </main>

            <Footer />
          </div>
        </Router>
      </UserProvider>
    </ToastProvider>
  );
}

export default App;