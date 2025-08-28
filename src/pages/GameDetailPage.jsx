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
    const [translatedDescription, setTranslatedDescription] = useState('');
    const [isTranslating, setIsTranslating] = useState(false);
    const [isPurchasing, setIsPurchasing] = useState(false);
    const [showTranslated, setShowTranslated] = useState(false);

    const [inWishlist, setInWishlist] = useState(false);
    const [isTogglingWishlist, setIsTogglingWishlist] = useState(false);
    const [isOwned, setIsOwned] = useState(false);

    const API_BASE_URL = '/api';

    // OPRAVENÝ PŘEKLAD - robustnější řešení
    const translateText = async (textToTranslate) => {
        if (!textToTranslate) return;

        // Rozšířený lokální slovník
        const simpleTranslations = {
            'action': 'akce',
            'adventure': 'dobrodružství',
            'rpg': 'RPG',
            'strategy': 'strategie',
            'simulation': 'simulace',
            'racing': 'závody',
            'sports': 'sport',
            'puzzle': 'puzzle',
            'shooter': 'střílečka',
            'platform': 'plošinovka',
            'the best': 'nejlepší',
            'amazing': 'úžasné',
            'great': 'skvělé',
            'fantastic': 'fantastické',
            'epic': 'epické',
            'awesome': 'úžasné',
            'explore': 'prozkoumej',
            'battle': 'bitva',
            'world': 'svět',
            'character': 'postava',
            'story': 'příběh',
            'play': 'hrát',
            'player': 'hráč',
            'level': 'úroveň',
            'mission': 'mise',
            'challenge': 'výzva',
            'fight': 'bojuj',
            'defeat': 'poraz',
            'enemy': 'nepřítel',
            'boss': 'boss',
            'quest': 'úkol',
            'journey': 'cesta',
            'magical': 'magický',
            'powerful': 'mocný',
            'collect': 'sbírej',
            'upgrade': 'vylepši',
            'customize': 'přizpůsob',
            'multiplayer': 'více hráčů',
            'single player': 'pro jednoho hráče',
            'online': 'online',
            'offline': 'offline',
            'weapon': 'zbraň',
            'armor': 'zbroj',
            'skill': 'dovednost',
            'experience': 'zkušenost'
        };

        setIsTranslating(true);
        try {
            // Pokusí se přeložit pomocí základních náhrad
            let translation = textToTranslate.toLowerCase();
            let hasTranslation = false;

            Object.entries(simpleTranslations).forEach(([en, cs]) => {
                const regex = new RegExp(`\\b${en}\\b`, 'gi');
                if (regex.test(translation)) {
                    translation = translation.replace(regex, cs);
                    hasTranslation = true;
                }
            });

            // Zachovat původní velikost písmen na začátku
            if (hasTranslation && textToTranslate.length > 0) {
                const firstChar = textToTranslate[0];
                translation = firstChar + translation.slice(1);
            }

            // Pokud máme nějaký překlad z lokálního slovníku, použijeme ho
            if (hasTranslation) {
                setTranslatedDescription(translation);
                return;
            }

            // Zkusit více překladových API současně
            const translationPromises = [
                // MyMemory API
                fetch(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(textToTranslate.substring(0, 500))}&langpair=en|cs`)
                    .then(res => res.json())
                    .then(data => data.responseData?.translatedText)
                    .catch(() => null),

                // LibreTranslate (free API)
                fetch('https://libretranslate.de/translate', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        q: textToTranslate.substring(0, 500),
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

            if (validTranslation && validTranslation !== textToTranslate) {
                setTranslatedDescription(validTranslation);
            } else {
                // Fallback překlad
                const fallbackTranslation = textToTranslate
                    .replace(/game/gi, 'hra')
                    .replace(/games/gi, 'hry')
                    .replace(/play/gi, 'hrát')
                    .replace(/player/gi, 'hráč')
                    .replace(/players/gi, 'hráči')
                    .replace(/world/gi, 'svět')
                    .replace(/story/gi, 'příběh')
                    .replace(/character/gi, 'postava')
                    .replace(/characters/gi, 'postavy')
                    .replace(/level/gi, 'úroveň')
                    .replace(/levels/gi, 'úrovně')
                    .replace(/mission/gi, 'mise')
                    .replace(/missions/gi, 'mise')
                    .replace(/challenge/gi, 'výzva')
                    .replace(/challenges/gi, 'výzvy')
                    .replace(/battle/gi, 'bitva')
                    .replace(/battles/gi, 'bitvy')
                    .replace(/fight/gi, 'bojuj')
                    .replace(/fighting/gi, 'boj')
                    .replace(/adventure/gi, 'dobrodružství')
                    .replace(/explore/gi, 'prozkoumej')
                    .replace(/exploring/gi, 'prozkoumávání');

                setTranslatedDescription(fallbackTranslation || 'Překlad není k dispozici.');
            }
        } catch (apiError) {
            console.log('Všechny překladové API selhaly, použiji základní fallback');
            const basicTranslation = textToTranslate
                .replace(/\bgame\b/gi, 'hra')
                .replace(/\bplay\b/gi, 'hrát')
                .replace(/\bworld\b/gi, 'svět')
                .replace(/\bstory\b/gi, 'příběh');

            setTranslatedDescription(basicTranslation || 'Automatický překlad není dostupný.');
        } finally {
            setIsTranslating(false);
        }
    };

    useEffect(() => {
        const fetchGame = async () => {
            setLoading(true);
            try {
                // Použít gameSlug místo gameId
                const response = await fetch(`${API_BASE_URL}/game_detail.php?id=${gameSlug}`, {
                    credentials: 'include'
                });
                const data = await response.json();
                if (data.success) {
                    setGame(data.data);
                    setIsOwned(data.data.is_owned);
                    setInWishlist(data.data.in_wishlist);
                    if (data.data.description) {
                        translateText(data.data.description);
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
                    <div className="h5 text-white">Načítání detailu hry...</div>
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
                                <Link to="/" className="text-white-50 text-decoration-none">
                                    <i className="fas fa-home me-1"></i>Domů
                                </Link>
                            </li>
                            <li className="breadcrumb-item">
                                <Link to="/games" className="text-white-50 text-decoration-none">
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
                                <span className="badge bg-primary px-3 py-2 game-detail-badge-publisher">
                                    {game.publisher_name || 'Neznámý vydavatel'}
                                </span>
                            </div>

                            <h1 className="display-4 fw-bold text-white mb-3 game-detail-title">
                                {game.name}
                            </h1>

                            <p className="lead text-white-50 mb-4">
                                <i className="fas fa-calendar me-2"></i>
                                Vydáno: {game.release_date || 'Neuvedeno'}
                            </p>
                        </div>

                        <div className="col-lg-4 text-end">
                            <div className="text-white mb-3">
                                <div className="h2 fw-bold mb-1 game-detail-price">
                                    {game.price_tokens || 0} 🪙
                                </div>
                                <small className="text-white-50">Cena ve tokenech</small>
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

                        {/* Game Description */}
                        <div className="game-detail-description-card rounded-3 p-4 mb-4">
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
                                        disabled={!translatedDescription || isTranslating}
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

                            <p className="text-white-50 mb-0 game-detail-description-text">
                                {showTranslated && translatedDescription ?
                                    translatedDescription :
                                    (game.description || 'Popis hry není k dispozici.')
                                }
                            </p>
                        </div>

                        {/* Action Buttons */}
                        <div className="game-detail-actions-card rounded-3 p-4">
                            {!user ? (
                                <div className="text-center">
                                    <p className="text-white-50 mb-3">Pro nákup nebo přidání do seznamu přání se musíte přihlásit</p>
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
                                            <small className="text-white-50">
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