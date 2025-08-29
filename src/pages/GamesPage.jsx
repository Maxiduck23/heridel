import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useUser } from '../context/UserContext';

const GamesPage = () => {
    const { user } = useUser();
    const [games, setGames] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [sortBy, setSortBy] = useState('name');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [gamesPerPage] = useState(12);
    const [searchParams, setSearchParams] = useSearchParams();
    const [genres, setGenres] = useState([]);

    const API_BASE_URL = '/api';
    const urlCategory = searchParams.get('category');

    // Funkce pro vytvoření slug z názvu hry s podporou českých znaků
    const createSlug = (name) => {
        if (!name) return '';

        // Mapování českých znaků na anglické
        const charMap = {
            'á': 'a', 'à': 'a', 'ä': 'a', 'â': 'a',
            'č': 'c', 'ć': 'c',
            'ď': 'd',
            'é': 'e', 'è': 'e', 'ë': 'e', 'ê': 'e', 'ě': 'e',
            'í': 'i', 'ì': 'i', 'ï': 'i', 'î': 'i',
            'ň': 'n', 'ñ': 'n',
            'ó': 'o', 'ò': 'o', 'ö': 'o', 'ô': 'o',
            'ř': 'r',
            'š': 's', 'ś': 's',
            'ť': 't',
            'ú': 'u', 'ù': 'u', 'ü': 'u', 'û': 'u', 'ů': 'u',
            'ý': 'y', 'ÿ': 'y',
            'ž': 'z', 'ź': 'z'
        };

        return name
            .toLowerCase()
            .replace(/[^a-z0-9\s-]/g, (match) => charMap[match] || '') // Mapovat české znaky
            .replace(/\s+/g, '-') // Nahradit mezery pomlčkami
            .replace(/-+/g, '-') // Nahradit více pomlček jednou
            .replace(/^-+|-+$/g, ''); // Odstranit pomlčky na začátku a konci
    };

    // Funkce pro správnou českou gramatiku počtu her
    const getGameCountText = (count) => {
        if (count === 1) {
            return '1 hru';
        } else if (count >= 2 && count <= 4) {
            return `${count} hry`;
        } else {
            return `${count} her`;
        }
    };

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                // Načíst hry
                const url = urlCategory ? `${API_BASE_URL}/games.php?genre=${urlCategory}` : `${API_BASE_URL}/games.php`;
                const response = await fetch(url, { credentials: 'include' });

                if (!response.ok) {
                    throw new Error(`HTTP chyba: ${response.status}`);
                }

                const data = await response.json();
                if (data.success && Array.isArray(data.data)) {
                    setGames(data.data);
                } else {
                    throw new Error(data.message || 'API nevrací pole her.');
                }

                // Načíst žánry pro filtry
                const genresResponse = await fetch(`${API_BASE_URL}/genres.php`);
                const genresData = await genresResponse.json();
                if (genresData.success) {
                    setGenres(genresData.data);
                }
            } catch (error) {
                console.error('Fetch error:', error);
                setError(error.message);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [urlCategory]);

    const handleCategoryClick = (categorySlug) => {
        setCurrentPage(1);
        if (categorySlug === 'all') {
            setSearchParams({});
        } else {
            setSearchParams({ category: categorySlug });
        }
    };

    // Filtrování a řazení
    const filteredGames = games
        .filter(game => {
            const matchesSearch = game.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (game.description && game.description.toLowerCase().includes(searchTerm.toLowerCase()));
            return matchesSearch;
        })
        .sort((a, b) => {
            switch (sortBy) {
                case 'name':
                    return (a.name || '').localeCompare(b.name || '');
                case 'price-low':
                    return (a.price_tokens || 0) - (b.price_tokens || 0);
                case 'price-high':
                    return (b.price_tokens || 0) - (a.price_tokens || 0);
                case 'newest':
                    return new Date(b.release_date) - new Date(a.release_date);
                default:
                    return 0;
            }
        });

    // Paginace
    const indexOfLastGame = currentPage * gamesPerPage;
    const indexOfFirstGame = indexOfLastGame - gamesPerPage;
    const currentGames = filteredGames.slice(indexOfFirstGame, indexOfLastGame);
    const totalPages = Math.ceil(filteredGames.length / gamesPerPage);

    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    const renderPageNumbers = () => {
        const pageNumbers = [];
        const maxPageButtons = 5;
        const halfMax = Math.floor(maxPageButtons / 2);

        if (totalPages <= maxPageButtons) {
            for (let i = 1; i <= totalPages; i++) {
                pageNumbers.push(i);
            }
        } else if (currentPage <= halfMax + 1) {
            for (let i = 1; i <= maxPageButtons; i++) {
                pageNumbers.push(i);
            }
            pageNumbers.push('...');
            pageNumbers.push(totalPages);
        } else if (currentPage >= totalPages - halfMax) {
            pageNumbers.push(1);
            pageNumbers.push('...');
            for (let i = totalPages - maxPageButtons + 1; i <= totalPages; i++) {
                pageNumbers.push(i);
            }
        } else {
            pageNumbers.push(1);
            pageNumbers.push('...');
            for (let i = currentPage - halfMax; i <= currentPage + halfMax; i++) {
                pageNumbers.push(i);
            }
            pageNumbers.push('...');
            pageNumbers.push(totalPages);
        }
        return pageNumbers;
    };

    if (loading) {
        return (
            <div className="d-flex justify-content-center align-items-center games-page-loading">
                <div className="text-center">
                    <div className="spinner-border text-primary mb-3 games-page-spinner" />
                    <div className="h5 text-light">Načítání her...</div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="games-page-bg min-vh-100">
                <div className="container-custom pt-5">
                    <div className="alert alert-danger">
                        <i className="fas fa-exclamation-triangle me-2"></i>
                        <strong>Chyba při načítání her:</strong> {error}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="games-page-bg min-vh-100">

            {/* Hero Header */}
            <section className="position-relative py-5 games-page-hero">
                {/* Background Pattern */}
                <div className="position-absolute w-100 h-100 top-0 start-0 games-page-pattern" />

                <div className="container position-relative">
                    <div className="text-center text-white">
                        <nav aria-label="breadcrumb" className="mb-3">
                            <ol className="breadcrumb justify-content-center bg-transparent">
                                <li className="breadcrumb-item">
                                    <Link to="/" className="text-light text-decoration-none">
                                        <i className="fas fa-home me-1"></i>Domů
                                    </Link>
                                </li>
                                <li className="breadcrumb-item active text-white" aria-current="page">
                                    Katalog her
                                </li>
                            </ol>
                        </nav>

                        <div className="mb-3 games-page-hero-icon">🎮</div>
                        <h1 className="display-4 fw-bold mb-3 games-page-hero-title">
                            Herní katalog
                        </h1>
                        <p className="lead text-light mb-4">
                            Objevte {getGameCountText(filteredGames.length)} ze všech žánrů.
                        </p>
                    </div>
                </div>
            </section>

            <div className="container-custom games-page-content">

                {/* Search & Filters */}
                <div className="row mb-5">
                    <div className="col-12">
                        <div className="games-page-filters-card rounded-4 p-4 bg-dark border border-secondary">
                            {/* Search Bar */}
                            <div className="row mb-4">
                                <div className="col-md-8">
                                    <div className="position-relative">
                                        <input
                                            type="text"
                                            className="form-control form-control-lg games-page-search-input bg-dark text-light border-secondary"
                                            placeholder="🔍 Hledat hry podle názvu..."
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                        />
                                        <i className="fas fa-search position-absolute text-muted games-page-search-icon"></i>
                                    </div>
                                </div>
                                <div className="col-md-4">
                                    <select
                                        className="form-select form-select-lg games-page-sort-select bg-dark text-light border-secondary"
                                        value={sortBy}
                                        onChange={(e) => setSortBy(e.target.value)}
                                    >
                                        <option value="name">📝 Podle názvu (A-Z)</option>
                                        <option value="price-low">💰 Nejlevnější</option>
                                        <option value="price-high">💎 Nejdražší</option>
                                        <option value="newest">🆕 Nejnovější</option>
                                    </select>
                                </div>
                            </div>

                            {/* Genre Filters */}
                            <div className="d-flex flex-wrap gap-2">
                                <button
                                    className={`btn ${!urlCategory ? 'btn-primary' : 'btn-outline-light'} games-page-genre-btn`}
                                    onClick={() => handleCategoryClick('all')}
                                >
                                    Všechny hry
                                </button>
                                {genres.map(genre => (
                                    <button
                                        key={`genre-${genre.slug}`}
                                        className={`btn ${urlCategory === genre.slug ? 'btn-primary' : 'btn-outline-light'} games-page-genre-btn`}
                                        onClick={() => handleCategoryClick(genre.slug)}
                                    >
                                        {genre.name}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Games Grid - KOMPLETNĚ KLIKATELNÉ KARTY SE SLUG ODKAZY */}
                {currentGames.length === 0 ? (
                    <div className="text-center py-5">
                        <div className="mb-4 games-page-no-games-icon">🎮</div>
                        <h3 className="text-white mb-3">Žádné hry nenalezeny</h3>
                        <p className="text-light mb-4">
                            {searchTerm ? 'Zkuste změnit vyhledávací kritéria nebo filtry' : 'Momentálně nejsou k dispozici žádné hry'}
                        </p>
                        {searchTerm && (
                            <button
                                className="btn btn-outline-light"
                                onClick={() => { setSearchTerm(''); setSearchParams({}); }}
                            >
                                Vymazat filtry
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="row g-4">
                        {currentGames.map(game => (
                            <div key={`game-${game.game_id}`} className="col-xl-3 col-lg-4 col-md-6">
                                {/* CELÁ KARTA S SLUG ODKAZEM */}
                                <Link
                                    to={`/game/${game.slug || createSlug(game.name)}`}
                                    className="text-decoration-none d-block h-100"
                                >
                                    <div className="games-page-card card h-100 border-0 position-relative overflow-hidden bg-dark border border-secondary">
                                        <div className="position-relative">
                                            <img
                                                src={game.image_url || 'https://placehold.co/300x200/1e293b/64748b?text=No+Image'}
                                                className="card-img-top games-page-card-img"
                                                alt={game.name}
                                                onError={(e) => {
                                                    e.target.src = 'https://placehold.co/300x200/1e293b/64748b?text=No+Image';
                                                }}
                                            />

                                            {/* Status badges */}
                                            <div className="position-absolute top-0 end-0 p-3">
                                                {game.is_owned && (
                                                    <span className="badge bg-success mb-1 d-block px-2 py-1">
                                                        <i className="fas fa-check me-1"></i>Vlastněno
                                                    </span>
                                                )}
                                                {game.in_wishlist && !game.is_owned && (
                                                    <span className="badge bg-danger d-block px-2 py-1">
                                                        <i className="fas fa-heart me-1"></i>V přání
                                                    </span>
                                                )}
                                            </div>

                                            {/* Price tag */}
                                            <div className="position-absolute bottom-0 start-0 p-3">
                                                <span className="badge games-page-price-badge px-3 py-2">
                                                    {game.price_tokens || '0'} 🪙
                                                </span>
                                            </div>
                                        </div>

                                        <div className="card-body d-flex flex-column p-4 bg-dark">
                                            <h5 className="card-title text-white fw-bold mb-2 games-page-card-title">
                                                {game.name}
                                            </h5>

                                            <div className="row text-center mb-3">
                                                <div className="col-6">
                                                    <small className="text-muted d-block">
                                                        <i className="fas fa-calendar me-1"></i>
                                                        {game.release_date ? new Date(game.release_date).getFullYear() : 'N/A'}
                                                    </small>
                                                    <small className="text-muted">Vydáno</small>
                                                </div>
                                                <div className="col-6">
                                                    <small className="text-muted d-block">
                                                        <i className="fas fa-coins me-1"></i>
                                                        {game.price_tokens || 0}
                                                    </small>
                                                    <small className="text-muted">Tokenů</small>
                                                </div>
                                            </div>

                                            <p className="card-text text-muted small mb-3">
                                                <i className="fas fa-building me-2"></i>
                                                {game.publisher_name || 'Neznámý vydavatel'}
                                            </p>

                                            {/* Genres */}
                                            {game.genres && (
                                                <div className="mb-3">
                                                    {game.genres.slice(0, 2).map(genre => (
                                                        <span
                                                            key={genre}
                                                            className="badge me-1 mb-1 games-page-genre-tag"
                                                        >
                                                            {genre}
                                                        </span>
                                                    ))}
                                                    {game.genres.length > 2 && (
                                                        <span className="badge games-page-genre-more">
                                                            +{game.genres.length - 2}
                                                        </span>
                                                    )}
                                                </div>
                                            )}

                                            {/* HOVER INDIKÁTOR */}
                                            <div className="text-center mt-auto">
                                                <div className="d-block games-page-card-static text-muted">
                                                    <i className="fas fa-gamepad me-1"></i>
                                                    <small>Klikněte pro detail</small>
                                                </div>
                                                <div className="d-none games-page-card-hover text-primary fw-semibold">
                                                    <i className="fas fa-eye me-1"></i>
                                                    <small>Zobrazit detail hry</small>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            </div>
                        ))}
                    </div>
                )}

                {/* Enhanced Pagination */}
                {totalPages > 1 && (
                    <nav className="mt-5">
                        <ul className="pagination justify-content-center">
                            <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                                <button
                                    className="page-link games-page-pagination-btn"
                                    onClick={() => paginate(currentPage - 1)}
                                    disabled={currentPage === 1}
                                >
                                    <i className="fas fa-chevron-left me-1"></i>
                                    Předchozí
                                </button>
                            </li>

                            {renderPageNumbers().map((pageNumber, index) => (
                                <li key={`page-${pageNumber}-${index}`} className={`page-item ${pageNumber === currentPage ? 'active' : ''} ${pageNumber === '...' ? 'disabled' : ''}`}>
                                    <button
                                        className={`page-link ${pageNumber === currentPage ? 'games-page-pagination-active' : 'games-page-pagination-btn'}`}
                                        onClick={() => pageNumber !== '...' && paginate(pageNumber)}
                                    >
                                        {pageNumber}
                                    </button>
                                </li>
                            ))}

                            <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                                <button
                                    className="page-link games-page-pagination-btn"
                                    onClick={() => paginate(currentPage + 1)}
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
        </div>
    );
};

export default GamesPage;