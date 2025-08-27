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

    const API_BASE_URL = 'http://heridel.wz.cz';
    const urlCategory = searchParams.get('category');

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                // Načíst hry
                const url = urlCategory ? `${API_BASE_URL}/api/games.php?genre=${urlCategory}` : `${API_BASE_URL}/api/games.php`;
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
                const genresResponse = await fetch(`${API_BASE_URL}/api/genres.php`);
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
            <div className="d-flex justify-content-center align-items-center" style={{
                height: '60vh',
                background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)'
            }}>
                <div className="text-center">
                    <div className="spinner-border text-primary mb-3" style={{ width: '3rem', height: '3rem' }} />
                    <div className="h5 text-white">Načítání her...</div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)', minHeight: '100vh' }}>
                <div className="container py-5">
                    <div className="alert alert-danger">
                        <i className="fas fa-exclamation-triangle me-2"></i>
                        <strong>Chyba při načítání her:</strong> {error}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%)', minHeight: '100vh' }}>

            {/* Hero Header */}
            <section className="position-relative py-5" style={{
                background: 'linear-gradient(135deg, rgba(79, 70, 229, 0.2) 0%, rgba(124, 58, 237, 0.2) 100%)',
                borderBottom: '1px solid rgba(255,255,255,0.1)'
            }}>
                {/* Background Pattern */}
                <div
                    className="position-absolute w-100 h-100 top-0 start-0"
                    style={{
                        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%234f46e5' fill-opacity='0.08'%3E%3Cpath d='M30 0l30 30-30 30L0 30z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                        opacity: 0.5
                    }}
                />

                <div className="container position-relative">
                    <div className="text-center text-white">
                        <nav aria-label="breadcrumb" className="mb-3">
                            <ol className="breadcrumb justify-content-center bg-transparent">
                                <li className="breadcrumb-item">
                                    <Link to="/" className="text-white-50 text-decoration-none">
                                        <i className="fas fa-home me-1"></i>Domů
                                    </Link>
                                </li>
                                <li className="breadcrumb-item active text-white" aria-current="page">
                                    Katalog her
                                </li>
                            </ol>
                        </nav>

                        <div className="mb-3" style={{ fontSize: '3rem' }}>🎮</div>
                        <h1 className="display-4 fw-bold mb-3" style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.3)' }}>
                            Herní katalog
                        </h1>
                        <p className="lead text-white-50 mb-4">
                            Objevte tisíce kvalitních her ze všech žánrů. Celkem k dispozici {filteredGames.length} her.
                        </p>
                    </div>
                </div>
            </section>

            <div className="container py-5">

                {/* Search & Filters */}
                <div className="row mb-5">
                    <div className="col-12">
                        <div
                            className="rounded-4 p-4"
                            style={{
                                background: 'rgba(255,255,255,0.05)',
                                backdropFilter: 'blur(10px)',
                                border: '1px solid rgba(255,255,255,0.1)'
                            }}
                        >
                            {/* Search Bar */}
                            <div className="row mb-4">
                                <div className="col-md-8">
                                    <div className="position-relative">
                                        <input
                                            type="text"
                                            className="form-control form-control-lg"
                                            placeholder="🔍 Hledat hry podle názvu..."
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            style={{
                                                background: 'rgba(255,255,255,0.1)',
                                                border: '2px solid rgba(255,255,255,0.2)',
                                                borderRadius: '50px',
                                                color: 'white',
                                                paddingLeft: '3rem',
                                                fontSize: '1.1rem'
                                            }}
                                        />
                                        <i className="fas fa-search position-absolute text-white-50"
                                            style={{ left: '1.25rem', top: '50%', transform: 'translateY(-50%)' }}></i>
                                    </div>
                                </div>
                                <div className="col-md-4">
                                    <select
                                        className="form-select form-select-lg"
                                        value={sortBy}
                                        onChange={(e) => setSortBy(e.target.value)}
                                        style={{
                                            background: 'rgba(255,255,255,0.1)',
                                            border: '2px solid rgba(255,255,255,0.2)',
                                            borderRadius: '50px',
                                            color: 'white',
                                            fontSize: '1.1rem'
                                        }}
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
                                    className={`btn ${!urlCategory ? 'btn-primary' : 'btn-outline-light'}`}
                                    onClick={() => handleCategoryClick('all')}
                                    style={{
                                        borderRadius: '25px',
                                        fontWeight: '500',
                                        border: !urlCategory ? 'none' : '2px solid rgba(255,255,255,0.3)'
                                    }}
                                >
                                    Všechny hry
                                </button>
                                {genres.map(genre => (
                                    <button
                                        key={`genre-${genre.slug}`} // Add this key
                                        className={`btn ${urlCategory === genre.slug ? 'btn-primary' : 'btn-outline-light'}`}
                                        onClick={() => handleCategoryClick(genre.slug)}
                                        style={{
                                            borderRadius: '25px',
                                            fontWeight: '500',
                                            border: urlCategory === genre.slug ? 'none' : '2px solid rgba(255,255,255,0.3)'
                                        }}
                                    >
                                        {genre.name}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Games Grid */}
                {currentGames.length === 0 ? (
                    <div className="text-center py-5">
                        <div className="mb-4" style={{ fontSize: '4rem', opacity: '0.5' }}>🎮</div>
                        <h3 className="text-white mb-3">Žádné hry nenalezeny</h3>
                        <p className="text-white-50 mb-4">
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
                                <div
                                    className="card h-100 border-0 position-relative overflow-hidden"
                                    style={{
                                        background: 'rgba(255,255,255,0.05)',
                                        backdropFilter: 'blur(10px)',
                                        border: '1px solid rgba(255,255,255,0.1)',
                                        borderRadius: '20px',
                                        transition: 'all 0.4s ease'
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.transform = 'translateY(-12px)';
                                        e.currentTarget.style.boxShadow = '0 25px 50px rgba(0,0,0,0.3)';
                                        e.currentTarget.style.border = '1px solid rgba(79, 70, 229, 0.5)';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.transform = 'translateY(0)';
                                        e.currentTarget.style.boxShadow = 'none';
                                        e.currentTarget.style.border = '1px solid rgba(255,255,255,0.1)';
                                    }}
                                >
                                    <div className="position-relative">
                                        <img
                                            src={game.image_url || 'https://placehold.co/300x200/1e293b/64748b?text=No+Image'}
                                            className="card-img-top"
                                            alt={game.name}
                                            style={{
                                                height: '220px',
                                                objectFit: 'cover',
                                                borderRadius: '20px 20px 0 0',
                                                transition: 'transform 0.4s ease'
                                            }}
                                            onError={(e) => {
                                                e.target.src = 'https://placehold.co/300x200/1e293b/64748b?text=No+Image';
                                            }}
                                            onMouseEnter={(e) => {
                                                e.target.style.transform = 'scale(1.05)';
                                            }}
                                            onMouseLeave={(e) => {
                                                e.target.style.transform = 'scale(1)';
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
                                            <span
                                                className="badge px-3 py-2"
                                                style={{
                                                    background: 'linear-gradient(135deg, #10b981, #059669)',
                                                    fontSize: '1rem',
                                                    fontWeight: '700',
                                                    borderRadius: '20px',
                                                    boxShadow: '0 4px 16px rgba(16, 185, 129, 0.4)'
                                                }}
                                            >
                                                {game.price_tokens || '0'} 🪙
                                            </span>
                                        </div>
                                    </div>

                                    <div className="card-body d-flex flex-column p-4">
                                        <h5 className="card-title text-white fw-bold mb-2" style={{
                                            fontSize: '1.2rem',
                                            lineHeight: '1.3',
                                            height: '3rem',
                                            overflow: 'hidden',
                                            display: '-webkit-box',
                                            WebkitLineClamp: 2,
                                            WebkitBoxOrient: 'vertical'
                                        }}>
                                            {game.name}
                                        </h5>

                                        <p className="card-text text-white-50 small mb-2">
                                            <i className="fas fa-calendar me-2"></i>
                                            {game.release_date || 'Datum vydání neuvedeno'}
                                        </p>

                                        <p className="card-text text-white-50 small mb-3">
                                            <i className="fas fa-building me-2"></i>
                                            {game.publisher_name || 'Neznámý vydavatel'}
                                        </p>

                                        <p className="card-text text-white-50 flex-grow-1 mb-3" style={{
                                            fontSize: '0.9rem',
                                            lineHeight: '1.4',
                                            height: '4.2rem',
                                            overflow: 'hidden',
                                            display: '-webkit-box',
                                            WebkitLineClamp: 3,
                                            WebkitBoxOrient: 'vertical'
                                        }}>
                                            {game.description || 'Popis hry není k dispozici.'}
                                        </p>

                                        {/* Genres */}
                                        {game.genres && (
                                            <div className="mb-3">
                                                {game.genres.slice(0, 2).map(genre => (
                                                    <span
                                                        key={genre}
                                                        className="badge me-1 mb-1"
                                                        style={{
                                                            fontSize: '0.7rem',
                                                            background: 'linear-gradient(45deg, #4f46e5, #7c3aed)',
                                                            borderRadius: '12px',
                                                            padding: '0.3rem 0.7rem'
                                                        }}
                                                    >
                                                        {genre}
                                                    </span>
                                                ))}
                                                {game.genres.length > 2 && (
                                                    <span
                                                        className="badge"
                                                        style={{
                                                            fontSize: '0.7rem',
                                                            background: 'rgba(255,255,255,0.2)',
                                                            borderRadius: '12px',
                                                            padding: '0.3rem 0.7rem'
                                                        }}
                                                    >
                                                        +{game.genres.length - 2}
                                                    </span>
                                                )}
                                            </div>
                                        )}

                                        <Link
                                            to={`/game/${game.game_id}`}
                                            className="btn btn-lg fw-medium text-white"
                                            style={{
                                                background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
                                                border: 'none',
                                                borderRadius: '50px',
                                                transition: 'all 0.3s ease',
                                                boxShadow: '0 4px 16px rgba(79, 70, 229, 0.4)'
                                            }}
                                            onMouseEnter={(e) => {
                                                e.target.style.transform = 'translateY(-2px)';
                                                e.target.style.boxShadow = '0 8px 24px rgba(79, 70, 229, 0.6)';
                                            }}
                                            onMouseLeave={(e) => {
                                                e.target.style.transform = 'translateY(0)';
                                                e.target.style.boxShadow = '0 4px 16px rgba(79, 70, 229, 0.4)';
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

                {/* Enhanced Pagination */}
                {totalPages > 1 && (
                    <nav className="mt-5">
                        <ul className="pagination justify-content-center">
                            <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                                <button
                                    className="page-link"
                                    onClick={() => paginate(currentPage - 1)}
                                    disabled={currentPage === 1}
                                    style={{
                                        background: 'rgba(255,255,255,0.05)',
                                        border: '1px solid rgba(255,255,255,0.2)',
                                        color: 'white',
                                        borderRadius: '12px 0 0 12px'
                                    }}
                                >
                                    <i className="fas fa-chevron-left me-1"></i>
                                    Předchozí
                                </button>
                            </li>

                            {renderPageNumbers().map((pageNumber, index) => (
                                <li key={`page-${pageNumber}-${index}`} className={`page-item ${pageNumber === currentPage ? 'active' : ''} ${pageNumber === '...' ? 'disabled' : ''}`}>
                                    <button
                                        className="page-link"
                                        onClick={() => pageNumber !== '...' && paginate(pageNumber)}
                                        style={{
                                            background: pageNumber === currentPage
                                                ? 'linear-gradient(135deg, #4f46e5, #7c3aed)'
                                                : 'rgba(255,255,255,0.05)',
                                            border: '1px solid rgba(255,255,255,0.2)',
                                            color: 'white'
                                        }}
                                    >
                                        {pageNumber}
                                    </button>
                                </li>
                            ))}

                            <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                                <button
                                    className="page-link"
                                    onClick={() => paginate(currentPage + 1)}
                                    disabled={currentPage === totalPages}
                                    style={{
                                        background: 'rgba(255,255,255,0.05)',
                                        border: '1px solid rgba(255,255,255,0.2)',
                                        color: 'white',
                                        borderRadius: '0 12px 12px 0'
                                    }}
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