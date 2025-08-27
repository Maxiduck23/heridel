import React from 'react';

const LoadingSpinner = ({
    size = 'medium',
    message = 'Načítání...',
    fullScreen = false,
    color = 'primary'
}) => {
    const sizeClasses = {
        small: { spinner: '1.5rem', text: '0.9rem' },
        medium: { spinner: '3rem', text: '1.1rem' },
        large: { spinner: '4rem', text: '1.3rem' }
    };

    const colorClasses = {
        primary: '#4f46e5',
        success: '#10b981',
        warning: '#f59e0b',
        danger: '#ef4444',
        white: '#ffffff'
    };

    const containerStyles = {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '1rem',
        ...(fullScreen && {
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(15, 23, 42, 0.8)',
            backdropFilter: 'blur(10px)',
            zIndex: 9999
        })
    };

    const spinnerStyles = {
        width: sizeClasses[size].spinner,
        height: sizeClasses[size].spinner,
        border: `3px solid rgba(255, 255, 255, 0.1)`,
        borderTop: `3px solid ${colorClasses[color]}`,
        borderRadius: '50%',
        animation: 'spin 1s linear infinite'
    };

    const textStyles = {
        color: fullScreen ? 'white' : colorClasses[color],
        fontSize: sizeClasses[size].text,
        fontWeight: '600',
        textAlign: 'center'
    };

    return (
        <>
            {/* Spinner animation keyframes */}
            <style>
                {`
                    @keyframes spin {
                        0% { transform: rotate(0deg); }
                        100% { transform: rotate(360deg); }
                    }
                `}
            </style>

            <div style={containerStyles}>
                <div style={spinnerStyles}></div>
                {message && (
                    <div style={textStyles}>
                        {message}
                    </div>
                )}
            </div>
        </>
    );
};

// Specialized loading components
export const PageLoader = ({ message = "Načítání stránky..." }) => (
    <LoadingSpinner
        size="large"
        message={message}
        fullScreen={true}
        color="primary"
    />
);

export const ButtonLoader = ({ message = "Zpracovávám..." }) => (
    <LoadingSpinner
        size="small"
        message={message}
        color="white"
    />
);

export const CardLoader = ({ message = "Načítání..." }) => (
    <div style={{
        background: 'rgba(255,255,255,0.05)',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: '16px',
        padding: '3rem',
        textAlign: 'center'
    }}>
        <LoadingSpinner
            size="medium"
            message={message}
            color="primary"
        />
    </div>
);

export default LoadingSpinner;