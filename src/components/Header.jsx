
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useUser } from '../context/UserContext';

const Header = () => {
    const { user, logout } = useUser();
    const [showProfileDropdown, setShowProfileDropdown] = useState(false);

    const handleLogout = async () => {
        await logout();
        setShowProfileDropdown(false);
    };

    return (
        <header style={{
            background: 'linear-gradient(135deg, #1e40af 0%, #3b82f6 100%)',
            borderBottom: '3px solid #1d4ed8',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
            position: 'relative'
        }}>
            <nav className="navbar navbar-expand-lg navbar-dark">
                <div className="container">

                    {/* Logo Brand */}
                    <Link to="/" className="navbar-brand d-flex align-items-center py-2" style={{ textDecoration: 'none' }}>
                        <div className="me-3" style={{
                            fontSize: '2.5rem',
                            filter: 'drop-shadow(2px 2px 4px rgba(0,0,0,0.3))'
                        }}>
                            🏰
                        </div>
                        <div>
                            <div style={{
                                fontSize: '1.8rem',
                                fontWeight: '800',
                                letterSpacing: '1px',
                                textShadow: '2px 2px 4px rgba(0,0,0,0.3)',
                                fontFamily: 'system-ui, -apple-system, sans-serif'
                            }}>
                                HERIDEL
                            </div>
                            <small style={{
                                fontSize: '0.75rem',
                                opacity: '0.9',
                                letterSpacing: '2px',
                                fontWeight: '500'
                            }}>
                                GAMING STORE
                            </small>
                        </div>
                    </Link>

                    {/* Mobile toggle */}
                    <button
                        className="navbar-toggler border-0"
                        type="button"
                        data-bs-toggle="collapse"
                        data-bs-target="#navbarNav"
                        style={{
                            background: 'rgba(255,255,255,0.1)',
                            backdropFilter: 'blur(10px)'
                        }}
                    >
                        <span className="navbar-toggler-icon"></span>
                    </button>

                    <div className="collapse navbar-collapse" id="navbarNav">

                        {/* Navigation */}
                        <nav className="navbar-nav me-auto ms-4">
                            <Link
                                to="/"
                                className="nav-link fw-medium px-3 py-2 rounded mx-1"
                                style={{
                                    transition: 'all 0.3s ease',
                                    background: 'rgba(255,255,255,0.1)',
                                    backdropFilter: 'blur(10px)'
                                }}
                                onMouseEnter={(e) => {
                                    e.target.style.background = 'rgba(255,255,255,0.2)';
                                    e.target.style.transform = 'translateY(-2px)';
                                }}
                                onMouseLeave={(e) => {
                                    e.target.style.background = 'rgba(255,255,255,0.1)';
                                    e.target.style.transform = 'translateY(0)';
                                }}
                            >
                                🎮 Katalog her
                            </Link>

                            {user && (
                                <Link
                                    to="/library"
                                    className="nav-link fw-medium px-3 py-2 rounded mx-1"
                                    style={{
                                        transition: 'all 0.3s ease',
                                        background: 'rgba(255,255,255,0.1)',
                                        backdropFilter: 'blur(10px)'
                                    }}
                                    onMouseEnter={(e) => {
                                        e.target.style.background = 'rgba(255,255,255,0.2)';
                                        e.target.style.transform = 'translateY(-2px)';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.target.style.background = 'rgba(255,255,255,0.1)';
                                        e.target.style.transform = 'translateY(0)';
                                    }}
                                >
                                    📚 Moje knihovna
                                </Link>
                            )}
                        </nav>

                        {/* Auth Section */}
                        <div className="d-flex align-items-center gap-3">
                            {user ? (
                                // Přihlášený uživatel
                                <>
                                    {/* Token Balance */}
                                    <div className="d-flex align-items-center px-3 py-2 rounded" style={{
                                        background: 'rgba(16, 185, 129, 0.15)',
                                        border: '1px solid rgba(16, 185, 129, 0.3)',
                                        backdropFilter: 'blur(10px)'
                                    }}>
                                        <span style={{ fontSize: '1.2rem', marginRight: '0.5rem' }}>🪙</span>
                                        <span style={{ fontWeight: '700', color: '#10b981', fontSize: '0.95rem' }}>
                                            {user.tokens_balance.toFixed(2)} tokenů
                                        </span>
                                    </div>

                                    {/* Profile Dropdown */}
                                    <div className="position-relative">
                                        <button
                                            className="btn d-flex align-items-center px-3 py-2"
                                            style={{
                                                background: 'rgba(255,255,255,0.15)',
                                                border: '1px solid rgba(255,255,255,0.3)',
                                                borderRadius: '10px',
                                                color: 'white',
                                                transition: 'all 0.3s ease',
                                                backdropFilter: 'blur(10px)'
                                            }}
                                            onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                                            onMouseEnter={(e) => {
                                                e.target.style.background = 'rgba(255,255,255,0.25)';
                                                e.target.style.transform = 'translateY(-1px)';
                                            }}
                                            onMouseLeave={(e) => {
                                                e.target.style.background = 'rgba(255,255,255,0.15)';
                                                e.target.style.transform = 'translateY(0)';
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
                                                fontWeight: 'bold'
                                            }}>
                                                {!user.profile?.avatar_url && (user.profile?.first_name?.[0] || user.username?.[0] || '👤')}
                                            </div>

                                            <div className="text-start">
                                                <div style={{ fontSize: '0.9rem', fontWeight: '600', lineHeight: '1.2' }}>
                                                    {user.profile?.first_name ?
                                                        `${user.profile.first_name} ${user.profile.last_name || ''}`.trim() :
                                                        user.username
                                                    }
                                                </div>
                                                {user.is_admin && (
                                                    <small style={{ color: '#fbbf24', fontSize: '0.75rem', fontWeight: '500' }}>
                                                        👑 Admin
                                                    </small>
                                                )}
                                            </div>

                                            <span style={{ marginLeft: '0.5rem', fontSize: '0.8rem' }}>
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
                                                    background: 'white',
                                                    borderRadius: '12px',
                                                    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
                                                    border: '1px solid rgba(0, 0, 0, 0.1)',
                                                    minWidth: '220px',
                                                    zIndex: 1000,
                                                    overflow: 'hidden'
                                                }}
                                            >
                                                {/* User Info Header */}
                                                <div style={{ padding: '1rem', background: 'linear-gradient(135deg, #f8fafc, #e2e8f0)', borderBottom: '1px solid rgba(0, 0, 0, 0.1)' }}>
                                                    <div style={{ fontWeight: '600', color: '#1e293b', marginBottom: '0.25rem' }}>
                                                        {user.profile?.first_name ?
                                                            `${user.profile.first_name} ${user.profile.last_name || ''}`.trim() :
                                                            user.username
                                                        }
                                                    </div>
                                                    <div style={{ fontSize: '0.85rem', color: '#64748b' }}>
                                                        {user.email}
                                                    </div>
                                                    <div style={{ fontSize: '0.8rem', color: '#10b981', fontWeight: '600', marginTop: '0.5rem' }}>
                                                        🪙 {user.tokens_balance.toFixed(2)} tokenů
                                                    </div>
                                                </div>

                                                {/* Menu Items */}
                                                <div style={{ padding: '0.5rem' }}>
                                                    <Link
                                                        to="/profile"
                                                        className="d-flex align-items-center px-3 py-2 text-decoration-none"
                                                        style={{
                                                            color: '#374151',
                                                            borderRadius: '8px',
                                                            transition: 'background-color 0.2s'
                                                        }}
                                                        onClick={() => setShowProfileDropdown(false)}
                                                        onMouseEnter={(e) => e.target.style.background = '#f3f4f6'}
                                                        onMouseLeave={(e) => e.target.style.background = 'transparent'}
                                                    >
                                                        <span style={{ marginRight: '0.75rem', fontSize: '1.1rem' }}>👤</span>
                                                        <span style={{ fontSize: '0.9rem', fontWeight: '500' }}>Můj profil</span>
                                                    </Link>

                                                    <Link
                                                        to="/library"
                                                        className="d-flex align-items-center px-3 py-2 text-decoration-none"
                                                        style={{
                                                            color: '#374151',
                                                            borderRadius: '8px',
                                                            transition: 'background-color 0.2s'
                                                        }}
                                                        onClick={() => setShowProfileDropdown(false)}
                                                        onMouseEnter={(e) => e.target.style.background = '#f3f4f6'}
                                                        onMouseLeave={(e) => e.target.style.background = 'transparent'}
                                                    >
                                                        <span style={{ marginRight: '0.75rem', fontSize: '1.1rem' }}>📚</span>
                                                        <span style={{ fontSize: '0.9rem', fontWeight: '500' }}>Moje knihovna</span>
                                                    </Link>

                                                    <Link
                                                        to="/tokens"
                                                        className="d-flex align-items-center px-3 py-2 text-decoration-none"
                                                        style={{
                                                            color: '#374151',
                                                            borderRadius: '8px',
                                                            transition: 'background-color 0.2s'
                                                        }}
                                                        onClick={() => setShowProfileDropdown(false)}
                                                        onMouseEnter={(e) => e.target.style.background = '#f3f4f6'}
                                                        onMouseLeave={(e) => e.target.style.background = 'transparent'}
                                                    >
                                                        <span style={{ marginRight: '0.75rem', fontSize: '1.1rem' }}>🪙</span>
                                                        <span style={{ fontSize: '0.9rem', fontWeight: '500' }}>Koupit tokeny</span>
                                                    </Link>

                                                    {user.is_admin && (
                                                        <Link
                                                            to="/admin"
                                                            className="d-flex align-items-center px-3 py-2 text-decoration-none"
                                                            style={{
                                                                color: '#374151',
                                                                borderRadius: '8px',
                                                                transition: 'background-color 0.2s'
                                                            }}
                                                            onClick={() => setShowProfileDropdown(false)}
                                                            onMouseEnter={(e) => e.target.style.background = '#fef3c7'}
                                                            onMouseLeave={(e) => e.target.style.background = 'transparent'}
                                                        >
                                                            <span style={{ marginRight: '0.75rem', fontSize: '1.1rem' }}>👑</span>
                                                            <span style={{ fontSize: '0.9rem', fontWeight: '500', color: '#d97706' }}>Administrace</span>
                                                        </Link>
                                                    )}

                                                    <hr style={{ margin: '0.5rem 0', border: 'none', borderTop: '1px solid #e5e7eb' }} />

                                                    <button
                                                        onClick={handleLogout}
                                                        className="d-flex align-items-center px-3 py-2 w-100 border-0 bg-transparent text-start"
                                                        style={{
                                                            color: '#dc2626',
                                                            borderRadius: '8px',
                                                            transition: 'background-color 0.2s',
                                                            cursor: 'pointer'
                                                        }}
                                                        onMouseEnter={(e) => e.target.style.background = '#fee2e2'}
                                                        onMouseLeave={(e) => e.target.style.background = 'transparent'}
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
                                        className="btn px-4 py-2 fw-medium"
                                        style={{
                                            background: 'linear-gradient(45deg, #10b981, #059669)',
                                            border: 'none',
                                            borderRadius: '8px',
                                            color: 'white',
                                            transition: 'all 0.3s ease',
                                            boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                                        }}
                                        onMouseEnter={(e) => {
                                            e.target.style.transform = 'translateY(-2px)';
                                            e.target.style.boxShadow = '0 4px 8px rgba(0,0,0,0.3)';
                                        }}
                                        onMouseLeave={(e) => {
                                            e.target.style.transform = 'translateY(0)';
                                            e.target.style.boxShadow = '0 2px 4px rgba(0,0,0,0.2)';
                                        }}
                                    >
                                        🔐 Přihlásit
                                    </Link>

                                    <Link
                                        to="/register"
                                        className="btn px-4 py-2 fw-medium"
                                        style={{
                                            background: 'transparent',
                                            border: '2px solid rgba(255,255,255,0.8)',
                                            borderRadius: '8px',
                                            color: 'white',
                                            transition: 'all 0.3s ease'
                                        }}
                                        onMouseEnter={(e) => {
                                            e.target.style.background = 'rgba(255,255,255,0.1)';
                                            e.target.style.borderColor = 'white';
                                            e.target.style.transform = 'translateY(-2px)';
                                        }}
                                        onMouseLeave={(e) => {
                                            e.target.style.background = 'transparent';
                                            e.target.style.borderColor = 'rgba(255,255,255,0.8)';
                                            e.target.style.transform = 'translateY(0)';
                                        }}
                                    >
                                        📝 Registrovat
                                    </Link>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </nav>

            {/* Click overlay pro zavření dropdownu */}
            {showProfileDropdown && (
                <div
                    style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        zIndex: 999
                    }}
                    onClick={() => setShowProfileDropdown(false)}
                />
            )}
        </header>
    );
};

export default Header;