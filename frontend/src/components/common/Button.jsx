import React from 'react';
import { Loader2 } from 'lucide-react';
import './Button.css';

export const Button = ({
    children,
    variant = 'primary',
    size = 'md',
    isLoading = false,
    icon: Icon,
    iconPosition = 'left',
    className = '',
    disabled,
    ...props
}) => {
    const variantClass = `btn-${variant}`;
    const sizeClass = `btn-${size}`;

    return (
        <button
            className={`btn ${variantClass} ${sizeClass} ${className}`.trim()}
            disabled={disabled || isLoading}
            {...props}
        >
            {isLoading && <Loader2 className="btn-icon spin" size={18} />}

            {!isLoading && Icon && iconPosition === 'left' && (
                <Icon className="btn-icon" size={18} />
            )}

            <span className="btn-text">{children}</span>

            {!isLoading && Icon && iconPosition === 'right' && (
                <Icon className="btn-icon" size={18} />
            )}
        </button>
    );
};
