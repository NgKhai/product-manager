import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { productsAPI } from '../api/apiClient';
import { ProductForm } from '../components/products/ProductForm';
import { ErrorMessage } from '../components/common/ErrorMessage';
import { Loader } from '../components/common/Loader';

export const EditProduct = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);
    const [error, setError] = useState('');
    const [initialData, setInitialData] = useState({});

    useEffect(() => {
        fetchProduct();
    }, [id]);

    const fetchProduct = async () => {
        try {
            const response = await productsAPI.getById(id);
            setInitialData(response.data.data.product);
        } catch (err) {
            setError('Failed to load product data');
        } finally {
            setFetching(false);
        }
    };

    const handleSubmit = async (productData) => {
        setLoading(true);
        setError('');

        try {
            await productsAPI.update(id, productData);
            navigate(`/products/${id}`);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to update product');
            setLoading(false);
        }
    };

    if (fetching) return <div className="flex justify-center p-4"><Loader /></div>;

    return (
        <div className="container" style={{ maxWidth: '800px', padding: '2rem 1rem' }}>
            {error && <ErrorMessage message={error} onClose={() => setError('')} />}
            <ProductForm
                title="Edit Product"
                initialData={initialData}
                onSubmit={handleSubmit}
                isLoading={loading}
            />
        </div>
    );
};
