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
            description: 'Starter balíček',
            gradient: 'linear-gradient(135deg, #6c757d, #495057)',
            icon: '🪙'
        },
        {
            id: 2,
            amount: 500,
            price: 120,
            currency: 'Kč',
            bonus: 50,
            popular: false,
            description: 'Skvělý poměr',
            gradient: 'linear-gradient(135deg, #6f42c1, #5a32a3)',
            icon: '💜'
        },
        {
            id: 3,
            amount: 1000,
            price: 220,
            currency: 'Kč',
            bonus: 200,
            popular: true,
            description: 'Nejoblíbenější',
            gradient: 'linear-gradient(135deg, #0d6efd, #084298)',
            icon: '⭐'
        },
        {
            id: 4,
            amount: 2500,
            price: 500,
            currency: 'Kč',
            bonus: 750,
            popular: false,
            description: 'Pro náročné',
            gradient: 'linear-gradient(135deg, #6610f2, #520dc2)',
            icon: '💎'
        },
        {
            id: 5,
            amount: 5000,
            price: 900,
            currency: 'Kč',
            bonus: 2000,
            popular: false,
            description: 'Ultimátní',
            gradient: 'linear-gradient(135deg, #6f42c1, #495057)',
            icon: '👑'
        }
    ];

    const paymentMethods = [
        { id: 'card', name: 'Platební karta', icon: '💳', color: '#0d6efd' },
        { id: 'paypal', name: 'PayPal', icon: '🟦', color: '#6f42c1' },
        { id: 'googlepay', name: 'Google Pay', icon: '📱', color: '#198754' },
        { id: 'applepay', name: 'Apple Pay', icon: '🍎', color: '#495057' }
    ];

    const handlePurchase = async (pack) => {
        if (!user) {
            warning('Pro nákup tokenů se musíte přihlásit');
            return;
        }

        setIsProcessing(true);

        setTimeout(async () => {
            try {
                const response = await fetch(`${API_BASE_URL}/purchase_token.php`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    credentials: 'include',
                    body: JSON.stringify({
                        pack_id: pack.id,
                        payment_method: paymentMethod
                    })
                });

                const data = await response.json();

                if (data.success) {
                    updateUserTokens(data.new_balance);
                    success(`Úspěšně zakoupeno ${data.tokens_purchased} tokenů!`);
                    setSelectedPack(null);
                } else {
                    throw new Error(data.message || 'Nákup se nezdařil');
                }
            } catch (apiError) {
                error(`Chyba při nákupu: ${apiError.message}`);
            } finally {
                setIsProcessing(false);
            }
        }, 2000);
    };

    const calculateSavings = (pack) => {
        const basePrice = 0.25;
        const normalPrice = pack.amount * basePrice;
        const savings = ((normalPrice - pack.price) / normalPrice) * 100;
        return Math.max(0, Math.round(savings));
    };

    return (
        <div style={{
            minHeight: '100vh',
            background: 'linear-gradient(135deg, #1a1f3a 0%, #2d3561 50%, #5a32a3 100%)'
        }}>
            {/* Hero Header */}
            <div className="container-fluid py-5">
                <div className="row justify-content-center">
                    <div className="col-lg-8 text-center text-white">
                        <div className="mb-4" style={{ fontSize: '4rem' }}>🪙</div>
                        <h1 className="display-4 fw-bold mb-3">Tokenová ekonomika</h1>
                        <p className="lead mb-4">
                            Doplňte si tokeny a získejte přístup k nejlepším hrám
                        </p>

                        {/* User Balance */}
                        {user && (
                            <div className="card mx-auto" style={{
                                maxWidth: '300px',
                                background: 'rgba(255, 255, 255, 0.1)',
                                backdropFilter: 'blur(10px)',
                                border: '1px solid rgba(255, 255, 255, 0.2)'
                            }}>
                                <div className="card-body text-center">
                                    <div style={{ fontSize: '2rem' }} className="mb-2">🏦</div>
                                    <h5 className="text-white mb-1">Váš zůstatek</h5>
                                    <div className="h3 text-success mb-0">
                                        {Math.round(user.tokens_balance)} tokenů
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Token Packages */}
            <div className="container py-5">
                <div className="row justify-content-center">
                    <div className="col-12">
                        <h3 className="text-center text-white fw-bold mb-5">Vyberte si tokenový balíček</h3>

                        <div className="row g-4 justify-content-center">
                            {tokenPacks.map((pack) => (
                                <div key={pack.id} className="col-lg col-md-6 col-sm-6" style={{ maxWidth: '250px' }}>
                                    <div
                                        className={`card h-100 border-0 position-relative shadow-lg ${pack.popular ? 'border-warning' : ''}`}
                                        style={{
                                            background: 'rgba(255, 255, 255, 0.05)',
                                            backdropFilter: 'blur(15px)',
                                            border: pack.popular ? '2px solid #ffc107 !important' : '1px solid rgba(255, 255, 255, 0.1)',
                                            transform: pack.popular ? 'scale(1.05)' : 'scale(1)',
                                            transition: 'all 0.3s ease'
                                        }}
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.transform = pack.popular ? 'scale(1.08)' : 'scale(1.03)';
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.transform = pack.popular ? 'scale(1.05)' : 'scale(1)';
                                        }}
                                    >
                                        {/* Popular Badge */}
                                        {pack.popular && (
                                            <div className="position-absolute top-0 start-50 translate-middle">
                                                <span className="badge bg-warning text-dark px-3 py-1 fw-bold">
                                                    🏆 NEJOBLÍBENĚJŠÍ
                                                </span>
                                            </div>
                                        )}

                                        {/* Bonus Badge */}
                                        {pack.bonus > 0 && (
                                            <div className="position-absolute top-0 end-0 m-2">
                                                <span className="badge bg-success px-2 py-1">
                                                    +{pack.bonus} BONUS
                                                </span>
                                            </div>
                                        )}

                                        <div className="card-body text-center p-4 d-flex flex-column">
                                            {/* Icon */}
                                            <div style={{ fontSize: '3rem' }} className="mb-3">
                                                {pack.icon}
                                            </div>

                                            {/* Title */}
                                            <h5 className="text-white fw-bold mb-3">{pack.description}</h5>

                                            {/* Main Amount */}
                                            <div className="mb-3">
                                                <div className="h2 text-white fw-bold mb-0">
                                                    {pack.amount.toLocaleString()}
                                                </div>
                                                <small className="text-light">základní tokeny</small>

                                                {pack.bonus > 0 && (
                                                    <div className="mt-2">
                                                        <div className="text-success fw-bold">
                                                            + {pack.bonus.toLocaleString()}
                                                        </div>
                                                        <small className="text-success">bonusových tokenů</small>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Total */}
                                            <div className="mb-4">
                                                <div className="h4 text-info fw-bold">
                                                    = {(pack.amount + pack.bonus).toLocaleString()} tokenů
                                                </div>
                                                <small className="text-light">celkem získáte</small>
                                            </div>

                                            {/* Price */}
                                            <div className="mb-4">
                                                <div className="h3 fw-bold" style={{
                                                    background: pack.gradient,
                                                    WebkitBackgroundClip: 'text',
                                                    WebkitTextFillColor: 'transparent',
                                                    backgroundClip: 'text'
                                                }}>
                                                    {pack.price} {pack.currency}
                                                </div>
                                                {calculateSavings(pack) > 0 && (
                                                    <small className="text-success fw-bold">
                                                        Ušetříte {calculateSavings(pack)}%
                                                    </small>
                                                )}
                                            </div>

                                            {/* Buy Button */}
                                            <button
                                                className="btn btn-lg w-100 fw-bold mt-auto"
                                                style={{
                                                    background: pack.gradient,
                                                    border: 'none',
                                                    color: 'white',
                                                    boxShadow: '0 4px 15px rgba(0, 0, 0, 0.2)'
                                                }}
                                                onClick={() => setSelectedPack(pack)}
                                                onMouseEnter={(e) => {
                                                    e.target.style.transform = 'translateY(-2px)';
                                                    e.target.style.boxShadow = '0 6px 20px rgba(0, 0, 0, 0.3)';
                                                }}
                                                onMouseLeave={(e) => {
                                                    e.target.style.transform = 'translateY(0)';
                                                    e.target.style.boxShadow = '0 4px 15px rgba(0, 0, 0, 0.2)';
                                                }}
                                            >
                                                <i className="fas fa-shopping-cart me-2"></i>
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

            {/* Payment Modal */}
            {selectedPack && (
                <>
                    <div
                        className="modal-backdrop fade show"
                        style={{ backgroundColor: 'rgba(0, 0, 0, 0.7)' }}
                        onClick={() => !isProcessing && setSelectedPack(null)}
                    />
                    <div className="modal fade show d-block">
                        <div className="modal-dialog modal-dialog-centered modal-lg">
                            <div
                                className="modal-content border-0"
                                style={{
                                    background: 'linear-gradient(135deg, #1a1f3a 0%, #2d3561 100%)',
                                    backdropFilter: 'blur(20px)'
                                }}
                            >
                                {/* Header */}
                                <div className="modal-header border-0">
                                    <h4 className="modal-title text-white fw-bold">
                                        {isProcessing ? (
                                            <>
                                                <div className="spinner-border spinner-border-sm me-2"></div>
                                                Zpracování platby...
                                            </>
                                        ) : (
                                            <>
                                                <i className="fas fa-credit-card me-2"></i>
                                                Dokončení nákupu
                                            </>
                                        )}
                                    </h4>
                                    <button
                                        type="button"
                                        className="btn-close btn-close-white"
                                        onClick={() => !isProcessing && setSelectedPack(null)}
                                        disabled={isProcessing}
                                    />
                                </div>

                                <div className="modal-body">
                                    {!user ? (
                                        /* Not logged in */
                                        <div className="text-center py-4">
                                            <div style={{ fontSize: '4rem' }} className="mb-3">🔐</div>
                                            <h4 className="text-white mb-3">Přihlášení vyžadováno</h4>
                                            <p className="text-light mb-4">
                                                Pro nákup tokenů se musíte přihlásit do svého účtu
                                            </p>
                                            <div className="d-flex gap-3 justify-content-center">
                                                <Link to="/login" className="btn btn-primary px-4">
                                                    Přihlásit se
                                                </Link>
                                                <Link to="/register" className="btn btn-outline-light px-4">
                                                    Registrovat
                                                </Link>
                                            </div>
                                        </div>
                                    ) : isProcessing ? (
                                        /* Processing */
                                        <div className="text-center py-5">
                                            <div className="mb-4">
                                                <div className="spinner-border text-primary mb-3" style={{ width: '3rem', height: '3rem' }}></div>
                                            </div>
                                            <h5 className="text-white mb-3">Zpracovávám platbu...</h5>
                                            <p className="text-light">Simulujeme bezpečné zpracování vaší platby</p>

                                            <div className="card mx-auto mt-4" style={{
                                                maxWidth: '300px',
                                                background: selectedPack.gradient
                                            }}>
                                                <div className="card-body text-center">
                                                    <div style={{ fontSize: '2rem' }} className="mb-2">{selectedPack.icon}</div>
                                                    <div className="h5 text-white mb-1">
                                                        {(selectedPack.amount + selectedPack.bonus).toLocaleString()} tokenů
                                                    </div>
                                                    <div className="text-white-50">
                                                        {selectedPack.price} {selectedPack.currency}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        /* Payment form */
                                        <div className="row g-4">
                                            {/* Order Summary */}
                                            <div className="col-md-6">
                                                <h5 className="text-white fw-bold mb-3">Shrnutí objednávky</h5>
                                                <div
                                                    className="card"
                                                    style={{ background: selectedPack.gradient }}
                                                >
                                                    <div className="card-body text-center">
                                                        <div style={{ fontSize: '3rem' }} className="mb-3">{selectedPack.icon}</div>
                                                        <h5 className="text-white mb-2">{selectedPack.description}</h5>

                                                        <div className="mb-3">
                                                            <div className="h4 text-white fw-bold">
                                                                {selectedPack.amount.toLocaleString()}
                                                            </div>
                                                            <small className="text-white-50">základní tokeny</small>

                                                            {selectedPack.bonus > 0 && (
                                                                <div className="mt-2">
                                                                    <div className="h6 text-warning">
                                                                        +{selectedPack.bonus.toLocaleString()}
                                                                    </div>
                                                                    <small className="text-warning">bonusových</small>
                                                                </div>
                                                            )}
                                                        </div>

                                                        <hr className="text-white-50" />

                                                        <div className="h4 text-white fw-bold">
                                                            = {(selectedPack.amount + selectedPack.bonus).toLocaleString()} tokenů
                                                        </div>

                                                        <div className="h3 text-white fw-bold mt-3">
                                                            {selectedPack.price} {selectedPack.currency}
                                                        </div>

                                                        {calculateSavings(selectedPack) > 0 && (
                                                            <small className="text-success">
                                                                Úspora {calculateSavings(selectedPack)}%
                                                            </small>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Payment Methods */}
                                            <div className="col-md-6">
                                                <h5 className="text-white fw-bold mb-3">Způsob platby</h5>
                                                <div className="d-grid gap-3">
                                                    {paymentMethods.map(method => (
                                                        <label key={method.id} className="d-block">
                                                            <input
                                                                type="radio"
                                                                name="payment"
                                                                value={method.id}
                                                                checked={paymentMethod === method.id}
                                                                onChange={(e) => setPaymentMethod(e.target.value)}
                                                                className="d-none"
                                                            />
                                                            <div
                                                                className={`card cursor-pointer ${paymentMethod === method.id ? 'border-primary' : ''}`}
                                                                style={{
                                                                    background: paymentMethod === method.id ?
                                                                        'rgba(13, 110, 253, 0.1)' :
                                                                        'rgba(255, 255, 255, 0.05)',
                                                                    border: paymentMethod === method.id ?
                                                                        '2px solid #0d6efd' :
                                                                        '1px solid rgba(255, 255, 255, 0.1)',
                                                                    transition: 'all 0.3s ease'
                                                                }}
                                                            >
                                                                <div className="card-body d-flex align-items-center">
                                                                    <span className="me-3" style={{ fontSize: '1.5rem' }}>
                                                                        {method.icon}
                                                                    </span>
                                                                    <div className="flex-grow-1">
                                                                        <div className="text-white fw-medium">
                                                                            {method.name}
                                                                        </div>
                                                                        <small className="text-light">
                                                                            Demo platba
                                                                        </small>
                                                                    </div>
                                                                    {paymentMethod === method.id && (
                                                                        <i className="fas fa-check-circle text-primary"></i>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </label>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Footer */}
                                {user && !isProcessing && (
                                    <div className="modal-footer border-0 justify-content-center">
                                        <button
                                            className="btn btn-secondary me-3"
                                            onClick={() => setSelectedPack(null)}
                                        >
                                            <i className="fas fa-times me-2"></i>
                                            Zrušit
                                        </button>
                                        <button
                                            className="btn btn-primary btn-lg px-5"
                                            onClick={() => handlePurchase(selectedPack)}
                                            style={{
                                                background: selectedPack.gradient,
                                                border: 'none'
                                            }}
                                        >
                                            <i className="fas fa-credit-card me-2"></i>
                                            Zaplatit {selectedPack.price} {selectedPack.currency}
                                        </button>
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