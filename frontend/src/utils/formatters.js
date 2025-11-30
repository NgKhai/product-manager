// Format price to currency
export const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
    }).format(price);
};

// Format date
export const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });
};

// Get stock status badge color
export const getStockStatusColor = (stockStatus) => {
    switch (stockStatus) {
        case 'In Stock':
            return 'success';
        case 'Low Stock':
            return 'warning';
        case 'Out of Stock':
            return 'danger';
        default:
            return 'default';
    }
};
