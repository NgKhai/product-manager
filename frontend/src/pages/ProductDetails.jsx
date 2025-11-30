import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { productsAPI } from '../api/apiClient';
import { useAuth } from '../hooks/useAuth';
import { Button } from '../components/common/Button';
import { Loader } from '../components/common/Loader';
import { ErrorMessage } from '../components/common/ErrorMessage';
import { formatPrice, formatDate, getStockStatusColor } from '../utils/formatters';
import { Edit, Trash2, ArrowLeft, ShoppingCart } from 'lucide-react';
import './ProductDetails.css';

export const ProductDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { canEdit, isAdmin } = useAuth();

    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [deleting, setDeleting] = useState(false);

    useEffect(() => {
        fetchProduct();
    }, [id]);

    const fetchProduct = async () => {
        try {
            const response = await productsAPI.getById(id);
            setProduct(response.data.data.product);
        } catch (err) {
            setError('Failed to load product details.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!window.confirm('Are you sure you want to delete this product?')) return;

        setDeleting(true);
        try {
            await productsAPI.delete(id);
            navigate('/products');
        } catch (err) {
            setError('Failed to delete product.');
            setDeleting(false);
        }
    };

    if (loading) return <div className="page-center"><Loader text="Loading details..." /></div>;
    if (error) return <div className="page-center"><ErrorMessage message={error} /></div>;
    if (!product) return <div className="page-center"><p>Product not found.</p></div>;

    return (
        <div className="product-details-page">
            <div className="container">
                <Link to="/products" className="back-link">
                    <ArrowLeft size={20} /> Back to Products
                </Link>

                <div className="product-details-grid">
                    <div className="product-image-container">
                        {product.imageUrl ? (
                            <img src={product.imageUrl} alt={product.name} className="detail-image" />
                        ) : (
                            <div className="no-image-placeholder">No Image Available</div>
                        )}
                    </div>

                    <div className="product-info-container">
                        <div className="product-header-section">
                            <h1 className="detail-title">{product.name}</h1>
                            <div className="detail-meta">
                                <span className={`badge badge-${getStockStatusColor(product.stockStatus)}`}>
                                    {product.stockStatus}
                                </span>
                                <span className="detail-category">{product.category}</span>
                            </div>
                        </div>

                        <div className="detail-price-section">
                            <span className="detail-price">{formatPrice(product.price)}</span>
                            <span className="detail-stock">({product.stock} units available)</span>
                        </div>

                        <p className="detail-description">{product.description}</p>

                        {product.tags && product.tags.length > 0 && (
                            <div className="detail-tags">
                                {product.tags.map((tag, index) => (
                                    <span key={index} className="detail-tag">#{tag}</span>
                                ))}
                            </div>
                        )}

                        <div className="detail-actions">
                            <Button size="lg" icon={ShoppingCart}>Add to Cart</Button>

                            {canEdit(product) && (
                                <div className="admin-actions">
                                    <Link to={`/products/edit/${product._id}`}>
                                        <Button variant="outline" icon={Edit}>Edit</Button>
                                    </Link>
                                    <Button
                                        variant="danger"
                                        icon={Trash2}
                                        onClick={handleDelete}
                                        isLoading={deleting}
                                    >
                                        Delete
                                    </Button>
                                </div>
                            )}
                        </div>

                        <div className="detail-footer">
                            <p>SKU: {product.sku}</p>
                            <p>Added: {formatDate(product.createdAt)}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
