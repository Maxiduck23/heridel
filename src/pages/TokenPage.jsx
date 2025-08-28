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
        <div style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%)', minHeight: '100vh' }}>

            {/* Hero Section */}
            <section className="position-relative py-5" style={{
                background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.2) 0%, rgba(217, 119, 6, 0.2) 100%)',
                borderBottom: '1px solid rgba(255,255,255,0.1)'
            }}>
                <div style={{
                    width: '100%',
                    maxWidth: '1200px',
                    margin: '0 auto',
                    paddingLeft: '15px',
                    paddingRight: '15px'
                }}>
                    <div className="text-center text-white">
                        <div className="mb-4" style={{ fontSize: '4rem' }}>🪙</div>
                        <h1 className="display-4 fw-bold mb-3" style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.3)' }}>
                            Tokenová ekonomika
                        </h1>
                        <p className="lead text-white-50 mb-2">
                            Doplňte si tokeny a získejte přístup k nejlepším hrám v našem katalogu
                        </p>
                        <div className="alert alert-info d-inline-block" style={{
                            background: 'rgba(59, 130, 246, 0.2)',
                            border: '1px solid rgba(59, 130, 246, 0.3)',
                            color: '#93c5fd',
                            fontSize: '0.9rem',
                            marginTop: '1rem'
                        }}>
                            <i className="fas fa-info-circle me-2"></i>
                            <strong>Demo režim:</strong> Platby jsou simulovány pro testovací účely
                        </div>

                        {user && (
                            <div
                                className="d-inline-flex align-items-center px-4 py-3 rounded-pill mt-3"
                                style={{
                                    background: 'rgba(16, 185, 129, 0.2)',
                                    border: '2px solid rgba(16, 185, 129, 0.3)'
                                }}
                            >
                                <span className="me-2" style={{ fontSize: '1.5rem' }}>🪙</span>
                                <div>
                                    <div className="fw-bold" style={{ color: '#10b981', fontSize: '1.2rem' }}>
                                        {Math.round(user.tokens_balance)} tokenů
                                    </div>
                                    <small className="text-white-50">Váš aktuální zůstatek</small>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </section>

            <div style={{
                width: '100%',
                maxWidth: '1200px',
                margin: '0 auto',
                padding: '3rem 15px'
            }}>

                {/* Token Packages */}
                <div className="row mb-5">
                    <div className="col-12">
                        <h3 className="text-white text-center fw-bold mb-5">Vyberte si tokenový balíček</h3>
                        <div className="row g-4">
                            {tokenPacks.map((pack, index) => (
                                <div key={pack.id} className="col-lg col-md-6 col-sm-6">
                                    <div
                                        className={`card h-100 border-0 position-relative overflow-hidden ${pack.popular ? 'border-warning' : ''}`}
                                        style={{
                                            background: pack.color,
                                            borderRadius: '20px',
                                            transition: 'all 0.4s ease',
                                            transform: pack.popular ? 'scale(1.02)' : 'scale(1)',
                                            boxShadow: pack.popular ? '0 15px 30px rgba(245, 158, 11, 0.3)' : '0 5px 15px rgba(0,0,0,0.1)',
                                            cursor: 'pointer',
                                            minHeight: '400px'
                                        }}
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.transform = pack.popular ? 'scale(1.05)' : 'scale(1.02)';
                                            e.currentTarget.style.boxShadow = '0 20px 40px rgba(0,0,0,0.3)';
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.transform = pack.popular ? 'scale(1.02)' : 'scale(1)';
                                            e.currentTarget.style.boxShadow = pack.popular ? '0 15px 30px rgba(245, 158, 11, 0.3)' : '0 5px 15px rgba(0,0,0,0.1)';
                                        }}
                                    >
                                        {pack.popular && (
                                            <div className="position-absolute top-0 start-50 translate-middle">
                                                <span
                                                    className="badge px-3 py-1"
                                                    style={{
                                                        background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                                                        fontSize: '0.8rem',
                                                        borderRadius: '20px'
                                                    }}
                                                >
                                                    ⭐ Nejpopulárnější
                                                </span>
                                            </div>
                                        )}

                                        {pack.bonus > 0 && (
                                            <div className="position-absolute top-0 end-0 p-3">
                                                <span
                                                    className="badge"
                                                    style={{
                                                        background: 'rgba(239, 68, 68, 0.9)',
                                                        fontSize: '0.7rem',
                                                        borderRadius: '15px'
                                                    }}
                                                >
                                                    +{pack.bonus} BONUS
                                                </span>
                                            </div>
                                        )}

                                        <div className="card-body text-center p-3 p-md-4 d-flex flex-column justify-content-between">
                                            <div>
                                                <div className="mb-3" style={{ fontSize: '2.5rem' }}>🪙</div>

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
                                                className="btn btn-light btn-lg w-100 fw-bold"
                                                onClick={() => setSelectedPack(pack)}
                                                style={{
                                                    borderRadius: '50px',
                                                    background: 'rgba(255, 255, 255, 0.9)',
                                                    color: '#1e293b',
                                                    border: 'none',
                                                    transition: 'all 0.3s ease',
                                                    fontSize: '0.9rem',
                                                    padding: '0.75rem 1rem'
                                                }}
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
                        className="modal-backdrop fade show"
                        style={{ zIndex: 1040 }}
                        onClick={() => !isProcessing && setSelectedPack(null)}
                    />
                    <div
                        className="modal fade show d-block"
                        style={{ zIndex: 1050 }}
                        onClick={() => !isProcessing && setSelectedPack(null)}
                    >
                        <div className="modal-dialog modal-dialog-centered" style={{ maxWidth: '600px', margin: '1rem' }} onClick={(e) => e.stopPropagation()}>
                            <div
                                className="modal-content border-0"
                                style={{
                                    background: 'rgba(30, 41, 59, 0.95)',
                                    backdropFilter: 'blur(20px)',
                                    borderRadius: '20px'
                                }}
                            >
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
                                            <div className="mb-4" style={{ fontSize: '3rem' }}>🔐</div>
                                            <h5 className="text-white mb-3">Přihlášení vyžadováno</h5>
                                            <p className="text-white-50 mb-4">
                                                Pro nákup tokenů se musíte přihlásit do svého účtu
                                            </p>
                                            <div className="d-flex flex-column flex-sm-row gap-3 justify-content-center">
                                                <Link
                                                    to="/login"
                                                    className="btn btn-primary px-4"
                                                    onClick={() => setSelectedPack(null)}
                                                    style={{ textDecoration: 'none' }}
                                                >
                                                    Přihlásit se
                                                </Link>
                                                <Link
                                                    to="/register"
                                                    className="btn btn-outline-light px-4"
                                                    onClick={() => setSelectedPack(null)}
                                                    style={{ textDecoration: 'none' }}
                                                >
                                                    Registrovat
                                                </Link>
                                            </div>
                                        </div>
                                    ) : isProcessing ? (
                                        // Zpracování platby
                                        <div className="text-center py-4">
                                            <div className="mb-4">
                                                <div className="spinner-border text-success mb-3" style={{ width: '3rem', height: '3rem' }} />
                                            </div>
                                            <h5 className="text-white mb-3">Zpracovávám platbu...</h5>
                                            <p className="text-white-50 mb-3">
                                                Simulujeme bezpečné zpracování vaší {paymentMethod === 'card' ? 'kartové' :
                                                    paymentMethod === 'paypal' ? 'PayPal' :
                                                        paymentMethod === 'googlepay' ? 'Google Pay' :
                                                            paymentMethod === 'applepay' ? 'Apple Pay' : 'bankovní'} platby
                                            </p>
                                            <div
                                                className="p-3 rounded-3"
                                                style={{
                                                    background: selectedPack.color,
                                                    border: '1px solid rgba(255,255,255,0.2)'
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
                                                    className="p-3 p-md-4 rounded-3"
                                                    style={{
                                                        background: selectedPack.color,
                                                        border: '1px solid rgba(255,255,255,0.2)'
                                                    }}
                                                >
                                                    <div className="text-center text-white">
                                                        <div className="mb-2" style={{ fontSize: '2rem' }}>🪙</div>
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
                                                                className="flex-grow-1 p-2 p-md-3 rounded-2 cursor-pointer"
                                                                style={{
                                                                    background: paymentMethod === method.id
                                                                        ? 'rgba(79, 70, 229, 0.2)'
                                                                        : 'rgba(255,255,255,0.05)',
                                                                    border: paymentMethod === method.id
                                                                        ? '2px solid #4f46e5'
                                                                        : '1px solid rgba(255,255,255,0.1)'
                                                                }}
                                                            >
                                                                <div className="d-flex align-items-center">
                                                                    <span className="me-2" style={{ fontSize: '1.2rem' }}>
                                                                        {method.icon}
                                                                    </span>
                                                                    <div className="flex-grow-1">
                                                                        <div className="text-white fw-medium" style={{ fontSize: '0.9rem' }}>
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
                                                className="btn btn-success flex-sm-fill"
                                                onClick={() => handlePurchase(selectedPack)}
                                                disabled={isProcessing}
                                                style={{
                                                    background: 'linear-gradient(135deg, #10b981, #059669)',
                                                    border: 'none'
                                                }}
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