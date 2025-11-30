import { useState, useEffect } from 'react';
import { productsAPI } from '../api/apiClient';
import { ProductCard } from '../components/products/ProductCard';
import { Loader } from '../components/common/Loader';
import { useDebounce } from '../hooks/useDebounce';
import './Products.css';

export const Products = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [category, setCategory] = useState('');
    const [sortBy, setSortBy] = useState('createdAt:desc');
    const [categories, setCategories] = useState([]);

    const debouncedSearch = useDebounce(search, 500);

    useEffect(() => {
        fetchCategories();
    }, []);

    useEffect(() => {
        fetchProducts();
    }, [debouncedSearch, category, sortBy]);

    const fetchCategories = async () => {
        try {
            const response = await productsAPI.getCategories();
            setCategories(response.data.data.categories);
        } catch (error) {
            console.error('Error fetching categories:', error);
        }
    };

    const fetchProducts = async () => {
        setLoading(true);
        try {
            const params = {
                search: debouncedSearch,
                category: category || undefined,
                sortBy,
            };

            const response = await productsAPI.getAll(params);
            setProducts(response.data.data.products);
        } catch (error) {
            console.error('Error fetching products:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="products-page">
            <div className="container">
                <div className="products-header">
                    <h1>Our Products</h1>

                    <div className="filters">
                        <input
                            type="text"
                            className="input search-input"
                            placeholder="Search products..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />

                        <select
                            className="input"
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                        >
                            <option value="">All Categories</option>
                            {categories.map((cat) => (
                                <option key={cat} value={cat}>{cat}</option>
                            ))}
                        </select>

                        <select
                            className="input"
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                        >
                            <option value="createdAt:desc">Newest First</option>
                            <option value="price:asc">Price: Low to High</option>
                            <option value="price:desc">Price: High to Low</option>
                            <option value="name:asc">Name: A to Z</option>
                        </select>
                    </div>
                </div>

                {loading ? (
                    <Loader text="Loading products..." />
                ) : products.length > 0 ? (
                    <div className="products-grid">
                        {products.map((product) => (
                            <ProductCard key={product._id} product={product} />
                        ))}
                    </div>
                ) : (
                    <div className="no-products">
                        <p>No products found.</p>
                    </div>
                )}
            </div>
        </div>
    );
};
