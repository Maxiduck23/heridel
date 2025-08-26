import React, { useState, useEffect } from 'react';
import { useUser } from '../context/UserContext';
// Mock data pro demonstraci knihovny


const UserLibraryPage = () => {
    const [games, setGames] = useState([]); // Začínáme s prázdným polem
    const [filteredGames, setFilteredGames] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [sortBy, setSortBy] = useState('recent');
    const [filterBy, setFilterBy] = useState('all');
    const [selectedGame, setSelectedGame] = useState(null);
    const [showKeyModal, setShowKeyModal] = useState(false);
    const [loading, setLoading] = useState(true); // Stav pro načítání
    const [error, setError] = useState(null); // Stav pro chyby

    const { user } = useUser(); // <-- 3. Získání skutečného uživatele
    const API_BASE_URL = 'http://heridel.wz.cz';

    const totalGames = games.length;
    const totalPlayTime = games.reduce((sum, game) => sum + game.play_time_hours, 0);
    const favoriteGames = games.filter(game => game.is_favorite).length;

    // --- KROK 4: Načtení dat z API ---
    useEffect(() => {
        const fetchLibrary = async () => {
            if (!user) {
                setError("Pro zobrazení knihovny se musíte přihlásit.");
                setLoading(false);
                return;
            }

            try {
                const response = await fetch(`${API_BASE_URL}/api/library.php`, {
                    credentials: 'include' // Důležité pro odeslání session cookie
                });

                if (!response.ok) {
                    throw new Error('Chyba při komunikaci se serverem.');
                }

                const data = await response.json();

                if (data.success) {
                    setGames(data.data);
                } else {
                    throw new Error(data.message || 'Nepodařilo se načíst data knihovny.');
                }
            } catch (e) {
                setError(e.message);
            } finally {
                setLoading(false);
            }
        };

        fetchLibrary();
    }, [user]); // Spustí se, když se změní informace o uživateli

    // Filtrování a třídění her
    useEffect(() => {
        let filtered = games.filter(game => {
            const matchesSearch = game.game.name.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesFilter = filterBy === 'all' ||
                (filterBy === 'favorites' && game.is_favorite) ||
                (filterBy === 'recent' && new Date(game.last_accessed) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000));

            return matchesSearch && matchesFilter;
        });

        // Třídění
        filtered.sort((a, b) => {
            switch (sortBy) {
                case 'recent':
                    return new Date(b.last_accessed) - new Date(a.last_accessed);
                case 'name':
                    return a.game.name.localeCompare(b.game.name);
                case 'playtime':
                    return b.play_time_hours - a.play_time_hours;
                case 'rating':
                    return (b.rating || 0) - (a.rating || 0);
                default:
                    return 0;
            }
        });

        setFilteredGames(filtered);
    }, [games, searchTerm, sortBy, filterBy]);

    const formatPlayTime = (hours) => {
        if (hours < 1) return `${Math.round(hours * 60)}min`;
        return `${Math.floor(hours)}h ${Math.round((hours % 1) * 60)}min`;
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('cs-CZ', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    };

    const toggleFavorite = (libraryId) => {
        setGames(games.map(game =>
            game.library_id === libraryId
                ? { ...game, is_favorite: !game.is_favorite }
                : game
        ));
    };

    const updateRating = (libraryId, rating) => {
        setGames(games.map(game =>
            game.library_id === libraryId
                ? { ...game, rating }
                : game
        ));
    };

    const showGameKey = (game) => {
        setSelectedGame(game);
        setShowKeyModal(true);
    };

    return (
        <div style={{
            minHeight: '100vh',
            background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
            paddingTop: '2rem',
            paddingBottom: '2rem'
        }}>
            <div className="container">

                {/* Header */}
                <div className="row mb-4">
                    <div className="col-12">
                        <div style={{
                            background: 'white',
                            borderRadius: '16px',
                            padding: '2rem',
                            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)',
                            border: '1px solid rgba(0, 0, 0, 0.1)'
                        }}>
                            <div className="row align-items-center">
                                <div className="col-md-8">
                                    <div className="d-flex align-items-center mb-2">
                                        <span style={{ fontSize: '2.5rem', marginRight: '1rem' }}>📚</span>
                                        <div>
                                            <h1 style={{
                                                fontSize: '2rem',
                                                fontWeight: '800',
                                                color: '#1e40af',
                                                marginBottom: '0.25rem'
                                            }}>
                                                Moje knihovna
                                            </h1>
                                            <p style={{ color: '#64748b', margin: '0', fontSize: '1.1rem' }}>
                                                Správa vaší herní kolekce
                                            </p>
                                        </div>
                                    </div>
                                </div>
                                <div className="col-md-4">
                                    <div className="row text-center">
                                        <div className="col-4">
                                            <div style={{ color: '#1e40af', fontSize: '1.5rem', fontWeight: '700' }}>
                                                {totalGames}
                                            </div>
                                            <small style={{ color: '#64748b' }}>Her</small>
                                        </div>
                                        <div className="col-4">
                                            <div style={{ color: '#059669', fontSize: '1.5rem', fontWeight: '700' }}>
                                                {Math.floor(totalPlayTime)}h
                                            </div>
                                            <small style={{ color: '#64748b' }}>Odehráno</small>
                                        </div>
                                        <div className="col-4">
                                            <div style={{ color: '#dc2626', fontSize: '1.5rem', fontWeight: '700' }}>
                                                {favoriteGames}
                                            </div>
                                            <small style={{ color: '#64748b' }}>Oblíbené</small>
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
                            background: 'white',
                            borderRadius: '12px',
                            padding: '1.5rem',
                            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)',
                            border: '1px solid rgba(0, 0, 0, 0.1)'
                        }}>
                            <div className="row align-items-center">
                                <div className="col-md-4">
                                    <input
                                        type="text"
                                        className="form-control"
                                        placeholder="🔍 Hledat hry..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        style={{
                                            borderRadius: '8px',
                                            border: '2px solid #e2e8f0',
                                            padding: '0.75rem 1rem'
                                        }}
                                    />
                                </div>
                                <div className="col-md-3">
                                    <select
                                        className="form-select"
                                        value={sortBy}
                                        onChange={(e) => setSortBy(e.target.value)}
                                        style={{
                                            borderRadius: '8px',
                                            border: '2px solid #e2e8f0',
                                            padding: '0.75rem 1rem'
                                        }}
                                    >
                                        <option value="recent">📅 Nedávno hrané</option>
                                        <option value="name">🔤 Podle názvu</option>
                                        <option value="playtime">⏱️ Podle času</option>
                                        <option value="rating">⭐ Podle hodnocení</option>
                                    </select>
                                </div>
                                <div className="col-md-3">
                                    <select
                                        className="form-select"
                                        value={filterBy}
                                        onChange={(e) => setFilterBy(e.target.value)}
                                        style={{
                                            borderRadius: '8px',
                                            border: '2px solid #e2e8f0',
                                            padding: '0.75rem 1rem'
                                        }}
                                    >
                                        <option value="all">📋 Všechny hry</option>
                                        <option value="favorites">❤️ Oblíbené</option>
                                        <option value="recent">🕒 Nedávno hrané</option>
                                    </select>
                                </div>
                                <div className="col-md-2">
                                    <div style={{ fontSize: '0.9rem', color: '#64748b', textAlign: 'center' }}>
                                        <strong>{filteredGames.length}</strong> her
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Seznam her */}
                <div className="row">
                    {filteredGames.length === 0 ? (
                        <div className="col-12">
                            <div style={{
                                background: 'white',
                                borderRadius: '12px',
                                padding: '3rem',
                                textAlign: 'center',
                                boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)',
                                border: '1px solid rgba(0, 0, 0, 0.1)'
                            }}>
                                <div style={{ fontSize: '4rem', marginBottom: '1rem', opacity: '0.5' }}>🎮</div>
                                <h3 style={{ color: '#64748b', marginBottom: '0.5rem' }}>Žádné hry nenalezeny</h3>
                                <p style={{ color: '#9ca3af' }}>
                                    {searchTerm ? 'Zkuste změnit vyhledávací kritéria' : 'Vaše knihovna je prázdná'}
                                </p>
                            </div>
                        </div>
                    ) : (
                        filteredGames.map((libraryGame) => (
                            <div key={libraryGame.library_id} className="col-12 mb-3">
                                <div style={{
                                    background: 'white',
                                    borderRadius: '12px',
                                    overflow: 'hidden',
                                    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)',
                                    border: '1px solid rgba(0, 0, 0, 0.1)',
                                    transition: 'all 0.2s ease'
                                }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.transform = 'translateY(-2px)';
                                        e.currentTarget.style.boxShadow = '0 8px 16px rgba(0, 0, 0, 0.1)';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.transform = 'translateY(0)';
                                        e.currentTarget.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.05)';
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
                                                    <button
                                                        className="btn btn-sm"
                                                        style={{
                                                            background: libraryGame.is_favorite ? 'rgba(220, 38, 38, 0.9)' : 'rgba(0, 0, 0, 0.5)',
                                                            color: 'white',
                                                            border: 'none',
                                                            borderRadius: '50%',
                                                            width: '36px',
                                                            height: '36px',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center'
                                                        }}
                                                        onClick={() => toggleFavorite(libraryGame.library_id)}
                                                    >
                                                        {libraryGame.is_favorite ? '❤️' : '🤍'}
                                                    </button>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Informace o hře */}
                                        <div className="col-md-6">
                                            <div style={{ padding: '1.5rem' }}>
                                                <div className="d-flex justify-content-between align-items-start mb-2">
                                                    <h5 style={{
                                                        fontSize: '1.3rem',
                                                        fontWeight: '700',
                                                        color: '#1e293b',
                                                        margin: '0'
                                                    }}>
                                                        {libraryGame.game.name}
                                                    </h5>
                                                </div>

                                                <p style={{
                                                    color: '#64748b',
                                                    fontSize: '0.95rem',
                                                    margin: '0 0 1rem 0',
                                                    lineHeight: '1.5'
                                                }}>
                                                    {libraryGame.game.description}
                                                </p>

                                                <div className="d-flex flex-wrap gap-2 mb-3">
                                                    {libraryGame.game.genres.map((genre, index) => (
                                                        <span
                                                            key={index}
                                                            style={{
                                                                background: 'linear-gradient(45deg, #3b82f6, #1d4ed8)',
                                                                color: 'white',
                                                                padding: '0.25rem 0.75rem',
                                                                borderRadius: '20px',
                                                                fontSize: '0.8rem',
                                                                fontWeight: '500'
                                                            }}
                                                        >
                                                            {genre.name}
                                                        </span>
                                                    ))}
                                                </div>

                                                {libraryGame.notes && (
                                                    <div style={{
                                                        background: '#f1f5f9',
                                                        padding: '0.75rem',
                                                        borderRadius: '8px',
                                                        marginBottom: '1rem'
                                                    }}>
                                                        <small style={{ color: '#475569', fontStyle: 'italic' }}>
                                                            💭 "{libraryGame.notes}"
                                                        </small>
                                                    </div>
                                                )}

                                                {/* Hodnocení */}
                                                <div className="d-flex align-items-center mb-2">
                                                    <span style={{ marginRight: '0.5rem', fontSize: '0.9rem', color: '#64748b' }}>
                                                        Hodnocení:
                                                    </span>
                                                    {[1, 2, 3, 4, 5].map((star) => (
                                                        <button
                                                            key={star}
                                                            className="btn btn-sm p-0 me-1"
                                                            style={{
                                                                background: 'none',
                                                                border: 'none',
                                                                fontSize: '1.1rem'
                                                            }}
                                                            onClick={() => updateRating(libraryGame.library_id, star)}
                                                        >
                                                            {star <= (libraryGame.rating || 0) ? '⭐' : '☆'}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Statistiky a akce */}
                                        <div className="col-md-3">
                                            <div style={{ padding: '1.5rem' }}>
                                                <div className="mb-3">
                                                    <div style={{ color: '#64748b', fontSize: '0.85rem', marginBottom: '0.25rem' }}>
                                                        ⏱️ Odehráno
                                                    </div>
                                                    <div style={{ color: '#059669', fontSize: '1.2rem', fontWeight: '700' }}>
                                                        {formatPlayTime(libraryGame.play_time_hours)}
                                                    </div>
                                                </div>

                                                <div className="mb-3">
                                                    <div style={{ color: '#64748b', fontSize: '0.85rem', marginBottom: '0.25rem' }}>
                                                        🛒 Zakoupeno
                                                    </div>
                                                    <div style={{ color: '#374151', fontSize: '0.9rem', fontWeight: '600' }}>
                                                        {formatDate(libraryGame.purchase_date)}
                                                    </div>
                                                </div>

                                                <div className="mb-4">
                                                    <div style={{ color: '#64748b', fontSize: '0.85rem', marginBottom: '0.25rem' }}>
                                                        🕒 Naposledy
                                                    </div>
                                                    <div style={{ color: '#374151', fontSize: '0.9rem', fontWeight: '600' }}>
                                                        {formatDate(libraryGame.last_accessed)}
                                                    </div>
                                                </div>

                                                <button
                                                    className="btn w-100 mb-2"
                                                    style={{
                                                        background: 'linear-gradient(45deg, #1e40af, #3b82f6)',
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

                                                <button
                                                    className="btn w-100"
                                                    style={{
                                                        background: 'linear-gradient(45deg, #10b981, #059669)',
                                                        color: 'white',
                                                        border: 'none',
                                                        borderRadius: '8px',
                                                        padding: '0.75rem',
                                                        fontWeight: '600'
                                                    }}
                                                >
                                                    🎮 Spustit hru
                                                </button>
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
                                background: 'rgba(0, 0, 0, 0.5)',
                                zIndex: 1050,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}
                            onClick={() => setShowKeyModal(false)}
                        >
                            <div
                                style={{
                                    background: 'white',
                                    borderRadius: '16px',
                                    padding: '2rem',
                                    maxWidth: '500px',
                                    width: '90%',
                                    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
                                    margin: '1rem'
                                }}
                                onClick={(e) => e.stopPropagation()}
                            >
                                <div className="text-center mb-4">
                                    <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🗝️</div>
                                    <h3 style={{ color: '#1e293b', marginBottom: '0.5rem' }}>
                                        Herní klíč
                                    </h3>
                                    <p style={{ color: '#64748b', margin: '0' }}>
                                        {selectedGame.game.name}
                                    </p>
                                </div>

                                <div style={{
                                    background: '#f8fafc',
                                    padding: '1.5rem',
                                    borderRadius: '12px',
                                    border: '2px dashed #cbd5e1',
                                    marginBottom: '1.5rem'
                                }}>
                                    <div style={{
                                        fontSize: '1.1rem',
                                        fontFamily: 'monospace',
                                        fontWeight: '700',
                                        color: '#1e40af',
                                        textAlign: 'center',
                                        letterSpacing: '1px'
                                    }}>
                                        {selectedGame.key_code}
                                    </div>
                                </div>

                                <div className="alert alert-warning mb-3" style={{ fontSize: '0.9rem' }}>
                                    ⚠️ <strong>Pozor:</strong> Klíč si zkopírujte a uložte na bezpečné místo.
                                    Po zavření tohoto okna už se nemusí zobrazit znovu.
                                </div>

                                <div className="d-flex gap-2">
                                    <button
                                        className="btn flex-fill"
                                        style={{
                                            background: 'linear-gradient(45deg, #10b981, #059669)',
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: '8px',
                                            padding: '0.75rem'
                                        }}
                                        onClick={() => {
                                            navigator.clipboard.writeText(selectedGame.key_code);
                                            alert('Klíč zkopírován do schránky!');
                                        }}
                                    >
                                        📋 Kopírovat klíč
                                    </button>
                                    <button
                                        className="btn flex-fill"
                                        style={{
                                            background: '#6b7280',
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: '8px',
                                            padding: '0.75rem'
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