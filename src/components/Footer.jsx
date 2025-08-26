// src/components/Footer.js
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
    const [genres, setGenres] = useState([]);
    const API_BASE_URL = 'http://heridel.wz.cz';

    useEffect(() => {
        const fetchGenres = async () => {
            try {
                const response = await fetch(`${API_BASE_URL}/api/genres.php`);
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
        <footer className="bg-dark text-white py-5 mt-5">
            <div className="container">
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
                                    to={`/games?category=${genre.slug}`} // Opravený odkaz na stránku s hrami s filtrem
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
                    {/* Kontaktní informace */}
                    <div className="col-lg-4 col-md-12">
                        <div className="d-flex align-items-center mb-4">
                            <span className="h1 me-3 mb-0">📞</span>
                            <h5 className="fw-bold mb-0">Kontakt</h5>
                        </div>
                        <ul className="list-unstyled text-white-50">
                            <li className="mb-2"><i className="fas fa-envelope me-2"></i>info@heridel.cz</li>
                            <li className="mb-2"><i className="fas fa-map-marker-alt me-2"></i>Adresa 123, Město, 123 45</li>
                            <li><i className="fas fa-phone me-2"></i>+420 123 456 789</li>
                        </ul>
                    </div>
                </div>
                <hr className="mt-5" style={{ borderColor: 'rgba(255, 255, 255, 0.1)' }} />
                <div className="text-center text-white-50 mt-4">
                    <p>&copy; {currentYear} Heridel Gaming Store. Všechna práva vyhrazena.</p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;