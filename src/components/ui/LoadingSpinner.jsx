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

    const containerClassName = `d-flex flex-column align-items-center justify-content-center gap-3 ${fullScreen ? 'loading-spinner-fullscreen' : ''
        }`;

    const spinnerStyle = {
        width: sizeClasses[size].spinner,
        height: sizeClasses[size].spinner,
        border: `3px solid rgba(255, 255, 255, 0.1)`,
        borderTop: `3px solid ${colorClasses[color]}`,
        borderRadius: '50%',
        animation: 'spin 1s linear infinite'
    };

    const textClassName = fullScreen ? 'text-white' : `text-${color}`;
    const textStyle = {
        fontSize: sizeClasses[size].text,
        fontWeight: '600'
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

            <div className={containerClassName}>
                <div style={spinnerStyle}></div>
                {message && (
                    <div className={`${textClassName} text-center`} style={textStyle}>
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
    <div className="card-loader">
        <LoadingSpinner
            size="medium"
            message={message}
            color="primary"
        />
    </div>
);

export default LoadingSpinner;