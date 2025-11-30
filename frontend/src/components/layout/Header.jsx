import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useTheme } from '../../context/ThemeContext';
import { Button } from '../common/Button';
import { Sun, Moon, LogOut, User, Plus } from 'lucide-react';
import './Header.css';

export const Header = () => {
    const { isAuthenticated, user, logout } = useAuth();
    const { theme, toggleTheme } = useTheme();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <header className="header">
            <div className="container">
                <div className="header-content">
                    <Link to="/" className="logo">
                        <span className="logo-text">Product Manager</span>
                    </Link>

                    <nav className="nav">
                        <Link to="/" className="nav-link">Home</Link>
                        <Link to="/products" className="nav-link">Products</Link>

                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={toggleTheme}
                            className="theme-toggle-btn"
                            aria-label="Toggle theme"
                        >
                            {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
                        </Button>

                        {isAuthenticated ? (
                            <>
                                <Link to="/products/create">
                                    <Button variant="primary" size="sm" icon={Plus}>
                                        Create
                                    </Button>
                                </Link>

                                <div className="user-menu">
                                    <div className="user-info">
                                        <User size={16} />
                                        <span className="user-name">{user?.name}</span>
                                    </div>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={handleLogout}
                                        icon={LogOut}
                                    >
                                        Logout
                                    </Button>
                                </div>
                            </>
                        ) : (
                            <div className="auth-buttons">
                                <Link to="/login">
                                    <Button variant="ghost" size="sm">Login</Button>
                                </Link>
                                <Link to="/register">
                                    <Button variant="primary" size="sm">Sign Up</Button>
                                </Link>
                            </div>
                        )}
                    </nav>
                </div>
            </div>
        </header>
    );
};
