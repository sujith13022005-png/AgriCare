import React from 'react';
import {
  CheckCircle,
  Package,
  MapPin,
  Phone,
  Printer,
  ShoppingBag,
  Clock,
  Sparkles,
  X,
} from 'lucide-react';
import { Order } from '../types';
import { formatCurrency } from '../utils/formatters';
import { useLanguage } from '../context/LanguageContext';

interface OrderSuccessModalProps {
  order: Order | null;
  isOpen: boolean;
  onClose: () => void;
}

export const OrderSuccessModal: React.FC<OrderSuccessModalProps> = ({
  order,
  isOpen,
  onClose,
}) => {
  const { language, t } = useLanguage();

  if (!isOpen || !order) return null;

  return (
    <div
      id="order-success-modal-backdrop"
      className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        id="order-success-modal-content"
        className="relative w-full max-w-xl bg-white dark:bg-[#101912] rounded-3xl shadow-2xl border border-emerald-100 dark:border-emerald-900/60 overflow-hidden transition-colors"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="bg-gradient-to-br from-emerald-800 to-green-900 text-white p-6 text-center relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-emerald-200 hover:text-white"
            aria-label={t('close')}
          >
            <X className="w-5 h-5" />
          </button>

          <div className="w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center mx-auto mb-3 text-emerald-300 ring-4 ring-white/10">
            <CheckCircle className="w-9 h-9 text-emerald-300" />
          </div>

          <h2 className="text-2xl font-black font-['Outfit',sans-serif]">
            {language === 'ta' ? 'ஆர்டர் வெற்றிகரமாக பதிவு செய்யப்பட்டது!' : 'Order Successfully Placed!'}
          </h2>
          <p className="text-xs text-emerald-200 mt-1">
            {language === 'ta' ? 'ஆர்டர் குறிப்பு எண்:' : 'Order Reference:'}{' '}
            <span className="font-mono font-bold text-amber-300">{order.id}</span>
          </p>
        </div>

        {/* Receipt Content */}
        <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          {/* Dispatch Notice */}
          <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-[#152317] border border-emerald-200/80 dark:border-emerald-800 flex items-start gap-3 text-xs text-emerald-900 dark:text-emerald-200">
            <Clock className="w-4 h-4 text-emerald-700 dark:text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">
                {language === 'ta' ? 'விவசாய விநியோகம் திட்டமிடப்பட்டுள்ளது' : 'Farm Gate Dispatch Scheduled'}
              </p>
              <p className="text-emerald-800 dark:text-emerald-300 mt-0.5">
                {language === 'ta'
                  ? `பொருட்கள் அனுப்பப்படும் முன் எங்கள் தளவாட ஒருங்கிணைப்பாளர் ${order.phone} எண்ணை தொடர்புகொள்வார். மதிப்பிடப்பட்ட விநியோகம்: 24 - 48 மணிநேரம்.`
                  : `Our logistics coordinator will call ${order.phone} before dispatch. Estimated delivery: 24 to 48 hours.`}
              </p>
            </div>
          </div>

          {/* Customer & Address Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs p-3.5 rounded-2xl bg-stone-50 dark:bg-[#142015] border border-stone-200 dark:border-emerald-900/60">
            <div>
              <span className="text-stone-500 dark:text-emerald-400 font-medium">
                {language === 'ta' ? 'வாடிக்கையாளர்:' : 'Customer:'}
              </span>
              <p className="font-bold text-stone-900 dark:text-emerald-100 mt-0.5">{order.customerName}</p>
              <p className="text-stone-600 dark:text-emerald-300 flex items-center gap-1 mt-0.5">
                <Phone className="w-3 h-3 text-stone-400 dark:text-emerald-500" />
                <span>{order.phone}</span>
              </p>
            </div>

            <div>
              <span className="text-stone-500 dark:text-emerald-400 font-medium">
                {language === 'ta' ? 'விநியோக இடம்:' : 'Delivery Destination:'}
              </span>
              <p className="font-bold text-stone-900 dark:text-emerald-100 mt-0.5">{order.address}</p>
              <p className="text-stone-600 dark:text-emerald-300">
                {order.villageCity} {order.pincode ? `(${order.pincode})` : ''}
              </p>
            </div>
          </div>

          {/* Items Summary */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold text-emerald-950 dark:text-emerald-100 uppercase tracking-wider flex items-center gap-1.5">
              <Package className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
              <span>
                {language === 'ta'
                  ? `ஆர்டர் செய்யப்பட்ட பொருட்கள் (${order.items.length})`
                  : `Ordered Farm Supplies (${order.items.length})`}
              </span>
            </h3>

            <div className="divide-y divide-emerald-100 dark:divide-emerald-900/40 border border-emerald-100 dark:border-emerald-900/60 rounded-2xl overflow-hidden">
              {order.items.map((item, idx) => (
                <div key={idx} className="p-3 flex items-center justify-between text-xs bg-white dark:bg-[#121c14]">
                  <div className="flex items-center gap-2.5">
                    {item.image && (
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-10 h-10 rounded-lg object-cover border border-emerald-50 dark:border-emerald-900/40"
                      />
                    )}
                    <div>
                      <p className="font-bold text-emerald-950 dark:text-emerald-100">{item.name}</p>
                      <p className="text-emerald-700 dark:text-emerald-400 text-[11px]">
                        {language === 'ta' ? 'அளவு:' : 'Qty:'} {item.quantity} × {formatCurrency(item.price)}
                      </p>
                    </div>
                  </div>
                  <span className="font-bold text-emerald-950 dark:text-emerald-100">
                    {formatCurrency(item.price * item.quantity)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Pricing Totals */}
          <div className="space-y-1.5 text-xs pt-2 border-t border-emerald-100 dark:border-emerald-900/60">
            <div className="flex justify-between text-emerald-800 dark:text-emerald-300">
              <span>{t('subtotal')}</span>
              <span>{formatCurrency(order.subtotal)}</span>
            </div>
            <div className="flex justify-between text-emerald-800 dark:text-emerald-300">
              <span>{t('deliveryFee')}</span>
              <span>{order.deliveryFee === 0 ? t('free') : formatCurrency(order.deliveryFee)}</span>
            </div>
            {order.discount > 0 && (
              <div className="flex justify-between text-emerald-700 dark:text-emerald-400 font-medium">
                <span>{t('farmerDiscount')}</span>
                <span>-{formatCurrency(order.discount)}</span>
              </div>
            )}
            <div className="pt-2 border-t border-emerald-200 dark:border-emerald-800 flex justify-between text-base font-black text-emerald-950 dark:text-emerald-100 font-['Outfit',sans-serif]">
              <span>{t('total')} ({order.paymentMethod})</span>
              <span>{formatCurrency(order.total)}</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="no-print pt-2 flex items-center justify-between gap-3">
            <button
              onClick={() => window.print()}
              className="px-4 py-2.5 rounded-xl border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-[#152317] text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>{language === 'ta' ? 'ரசீதை அச்சிடுக' : 'Print Receipt'}</span>
            </button>

            <button
              onClick={onClose}
              className="flex-1 py-2.5 px-4 rounded-xl bg-emerald-800 hover:bg-emerald-900 dark:bg-emerald-700 dark:hover:bg-emerald-600 text-white text-xs font-bold transition-all shadow-xs text-center cursor-pointer"
            >
              {language === 'ta' ? 'மேலும் பொருட்களைப் பார்க்க' : 'Continue Shopping'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
