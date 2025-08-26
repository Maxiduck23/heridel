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
        <div style={{
            minHeight: '100vh',
            background: 'linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%)',
            paddingTop: '2rem',
            paddingBottom: '2rem'
        }}>
            <div className="container">
                <div className="row justify-content-center">
                    <div className="col-md-6 col-lg-5">

                        {/* Logo Section */}
                        <div className="text-center mb-4">
                            <div style={{ fontSize: '4rem', marginBottom: '1rem', filter: 'drop-shadow(4px 4px 8px rgba(30, 64, 175, 0.3))' }}>
                                🏰
                            </div>
                            <h1 style={{ fontSize: '2.5rem', fontWeight: '800', color: '#1e40af', marginBottom: '0.5rem', letterSpacing: '1px', textShadow: '2px 2px 4px rgba(0,0,0,0.1)', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
                                HERIDEL
                            </h1>
                            <p style={{ color: '#6b7280', fontSize: '1.1rem', fontWeight: '500', letterSpacing: '1px' }}>
                                GAMING STORE
                            </p>
                            <div style={{ width: '60px', height: '3px', background: 'linear-gradient(90deg, #1e40af, #3b82f6)', margin: '1rem auto', borderRadius: '2px' }}></div>
                        </div>

                        {/* Register Card */}
                        <div style={{
                            background: 'white',
                            borderRadius: '16px',
                            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
                            border: '1px solid rgba(30, 64, 175, 0.1)',
                            overflow: 'hidden'
                        }}>

                            {/* Card Header */}
                            <div style={{ background: 'linear-gradient(135deg, #1e40af 0%, #3b82f6 100%)', color: 'white', padding: '2rem', textAlign: 'center' }}>
                                <h2 style={{ margin: '0', fontSize: '1.5rem', fontWeight: '700', textShadow: '1px 1px 2px rgba(0,0,0,0.1)' }}>
                                    Vytvořit nový účet
                                </h2>
                                <p style={{ margin: '0.5rem 0 0', opacity: '0.9', fontSize: '0.95rem' }}>
                                    Staňte se součástí našeho království
                                </p>
                            </div>

                            {/* Card Body */}
                            <div style={{ padding: '2rem' }}>
                                <form onSubmit={handleSubmit}>

                                    {/* Zobrazení chybové hlášky */}
                                    {error && (
                                        <div className="alert alert-danger mb-4" role="alert">
                                            {error}
                                        </div>
                                    )}

                                    {/* Input pro username */}
                                    <div className="mb-3">
                                        <label htmlFor="username" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#374151', fontSize: '0.95rem' }}>
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
                                        <label htmlFor="email" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#374151', fontSize: '0.95rem' }}>
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
                                        <label htmlFor="password" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#374151', fontSize: '0.95rem' }}>
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
                                        <label htmlFor="confirmPassword" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#374151', fontSize: '0.95rem' }}>
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
                                        className="btn w-100"
                                        style={{
                                            padding: '0.875rem 1rem',
                                            background: 'linear-gradient(135deg, #1e40af 0%, #3b82f6 100%)',
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: '8px',
                                            fontSize: '1rem',
                                            fontWeight: '600',
                                            cursor: loading ? 'not-allowed' : 'pointer',
                                            opacity: loading ? 0.7 : 1,
                                            marginBottom: '1.5rem'
                                        }}
                                    >
                                        {loading ? 'Registruji...' : 'Zaregistrovat se'}
                                    </button>

                                    {/* Link na přihlášení */}
                                    <div className="text-center">
                                        <p style={{ margin: '0', color: '#6b7280', fontSize: '0.9rem' }}>
                                            Už máte účet?{' '}
                                            <Link to="/login" style={{ color: '#3b82f6', textDecoration: 'none', fontWeight: '600' }}>
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
