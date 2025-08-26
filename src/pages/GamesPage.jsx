// src/pages/GamesPage.js
import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';

const GamesPage = () => {
    const [games, setGames] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [sortBy, setSortBy] = useState('name');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [gamesPerPage] = useState(8);
    const [searchParams, setSearchParams] = useSearchParams();

    const API_BASE_URL = 'http://heridel.wz.cz';
    const urlCategory = searchParams.get('category');

    const categories = [
        { id: 'all', name: 'Všechny hry' },
        { id: 'action', name: 'Action' },
        { id: 'adventure', name: 'Adventure' },
        { id: 'arcade', name: 'Arcade' },
        { id: 'board-games', name: 'Board Games' },
        { id: 'card', name: 'Card' },
        { id: 'casual', name: 'Casual' },
        { id: 'educational', name: 'Educational' },
        { id: 'family', name: 'Family' },
    ];

    const sortOptions = [
        { value: 'name', label: 'Názvu (A-Z)' },
        { value: 'price-low', label: 'Ceny (nejlevnější)' },
        { value: 'price-high', label: 'Ceny (nejdražší)' },
        { value: 'newest', label: 'Nejnovější' },
    ];

    useEffect(() => {
        const fetchGames = async () => {
            setLoading(true);
            try {
                const url = urlCategory ? `${API_BASE_URL}/api/games.php?genre=${urlCategory}` : `${API_BASE_URL}/api/games.php`;

                const response = await fetch(url, {
                    credentials: 'include'
                });

                if (!response.ok) {
                    throw new Error(`HTTP chyba: ${response.status}`);
                }

                const data = await response.json();

                if (data.success && Array.isArray(data.data)) {
                    setGames(data.data);
                } else {
                    throw new Error(data.message || 'API nevrací pole her.');
                }
            } catch (error) {
                console.error('Fetch error:', error);
                setError(error.message);
            } finally {
                setLoading(false);
            }
        };
        fetchGames();
    }, [urlCategory]);

    const handleCategoryClick = (category) => {
        setCurrentPage(1);
        if (category.id === 'all') {
            setSearchParams({});
        } else {
            setSearchParams({ category: category.id });
        }
    };

    const sortedGames = [...games].sort((a, b) => {
        switch (sortBy) {
            case 'name':
                return (a.name || '').localeCompare(b.name || '');
            case 'price-low':
                return (a.price_tokens || 0) - (b.price_tokens || 0);
            case 'price-high':
                return (b.price_tokens || 0) - (a.price_tokens || 0);
            case 'newest':
                return new Date(b.release_date) - new Date(a.release_date);
            case 'popular':
            default:
                return 0;
        }
    });

    const indexOfLastGame = currentPage * gamesPerPage;
    const indexOfFirstGame = indexOfLastGame - gamesPerPage;
    const currentGames = sortedGames.slice(indexOfFirstGame, indexOfLastGame);
    const totalPages = Math.ceil(sortedGames.length / gamesPerPage);

    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    const renderPageNumbers = () => {
        const pageNumbers = [];
        const maxPageButtons = 5; // Kolik tlačítek chceme zobrazit
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
        return <div className="text-center p-5 text-white">Načítání her...</div>;
    }

    if (error) {
        return (
            <div className="container p-5">
                <div className="alert alert-danger">
                    <strong>Chyba při načítání her:</strong> {error}
                </div>
            </div>
        );
    }

    return (
        <div className="bg-dark text-white min-vh-100">
            {/* Hero Section */}
            <div className="py-5 text-center" style={{ background: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)' }}>
                <div className="container">
                    <h1 className="display-4 fw-bold mb-3">🎮 Katalog her</h1>
                    <p className="lead text-white-50">Prozkoumejte naši kompletní knihovnu digitálních her.</p>
                </div>
            </div>

            <div className="container py-5">
                {/* Filtry a řazení */}
                <div className="row mb-4">
                    <div className="col-md-8 d-flex flex-wrap gap-2 mb-3">
                        {categories.map(category => (
                            <Link
                                key={category.id}
                                to={`/games?category=${category.id}`}
                                onClick={() => handleCategoryClick(category)}
                                className={`btn ${urlCategory === category.id || (!urlCategory && category.id === 'all') ? 'btn-primary' : 'btn-outline-secondary'}`}
                            >
                                {category.name}
                            </Link>
                        ))}
                    </div>
                    <div className="col-md-4 d-flex justify-content-md-end align-items-center mb-3">
                        <label htmlFor="sortSelect" className="form-label me-2 mb-0">Řadit podle:</label>
                        <select
                            id="sortSelect"
                            className="form-select form-select-sm bg-secondary text-white border-0 w-auto"
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                        >
                            {sortOptions.map(option => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Zobrazení her v mřížce */}
                {sortedGames.length > 0 ? (
                    <div className="row g-4">
                        {currentGames.map(game => (
                            <div key={game.game_id} className="col-lg-3 col-md-4 col-sm-6">
                                <div className="card h-100 border-0 shadow-sm bg-secondary text-white">
                                    <img src={game.image_url || 'https://placehold.co/300x200'} className="card-img-top" alt={game.name} style={{ height: '200px', objectFit: 'cover' }} />
                                    <div className="card-body d-flex flex-column">
                                        <h5 className="card-title fw-bold">{game.name}</h5>
                                        <p className="card-text text-white-50">Cena: {game.price_tokens || '0'} 🪙</p>
                                        <Link to={`/game/${game.game_id}`} className="btn btn-primary mt-auto">
                                            Zobrazit detail
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center text-white-50 py-5">
                        <i className="fas fa-gamepad fa-4x mb-3"></i>
                        <h3>Žádné hry nenalezeny</h3>
                        <p>Zkuste změnit filtry nebo se podívejte později.</p>
                    </div>
                )}

                {/* Vylepšené stránkování (Pagination) */}
                {totalPages > 1 && (
                    <nav className="mt-5">
                        <ul className="pagination justify-content-center">
                            <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                                <button onClick={() => paginate(currentPage - 1)} className="page-link bg-dark text-white border-secondary">
                                    Předchozí
                                </button>
                            </li>
                            {renderPageNumbers().map((pageNumber, index) => (
                                <li key={index} className={`page-item ${pageNumber === currentPage ? 'active' : ''} ${pageNumber === '...' ? 'disabled' : ''}`}>
                                    <button onClick={() => pageNumber !== '...' && paginate(pageNumber)} className="page-link bg-dark text-white border-secondary">
                                        {pageNumber}
                                    </button>
                                </li>
                            ))}
                            <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                                <button onClick={() => paginate(currentPage + 1)} className="page-link bg-dark text-white border-secondary">
                                    Další
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