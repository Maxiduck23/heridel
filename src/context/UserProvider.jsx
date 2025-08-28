import React, { createContext, useState, useEffect } from 'react';
import { UserContext } from './UserContext';

export const UserProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const API_BASE_URL = '/api';

    useEffect(() => {
        checkSession();
    }, []);

    const checkSession = async () => {
        setLoading(true);
        try {
            const response = await fetch(`${API_BASE_URL}/auth/check_session.php`, {
                method: 'GET',
                credentials: 'include',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();
            console.log('Session check response:', data); // Debug log

            if (data.success && data.user) {
                setUser(data.user);
            } else {
                setUser(null);
                console.log('No active session:', data.message);
            }
        } catch (error) {
            console.error('Session check error:', error);
            setUser(null);

            // Only show error to user if it's not a network/CORS issue
            if (!error.message.includes('CORS') && !error.message.includes('Failed to fetch')) {
                console.warn('Authentication service unavailable:', error.message);
            }
        } finally {
            setLoading(false);
        }
    };

    const login = async (username, password) => {
        if (!username || !password) {
            return { success: false, message: 'Uživatelské jméno a heslo jsou povinné' };
        }

        try {
            const response = await fetch(`${API_BASE_URL}/auth/login.php`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                credentials: 'include',
                body: JSON.stringify({ username, password })
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();
            console.log('Login response:', data); // Debug log

            if (data.success && data.user) {
                setUser(data.user);
                return { success: true };
            } else {
                return { success: false, message: data.message || 'Přihlášení se nezdařilo' };
            }
        } catch (error) {
            console.error('Login error:', error);
            return {
                success: false,
                message: error.message.includes('Failed to fetch') ?
                    'Nelze se připojit k serveru' :
                    'Chyba při přihlašování'
            };
        }
    };

    const register = async (username, email, password) => {
        if (!username || !email || !password) {
            return { success: false, message: 'Všechna pole jsou povinná' };
        }

        try {
            const response = await fetch(`${API_BASE_URL}/auth/register.php`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                credentials: 'include',
                body: JSON.stringify({ username, email, password })
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();
            console.log('Register response:', data); // Debug log

            if (data.success && data.user) {
                setUser(data.user);
                return { success: true };
            } else {
                return { success: false, message: data.message || 'Registrace se nezdařila' };
            }
        } catch (error) {
            console.error('Register error:', error);
            return {
                success: false,
                message: error.message.includes('Failed to fetch') ?
                    'Nelze se připojit k serveru' :
                    'Chyba při registraci'
            };
        }
    };

    const logout = async () => {
        try {
            await fetch(`${API_BASE_URL}/auth/logout.php`, {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                }
            });
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            setUser(null);
        }
    };

    const updateUserTokens = async (newBalance) => {
        if (user && typeof newBalance === 'number') {
            const updatedUser = {
                ...user,
                tokens_balance: parseFloat(newBalance)
            };
            setUser(updatedUser);

            // Optional: Sync with server to ensure consistency
            try {
                const response = await fetch(`${API_BASE_URL}/auth/check_session.php`, {
                    credentials: 'include',
                    headers: { 'Accept': 'application/json' }
                });

                if (response.ok) {
                    const data = await response.json();
                    if (data.success && data.user && Math.abs(data.user.tokens_balance - newBalance) > 0.01) {
                        console.log('Token balance synced from server');
                        setUser(prevUser => ({ ...prevUser, tokens_balance: data.user.tokens_balance }));
                    }
                }
            } catch (error) {
                console.warn('Could not sync token balance from server:', error);
            }
        }
    };

    const refreshUser = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/auth/check_session.php`, {
                credentials: 'include',
                headers: { 'Accept': 'application/json' }
            });

            if (response.ok) {
                const data = await response.json();
                if (data.success && data.user) {
                    setUser(data.user);
                    return data.user;
                }
            }
        } catch (error) {
            console.error('Error refreshing user:', error);
        }
        return null;
    };

    const value = {
        user,
        loading,
        login,
        register,
        logout,
        updateUserTokens,
        refreshUser,
        checkSession
    };

    return (
        <UserContext.Provider value={value}>
            {children}
        </UserContext.Provider>
    );
};