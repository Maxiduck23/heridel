import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useUser } from '../context/UserContext';

const HomePage = () => {
    const { user } = useUser();
    const [homeData, setHomeData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [genres, setGenres] = useState([]);
    const [totalGamesCount, setTotalGamesCount] = useState(0);
    const API_BASE_URL = '/api';

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

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Načíst všechny hry pro správný počet
                const gamesResponse = await fetch(`${API_BASE_URL}/games.php`);
                const gamesData = await gamesResponse.json();

                if (gamesData.success && gamesData.data && Array.isArray(gamesData.data)) {
                    const games = gamesData.data;
                    setTotalGamesCount(games.length);

                    // OPRAVA: Najít nejdražší hru jako featured (s kontrolou prázdného pole)
                    let featuredGame = null;
                    if (games.length > 0) {
                        featuredGame = games.reduce((max, game) => {
                            const maxPrice = max?.price_tokens || 0;
                            const gamePrice = game?.price_tokens || 0;
                            return gamePrice > maxPrice ? game : max;
                        }, games[0]); // Začneme s první hrou jako fallback
                    }

                    // Top 8 her podle ceny (nejdražší první)
                    const popularGames = [...games] // Kopie aby se nemutatoval původní array
                        .sort((a, b) => (b.price_tokens || 0) - (a.price_tokens || 0))
                        .slice(0, 8);

                    setHomeData({
                        featuredGame: featuredGame,
                        popularGames: popularGames
                    });
                }

                // Načíst žánry
                const genresResponse = await fetch(`${API_BASE_URL}/genres.php`);
                const genresData = await genresResponse.json();
                if (genresData.success && genresData.data) {
                    setGenres(genresData.data.slice(0, 8));
                }
            } catch (error) {
                console.error('HomePage fetch error:', error);
                setError(error.message);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    if (loading) {
        return (
            <div className="d-flex justify-content-center align-items-center homepage-loading">
                <div className="text-center">
                    <div className="spinner-border text-primary mb-3 homepage-spinner" />
                    <div className="h5 text-light">Načítání herního světa...</div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="alert alert-danger">
                Chyba: {error}
            </div>
        );
    }

    return (
        <div className="homepage-gradient min-vh-100 pb-0 mb-0">

            {/* Hero Section */}
            <section className="position-relative overflow-hidden hero-section">
                <div className="position-absolute w-100 h-100 hero-pattern" />

                <div className="container-custom">
                    <div className="row align-items-center hero-content">

                        {/* Left Side - Content */}
                        <div className="col-lg-6 text-white">
                            <div className="mb-4">
                                <div className="hero-badge d-inline-flex align-items-center px-4 py-2 rounded-pill mb-4">
                                    <span className="me-2">🎮</span>
                                    <span className="hero-badge-text">Nejlepší herní obchod</span>
                                </div>

                                <h1 className="display-3 fw-bold mb-4 hero-title">
                                    Objevte svět
                                    <span className="d-block hero-gradient-text">
                                        nekonečných
                                    </span>
                                    dobrodružství
                                </h1>

                                <p className="lead mb-4 text-light hero-lead">
                                    Přes {totalGamesCount > 0 ? 
                                        (totalGamesCount === 1 ? '1 kvalitní hru' : 
                                         totalGamesCount <= 4 ? `${totalGamesCount} kvalitních her` : 
                                         `${totalGamesCount} kvalitních her`) : 
                                        '500 kvalitních her'
                                    }, exkluzivní nabídky a okamžité stahování.
                                    Vaše herní říše začíná zde.
                                </p>

                                <div className="d-flex flex-wrap gap-3 mb-4">
                                    <Link
                                        to="/games"
                                        className="btn btn-lg px-5 py-3 hero-btn-primary text-decoration-none"
                                    >
                                        Prozkoumat hry
                                    </Link>

                                    {!user && (
                                        <Link
                                            to="/register"
                                            className="btn btn-outline-light btn-lg px-5 py-3 hero-btn-secondary text-decoration-none"
                                        >
                                            Připojit se zdarma
                                        </Link>
                                    )}
                                </div>

                                {/* Uživatelské statistiky pokud je přihlášen */}
                                {user && (
                                    <div className="row mt-4">
                                        <div className="col-6">
                                            <div className="text-center">
                                                <div className="h4 fw-bold mb-1 hero-stats-number">
                                                    {Math.round(user.tokens_balance)}
                                                </div>
                                                <small className="text-light">Tokenů k dispozici</small>
                                            </div>
                                        </div>
                                        <div className="col-6">
                                            <div className="text-center">
                                                <div className="h4 fw-bold mb-1 hero-stats-number">
                                                    {totalGamesCount}+
                                                </div>
                                                <small className="text-light">Her k dispozici</small>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Right Side - Featured Game s OPRAVOU */}
                        <div className="col-lg-6">
                            {homeData?.featuredGame ? (
                                <div className="position-relative">
                                    <Link
                                        to={`/game/${homeData.featuredGame.slug || createSlug(homeData.featuredGame.name)}`}
                                        className="text-decoration-none"
                                    >
                                        <div
                                            className="featured-game-card rounded-4 overflow-hidden position-relative"
                                            style={{
                                                backgroundImage: `linear-gradient(135deg, rgba(15, 23, 42, 0.7), rgba(30, 41, 59, 0.8)), url(${homeData.featuredGame.image_url || 'https://placehold.co/600x500/1e293b/64748b?text=Featured+Game'})`,
                                                backgroundSize: 'cover',
                                                backgroundPosition: 'center',
                                                minHeight: '500px'
                                            }}
                                        >
                                            <div className="position-absolute top-0 start-0 m-3">
                                                <span className="badge featured-game-badge px-3 py-2">
                                                    💎 Premium
                                                </span>
                                            </div>

                                            <div className="position-absolute bottom-0 start-0 end-0 p-4">
                                                <h3 className="text-white fw-bold mb-3 featured-game-title">
                                                    {homeData.featuredGame.name}
                                                </h3>
                                                <p className="text-light mb-4 featured-game-desc">
                                                    {homeData.featuredGame.description ?
                                                        `${homeData.featuredGame.description.substring(0, 120)}...` :
                                                        'Objevte tento úžasný herní titul s prémiovou kvalitou a nezapomenutelným zážitkem.'
                                                    }
                                                </p>
                                                <div className="d-flex align-items-center justify-content-between">
                                                    <div>
                                                        <span className="h4 text-white fw-bold me-2 mb-0">
                                                            {homeData.featuredGame.price_tokens || 0} 🪙
                                                        </span>
                                                        <small className="text-light">tokenů</small>
                                                    </div>
                                                    <div className="btn btn-light btn-lg px-4 featured-game-btn shadow">
                                                        <i className="fas fa-eye me-2"></i>
                                                        Zobrazit detail
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </Link>
                                </div>
                            ) : (
                                // Fallback pokud není featured game
                                <div className="position-relative">
                                    <div
                                        className="featured-game-card rounded-4 overflow-hidden position-relative d-flex align-items-center justify-content-center"
                                        style={{
                                            background: 'linear-gradient(135deg, rgba(79, 70, 229, 0.3), rgba(124, 58, 237, 0.3))',
                                            minHeight: '500px',
                                            border: '2px dashed rgba(255, 255, 255, 0.3)'
                                        }}
                                    >
                                        <div className="text-center text-white">
                                            <div className="mb-3" style={{ fontSize: '4rem' }}>🎮</div>
                                            <h3 className="mb-3">Brzy zde najdete</h3>
                                            <p className="lead">Nejlepší herní tituly</p>
                                            <Link to="/games" className="btn btn-outline-light btn-lg mt-3">
                                                Prozkoumat katalog
                                            </Link>
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
                <section className="genres-section">
                    <div className="container-custom">
                        <div className="text-center mb-5">
                            <h2 className="text-white fw-bold mb-3">Prozkoumej žánry</h2>
                            <p className="text-light lead">Najdi své oblíbené herní styly</p>
                        </div>

                        <div className="row g-3">
                            {genres.map((genre, index) => (
                                <div key={`genre-${genre.genre_id || genre.slug || index}`} className="col-lg-3 col-md-4 col-sm-6">
                                    <Link
                                        to={`/games?category=${genre.slug}`}
                                        className="text-decoration-none genre-card-link"
                                    >
                                        <div
                                            className="genre-card rounded-3 p-4 text-center h-100"
                                            style={{
                                                background: `linear-gradient(135deg, ${getGenreGradient(index)})`,
                                            }}
                                        >
                                            <div className="mb-3 genre-icon">
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

            {/* Popular Games Section s SLUG LINKY */}
            {homeData?.popularGames && homeData.popularGames.length > 0 && (
                <section className="popular-games-section">
                    <div className="container-custom">
                        <div className="d-flex justify-content-between align-items-center mb-5">
                            <div>
                                <h2 className="text-white fw-bold mb-2">Nejžádanější hry</h2>
                                <p className="text-light mb-0">Nejdražší a nejkvalitnější herní tituly</p>
                            </div>
                            <Link to="/games" className="btn btn-outline-light text-decoration-none">
                                Zobrazit všechny
                            </Link>
                        </div>

                        <div className="row g-4">
                            {homeData.popularGames.slice(0, 8).map((game, index) => (
                                <div key={`popular-game-${game.game_id}`} className="col-lg-3 col-md-4 col-sm-6">
                                    <Link
                                        to={`/game/${game.slug || createSlug(game.name)}`}
                                        className="text-decoration-none d-block h-100"
                                    >
                                        <div className="popular-game-card card h-100 border-0 position-relative overflow-hidden bg-dark">
                                            <div className="position-relative">
                                                <img
                                                    src={game.image_url || 'https://placehold.co/300x200/1e293b/64748b?text=No+Image'}
                                                    className="card-img-top popular-game-img"
                                                    alt={game.name}
                                                    onError={(e) => {
                                                        e.target.src = 'https://placehold.co/300x200/1e293b/64748b?text=No+Image';
                                                    }}
                                                />
                                                <div className="position-absolute top-0 start-0 m-2">
                                                    <span className="badge bg-primary px-2 py-1">
                                                        #{index + 1}
                                                    </span>
                                                </div>
                                                <div className="position-absolute bottom-0 end-0 m-2">
                                                    <span className="badge popular-game-price px-2 py-1">
                                                        {game.price_tokens || 0} 🪙
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="card-body d-flex flex-column bg-dark">
                                                <h6 className="card-title text-white fw-bold mb-2 popular-game-title">
                                                    {game.name}
                                                </h6>

                                                <div className="text-center mt-auto popular-game-hover">
                                                    <i className="fas fa-eye me-1"></i>
                                                    Zobrazit detail
                                                </div>
                                            </div>
                                        </div>
                                    </Link>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* CTA Section - pouze pro nepřihlášené uživatele */}
            {!user && (
                <section className="cta-section">
                    <div className="container-custom cta-container">
                        <div className="text-center">
                            <h2 className="text-white fw-bold mb-3">Připoj se k našemu království</h2>
                            <p className="text-light lead mb-4">
                                Získej přístup k exkluzivním nabídkám a stávej se součástí největší herní komunity
                            </p>
                            <Link
                                to="/register"
                                className="btn btn-lg px-5 py-3 cta-btn text-decoration-none"
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
        'Puzzle': '🧩',
        'Shooter': '🔫',
        'Platform': '🕹️',
        'Fighting': '🥊',
        'Horror': '👻'
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