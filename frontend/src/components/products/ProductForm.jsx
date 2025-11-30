import { useState, useEffect } from 'react';
import { Input } from '../common/Input';
import { Button } from '../common/Button';
import { Save, X, Package, DollarSign, Layers, Hash, Image as ImageIcon, Tag, FileText, Archive } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const ProductForm = ({ initialData = {}, onSubmit, isLoading, title }) => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        price: '',
        category: '',
        stock: '',
        sku: '',
        imageUrl: '',
        tags: '',
        ...initialData
    });

    // Populate form when initialData changes (for edit mode)
    useEffect(() => {
        if (Object.keys(initialData).length > 0) {
            setFormData({
                ...initialData,
                tags: Array.isArray(initialData.tags) ? initialData.tags.join(', ') : initialData.tags || ''
            });
        }
    }, [initialData]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        // Process tags from comma-separated string to array
        const processedData = {
            ...formData,
            price: parseFloat(formData.price),
            stock: parseInt(formData.stock),
            tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag)
        };

        onSubmit(processedData);
    };

    return (
        <div className="card">
            <div className="flex justify-between items-center mb-8 pb-4 border-b border-color">
                <h2>{title}</h2>
                <Button variant="ghost" size="sm" icon={X} onClick={() => navigate(-1)}>Cancel</Button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
                {/* Section 1: Basic Information */}
                <section>
                    <h3 className="text-lg font-semibold mb-4 text-primary flex items-center gap-2">
                        <Package size={20} /> Basic Information
                    </h3>
                    <div className="grid grid-cols-1 gap-6">
                        <Input
                            label="Product Name"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            required
                            placeholder="e.g. Wireless Noise-Cancelling Headphones"
                            icon={Package}
                        />

                        <div className="input-group">
                            <label className="input-label">Description</label>
                            <div className="input-wrapper">
                                <div className="input-icon" style={{ top: '12px' }}>
                                    <FileText size={18} />
                                </div>
                                <textarea
                                    className="input has-icon"
                                    name="description"
                                    value={formData.description}
                                    onChange={handleChange}
                                    rows="4"
                                    placeholder="Detailed product description highlighting key features..."
                                />
                            </div>
                        </div>
                    </div>
                </section>

                {/* Section 2: Pricing & Inventory */}
                <section>
                    <h3 className="text-lg font-semibold mb-4 text-primary flex items-center gap-2">
                        <DollarSign size={20} /> Pricing & Inventory
                    </h3>
                    <div className="grid grid-cols-2 gap-6">
                        <Input
                            label="Price ($)"
                            name="price"
                            type="number"
                            step="0.01"
                            value={formData.price}
                            onChange={handleChange}
                            required
                            placeholder="0.00"
                            icon={DollarSign}
                        />

                        <Input
                            label="Stock Quantity"
                            name="stock"
                            type="number"
                            value={formData.stock}
                            onChange={handleChange}
                            required
                            placeholder="0"
                            icon={Archive}
                        />

                        <Input
                            label="SKU (Stock Keeping Unit)"
                            name="sku"
                            value={formData.sku}
                            onChange={handleChange}
                            required
                            placeholder="e.g. PROD-001"
                            icon={Hash}
                        />
                    </div>
                </section>

                {/* Section 3: Organization & Media */}
                <section>
                    <h3 className="text-lg font-semibold mb-4 text-primary flex items-center gap-2">
                        <Layers size={20} /> Organization & Media
                    </h3>
                    <div className="grid grid-cols-1 gap-6">
                        <div className="grid grid-cols-2 gap-6">
                            <Input
                                label="Category"
                                name="category"
                                value={formData.category}
                                onChange={handleChange}
                                required
                                placeholder="e.g. Electronics"
                                icon={Layers}
                            />

                            <Input
                                label="Tags"
                                name="tags"
                                value={formData.tags}
                                onChange={handleChange}
                                placeholder="electronics, wireless, sale (comma separated)"
                                icon={Tag}
                            />
                        </div>

                        <Input
                            label="Image URL"
                            name="imageUrl"
                            value={formData.imageUrl}
                            onChange={handleChange}
                            placeholder="https://example.com/image.jpg"
                            icon={ImageIcon}
                        />

                        {formData.imageUrl && (
                            <div className="mt-2 p-4 border border-color rounded-lg bg-surface flex flex-col items-center">
                                <p className="text-sm text-secondary mb-2">Image Preview</p>
                                <img
                                    src={formData.imageUrl}
                                    alt="Preview"
                                    className="max-h-48 object-contain rounded"
                                    onError={(e) => e.target.style.display = 'none'}
                                />
                            </div>
                        )}
                    </div>
                </section>

                <div className="flex justify-end gap-3 mt-8 pt-6 border-t border-color sticky bottom-0 bg-element py-4 z-10">
                    <Button variant="outline" onClick={() => navigate(-1)} type="button">
                        Cancel
                    </Button>
                    <Button variant="primary" type="submit" isLoading={isLoading} icon={Save} size="lg">
                        Save Product
                    </Button>
                </div>
            </form>
        </div>
    );
};
