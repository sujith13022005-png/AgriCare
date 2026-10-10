import React, { useState } from 'react';
import {
  X,
  Plus,
  Image,
  Sprout,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Sparkles,
} from 'lucide-react';
import { ProductCategory, Product } from '../types';

interface AddProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddProduct: (productData: Partial<Product>) => Promise<void>;
}

const CATEGORIES: ProductCategory[] = [
  'Seeds',
  'Fertilizers',
  'Pesticides',
  'Farm Tools',
  'Organic Nutrients',
];

const IMAGE_PRESETS = [
  { label: 'Hybrid Paddy / Seeds', url: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=800&q=80' },
  { label: 'Wheat Grains', url: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&w=800&q=80' },
  { label: 'NPK Fertilizer Granules', url: 'https://images.unsplash.com/photo-1628352081506-83c43123ed6d?auto=format&fit=crop&w=800&q=80' },
  { label: 'Liquid Bio-Nutrient Bottle', url: 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?auto=format&fit=crop&w=800&q=80' },
  { label: 'Knapsack Farm Sprayer', url: 'https://images.unsplash.com/photo-1599818816827-023a1058fa19?auto=format&fit=crop&w=800&q=80' },
  { label: 'Organic Compost Sack', url: 'https://images.unsplash.com/photo-1588628566587-dbd176de94b4?auto=format&fit=crop&w=800&q=80' },
];

export const AddProductModal: React.FC<AddProductModalProps> = ({
  isOpen,
  onClose,
  onAddProduct,
}) => {
  const [name, setName] = useState('');
  const [category, setCategory] = useState<ProductCategory>('Seeds');
  const [price, setPrice] = useState<number>(450);
  const [originalPrice, setOriginalPrice] = useState<number>(500);
  const [unit, setUnit] = useState('1 kg pack');
  const [stock, setStock] = useState<number>(15);
  const [lowStockThreshold, setLowStockThreshold] = useState<number>(5);
  const [image, setImage] = useState(IMAGE_PRESETS[0].url);
  const [shortDescription, setShortDescription] = useState('');
  const [description, setDescription] = useState('');
  const [cropCompatibility, setCropCompatibility] = useState('Paddy, Wheat, Vegetables');
  const [usageInstructions, setUsageInstructions] = useState('');
  const [composition, setComposition] = useState('');
  const [organicCertified, setOrganicCertified] = useState(false);
  const [featured, setFeatured] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError('Product title is required.');
      return;
    }
    if (!price || price <= 0) {
      setError('Please provide a valid price.');
      return;
    }

    setIsSubmitting(true);
    try {
      await onAddProduct({
        name: name.trim(),
        category,
        price: Number(price),
        originalPrice: originalPrice ? Number(originalPrice) : undefined,
        unit: unit.trim(),
        stock: Number(stock),
        lowStockThreshold: Number(lowStockThreshold),
        image: image.trim(),
        shortDescription: shortDescription.trim() || `${category} formulated for high agricultural yield.`,
        description: description.trim() || shortDescription.trim() || 'Premium agricultural input from AgriCare Farm Supplies.',
        cropCompatibility: cropCompatibility.split(',').map((s) => s.trim()).filter(Boolean),
        usageInstructions: usageInstructions.trim() || 'Follow recommended agricultural dosage guidelines for your region.',
        composition: composition.trim() || 'Certified Agricultural Grade',
        organicCertified,
        featured,
      });

      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to save product');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      id="add-product-modal-backdrop"
      className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        id="add-product-modal-content"
        className="relative w-full max-w-2xl bg-white dark:bg-[#101912] rounded-3xl shadow-2xl border border-emerald-100 dark:border-emerald-900/60 overflow-hidden transition-colors"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-4 sm:p-5 border-b border-emerald-100 dark:border-emerald-900/60 flex items-center justify-between bg-emerald-50/70 dark:bg-[#142016]">
          <div>
            <h2 className="text-xl font-bold text-emerald-950 dark:text-emerald-100 font-['Outfit',sans-serif]">
              Add New Agricultural Product
            </h2>
            <p className="text-xs text-emerald-700 dark:text-emerald-400">
              List new seeds, fertilizers, pesticides, tools, or organic nutrients
            </p>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white dark:bg-[#1e2f21] text-emerald-900 dark:text-emerald-200 flex items-center justify-center hover:bg-emerald-100 dark:hover:bg-[#273d2b] shadow-2xs transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          {error && (
            <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900/60 text-red-800 dark:text-red-300 text-xs font-medium">
              {error}
            </div>
          )}

          {/* Title & Category */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2 space-y-1.5">
              <label htmlFor="product-name" className="text-xs font-bold text-emerald-950 dark:text-emerald-200">Product Name *</label>
              <input
                id="product-name"
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. BioShield Trichoderma Viride Organic Fungicide"
                className="w-full px-3 py-2 rounded-xl bg-white dark:bg-[#152317] border border-emerald-200 dark:border-emerald-800 text-emerald-950 dark:text-emerald-100 text-xs focus:border-emerald-600 dark:focus:border-emerald-500 outline-hidden"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="product-category" className="text-xs font-bold text-emerald-950 dark:text-emerald-200">Category *</label>
              <select
                id="product-category"
                value={category}
                onChange={(e) => setCategory(e.target.value as ProductCategory)}
                className="w-full px-3 py-2 rounded-xl border border-emerald-200 dark:border-emerald-800 text-emerald-950 dark:text-emerald-100 text-xs bg-white dark:bg-[#152317] focus:border-emerald-600 dark:focus:border-emerald-500 outline-hidden"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Pricing, Unit, Stock */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="space-y-1.5">
              <label htmlFor="product-price" className="text-xs font-bold text-emerald-950 dark:text-emerald-200">Price (₹) *</label>
              <input
                id="product-price"
                type="number"
                required
                min={1}
                value={price}
                onChange={(e) => setPrice(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl bg-white dark:bg-[#152317] border border-emerald-200 dark:border-emerald-800 text-emerald-950 dark:text-emerald-100 text-xs focus:border-emerald-600 dark:focus:border-emerald-500 outline-hidden"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="product-original-price" className="text-xs font-bold text-emerald-950 dark:text-emerald-200">MRP / List (₹)</label>
              <input
                id="product-original-price"
                type="number"
                value={originalPrice}
                onChange={(e) => setOriginalPrice(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl bg-white dark:bg-[#152317] border border-emerald-200 dark:border-emerald-800 text-emerald-950 dark:text-emerald-100 text-xs focus:border-emerald-600 dark:focus:border-emerald-500 outline-hidden"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="product-unit" className="text-xs font-bold text-emerald-950 dark:text-emerald-200">Unit / Pack Size</label>
              <input
                id="product-unit"
                type="text"
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                placeholder="e.g. 5 kg bag"
                className="w-full px-3 py-2 rounded-xl bg-white dark:bg-[#152317] border border-emerald-200 dark:border-emerald-800 text-emerald-950 dark:text-emerald-100 text-xs focus:border-emerald-600 dark:focus:border-emerald-500 outline-hidden"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="product-stock" className="text-xs font-bold text-emerald-950 dark:text-emerald-200">
                Initial Stock
              </label>
              <input
                id="product-stock"
                type="number"
                min={0}
                value={stock}
                onChange={(e) => setStock(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl bg-white dark:bg-[#152317] border border-emerald-200 dark:border-emerald-800 text-emerald-950 dark:text-emerald-100 text-xs focus:border-emerald-600 dark:focus:border-emerald-500 outline-hidden"
              />
            </div>
          </div>

          {/* Image Presets & Custom URL */}
          <div className="space-y-2">
            <label htmlFor="product-image-url" className="text-xs font-bold text-emerald-950 dark:text-emerald-200 flex items-center justify-between">
              <span>Product Image URL</span>
              <span className="text-[11px] text-emerald-700 dark:text-emerald-400 font-normal">Click a sample photo preset or paste link</span>
            </label>
            <div className="flex gap-2 overflow-x-auto pb-1">
              {IMAGE_PRESETS.map((p, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setImage(p.url)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold whitespace-nowrap border transition-all cursor-pointer ${
                    image === p.url
                      ? 'bg-emerald-700 text-white border-emerald-700'
                      : 'bg-emerald-50 dark:bg-[#152317] text-emerald-900 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100 dark:hover:bg-[#1e2f21]'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
            <input
              id="product-image-url"
              type="url"
              required
              value={image}
              onChange={(e) => setImage(e.target.value)}
              placeholder="https://..."
              className="w-full px-3 py-2 rounded-xl bg-white dark:bg-[#152317] border border-emerald-200 dark:border-emerald-800 text-emerald-950 dark:text-emerald-100 text-xs focus:border-emerald-600 dark:focus:border-emerald-500 outline-hidden font-mono"
            />
          </div>

          {/* Short & Full Description */}
          <div className="space-y-1.5">
            <label htmlFor="product-short-desc" className="text-xs font-bold text-emerald-950 dark:text-emerald-200">Short Summary</label>
            <input
              id="product-short-desc"
              type="text"
              value={shortDescription}
              onChange={(e) => setShortDescription(e.target.value)}
              placeholder="One line summary shown on product card..."
              className="w-full px-3 py-2 rounded-xl bg-white dark:bg-[#152317] border border-emerald-200 dark:border-emerald-800 text-emerald-950 dark:text-emerald-100 text-xs focus:border-emerald-600 dark:focus:border-emerald-500 outline-hidden"
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="product-full-desc" className="text-xs font-bold text-emerald-950 dark:text-emerald-200">Full Description</label>
            <textarea
              id="product-full-desc"
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Detailed benefits, disease resistance, shelf life..."
              className="w-full px-3 py-2 rounded-xl bg-white dark:bg-[#152317] border border-emerald-200 dark:border-emerald-800 text-emerald-950 dark:text-emerald-100 text-xs focus:border-emerald-600 dark:focus:border-emerald-500 outline-hidden"
            />
          </div>

          {/* Crop Compatibility & Usage Instructions */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label htmlFor="product-crop-comp" className="text-xs font-bold text-emerald-950 dark:text-emerald-200">
                Compatible Crop Types (comma-separated)
              </label>
              <input
                id="product-crop-comp"
                type="text"
                value={cropCompatibility}
                onChange={(e) => setCropCompatibility(e.target.value)}
                placeholder="e.g. Paddy, Wheat, Cotton, Chillies"
                className="w-full px-3 py-2 rounded-xl bg-white dark:bg-[#152317] border border-emerald-200 dark:border-emerald-800 text-emerald-950 dark:text-emerald-100 text-xs focus:border-emerald-600 dark:focus:border-emerald-500 outline-hidden"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="product-composition" className="text-xs font-bold text-emerald-950 dark:text-emerald-200">
                Composition / Formulation
              </label>
              <input
                id="product-composition"
                type="text"
                value={composition}
                onChange={(e) => setComposition(e.target.value)}
                placeholder="e.g. 100% Water Soluble NPK 19-19-19"
                className="w-full px-3 py-2 rounded-xl bg-white dark:bg-[#152317] border border-emerald-200 dark:border-emerald-800 text-emerald-950 dark:text-emerald-100 text-xs focus:border-emerald-600 dark:focus:border-emerald-500 outline-hidden font-mono"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="product-usage-instructions" className="text-xs font-bold text-emerald-950 dark:text-emerald-200">
              Dosage & Application Instructions
            </label>
            <textarea
              id="product-usage-instructions"
              rows={2}
              value={usageInstructions}
              onChange={(e) => setUsageInstructions(e.target.value)}
              placeholder="e.g. Foliar spray: 3-5 g per liter of water. Apply at vegetative stage."
              className="w-full px-3 py-2 rounded-xl bg-white dark:bg-[#152317] border border-emerald-200 dark:border-emerald-800 text-emerald-950 dark:text-emerald-100 text-xs focus:border-emerald-600 dark:focus:border-emerald-500 outline-hidden"
            />
          </div>

          {/* Checkboxes: Organic Certified & Featured */}
          <div className="flex items-center gap-6 pt-1">
            <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-emerald-950 dark:text-emerald-200">
              <input
                type="checkbox"
                checked={organicCertified}
                onChange={(e) => setOrganicCertified(e.target.checked)}
                className="w-4 h-4 rounded-sm text-emerald-700 accent-emerald-700"
              />
              <span>100% Organic Certified</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-emerald-950 dark:text-emerald-200">
              <input
                type="checkbox"
                checked={featured}
                onChange={(e) => setFeatured(e.target.checked)}
                className="w-4 h-4 rounded-sm text-emerald-700 accent-emerald-700"
              />
              <span>Featured Top Seller</span>
            </label>
          </div>

          {/* Submit */}
          <div className="pt-4 border-t border-emerald-100 dark:border-emerald-900/60 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-stone-200 dark:border-emerald-800 text-stone-700 dark:text-emerald-300 text-xs font-semibold hover:bg-stone-50 dark:hover:bg-[#152317] cursor-pointer transition-colors"
            >
              Cancel
            </button>

            <button
              id="submit-new-product-btn"
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 rounded-xl bg-emerald-800 hover:bg-emerald-900 dark:bg-emerald-700 dark:hover:bg-emerald-600 text-white font-bold text-xs flex items-center gap-2 shadow-xs transition-all disabled:opacity-50 cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Saving Product...</span>
                </>
              ) : (
                <>
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Product to Catalog</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
