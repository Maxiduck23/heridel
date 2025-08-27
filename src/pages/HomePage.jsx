import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useUser } from '../context/UserContext';

const HomePage = () => {
    const { user } = useUser();
    const [homeData, setHomeData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [genres, setGenres] = useState([]);
    const API_BASE_URL = 'http://heridel.wz.cz';

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Načíst homepage data
                const homeResponse = await fetch(`${API_BASE_URL}/api/homepage.php`);
                const homeData = await homeResponse.json();

                // Načíst žánry
                const genresResponse = await fetch(`${API_BASE_URL}/api/genres.php`);
                const genresData = await genresResponse.json();

                if (homeData.success) {
                    setHomeData(homeData.data);
                }
                if (genresData.success) {
                    setGenres(genresData.data.slice(0, 8)); // První 8 žánrů
                }
            } catch (error) {
                setError(error.message);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    if (loading) {
        return (
            <div className="d-flex justify-content-center align-items-center" style={{ height: '60vh' }}>
                <div className="text-center">
                    <div className="spinner-border text-primary mb-3" style={{ width: '3rem', height: '3rem' }} />
                    <div className="h5 text-white-50">Načítání herního světa...</div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="alert alert-danger">
                <i className="fas fa-exclamation-triangle me-2"></i>
                Chyba: {error}
            </div>
        );
    }

    return (
        <div style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%)', minHeight: '100vh' }}>

            {/* Hero Section */}
            <section className="position-relative overflow-hidden" style={{ minHeight: '70vh' }}>
                {/* Background Pattern */}
                <div
                    className="position-absolute w-100 h-100"
                    style={{
                        backgroundImage: `url("data:image/svg+xml,%3Csvg width='80' height='80' viewBox='0 0 80 80' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%234f46e5' fill-opacity='0.05'%3E%3Cpath d='m0 0 40 40L0 80V0zm40 0 40 40-40 40V0z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                        opacity: 0.1
                    }}
                />

                <div className="container position-relative">
                    <div className="row align-items-center" style={{ minHeight: '70vh' }}>

                        {/* Left Side - Content */}
                        <div className="col-lg-6 text-white">
                            <div className="mb-4">
                                <div className="d-inline-flex align-items-center px-4 py-2 rounded-pill mb-4"
                                    style={{ background: 'rgba(79, 70, 229, 0.2)', border: '1px solid rgba(79, 70, 229, 0.3)' }}>
                                    <span className="me-2">🎮</span>
                                    <span style={{ fontSize: '0.9rem', fontWeight: '500' }}>Nejlepší herní obchod</span>
                                </div>

                                <h1 className="display-3 fw-bold mb-4" style={{
                                    lineHeight: '1.1',
                                    textShadow: '2px 2px 4px rgba(0,0,0,0.3)'
                                }}>
                                    Objevte svět
                                    <span className="d-block" style={{
                                        background: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
                                        WebkitBackgroundClip: 'text',
                                        WebkitTextFillColor: 'transparent',
                                        backgroundClip: 'text'
                                    }}>
                                        nekonečných
                                    </span>
                                    dobrodružství
                                </h1>

                                <p className="lead mb-5 text-white-50" style={{ fontSize: '1.2rem', lineHeight: '1.6' }}>
                                    Tisíce kvalitních her, exkluzivní nabídky a okamžité stahování.
                                    Vaše herní říše začína zde.
                                </p>

                                <div className="d-flex flex-wrap gap-3">
                                    <Link
                                        to="/games"
                                        className="btn btn-lg px-5 py-3"
                                        style={{
                                            background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
                                            border: 'none',
                                            borderRadius: '50px',
                                            fontSize: '1.1rem',
                                            fontWeight: '600',
                                            color: 'white',
                                            boxShadow: '0 8px 32px rgba(79, 70, 229, 0.4)',
                                            transition: 'all 0.3s ease'
                                        }}
                                        onMouseEnter={(e) => {
                                            e.target.style.transform = 'translateY(-3px)';
                                            e.target.style.boxShadow = '0 12px 40px rgba(79, 70, 229, 0.5)';
                                        }}
                                        onMouseLeave={(e) => {
                                            e.target.style.transform = 'translateY(0)';
                                            e.target.style.boxShadow = '0 8px 32px rgba(79, 70, 229, 0.4)';
                                        }}
                                    >
                                        <i className="fas fa-rocket me-2"></i>
                                        Prozkoumat hry
                                    </Link>

                                    {!user && (
                                        <Link
                                            to="/register"
                                            className="btn btn-outline-light btn-lg px-5 py-3"
                                            style={{
                                                borderRadius: '50px',
                                                fontSize: '1.1rem',
                                                fontWeight: '600',
                                                borderWidth: '2px',
                                                transition: 'all 0.3s ease'
                                            }}
                                            onMouseEnter={(e) => {
                                                e.target.style.background = 'rgba(255,255,255,0.1)';
                                                e.target.style.transform = 'translateY(-2px)';
                                            }}
                                            onMouseLeave={(e) => {
                                                e.target.style.background = 'transparent';
                                                e.target.style.transform = 'translateY(0)';
                                            }}
                                        >
                                            <i className="fas fa-user-plus me-2"></i>
                                            Připojit se zdarma
                                        </Link>
                                    )}
                                </div>

                                {/* Stats */}
                                <div className="row mt-5">
                                    <div className="col-4">
                                        <div className="text-center">
                                            <div className="h2 fw-bold mb-1" style={{ color: '#4f46e5' }}>1000+</div>
                                            <small className="text-white-50">Her</small>
                                        </div>
                                    </div>
                                    <div className="col-4">
                                        <div className="text-center">
                                            <div className="h2 fw-bold mb-1" style={{ color: '#10b981' }}>50K+</div>
                                            <small className="text-white-50">Hráčů</small>
                                        </div>
                                    </div>
                                    <div className="col-4">
                                        <div className="text-center">
                                            <div className="h2 fw-bold mb-1" style={{ color: '#f59e0b' }}>24/7</div>
                                            <small className="text-white-50">Podpora</small>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Right Side - Featured Game */}
                        <div className="col-lg-6">
                            {homeData?.featuredGame && (
                                <div className="position-relative">
                                    <div
                                        className="rounded-4 overflow-hidden position-relative"
                                        style={{
                                            background: `linear-gradient(135deg, rgba(0,0,0,0.4), rgba(0,0,0,0.6)), url(${homeData.featuredGame.image_url})`,
                                            backgroundSize: 'cover',
                                            backgroundPosition: 'center',
                                            height: '500px',
                                            border: '1px solid rgba(255,255,255,0.1)',
                                            boxShadow: '0 20px 40px rgba(0,0,0,0.3)'
                                        }}
                                    >
                                        <div className="position-absolute top-0 start-0 m-3">
                                            <span className="badge px-3 py-2" style={{
                                                background: 'linear-gradient(45deg, #ef4444, #dc2626)',
                                                fontSize: '0.9rem',
                                                fontWeight: '600'
                                            }}>
                                                ⭐ Doporučujeme
                                            </span>
                                        </div>

                                        <div className="position-absolute bottom-0 start-0 end-0 p-4">
                                            <h3 className="text-white fw-bold mb-3" style={{ fontSize: '1.8rem' }}>
                                                {homeData.featuredGame.name}
                                            </h3>
                                            <p className="text-white-50 mb-4" style={{ fontSize: '1rem' }}>
                                                {homeData.featuredGame.description?.substring(0, 120)}...
                                            </p>
                                            <div className="d-flex align-items-center justify-content-between">
                                                <div className="d-flex align-items-center">
                                                    <span className="h4 text-white fw-bold me-2 mb-0">
                                                        {homeData.featuredGame.price_tokens || 0} 🪙
                                                    </span>
                                                </div>
                                                <Link
                                                    to={`/game/${homeData.featuredGame.game_id}`}
                                                    className="btn btn-light btn-lg px-4"
                                                    style={{
                                                        borderRadius: '25px',
                                                        fontWeight: '600',
                                                        boxShadow: '0 4px 16px rgba(255,255,255,0.2)'
                                                    }}
                                                >
                                                    Zobrazit detail
                                                </Link>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </section>

            {/* Genres Section */}
            {genres.length > 0 && (
                <section className="py-5">
                    <div className="container">
                        <div className="text-center mb-5">
                            <h2 className="text-white fw-bold mb-3">Prozkoumej žánry</h2>
                            <p className="text-white-50 lead">Najdi své oblíbené herní styly</p>
                        </div>

                        <div className="row g-3">
                            {genres.map((genre, index) => (
                                <div key={`genre-${genre.genre_id || genre.slug || index}`} className="col-lg-3 col-md-4 col-sm-6">
                                    <Link
                                        to={`/games?category=${genre.slug}`}
                                        className="text-decoration-none"
                                        style={{ transition: 'all 0.3s ease' }}
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.transform = 'translateY(-8px)';
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.transform = 'translateY(0)';
                                        }}
                                    >
                                        <div
                                            className="rounded-3 p-4 text-center h-100"
                                            style={{
                                                background: `linear-gradient(135deg, ${getGenreGradient(index)})`,
                                                border: '1px solid rgba(255,255,255,0.1)',
                                                backdropFilter: 'blur(10px)',
                                                transition: 'all 0.3s ease'
                                            }}
                                        >
                                            <div className="mb-3" style={{ fontSize: '2.5rem' }}>
                                                {getGenreIcon(genre.name)}
                                            </div>
                                            <h6 className="text-white fw-bold mb-0">{genre.name}</h6>
                                        </div>
                                    </Link>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* Popular Games Section */}
            {homeData?.popularGames && (
                <section className="py-5">
                    <div style={{
                        width: '100%',
                        maxWidth: '1200px',
                        margin: '0 auto',
                        paddingLeft: '15px',
                        paddingRight: '15px'
                    }}>
                        <div className="d-flex justify-content-between align-items-center mb-5">
                            <div>
                                <h2 className="text-white fw-bold mb-2">Populární hry</h2>
                                <p className="text-white-50 mb-0">Nejhranější hry tohoto měsíce</p>
                            </div>
                            <Link to="/games" className="btn btn-outline-light">
                                Zobrazit všechny
                                <i className="fas fa-arrow-right ms-2"></i>
                            </Link>
                        </div>

                        <div className="row g-4">
                            {homeData.popularGames.slice(0, 8).map((game, index) => (
                                <div key={`popular-game-${game.game_id}`} className="col-lg-3 col-md-4 col-sm-6">
                                    <div
                                        className="card h-100 border-0 position-relative overflow-hidden"
                                        style={{
                                            background: 'rgba(255,255,255,0.05)',
                                            backdropFilter: 'blur(10px)',
                                            border: '1px solid rgba(255,255,255,0.1)',
                                            borderRadius: '16px',
                                            transition: 'all 0.3s ease'
                                        }}
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.transform = 'translateY(-10px)';
                                            e.currentTarget.style.boxShadow = '0 20px 40px rgba(0,0,0,0.3)';
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.transform = 'translateY(0)';
                                            e.currentTarget.style.boxShadow = 'none';
                                        }}
                                    >
                                        <div className="position-relative">
                                            <img
                                                src={game.image_url || 'https://placehold.co/300x200/1e293b/64748b?text=No+Image'}
                                                className="card-img-top"
                                                alt={game.name}
                                                style={{
                                                    height: '200px',
                                                    objectFit: 'cover'
                                                }}
                                                onError={(e) => {
                                                    e.target.src = 'https://placehold.co/300x200/1e293b/64748b?text=No+Image';
                                                }}
                                            />
                                            <div className="position-absolute top-0 start-0 m-2">
                                                <span className="badge bg-primary px-2 py-1" style={{ fontSize: '0.8rem' }}>
                                                    #{index + 1}
                                                </span>
                                            </div>
                                            <div className="position-absolute bottom-0 end-0 m-2">
                                                <span
                                                    className="badge px-2 py-1"
                                                    style={{
                                                        background: 'rgba(0,0,0,0.8)',
                                                        color: '#10b981',
                                                        fontSize: '0.9rem',
                                                        fontWeight: '600'
                                                    }}
                                                >
                                                    {game.price_tokens || 0} 🪙
                                                </span>
                                            </div>
                                        </div>

                                        <div className="card-body d-flex flex-column">
                                            <h6 className="card-title text-white fw-bold mb-2" style={{
                                                fontSize: '1rem',
                                                lineHeight: '1.3',
                                                height: '2.6rem',
                                                overflow: 'hidden',
                                                display: '-webkit-box',
                                                WebkitLineClamp: 2,
                                                WebkitBoxOrient: 'vertical'
                                            }}>
                                                {game.name}
                                            </h6>

                                            <Link
                                                to={`/game/${game.game_id}`}
                                                className="btn btn-sm mt-auto"
                                                style={{
                                                    background: 'linear-gradient(45deg, #4f46e5, #7c3aed)',
                                                    border: 'none',
                                                    color: 'white',
                                                    borderRadius: '8px',
                                                    fontWeight: '500'
                                                }}
                                            >
                                                Zobrazit detail
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* CTA Section */}
            {!user && (
                <section className="py-5" style={{
                    background: 'linear-gradient(135deg, rgba(79, 70, 229, 0.1), rgba(124, 58, 237, 0.1))',
                    borderTop: '1px solid rgba(255,255,255,0.1)'
                }}>
                    <div style={{
                        width: '100%',
                        maxWidth: '1200px',
                        margin: '0 auto',
                        paddingLeft: '15px',
                        paddingRight: '15px'
                    }}>
                        <div className="text-center">
                            <h2 className="text-white fw-bold mb-3">Připoj se k našemu království</h2>
                            <p className="text-white-50 lead mb-4">
                                Získej přístup k exkluzivním nabídkám a stávej se součástí největší herní komunity
                            </p>
                            <Link
                                to="/register"
                                className="btn btn-lg px-5 py-3"
                                style={{
                                    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                                    border: 'none',
                                    borderRadius: '50px',
                                    fontSize: '1.1rem',
                                    fontWeight: '600',
                                    color: 'white',
                                    boxShadow: '0 8px 32px rgba(16, 185, 129, 0.4)'
                                }}
                            >
                                <i className="fas fa-crown me-2"></i>
                                Registrovat se zdarma
                            </Link>
                        </div>
                    </div>
                </section>
            )}
        </div>
    );
};

// Helper funkce pro ikony žánrů
const getGenreIcon = (genreName) => {
    const icons = {
        'Action': '⚔️',
        'Adventure': '🗺️',
        'RPG': '🏰',
        'Strategy': '🎯',
        'Simulation': '🎮',
        'Sports': '⚽',
        'Racing': '🏁',
        'Puzzle': '🧩'
    };
    return icons[genreName] || '🎮';
};

// Helper funkce pro gradient žánrů
const getGenreGradient = (index) => {
    const gradients = [
        'rgba(239, 68, 68, 0.8), rgba(220, 38, 38, 0.6)',
        'rgba(16, 185, 129, 0.8), rgba(5, 150, 105, 0.6)',
        'rgba(59, 130, 246, 0.8), rgba(29, 78, 216, 0.6)',
        'rgba(245, 158, 11, 0.8), rgba(217, 119, 6, 0.6)',
        'rgba(168, 85, 247, 0.8), rgba(124, 58, 237, 0.6)',
        'rgba(236, 72, 153, 0.8), rgba(190, 24, 93, 0.6)',
        'rgba(14, 165, 233, 0.8), rgba(2, 132, 199, 0.6)',
        'rgba(34, 197, 94, 0.8), rgba(22, 163, 74, 0.6)'
    ];
    return gradients[index % gradients.length];
};

export default HomePage;