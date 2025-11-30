import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { useAuth } from './hooks/useAuth';
import { Header } from './components/layout/Header';
import { Footer } from './components/layout/Footer';
import { Home } from './pages/Home';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Products } from './pages/Products';
import { ProductDetails } from './pages/ProductDetails';
import { CreateProduct } from './pages/CreateProduct';
import { EditProduct } from './pages/EditProduct';
import './styles/index.css';
import './App.css';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
    const { isAuthenticated, loading } = useAuth();

    if (loading) {
        return <div className="loader-container"><div className="loader"></div></div>;
    }

    return isAuthenticated ? children : <Navigate to="/login" />;
};

function AppRoutes() {
    return (
        <div className="app">
            <Header />
            <main className="main-content">
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />

                    <Route
                        path="/products"
                        element={
                            <ProtectedRoute>
                                <Products />
                            </ProtectedRoute>
                        }
                    />

                    <Route
                        path="/products/create"
                        element={
                            <ProtectedRoute>
                                <CreateProduct />
                            </ProtectedRoute>
                        }
                    />

                    <Route
                        path="/products/:id"
                        element={
                            <ProtectedRoute>
                                <ProductDetails />
                            </ProtectedRoute>
                        }
                    />

                    <Route
                        path="/products/edit/:id"
                        element={
                            <ProtectedRoute>
                                <EditProduct />
                            </ProtectedRoute>
                        }
                    />

                    <Route path="*" element={<Navigate to="/" />} />
                </Routes>
            </main>
            <Footer />
        </div>
    );
}

function App() {
    return (
        <Router>
            <ThemeProvider>
                <AuthProvider>
                    <AppRoutes />
                </AuthProvider>
            </ThemeProvider>
        </Router>
    );
}

export default App;
