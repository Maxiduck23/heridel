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
                            <div className="login-logo-icon mb-3">
                                🏰
                            </div>
                            <h1 className="login-logo-title mb-2">
                                HERIDEL
                            </h1>
                            <p className="login-logo-subtitle">
                                GAMING STORE
                            </p>
                            <div className="login-logo-divider mx-auto" />
                        </div>

                        {/* Login Card */}
                        <div className="login-card">

                            {/* Card Header */}
                            <div className="login-card-header text-center">
                                <h2 className="login-card-title mb-0">
                                    Přihlášení do Heridelu
                                </h2>
                                <p className="login-card-subtitle mb-0 mt-2">
                                    Vítejte zpět ve svém herním království
                                </p>
                            </div>

                            {/* Card Body */}
                            <div className="login-card-body">
                                <form onSubmit={handleSubmit}>

                                    {/* Zobrazení chybové hlášky */}
                                    {error && (
                                        <div className="alert alert-danger mb-4" role="alert">
                                            {error}
                                        </div>
                                    )}

                                    {/* Input pro username */}
                                    <div className="mb-4">
                                        <label htmlFor="username" className="login-form-label">
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
                                            placeholder="Zadejte uživatelské jméno"
                                        />
                                    </div>

                                    {/* Input pro password */}
                                    <div className="mb-4">
                                        <label htmlFor="password" className="login-form-label">
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
                                        <p className="login-register-text mb-0">
                                            Nemáte účet?{' '}
                                            <Link to="/register" className="login-register-link">
                                                Zaregistrujte se zde
                                            </Link>
                                        </p>
                                    </div>
                                </form>
                            </div>
                        </div>

                        {/* Demo Section */}
                        <div className="login-demo-section mt-4 text-center">
                            <h6 className="login-demo-title mb-3">Demo účty pro testování</h6>
                            <div className="row text-center">
                                <div className="col-6">
                                    <div className="login-demo-card mb-2">
                                        <small className="login-demo-label d-block mb-1">Uživatel</small>
                                        <code className="login-demo-code">demo / demo123</code>
                                    </div>
                                </div>
                                <div className="col-6">
                                    <div className="login-demo-card-admin mb-2">
                                        <small className="login-demo-label d-block mb-1">Admin</small>
                                        <code className="login-demo-code-admin">admin / admin123</code>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;