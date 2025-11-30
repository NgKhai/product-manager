import './Input.css';

export const Input = ({
    label,
    error,
    icon: Icon,
    className = '',
    ...props
}) => {
    return (
        <div className={`input-group ${className}`.trim()}>
            {label && <label className="input-label">{label}</label>}
            <div className={`input-wrapper ${error ? 'has-error' : ''}`}>
                {Icon && (
                    <div className="input-icon">
                        <Icon size={18} />
                    </div>
                )}
                <input
                    className={`input ${Icon ? 'has-icon' : ''}`}
                    {...props}
                />
            </div>
            {error && <span className="input-error">{error}</span>}
        </div>
    );
};
