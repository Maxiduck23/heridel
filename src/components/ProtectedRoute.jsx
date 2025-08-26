import React from 'react';
import { Navigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';

const ProtectedRoute = ({ children }) => {
    const { user, loading } = useUser();

    // Během ověřování session zobrazíme načítací text
    if (loading) {
        return <div className="text-center p-5">Ověřování...</div>;
    }

    // Pokud není uživatel přihlášen, přesměrujeme ho na login
    if (!user) {
        return <Navigate to="/login" replace />;
    }

    // Pokud je přihlášen, zobrazíme požadovanou stránku
    return children;
};

export default ProtectedRoute;