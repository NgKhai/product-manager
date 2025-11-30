import { Link } from 'react-router-dom';
import { formatPrice } from '../../utils/formatters';
import './ProductCard.css';

export const ProductCard = ({ product }) => {
    const getStockBadgeClass = (stockStatus) => {
        switch (stockStatus) {
            case 'In Stock': return 'badge-success';
            case 'Low Stock': return 'badge-warning';
            case 'Out of Stock': return 'badge-danger';
            default: return 'badge-info';
        }
    };

    return (
        <Link to={`/products/${product._id}`} className="product-card card">
            {product.imageUrl && (
                <img src={product.imageUrl} alt={product.name} className="product-image" />
            )}

            <div className="product-content">
                <div className="product-header">
                    <h3 className="product-name">{product.name}</h3>
                    <span className={`badge ${getStockBadgeClass(product.stockStatus)}`}>
                        {product.stockStatus}
                    </span>
                </div>

                <p className="product-description">{product.description}</p>

                <div className="product-footer">
                    <span className="product-price">{formatPrice(product.price)}</span>
                    <span className="product-category">{product.category}</span>
                </div>

                {product.tags && product.tags.length > 0 && (
                    <div className="product-tags">
                        {product.tags.slice(0, 3).map((tag, index) => (
                            <span key={index} className="product-tag">#{tag}</span>
                        ))}
                    </div>
                )}
            </div>
        </Link>
    );
};
