import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useUser } from '../context/UserContext';

const Header = () => {
    const { user, logout } = useUser();
    const location = useLocation();
    const [showProfileDropdown, setShowProfileDropdown] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    // Zavři menu při změně stránky
    useEffect(() => {
        setIsMobileMenuOpen(false);
        setShowProfileDropdown(false);
    }, [location]);

    const handleLogout = async () => {
        await logout();
        setShowProfileDropdown(false);
    };

    const isActivePath = (path) => {
        return location.pathname === path;
    };

    const navigationLinks = [
        { path: '/', label: 'Domů', icon: '🏠', exact: true },
        { path: '/games', label: 'Katalog her', icon: '🎮', exact: false }
    ];

    const userLinks = user ? [
        { path: '/library', label: 'Moje knihovna', icon: '📚' },
        { path: '/tokens', label: 'Tokeny', icon: '🪙' }
    ] : [];

    return (
        <>
            <header className="header-gradient header-shadow">
                <nav className="navbar navbar-expand-lg navbar-dark px-0 header-navbar">
                    <div className="container-custom d-flex align-items-center justify-content-between">

                        {/* Logo Brand */}
                        <Link to="/" className="navbar-brand d-flex align-items-center py-2 me-4 text-decoration-none">
                            <div className="me-3 position-relative header-logo-icon">
                                🏰
                            </div>
                            <div>
                                <div className="header-logo-title">
                                    HERIDEL
                                </div>
                                <small className="header-logo-subtitle">
                                    GAMING STORE
                                </small>
                            </div>
                        </Link>

                        {/* Desktop Navigation - Skryté na mobilních zařízeních */}
                        <nav className="d-none d-lg-flex align-items-center">
                            {navigationLinks.concat(userLinks).map((link) => (
                                <Link
                                    key={link.path}
                                    to={link.path}
                                    className={`nav-link fw-medium px-4 py-2 rounded-pill mx-1 d-flex align-items-center text-decoration-none text-white ${isActivePath(link.path) ? 'header-nav-link-active' : 'header-nav-link'
                                        }`}
                                >
                                    <span className="me-2">{link.icon}</span>
                                    {link.label}
                                </Link>
                            ))}
                        </nav>

                        {/* Auth Section */}
                        <div className="d-none d-lg-flex align-items-center gap-3">
                            {user ? (
                                // Přihlášený uživatel
                                <>
                                    {/* Token Balance */}
                                    <Link
                                        to="/tokens"
                                        className="d-flex align-items-center px-3 py-2 rounded-pill text-decoration-none header-token-balance"
                                    >
                                        <span className="header-token-icon me-2">🪙</span>
                                        <div>
                                            <div className="header-token-amount">
                                                {user.tokens_balance.toFixed(0)}
                                            </div>
                                            <small className="header-token-label">
                                                tokenů
                                            </small>
                                        </div>
                                    </Link>

                                    {/* Profile Dropdown */}
                                    <div className="position-relative">
                                        <button
                                            className="btn d-flex align-items-center px-3 py-2 header-profile-btn"
                                            onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                                        >
                                            {/* Avatar */}
                                            <div className="header-avatar me-3">
                                                {!user.profile?.avatar_url && (user.profile?.first_name?.[0] || user.username?.[0] || '👤')}
                                            </div>

                                            <div className="text-start flex-grow-1">
                                                <div className="header-profile-name">
                                                    {user.profile?.first_name ?
                                                        user.profile.first_name :
                                                        user.username
                                                    }
                                                </div>
                                                {user.is_admin && (
                                                    <small className="header-admin-badge">
                                                        👑 Admin
                                                    </small>
                                                )}
                                            </div>

                                            <span className="header-dropdown-arrow ms-1">
                                                {showProfileDropdown ? '▲' : '▼'}
                                            </span>
                                        </button>

                                        {/* Dropdown Menu */}
                                        {showProfileDropdown && (
                                            <div className="position-absolute header-dropdown bg-dark border border-secondary">
                                                {/* User Info Header */}
                                                <div className="header-dropdown-header">
                                                    <div className="d-flex align-items-center mb-2">
                                                        <div className="header-dropdown-avatar me-3">
                                                            {!user.profile?.avatar_url && (user.profile?.first_name?.[0] || user.username?.[0] || '👤')}
                                                        </div>
                                                        <div className="flex-grow-1">
                                                            <div className="header-dropdown-name">
                                                                {user.profile?.first_name ?
                                                                    `${user.profile.first_name} ${user.profile.last_name || ''}`.trim() :
                                                                    user.username
                                                                }
                                                            </div>
                                                            <div className="header-dropdown-email">
                                                                {user.email}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="d-flex justify-content-between align-items-center">
                                                        <div className="header-dropdown-tokens">
                                                            🪙 {user.tokens_balance.toFixed(0)} tokenů
                                                        </div>
                                                        {user.is_admin && (
                                                            <span className="badge header-dropdown-admin-badge px-2 py-1">
                                                                👑 Admin
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* Menu Items */}
                                                <div className="header-dropdown-body">
                                                    {[
                                                        { to: '/library', icon: '📚', label: 'Moje knihovna' },
                                                        { to: '/tokens', icon: '🪙', label: 'Koupit tokeny' }
                                                    ].map((item) => (
                                                        <Link
                                                            key={item.to}
                                                            to={item.to}
                                                            className="d-flex align-items-center px-3 py-2 text-decoration-none rounded-3 mb-1 header-dropdown-item text-light"
                                                            onClick={() => setShowProfileDropdown(false)}
                                                        >
                                                            <span className="me-3 header-dropdown-icon">
                                                                {item.icon}
                                                            </span>
                                                            <span className="header-dropdown-label">
                                                                {item.label}
                                                            </span>
                                                        </Link>
                                                    ))}

                                                    {user.is_admin && (
                                                        <Link
                                                            to="/admin"
                                                            className="d-flex align-items-center px-3 py-2 text-decoration-none rounded-3 mb-1 header-dropdown-admin"
                                                            onClick={() => setShowProfileDropdown(false)}
                                                        >
                                                            <span className="me-3 header-dropdown-icon">👑</span>
                                                            <span className="header-dropdown-label fw-semibold">Administrace</span>
                                                        </Link>
                                                    )}

                                                    <hr className="header-dropdown-divider my-3" />

                                                    <button
                                                        onClick={handleLogout}
                                                        className="d-flex align-items-center px-3 py-2 w-100 border-0 bg-transparent text-start rounded-3 header-dropdown-logout"
                                                    >
                                                        <span className="me-3 header-dropdown-icon">🚪</span>
                                                        <span className="header-dropdown-label">Odhlásit se</span>
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </>
                            ) : (
                                // Nepřihlášený uživatel
                                <div className="d-flex gap-2">
                                    <Link
                                        to="/login"
                                        className="btn px-4 py-2 fw-medium d-flex align-items-center text-decoration-none header-btn-login"
                                    >
                                        <span className="me-1">🔐</span>
                                        Přihlásit
                                    </Link>

                                    <Link
                                        to="/register"
                                        className="btn px-4 py-2 fw-medium d-flex align-items-center text-decoration-none header-btn-register"
                                    >
                                        <span className="me-1">📝</span>
                                        Registrovat
                                    </Link>
                                </div>
                            )}
                        </div>

                        {/* Mobile toggle */}
                        <button
                            className="btn d-lg-none header-mobile-toggle"
                            type="button"
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        >
                            {isMobileMenuOpen ? '✕' : '☰'}
                        </button>
                    </div>
                </nav>
            </header>

            {/* Mobile Overlay Menu */}
            {isMobileMenuOpen && (
                <>
                    {/* Backdrop */}
                    <div
                        className="header-mobile-backdrop"
                        onClick={() => setIsMobileMenuOpen(false)}
                    />

                    {/* Mobile Menu */}
                    <div className="header-mobile-menu bg-dark">
                        <div className="container-custom">
                            {/* Navigation Links */}
                            <div className="mb-4">
                                {navigationLinks.concat(userLinks).map((link) => (
                                    <Link
                                        key={link.path}
                                        to={link.path}
                                        className={`d-flex align-items-center p-3 mb-2 text-decoration-none rounded-3 text-white ${isActivePath(link.path) ? 'header-mobile-link-active' : 'header-mobile-link'
                                            }`}
                                        onClick={() => setIsMobileMenuOpen(false)}
                                    >
                                        <span className="me-3 header-mobile-icon">{link.icon}</span>
                                        <span className="header-mobile-label">{link.label}</span>
                                    </Link>
                                ))}
                            </div>

                            {/* Auth Section */}
                            {user ? (
                                <div className="header-mobile-user-section bg-dark border border-secondary">
                                    <div className="text-center mb-3">
                                        <div className="header-mobile-avatar mx-auto mb-3">
                                            {!user.profile?.avatar_url && (user.profile?.first_name?.[0] || user.username?.[0] || '👤')}
                                        </div>
                                        <div className="header-mobile-user-name">
                                            {user.profile?.first_name ?
                                                `${user.profile.first_name} ${user.profile.last_name || ''}`.trim() :
                                                user.username
                                            }
                                        </div>
                                        <div className="header-mobile-user-email">
                                            {user.email}
                                        </div>
                                        <div className="header-mobile-user-tokens">
                                            🪙 {user.tokens_balance.toFixed(0)} tokenů
                                        </div>
                                    </div>

                                    <button
                                        onClick={() => {
                                            handleLogout();
                                            setIsMobileMenuOpen(false);
                                        }}
                                        className="btn w-100 header-mobile-logout-btn"
                                    >
                                        🚪 Odhlásit se
                                    </button>
                                </div>
                            ) : (
                                <div className="d-flex flex-column gap-3">
                                    <Link
                                        to="/login"
                                        className="btn btn-lg header-mobile-login-btn text-decoration-none"
                                        onClick={() => setIsMobileMenuOpen(false)}
                                    >
                                        🔐 Přihlásit se
                                    </Link>
                                    <Link
                                        to="/register"
                                        className="btn btn-lg header-mobile-register-btn text-decoration-none"
                                        onClick={() => setIsMobileMenuOpen(false)}
                                    >
                                        📝 Registrovat se
                                    </Link>
                                </div>
                            )}
                        </div>
                    </div>
                </>
            )}

            {/* Click overlay pro zavření dropdownu */}
            {showProfileDropdown && (
                <div
                    className="header-dropdown-backdrop"
                    onClick={() => setShowProfileDropdown(false)}
                />
            )}
        </>
    );
};

export default Header;