import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    const isAdmin = context.user?.role === 'admin';

    const canEdit = (product) => {
        if (!context.isAuthenticated || !context.user) return false;
        if (isAdmin) return true;
        return product.createdBy === context.user._id;
    };

    return { ...context, isAdmin, canEdit };
};
