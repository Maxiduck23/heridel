import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { useToast } from '../components/ui/Toast'; // PŘIDÁNO

const GameDetailPage = () => {
    const { gameId } = useParams();
    const navigate = useNavigate();
    const { user, updateUserTokens } = useUser();
    const { success, error, warning } = useToast(); // PŘIDÁNO

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

    const API_BASE_URL = 'http://heridel.wz.cz';

    // VYLEPŠENÝ PŘEKLAD - lokální slovník + fallback
    const translateText = async (textToTranslate) => {
        if (!textToTranslate) return;

        // Jednoduchý lokální překlad pro časté fráze
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
            'awesome': 'úžasné'
        };

        // Rychlý překlad základních slov
        let quickTranslation = textToTranslate.toLowerCase();
        Object.entries(simpleTranslations).forEach(([en, cs]) => {
            quickTranslation = quickTranslation.replace(new RegExp(en, 'g'), cs);
        });

        if (quickTranslation !== textToTranslate.toLowerCase()) {
            setTranslatedDescription(quickTranslation);
            return;
        }

        setIsTranslating(true);
        try {
            // Zkusíme API překlad, ale s timeoutem
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 5000);

            const response = await fetch(
                `https://api.mymemory.translated.net/get?q=${encodeURIComponent(textToTranslate.substring(0, 500))}&langpair=en|cs`,
                { signal: controller.signal }
            );

            clearTimeout(timeoutId);
            const data = await response.json();

            if (data.responseData && data.responseData.translatedText) {
                setTranslatedDescription(data.responseData.translatedText);
            } else {
                throw new Error('API neposkytlo překlad');
            }
        } catch (apiError) {
            console.log('API překlad selhal, použiji fallback');
            // Fallback - základní čeština
            const fallbackTranslation = textToTranslate
                .replace(/game/gi, 'hra')
                .replace(/play/gi, 'hrát')
                .replace(/player/gi, 'hráč')
                .replace(/world/gi, 'svět')
                .replace(/story/gi, 'příběh')
                .replace(/character/gi, 'postava')
                .replace(/level/gi, 'úroveň')
                .replace(/mission/gi, 'mise')
                .replace(/challenge/gi, 'výzva')
                .replace(/battle/gi, 'bitva');

            setTranslatedDescription(fallbackTranslation || 'Překlad není k dispozici.');
        } finally {
            setIsTranslating(false);
        }
    };

    useEffect(() => {
        const fetchGame = async () => {
            setLoading(true);
            try {
                const response = await fetch(`${API_BASE_URL}/api/game_detail.php?id=${gameId}`, {
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
                error('Nepodařilo se načíst detail hry'); // TOAST
            } finally {
                setLoading(false);
            }
        };
        fetchGame();
    }, [gameId, user]);

    const handleToggleWishlist = async () => {
        if (!user) {
            warning('Pro přidání do seznamu přání se musíte přihlásit'); // TOAST
            navigate('/login');
            return;
        }
        setIsTogglingWishlist(true);
        try {
            const response = await fetch(`${API_BASE_URL}/api/toggle_wishlist.php`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ game_id: game.game_id })
            });
            const data = await response.json();
            if (data.success) {
                setInWishlist(data.in_wishlist);
                if (data.in_wishlist) {
                    success('Hra byla přidána do seznamu přání'); // TOAST
                } else {
                    success('Hra byla odebrána ze seznamu přání'); // TOAST
                }
            } else {
                error(data.message); // TOAST
            }
        } catch (err) {
            error('Chyba při úpravě seznamu přání'); // TOAST
        } finally {
            setIsTogglingWishlist(false);
        }
    };

    const handlePurchase = async () => {
        if (!user) {
            warning('Pro nákup se musíte přihlásit'); // TOAST
            navigate('/login');
            return;
        }

        if (user.tokens_balance < game.price_tokens) {
            error('Nemáte dostatek tokenů pro nákup této hry'); // TOAST
            return;
        }

        if (!window.confirm(`Opravdu chcete koupit hru "${game.name}" za ${game.price_tokens} tokenů?`)) {
            return;
        }

        setIsPurchasing(true);
        setGameError(null);

        try {
            const response = await fetch(`${API_BASE_URL}/api/purchase_game.php`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ game_id: game.game_id })
            });
            const data = await response.json();
            if (data.success) {
                updateUserTokens(data.new_balance);
                success('Hra byla úspěšně zakoupena! Přesměrovávám do knihovny...'); // TOAST
                setTimeout(() => {
                    navigate('/library');
                }, 2000);
            } else {
                throw new Error(data.message || 'Nákup se nezdařil.');
            }
        } catch (err) {
            error(`Chyba při nákupu: ${err.message}`); // TOAST
        } finally {
            setIsPurchasing(false);
        }
    };

    if (loading) {
        return (
            <div className="d-flex justify-content-center align-items-center" style={{
                height: '60vh',
                background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)'
            }}>
                <div className="text-center">
                    <div className="spinner-border text-primary mb-3" style={{ width: '3rem', height: '3rem' }} />
                    <div className="h5 text-white">Načítání detailu hry...</div>
                </div>
            </div>
        );
    }

    if (gameError) {
        return (
            <div style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)', minHeight: '100vh' }}>
                <div className="container py-5">
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
            <div style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)', minHeight: '100vh' }}>
                <div className="container py-5">
                    <div className="alert alert-warning">
                        <i className="fas fa-search me-2"></i>
                        Hra nenalezena.
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%)', minHeight: '100vh' }}>

            {/* Hero Section */}
            <section className="position-relative overflow-hidden">
                <div
                    className="position-absolute w-100 h-100 top-0 start-0"
                    style={{
                        backgroundImage: `linear-gradient(135deg, rgba(15, 23, 42, 0.8), rgba(30, 41, 59, 0.9)), url(${game.image_url})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        filter: 'blur(1px)'
                    }}
                />

                <div className="container position-relative py-5">

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
                                    <span className="badge bg-success px-3 py-2 me-3" style={{ fontSize: '1rem' }}>
                                        <i className="fas fa-check me-2"></i>Vlastněno
                                    </span>
                                )}
                                {inWishlist && !isOwned && (
                                    <span className="badge bg-danger px-3 py-2 me-3" style={{ fontSize: '1rem' }}>
                                        <i className="fas fa-heart me-2"></i>V seznamu přání
                                    </span>
                                )}
                                <span className="badge bg-primary px-3 py-2" style={{ fontSize: '1rem' }}>
                                    {game.publisher_name || 'Neznámý vydavatel'}
                                </span>
                            </div>

                            <h1 className="display-4 fw-bold text-white mb-3" style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.5)' }}>
                                {game.name}
                            </h1>

                            <p className="lead text-white-50 mb-4">
                                <i className="fas fa-calendar me-2"></i>
                                Vydáno: {game.release_date || 'Neuvedeno'}
                            </p>
                        </div>

                        <div className="col-lg-4 text-end">
                            <div className="text-white mb-3">
                                <div className="h2 fw-bold mb-1" style={{ color: '#10b981' }}>
                                    {game.price_tokens || 0} 🪙
                                </div>
                                <small className="text-white-50">Cena ve tokenech</small>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Main Content */}
            <div className="container py-5">
                <div className="row g-5">

                    {/* Left Column */}
                    <div className="col-lg-5">
                        <div className="sticky-top" style={{ top: '2rem' }}>
                            <div
                                className="rounded-4 overflow-hidden mb-4 shadow-strong position-relative"
                                style={{ border: '1px solid rgba(255,255,255,0.1)' }}
                            >
                                <img
                                    src={game.image_url}
                                    className="w-100"
                                    alt={game.name}
                                    style={{ height: '400px', objectFit: 'cover' }}
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
                                                className="badge text-decoration-none px-3 py-2"
                                                style={{
                                                    background: 'linear-gradient(45deg, #4f46e5, #7c3aed)',
                                                    fontSize: '0.9rem',
                                                    borderRadius: '20px'
                                                }}
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
                        <div
                            className="rounded-3 p-4 mb-4"
                            style={{
                                background: 'rgba(255,255,255,0.05)',
                                backdropFilter: 'blur(10px)',
                                border: '1px solid rgba(255,255,255,0.1)'
                            }}
                        >
                            <div className="d-flex justify-content-between align-items-center mb-3">
                                <h5 className="text-white fw-bold mb-0">Popis hry</h5>
                                <div className="d-flex gap-2">
                                    <button
                                        className={`btn btn-sm ${!showTranslated ? 'btn-primary' : 'btn-outline-light'}`}
                                        onClick={() => setShowTranslated(false)}
                                        style={{ borderRadius: '20px' }}
                                    >
                                        Originál
                                    </button>
                                    <button
                                        className={`btn btn-sm ${showTranslated ? 'btn-primary' : 'btn-outline-light'}`}
                                        onClick={() => setShowTranslated(true)}
                                        disabled={!translatedDescription || isTranslating}
                                        style={{ borderRadius: '20px' }}
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

                            <p className="text-white-50 mb-0" style={{ lineHeight: '1.7', fontSize: '1.05rem' }}>
                                {showTranslated && translatedDescription ?
                                    translatedDescription :
                                    (game.description || 'Popis hry není k dispozici.')
                                }
                            </p>
                        </div>

                        {/* Action Buttons */}
                        <div
                            className="rounded-3 p-4"
                            style={{
                                background: 'rgba(255,255,255,0.05)',
                                backdropFilter: 'blur(10px)',
                                border: '1px solid rgba(255,255,255,0.1)'
                            }}
                        >
                            {!user ? (
                                <div className="text-center">
                                    <p className="text-white-50 mb-3">Pro nákup nebo přidání do seznamu přání se musíte přihlásit</p>
                                    <div className="d-flex gap-3 justify-content-center">
                                        <Link
                                            to="/login"
                                            className="btn btn-primary btn-lg px-4"
                                            style={{ borderRadius: '50px' }}
                                        >
                                            <i className="fas fa-sign-in-alt me-2"></i>
                                            Přihlásit se
                                        </Link>
                                        <Link
                                            to="/register"
                                            className="btn btn-outline-light btn-lg px-4"
                                            style={{ borderRadius: '50px' }}
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
                                        className="btn btn-success btn-lg px-5"
                                        style={{ borderRadius: '50px' }}
                                    >
                                        <i className="fas fa-book me-2"></i>
                                        Přejít do knihovny
                                    </Link>
                                </div>
                            ) : (
                                <div>
                                    <div className="d-flex gap-3 mb-3">
                                        <button
                                            className="btn btn-success btn-lg flex-fill"
                                            onClick={handlePurchase}
                                            disabled={isPurchasing || user.tokens_balance < game.price_tokens}
                                            style={{
                                                background: user.tokens_balance < game.price_tokens ?
                                                    '#6b7280' : 'linear-gradient(135deg, #10b981, #059669)',
                                                border: 'none',
                                                borderRadius: '50px',
                                                fontSize: '1.1rem',
                                                fontWeight: '600'
                                            }}
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
                                        className={`btn btn-lg w-100 ${inWishlist ? 'btn-danger' : 'btn-outline-light'}`}
                                        onClick={handleToggleWishlist}
                                        disabled={isTogglingWishlist}
                                        style={{ borderRadius: '50px', fontWeight: '600' }}
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
                                                        className="btn btn-warning btn-sm"
                                                        style={{ borderRadius: '20px' }}
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