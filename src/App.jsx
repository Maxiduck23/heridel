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
          <div className="d-flex flex-column min-vh-100 w-100 m-0 p-0 overflow-x-hidden position-relative">
            <Header />

            <main className="flex-grow-1 w-100 m-0 p-0 overflow-x-hidden position-relative">
              <div className="w-100 m-0 p-0 mw-100 overflow-x-hidden">
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