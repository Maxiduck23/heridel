import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { useToast } from '../components/ui/Toast';

const UserLibraryPage = () => {
    const [games, setGames] = useState([]);
    const [wishlistGames, setWishlistGames] = useState([]);
    const [filteredGames, setFilteredGames] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [sortBy, setSortBy] = useState('recent');
    const [filterBy, setFilterBy] = useState('owned');
    const [selectedGame, setSelectedGame] = useState(null);
    const [showKeyModal, setShowKeyModal] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [copiedKey, setCopiedKey] = useState(false);

    const { user } = useUser();
    const { success, error: showError } = useToast();
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
        const fetchLibrary = async () => {
            if (!user) {
                setLoading(false);
                return;
            }

            try {
                setError(null);
                setLoading(true);

                // Načíst vlastněné hry
                const response = await fetch(`${API_BASE_URL}/library.php`, {
                    credentials: 'include'
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.message || 'Chyba při komunikaci se serverem.');
                }

                const data = await response.json();

                if (data.success) {
                    setGames(data.data || []);
                } else {
                    throw new Error(data.message || 'Nepodařilo se načíst data knihovny.');
                }

                // Načíst oblíbené hry (wishlist)
                const wishlistResponse = await fetch(`${API_BASE_URL}/games.php`, {
                    credentials: 'include'
                });

                if (wishlistResponse.ok) {
                    const wishlistData = await wishlistResponse.json();
                    if (wishlistData.success) {
                        const wishlistOnly = wishlistData.data.filter(game =>
                            game.in_wishlist && !game.is_owned
                        );
                        setWishlistGames(wishlistOnly);
                    }
                }

            } catch (e) {
                setError(e.message);
            } finally {
                setLoading(false);
            }
        };

        fetchLibrary();
    }, [user]);

    useEffect(() => {
        let dataToFilter = [];

        if (filterBy === 'owned') {
            dataToFilter = games;
        } else if (filterBy === 'wishlist') {
            dataToFilter = wishlistGames.map(game => ({
                game: game,
                purchase_date: null,
                last_accessed: null,
                is_wishlist: true
            }));
        }

        let filtered = dataToFilter.filter(item => {
            const gameName = filterBy === 'owned' ? item.game.name : item.game.name;
            return gameName.toLowerCase().includes(searchTerm.toLowerCase());
        });

        filtered.sort((a, b) => {
            switch (sortBy) {
                case 'recent':
                    if (filterBy === 'wishlist') {
                        return 0; // Pro wishlist není relevantní
                    }
                    return new Date(b.last_accessed || b.purchase_date) - new Date(a.last_accessed || a.purchase_date);
                case 'name':
                    const aName = filterBy === 'owned' ? a.game.name : a.game.name;
                    const bName = filterBy === 'owned' ? b.game.name : b.game.name;
                    return aName.localeCompare(bName);
                case 'price':
                    const aPrice = filterBy === 'owned' ? (a.game.price_tokens || 0) : (a.game.price_tokens || 0);
                    const bPrice = filterBy === 'owned' ? (b.game.price_tokens || 0) : (b.game.price_tokens || 0);
                    return bPrice - aPrice;
                default:
                    return 0;
            }
        });

        setFilteredGames(filtered);
    }, [games, wishlistGames, searchTerm, sortBy, filterBy]);

    // OPRAVENÉ KOPÍROVÁNÍ KLÍČE
    const copyGameKey = async (keyCode) => {
        try {
            // Zkusíme moderní Clipboard API
            if (navigator.clipboard && window.isSecureContext) {
                await navigator.clipboard.writeText(keyCode);
                setCopiedKey(true);
                success('Herní klíč byl zkopírován do schránky!');
                setTimeout(() => setCopiedKey(false), 2000);
                return;
            }

            // Fallback pre starší prohlížeče nebo nesecure context
            const textArea = document.createElement('textarea');
            textArea.value = keyCode;
            textArea.style.position = 'fixed';
            textArea.style.top = '0';
            textArea.style.left = '0';
            textArea.style.width = '2em';
            textArea.style.height = '2em';
            textArea.style.padding = '0';
            textArea.style.border = 'none';
            textArea.style.outline = 'none';
            textArea.style.boxShadow = 'none';
            textArea.style.background = 'transparent';
            textArea.style.opacity = '0';

            document.body.appendChild(textArea);
            textArea.focus();
            textArea.select();

            const successful = document.execCommand('copy');
            document.body.removeChild(textArea);

            if (successful) {
                setCopiedKey(true);
                success('Herní klíč byl zkopírován!');
                setTimeout(() => setCopiedKey(false), 2000);
            } else {
                throw new Error('Kopírování selhalo');
            }

        } catch (err) {
            console.error('Chyba při kopírování:', err);

            // Poslední fallback - prompt s klíčem
            const userAgent = navigator.userAgent.toLowerCase();
            if (userAgent.includes('mobile') || userAgent.includes('android') || userAgent.includes('iphone')) {
                // Na mobile zobrazíme klíč v alert
                alert(`Herní klíč (zkopírujte manuálně): ${keyCode}`);
            } else {
                // Na desktop použijeme prompt
                const textToCopy = prompt('Zkopírujte tento herní klíč:', keyCode);
                if (textToCopy !== null) {
                    success('Klíč byl zobrazen pro kopírování');
                }
            }
        }
    };

    const showGameKey = (game) => {
        setSelectedGame(game);
        setShowKeyModal(true);
        setCopiedKey(false); // Reset copied state
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('cs-CZ', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    };

    if (loading) {
        return (
            <div className="min-vh-100 d-flex align-items-center justify-content-center library-loading-bg">
                <div className="text-center">
                    <div className="spinner-border text-primary mb-3 library-spinner"></div>
                    <h5 className="library-loading-text">Načítání knihovny...</h5>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-vh-100 library-bg pt-4">
                <div className="container-custom">
                    <div className="alert alert-danger">
                        <h5>Chyba při načítání knihovny</h5>
                        <p className="mb-0">{error}</p>
                    </div>
                </div>
            </div>
        );
    }

    if (!user) {
        return (
            <div className="min-vh-100 d-flex align-items-center justify-content-center library-bg">
                <div className="text-center">
                    <h3 className="library-no-user-text">Pro zobrazení knihovny se musíte přihlásit</h3>
                    <Link to="/login" className="btn btn-primary mt-3">Přihlásit se</Link>
                </div>
            </div>
        );
    }

    const totalOwnedGames = games.length;
    const totalWishlistGames = wishlistGames.length;

    return (
        <div className="min-vh-100 library-bg library-page-padding">
            <div className="container-custom">

                {/* Header */}
                <div className="row mb-4">
                    <div className="col-12">
                        <div className="library-header-card rounded-4 p-4 bg-dark border border-secondary">
                            <div className="row align-items-center">
                                <div className="col-md-8">
                                    <div className="d-flex align-items-center mb-2">
                                        <span className="library-header-icon me-3">📚</span>
                                        <div>
                                            <h1 className="library-title mb-1">
                                                Moje knihovna
                                            </h1>
                                            <p className="library-subtitle mb-0">
                                                Správa vaší herní kolekce
                                            </p>
                                        </div>
                                    </div>
                                </div>
                                <div className="col-md-4">
                                    <div className="row text-center">
                                        <div className="col-6">
                                            <div className="library-stat-owned">
                                                {totalOwnedGames}
                                            </div>
                                            <small className="library-stat-label">Vlastněných her</small>
                                        </div>
                                        <div className="col-6">
                                            <div className="library-stat-wishlist">
                                                {totalWishlistGames}
                                            </div>
                                            <small className="library-stat-label">V seznamu přání</small>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* FILTRY */}
                <div className="row mb-4">
                    <div className="col-12">
                        <div className="library-filters-card rounded-3 p-4 bg-dark border border-secondary">
                            <div className="row g-3 align-items-center">
                                <div className="col-12 col-md-4">
                                    <input
                                        type="text"
                                        className="form-control library-search-input"
                                        placeholder="🔍 Hledat hry..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                </div>
                                <div className="col-12 col-sm-6 col-md-3">
                                    <select
                                        className="form-select library-filter-select"
                                        value={filterBy}
                                        onChange={(e) => setFilterBy(e.target.value)}
                                    >
                                        <option value="owned">📚 Vlastněné hry ({totalOwnedGames})</option>
                                        <option value="wishlist">❤️ Seznam přání ({totalWishlistGames})</option>
                                    </select>
                                </div>
                                <div className="col-12 col-sm-6 col-md-3">
                                    <select
                                        className="form-select library-sort-select"
                                        value={sortBy}
                                        onChange={(e) => setSortBy(e.target.value)}
                                    >
                                        <option value="recent">📅 Podle data</option>
                                        <option value="name">🔤 Podle názvu</option>
                                        <option value="price">💰 Podle ceny</option>
                                    </select>
                                </div>
                                <div className="col-12 col-md-2">
                                    <div className="text-center library-count-display">
                                        <strong className="text-white">{filteredGames.length}</strong>
                                        <br />
                                        <small>
                                            {filterBy === 'owned' ? 'vlastněných' : 'v přáních'}
                                        </small>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Seznam her */}
                <div className="row">
                    {filteredGames.length === 0 && !loading ? (
                        <div className="col-12">
                            <div className="library-empty-state rounded-3 p-5 text-center bg-dark border border-secondary">
                                <div className="library-empty-icon mb-3">
                                    {filterBy === 'owned' ? '📚' : '❤️'}
                                </div>
                                <h3 className="library-empty-title mb-2">
                                    {filterBy === 'owned' ? 'Žádné vlastněné hry' : 'Prázdný seznam přání'}
                                </h3>
                                <p className="library-empty-text mb-4">
                                    {searchTerm ? 'Zkuste změnit vyhledávací kritéria' :
                                        filterBy === 'owned' ? 'Zatím jste si nezakoupili žádné hry' : 'Zatím jste si nepřidali žádné hry do seznamu přání'}
                                </p>
                                <Link
                                    to="/games"
                                    className="btn btn-primary px-4 py-2 library-browse-btn text-decoration-none"
                                >
                                    Prohlédnout hry
                                </Link>
                            </div>
                        </div>
                    ) : (
                        filteredGames.map((libraryGame, index) => (
                            <div key={libraryGame.is_wishlist ? `wish-${libraryGame.game.game_id}` : libraryGame.library_id} className="col-12 mb-3">
                                <div className="library-game-card rounded-3 overflow-hidden bg-dark border border-secondary">
                                    <div className="row g-0">
                                        {/* Obrázek hry */}
                                        <div className="col-md-3">
                                            <div
                                                className="library-game-image position-relative"
                                                style={{
                                                    backgroundImage: `url(${libraryGame.game.image_url})`,
                                                }}
                                            >
                                                <div className="position-absolute top-0 start-0 p-3">
                                                    <span className={`badge px-2 py-1 ${libraryGame.is_wishlist ? 'library-wishlist-badge' : 'library-owned-badge'}`}>
                                                        {libraryGame.is_wishlist ? '❤️ V přáních' : '📚 Vlastněno'}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Informace o hře */}
                                        <div className="col-md-6">
                                            <div className="p-4">
                                                <h5 className="library-game-title mb-3">
                                                    {libraryGame.game.name}
                                                </h5>

                                                <p className="library-game-description mb-3">
                                                    {libraryGame.game.description}
                                                </p>

                                                {libraryGame.game.genres && (
                                                    <div className="d-flex flex-wrap gap-2 mb-3">
                                                        {libraryGame.game.genres.slice(0, 3).map((genre, gIndex) => (
                                                            <span
                                                                key={gIndex}
                                                                className="library-genre-badge"
                                                            >
                                                                {genre.name || genre}
                                                            </span>
                                                        ))}
                                                        {libraryGame.game.genres.length > 3 && (
                                                            <span className="library-genre-more-badge">
                                                                +{libraryGame.game.genres.length - 3}
                                                            </span>
                                                        )}
                                                    </div>
                                                )}

                                                {!libraryGame.is_wishlist && (
                                                    <div className="mb-3">
                                                        <div className="library-purchase-info">
                                                            🛒 Zakoupeno: {formatDate(libraryGame.purchase_date)}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* Akce */}
                                        <div className="col-md-3">
                                            <div className="p-4">
                                                <div className="mb-3 text-center">
                                                    <div className="library-price-display">
                                                        {libraryGame.game.price_tokens || 0} 🪙
                                                    </div>
                                                    <small className="library-price-label">Hodnota</small>
                                                </div>

                                                {!libraryGame.is_wishlist ? (
                                                    // Vlastněná hra
                                                    <div className="d-grid gap-2">
                                                        <button
                                                            className="btn library-show-key-btn"
                                                            onClick={() => showGameKey(libraryGame)}
                                                        >
                                                            🗝️ Zobrazit klíč
                                                        </button>

                                                        <Link
                                                            to={`/game/${libraryGame.game.slug || createSlug(libraryGame.game.name)}`}
                                                            className="btn library-detail-btn text-decoration-none"
                                                        >
                                                            👁️ Detail hry
                                                        </Link>
                                                    </div>
                                                ) : (
                                                    // Hra v seznamu přání - POUŽÍT SLUG ODKAZ
                                                    <Link
                                                        to={`/game/${libraryGame.game.slug || createSlug(libraryGame.game.name)}`}
                                                        className="btn w-100 library-buy-btn text-decoration-none"
                                                    >
                                                        🛒 Koupit hru
                                                    </Link>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* MODAL pre zobrazenie klíča */}
                {showKeyModal && selectedGame && (
                    <>
                        <div
                            className="library-modal-backdrop"
                            onClick={() => setShowKeyModal(false)}
                        >
                            <div
                                className="library-key-modal bg-dark border border-secondary"
                                onClick={(e) => e.stopPropagation()}
                            >
                                <div className="text-center mb-4">
                                    <div className="library-key-modal-icon mb-3">🗝️</div>
                                    <h3 className="text-white mb-2">
                                        Herní klíč
                                    </h3>
                                    <p className="library-key-modal-subtitle mb-0">
                                        {selectedGame.game.name}
                                    </p>
                                </div>

                                <div className="library-key-container mb-4">
                                    <div className="library-key-code">
                                        {selectedGame.key_code}
                                    </div>
                                </div>

                                <div className="alert alert-warning mb-3 library-key-warning">
                                    ⚠️ <strong>Pozor:</strong> Klíč si uložte na bezpečné místo.
                                    Tento klíč je určen pouze pro vás.
                                </div>

                                <div className="d-flex gap-2">
                                    <button
                                        className={`btn flex-fill ${copiedKey ? 'library-key-copied-btn' : 'library-key-copy-btn'}`}
                                        onClick={() => copyGameKey(selectedGame.key_code)}
                                    >
                                        {copiedKey ? '✅ Zkopírováno!' : '📋 Kopírovat klíč'}
                                    </button>
                                    <button
                                        className="btn flex-fill library-key-close-btn"
                                        onClick={() => setShowKeyModal(false)}
                                    >
                                        Zavřít
                                    </button>
                                </div>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default UserLibraryPage;