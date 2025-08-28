import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';

const RegisterPage = () => {
    const { register, loading } = useUser();
    const navigate = useNavigate();
    const [error, setError] = useState('');

    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        confirmPassword: ''
    });

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        // Kontrola, zda se hesla shodují
        if (formData.password !== formData.confirmPassword) {
            setError('Hesla se neshodují.');
            return;
        }

        const result = await register(formData.username, formData.email, formData.password);
        if (result && result.success) {
            navigate('/'); // Přesměrování na hlavní stránku po úspěšné registraci
        } else {
            setError(result.message || 'Neznámá chyba při registraci.');
        }
    };

    return (
        <div className="register-page-bg min-vh-100 py-4">
            <div className="container">
                <div className="row justify-content-center">
                    <div className="col-md-6 col-lg-5">

                        {/* Logo Section */}
                        <div className="text-center mb-4">
                            <div className="register-logo-icon mb-3">
                                🏰
                            </div>
                            <h1 className="register-logo-title mb-2">
                                HERIDEL
                            </h1>
                            <p className="register-logo-subtitle">
                                GAMING STORE
                            </p>
                            <div className="register-logo-divider mx-auto" />
                        </div>

                        {/* Register Card */}
                        <div className="register-card">

                            {/* Card Header */}
                            <div className="register-card-header text-center">
                                <h2 className="register-card-title mb-0">
                                    Vytvořit nový účet
                                </h2>
                                <p className="register-card-subtitle mb-0 mt-2">
                                    Staňte se součástí našeho království
                                </p>
                            </div>

                            {/* Card Body */}
                            <div className="register-card-body">
                                <form onSubmit={handleSubmit}>

                                    {/* Zobrazení chybové hlášky */}
                                    {error && (
                                        <div className="alert alert-danger mb-4" role="alert">
                                            {error}
                                        </div>
                                    )}

                                    {/* Input pro username */}
                                    <div className="mb-3">
                                        <label htmlFor="username" className="register-form-label">
                                            Uživatelské jméno
                                        </label>
                                        <input
                                            type="text"
                                            id="username"
                                            name="username"
                                            value={formData.username}
                                            onChange={handleChange}
                                            required
                                            className="form-control"
                                            placeholder="Zvolte si jméno"
                                        />
                                    </div>

                                    {/* Input pro email */}
                                    <div className="mb-3">
                                        <label htmlFor="email" className="register-form-label">
                                            E-mail
                                        </label>
                                        <input
                                            type="email"
                                            id="email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleChange}
                                            required
                                            className="form-control"
                                            placeholder="Váš e-mail"
                                        />
                                    </div>

                                    {/* Input pro password */}
                                    <div className="mb-3">
                                        <label htmlFor="password" className="register-form-label">
                                            Heslo
                                        </label>
                                        <input
                                            type="password"
                                            id="password"
                                            name="password"
                                            value={formData.password}
                                            onChange={handleChange}
                                            required
                                            className="form-control"
                                            placeholder="Zadejte heslo"
                                        />
                                    </div>

                                    {/* Input pro confirm password */}
                                    <div className="mb-4">
                                        <label htmlFor="confirmPassword" className="register-form-label">
                                            Potvrzení hesla
                                        </label>
                                        <input
                                            type="password"
                                            id="confirmPassword"
                                            name="confirmPassword"
                                            value={formData.confirmPassword}
                                            onChange={handleChange}
                                            required
                                            className="form-control"
                                            placeholder="Zadejte heslo znovu"
                                        />
                                    </div>

                                    {/* Tlačítko */}
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="btn w-100 register-submit-btn mb-4"
                                    >
                                        {loading ? 'Registruji...' : 'Zaregistrovat se'}
                                    </button>

                                    {/* Link na přihlášení */}
                                    <div className="text-center">
                                        <p className="register-login-text mb-0">
                                            Už máte účet?{' '}
                                            <Link to="/login" className="register-login-link">
                                                Přihlaste se zde
                                            </Link>
                                        </p>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RegisterPage;