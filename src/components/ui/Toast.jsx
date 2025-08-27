import React, { useState, useEffect, createContext, useContext } from 'react';

// Toast Context
const ToastContext = createContext();

// Toast Provider
export const ToastProvider = ({ children }) => {
    const [toasts, setToasts] = useState([]);

    const addToast = (message, type = 'info', duration = 5000) => {
        const id = Date.now() + Math.random();
        const toast = { id, message, type, duration };

        setToasts(prev => [...prev, toast]);

        if (duration > 0) {
            setTimeout(() => {
                removeToast(id);
            }, duration);
        }

        return id;
    };

    const removeToast = (id) => {
        setToasts(prev => prev.filter(toast => toast.id !== id));
    };

    // Convenience methods
    const success = (message, duration) => addToast(message, 'success', duration);
    const error = (message, duration) => addToast(message, 'error', duration);
    const warning = (message, duration) => addToast(message, 'warning', duration);
    const info = (message, duration) => addToast(message, 'info', duration);

    return (
        <ToastContext.Provider value={{
            addToast,
            removeToast,
            success,
            error,
            warning,
            info
        }}>
            {children}
            <ToastContainer toasts={toasts} onRemove={removeToast} />
        </ToastContext.Provider>
    );
};

// Toast Container Component
const ToastContainer = ({ toasts, onRemove }) => {
    if (toasts.length === 0) return null;

    return (
        <div style={{
            position: 'fixed',
            top: '2rem',
            right: '2rem',
            zIndex: 10000,
            display: 'flex',
            flexDirection: 'column',
            gap: '0.75rem',
            maxWidth: '400px',
            width: '100%'
        }}>
            {toasts.map(toast => (
                <ToastItem
                    key={toast.id}
                    toast={toast}
                    onRemove={onRemove}
                />
            ))}
        </div>
    );
};

// Individual Toast Item
const ToastItem = ({ toast, onRemove }) => {
    const [isVisible, setIsVisible] = useState(false);
    const [isLeaving, setIsLeaving] = useState(false);

    const typeStyles = {
        success: {
            background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.95), rgba(5, 150, 105, 0.95))',
            icon: '✓',
            color: '#065f46'
        },
        error: {
            background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.95), rgba(220, 38, 38, 0.95))',
            icon: '✕',
            color: '#7f1d1d'
        },
        warning: {
            background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.95), rgba(217, 119, 6, 0.95))',
            icon: '⚠',
            color: '#78350f'
        },
        info: {
            background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.95), rgba(29, 78, 216, 0.95))',
            icon: 'ℹ',
            color: '#1e3a8a'
        }
    };

    const style = typeStyles[toast.type] || typeStyles.info;

    useEffect(() => {
        // Trigger entrance animation
        setTimeout(() => setIsVisible(true), 50);
    }, []);

    const handleRemove = () => {
        setIsLeaving(true);
        setTimeout(() => onRemove(toast.id), 300);
    };

    const containerStyle = {
        transform: isLeaving
            ? 'translateX(120%) scale(0.8)'
            : isVisible
                ? 'translateX(0) scale(1)'
                : 'translateX(120%) scale(0.8)',
        opacity: isLeaving ? 0 : isVisible ? 1 : 0,
        transition: 'all 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55)',
        background: style.background,
        color: 'white',
        padding: '1rem 1.25rem',
        borderRadius: '12px',
        boxShadow: '0 10px 25px rgba(0, 0, 0, 0.2)',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
        cursor: 'pointer',
        position: 'relative',
        overflow: 'hidden'
    };

    return (
        <div style={containerStyle} onClick={handleRemove}>
            {/* Progress bar */}
            {toast.duration > 0 && (
                <div style={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    height: '3px',
                    background: 'rgba(255, 255, 255, 0.3)',
                    animation: `shrink ${toast.duration}ms linear forwards`,
                    width: '100%'
                }} />
            )}

            {/* Icon */}
            <div style={{
                width: '24px',
                height: '24px',
                borderRadius: '50%',
                background: 'rgba(255, 255, 255, 0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '0.875rem',
                fontWeight: 'bold',
                flexShrink: 0
            }}>
                {style.icon}
            </div>

            {/* Message */}
            <div style={{
                flex: 1,
                fontSize: '0.875rem',
                fontWeight: '500',
                lineHeight: '1.4'
            }}>
                {toast.message}
            </div>

            {/* Close button */}
            <button
                onClick={(e) => {
                    e.stopPropagation();
                    handleRemove();
                }}
                style={{
                    background: 'rgba(255, 255, 255, 0.2)',
                    border: 'none',
                    borderRadius: '50%',
                    width: '20px',
                    height: '20px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.75rem',
                    color: 'white',
                    cursor: 'pointer',
                    flexShrink: 0,
                    transition: 'background 0.2s ease'
                }}
                onMouseEnter={(e) => {
                    e.target.style.background = 'rgba(255, 255, 255, 0.3)';
                }}
                onMouseLeave={(e) => {
                    e.target.style.background = 'rgba(255, 255, 255, 0.2)';
                }}
            >
                ✕
            </button>

            {/* Keyframes for progress bar animation */}
            <style>
                {`
                    @keyframes shrink {
                        from { width: 100%; }
                        to { width: 0%; }
                    }
                `}
            </style>
        </div>
    );
};

// Hook to use toast
export const useToast = () => {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error('useToast must be used within a ToastProvider');
    }
    return context;
};

// Higher-order component for easy integration
export const withToast = (Component) => {
    return (props) => {
        const toast = useToast();
        return <Component {...props} toast={toast} />;
    };
};