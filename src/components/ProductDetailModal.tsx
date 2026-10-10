import React, { useState, useEffect } from 'react';
import {
  X,
  Star,
  Sprout,
  ShieldCheck,
  AlertTriangle,
  Volume2,
  VolumeX,
  Loader2,
  Plus,
  Minus,
  CheckCircle2,
  Leaf,
  Layers,
  Sparkles,
  Flame,
} from 'lucide-react';
import { Product } from '../types';
import { formatCurrency } from '../utils/formatters';
import { HighlightText } from './HighlightText';
import { useLanguage } from '../context/LanguageContext';

interface ProductDetailModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  cartQuantity: number;
  onAddToCart: (product: Product, quantity?: number) => void;
  onUpdateCartQuantity: (productId: string, quantity: number) => void;
  isPlayingAudio: boolean;
  isLoadingAudio: boolean;
  onToggleAudio: (text: string) => void;
  searchQuery?: string;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  isOpen,
  onClose,
  cartQuantity,
  onAddToCart,
  onUpdateCartQuantity,
  isPlayingAudio,
  isLoadingAudio,
  onToggleAudio,
  searchQuery = '',
}) => {
  const { language, t, getLocalizedProduct } = useLanguage();
  const [localQty, setLocalQty] = useState(cartQuantity > 0 ? cartQuantity : 1);

  // Synchronize localQty whenever cartQuantity or active product changes
  useEffect(() => {
    setLocalQty(cartQuantity > 0 ? cartQuantity : 1);
  }, [cartQuantity, product?.id]);

  if (!isOpen || !product) return null;

  const localizedProduct = getLocalizedProduct(product);
  const LOW_STOCK_THRESHOLD = 5;
  const isOutOfStock = product.stock <= 0;
  const isLowStock = product.stock > 0 && product.stock <= LOW_STOCK_THRESHOLD;

  const speechScript = language === 'ta'
    ? `${localizedProduct.name}. பேக்கிங் அளவு: ${localizedProduct.unit}. ஏற்ற பயிர்கள்: ${localizedProduct.cropCompatibility.join(', ')}. பயன்படுத்தும் முறை: ${localizedProduct.usageInstructions}. கலவை: ${localizedProduct.composition}. பாதுகாப்பு குறிப்பு: ${localizedProduct.safetyNotes || 'நிலையான பாதுகாப்பு நெறிமுறைகளைப் பின்பற்றவும்.'}`
    : `${localizedProduct.name}. Pack size: ${localizedProduct.unit}. Suitable for crops: ${localizedProduct.cropCompatibility.join(', ')}. Usage instructions: ${localizedProduct.usageInstructions}. Composition: ${localizedProduct.composition}. Safety note: ${localizedProduct.safetyNotes || 'Follow standard farm protective measures.'}`;

  return (
    <div
      id="product-detail-modal-backdrop"
      className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        id="product-detail-modal-content"
        className="relative w-full max-w-3xl bg-white dark:bg-[#101912] rounded-3xl shadow-2xl border border-emerald-100 dark:border-emerald-900/60 overflow-hidden transition-colors"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-9 h-9 rounded-full bg-white/90 dark:bg-[#152317]/90 hover:bg-white dark:hover:bg-[#1c3020] text-emerald-950 dark:text-emerald-100 flex items-center justify-center shadow-md transition-all cursor-pointer"
          aria-label={t('close')}
        >
          <X className="w-5 h-5" />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-12 max-h-[90vh] overflow-y-auto">
          {/* Left Column: Product Image & Badges */}
          <div className="md:col-span-5 bg-emerald-50/40 dark:bg-[#0c140d] p-6 flex flex-col justify-between border-b md:border-b-0 md:border-r border-emerald-100 dark:border-emerald-900/60">
            <div className="space-y-4">
              <div className="relative aspect-square rounded-2xl overflow-hidden shadow-inner border border-emerald-100 dark:border-emerald-900/60">
                <img
                  src={product.image}
                  alt={localizedProduct.name}
                  className="w-full h-full object-cover"
                />
                {product.organicCertified && (
                  <span className="absolute top-3 left-3 inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-emerald-800 dark:bg-emerald-700 text-white text-xs font-bold shadow-md">
                    <Leaf className="w-3.5 h-3.5 text-emerald-300" />
                    {t('bioCertified')}
                  </span>
                )}
                {isLowStock && (
                  <span
                    id={`modal-low-stock-badge-${product.id}`}
                    className="absolute top-3 right-3 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500 text-amber-950 text-xs font-extrabold shadow-md ring-2 ring-amber-300 animate-pulse"
                  >
                    <AlertTriangle className="w-3.5 h-3.5 fill-amber-950 text-amber-500" />
                    <span>{t('lowStock')} ({product.stock})</span>
                  </span>
                )}
              </div>

              {/* Quick Info Badges */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs p-2.5 rounded-xl bg-white dark:bg-[#142015] border border-emerald-100 dark:border-emerald-900/60">
                  <span className="text-emerald-700 dark:text-emerald-400 font-medium">
                    {language === 'ta' ? 'வகை:' : 'Category:'}
                  </span>
                  <span className="font-bold text-emerald-950 dark:text-emerald-100">{localizedProduct.category}</span>
                </div>
                <div className="flex items-center justify-between text-xs p-2.5 rounded-xl bg-white dark:bg-[#142015] border border-emerald-100 dark:border-emerald-900/60">
                  <span className="text-emerald-700 dark:text-emerald-400 font-medium">
                    {language === 'ta' ? 'அளவு:' : 'Pack / Unit:'}
                  </span>
                  <span className="font-bold text-emerald-950 dark:text-emerald-100">{localizedProduct.unit}</span>
                </div>
                <div className="flex items-center justify-between text-xs p-2.5 rounded-xl bg-white dark:bg-[#142015] border border-emerald-100 dark:border-emerald-900/60">
                  <span className="text-emerald-700 dark:text-emerald-400 font-medium">
                    {language === 'ta' ? 'இருப்பு நிலை:' : 'Availability:'}
                  </span>
                  <span
                    className={`font-bold ${
                      isOutOfStock
                        ? 'text-red-600 dark:text-red-400'
                        : isLowStock
                        ? 'text-amber-600 dark:text-amber-400'
                        : 'text-emerald-700 dark:text-emerald-300'
                    }`}
                  >
                    {isOutOfStock
                      ? t('outOfStock')
                      : isLowStock
                      ? `${t('lowStock')}: ${product.stock} ${t('unitsLeft')}`
                      : `${product.stock} ${language === 'ta' ? 'கையிருப்பில் உள்ளது' : 'units available'}`}
                  </span>
                </div>

                {isLowStock && (
                  <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-700 text-amber-950 dark:text-amber-200 text-xs flex items-center gap-2">
                    <Flame className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 fill-amber-500/30 animate-bounce" />
                    <span>
                      <strong>{language === 'ta' ? 'அதிக தேவை:' : 'High Demand Item:'} </strong>
                      {language === 'ta'
                        ? '5 எண்ணிக்கைக்கு கீழ் இருப்பு உள்ளது. உடனே ஆர்டர் செய்து பெற்றுக்கொள்ளுங்கள்.'
                        : 'Stock is under 5 units. Please complete your order promptly to secure your quantity.'}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Audio Directions Player (Powered by Gemini TTS) */}
            <div className="mt-4 p-3.5 rounded-2xl bg-emerald-900 dark:bg-[#0a2012] text-emerald-100 border border-emerald-800 dark:border-emerald-800/60 shadow-xs">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-emerald-800 dark:bg-emerald-700 flex items-center justify-center text-emerald-300">
                    <Volume2 className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-white">{t('audioReader')}</p>
                    <p className="text-[10px] text-emerald-300">Gemini 3.1 TTS</p>
                  </div>
                </div>

                <button
                  id="modal-tts-play-button"
                  onClick={() => onToggleAudio(speechScript)}
                  disabled={isLoadingAudio}
                  className="px-3 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-emerald-950 text-xs font-black flex items-center gap-1.5 shadow-xs transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
                >
                  {isLoadingAudio ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>{t('loadingVoice')}</span>
                    </>
                  ) : isPlayingAudio ? (
                    <>
                      <VolumeX className="w-3.5 h-3.5" />
                      <span>{t('stop')}</span>
                    </>
                  ) : (
                    <>
                      <Volume2 className="w-3.5 h-3.5" />
                      <span>{t('listenAloud')}</span>
                    </>
                  )}
                </button>
              </div>
              {isPlayingAudio && (
                <div className="mt-2 flex items-center gap-1">
                  <span className="w-1 h-3 bg-amber-400 animate-pulse rounded-full" />
                  <span className="w-1 h-5 bg-amber-300 animate-pulse rounded-full delay-75" />
                  <span className="w-1 h-4 bg-amber-400 animate-pulse rounded-full delay-150" />
                  <span className="text-[10px] text-emerald-200 ml-1.5">
                    {language === 'ta'
                      ? 'விவசாய வழிகாட்டல் குரல் இயங்குகிறது...'
                      : 'Playing natural voice instructions for field use...'}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Detailed Specifications */}
          <div className="md:col-span-7 p-6 flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              {/* Heading & Price */}
              <div>
                <div className="flex items-center gap-2 text-xs text-amber-600 dark:text-amber-400 font-bold mb-1">
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                    <span>{product.rating}</span>
                  </div>
                  <span className="text-gray-400 dark:text-stone-500">•</span>
                  <span className="text-gray-500 dark:text-stone-400 font-normal">
                    {product.ratingCount} {language === 'ta' ? 'விவசாயிகளின் மதிப்பீடுகள்' : 'Verified Farmer Reviews'}
                  </span>
                </div>

                <h2 className="text-xl sm:text-2xl font-extrabold text-emerald-950 dark:text-emerald-100 font-['Outfit',sans-serif] leading-tight">
                  <HighlightText text={localizedProduct.name} query={searchQuery} />
                </h2>

                <div className="flex items-baseline gap-3 mt-2">
                  <span className="text-2xl font-black text-emerald-950 dark:text-emerald-100 font-['Outfit',sans-serif]">
                    {formatCurrency(product.price)}
                  </span>
                  {product.originalPrice && product.originalPrice > product.price && (
                    <span className="text-sm text-gray-400 dark:text-stone-500 line-through">
                      {formatCurrency(product.originalPrice)}
                    </span>
                  )}
                  {product.originalPrice && product.originalPrice > product.price && (
                    <span className="text-xs font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/80 px-2 py-0.5 rounded-md border border-emerald-200 dark:border-emerald-800">
                      {language === 'ta' ? 'சேமிப்பு' : 'Save'} {formatCurrency(product.originalPrice - product.price)}
                    </span>
                  )}
                </div>
              </div>

              {/* Full Description */}
              <div>
                <h3 className="text-xs font-bold text-emerald-900 dark:text-emerald-300 uppercase tracking-wider mb-1">
                  {language === 'ta' ? 'பொருள் விவரம்' : 'Product Overview'}
                </h3>
                <p className="text-sm text-emerald-900/80 dark:text-emerald-200/80 leading-relaxed">
                  <HighlightText text={localizedProduct.description} query={searchQuery} />
                </p>
              </div>

              {/* Crop Type Compatibility */}
              <div className="p-3.5 rounded-2xl bg-emerald-50/70 dark:bg-[#152317] border border-emerald-200/80 dark:border-emerald-800/80 space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold text-emerald-900 dark:text-emerald-200">
                  <Sprout className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
                  <span>{t('suitableFor')}</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {localizedProduct.cropCompatibility.map((crop, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-1 rounded-lg bg-white dark:bg-[#1d3121] text-emerald-900 dark:text-emerald-100 text-xs font-semibold border border-emerald-200 dark:border-emerald-800 shadow-2xs"
                    >
                      <HighlightText text={crop} query={searchQuery} />
                    </span>
                  ))}
                </div>
              </div>

              {/* Usage Instructions & Dosage */}
              <div className="space-y-1.5">
                <h3 className="text-xs font-bold text-emerald-900 dark:text-emerald-300 uppercase tracking-wider flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
                  <span>{t('usageAndDosage')}</span>
                </h3>
                <div className="p-3.5 rounded-2xl bg-stone-50 dark:bg-[#142015] border border-stone-200 dark:border-emerald-900/60 text-xs text-stone-800 dark:text-emerald-100 leading-relaxed font-medium">
                  <HighlightText text={localizedProduct.usageInstructions} query={searchQuery} />
                </div>
              </div>

              {/* Chemical / Organic Composition */}
              <div className="space-y-1">
                <h3 className="text-xs font-bold text-emerald-900 dark:text-emerald-300 uppercase tracking-wider">
                  {language === 'ta' ? 'வேதியியல் / இயற்கை கலவை' : 'Active Composition & Specification'}
                </h3>
                <p className="text-xs text-emerald-800 dark:text-emerald-300 bg-emerald-50/50 dark:bg-[#142015] p-2.5 rounded-xl border border-emerald-100 dark:border-emerald-900/60 font-mono">
                  <HighlightText text={localizedProduct.composition} query={searchQuery} />
                </p>
              </div>

              {/* Safety Precautions if available */}
              {localizedProduct.safetyNotes && (
                <div className="flex items-start gap-2 p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 text-amber-900 dark:text-amber-200 text-xs">
                  <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                  <span>
                    <strong>{language === 'ta' ? 'பாதுகாப்பு & சேமிப்பு: ' : 'Safety & Storage: '}</strong>
                    <HighlightText text={localizedProduct.safetyNotes} query={searchQuery} />
                  </span>
                </div>
              )}
            </div>

            {/* Bottom Actions Bar */}
            <div className="pt-4 border-t border-emerald-100 dark:border-emerald-900/60 flex items-center justify-between gap-4">
              {/* Quantity Stepper */}
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-emerald-900 dark:text-emerald-300 hidden sm:inline">
                  {language === 'ta' ? 'அளவு:' : 'Qty:'}
                </span>
                <div className="flex items-center border border-emerald-200 dark:border-emerald-800 rounded-xl bg-emerald-50/50 dark:bg-[#152317] p-1">
                  <button
                    onClick={() => setLocalQty(Math.max(1, localQty - 1))}
                    disabled={localQty <= 1 || isOutOfStock}
                    className="w-8 h-8 rounded-lg bg-white dark:bg-[#1d3121] text-emerald-900 dark:text-emerald-100 flex items-center justify-center hover:bg-emerald-100 dark:hover:bg-[#253e2a] transition-colors disabled:opacity-40 cursor-pointer"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="w-8 text-center text-sm font-bold text-emerald-950 dark:text-emerald-100">
                    {localQty}
                  </span>
                  <button
                    onClick={() => setLocalQty(Math.min(product.stock, localQty + 1))}
                    disabled={localQty >= product.stock || isOutOfStock}
                    className="w-8 h-8 rounded-lg bg-white dark:bg-[#1d3121] text-emerald-900 dark:text-emerald-100 flex items-center justify-center hover:bg-emerald-100 dark:hover:bg-[#253e2a] transition-colors disabled:opacity-40 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Add to Cart Button */}
              <button
                id="modal-add-to-cart-submit"
                onClick={() => {
                  if (cartQuantity > 0) {
                    onUpdateCartQuantity(product.id, localQty);
                  } else {
                    onAddToCart(product, localQty);
                  }
                  onClose();
                }}
                disabled={isOutOfStock}
                className={`flex-1 py-3 px-5 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 shadow-md transition-all active:scale-98 disabled:bg-gray-200 dark:disabled:bg-stone-800 disabled:text-gray-400 dark:disabled:text-stone-500 disabled:cursor-not-allowed cursor-pointer ${
                  isOutOfStock
                    ? ''
                    : isLowStock
                    ? 'bg-amber-600 hover:bg-amber-700 dark:bg-amber-600 dark:hover:bg-amber-500 text-white shadow-amber-600/20 ring-1 ring-amber-500/50'
                    : 'bg-emerald-800 hover:bg-emerald-900 dark:bg-emerald-700 dark:hover:bg-emerald-600 text-white'
                }`}
              >
                {isLowStock && !isOutOfStock ? (
                  <Flame className="w-4 h-4 fill-amber-200 text-amber-200" />
                ) : (
                  <Plus className="w-4 h-4" />
                )}
                <span>
                  {isOutOfStock
                    ? t('outOfStock')
                    : isLowStock
                    ? `${t('claimNow')} ${localQty} • ${formatCurrency(product.price * localQty)}`
                    : `${t('addToCart')} (${localQty}) • ${formatCurrency(product.price * localQty)}`}
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
