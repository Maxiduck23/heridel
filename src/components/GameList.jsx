import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useUser } from '../context/UserContext';

const GameListPage = () => {
    const { user } = useUser();
    const [games, setGames] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [sortBy, setSortBy] = useState('name');
    const [filterBy, setFilterBy] = useState('all');
    const [currentPage, setCurrentPage] = useState(1);
    const [gamesPerPage] = useState(12);

    const API_BASE_URL = '/api';

    useEffect(() => {
        const fetchGames = async () => {
            setLoading(true);
            try {
                const response = await fetch(`${API_BASE_URL}/games.php`, {
                    credentials: 'include'
                });

                if (!response.ok) {
                    throw new Error(`HTTP chyba: ${response.status}`);
                }

                const data = await response.json();

                // DEBUG: Podívej se co API vrací
                console.log('API data:', data);

                // Opravená podmínka - hledáme data.data
                if (data.data && Array.isArray(data.data)) {
                    setGames(data.data);
                } else if (Array.isArray(data)) {
                    // Pokud API vrací přímo pole
                    setGames(data);
                } else if (data.success && data.data) {
                    setGames(data.data);
                } else {
                    throw new Error(data.message || 'API nevrací pole her');
                }
            } catch (error) {
                console.error('Fetch error:', error);
                setError(error.message);
            } finally {
                setLoading(false);
            }
        };
        fetchGames();
    }, []);

    // Filtrování a řazení her
    const filteredAndSortedGames = games
        .filter(game => {
            if (filterBy === 'all') return true;
            if (filterBy === 'owned') return game.is_owned;
            if (filterBy === 'not-owned') return !game.is_owned;
            if (filterBy === 'wishlist') return game.in_wishlist;
            return true;
        })
        .sort((a, b) => {
            switch (sortBy) {
                case 'name':
                    return a.name.localeCompare(b.name);
                case 'price-low':
                    return (a.price_tokens || 0) - (b.price_tokens || 0);
                case 'price-high':
                    return (b.price_tokens || 0) - (a.price_tokens || 0);
                case 'newest':
                    return new Date(b.created_at || b.release_date || 0) - new Date(a.created_at || a.release_date || 0);
                default:
                    return 0;
            }
        });

    // Paginace
    const indexOfLastGame = currentPage * gamesPerPage;
    const indexOfFirstGame = indexOfLastGame - gamesPerPage;
    const currentGames = filteredAndSortedGames.slice(indexOfFirstGame, indexOfLastGame);
    const totalPages = Math.ceil(filteredAndSortedGames.length / gamesPerPage);

    if (loading) {
        return (
            <div className="container text-center p-5">
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Načítání...</span>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="container">
                <div className="alert alert-danger">
                    <strong>Chyba:</strong> {error}
                </div>
            </div>
        );
    }

    // Další kontrola před mapováním
    if (!Array.isArray(games)) {
        return (
            <div className="container">
                <div className="alert alert-warning">
                    Hry nejsou ve správném formátu
                </div>
            </div>
        );
    }

    return (
        <div className="container py-4">
            {/* Header sekce */}
            <div className="row mb-5">
                <div className="col-12">
                    <div className="position-relative overflow-hidden rounded-4 p-5" style={{
                        background: 'linear-gradient(135deg, #4a90e2 0%, #357abd 50%, #2c5f94 100%)',
                        minHeight: '200px'
                    }}>
                        <div className="position-absolute top-0 start-0 w-100 h-100" style={{
                            backgroundImage: `url("data:image/svg+xml,%3Csvg width='80' height='80' viewBox='0 0 80 80' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff08' fill-opacity='0.1'%3E%3Cpath d='M20 60h40l-5-15h-8l-4-12h-16l-4 12h-8z'/%3E%3Cpath d='M18 33h10v27h-10zm34 0h10v27h-10z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                            backgroundSize: '80px 80px'
                        }}></div>

                        <div className="position-relative text-white">
                            <nav aria-label="breadcrumb" className="mb-3">
                                <ol className="breadcrumb">
                                    <li className="breadcrumb-item">
                                        <Link to="/" className="text-white-50 text-decoration-none">
                                            <i className="fas fa-home me-1"></i>Domů
                                        </Link>
                                    </li>
                                    <li className="breadcrumb-item active text-white" aria-current="page">Všechny hry</li>
                                </ol>
                            </nav>
                            <h1 className="display-4 fw-bold mb-3">
                                <i className="fas fa-gamepad me-3"></i>
                                Katalog her
                            </h1>
                            <p className="lead mb-4 opacity-90">
                                Prozkoumejte naší kompletní knihovnu digitálních her.
                                Celkem k dispozici {filteredAndSortedGames.length} her ze všech žánrů.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Filtry a řazení */}
            <div className="row mb-4">
                <div className="col-md-6 mb-3">
                    <div className="d-flex align-items-center">
                        <label htmlFor="sortSelect" className="form-label me-3 mb-0 fw-medium">Řadit podle:</label>
                        <select
                            id="sortSelect"
                            className="form-select form-select-sm"
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                            style={{ maxWidth: '200px' }}
                        >
                            <option value="name">Názvu (A-Z)</option>
                            <option value="price-low">Ceny (nejlevnější)</option>
                            <option value="price-high">Ceny (nejdražší)</option>
                            <option value="newest">Nejnovější</option>
                        </select>
                    </div>
                </div>
                <div className="col-md-6 mb-3">
                    <div className="d-flex align-items-center justify-content-md-end">
                        <label htmlFor="filterSelect" className="form-label me-3 mb-0 fw-medium">Filtrovat:</label>
                        <select
                            id="filterSelect"
                            className="form-select form-select-sm"
                            value={filterBy}
                            onChange={(e) => setFilterBy(e.target.value)}
                            style={{ maxWidth: '200px' }}
                        >
                            <option value="all">Všechny hry</option>
                            {user && <option value="owned">Vlastněné hry</option>}
                            {user && <option value="not-owned">Nevlastněné hry</option>}
                            {user && <option value="wishlist">Seznam přání</option>}
                        </select>
                    </div>
                </div>
            </div>

            {/* Seznam her */}
            {currentGames.length === 0 ? (
                <div className="text-center py-5">
                    <div className="mb-4">
                        <i className="fas fa-gamepad fa-4x text-muted"></i>
                    </div>
                    <h3 className="text-muted mb-3">Žádné hry nenalezeny</h3>
                    <p className="text-muted">Zkuste změnit filtry nebo se podívejte později.</p>
                </div>
            ) : (
                <div className="row g-4 mb-5">
                    {currentGames.map(game => (
                        <div key={game.game_id} className="col-lg-3 col-md-4 col-sm-6">
                            <div className="card h-100 shadow-sm border-0 game-card" style={{
                                transition: 'all 0.3s ease',
                                overflow: 'hidden'
                            }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.transform = 'translateY(-8px)';
                                    e.currentTarget.style.boxShadow = '0 12px 24px rgba(0,0,0,0.15)';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.transform = 'translateY(0)';
                                    e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
                                }}>
                                <div className="position-relative">
                                    <img
                                        src={game.image_url || 'https://placehold.co/300x200'}
                                        className="card-img-top"
                                        alt={game.name}
                                        style={{
                                            height: '200px',
                                            objectFit: 'cover',
                                            transition: 'transform 0.3s ease'
                                        }}
                                        onMouseEnter={(e) => {
                                            e.target.style.transform = 'scale(1.05)';
                                        }}
                                        onMouseLeave={(e) => {
                                            e.target.style.transform = 'scale(1)';
                                        }}
                                        onError={(e) => {
                                            e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjY2NjIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtc2l6ZT0iMTgiIGZpbGw9IiM2NjYiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5ObyBJbWFnZTwvdGV4dD48L3N2Zz4=';
                                        }}
                                    />

                                    {/* Status badges */}
                                    <div className="position-absolute top-0 end-0 p-2">
                                        {game.is_owned && (
                                            <span className="badge bg-success mb-1 d-block">
                                                <i className="fas fa-check me-1"></i>Vlastněno
                                            </span>
                                        )}
                                        {game.in_wishlist && !game.is_owned && (
                                            <span className="badge bg-info d-block">
                                                <i className="fas fa-heart me-1"></i>V přání
                                            </span>
                                        )}
                                    </div>

                                    {/* Price tag */}
                                    <div className="position-absolute bottom-0 start-0 p-2">
                                        <span className="badge bg-dark bg-opacity-75 fs-6 px-3 py-2">
                                            {game.price_tokens || '0'} 🪙
                                        </span>
                                    </div>
                                </div>

                                <div className="card-body d-flex flex-column">
                                    <h5 className="card-title fw-bold mb-2" style={{
                                        fontSize: '1.1rem',
                                        lineHeight: '1.3',
                                        height: '2.6rem',
                                        overflow: 'hidden',
                                        display: '-webkit-box',
                                        WebkitLineClamp: 2,
                                        WebkitBoxOrient: 'vertical'
                                    }}>
                                        {game.name}
                                    </h5>

                                    <p className="card-text text-muted small mb-2">
                                        <i className="fas fa-calendar me-1"></i>
                                        {game.release_date || 'Datum vydání neuvedeno'}
                                    </p>

                                    <p className="card-text text-muted small mb-2">
                                        <i className="fas fa-building me-1"></i>
                                        {game.publisher_name || 'Neznámý vydavatel'}
                                    </p>

                                    <p className="card-text flex-grow-1" style={{
                                        fontSize: '0.9rem',
                                        lineHeight: '1.4',
                                        height: '3.6rem',
                                        overflow: 'hidden',
                                        display: '-webkit-box',
                                        WebkitLineClamp: 3,
                                        WebkitBoxOrient: 'vertical'
                                    }}>
                                        {game.description || 'Popis hry není k dispozici.'}
                                    </p>

                                    {/* Genres */}
                                    <div className="mb-3">
                                        {game.genres && game.genres.slice(0, 2).map(genre => (
                                            <span key={genre} className="badge bg-primary me-1 mb-1" style={{ fontSize: '0.7rem' }}>
                                                {genre}
                                            </span>
                                        ))}
                                        {game.genres && game.genres.length > 2 && (
                                            <span className="badge bg-secondary" style={{ fontSize: '0.7rem' }}>
                                                +{game.genres.length - 2}
                                            </span>
                                        )}
                                    </div>

                                    <Link
                                        to={`/game/${game.game_id}`}
                                        className="btn btn-primary btn-sm fw-medium"
                                        style={{
                                            background: 'linear-gradient(45deg, #4a90e2, #357abd)',
                                            border: 'none',
                                            transition: 'all 0.3s ease'
                                        }}
                                        onMouseEnter={(e) => {
                                            e.target.style.background = 'linear-gradient(45deg, #357abd, #2c5f94)';
                                            e.target.style.transform = 'translateY(-1px)';
                                        }}
                                        onMouseLeave={(e) => {
                                            e.target.style.background = 'linear-gradient(45deg, #4a90e2, #357abd)';
                                            e.target.style.transform = 'translateY(0)';
                                        }}
                                    >
                                        <i className="fas fa-eye me-2"></i>
                                        Zobrazit detail
                                    </Link>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Paginace */}
            {totalPages > 1 && (
                <nav aria-label="Navigace stránek">
                    <ul className="pagination justify-content-center">
                        <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                            <button
                                className="page-link"
                                onClick={() => setCurrentPage(currentPage - 1)}
                                disabled={currentPage === 1}
                            >
                                <i className="fas fa-chevron-left me-1"></i>
                                Předchozí
                            </button>
                        </li>

                        {Array.from({ length: totalPages }, (_, i) => i + 1).map(pageNumber => {
                            // Zobrazit pouze stránky blízko aktuální stránky
                            if (
                                pageNumber === 1 ||
                                pageNumber === totalPages ||
                                (pageNumber >= currentPage - 2 && pageNumber <= currentPage + 2)
                            ) {
                                return (
                                    <li key={pageNumber} className={`page-item ${currentPage === pageNumber ? 'active' : ''}`}>
                                        <button
                                            className="page-link"
                                            onClick={() => setCurrentPage(pageNumber)}
                                        >
                                            {pageNumber}
                                        </button>
                                    </li>
                                );
                            } else if (
                                pageNumber === currentPage - 3 ||
                                pageNumber === currentPage + 3
                            ) {
                                return (
                                    <li key={pageNumber} className="page-item disabled">
                                        <span className="page-link">...</span>
                                    </li>
                                );
                            }
                            return null;
                        })}

                        <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                            <button
                                className="page-link"
                                onClick={() => setCurrentPage(currentPage + 1)}
                                disabled={currentPage === totalPages}
                            >
                                Další
                                <i className="fas fa-chevron-right ms-1"></i>
                            </button>
                        </li>
                    </ul>
                </nav>
            )}
        </div>
    );
};

export default GameListPage;