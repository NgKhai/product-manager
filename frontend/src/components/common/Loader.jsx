import './Loader.css';

export const Loader = ({ size = 'md', text = '' }) => {
    const sizeClass = size !== 'md' ? `loader-${size}` : '';

    return (
        <div className="loader-container">
            <div className={`loader ${sizeClass}`.trim()}></div>
            {text && <p className="loader-text">{text}</p>}
        </div>
    );
};
