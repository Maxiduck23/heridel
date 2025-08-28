import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { useToast } from '../components/ui/Toast';

const UserLibraryPage = () => {
    const [games, setGames] = useState([]);
    const [wishlistGames, setWishlistGames] = useState([]);
    const [filteredGames, setFilteredGames] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [sortBy, setSortBy] = useState('recent');
    const [filterBy, setFilterBy] = useState('owned');
    const [selectedGame, setSelectedGame] = useState(null);
    const [showKeyModal, setShowKeyModal] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [copiedKey, setCopiedKey] = useState(false);

    const { user } = useUser();
    const { success, error: showError } = useToast();
    const API_BASE_URL = '/api';

    useEffect(() => {
        const fetchLibrary = async () => {
            if (!user) {
                setLoading(false);
                return;
            }

            try {
                setError(null);
                setLoading(true);

                // Načíst vlastněné hry
                const response = await fetch(`${API_BASE_URL}/library.php`, {
                    credentials: 'include'
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.message || 'Chyba při komunikaci se serverem.');
                }

                const data = await response.json();

                if (data.success) {
                    setGames(data.data || []);
                } else {
                    throw new Error(data.message || 'Nepodařilo se načíst data knihovny.');
                }

                // Načíst oblíbené hry (wishlist)
                const wishlistResponse = await fetch(`${API_BASE_URL}/games.php`, {
                    credentials: 'include'
                });

                if (wishlistResponse.ok) {
                    const wishlistData = await wishlistResponse.json();
                    if (wishlistData.success) {
                        const wishlistOnly = wishlistData.data.filter(game =>
                            game.in_wishlist && !game.is_owned
                        );
                        setWishlistGames(wishlistOnly);
                    }
                }

            } catch (e) {
                setError(e.message);
            } finally {
                setLoading(false);
            }
        };

        fetchLibrary();
    }, [user]);

    useEffect(() => {
        let dataToFilter = [];

        if (filterBy === 'owned') {
            dataToFilter = games;
        } else if (filterBy === 'wishlist') {
            dataToFilter = wishlistGames.map(game => ({
                game: game,
                purchase_date: null,
                last_accessed: null,
                is_wishlist: true
            }));
        }

        let filtered = dataToFilter.filter(item => {
            const gameName = filterBy === 'owned' ? item.game.name : item.game.name;
            return gameName.toLowerCase().includes(searchTerm.toLowerCase());
        });

        filtered.sort((a, b) => {
            switch (sortBy) {
                case 'recent':
                    if (filterBy === 'wishlist') {
                        return 0; // Pro wishlist není relevantní
                    }
                    return new Date(b.last_accessed || b.purchase_date) - new Date(a.last_accessed || a.purchase_date);
                case 'name':
                    const aName = filterBy === 'owned' ? a.game.name : a.game.name;
                    const bName = filterBy === 'owned' ? b.game.name : b.game.name;
                    return aName.localeCompare(bName);
                case 'price':
                    const aPrice = filterBy === 'owned' ? (a.game.price_tokens || 0) : (a.game.price_tokens || 0);
                    const bPrice = filterBy === 'owned' ? (b.game.price_tokens || 0) : (b.game.price_tokens || 0);
                    return bPrice - aPrice;
                default:
                    return 0;
            }
        });

        setFilteredGames(filtered);
    }, [games, wishlistGames, searchTerm, sortBy, filterBy]);

    const copyGameKey = async (keyCode) => {
        try {
            await navigator.clipboard.writeText(keyCode);
            setCopiedKey(true);
            success('Herní klíč byl zkopírován do schránky!');
            setTimeout(() => setCopiedKey(false), 2000);
        } catch (err) {
            console.error('Chyba při kopírování:', err);
            showError('Nepodařilo se zkopírovat klíč do schránky');

            // Fallback - zobrazit klíč pro ruční kopírování
            const textArea = document.createElement('textarea');
            textArea.value = keyCode;
            document.body.appendChild(textArea);
            textArea.select();
            try {
                document.execCommand('copy');
                success('Herní klíč byl zkopírován!');
            } catch (fallbackErr) {
                showError('Zkopírujte klíč ručně: ' + keyCode);
            }
            document.body.removeChild(textArea);
        }
    };

    const showGameKey = (game) => {
        setSelectedGame(game);
        setShowKeyModal(true);
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('cs-CZ', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    };

    if (loading) {
        return (
            <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)' }}>
                <div className="text-center">
                    <div className="spinner-border text-primary mb-3" style={{ width: '3rem', height: '3rem' }}></div>
                    <h5 style={{ color: '#cbd5e1' }}>Načítání knihovny...</h5>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)', paddingTop: '2rem' }}>
                <div style={{
                    width: '100%',
                    maxWidth: '1200px',
                    margin: '0 auto',
                    paddingLeft: '15px',
                    paddingRight: '15px'
                }}>
                    <div className="alert alert-danger">
                        <h5>Chyba při načítání knihovny</h5>
                        <p className="mb-0">{error}</p>
                    </div>
                </div>
            </div>
        );
    }

    if (!user) {
        return (
            <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)' }}>
                <div className="text-center">
                    <h3 style={{ color: '#cbd5e1' }}>Pro zobrazení knihovny se musíte přihlásit</h3>
                    <Link to="/login" className="btn btn-primary mt-3">Přihlásit se</Link>
                </div>
            </div>
        );
    }

    const totalOwnedGames = games.length;
    const totalWishlistGames = wishlistGames.length;

    return (
        <div style={{
            minHeight: '100vh',
            background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%)',
            paddingTop: '2rem',
            paddingBottom: '2rem'
        }}>
            <div style={{
                width: '100%',
                maxWidth: '1200px',
                margin: '0 auto',
                paddingLeft: '15px',
                paddingRight: '15px'
            }}>

                {/* Header */}
                <div className="row mb-4">
                    <div className="col-12">
                        <div style={{
                            background: 'rgba(255,255,255,0.05)',
                            backdropFilter: 'blur(10px)',
                            borderRadius: '16px',
                            padding: '2rem',
                            border: '1px solid rgba(255,255,255,0.1)'
                        }}>
                            <div className="row align-items-center">
                                <div className="col-md-8">
                                    <div className="d-flex align-items-center mb-2">
                                        <span style={{ fontSize: '2.5rem', marginRight: '1rem' }}>📚</span>
                                        <div>
                                            <h1 style={{
                                                fontSize: '2rem',
                                                fontWeight: '800',
                                                color: 'white',
                                                marginBottom: '0.25rem'
                                            }}>
                                                Moje knihovna
                                            </h1>
                                            <p style={{ color: '#cbd5e1', margin: '0', fontSize: '1.1rem' }}>
                                                Správa vaší herní kolekce
                                            </p>
                                        </div>
                                    </div>
                                </div>
                                <div className="col-md-4">
                                    <div className="row text-center">
                                        <div className="col-6">
                                            <div style={{ color: '#10b981', fontSize: '1.5rem', fontWeight: '700' }}>
                                                {totalOwnedGames}
                                            </div>
                                            <small style={{ color: '#94a3b8' }}>Vlastněných her</small>
                                        </div>
                                        <div className="col-6">
                                            <div style={{ color: '#ef4444', fontSize: '1.5rem', fontWeight: '700' }}>
                                                {totalWishlistGames}
                                            </div>
                                            <small style={{ color: '#94a3b8' }}>V seznamu přání</small>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Filtry a vyhledávání */}
                <div className="row mb-4">
                    <div className="col-12">
                        <div style={{
                            background: 'rgba(255,255,255,0.05)',
                            backdropFilter: 'blur(10px)',
                            borderRadius: '12px',
                            padding: '1.5rem',
                            border: '1px solid rgba(255,255,255,0.1)'
                        }}>
                            <div className="row align-items-center">
                                <div className="col-md-3">
                                    <input
                                        type="text"
                                        className="form-control"
                                        placeholder="🔍 Hledat hry..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        style={{
                                            borderRadius: '8px',
                                            border: '2px solid rgba(255,255,255,0.2)',
                                            padding: '0.75rem 1rem',
                                            background: 'rgba(255,255,255,0.1)',
                                            color: 'white'
                                        }}
                                    />
                                </div>
                                <div className="col-md-3">
                                    <select
                                        className="form-select"
                                        value={filterBy}
                                        onChange={(e) => setFilterBy(e.target.value)}
                                        style={{
                                            borderRadius: '8px',
                                            border: '2px solid rgba(255,255,255,0.2)',
                                            padding: '0.75rem 1rem',
                                            background: 'rgba(255,255,255,0.1)',
                                            color: 'white'
                                        }}
                                    >
                                        <option value="owned">📚 Vlastněné hry ({totalOwnedGames})</option>
                                        <option value="wishlist">❤️ Seznam přání ({totalWishlistGames})</option>
                                    </select>
                                </div>
                                <div className="col-md-3">
                                    <select
                                        className="form-select"
                                        value={sortBy}
                                        onChange={(e) => setSortBy(e.target.value)}
                                        style={{
                                            borderRadius: '8px',
                                            border: '2px solid rgba(255,255,255,0.2)',
                                            padding: '0.75rem 1rem',
                                            background: 'rgba(255,255,255,0.1)',
                                            color: 'white'
                                        }}
                                    >
                                        <option value="recent">📅 Podle data</option>
                                        <option value="name">🔤 Podle názvu</option>
                                        <option value="price">💰 Podle ceny</option>
                                    </select>
                                </div>
                                <div className="col-md-3">
                                    <div style={{ fontSize: '0.9rem', color: '#94a3b8', textAlign: 'center' }}>
                                        <strong style={{ color: 'white' }}>{filteredGames.length}</strong>
                                        {filterBy === 'owned' ? ' vlastněných her' : ' her v seznamu přání'}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Seznam her */}
                <div className="row">
                    {filteredGames.length === 0 && !loading ? (
                        <div className="col-12">
                            <div style={{
                                background: 'rgba(255,255,255,0.05)',
                                backdropFilter: 'blur(10px)',
                                borderRadius: '12px',
                                padding: '3rem',
                                textAlign: 'center',
                                border: '1px solid rgba(255,255,255,0.1)'
                            }}>
                                <div style={{ fontSize: '4rem', marginBottom: '1rem', opacity: '0.5' }}>
                                    {filterBy === 'owned' ? '📚' : '❤️'}
                                </div>
                                <h3 style={{ color: '#cbd5e1', marginBottom: '0.5rem' }}>
                                    {filterBy === 'owned' ? 'Žádné vlastněné hry' : 'Prázdný seznam přání'}
                                </h3>
                                <p style={{ color: '#94a3b8', marginBottom: '1.5rem' }}>
                                    {searchTerm ? 'Zkuste změnit vyhledávací kritéria' :
                                        filterBy === 'owned' ? 'Zatím jste si nezakoupili žádné hry' : 'Zatím jste si nepřidali žádné hry do seznamu přání'}
                                </p>
                                <Link
                                    to="/games"
                                    className="btn btn-primary px-4 py-2"
                                    style={{
                                        background: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
                                        border: 'none',
                                        borderRadius: '25px',
                                        textDecoration: 'none'
                                    }}
                                >
                                    Prohlédnout hry
                                </Link>
                            </div>
                        </div>
                    ) : (
                        filteredGames.map((libraryGame, index) => (
                            <div key={libraryGame.is_wishlist ? `wish-${libraryGame.game.game_id}` : libraryGame.library_id} className="col-12 mb-3">
                                <div style={{
                                    background: 'rgba(255,255,255,0.05)',
                                    backdropFilter: 'blur(10px)',
                                    borderRadius: '12px',
                                    overflow: 'hidden',
                                    border: '1px solid rgba(255,255,255,0.1)',
                                    transition: 'all 0.2s ease'
                                }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.transform = 'translateY(-2px)';
                                        e.currentTarget.style.boxShadow = '0 8px 16px rgba(0, 0, 0, 0.3)';
                                        e.currentTarget.style.border = '1px solid rgba(79, 70, 229, 0.5)';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.transform = 'translateY(0)';
                                        e.currentTarget.style.boxShadow = 'none';
                                        e.currentTarget.style.border = '1px solid rgba(255,255,255,0.1)';
                                    }}
                                >
                                    <div className="row g-0">
                                        {/* Obrázek hry */}
                                        <div className="col-md-3">
                                            <div style={{
                                                backgroundImage: `url(${libraryGame.game.image_url})`,
                                                backgroundSize: 'cover',
                                                backgroundPosition: 'center',
                                                height: '200px',
                                                position: 'relative'
                                            }}>
                                                <div style={{
                                                    position: 'absolute',
                                                    top: '0.75rem',
                                                    left: '0.75rem'
                                                }}>
                                                    <span className="badge px-2 py-1" style={{
                                                        background: libraryGame.is_wishlist ? 'rgba(239, 68, 68, 0.9)' : 'rgba(16, 185, 129, 0.9)',
                                                        fontSize: '0.8rem'
                                                    }}>
                                                        {libraryGame.is_wishlist ? '❤️ V přáních' : '📚 Vlastněno'}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Informace o hře */}
                                        <div className="col-md-6">
                                            <div style={{ padding: '1.5rem' }}>
                                                <h5 style={{
                                                    fontSize: '1.3rem',
                                                    fontWeight: '700',
                                                    color: 'white',
                                                    margin: '0 0 1rem 0'
                                                }}>
                                                    {libraryGame.game.name}
                                                </h5>

                                                <p style={{
                                                    color: '#cbd5e1',
                                                    fontSize: '0.95rem',
                                                    margin: '0 0 1rem 0',
                                                    lineHeight: '1.5',
                                                    maxHeight: '4.5em',
                                                    overflow: 'hidden',
                                                    textOverflow: 'ellipsis',
                                                    display: '-webkit-box',
                                                    WebkitLineClamp: 3,
                                                    WebkitBoxOrient: 'vertical'
                                                }}>
                                                    {libraryGame.game.description}
                                                </p>

                                                {libraryGame.game.genres && (
                                                    <div className="d-flex flex-wrap gap-2 mb-3">
                                                        {libraryGame.game.genres.slice(0, 3).map((genre, gIndex) => (
                                                            <span
                                                                key={gIndex}
                                                                style={{
                                                                    background: 'linear-gradient(45deg, #4f46e5, #7c3aed)',
                                                                    color: 'white',
                                                                    padding: '0.25rem 0.75rem',
                                                                    borderRadius: '15px',
                                                                    fontSize: '0.75rem',
                                                                    fontWeight: '500'
                                                                }}
                                                            >
                                                                {genre.name || genre}
                                                            </span>
                                                        ))}
                                                        {libraryGame.game.genres.length > 3 && (
                                                            <span style={{
                                                                background: 'rgba(255,255,255,0.2)',
                                                                color: 'white',
                                                                padding: '0.25rem 0.75rem',
                                                                borderRadius: '15px',
                                                                fontSize: '0.75rem'
                                                            }}>
                                                                +{libraryGame.game.genres.length - 3}
                                                            </span>
                                                        )}
                                                    </div>
                                                )}

                                                {!libraryGame.is_wishlist && (
                                                    <div className="mb-3">
                                                        <div style={{ color: '#94a3b8', fontSize: '0.85rem', marginBottom: '0.25rem' }}>
                                                            🛒 Zakoupeno: {formatDate(libraryGame.purchase_date)}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* Akce */}
                                        <div className="col-md-3">
                                            <div style={{ padding: '1.5rem' }}>
                                                <div className="mb-3 text-center">
                                                    <div style={{
                                                        color: '#10b981',
                                                        fontSize: '1.4rem',
                                                        fontWeight: '700'
                                                    }}>
                                                        {libraryGame.game.price_tokens || 0} 🪙
                                                    </div>
                                                    <small style={{ color: '#94a3b8' }}>Hodnota</small>
                                                </div>

                                                {!libraryGame.is_wishlist ? (
                                                    // Vlastněná hra
                                                    <>
                                                        <button
                                                            className="btn w-100 mb-2"
                                                            style={{
                                                                background: 'linear-gradient(45deg, #4f46e5, #7c3aed)',
                                                                color: 'white',
                                                                border: 'none',
                                                                borderRadius: '8px',
                                                                padding: '0.75rem',
                                                                fontWeight: '600'
                                                            }}
                                                            onClick={() => showGameKey(libraryGame)}
                                                        >
                                                            🗝️ Zobrazit klíč
                                                        </button>

                                                        <Link
                                                            to={`/game/${libraryGame.game.game_id}`}
                                                            className="btn w-100"
                                                            style={{
                                                                background: 'rgba(255,255,255,0.1)',
                                                                color: 'white',
                                                                border: '1px solid rgba(255,255,255,0.2)',
                                                                borderRadius: '8px',
                                                                padding: '0.75rem',
                                                                fontWeight: '600',
                                                                textDecoration: 'none'
                                                            }}
                                                        >
                                                            👁️ Detail hry
                                                        </Link>
                                                    </>
                                                ) : (
                                                    // Hra v seznamu přání
                                                    <Link
                                                        to={`/game/${libraryGame.game.game_id}`}
                                                        className="btn w-100"
                                                        style={{
                                                            background: 'linear-gradient(45deg, #10b981, #059669)',
                                                            color: 'white',
                                                            border: 'none',
                                                            borderRadius: '8px',
                                                            padding: '0.75rem',
                                                            fontWeight: '600',
                                                            textDecoration: 'none'
                                                        }}
                                                    >
                                                        🛒 Koupit hru
                                                    </Link>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Modal pro zobrazení klíče */}
                {showKeyModal && selectedGame && (
                    <>
                        <div
                            style={{
                                position: 'fixed',
                                top: 0,
                                left: 0,
                                right: 0,
                                bottom: 0,
                                background: 'rgba(0, 0, 0, 0.7)',
                                zIndex: 1050,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                backdropFilter: 'blur(5px)'
                            }}
                            onClick={() => setShowKeyModal(false)}
                        >
                            <div
                                style={{
                                    background: 'rgba(30, 41, 59, 0.95)',
                                    backdropFilter: 'blur(20px)',
                                    borderRadius: '16px',
                                    padding: '2rem',
                                    maxWidth: '500px',
                                    width: '90%',
                                    border: '1px solid rgba(255,255,255,0.2)',
                                    margin: '1rem'
                                }}
                                onClick={(e) => e.stopPropagation()}
                            >
                                <div className="text-center mb-4">
                                    <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🗝️</div>
                                    <h3 style={{ color: 'white', marginBottom: '0.5rem' }}>
                                        Herní klíč
                                    </h3>
                                    <p style={{ color: '#cbd5e1', margin: '0' }}>
                                        {selectedGame.game.name}
                                    </p>
                                </div>

                                <div style={{
                                    background: 'rgba(15, 23, 42, 0.8)',
                                    padding: '1.5rem',
                                    borderRadius: '12px',
                                    border: '2px dashed rgba(79, 70, 229, 0.5)',
                                    marginBottom: '1.5rem'
                                }}>
                                    <div style={{
                                        fontSize: '1.1rem',
                                        fontFamily: 'monospace',
                                        fontWeight: '700',
                                        color: '#4f46e5',
                                        textAlign: 'center',
                                        letterSpacing: '1px',
                                        userSelect: 'all'
                                    }}>
                                        {selectedGame.key_code}
                                    </div>
                                </div>

                                <div className="alert alert-warning mb-3" style={{
                                    fontSize: '0.9rem',
                                    background: 'rgba(245, 158, 11, 0.2)',
                                    border: '1px solid rgba(245, 158, 11, 0.3)',
                                    color: '#fbbf24'
                                }}>
                                    ⚠️ <strong>Pozor:</strong> Klíč si uložte na bezpečné místo.
                                    Tento klíč je určen pouze pro vás.
                                </div>

                                <div className="d-flex gap-2">
                                    <button
                                        className="btn flex-fill"
                                        style={{
                                            background: copiedKey ? 'linear-gradient(45deg, #10b981, #059669)' : 'linear-gradient(45deg, #4f46e5, #7c3aed)',
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: '8px',
                                            padding: '0.75rem',
                                            fontWeight: '600'
                                        }}
                                        onClick={() => copyGameKey(selectedGame.key_code)}
                                    >
                                        {copiedKey ? '✅ Zkopírováno!' : '📋 Kopírovat klíč'}
                                    </button>
                                    <button
                                        className="btn flex-fill"
                                        style={{
                                            background: 'rgba(100, 116, 139, 0.3)',
                                            color: 'white',
                                            border: '1px solid rgba(100, 116, 139, 0.5)',
                                            borderRadius: '8px',
                                            padding: '0.75rem',
                                            fontWeight: '600'
                                        }}
                                        onClick={() => setShowKeyModal(false)}
                                    >
                                        Zavřít
                                    </button>
                                </div>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default UserLibraryPage;