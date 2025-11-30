import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { productsAPI } from '../api/apiClient';
import { ProductForm } from '../components/products/ProductForm';
import { ErrorMessage } from '../components/common/ErrorMessage';

export const CreateProduct = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (productData) => {
        setLoading(true);
        setError('');

        try {
            await productsAPI.create(productData);
            navigate('/products');
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to create product');
            setLoading(false);
        }
    };

    return (
        <div className="container" style={{ maxWidth: '800px', padding: '2rem 1rem' }}>
            {error && <ErrorMessage message={error} onClose={() => setError('')} />}
            <ProductForm
                title="Create New Product"
                onSubmit={handleSubmit}
                isLoading={loading}
            />
        </div>
    );
};
