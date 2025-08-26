import React from 'react';

const TokenPage = () => {
    const tokenPacks = [
        { amount: 100, price: '25 Kč', bonus: '' },
        { amount: 550, price: '125 Kč', bonus: '10% navíc' },
        { amount: 1200, price: '250 Kč', bonus: '20% navíc' },
        { amount: 3000, price: '500 Kč', bonus: '50% navíc' },
    ];

    return (
        <div>
            <div className="text-center mb-5">
                <h1>Tokenová Ekonomika</h1>
                <p className="lead">Doplňte si tokeny a získejte přístup k nejlepším hrám!</p>
            </div>
            <div className="row">
                {tokenPacks.map(pack => (
                    <div key={pack.amount} className="col-md-3 mb-4">
                        <div className="card text-center h-100">
                            <div className="card-header">
                                {pack.amount} 🪙 {pack.bonus && <span className="badge bg-success">{pack.bonus}</span>}
                            </div>
                            <div className="card-body">
                                <h5 className="card-title">{pack.price}</h5>
                                <button className="btn btn-primary">Koupit balíček</button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default TokenPage;