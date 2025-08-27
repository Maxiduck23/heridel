import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { UserProvider } from './context/UserProvider';
import { ToastProvider } from './components/ui/Toast'; // PŘIDAT

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
    <ToastProvider> {/* Obalíme celou aplikaci */}
      <UserProvider>
        <Router>
          <div className="d-flex flex-column min-vh-100">
            <Header />

            <main className="flex-grow-1">
              <div className="container-fluid p-0"> {/* OPRAVENO: odstraněn padding */}
                <Routes>
                  <Route path="/" element={<HomePage />} />
                  <Route path="/games" element={<GamesPage />} />
                  <Route path="/game/:gameId" element={<GameDetailPage />} />
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