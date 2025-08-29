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
    const [searchTerm, setSearchTerm] = useState('');
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
                if (data.data && Array.isArray(data.data)) {
                    setGames(data.data);
                } else if (Array.isArray(data)) {
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
            let matchesFilter = true;
            if (filterBy === 'owned') matchesFilter = game.is_owned;
            else if (filterBy === 'not-owned') matchesFilter = !game.is_owned;
            else if (filterBy === 'wishlist') matchesFilter = game.in_wishlist;

            const matchesSearch = searchTerm === '' ||
                game.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (game.description && game.description.toLowerCase().includes(searchTerm.toLowerCase()));

            return matchesFilter && matchesSearch;
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
            <div className="min-vh-100 d-flex align-items-center justify-content-center bg-main-gradient">
                <div className="text-center">
                    <div className="spinner-border text-white mb-3" style={{ width: '3rem', height: '3rem' }} role="status">
                        <span className="visually-hidden">Načítání...</span>
                    </div>
                    <p className="text-white fs-5">Načítání her...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-vh-100 d-flex align-items-center justify-content-center bg-main-gradient">
                <div className="container">
                    <div className="alert alert-danger text-center">
                        <h4><i className="fas fa-exclamation-triangle me-2"></i>Chyba načítání</h4>
                        <p className="mb-0">{error}</p>
                    </div>
                </div>
            </div>
        );
    }

    if (!Array.isArray(games)) {
        return (
            <div className="min-vh-100 d-flex align-items-center justify-content-center bg-main-gradient">
                <div className="container">
                    <div className="alert alert-warning text-center">
                        <h4><i className="fas fa-exclamation-triangle me-2"></i>Problém s daty</h4>
                        <p className="mb-0">Hry nejsou ve správném formátu</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-vh-100 bg-main-gradient">
            {/* Header sekce */}
            <div className="container-fluid py-5">
                <div className="container">
                    <div className="position-relative overflow-hidden rounded-4 p-5 mb-5 header-glass-box">
                        <div className="text-white text-center">
                            <nav aria-label="breadcrumb" className="mb-3">
                                <ol className="breadcrumb justify-content-center">
                                    <li className="breadcrumb-item">
                                        <Link to="/" className="text-white-75 text-decoration-none">
                                            <i className="fas fa-home me-1"></i>Domů
                                        </Link>
                                    </li>
                                    <li className="breadcrumb-item active text-white" aria-current="page">Katalog her</li>
                                </ol>
                            </nav>
                            <h1 className="display-4 fw-bold mb-3">
                                <i className="fas fa-gamepad me-3"></i>
                                Herní katalog
                            </h1>
                            <p className="lead mb-0 opacity-90">
                                Objevte {filteredAndSortedGames.length} her ze všech žánrů
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Filtry a vyhledávání */}
            <div className="container mb-4">
                <div className="card border-0 shadow-lg card-glass">
                    <div className="card-body p-4">
                        <div className="row g-3">
                            <div className="col-md-4">
                                <div className="position-relative">
                                    <input
                                        type="text"
                                        className="form-control form-control-lg ps-5 rounded-pill form-control-custom"
                                        placeholder="Hledat hry podle názvu..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                    <i className="fas fa-search position-absolute top-50 start-0 translate-middle-y ms-3 text-muted"></i>
                                </div>
                            </div>
                            <div className="col-md-4">
                                <select
                                    className="form-select form-select-lg rounded-pill form-control-custom"
                                    value={sortBy}
                                    onChange={(e) => setSortBy(e.target.value)}
                                >
                                    <option value="name">Řadit podle názvu (A-Z)</option>
                                    <option value="price-low">Cena (nejlevnější)</option>
                                    <option value="price-high">Cena (nejdražší)</option>
                                    <option value="newest">Nejnovější</option>
                                </select>
                            </div>
                            <div className="col-md-4">
                                <select
                                    className="form-select form-select-lg rounded-pill form-control-custom"
                                    value={filterBy}
                                    onChange={(e) => setFilterBy(e.target.value)}
                                >
                                    <option value="all">Všechny hry</option>
                                    {user && <option value="owned">Vlastněné hry</option>}
                                    {user && <option value="not-owned">Nevlastněné hry</option>}
                                    {user && <option value="wishlist">Seznam přání</option>}
                                </select>
                            </div>
                        </div>
                        {searchTerm && (
                            <div className="mt-3 text-center">
                                <span className="badge bg-primary fs-6 px-3 py-2">
                                    <i className="fas fa-search me-2"></i>
                                    Nalezeno {filteredAndSortedGames.length} her pro "{searchTerm}"
                                </span>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Seznam her */}
            <div className="container pb-5">
                {currentGames.length === 0 ? (
                    <div className="text-center py-5">
                        <div className="card border-0 shadow-lg mx-auto card-glass" style={{ maxWidth: '500px' }}>
                            <div className="card-body p-5">
                                <div className="mb-4">
                                    <i className="fas fa-gamepad fa-4x text-white opacity-50"></i>
                                </div>
                                <h3 className="text-white mb-3">Žádné hry nenalezeny</h3>
                                <p className="text-white-75">
                                    {searchTerm ?
                                        `Pro výraz "${searchTerm}" nebyly nalezeny žádné hry.` :
                                        'Zkuste změnit filtry nebo se podívejte později.'
                                    }
                                </p>
                                {searchTerm && (
                                    <button
                                        className="btn btn-light mt-3"
                                        onClick={() => setSearchTerm('')}
                                    >
                                        <i className="fas fa-times me-2"></i>
                                        Zrušit vyhledávání
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="row g-4">
                        {currentGames.map(game => (
                            <div key={game.game_id} className="col-xl-3 col-lg-4 col-md-6">
                                <div className="card h-100 border-0 shadow-lg game-card">
                                    <div className="position-relative">
                                        <img
                                            src={game.image_url || 'https://placehold.co/300x180/667eea/ffffff?text=No+Image'}
                                            className="card-img-top game-card-img"
                                            alt={game.name}
                                            onError={(e) => { e.target.src = 'https://placehold.co/300x180/667eea/ffffff?text=No+Image'; }}
                                        />
                                        <div className="position-absolute top-0 end-0 p-2">
                                            {game.is_owned && (
                                                <span className="badge bg-success mb-1 d-block shadow-sm">
                                                    <i className="fas fa-check me-1"></i>Vlastněno
                                                </span>
                                            )}
                                            {game.in_wishlist && !game.is_owned && (
                                                <span className="badge bg-danger d-block shadow-sm">
                                                    <i className="fas fa-heart me-1"></i>V přání
                                                </span>
                                            )}
                                        </div>
                                        <div className="position-absolute bottom-0 start-0 p-2">
                                            <span className="badge fs-6 px-3 py-2 shadow-sm badge-price">
                                                {game.price_tokens || '0'} 🪙
                                            </span>
                                        </div>
                                    </div>
                                    <div className="card-body d-flex flex-column p-3">
                                        <h5 className="card-title fw-bold mb-2 text-dark game-card-title">
                                            {game.name}
                                        </h5>
                                        <p className="card-text text-muted small mb-2">
                                            <i className="fas fa-calendar me-1"></i>
                                            {game.release_date || 'Datum neuvedeno'}
                                        </p>
                                        <p className="card-text text-muted small mb-2">
                                            <i className="fas fa-building me-1"></i>
                                            {game.publisher_name || 'Neznámý vydavatel'}
                                        </p>
                                        <p className="card-text flex-grow-1 text-dark game-card-description">
                                            {game.description || 'Popis hry není k dispozici.'}
                                        </p>
                                        <div className="mb-3">
                                            {game.genres && game.genres.slice(0, 2).map(genre => (
                                                <span key={genre} className="badge me-1 mb-1 badge-genre">
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
                                            to={`/game/${encodeURIComponent(game.slug)}`}
                                            className="btn btn-sm fw-medium text-white rounded-pill btn-view-detail"
                                        >
                                            <i className="fas fa-eye me-2"></i>
                                            Detail hry
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Paginace */}
            {totalPages > 1 && (
                <div className="container pb-5">
                    <nav aria-label="Navigace stránek">
                        <ul className="pagination justify-content-center">
                            <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                                <button
                                    className="page-link border-0 text-white me-2 pagination-button"
                                    onClick={() => setCurrentPage(currentPage - 1)}
                                    disabled={currentPage === 1}
                                >
                                    <i className="fas fa-chevron-left me-1"></i>
                                    Předchozí
                                </button>
                            </li>
                            {Array.from({ length: totalPages }, (_, i) => i + 1).map(pageNumber => {
                                if (pageNumber === 1 || pageNumber === totalPages || (pageNumber >= currentPage - 2 && pageNumber <= currentPage + 2)) {
                                    return (
                                        <li key={pageNumber} className="page-item me-1">
                                            <button
                                                className={`page-link border-0 text-white pagination-number ${currentPage === pageNumber ? 'active' : ''}`}
                                                onClick={() => setCurrentPage(pageNumber)}
                                            >
                                                {pageNumber}
                                            </button>
                                        </li>
                                    );
                                } else if (pageNumber === currentPage - 3 || pageNumber === currentPage + 3) {
                                    return (
                                        <li key={pageNumber} className="page-item me-1">
                                            <span className="page-link border-0 text-white bg-transparent">...</span>
                                        </li>
                                    );
                                }
                                return null;
                            })}
                            <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                                <button
                                    className="page-link border-0 text-white ms-2 pagination-button"
                                    onClick={() => setCurrentPage(currentPage + 1)}
                                    disabled={currentPage === totalPages}
                                >
                                    Další
                                    <i className="fas fa-chevron-right ms-1"></i>
                                </button>
                            </li>
                        </ul>
                    </nav>
                </div>
            )}
        </div>
    );
};

export default GameListPage;