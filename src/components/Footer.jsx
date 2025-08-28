import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
    const [genres, setGenres] = useState([]);
    const API_BASE_URL = '/api';

    useEffect(() => {
        const fetchGenres = async () => {
            try {
                const response = await fetch(`${API_BASE_URL}/genres.php`);
                const data = await response.json();
                if (data.success) {
                    setGenres(data.data);
                }
            } catch (error) {
                console.error("Nepodařilo se načíst žánry:", error);
            }
        };
        fetchGenres();
    }, []);

    const currentYear = new Date().getFullYear();

    return (
        <footer className="footer-gradient text-white w-100 m-0 footer-padding">
            <div className="container-custom">
                <div className="row g-4">
                    {/* O Heridel sekce */}
                    <div className="col-lg-4 col-md-6">
                        <div className="d-flex align-items-center mb-4">
                            <span className="h1 me-3 mb-0">🏰</span>
                            <h5 className="fw-bold mb-0">O Heridel</h5>
                        </div>
                        <p className="text-white-50">
                            Váš královský portál do světa digitálních her. Objevte, nakupte a spravujte svou herní knihovnu s elegancí hradního majestátu.
                        </p>
                        <div className="d-flex gap-3">
                            <a href="#" className="text-white-50 h5"><i className="fab fa-facebook"></i></a>
                            <a href="#" className="text-white-50 h5"><i className="fab fa-twitter"></i></a>
                            <a href="#" className="text-white-50 h5"><i className="fab fa-discord"></i></a>
                        </div>
                    </div>

                    {/* Žánry sekce */}
                    <div className="col-lg-4 col-md-6">
                        <div className="d-flex align-items-center mb-4">
                            <span className="h1 me-3 mb-0">🎯</span>
                            <h5 className="fw-bold mb-0">Žánry</h5>
                        </div>
                        <div className="d-flex flex-wrap gap-2">
                            {genres.slice(0, 8).map(genre => (
                                <Link
                                    key={genre.slug}
                                    to={`/games?category=${genre.slug}`}
                                    className="btn btn-sm btn-outline-light rounded-pill"
                                >
                                    {genre.name}
                                </Link>
                            ))}
                        </div>
                        {genres.length > 8 && (
                            <Link to="/games" className="d-block mt-3 text-info">
                                Zobrazit všechny žánry
                            </Link>
                        )}
                    </div>

                    {/* Kontaktní informace - AKTUALIZOVÁNO */}
                    <div className="col-lg-4 col-md-12">
                        <div className="d-flex align-items-center mb-4">
                            <span className="h1 me-3 mb-0">📞</span>
                            <h5 className="fw-bold mb-0">Kontakt</h5>
                        </div>
                        <ul className="list-unstyled text-white-50">
                            <li className="mb-2">
                                <i className="fas fa-building me-2"></i>
                                <strong>IČO:</strong> 23461632
                            </li>
                            <li className="mb-2">
                                <i className="fas fa-map-marker-alt me-2"></i>
                                Kaprova 42, Praha 12000
                            </li>
                            <li className="mb-2">
                                <i className="fas fa-envelope me-2"></i>
                                info@heridel.cz
                            </li>
                            <li>
                                <i className="fas fa-phone me-2"></i>
                                +420 123 456 789
                            </li>
                        </ul>
                    </div>
                </div>

                <hr className="mt-5 footer-divider" />

                <div className="text-center text-white-50 mt-4">
                    <div className="row">
                        <div className="col-md-6 text-md-start mb-2 mb-md-0">
                            <p className="mb-0">&copy; {currentYear} Heridel Gaming Store. Všechna práva vyhrazena.</p>
                        </div>
                        <div className="col-md-6 text-md-end">
                            <p className="mb-0">
                                <small>IČO: 23461632 | Kaprova 42, Praha 12000</small>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;