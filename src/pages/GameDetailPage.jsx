import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { useToast } from '../components/ui/Toast';

const GameDetailPage = () => {
    const { gameSlug } = useParams();
    const navigate = useNavigate();
    const { user, updateUserTokens } = useUser();
    const { success, error, warning } = useToast();

    const [game, setGame] = useState(null);
    const [loading, setLoading] = useState(true);
    const [gameError, setGameError] = useState(null);
    const [translatedPages, setTranslatedPages] = useState([]);
    const [isTranslating, setIsTranslating] = useState(false);
    const [isPurchasing, setIsPurchasing] = useState(false);
    const [showTranslated, setShowTranslated] = useState(false);
    const [currentPage, setCurrentPage] = useState(0);
    const [descriptionPages, setDescriptionPages] = useState([]);

    const [inWishlist, setInWishlist] = useState(false);
    const [isTogglingWishlist, setIsTogglingWishlist] = useState(false);
    const [isOwned, setIsOwned] = useState(false);

    const API_BASE_URL = '/api';

    // Funkce pro rozčlenění textu na stránky (max 500 znaků, končí tečkou)
    const paginateText = (text) => {
        if (!text) return [''];

        const pages = [];
        let currentPage = '';
        const sentences = text.split(/([.!?]+\s*)/);

        for (let i = 0; i < sentences.length; i++) {
            const sentence = sentences[i];
            if (!sentence.trim()) continue;

            // Zkontrolovat, jestli přidání věty nepřekročí limit
            if ((currentPage + sentence).length > 500 && currentPage.length > 0) {
                pages.push(currentPage.trim());
                currentPage = sentence;
            } else {
                currentPage += sentence;
            }
        }

        if (currentPage.trim()) {
            pages.push(currentPage.trim());
        }

        return pages.length > 0 ? pages : [text];
    };

    // Vylepšený překlad pouze přes API
    const translatePages = async (pages) => {
        if (!pages || pages.length === 0) return;

        setIsTranslating(true);
        try {
            const translatedPagesResult = [];

            for (const page of pages) {
                try {
                    // Zkusit více překladových API současně
                    const translationPromises = [
                        // MyMemory API
                        fetch(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(page)}&langpair=en|cs`)
                            .then(res => res.json())
                            .then(data => data.responseData?.translatedText)
                            .catch(() => null),

                        // LibreTranslate API
                        fetch('https://libretranslate.de/translate', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                q: page,
                                source: 'en',
                                target: 'cs'
                            })
                        })
                            .then(res => res.json())
                            .then(data => data.translatedText)
                            .catch(() => null)
                    ];

                    const results = await Promise.allSettled(translationPromises);
                    const validTranslation = results
                        .filter(result => result.status === 'fulfilled' && result.value)
                        .map(result => result.value)[0];

                    if (validTranslation && validTranslation !== page && validTranslation.length > 10) {
                        translatedPagesResult.push(validTranslation);
                    } else {
                        translatedPagesResult.push('Překlad nedostupný pro tuto sekci.');
                    }

                    // Přidat malé zpoždění mezi požadavky
                    await new Promise(resolve => setTimeout(resolve, 1000));
                } catch (err) {
                    console.error('Chyba při překladu stránky:', err);
                    translatedPagesResult.push('Překlad nedostupný pro tuto sekci.');
                }
            }

            setTranslatedPages(translatedPagesResult);
        } catch (apiError) {
            console.error('Chyba při překladu:', apiError);
            setTranslatedPages(pages.map(() => 'Automatický překlad není dostupný.'));
        } finally {
            setIsTranslating(false);
        }
    };

    useEffect(() => {
        const fetchGame = async () => {
            setLoading(true);
            try {
                const response = await fetch(`${API_BASE_URL}/game_detail.php?id=${gameSlug}`, {
                    credentials: 'include'
                });
                const data = await response.json();
                if (data.success) {
                    setGame(data.data);
                    setIsOwned(data.data.is_owned);
                    setInWishlist(data.data.in_wishlist);

                    if (data.data.description) {
                        const pages = paginateText(data.data.description);
                        setDescriptionPages(pages);
                        // Automaticky přeložit první stránku
                        if (pages.length > 0) {
                            translatePages(pages);
                        }
                    }
                } else {
                    throw new Error(data.message);
                }
            } catch (apiError) {
                setGameError(apiError.message);
                error('Nepodařilo se načíst detail hry');
            } finally {
                setLoading(false);
            }
        };
        fetchGame();
    }, [gameSlug, user]);

    const handleToggleWishlist = async () => {
        if (!user) {
            warning('Pro přidání do seznamu přání se musíte přihlásit');
            navigate('/login');
            return;
        }
        setIsTogglingWishlist(true);
        try {
            const response = await fetch(`${API_BASE_URL}/toggle_wishlist.php`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ game_id: game.game_id })
            });
            const data = await response.json();
            if (data.success) {
                setInWishlist(data.in_wishlist);
                if (data.in_wishlist) {
                    success('Hra byla přidána do seznamu přání');
                } else {
                    success('Hra byla odebrána ze seznamu přání');
                }
            } else {
                error(data.message);
            }
        } catch (err) {
            error('Chyba při úpravě seznamu přání');
        } finally {
            setIsTogglingWishlist(false);
        }
    };

    const handlePurchase = async () => {
        if (!user) {
            warning('Pro nákup se musíte přihlásit');
            navigate('/login');
            return;
        }

        if (user.tokens_balance < game.price_tokens) {
            error('Nemáte dostatek tokenů pro nákup této hry');
            return;
        }

        if (!window.confirm(`Opravdu chcete koupit hru "${game.name}" za ${game.price_tokens} tokenů?`)) {
            return;
        }

        setIsPurchasing(true);
        setGameError(null);

        try {
            const response = await fetch(`${API_BASE_URL}/purchase_game.php`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ game_id: game.game_id })
            });
            const data = await response.json();
            if (data.success) {
                updateUserTokens(data.new_balance);
                success('Hra byla úspěšně zakoupena! Přesměrovávám do knihovny...');
                setTimeout(() => {
                    navigate('/library');
                }, 2000);
            } else {
                throw new Error(data.message || 'Nákup se nezdařil.');
            }
        } catch (err) {
            error(`Chyba při nákupu: ${err.message}`);
        } finally {
            setIsPurchasing(false);
        }
    };

    if (loading) {
        return (
            <div className="d-flex justify-content-center align-items-center game-detail-loading">
                <div className="text-center">
                    <div className="spinner-border text-primary mb-3 game-detail-spinner" />
                    <div className="h5 text-light">Načítání detailu hry...</div>
                </div>
            </div>
        );
    }

    if (gameError) {
        return (
            <div className="game-detail-bg min-vh-100">
                <div className="container-custom pt-5">
                    <div className="alert alert-danger">
                        <i className="fas fa-exclamation-triangle me-2"></i>
                        <strong>Chyba:</strong> {gameError}
                    </div>
                </div>
            </div>
        );
    }

    if (!game) {
        return (
            <div className="game-detail-bg min-vh-100">
                <div className="container-custom pt-5">
                    <div className="alert alert-warning">
                        <i className="fas fa-search me-2"></i>
                        Hra nenalezena.
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="game-detail-bg min-vh-100">

            {/* Hero Section */}
            <section className="position-relative overflow-hidden">
                <div
                    className="position-absolute w-100 h-100 top-0 start-0 game-detail-hero-bg"
                    style={{
                        backgroundImage: `linear-gradient(135deg, rgba(15, 23, 42, 0.8), rgba(30, 41, 59, 0.9)), url(${game.image_url})`,
                    }}
                />

                <div className="container-custom game-detail-hero-content position-relative">

                    {/* Breadcrumb */}
                    <nav aria-label="breadcrumb" className="mb-4">
                        <ol className="breadcrumb bg-transparent">
                            <li className="breadcrumb-item">
                                <Link to="/" className="text-light text-decoration-none">
                                    <i className="fas fa-home me-1"></i>Domů
                                </Link>
                            </li>
                            <li className="breadcrumb-item">
                                <Link to="/games" className="text-light text-decoration-none">
                                    Hry
                                </Link>
                            </li>
                            <li className="breadcrumb-item active text-white">
                                {game.name}
                            </li>
                        </ol>
                    </nav>

                    {/* Game Header */}
                    <div className="row align-items-center">
                        <div className="col-lg-8">
                            <div className="mb-3">
                                {isOwned && (
                                    <span className="badge game-detail-badge-owned px-3 py-2 me-3">
                                        <i className="fas fa-check me-2"></i>Vlastněno
                                    </span>
                                )}
                                {inWishlist && !isOwned && (
                                    <span className="badge game-detail-badge-wishlist px-3 py-2 me-3">
                                        <i className="fas fa-heart me-2"></i>V seznamu přání
                                    </span>
                                )}

                                {/* Vydavatel s odkazem na web */}
                                {game.publisher_name && (
                                    <span className="badge bg-primary px-3 py-2 game-detail-badge-publisher me-3">
                                        <i className="fas fa-building me-1"></i>
                                        {game.publisher_website ? (
                                            <a
                                                href={game.publisher_website}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-white text-decoration-none"
                                            >
                                                {game.publisher_name}
                                            </a>
                                        ) : (
                                            game.publisher_name
                                        )}
                                    </span>
                                )}
                            </div>

                            <h1 className="display-4 fw-bold text-white mb-3 game-detail-title">
                                {game.name}
                            </h1>

                            <p className="lead text-light mb-4">
                                <i className="fas fa-calendar me-2"></i>
                                Vydáno: {game.release_date || 'Neuvedeno'}
                            </p>
                        </div>

                        <div className="col-lg-4 text-end">
                            <div className="text-white mb-3">
                                <div className="h2 fw-bold mb-1 game-detail-price">
                                    {game.price_tokens || 0} 🪙
                                </div>
                                <small className="text-light">Cena ve tokenech</small>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Main Content */}
            <div className="container-custom game-detail-main-content">
                <div className="row g-5">

                    {/* Left Column */}
                    <div className="col-lg-5">
                        <div className="sticky-top game-detail-left-sticky">
                            <div className="game-detail-image-container rounded-4 overflow-hidden mb-4 shadow-strong position-relative">
                                <img
                                    src={game.image_url}
                                    className="w-100 game-detail-image"
                                    alt={game.name}
                                    onError={(e) => {
                                        e.target.src = 'https://placehold.co/600x400/1e293b/64748b?text=No+Image';
                                    }}
                                />
                            </div>

                            {/* Genres */}
                            {game.genres && game.genres.length > 0 && (
                                <div className="mb-4">
                                    <h6 className="text-white fw-bold mb-3">Žánry:</h6>
                                    <div className="d-flex flex-wrap gap-2">
                                        {game.genres.map((genre, index) => (
                                            <Link
                                                key={index}
                                                to={`/games?category=${genre.toLowerCase()}`}
                                                className="badge text-decoration-none px-3 py-2 game-detail-genre-badge"
                                            >
                                                {genre}
                                            </Link>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right Column */}
                    <div className="col-lg-7">

                        {/* Game Description s paginací */}
                        <div className="game-detail-description-card rounded-3 p-4 mb-4 bg-dark border border-secondary">
                            <div className="d-flex justify-content-between align-items-center mb-3">
                                <h5 className="text-white fw-bold mb-0">Popis hry</h5>
                                <div className="d-flex gap-2">
                                    <button
                                        className={`btn btn-sm ${!showTranslated ? 'btn-primary' : 'btn-outline-light'} game-detail-lang-btn`}
                                        onClick={() => setShowTranslated(false)}
                                    >
                                        Originál
                                    </button>
                                    <button
                                        className={`btn btn-sm ${showTranslated ? 'btn-primary' : 'btn-outline-light'} game-detail-lang-btn`}
                                        onClick={() => setShowTranslated(true)}
                                        disabled={translatedPages.length === 0 || isTranslating}
                                    >
                                        {isTranslating ? (
                                            <>
                                                <div className="spinner-border spinner-border-sm me-1" />
                                                Překládám...
                                            </>
                                        ) : (
                                            'Český překlad'
                                        )}
                                    </button>
                                </div>
                            </div>

                            {/* Paginovaný text */}
                            <div className="mb-3">
                                <p className="text-light mb-0 game-detail-description-text">
                                    {showTranslated && translatedPages.length > 0 ?
                                        translatedPages[currentPage] || 'Překlad nedostupný' :
                                        descriptionPages[currentPage] || 'Popis hry není k dispozici.'
                                    }
                                </p>
                            </div>

                            {/* Navigace stránek */}
                            {descriptionPages.length > 1 && (
                                <div className="d-flex justify-content-between align-items-center">
                                    <button
                                        className="btn btn-outline-light btn-sm"
                                        onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
                                        disabled={currentPage === 0}
                                    >
                                        ← Předchozí
                                    </button>

                                    <span className="text-light small">
                                        Strana {currentPage + 1} z {descriptionPages.length}
                                    </span>

                                    <button
                                        className="btn btn-outline-light btn-sm"
                                        onClick={() => setCurrentPage(Math.min(descriptionPages.length - 1, currentPage + 1))}
                                        disabled={currentPage === descriptionPages.length - 1}
                                    >
                                        Další →
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Action Buttons */}
                        <div className="game-detail-actions-card rounded-3 p-4 bg-dark border border-secondary">
                            {!user ? (
                                <div className="text-center">
                                    <p className="text-light mb-3">Pro nákup nebo přidání do seznamu přání se musíte přihlásit</p>
                                    <div className="d-flex gap-3 justify-content-center">
                                        <Link
                                            to="/login"
                                            className="btn btn-primary btn-lg px-4 game-detail-auth-btn text-decoration-none"
                                        >
                                            <i className="fas fa-sign-in-alt me-2"></i>
                                            Přihlásit se
                                        </Link>
                                        <Link
                                            to="/register"
                                            className="btn btn-outline-light btn-lg px-4 game-detail-auth-btn text-decoration-none"
                                        >
                                            <i className="fas fa-user-plus me-2"></i>
                                            Registrovat
                                        </Link>
                                    </div>
                                </div>
                            ) : isOwned ? (
                                <div className="text-center">
                                    <div className="alert alert-success mb-3">
                                        <i className="fas fa-check-circle me-2"></i>
                                        Tuto hru již vlastníte!
                                    </div>
                                    <Link
                                        to="/library"
                                        className="btn btn-success btn-lg px-5 game-detail-library-btn text-decoration-none"
                                    >
                                        <i className="fas fa-book me-2"></i>
                                        Přejít do knihovny
                                    </Link>
                                </div>
                            ) : (
                                <div>
                                    <div className="d-flex gap-3 mb-3">
                                        <button
                                            className="btn btn-success btn-lg flex-fill game-detail-purchase-btn"
                                            onClick={handlePurchase}
                                            disabled={isPurchasing || user.tokens_balance < game.price_tokens}
                                        >
                                            {isPurchasing ? (
                                                <>
                                                    <div className="spinner-border spinner-border-sm me-2" />
                                                    Zpracovávám nákup...
                                                </>
                                            ) : user.tokens_balance < game.price_tokens ? (
                                                <>
                                                    <i className="fas fa-coins me-2"></i>
                                                    Nedostatek tokenů
                                                </>
                                            ) : (
                                                <>
                                                    <i className="fas fa-shopping-cart me-2"></i>
                                                    Koupit za {game.price_tokens} tokenů
                                                </>
                                            )}
                                        </button>
                                    </div>

                                    <button
                                        className={`btn btn-lg w-100 fw-semibold ${inWishlist ? 'btn-danger' : 'btn-outline-light'} game-detail-wishlist-btn`}
                                        onClick={handleToggleWishlist}
                                        disabled={isTogglingWishlist}
                                    >
                                        {isTogglingWishlist ? (
                                            <>
                                                <div className="spinner-border spinner-border-sm me-2" />
                                                Pracuji...
                                            </>
                                        ) : inWishlist ? (
                                            <>
                                                <i className="fas fa-heart-broken me-2"></i>
                                                Odebrat ze seznamu přání
                                            </>
                                        ) : (
                                            <>
                                                <i className="fas fa-heart me-2"></i>
                                                Přidat do seznamu přání
                                            </>
                                        )}
                                    </button>

                                    {user && (
                                        <div className="text-center mt-3">
                                            <small className="text-light">
                                                Váš zůstatek: <strong className="text-success">{user.tokens_balance} 🪙</strong>
                                            </small>
                                            {user.tokens_balance < (game.price_tokens || 0) && (
                                                <div className="mt-2">
                                                    <Link
                                                        to="/tokens"
                                                        className="btn btn-warning btn-sm game-detail-tokens-btn text-decoration-none"
                                                    >
                                                        <i className="fas fa-coins me-1"></i>
                                                        Doplnit tokeny
                                                    </Link>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default GameDetailPage;