import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';

const GameDetailPage = () => {
    const { gameId } = useParams();
    const navigate = useNavigate();
    const { user, updateUserTokens } = useUser();

    const [game, setGame] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [translatedDescription, setTranslatedDescription] = useState('');
    const [isTranslating, setIsTranslating] = useState(false);
    const [isPurchasing, setIsPurchasing] = useState(false);
    const [purchaseMessage, setPurchaseMessage] = useState('');

    // Stavy pro wishlist a vlastnictví
    const [inWishlist, setInWishlist] = useState(false);
    const [isTogglingWishlist, setIsTogglingWishlist] = useState(false);
    const [isOwned, setIsOwned] = useState(false);

    const API_BASE_URL = 'http://heridel.wz.cz';

    const translateText = async (textToTranslate) => {
        if (!textToTranslate) return;
        setIsTranslating(true);
        try {
            const response = await fetch(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(textToTranslate)}&langpair=en|cs`);
            const data = await response.json();
            if (data.responseData && data.responseData.translatedText) {
                setTranslatedDescription(data.responseData.translatedText);
            } else {
                setTranslatedDescription(textToTranslate);
            }
        } catch (error) {
            console.error("Translation error:", error);
            setTranslatedDescription(textToTranslate);
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
                    translateText(data.data.description);
                } else {
                    throw new Error(data.message);
                }
            } catch (error) {
                setError(error.message);
            } finally {
                setLoading(false);
            }
        };
        fetchGame();
    }, [gameId, user]);

    const handleToggleWishlist = async () => {
        if (!user) {
            alert('Pro tuto akci se musíte přihlásit.');
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
            } else {
                alert(data.message);
            }
        } catch (err) {
            alert('Chyba komunikace se serverem.');
        } finally {
            setIsTogglingWishlist(false);
        }
    };

    const handlePurchase = async () => {
        if (!user) {
            alert('Pro nákup se musíte přihlásit.');
            navigate('/login');
            return;
        }
        if (!window.confirm(`Opravdu chcete koupit hru "${game.name}" za ${game.price_tokens} tokenů?`)) {
            return;
        }
        setIsPurchasing(true);
        setPurchaseMessage('');
        setError(null);
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
                setPurchaseMessage('Nákup proběhl úspěšně! Přesměrovávám do knihovny...');
                setTimeout(() => {
                    navigate('/library');
                }, 2000);
            } else {
                throw new Error(data.message || 'Nákup se nezdařil.');
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setIsPurchasing(false);
        }
    };

    if (loading) return <div className="text-center p-5">Načítání...</div>;
    if (error) return <div className="alert alert-danger">Chyba: {error}</div>;
    if (!game) return <div className="alert alert-warning">Hra nenalezena.</div>;

    return (
        <div className="card">
            <div className="row g-0">
                <div className="col-md-4">
                    <img src={game.image_url} className="img-fluid rounded-start" alt={game.name} />
                </div>
                <div className="col-md-8">
                    <div className="card-body">
                        <h1 className="card-title">{game.name}</h1>
                        <p className="card-text"><small className="text-muted">Vydavatel: {game.publisher_name || 'Neznámý'}</small></p>
                        <p className="card-text">
                            {isTranslating ? 'Překládání...' : (translatedDescription || game.description)}
                        </p>
                        <div>
                            {game.genres && game.genres.map(genre => (
                                <span key={genre} className="badge bg-primary me-1">{genre}</span>
                            ))}
                        </div>
                        <div className="mt-4">
                            {purchaseMessage ? (
                                <div className="alert alert-success">{purchaseMessage}</div>
                            ) : (
                                <>
                                    {isOwned ? (
                                        <button className="btn btn-info btn-lg" disabled>
                                            ✓ Vlastněno
                                        </button>
                                    ) : (
                                        <>
                                            <button
                                                className="btn btn-success btn-lg"
                                                onClick={handlePurchase}
                                                disabled={isPurchasing}
                                            >
                                                {isPurchasing ? 'Zpracovávám...' : `Koupit za ${game.price_tokens} tokenů`}
                                            </button>
                                            <button
                                                className={`btn btn-lg ms-2 ${inWishlist ? 'btn-secondary' : 'btn-outline-secondary'}`}
                                                onClick={handleToggleWishlist}
                                                disabled={isTogglingWishlist}
                                            >
                                                {isTogglingWishlist
                                                    ? 'Pracuji...'
                                                    : (inWishlist ? '✓ V seznamu přání' : 'Přidat do přání')
                                                }
                                            </button>
                                        </>
                                    )}
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default GameDetailPage;