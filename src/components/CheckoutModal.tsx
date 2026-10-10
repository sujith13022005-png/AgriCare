import React, { useState } from 'react';
import {
  X,
  CreditCard,
  Banknote,
  Smartphone,
  ShieldCheck,
  CheckCircle2,
  Loader2,
  MapPin,
  Phone,
  User,
  Building,
} from 'lucide-react';
import { CartItem, Order } from '../types';
import { formatCurrency } from '../utils/formatters';
import { useLanguage } from '../context/LanguageContext';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onOrderSuccess: (order: Order) => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  items,
  onOrderSuccess,
}) => {
  const { language, t } = useLanguage();
  const [customerName, setCustomerName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [villageCity, setVillageCity] = useState('');
  const [pincode, setPincode] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'Cash on Delivery' | 'UPI' | 'Net Banking'>('Cash on Delivery');
  const [upiId, setUpiId] = useState('');
  const [notes, setNotes] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const subtotal = items.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );
  const deliveryFee = subtotal > 1000 ? 0 : 50;
  const discount = subtotal > 2000 ? 100 : 0;
  const total = subtotal + deliveryFee - discount;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!customerName.trim()) {
      setErrorMessage(
        language === 'ta'
          ? 'தயவுசெய்து விவசாயி அல்லது வாடிக்கையாளர் பெயரை உள்ளிடவும்.'
          : 'Please provide the farmer or customer full name.'
      );
      return;
    }
    if (!phone.trim() || phone.trim().length < 8) {
      setErrorMessage(
        language === 'ta'
          ? 'தயவுசெய்து சரியான 10-இலக்க செல்போன் எண்ணை உள்ளிடவும்.'
          : 'Please provide a valid 10-digit mobile number for delivery coordination.'
      );
      return;
    }
    if (!address.trim()) {
      setErrorMessage(
        language === 'ta'
          ? 'தயவுசெய்து விநியோக முகவரியை உள்ளிடவும்.'
          : 'Please provide your farm or residential delivery address.'
      );
      return;
    }
    if (paymentMethod === 'UPI' && !upiId.trim()) {
      setErrorMessage(
        language === 'ta'
          ? 'தயவுசெய்து உங்கள் UPI ID-ஐ உள்ளிடவும் (எ.கா: yourname@oksbi).'
          : 'Please provide your UPI ID (e.g. yourname@oksbi or 9876543210@paytm).'
      );
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName,
          phone,
          address,
          villageCity,
          pincode,
          paymentMethod,
          upiId: paymentMethod === 'UPI' ? upiId : undefined,
          notes,
          items: items.map((i) => ({
            productId: i.product.id,
            name: i.product.name,
            quantity: i.quantity,
            price: i.product.price,
          })),
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to place order');
      }

      onOrderSuccess(data.order);
      onClose();
    } catch (err: any) {
      console.error('Checkout error:', err);
      setErrorMessage(err.message || 'Error processing your order. Please retry.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      id="checkout-modal-backdrop"
      className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        id="checkout-modal-content"
        className="relative w-full max-w-2xl bg-white dark:bg-[#101912] rounded-3xl shadow-2xl border border-emerald-100 dark:border-emerald-900/60 overflow-hidden transition-colors"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-emerald-100 dark:border-emerald-900/60 flex items-center justify-between bg-emerald-50/70 dark:bg-[#152317]">
          <div>
            <h2 className="text-xl font-bold text-emerald-950 dark:text-emerald-100 font-['Outfit',sans-serif]">
              {language === 'ta' ? 'விவசாய விநியோக ஆர்டரை நிறைவு செய்க' : 'Complete Farm Delivery Order'}
            </h2>
            <p className="text-xs text-emerald-700 dark:text-emerald-400">
              {language === 'ta'
                ? 'விநியோக முகவரி மற்றும் கட்டண முறையைத் தேர்வு செய்யவும்'
                : 'Provide delivery address and preferred rural payment method'}
            </p>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white dark:bg-[#1c2d1e] text-emerald-900 dark:text-emerald-200 flex items-center justify-center hover:bg-emerald-100 dark:hover:bg-[#253c29] shadow-2xs transition-colors cursor-pointer"
            aria-label={t('close')}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-5 max-h-[80vh] overflow-y-auto">
          {errorMessage && (
            <div className="p-3.5 rounded-xl bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900/60 text-red-800 dark:text-red-300 text-xs font-medium">
              {errorMessage}
            </div>
          )}

          {/* Customer & Phone */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label htmlFor="customer-name" className="text-xs font-bold text-emerald-950 dark:text-emerald-200 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-400" />
                <span>{language === 'ta' ? 'விவசாயி / வாடிக்கையாளர் பெயர் *' : 'Farmer / Customer Name *'}</span>
              </label>
              <input
                id="customer-name"
                type="text"
                required
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder={language === 'ta' ? 'எ.கா: சுஜித் முருகன்' : 'e.g. Ramesh Patel'}
                className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-[#152317] border border-emerald-200 dark:border-emerald-800 text-sm text-emerald-950 dark:text-emerald-100 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20 outline-hidden"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="customer-phone" className="text-xs font-bold text-emerald-950 dark:text-emerald-200 flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-400" />
                <span>{language === 'ta' ? 'கைபேசி எண் *' : 'Mobile Phone Number *'}</span>
              </label>
              <input
                id="customer-phone"
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="e.g. 98765 43210"
                className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-[#152317] border border-emerald-200 dark:border-emerald-800 text-sm text-emerald-950 dark:text-emerald-100 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20 outline-hidden"
              />
            </div>
          </div>

          {/* Delivery Address */}
          <div className="space-y-1.5">
            <label htmlFor="customer-address" className="text-xs font-bold text-emerald-950 dark:text-emerald-200 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-400" />
              <span>{language === 'ta' ? 'தோட்டம் / முகவரி மற்றும் அடையாளம் *' : 'Farm / House Address & Landmark *'}</span>
            </label>
            <input
              id="customer-address"
              type="text"
              required
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder={language === 'ta' ? 'எ.கா: கதவு எண் 12, கிணற்று மேடு / மெயின் ரோடு' : 'e.g. Plot No. 12, Near Tubewell / Main Road'}
              className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-[#152317] border border-emerald-200 dark:border-emerald-800 text-sm text-emerald-950 dark:text-emerald-100 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20 outline-hidden"
            />
          </div>

          {/* Village/Town and Pin Code */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label htmlFor="customer-village" className="text-xs font-bold text-emerald-950 dark:text-emerald-200 flex items-center gap-1.5">
                <Building className="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-400" />
                <span>{language === 'ta' ? 'கிராமம் / ஊர் / மாவட்டம்' : 'Village / Town / District'}</span>
              </label>
              <input
                id="customer-village"
                type="text"
                value={villageCity}
                onChange={(e) => setVillageCity(e.target.value)}
                placeholder={language === 'ta' ? 'எ.கா: பொள்ளாச்சி, கோவை மாவட்டம்' : 'e.g. Kotla, Karnal District'}
                className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-[#152317] border border-emerald-200 dark:border-emerald-800 text-sm text-emerald-950 dark:text-emerald-100 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20 outline-hidden"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="customer-pincode" className="text-xs font-bold text-emerald-950 dark:text-emerald-200">
                {language === 'ta' ? 'அஞ்சல் குறியீட்டு எண் (PIN Code)' : 'Postal PIN Code'}
              </label>
              <input
                id="customer-pincode"
                type="text"
                value={pincode}
                onChange={(e) => setPincode(e.target.value)}
                placeholder="e.g. 642001"
                className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-[#152317] border border-emerald-200 dark:border-emerald-800 text-sm text-emerald-950 dark:text-emerald-100 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20 outline-hidden"
              />
            </div>
          </div>

          {/* Payment Method Selector */}
          <div className="space-y-2 pt-2">
            <label className="text-xs font-bold text-emerald-950 dark:text-emerald-200">
              {language === 'ta' ? 'கட்டண முறை *' : 'Payment Method *'}
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Cash on Delivery */}
              <label
                className={`flex flex-col p-3.5 rounded-2xl border-2 cursor-pointer transition-all ${
                  paymentMethod === 'Cash on Delivery'
                    ? 'border-emerald-700 dark:border-emerald-500 bg-emerald-50/80 dark:bg-emerald-950/60 shadow-xs'
                    : 'border-emerald-100 dark:border-emerald-900/60 bg-white dark:bg-[#142015] hover:bg-emerald-50/40 dark:hover:bg-[#192b1b]'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <Banknote className="w-5 h-5 text-emerald-700 dark:text-emerald-400" />
                  <input
                    type="radio"
                    name="paymentMethod"
                    checked={paymentMethod === 'Cash on Delivery'}
                    onChange={() => setPaymentMethod('Cash on Delivery')}
                    className="accent-emerald-700"
                  />
                </div>
                <span className="text-xs font-bold text-emerald-950 dark:text-emerald-100">
                  {language === 'ta' ? 'பொருளைப் பெற்று பணம் செலுத்துதல் (COD)' : 'Cash on Delivery'}
                </span>
                <span className="text-[11px] text-emerald-700/80 dark:text-emerald-400/80 mt-0.5">
                  {language === 'ta' ? 'பொருட்கள் வந்ததும் பணம் தரலாம்' : 'Pay cash at your farm gate'}
                </span>
              </label>

              {/* UPI */}
              <label
                className={`flex flex-col p-3.5 rounded-2xl border-2 cursor-pointer transition-all ${
                  paymentMethod === 'UPI'
                    ? 'border-emerald-700 dark:border-emerald-500 bg-emerald-50/80 dark:bg-emerald-950/60 shadow-xs'
                    : 'border-emerald-100 dark:border-emerald-900/60 bg-white dark:bg-[#142015] hover:bg-emerald-50/40 dark:hover:bg-[#192b1b]'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <Smartphone className="w-5 h-5 text-emerald-700 dark:text-emerald-400" />
                  <input
                    type="radio"
                    name="paymentMethod"
                    checked={paymentMethod === 'UPI'}
                    onChange={() => setPaymentMethod('UPI')}
                    className="accent-emerald-700"
                  />
                </div>
                <span className="text-xs font-bold text-emerald-950 dark:text-emerald-100">
                  {language === 'ta' ? 'உடனடி UPI' : 'Instant UPI'}
                </span>
                <span className="text-[11px] text-emerald-700/80 dark:text-emerald-400/80 mt-0.5">
                  GPay, PhonePe, Paytm, BHIM
                </span>
              </label>

              {/* Net Banking / Kisan Card */}
              <label
                className={`flex flex-col p-3.5 rounded-2xl border-2 cursor-pointer transition-all ${
                  paymentMethod === 'Net Banking'
                    ? 'border-emerald-700 dark:border-emerald-500 bg-emerald-50/80 dark:bg-emerald-950/60 shadow-xs'
                    : 'border-emerald-100 dark:border-emerald-900/60 bg-white dark:bg-[#142015] hover:bg-emerald-50/40 dark:hover:bg-[#192b1b]'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <CreditCard className="w-5 h-5 text-emerald-700 dark:text-emerald-400" />
                  <input
                    type="radio"
                    name="paymentMethod"
                    checked={paymentMethod === 'Net Banking'}
                    onChange={() => setPaymentMethod('Net Banking')}
                    className="accent-emerald-700"
                  />
                </div>
                <span className="text-xs font-bold text-emerald-950 dark:text-emerald-100">
                  {language === 'ta' ? 'விவசாய அட்டை / வங்கி' : 'Kisan Card / Net Banking'}
                </span>
                <span className="text-[11px] text-emerald-700/80 dark:text-emerald-400/80 mt-0.5">
                  {language === 'ta' ? 'வங்கி கணக்கு வழியே நேரடி மாற்றம்' : 'Direct Agri Bank transfer'}
                </span>
              </label>
            </div>

            {/* UPI ID input field when UPI selected */}
            {paymentMethod === 'UPI' && (
              <div className="p-3.5 rounded-xl bg-emerald-50/80 dark:bg-[#152317] border border-emerald-200 dark:border-emerald-800 mt-2 space-y-1.5 animate-in fade-in duration-150">
                <label htmlFor="upi-id-input" className="text-xs font-bold text-emerald-950 dark:text-emerald-200">
                  {language === 'ta' ? 'உங்கள் UPI ID (VPA) *' : 'Your UPI ID (VPA) *'}
                </label>
                <input
                  id="upi-id-input"
                  type="text"
                  value={upiId}
                  onChange={(e) => setUpiId(e.target.value)}
                  placeholder="e.g. 9876543210@paytm or name@oksbi"
                  className="w-full px-3 py-2 rounded-lg bg-white dark:bg-[#101912] border border-emerald-300 dark:border-emerald-700 text-xs text-emerald-950 dark:text-emerald-100 focus:outline-hidden"
                />
                <p className="text-[11px] text-emerald-700 dark:text-emerald-400">
                  {language === 'ta'
                    ? 'உங்கள் UPI செயலிக்கு கட்டண கோரிக்கை அனுப்பப்படும்.'
                    : 'A payment collect request will be sent to your UPI app.'}
                </p>
              </div>
            )}
          </div>

          {/* Delivery Instructions */}
          <div className="space-y-1.5">
            <label htmlFor="order-notes" className="text-xs font-bold text-emerald-950 dark:text-emerald-200">
              {language === 'ta' ? 'ஓட்டுநருக்கான சிறப்புக் குறிப்புகள் (விருப்பத்தேர்வு)' : 'Special Delivery Notes for Driver (Optional)'}
            </label>
            <textarea
              id="order-notes"
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={language === 'ta' ? 'எ.கா: வருவதற்கு முன் அழைக்கவும்; டிராக்டர் கொட்டகையருகே இறக்கவும்.' : 'e.g. Call before coming; leave sacks near tractor shed.'}
              className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-[#152317] border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-950 dark:text-emerald-100 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20 outline-hidden"
            />
          </div>

          {/* Total & Confirm Button */}
          <div className="pt-4 border-t border-emerald-100 dark:border-emerald-900/60 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <span className="text-xs text-emerald-700 dark:text-emerald-400">
                {language === 'ta' ? 'விநியோகத்தின் போது செலுத்த வேண்டிய தொகை:' : 'Payable at Delivery:'}
              </span>
              <p className="text-2xl font-black text-emerald-950 dark:text-emerald-100 font-['Outfit',sans-serif]">
                {formatCurrency(total)}
              </p>
            </div>

            <button
              id="confirm-place-order-button"
              type="submit"
              disabled={isSubmitting}
              className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-emerald-800 hover:bg-emerald-900 dark:bg-emerald-700 dark:hover:bg-emerald-600 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-md transition-all active:scale-98 disabled:opacity-50 cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>{language === 'ta' ? 'ஆர்டர் செய்யப்படுகிறது...' : 'Placing Order...'}</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                  <span>{language === 'ta' ? 'உறுதிசெய்து ஆர்டர் செய்க' : 'Confirm & Place Order'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
