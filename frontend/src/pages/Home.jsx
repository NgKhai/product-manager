import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import './Home.css';

export const Home = () => {
    const { isAuthenticated } = useAuth();

    return (
        <div className="home-page">
            <section className="hero">
                <div className="container">
                    <div className="hero-content">
                        <h1 className="hero-title slide-up">
                            Manage Your Products
                            <br />
                            <span className="gradient-text">Like a Pro</span>
                        </h1>
                        <p className="hero-subtitle slide-up">
                            A powerful and beautiful product management system built with modern technologies.
                            Create, manage, and showcase your products with ease.
                        </p>
                        <div className="hero-actions slide-up">
                            {isAuthenticated ? (
                                <>
                                    <Link to="/products" className="btn btn-primary btn-lg">
                                        View Products
                                    </Link>
                                    <Link to="/products/create" className="btn btn-outline btn-lg">
                                        Create Product
                                    </Link>
                                </>
                            ) : (
                                <>
                                    <Link to="/register" className="btn btn-primary btn-lg">
                                        Get Started
                                    </Link>
                                    <Link to="/login" className="btn btn-outline btn-lg">
                                        Login
                                    </Link>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </section>

            <section className="features">
                <div className="container">
                    <h2 className="section-title">Features</h2>
                    <div className="features-grid">
                        <div className="feature-card card scale-in">
                            <div className="feature-icon">
                                <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                                </svg>
                            </div>
                            <h3>Advanced Filtering</h3>
                            <p>Filter products by category, price range, stock status, and more with real-time search.</p>
                        </div>

                        <div className="feature-card card scale-in">
                            <div className="feature-icon">
                                <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                </svg>
                            </div>
                            <h3>Secure & Fast</h3>
                            <p>Built with security best practices, including JWT authentication and input validation.</p>
                        </div>

                        <div className="feature-card card scale-in">
                            <div className="feature-icon">
                                <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
                                </svg>
                            </div>
                            <h3>Beautiful UI</h3>
                            <p>Modern, responsive design with smooth animations and glassmorphism effects.</p>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};
