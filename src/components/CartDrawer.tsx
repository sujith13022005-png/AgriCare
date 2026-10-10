import React from 'react';
import {
  X,
  ShoppingBag,
  Plus,
  Minus,
  Trash2,
  ArrowRight,
  ShieldCheck,
  Truck,
  Sparkles,
} from 'lucide-react';
import { CartItem } from '../types';
import { formatCurrency } from '../utils/formatters';
import { useLanguage } from '../context/LanguageContext';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onUpdateQuantity: (productId: string, quantity: number) => void;
  onRemoveItem: (productId: string) => void;
  onProceedToCheckout: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  items,
  onUpdateQuantity,
  onRemoveItem,
  onProceedToCheckout,
}) => {
  const { language, t, getLocalizedProduct } = useLanguage();

  if (!isOpen) return null;

  const subtotal = items.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );

  const freeDeliveryThreshold = 1000;
  const isFreeDelivery = subtotal >= freeDeliveryThreshold;
  const deliveryFee = items.length === 0 ? 0 : isFreeDelivery ? 0 : 50;
  const discount = subtotal > 2000 ? 100 : 0;
  const total = subtotal + deliveryFee - discount;
  const amountNeededForFreeDelivery = Math.max(0, freeDeliveryThreshold - subtotal);

  return (
    <div
      id="cart-drawer-backdrop"
      className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-xs flex justify-end animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        id="cart-drawer-panel"
        className="relative w-full max-w-md bg-white dark:bg-[#101912] h-full shadow-2xl flex flex-col justify-between overflow-hidden animate-in slide-in-from-right duration-300 transition-colors"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drawer Header */}
        <div className="p-4 sm:p-5 border-b border-emerald-100 dark:border-emerald-900/60 flex items-center justify-between bg-emerald-50/50 dark:bg-[#152317]">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-800 dark:bg-emerald-700 text-white flex items-center justify-center shadow-xs">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-emerald-950 dark:text-emerald-100 font-['Outfit',sans-serif]">
                {t('cartTitle')}
              </h2>
              <p className="text-xs text-emerald-700 dark:text-emerald-400">
                {items.length} {language === 'ta' ? 'பொருட்கள் கூடையில்' : items.length === 1 ? 'item in order' : 'items in order'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white dark:bg-[#1c2d1e] text-emerald-900 dark:text-emerald-200 flex items-center justify-center hover:bg-emerald-100 dark:hover:bg-[#253c29] shadow-2xs transition-colors cursor-pointer"
            aria-label={t('close')}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Free Delivery Progress Banner */}
        <div className="bg-emerald-100/60 dark:bg-[#142316] px-4 py-2.5 border-b border-emerald-200 dark:border-emerald-900/60 text-xs">
          {items.length > 0 && isFreeDelivery ? (
            <div className="flex items-center gap-1.5 text-emerald-900 dark:text-emerald-200 font-bold">
              <Truck className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
              <span>
                {language === 'ta'
                  ? 'வாழ்த்துகள்! உங்கள் ஆர்டர் இலவச கிராம விநியோகத்திற்கு தகுதி பெற்றுள்ளது.'
                  : 'Congratulations! Your order qualifies for Free Village Delivery.'}
              </span>
            </div>
          ) : (
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-emerald-900 dark:text-emerald-200 font-medium">
                <span>
                  {language === 'ta'
                    ? `இலவச விநியோகத்திற்கு இன்னும் ${formatCurrency(amountNeededForFreeDelivery)} சேர்க்கவும்`
                    : `Add ${formatCurrency(amountNeededForFreeDelivery)} more for Free Delivery`}
                </span>
                <span className="font-bold text-emerald-800 dark:text-emerald-300">
                  {Math.round((subtotal / freeDeliveryThreshold) * 100)}%
                </span>
              </div>
              <div className="w-full h-1.5 rounded-full bg-emerald-200 dark:bg-emerald-950 overflow-hidden">
                <div
                  className="h-full bg-emerald-600 dark:bg-emerald-500 rounded-full transition-all duration-300"
                  style={{ width: `${Math.min(100, (subtotal / freeDeliveryThreshold) * 100)}%` }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Items List */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3">
          {items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-3">
              <div className="w-16 h-16 rounded-full bg-emerald-50 dark:bg-[#152317] flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                <ShoppingBag className="w-8 h-8" />
              </div>
              <h3 className="text-base font-bold text-emerald-950 dark:text-emerald-100">{t('emptyCart')}</h3>
              <p className="text-xs text-emerald-700 dark:text-emerald-400 max-w-xs leading-relaxed">
                {t('emptyCartMessage')}
              </p>
              <button
                onClick={onClose}
                className="mt-2 px-5 py-2.5 rounded-xl bg-emerald-800 hover:bg-emerald-900 dark:bg-emerald-700 dark:hover:bg-emerald-600 text-white text-xs font-bold shadow-xs transition-all cursor-pointer"
              >
                {t('browseCatalog')}
              </button>
            </div>
          ) : (
            items.map(({ product, quantity }) => {
              const localizedProduct = getLocalizedProduct(product);
              return (
                <div
                  key={product.id}
                  className="flex items-center gap-3 p-3 rounded-2xl bg-white dark:bg-[#142016] border border-emerald-100 dark:border-emerald-900/60 shadow-2xs hover:border-emerald-200 dark:hover:border-emerald-800 transition-colors"
                >
                  <img
                    src={product.image}
                    alt={localizedProduct.name}
                    className="w-16 h-16 rounded-xl object-cover border border-emerald-50 dark:border-emerald-900/40 shrink-0"
                  />

                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs font-bold text-emerald-950 dark:text-emerald-100 truncate" title={localizedProduct.name}>
                      {localizedProduct.name}
                    </h4>
                    <p className="text-[11px] text-emerald-700 dark:text-emerald-400">{localizedProduct.unit}</p>
                    <p className="text-xs font-black text-emerald-950 dark:text-emerald-100 mt-1">
                      {formatCurrency(product.price)}
                    </p>
                  </div>

                  {/* Stepper & Trash */}
                  <div className="flex flex-col items-end gap-1.5 shrink-0">
                    <button
                      onClick={() => onRemoveItem(product.id)}
                      className="text-stone-400 dark:text-stone-500 hover:text-red-600 dark:hover:text-red-400 transition-colors p-1 cursor-pointer"
                      title={language === 'ta' ? 'நீக்கு' : 'Remove item'}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>

                    <div className="flex items-center border border-emerald-200 dark:border-emerald-800 rounded-lg bg-emerald-50/60 dark:bg-[#1c2d1e] p-0.5">
                      <button
                        onClick={() => onUpdateQuantity(product.id, quantity - 1)}
                        className="w-6 h-6 rounded bg-white dark:bg-[#152417] text-emerald-900 dark:text-emerald-200 flex items-center justify-center hover:bg-emerald-100 dark:hover:bg-[#253c29] shadow-2xs cursor-pointer"
                        aria-label="Decrease quantity"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="w-6 text-center text-xs font-bold text-emerald-950 dark:text-emerald-100">
                        {quantity}
                      </span>
                      <button
                        onClick={() => onUpdateQuantity(product.id, Math.min(product.stock, quantity + 1))}
                        disabled={quantity >= product.stock}
                        className="w-6 h-6 rounded bg-emerald-700 dark:bg-emerald-600 text-white flex items-center justify-center hover:bg-emerald-800 dark:hover:bg-emerald-500 shadow-2xs disabled:opacity-40 cursor-pointer"
                        aria-label="Increase quantity"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Order Summary & Checkout CTA */}
        {items.length > 0 && (
          <div className="p-4 sm:p-5 border-t border-emerald-100 dark:border-emerald-900/60 bg-emerald-50/40 dark:bg-[#152317] space-y-3">
            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between text-emerald-900 dark:text-emerald-200">
                <span>{t('subtotal')}</span>
                <span className="font-semibold">{formatCurrency(subtotal)}</span>
              </div>
              <div className="flex justify-between text-emerald-900 dark:text-emerald-200">
                <span>{t('deliveryFee')}</span>
                <span>
                  {deliveryFee === 0 ? (
                    <span className="text-emerald-700 dark:text-emerald-400 font-bold">{t('free')}</span>
                  ) : (
                    formatCurrency(deliveryFee)
                  )}
                </span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-emerald-700 dark:text-emerald-400 font-medium">
                  <span>{t('farmerDiscount')}</span>
                  <span>-{formatCurrency(discount)}</span>
                </div>
              )}
              <div className="pt-2 border-t border-emerald-200/60 dark:border-emerald-800/60 flex justify-between text-base font-black text-emerald-950 dark:text-emerald-100 font-['Outfit',sans-serif]">
                <span>{t('total')}</span>
                <span>{formatCurrency(total)}</span>
              </div>
            </div>

            <button
              id="proceed-to-checkout-button"
              onClick={onProceedToCheckout}
              className="w-full py-3.5 px-4 rounded-2xl bg-emerald-800 hover:bg-emerald-900 dark:bg-emerald-700 dark:hover:bg-emerald-600 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-md transition-all active:scale-98 cursor-pointer"
            >
              <span>{t('proceedToCheckout')}</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <div className="flex items-center justify-center gap-2 text-[11px] text-emerald-700 dark:text-emerald-400 font-medium">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>
                {language === 'ta'
                  ? 'டெலிவரிக்கு பின் பணம் (COD) மற்றும் நேரடி UPI ஏற்கப்படும்'
                  : 'Cash on Delivery & Direct UPI Accepted'}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
