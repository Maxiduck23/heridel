import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';

const LoginPage = () => {
    const { login, loading } = useUser();
    const navigate = useNavigate();
    const [error, setError] = useState('');

    const [formData, setFormData] = useState({
        username: '',
        password: ''
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
        const result = await login(formData.username, formData.password);
        if (result && result.success) {
            navigate('/');
        } else {
            setError(result.message || 'Neznámá chyba při přihlášení.');
        }
    };

    return (
        <div className="login-page-bg min-vh-100 py-4">
            <div className="container">
                <div className="row justify-content-center">
                    <div className="col-md-6 col-lg-5">

                        {/* Logo Section */}
                        <div className="text-center mb-4">
                            <div className="login-logo-icon mb-3 text-primary">
                                🏰
                            </div>
                            <h1 className="login-logo-title mb-2 text-white">
                                HERIDEL
                            </h1>
                            <p className="login-logo-subtitle text-light">
                                GAMING STORE
                            </p>
                            <div className="login-logo-divider mx-auto bg-primary" />
                        </div>

                        {/* Login Card */}
                        <div className="login-card bg-dark border border-secondary">

                            {/* Card Header */}
                            <div className="login-card-header text-center bg-primary">
                                <h2 className="login-card-title mb-0">
                                    Přihlášení do Heridelu
                                </h2>
                                <p className="login-card-subtitle mb-0 mt-2">
                                    Vítejte zpět ve svém herním království
                                </p>
                            </div>

                            {/* Card Body */}
                            <div className="login-card-body bg-dark">
                                <form onSubmit={handleSubmit}>

                                    {/* Zobrazení chybové hlášky */}
                                    {error && (
                                        <div className="alert alert-danger mb-4" role="alert">
                                            {error}
                                        </div>
                                    )}

                                    {/* Input pro username */}
                                    <div className="mb-4">
                                        <label htmlFor="username" className="login-form-label text-light">
                                            Uživatelské jméno
                                        </label>
                                        <input
                                            type="text"
                                            id="username"
                                            name="username"
                                            value={formData.username}
                                            onChange={handleChange}
                                            required
                                            className="form-control bg-dark border-secondary text-light"
                                            placeholder="Zadejte uživatelské jméno"
                                        />
                                    </div>

                                    {/* Input pro password */}
                                    <div className="mb-4">
                                        <label htmlFor="password" className="login-form-label text-light">
                                            Heslo
                                        </label>
                                        <input
                                            type="password"
                                            id="password"
                                            name="password"
                                            value={formData.password}
                                            onChange={handleChange}
                                            required
                                            className="form-control bg-dark border-secondary text-light"
                                            placeholder="Zadejte heslo"
                                        />
                                    </div>

                                    {/* Tlačítko */}
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="btn w-100 login-submit-btn mb-4"
                                    >
                                        {loading ? 'Přihlašuji...' : 'Vstoupit do Heridelu'}
                                    </button>

                                    {/* Link na registraci */}
                                    <div className="text-center">
                                        <p className="login-register-text mb-0 text-light">
                                            Nemáte účet?{' '}
                                            <Link to="/register" className="login-register-link text-primary">
                                                Zaregistrujte se zde
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

export default LoginPage;