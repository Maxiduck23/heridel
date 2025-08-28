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
            <header style={{
                background: 'linear-gradient(135deg, #1e40af 0%, #3b82f6 50%, #1d4ed8 100%)',
                borderBottom: '1px solid rgba(255,255,255,0.1)',
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
                position: 'sticky',
                top: 0,
                zIndex: 1030,
                backdropFilter: 'blur(20px)'
            }}>
                <nav className="navbar navbar-expand-lg navbar-dark px-0" style={{ minHeight: '80px' }}>
                    <div style={{
                        width: '100%',
                        maxWidth: '1200px',
                        margin: '0 auto',
                        paddingLeft: '15px',
                        paddingRight: '15px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between'
                    }}>

                        {/* Logo Brand */}
                        <Link to="/" className="navbar-brand d-flex align-items-center py-2 me-4" style={{ textDecoration: 'none' }}>
                            <div className="me-3 position-relative" style={{
                                fontSize: '2.2rem',
                                filter: 'drop-shadow(2px 2px 8px rgba(0,0,0,0.4))',
                                transition: 'all 0.3s ease'
                            }}
                                onMouseEnter={(e) => {
                                    e.target.style.transform = 'scale(1.1) rotate(5deg)';
                                }}
                                onMouseLeave={(e) => {
                                    e.target.style.transform = 'scale(1) rotate(0deg)';
                                }}
                            >
                                🏰
                            </div>
                            <div>
                                <div style={{
                                    fontSize: '1.6rem',
                                    fontWeight: '900',
                                    letterSpacing: '1px',
                                    textShadow: '2px 2px 6px rgba(0,0,0,0.4)',
                                    fontFamily: 'system-ui, -apple-system, sans-serif',
                                    background: 'linear-gradient(135deg, #ffffff 0%, #e2e8f0 100%)',
                                    WebkitBackgroundClip: 'text',
                                    WebkitTextFillColor: 'transparent',
                                    backgroundClip: 'text'
                                }}>
                                    HERIDEL
                                </div>
                                <small style={{
                                    fontSize: '0.65rem',
                                    opacity: '0.85',
                                    letterSpacing: '2px',
                                    fontWeight: '600',
                                    color: 'rgba(255,255,255,0.8)'
                                }}>
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
                                    className={`nav-link fw-medium px-4 py-2 rounded-pill mx-1 d-flex align-items-center ${isActivePath(link.path) ? 'active' : ''}`}
                                    style={{
                                        transition: 'all 0.3s ease',
                                        background: isActivePath(link.path)
                                            ? 'rgba(255,255,255,0.2)'
                                            : 'rgba(255,255,255,0.05)',
                                        backdropFilter: 'blur(10px)',
                                        border: isActivePath(link.path)
                                            ? '1px solid rgba(255,255,255,0.3)'
                                            : '1px solid transparent',
                                        fontSize: '0.95rem',
                                        fontWeight: '600',
                                        textDecoration: 'none',
                                        color: 'white'
                                    }}
                                    onMouseEnter={(e) => {
                                        if (!isActivePath(link.path)) {
                                            e.target.style.background = 'rgba(255,255,255,0.15)';
                                            e.target.style.transform = 'translateY(-2px)';
                                            e.target.style.border = '1px solid rgba(255,255,255,0.2)';
                                        }
                                    }}
                                    onMouseLeave={(e) => {
                                        if (!isActivePath(link.path)) {
                                            e.target.style.background = 'rgba(255,255,255,0.05)';
                                            e.target.style.transform = 'translateY(0)';
                                            e.target.style.border = '1px solid transparent';
                                        }
                                    }}
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
                                        className="d-flex align-items-center px-3 py-2 rounded-pill text-decoration-none"
                                        style={{
                                            background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.2), rgba(5, 150, 105, 0.1))',
                                            border: '1px solid rgba(16, 185, 129, 0.3)',
                                            backdropFilter: 'blur(10px)',
                                            transition: 'all 0.3s ease'
                                        }}
                                        onMouseEnter={(e) => {
                                            e.target.style.background = 'linear-gradient(135deg, rgba(16, 185, 129, 0.3), rgba(5, 150, 105, 0.2))';
                                            e.target.style.transform = 'scale(1.05)';
                                        }}
                                        onMouseLeave={(e) => {
                                            e.target.style.background = 'linear-gradient(135deg, rgba(16, 185, 129, 0.2), rgba(5, 150, 105, 0.1))';
                                            e.target.style.transform = 'scale(1)';
                                        }}
                                    >
                                        <span style={{ fontSize: '1.2rem', marginRight: '0.5rem' }}>🪙</span>
                                        <div>
                                            <div style={{
                                                fontWeight: '700',
                                                color: '#10b981',
                                                fontSize: '0.95rem',
                                                lineHeight: '1.2'
                                            }}>
                                                {user.tokens_balance.toFixed(0)}
                                            </div>
                                            <small style={{
                                                color: 'rgba(255,255,255,0.7)',
                                                fontSize: '0.7rem',
                                                lineHeight: '1'
                                            }}>
                                                tokenů
                                            </small>
                                        </div>
                                    </Link>

                                    {/* Profile Dropdown */}
                                    <div className="position-relative">
                                        <button
                                            className="btn d-flex align-items-center px-3 py-2"
                                            style={{
                                                background: 'rgba(255,255,255,0.1)',
                                                border: '1px solid rgba(255,255,255,0.2)',
                                                borderRadius: '25px',
                                                color: 'white',
                                                transition: 'all 0.3s ease',
                                                backdropFilter: 'blur(10px)',
                                                minWidth: '120px'
                                            }}
                                            onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                                            onMouseEnter={(e) => {
                                                e.target.style.background = 'rgba(255,255,255,0.2)';
                                                e.target.style.transform = 'translateY(-1px)';
                                                e.target.style.border = '1px solid rgba(255,255,255,0.3)';
                                            }}
                                            onMouseLeave={(e) => {
                                                e.target.style.background = 'rgba(255,255,255,0.1)';
                                                e.target.style.transform = 'translateY(0)';
                                                e.target.style.border = '1px solid rgba(255,255,255,0.2)';
                                            }}
                                        >
                                            {/* Avatar */}
                                            <div style={{
                                                width: '32px',
                                                height: '32px',
                                                borderRadius: '50%',
                                                background: user.profile?.avatar_url ?
                                                    `url(${user.profile.avatar_url}) center/cover` :
                                                    'linear-gradient(135deg, #10b981, #059669)',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                marginRight: '0.75rem',
                                                fontSize: '1rem',
                                                fontWeight: 'bold',
                                                border: '2px solid rgba(255,255,255,0.3)',
                                                boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
                                            }}>
                                                {!user.profile?.avatar_url && (user.profile?.first_name?.[0] || user.username?.[0] || '👤')}
                                            </div>

                                            <div className="text-start flex-grow-1">
                                                <div style={{
                                                    fontSize: '0.85rem',
                                                    fontWeight: '600',
                                                    lineHeight: '1.2',
                                                    maxWidth: '80px',
                                                    overflow: 'hidden',
                                                    textOverflow: 'ellipsis',
                                                    whiteSpace: 'nowrap'
                                                }}>
                                                    {user.profile?.first_name ?
                                                        user.profile.first_name :
                                                        user.username
                                                    }
                                                </div>
                                                {user.is_admin && (
                                                    <small style={{
                                                        color: '#fbbf24',
                                                        fontSize: '0.7rem',
                                                        fontWeight: '600',
                                                        lineHeight: '1'
                                                    }}>
                                                        👑 Admin
                                                    </small>
                                                )}
                                            </div>

                                            <span style={{
                                                marginLeft: '0.25rem',
                                                fontSize: '0.7rem',
                                                transition: 'transform 0.3s ease'
                                            }}>
                                                {showProfileDropdown ? '▲' : '▼'}
                                            </span>
                                        </button>

                                        {/* Dropdown Menu */}
                                        {showProfileDropdown && (
                                            <div
                                                className="position-absolute"
                                                style={{
                                                    top: '100%',
                                                    right: '0',
                                                    marginTop: '0.5rem',
                                                    background: 'rgba(30, 41, 59, 0.95)',
                                                    backdropFilter: 'blur(20px)',
                                                    borderRadius: '16px',
                                                    boxShadow: '0 25px 50px rgba(0, 0, 0, 0.25)',
                                                    border: '1px solid rgba(255, 255, 255, 0.1)',
                                                    minWidth: '280px',
                                                    zIndex: 1000,
                                                    overflow: 'hidden'
                                                }}
                                            >
                                                {/* User Info Header */}
                                                <div style={{
                                                    padding: '1.5rem',
                                                    background: 'linear-gradient(135deg, rgba(79, 70, 229, 0.2), rgba(124, 58, 237, 0.1))',
                                                    borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
                                                }}>
                                                    <div className="d-flex align-items-center mb-2">
                                                        <div style={{
                                                            width: '48px',
                                                            height: '48px',
                                                            borderRadius: '50%',
                                                            background: user.profile?.avatar_url ?
                                                                `url(${user.profile.avatar_url}) center/cover` :
                                                                'linear-gradient(135deg, #10b981, #059669)',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center',
                                                            fontSize: '1.2rem',
                                                            fontWeight: 'bold',
                                                            marginRight: '1rem',
                                                            border: '3px solid rgba(255,255,255,0.2)',
                                                            color: 'white'
                                                        }}>
                                                            {!user.profile?.avatar_url && (user.profile?.first_name?.[0] || user.username?.[0] || '👤')}
                                                        </div>
                                                        <div className="flex-grow-1">
                                                            <div style={{
                                                                fontWeight: '700',
                                                                color: 'white',
                                                                marginBottom: '0.25rem',
                                                                fontSize: '1.1rem'
                                                            }}>
                                                                {user.profile?.first_name ?
                                                                    `${user.profile.first_name} ${user.profile.last_name || ''}`.trim() :
                                                                    user.username
                                                                }
                                                            </div>
                                                            <div style={{
                                                                fontSize: '0.8rem',
                                                                color: 'rgba(255,255,255,0.7)'
                                                            }}>
                                                                {user.email}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="d-flex justify-content-between align-items-center">
                                                        <div style={{
                                                            fontSize: '0.9rem',
                                                            color: '#10b981',
                                                            fontWeight: '700'
                                                        }}>
                                                            🪙 {user.tokens_balance.toFixed(0)} tokenů
                                                        </div>
                                                        {user.is_admin && (
                                                            <span
                                                                className="badge px-2 py-1"
                                                                style={{
                                                                    background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                                                                    fontSize: '0.7rem',
                                                                    borderRadius: '12px'
                                                                }}
                                                            >
                                                                👑 Admin
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* Menu Items */}
                                                <div style={{ padding: '0.75rem' }}>
                                                    {[
                                                        { to: '/library', icon: '📚', label: 'Moje knihovna' },
                                                        { to: '/tokens', icon: '🪙', label: 'Koupit tokeny' }
                                                    ].map((item) => (
                                                        <Link
                                                            key={item.to}
                                                            to={item.to}
                                                            className="d-flex align-items-center px-3 py-2 text-decoration-none rounded-3 mb-1"
                                                            style={{
                                                                color: 'rgba(255,255,255,0.9)',
                                                                transition: 'all 0.2s ease'
                                                            }}
                                                            onClick={() => setShowProfileDropdown(false)}
                                                            onMouseEnter={(e) => {
                                                                e.target.style.background = 'rgba(255,255,255,0.1)';
                                                                e.target.style.transform = 'translateX(4px)';
                                                            }}
                                                            onMouseLeave={(e) => {
                                                                e.target.style.background = 'transparent';
                                                                e.target.style.transform = 'translateX(0)';
                                                            }}
                                                        >
                                                            <span style={{ marginRight: '0.75rem', fontSize: '1.1rem' }}>
                                                                {item.icon}
                                                            </span>
                                                            <span style={{ fontSize: '0.9rem', fontWeight: '500' }}>
                                                                {item.label}
                                                            </span>
                                                        </Link>
                                                    ))}

                                                    {user.is_admin && (
                                                        <Link
                                                            to="/admin"
                                                            className="d-flex align-items-center px-3 py-2 text-decoration-none rounded-3 mb-1"
                                                            style={{
                                                                color: '#f59e0b',
                                                                background: 'rgba(245, 158, 11, 0.1)',
                                                                transition: 'all 0.2s ease'
                                                            }}
                                                            onClick={() => setShowProfileDropdown(false)}
                                                            onMouseEnter={(e) => {
                                                                e.target.style.background = 'rgba(245, 158, 11, 0.2)';
                                                                e.target.style.transform = 'translateX(4px)';
                                                            }}
                                                            onMouseLeave={(e) => {
                                                                e.target.style.background = 'rgba(245, 158, 11, 0.1)';
                                                                e.target.style.transform = 'translateX(0)';
                                                            }}
                                                        >
                                                            <span style={{ marginRight: '0.75rem', fontSize: '1.1rem' }}>👑</span>
                                                            <span style={{ fontSize: '0.9rem', fontWeight: '600' }}>Administrace</span>
                                                        </Link>
                                                    )}

                                                    <hr style={{
                                                        margin: '0.75rem 0',
                                                        border: 'none',
                                                        borderTop: '1px solid rgba(255,255,255,0.1)'
                                                    }} />

                                                    <button
                                                        onClick={handleLogout}
                                                        className="d-flex align-items-center px-3 py-2 w-100 border-0 bg-transparent text-start rounded-3"
                                                        style={{
                                                            color: '#ef4444',
                                                            transition: 'all 0.2s ease',
                                                            cursor: 'pointer'
                                                        }}
                                                        onMouseEnter={(e) => {
                                                            e.target.style.background = 'rgba(239, 68, 68, 0.1)';
                                                            e.target.style.transform = 'translateX(4px)';
                                                        }}
                                                        onMouseLeave={(e) => {
                                                            e.target.style.background = 'transparent';
                                                            e.target.style.transform = 'translateX(0)';
                                                        }}
                                                    >
                                                        <span style={{ marginRight: '0.75rem', fontSize: '1.1rem' }}>🚪</span>
                                                        <span style={{ fontSize: '0.9rem', fontWeight: '500' }}>Odhlásit se</span>
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
                                        className="btn px-4 py-2 fw-medium d-flex align-items-center"
                                        style={{
                                            background: 'linear-gradient(135deg, #10b981, #059669)',
                                            border: 'none',
                                            borderRadius: '25px',
                                            color: 'white',
                                            transition: 'all 0.3s ease',
                                            boxShadow: '0 4px 15px rgba(16, 185, 129, 0.3)',
                                            fontSize: '0.9rem',
                                            textDecoration: 'none'
                                        }}
                                        onMouseEnter={(e) => {
                                            e.target.style.transform = 'translateY(-2px)';
                                            e.target.style.boxShadow = '0 6px 20px rgba(16, 185, 129, 0.4)';
                                        }}
                                        onMouseLeave={(e) => {
                                            e.target.style.transform = 'translateY(0)';
                                            e.target.style.boxShadow = '0 4px 15px rgba(16, 185, 129, 0.3)';
                                        }}
                                    >
                                        <span className="me-1">🔐</span>
                                        Přihlásit
                                    </Link>

                                    <Link
                                        to="/register"
                                        className="btn px-4 py-2 fw-medium d-flex align-items-center"
                                        style={{
                                            background: 'transparent',
                                            border: '2px solid rgba(255,255,255,0.6)',
                                            borderRadius: '25px',
                                            color: 'white',
                                            transition: 'all 0.3s ease',
                                            fontSize: '0.9rem',
                                            textDecoration: 'none'
                                        }}
                                        onMouseEnter={(e) => {
                                            e.target.style.background = 'rgba(255,255,255,0.1)';
                                            e.target.style.borderColor = 'white';
                                            e.target.style.transform = 'translateY(-2px)';
                                        }}
                                        onMouseLeave={(e) => {
                                            e.target.style.background = 'transparent';
                                            e.target.style.borderColor = 'rgba(255,255,255,0.6)';
                                            e.target.style.transform = 'translateY(0)';
                                        }}
                                    >
                                        <span className="me-1">📝</span>
                                        Registrovat
                                    </Link>
                                </div>
                            )}
                        </div>

                        {/* Mobile toggle */}
                        <button
                            className="btn d-lg-none"
                            type="button"
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            style={{
                                background: 'rgba(255,255,255,0.1)',
                                backdropFilter: 'blur(10px)',
                                borderRadius: '12px',
                                transition: 'all 0.3s ease',
                                border: '1px solid rgba(255,255,255,0.2)',
                                color: 'white',
                                fontSize: '1.2rem',
                                width: '45px',
                                height: '45px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}
                            onMouseEnter={(e) => {
                                e.target.style.background = 'rgba(255,255,255,0.2)';
                                e.target.style.transform = 'scale(1.05)';
                            }}
                            onMouseLeave={(e) => {
                                e.target.style.background = 'rgba(255,255,255,0.1)';
                                e.target.style.transform = 'scale(1)';
                            }}
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
                        style={{
                            position: 'fixed',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            background: 'rgba(0, 0, 0, 0.5)',
                            zIndex: 1040,
                            backdropFilter: 'blur(5px)'
                        }}
                        onClick={() => setIsMobileMenuOpen(false)}
                    />

                    {/* Mobile Menu */}
                    <div
                        style={{
                            position: 'fixed',
                            top: '80px', // Výška hlavičky
                            left: 0,
                            right: 0,
                            background: 'rgba(30, 64, 175, 0.95)',
                            backdropFilter: 'blur(20px)',
                            zIndex: 1050,
                            padding: '1.5rem',
                            borderBottom: '1px solid rgba(255,255,255,0.1)',
                            maxHeight: 'calc(100vh - 80px)',
                            overflowY: 'auto'
                        }}
                    >
                        <div style={{
                            width: '100%',
                            maxWidth: '1200px',
                            margin: '0 auto'
                        }}>
                            {/* Navigation Links */}
                            <div className="mb-4">
                                {navigationLinks.concat(userLinks).map((link) => (
                                    <Link
                                        key={link.path}
                                        to={link.path}
                                        className="d-flex align-items-center p-3 mb-2 text-decoration-none rounded-3"
                                        style={{
                                            color: 'white',
                                            background: isActivePath(link.path)
                                                ? 'rgba(255,255,255,0.2)'
                                                : 'rgba(255,255,255,0.05)',
                                            border: isActivePath(link.path)
                                                ? '1px solid rgba(255,255,255,0.3)'
                                                : '1px solid transparent',
                                            transition: 'all 0.2s ease'
                                        }}
                                        onClick={() => setIsMobileMenuOpen(false)}
                                        onTouchStart={(e) => {
                                            if (!isActivePath(link.path)) {
                                                e.target.style.background = 'rgba(255,255,255,0.15)';
                                            }
                                        }}
                                        onTouchEnd={(e) => {
                                            if (!isActivePath(link.path)) {
                                                e.target.style.background = 'rgba(255,255,255,0.05)';
                                            }
                                        }}
                                    >
                                        <span className="me-3" style={{ fontSize: '1.5rem' }}>{link.icon}</span>
                                        <span style={{ fontSize: '1.1rem', fontWeight: '600' }}>{link.label}</span>
                                    </Link>
                                ))}
                            </div>

                            {/* Auth Section */}
                            {user ? (
                                <div
                                    style={{
                                        background: 'rgba(255,255,255,0.1)',
                                        borderRadius: '16px',
                                        padding: '1.5rem',
                                        border: '1px solid rgba(255,255,255,0.2)'
                                    }}
                                >
                                    <div className="text-center mb-3">
                                        <div style={{
                                            width: '60px',
                                            height: '60px',
                                            borderRadius: '50%',
                                            background: user.profile?.avatar_url ?
                                                `url(${user.profile.avatar_url}) center/cover` :
                                                'linear-gradient(135deg, #10b981, #059669)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            fontSize: '1.5rem',
                                            fontWeight: 'bold',
                                            margin: '0 auto 1rem',
                                            border: '3px solid rgba(255,255,255,0.3)',
                                            color: 'white'
                                        }}>
                                            {!user.profile?.avatar_url && (user.profile?.first_name?.[0] || user.username?.[0] || '👤')}
                                        </div>
                                        <div style={{
                                            color: 'white',
                                            fontSize: '1.2rem',
                                            fontWeight: '700',
                                            marginBottom: '0.25rem'
                                        }}>
                                            {user.profile?.first_name ?
                                                `${user.profile.first_name} ${user.profile.last_name || ''}`.trim() :
                                                user.username
                                            }
                                        </div>
                                        <div style={{
                                            color: 'rgba(255,255,255,0.7)',
                                            fontSize: '0.9rem',
                                            marginBottom: '1rem'
                                        }}>
                                            {user.email}
                                        </div>
                                        <div style={{
                                            color: '#10b981',
                                            fontSize: '1.1rem',
                                            fontWeight: '700'
                                        }}>
                                            🪙 {user.tokens_balance.toFixed(0)} tokenů
                                        </div>
                                    </div>

                                    <button
                                        onClick={() => {
                                            handleLogout();
                                            setIsMobileMenuOpen(false);
                                        }}
                                        className="btn w-100"
                                        style={{
                                            background: 'rgba(239, 68, 68, 0.2)',
                                            border: '1px solid rgba(239, 68, 68, 0.3)',
                                            color: '#ef4444',
                                            borderRadius: '12px',
                                            padding: '0.75rem',
                                            fontWeight: '600'
                                        }}
                                    >
                                        🚪 Odhlásit se
                                    </button>
                                </div>
                            ) : (
                                <div className="d-flex flex-column gap-3">
                                    <Link
                                        to="/login"
                                        className="btn btn-lg"
                                        style={{
                                            background: 'linear-gradient(135deg, #10b981, #059669)',
                                            border: 'none',
                                            borderRadius: '50px',
                                            color: 'white',
                                            fontWeight: '600',
                                            textDecoration: 'none',
                                            padding: '1rem'
                                        }}
                                        onClick={() => setIsMobileMenuOpen(false)}
                                    >
                                        🔐 Přihlásit se
                                    </Link>
                                    <Link
                                        to="/register"
                                        className="btn btn-lg"
                                        style={{
                                            background: 'transparent',
                                            border: '2px solid rgba(255,255,255,0.6)',
                                            borderRadius: '50px',
                                            color: 'white',
                                            fontWeight: '600',
                                            textDecoration: 'none',
                                            padding: '1rem'
                                        }}
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
                    style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        zIndex: 999,
                        background: 'transparent'
                    }}
                    onClick={() => setShowProfileDropdown(false)}
                />
            )}
        </>
    );
};

export default Header;