import React, { useState } from 'react';
import { useUser } from '../context/UserContext';
import { useToast } from '../components/ui/Toast';
import { Link } from 'react-router-dom';

const TokenPage = () => {
    const { user, updateUserTokens } = useUser();
    const { success, error, warning } = useToast();
    const [selectedPack, setSelectedPack] = useState(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState('card');

    const API_BASE_URL = '/api';

    const tokenPacks = [
        {
            id: 1,
            amount: 100,
            price: 25,
            currency: 'Kč',
            bonus: 0,
            popular: false,
            description: 'Starter balíček pro nové hráče',
            color: 'linear-gradient(135deg, #64748b, #475569)'
        },
        {
            id: 2,
            amount: 500,
            price: 120,
            currency: 'Kč',
            bonus: 50,
            popular: false,
            description: 'Skvělý poměr ceny a výkonu',
            color: 'linear-gradient(135deg, #3b82f6, #1d4ed8)'
        },
        {
            id: 3,
            amount: 1000,
            price: 220,
            currency: 'Kč',
            bonus: 200,
            popular: true,
            description: 'Nejpopulárnější balíček',
            color: 'linear-gradient(135deg, #10b981, #059669)'
        },
        {
            id: 4,
            amount: 2500,
            price: 500,
            currency: 'Kč',
            bonus: 750,
            popular: false,
            description: 'Pro náročné hráče',
            color: 'linear-gradient(135deg, #f59e0b, #d97706)'
        },
        {
            id: 5,
            amount: 5000,
            price: 900,
            currency: 'Kč',
            bonus: 2000,
            popular: false,
            description: 'Ultimátní herní zážitek',
            color: 'linear-gradient(135deg, #8b5cf6, #7c3aed)'
        }
    ];

    const paymentMethods = [
        { id: 'card', name: 'Testovací karta', icon: '💳', description: 'Simulace platební karty' },
        { id: 'paypal', name: 'Demo PayPal', icon: '🅿️', description: 'Simulace PayPal platby' },
        { id: 'googlepay', name: 'Test Google Pay', icon: '📱', description: 'Simulace mobilní platby' },
        { id: 'applepay', name: 'Test Apple Pay', icon: '🍎', description: 'Simulace Apple platby' },
        { id: 'bank', name: 'Demo převod', icon: '🏦', description: 'Simulace bankovního převodu' }
    ];

    // ZJEDNODUŠENÝ NÁKUP - automatické zpracování
    const handlePurchase = async (pack) => {
        if (!user) {
            warning('Pro nákup tokenů se musíte přihlásit');
            return;
        }

        setIsProcessing(true);

        // Simulace zpracování platby s realistickým zpožděním
        setTimeout(async () => {
            try {
                const response = await fetch(`${API_BASE_URL}/purchase_token.php`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    credentials: 'include',
                    body: JSON.stringify({
                        pack_id: pack.id,
                        payment_method: paymentMethod
                    })
                });

                const data = await response.json();

                if (data.success) {
                    updateUserTokens(data.new_balance);
                    success(`Úspěšně zakoupeno ${data.tokens_purchased} tokenů! Váš nový zůstatek: ${data.new_balance} tokenů`);
                    setSelectedPack(null);
                } else {
                    throw new Error(data.message || 'Nákup se nezdařil');
                }
            } catch (apiError) {
                console.error('Chyba při nákupu tokenů:', apiError);
                error(`Chyba při nákupu: ${apiError.message}`);
            } finally {
                setIsProcessing(false);
            }
        }, 2000); // 2 sekundové zpoždění pro realističnost
    };

    const calculateSavings = (pack) => {
        const basePrice = 0.25; // 25 haléřů za token
        const normalPrice = pack.amount * basePrice;
        const actualPrice = pack.price;
        const savings = ((normalPrice - actualPrice) / normalPrice) * 100;
        return Math.round(savings);
    };

    return (
        <div className="token-page-bg min-vh-100">

            {/* Hero Section */}
            <section className="position-relative py-5 token-page-hero">
                <div className="container-custom">
                    <div className="text-center text-white">
                        <div className="mb-4 token-page-hero-icon">🪙</div>
                        <h1 className="display-4 fw-bold mb-3 token-page-hero-title">
                            Tokenová ekonomika
                        </h1>
                        <p className="lead text-white-50 mb-2">
                            Doplňte si tokeny a získejte přístup k nejlepším hrám v našem katalogu
                        </p>
                        <div className="alert alert-info d-inline-block token-page-demo-alert">
                            <i className="fas fa-info-circle me-2"></i>
                            <strong>Demo režim:</strong> Platby jsou simulovány pro testovací účely
                        </div>

                        {user && (
                            <div className="token-page-balance-display d-inline-flex align-items-center px-4 py-3 rounded-pill mt-3">
                                <span className="me-2 token-page-balance-icon">🪙</span>
                                <div>
                                    <div className="fw-bold token-page-balance-amount">
                                        {Math.round(user.tokens_balance)} tokenů
                                    </div>
                                    <small className="text-white-50">Váš aktuální zůstatek</small>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </section>

            <div className="container-custom token-page-content">

                {/* Token Packages */}
                <div className="row mb-5">
                    <div className="col-12">
                        <h3 className="text-white text-center fw-bold mb-5">Vyberte si tokenový balíček</h3>
                        <div className="row g-4">
                            {tokenPacks.map((pack, index) => (
                                <div key={pack.id} className="col-lg col-md-6 col-sm-6">
                                    <div
                                        className={`card h-100 border-0 position-relative overflow-hidden token-pack-card ${pack.popular ? 'token-pack-popular' : ''}`}
                                        style={{
                                            background: pack.color,
                                            transform: pack.popular ? 'scale(1.02)' : 'scale(1)',
                                            minHeight: '400px'
                                        }}
                                    >
                                        {pack.popular && (
                                            <div className="position-absolute top-0 start-50 translate-middle">
                                                <span className="badge token-pack-popular-badge px-3 py-1">
                                                    ⭐ Nejpopulárnější
                                                </span>
                                            </div>
                                        )}

                                        {pack.bonus > 0 && (
                                            <div className="position-absolute top-0 end-0 p-3">
                                                <span className="badge token-pack-bonus-badge">
                                                    +{pack.bonus} BONUS
                                                </span>
                                            </div>
                                        )}

                                        <div className="card-body text-center p-3 p-md-4 d-flex flex-column justify-content-between">
                                            <div>
                                                <div className="mb-3 token-pack-icon">🪙</div>

                                                <div className="mb-3">
                                                    <div className="h3 h2-md fw-bold text-white mb-1">
                                                        {pack.amount.toLocaleString()}
                                                    </div>
                                                    {pack.bonus > 0 && (
                                                        <div className="small text-warning fw-bold">
                                                            + {pack.bonus.toLocaleString()} bonusových
                                                        </div>
                                                    )}
                                                    <div className="small text-white-50 mt-1">
                                                        Celkem: {(pack.amount + pack.bonus).toLocaleString()} tokenů
                                                    </div>
                                                </div>

                                                <div className="mb-3">
                                                    <div className="h4 h3-md fw-bold text-white">
                                                        {pack.price} {pack.currency}
                                                    </div>
                                                    {calculateSavings(pack) > 0 && (
                                                        <div className="small text-success">
                                                            Ušetříte {calculateSavings(pack)}%
                                                        </div>
                                                    )}
                                                </div>

                                                <p className="small text-white-50 mb-3 d-none d-md-block">
                                                    {pack.description}
                                                </p>
                                            </div>

                                            <button
                                                className="btn btn-light btn-lg w-100 fw-bold token-pack-buy-btn"
                                                onClick={() => setSelectedPack(pack)}
                                            >
                                                Koupit nyní
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* ZJEDNODUŠENÝ PAYMENT MODAL */}
            {selectedPack && (
                <>
                    <div
                        className="modal-backdrop fade show token-modal-backdrop"
                        onClick={() => !isProcessing && setSelectedPack(null)}
                    />
                    <div
                        className="modal fade show d-block token-modal"
                        onClick={() => !isProcessing && setSelectedPack(null)}
                    >
                        <div className="modal-dialog modal-dialog-centered token-modal-dialog" onClick={(e) => e.stopPropagation()}>
                            <div className="modal-content border-0 token-modal-content">
                                <div className="modal-header border-0 pb-0">
                                    <h5 className="modal-title text-white fw-bold">
                                        {isProcessing ? 'Zpracování platby...' : 'Dokončení nákupu'}
                                    </h5>
                                    <button
                                        type="button"
                                        className="btn-close btn-close-white"
                                        onClick={() => !isProcessing && setSelectedPack(null)}
                                        disabled={isProcessing}
                                    />
                                </div>

                                <div className="modal-body p-3 p-md-4">
                                    {!user ? (
                                        <div className="text-center">
                                            <div className="mb-4 token-modal-auth-icon">🔐</div>
                                            <h5 className="text-white mb-3">Přihlášení vyžadováno</h5>
                                            <p className="text-white-50 mb-4">
                                                Pro nákup tokenů se musíte přihlásit do svého účtu
                                            </p>
                                            <div className="d-flex flex-column flex-sm-row gap-3 justify-content-center">
                                                <Link
                                                    to="/login"
                                                    className="btn btn-primary px-4 text-decoration-none"
                                                    onClick={() => setSelectedPack(null)}
                                                >
                                                    Přihlásit se
                                                </Link>
                                                <Link
                                                    to="/register"
                                                    className="btn btn-outline-light px-4 text-decoration-none"
                                                    onClick={() => setSelectedPack(null)}
                                                >
                                                    Registrovat
                                                </Link>
                                            </div>
                                        </div>
                                    ) : isProcessing ? (
                                        // Zpracování platby
                                        <div className="text-center py-4">
                                            <div className="mb-4">
                                                <div className="spinner-border text-success mb-3 token-modal-spinner" />
                                            </div>
                                            <h5 className="text-white mb-3">Zpracovávám platbu...</h5>
                                            <p className="text-white-50 mb-3">
                                                Simulujeme bezpečné zpracování vaší {paymentMethod === 'card' ? 'kartové' :
                                                    paymentMethod === 'paypal' ? 'PayPal' :
                                                        paymentMethod === 'googlepay' ? 'Google Pay' :
                                                            paymentMethod === 'applepay' ? 'Apple Pay' : 'bankovní'} platby
                                            </p>
                                            <div
                                                className="p-3 rounded-3 token-modal-processing-card"
                                                style={{
                                                    background: selectedPack.color,
                                                }}
                                            >
                                                <div className="text-white">
                                                    <div className="fw-bold">{selectedPack.amount + selectedPack.bonus} tokenů</div>
                                                    <div>{selectedPack.price} {selectedPack.currency}</div>
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="row g-4">
                                            {/* Order Summary */}
                                            <div className="col-md-6 col-12">
                                                <h6 className="text-white fw-bold mb-3">Shrnutí objednávky</h6>
                                                <div
                                                    className="p-3 p-md-4 rounded-3 token-modal-summary-card"
                                                    style={{
                                                        background: selectedPack.color,
                                                    }}
                                                >
                                                    <div className="text-center text-white">
                                                        <div className="mb-2 token-modal-summary-icon">🪙</div>
                                                        <div className="h5 h4-md fw-bold">{selectedPack.amount.toLocaleString()} tokenů</div>
                                                        {selectedPack.bonus > 0 && (
                                                            <div className="small text-warning fw-bold mb-2">
                                                                + {selectedPack.bonus.toLocaleString()} bonusových
                                                            </div>
                                                        )}
                                                        <div className="h5 h4-md fw-bold">
                                                            {selectedPack.price} {selectedPack.currency}
                                                        </div>
                                                        <div className="small mt-2">
                                                            Celkem: {(selectedPack.amount + selectedPack.bonus).toLocaleString()} tokenů
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Payment Methods */}
                                            <div className="col-md-6 col-12">
                                                <h6 className="text-white fw-bold mb-3">Testovací platební metody</h6>
                                                <div className="d-grid gap-2">
                                                    {paymentMethods.map(method => (
                                                        <label key={method.id} className="d-flex align-items-center">
                                                            <input
                                                                type="radio"
                                                                name="payment"
                                                                value={method.id}
                                                                checked={paymentMethod === method.id}
                                                                onChange={(e) => setPaymentMethod(e.target.value)}
                                                                className="me-3"
                                                                disabled={isProcessing}
                                                            />
                                                            <div
                                                                className={`flex-grow-1 p-2 p-md-3 rounded-2 cursor-pointer token-payment-method ${paymentMethod === method.id ? 'token-payment-method-active' : ''
                                                                    }`}
                                                            >
                                                                <div className="d-flex align-items-center">
                                                                    <span className="me-2 token-payment-icon">
                                                                        {method.icon}
                                                                    </span>
                                                                    <div className="flex-grow-1">
                                                                        <div className="text-white fw-medium token-payment-name">
                                                                            {method.name}
                                                                        </div>
                                                                        <small className="text-white-50 d-none d-md-block">
                                                                            {method.description}
                                                                        </small>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </label>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {user && !isProcessing && (
                                    <div className="modal-footer border-0 pt-0 px-3 px-md-4">
                                        <div className="w-100 d-flex flex-column flex-sm-row gap-2">
                                            <button
                                                className="btn btn-secondary flex-sm-fill"
                                                onClick={() => setSelectedPack(null)}
                                                disabled={isProcessing}
                                            >
                                                Zrušit
                                            </button>
                                            <button
                                                className="btn btn-success flex-sm-fill token-modal-pay-btn"
                                                onClick={() => handlePurchase(selectedPack)}
                                                disabled={isProcessing}
                                            >
                                                <i className="fas fa-credit-card me-2"></i>
                                                Simulovat platbu {selectedPack.price} {selectedPack.currency}
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default TokenPage;