import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const HomePage = () => {
    const [homeData, setHomeData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const API_BASE_URL = 'http://heridel.wz.cz';

    useEffect(() => {
        const fetchHomeData = async () => {
            try {
                const response = await fetch(`${API_BASE_URL}/api/homepage.php`);
                const data = await response.json();
                if (data.success) {
                    setHomeData(data.data);
                } else {
                    throw new Error('Nepodařilo se načíst data.');
                }
            } catch (error) {
                setError(error.message);
            } finally {
                setLoading(false);
            }
        };
        fetchHomeData();
    }, []);

    if (loading) return <div className="text-center p-5">Načítání...</div>;
    if (error) return <div className="alert alert-danger">Chyba: {error}</div>;

    return (
        <div>
            {/* Hero Section */}
            {homeData.featuredGame && (
                <div className="card text-white mb-4" style={{ background: 'none', border: 'none' }}>
                    <img src={homeData.featuredGame.image_url} className="card-img" alt={homeData.featuredGame.name} style={{ height: '400px', objectFit: 'cover', borderRadius: '16px' }} />
                    <div className="card-img-overlay d-flex flex-column justify-content-end" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0) 100%)', borderRadius: '16px' }}>
                        <h2 className="card-title" style={{ textShadow: '2px 2px 4px #000' }}>{homeData.featuredGame.name}</h2>
                        <p className="card-text" style={{ textShadow: '1px 1px 2px #000' }}>{homeData.featuredGame.description.substring(0, 150)}...</p>
                        <Link to={`/game/${homeData.featuredGame.game_id}`} className="btn btn-primary mt-2" style={{ maxWidth: '200px' }}>Zobrazit detail</Link>
                    </div>
                </div>
            )}

            {/* Popular Games Section */}
            <h3 className="mt-5 mb-3">Populární hry</h3>
            <div className="row">
                {homeData.popularGames && homeData.popularGames.map(game => (
                    <div key={game.game_id} className="col-lg-3 col-md-4 col-sm-6 mb-4">
                        <div className="card h-100 shadow-sm">
                            <img src={game.image_url} className="card-img-top" alt={game.name} style={{ height: '150px', objectFit: 'cover' }} />
                            <div className="card-body d-flex flex-column">
                                <h5 className="card-title">{game.name}</h5>
                                <Link to={`/game/${game.game_id}`} className="btn btn-secondary mt-auto">
                                    {game.price_tokens} tokenů
                                </Link>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default HomePage;
