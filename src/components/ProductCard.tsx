import React from 'react';
import {
  Star,
  Plus,
  Minus,
  Check,
  AlertTriangle,
  Info,
  Leaf,
  Sparkles,
  Volume2,
  Flame,
} from 'lucide-react';
import { Product } from '../types';
import { formatCurrency } from '../utils/formatters';
import { HighlightText } from './HighlightText';
import { useLanguage } from '../context/LanguageContext';

interface ProductCardProps {
  product: Product;
  cartQuantity: number;
  onAddToCart: (product: Product) => void;
  onUpdateCartQuantity: (productId: string, quantity: number) => void;
  onViewDetails: (product: Product) => void;
  onSpeakInstructions: (product: Product) => void;
  searchQuery?: string;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  cartQuantity,
  onAddToCart,
  onUpdateCartQuantity,
  onViewDetails,
  onSpeakInstructions,
  searchQuery = '',
}) => {
  const { language, t, getLocalizedProduct } = useLanguage();
  const localizedProduct = getLocalizedProduct(product);

  const LOW_STOCK_THRESHOLD = 5;
  const isOutOfStock = product.stock <= 0;
  // Stock level falls below threshold of 5 units (1 to 4 units or <= 5)
  const isLowStock = product.stock > 0 && product.stock <= LOW_STOCK_THRESHOLD;

  return (
    <div
      id={`product-card-${product.id}`}
      className={`group relative flex flex-col justify-between bg-white dark:bg-[#121c13] rounded-2xl border transition-all duration-200 overflow-hidden ${
        isLowStock
          ? 'border-amber-300 dark:border-amber-700/80 shadow-xs hover:border-amber-400 dark:hover:border-amber-600 hover:shadow-md'
          : 'border-emerald-100/90 dark:border-emerald-900/60 shadow-2xs hover:shadow-md hover:border-emerald-300 dark:hover:border-emerald-700'
      }`}
    >
      {/* Top Image Container */}
      <div className="relative aspect-4/3 overflow-hidden bg-emerald-50/50 dark:bg-[#0c140d]">
        <img
          src={product.image}
          alt={localizedProduct.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
        />

        {/* Badges Overlay */}
        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1.5 items-start">
          {product.organicCertified && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-800/90 dark:bg-emerald-900/90 backdrop-blur-xs text-white text-[10px] font-bold tracking-wide shadow-xs">
              <Leaf className="w-3 h-3 text-emerald-300" />
              <span>{t('bioCertified')}</span>
            </span>
          )}
          {product.featured && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-500/95 backdrop-blur-xs text-amber-950 text-[10px] font-black tracking-wide shadow-xs">
              <Sparkles className="w-3 h-3" />
              <span>{t('topSeller')}</span>
            </span>
          )}
        </div>

        {/* Stock Status Badge */}
        <div className="absolute top-2.5 right-2.5">
          {isOutOfStock ? (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-red-600/90 backdrop-blur-xs text-white text-[11px] font-bold shadow-xs">
              {t('outOfStock')}
            </span>
          ) : isLowStock ? (
            <span
              id={`low-stock-badge-${product.id}`}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500 text-amber-950 text-[11px] font-extrabold shadow-sm ring-2 ring-amber-400/80 animate-pulse backdrop-blur-xs"
              title={`${t('lowStock')}: ${product.stock} ${t('unitsLeft')}`}
            >
              <AlertTriangle className="w-3.5 h-3.5 fill-amber-950 text-amber-500 shrink-0" />
              <span>{t('lowStock')} ({product.stock})</span>
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50/90 dark:bg-[#162518]/90 backdrop-blur-xs text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-[10px] font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <span>{t('inStock')}</span>
            </span>
          )}
        </div>

        {/* Quick View Overlay Button */}
        <button
          onClick={() => onViewDetails(product)}
          className="absolute inset-0 bg-emerald-950/20 dark:bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity cursor-pointer"
          title={t('specifications')}
        >
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/95 dark:bg-[#142316]/95 text-emerald-900 dark:text-emerald-100 text-xs font-bold shadow-md hover:bg-white dark:hover:bg-[#1a2d1d] transition-all">
            <Info className="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-400" />
            <span>{t('specifications')}</span>
          </span>
        </button>
      </div>

      {/* Product Content */}
      <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
        <div>
          {/* Category & Rating */}
          <div className="flex items-center justify-between text-xs text-emerald-700/80 dark:text-emerald-400/80 mb-1.5">
            <span className="font-semibold uppercase tracking-wider text-[10px] bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 px-2 py-0.5 rounded-md border border-emerald-200/50 dark:border-emerald-800/50">
              <HighlightText text={localizedProduct.category} query={searchQuery} />
            </span>
            <div className="flex items-center gap-1 text-amber-600 dark:text-amber-400 font-bold">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              <span>{product.rating}</span>
              <span className="text-gray-400 dark:text-stone-400 font-normal">({product.ratingCount})</span>
            </div>
          </div>

          {/* Title */}
          <h3
            onClick={() => onViewDetails(product)}
            className="font-bold text-emerald-950 dark:text-emerald-100 text-sm leading-snug line-clamp-2 hover:text-emerald-700 dark:hover:text-emerald-400 transition-colors cursor-pointer"
            title={localizedProduct.name}
          >
            <HighlightText text={localizedProduct.name} query={searchQuery} />
          </h3>

          {/* Short Description */}
          <p className="text-xs text-emerald-900/70 dark:text-emerald-300/70 mt-1 line-clamp-2 leading-relaxed">
            <HighlightText text={localizedProduct.shortDescription} query={searchQuery} />
          </p>

          {/* Crop Compatibility Tags */}
          <div className="flex flex-wrap gap-1 mt-2.5">
            {localizedProduct.cropCompatibility.slice(0, 2).map((crop, idx) => (
              <span
                key={idx}
                className="text-[10px] font-medium px-1.5 py-0.5 rounded-sm bg-stone-100 dark:bg-[#1a291d] text-stone-700 dark:text-emerald-300 border border-stone-200/60 dark:border-emerald-900/40"
              >
                <HighlightText text={crop} query={searchQuery} />
              </span>
            ))}
            {localizedProduct.cropCompatibility.length > 2 && (
              <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-sm bg-stone-100 dark:bg-[#1a291d] text-stone-500 dark:text-emerald-400/80 border border-stone-200/60 dark:border-emerald-900/40">
                +{localizedProduct.cropCompatibility.length - 2}
              </span>
            )}
          </div>

          {/* Composition Match Indicator if search query matched composition */}
          {searchQuery &&
            product.composition.toLowerCase().includes(searchQuery.toLowerCase()) &&
            !localizedProduct.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
            !localizedProduct.shortDescription.toLowerCase().includes(searchQuery.toLowerCase()) && (
              <div className="mt-2 text-[10px] bg-amber-50/90 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-200 px-2 py-1 rounded-md">
                <span className="font-bold">Formula match: </span>
                <HighlightText text={product.composition} query={searchQuery} />
              </div>
            )}

          {/* Low Stock Urgent Notification Banner */}
          {isLowStock && (
            <div
              id={`low-stock-notification-${product.id}`}
              className="mt-2.5 p-2 rounded-xl bg-gradient-to-r from-amber-500/15 via-orange-500/10 to-amber-500/15 dark:from-amber-950/50 dark:via-orange-950/30 dark:to-amber-950/50 border border-amber-300 dark:border-amber-700/80 flex items-center justify-between gap-2 shadow-2xs"
            >
              <div className="flex items-center gap-1.5 min-w-0">
                <Flame className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0 fill-amber-500/30 animate-pulse" />
                <div className="text-[11px] leading-tight text-amber-950 dark:text-amber-200 truncate">
                  <span className="font-extrabold text-amber-900 dark:text-amber-100 uppercase tracking-wider text-[9px] mr-1 px-1.5 py-0.2 rounded-xs bg-amber-200 dark:bg-amber-800">
                    {t('lowStock')}
                  </span>
                  <span>
                    {language === 'ta'
                      ? `${product.stock} மட்டுமே கையிருப்பில்!`
                      : `Only ${product.stock} units left!`}
                  </span>
                </div>
              </div>
              <span className="shrink-0 text-[10px] font-black text-amber-800 dark:text-amber-300 bg-amber-100 dark:bg-amber-900/60 px-1.5 py-0.5 rounded-md border border-amber-300 dark:border-amber-700 uppercase tracking-tight">
                {t('orderFast')}
              </span>
            </div>
          )}
        </div>

        {/* Price & Action Section */}
        <div className="pt-3 border-t border-emerald-50 dark:border-emerald-900/40 space-y-2.5">
          <div className="flex items-baseline justify-between">
            <div>
              <div className="flex items-baseline gap-2">
                <span className="text-lg font-black text-emerald-950 dark:text-emerald-100 font-['Outfit',sans-serif]">
                  {formatCurrency(product.price)}
                </span>
                {product.originalPrice && product.originalPrice > product.price && (
                  <span className="text-xs text-gray-400 dark:text-stone-500 line-through">
                    {formatCurrency(product.originalPrice)}
                  </span>
                )}
              </div>
              <span className="text-[11px] text-emerald-700/70 dark:text-emerald-400/80 font-medium">
                {localizedProduct.unit}
              </span>
            </div>

            {/* Quick Audio Readout Trigger */}
            <button
              id={`tts-button-${product.id}`}
              onClick={() => onSpeakInstructions(product)}
              className="p-1.5 rounded-lg text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-[#1a2c1d] hover:text-emerald-900 dark:hover:text-emerald-200 transition-colors cursor-pointer"
              title={language === 'ta' ? 'பயன்பாட்டு வழிகாட்டலை குரல் வழியே கேட்கவும்' : 'Listen to usage dosage & crop tips via Gemini Voice'}
              aria-label="Listen to product instructions"
            >
              <Volume2 className="w-4 h-4" />
            </button>
          </div>

          {/* Add to Cart or Stepper */}
          {isOutOfStock ? (
            <button
              disabled
              className="w-full py-2 px-3 rounded-xl bg-gray-100 dark:bg-stone-800 text-gray-400 dark:text-stone-500 text-xs font-semibold cursor-not-allowed text-center"
            >
              {t('outOfStock')}
            </button>
          ) : cartQuantity > 0 ? (
            <div>
              <div className="flex items-center justify-between bg-emerald-50 dark:bg-[#142316] border border-emerald-200 dark:border-emerald-800 rounded-xl p-1">
                <button
                  onClick={() => onUpdateCartQuantity(product.id, cartQuantity - 1)}
                  className="w-7 h-7 rounded-lg bg-white dark:bg-[#1a2c1d] text-emerald-800 dark:text-emerald-200 flex items-center justify-center hover:bg-emerald-100 dark:hover:bg-[#233a28] shadow-2xs transition-colors cursor-pointer"
                  aria-label="Decrease quantity"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="text-xs font-bold text-emerald-950 dark:text-emerald-100 px-2">
                  {cartQuantity} {t('inCart')}
                </span>
                <button
                  onClick={() => onUpdateCartQuantity(product.id, Math.min(product.stock, cartQuantity + 1))}
                  disabled={cartQuantity >= product.stock}
                  className="w-7 h-7 rounded-lg bg-emerald-700 dark:bg-emerald-600 text-white flex items-center justify-center hover:bg-emerald-800 dark:hover:bg-emerald-500 shadow-2xs transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                  aria-label="Increase quantity"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
              {cartQuantity >= product.stock && (
                <p className="text-[10px] text-amber-700 dark:text-amber-400 font-semibold text-center mt-1">
                  {language === 'ta'
                    ? `முழு இருப்பு (${product.stock}) கூடையில் உள்ளது`
                    : `Max available stock (${product.stock}) in cart`}
                </p>
              )}
            </div>
          ) : (
            <button
              id={`add-to-cart-${product.id}`}
              onClick={() => onAddToCart(product)}
              className={`w-full py-2 px-3 rounded-xl text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-2xs transition-all active:scale-98 cursor-pointer ${
                isLowStock
                  ? 'bg-amber-600 hover:bg-amber-700 dark:bg-amber-600 dark:hover:bg-amber-500 shadow-amber-600/20 ring-1 ring-amber-500/50'
                  : 'bg-emerald-800 hover:bg-emerald-900 dark:bg-emerald-700 dark:hover:bg-emerald-600'
              }`}
            >
              {isLowStock ? (
                <>
                  <Flame className="w-3.5 h-3.5 fill-amber-200 text-amber-200" />
                  <span>
                    {language === 'ta'
                      ? `${t('claimNow')} • ${product.stock} ${t('unitsLeft')}`
                      : `${t('claimNow')} • Only ${product.stock} Left`}
                  </span>
                </>
              ) : (
                <>
                  <Plus className="w-3.5 h-3.5" />
                  <span>{t('addToCart')}</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
