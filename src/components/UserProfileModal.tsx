import React, { useState, useEffect } from 'react';
import {
  X,
  User as UserIcon,
  LogOut,
  ShoppingBag,
  Heart,
  Calendar,
  MapPin,
  Phone,
  Mail,
  ShieldCheck,
  CheckCircle2,
  Package,
  ExternalLink,
  Save,
  Loader2,
} from 'lucide-react';
import { useFirebase } from '../context/FirebaseContext';
import { useLanguage } from '../context/LanguageContext';
import { formatCurrency, formatDate } from '../utils/formatters';
import { Product, Order } from '../types';

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectProduct?: (product: Product) => void;
  onAddToCart?: (product: Product) => void;
}

export const UserProfileModal: React.FC<UserProfileModalProps> = ({
  isOpen,
  onClose,
  onSelectProduct,
  onAddToCart,
}) => {
  const {
    user,
    userProfile,
    savedProductIds,
    products,
    orders,
    signInWithGoogle,
    logout,
    toggleFavorite,
  } = useFirebase();
  const { language } = useLanguage();

  const [activeTab, setActiveTab] = useState<'profile' | 'orders' | 'favorites'>('profile');
  const [phoneInput, setPhoneInput] = useState('');
  const [villageInput, setVillageInput] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    if (userProfile) {
      setPhoneInput(userProfile.phone || '');
      setVillageInput(userProfile.villageCity || 'Anthiyur, Erode');
    }
  }, [userProfile]);

  if (!isOpen) return null;

  // Filter orders placed by this authenticated user
  const userOrders = orders.filter(
    (o) =>
      (user && o.userId === user.uid) ||
      (user?.email && o.userEmail === user.email) ||
      (user?.phoneNumber && o.phone === user.phoneNumber)
  );

  // Filter saved favorite products
  const favoriteProducts = products.filter((p) => savedProductIds.includes(p.id));

  // Save profile edits to Firestore
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setIsSaving(true);
    setSaveSuccess(false);
    try {
      // In Firestore, user profile is saved at /users/{uid}
      const { doc, updateDoc } = await import('firebase/firestore');
      const { db } = await import('../firebase');
      await updateDoc(doc(db, 'users', user.uid), {
        phone: phoneInput.trim(),
        villageCity: villageInput.trim(),
      });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.warn('Failed to update profile:', err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-white dark:bg-[#0c140e] rounded-2xl shadow-2xl border border-emerald-100 dark:border-emerald-900/80 overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-800 via-green-800 to-emerald-900 text-white px-5 py-4 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center text-emerald-200">
              <UserIcon className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold">
                {language === 'ta' ? 'விவசாயி கணக்கு விவரங்கள்' : 'Farmer Account & Orders'}
              </h2>
              <p className="text-xs text-emerald-200/90">
                {language === 'ta'
                  ? 'Firebase Auth & Firestore தரவுத்தள இணைப்பு'
                  : 'Authenticated with Google & Synchronized to Firestore'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-emerald-200 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
          
          {/* If user NOT logged in: Google Sign-in Prompt */}
          {!user ? (
            <div className="text-center py-8 px-4 space-y-5">
              <div className="w-16 h-16 rounded-2xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 flex items-center justify-center mx-auto shadow-inner">
                <ShieldCheck className="w-8 h-8" />
              </div>
              <div className="space-y-1.5 max-w-md mx-auto">
                <h3 className="text-lg font-bold text-stone-900 dark:text-emerald-100">
                  {language === 'ta' ? 'Google கணக்கு மூலம் உள்நுழைக' : 'Sign in with Google to AgriCare'}
                </h3>
                <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-400">
                  {language === 'ta'
                    ? 'உங்கள் முந்தைய ஆர்டர்களை கண்காணிக்கவும், சேமித்த பொருட்களைப் பெறவும் பாதுகாப்பான Google கணக்குடன் இணையுங்கள்.'
                    : 'Connect securely with Google to track your agricultural orders, save favorite products, and access member benefits across devices.'}
                </p>
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={async () => {
                    try {
                      await signInWithGoogle();
                    } catch (err) {
                      console.error('Sign in error:', err);
                    }
                  }}
                  className="inline-flex items-center gap-3 px-6 py-3 rounded-xl bg-white dark:bg-stone-900 hover:bg-stone-50 dark:hover:bg-stone-800 text-stone-800 dark:text-stone-100 text-sm font-bold border border-stone-300 dark:border-stone-700 shadow-md hover:shadow-lg transition-all cursor-pointer active:scale-95"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.65v3.03h3.88c2.27-2.09 3.665-5.17 3.665-9.12z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.03c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.13C3.27 21.44 7.35 24 12 24z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.28 14.29c-.25-.72-.38-1.49-.38-2.29s.13-1.57.38-2.29V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.13z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.35 0 3.27 2.56 1.25 6.58l4.03 3.13c.95-2.83 3.6-4.96 6.72-4.96z"
                    />
                  </svg>
                  <span>{language === 'ta' ? 'Google உடன் உள்நுழைக' : 'Sign in with Google'}</span>
                </button>
              </div>

              <div className="pt-4 border-t border-stone-100 dark:border-emerald-900/40 text-[11px] text-stone-500">
                🔒 Protected by Firebase Authentication & Google Identity Services
              </div>
            </div>
          ) : (
            // Authenticated User View
            <div className="space-y-6">
              
              {/* Profile Card Banner */}
              <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-emerald-50 to-green-50/60 dark:from-[#132316] dark:to-[#0d1810] border border-emerald-200 dark:border-emerald-800/80 flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-3.5">
                  {user.photoURL ? (
                    <img
                      src={user.photoURL}
                      alt={user.displayName || 'User'}
                      className="w-14 h-14 rounded-full border-2 border-emerald-500 shadow-sm object-cover"
                    />
                  ) : (
                    <div className="w-14 h-14 rounded-full bg-emerald-700 text-white font-bold text-xl flex items-center justify-center border-2 border-emerald-400">
                      {user.displayName?.[0] || 'U'}
                    </div>
                  )}
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-bold text-stone-900 dark:text-emerald-100">
                        {user.displayName || 'Farmer Member'}
                      </h3>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-900/80 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700">
                        Google Verified
                      </span>
                    </div>
                    <p className="text-xs text-stone-600 dark:text-stone-400 flex items-center gap-1.5 mt-0.5">
                      <Mail className="w-3 h-3 text-stone-400" />
                      <span>{user.email}</span>
                    </p>
                    <p className="text-[11px] text-stone-500 dark:text-stone-400 mt-1 flex items-center gap-1 font-mono">
                      <span>UID: {user.uid.slice(0, 10)}...</span>
                      <span>•</span>
                      <span>Firestore Sync: Active</span>
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={async () => {
                    await logout();
                    onClose();
                  }}
                  className="px-3.5 py-2 rounded-xl bg-red-50 dark:bg-red-950/40 hover:bg-red-100 text-red-700 dark:text-red-400 text-xs font-semibold border border-red-200 dark:border-red-900 transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>{language === 'ta' ? 'வெளியேறு' : 'Sign Out'}</span>
                </button>
              </div>

              {/* Navigation Tabs */}
              <div className="flex items-center border-b border-stone-200 dark:border-emerald-900/60 gap-4">
                <button
                  type="button"
                  onClick={() => setActiveTab('profile')}
                  className={`pb-2.5 text-xs sm:text-sm font-bold border-b-2 transition-all cursor-pointer ${
                    activeTab === 'profile'
                      ? 'border-emerald-600 text-emerald-800 dark:text-emerald-300'
                      : 'border-transparent text-stone-500 hover:text-stone-800 dark:hover:text-stone-300'
                  }`}
                >
                  {language === 'ta' ? 'விவசாயி விபரம்' : 'Farm Profile'}
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('orders')}
                  className={`pb-2.5 text-xs sm:text-sm font-bold border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
                    activeTab === 'orders'
                      ? 'border-emerald-600 text-emerald-800 dark:text-emerald-300'
                      : 'border-transparent text-stone-500 hover:text-stone-800 dark:hover:text-stone-300'
                  }`}
                >
                  <span>{language === 'ta' ? 'என் ஆர்டர்கள்' : 'My Orders'}</span>
                  {userOrders.length > 0 && (
                    <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-emerald-100 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-300 font-bold">
                      {userOrders.length}
                    </span>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('favorites')}
                  className={`pb-2.5 text-xs sm:text-sm font-bold border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
                    activeTab === 'favorites'
                      ? 'border-emerald-600 text-emerald-800 dark:text-emerald-300'
                      : 'border-transparent text-stone-500 hover:text-stone-800 dark:hover:text-stone-300'
                  }`}
                >
                  <span>{language === 'ta' ? 'சேமித்த பொருட்கள்' : 'Saved Items'}</span>
                  {favoriteProducts.length > 0 && (
                    <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-emerald-100 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-300 font-bold">
                      {favoriteProducts.length}
                    </span>
                  )}
                </button>
              </div>

              {/* Tab 1: Profile Settings & Firestore Persistence */}
              {activeTab === 'profile' && (
                <form onSubmit={handleSaveProfile} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                        {language === 'ta' ? 'தொலைபேசி எண் (Phone)' : 'Farmer Contact Phone'}
                      </label>
                      <div className="relative">
                        <Phone className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-3" />
                        <input
                          type="tel"
                          value={phoneInput}
                          onChange={(e) => setPhoneInput(e.target.value)}
                          placeholder="+91 98427 00000"
                          className="w-full pl-9 pr-3 py-2 rounded-xl border border-stone-300 dark:border-emerald-900 bg-stone-50/50 dark:bg-[#142316] text-stone-900 dark:text-emerald-100 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                        {language === 'ta' ? 'கிராமம் / நகரம் (Village / City)' : 'Village / Hub'}
                      </label>
                      <div className="relative">
                        <MapPin className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-3" />
                        <input
                          type="text"
                          value={villageInput}
                          onChange={(e) => setVillageInput(e.target.value)}
                          placeholder="Anthiyur, Erode"
                          className="w-full pl-9 pr-3 py-2 rounded-xl border border-stone-300 dark:border-emerald-900 bg-stone-50/50 dark:bg-[#142316] text-stone-900 dark:text-emerald-100 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    {saveSuccess && (
                      <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 flex items-center gap-1">
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Saved to Firestore successfully!</span>
                      </span>
                    )}
                    <button
                      type="submit"
                      disabled={isSaving}
                      className="ml-auto inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold shadow-xs transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
                    >
                      {isSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                      <span>{language === 'ta' ? 'சேமிக்க' : 'Save to Firestore'}</span>
                    </button>
                  </div>
                </form>
              )}

              {/* Tab 2: Orders List */}
              {activeTab === 'orders' && (
                <div className="space-y-3">
                  {userOrders.length === 0 ? (
                    <div className="text-center py-8 text-stone-500 dark:text-stone-400 space-y-2">
                      <ShoppingBag className="w-10 h-10 mx-auto text-stone-300 dark:text-stone-600" />
                      <p className="text-xs font-medium">
                        {language === 'ta'
                          ? 'இன்னும் ஆர்டர்கள் எதுவும் இல்லை. எங்கள் கடையை பார்வையிடவும்!'
                          : 'No orders found yet for this account. Browse our catalog to place your first order!'}
                      </p>
                    </div>
                  ) : (
                    userOrders.map((order) => (
                      <div
                        key={order.id}
                        className="p-3.5 rounded-xl border border-stone-200 dark:border-emerald-900/60 bg-stone-50/40 dark:bg-[#132316] space-y-2"
                      >
                        <div className="flex items-center justify-between text-xs">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-stone-900 dark:text-emerald-100">
                              #{order.id}
                            </span>
                            <span className="text-[11px] text-stone-500">
                              {formatDate(order.createdAt)}
                            </span>
                          </div>
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              order.status === 'Delivered'
                                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/80 dark:text-emerald-300'
                                : order.status === 'Dispatched'
                                ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/80 dark:text-blue-300'
                                : 'bg-amber-100 text-amber-800 dark:bg-amber-900/80 dark:text-amber-300'
                            }`}
                          >
                            {order.status}
                          </span>
                        </div>

                        {/* Order Items Summary */}
                        <div className="text-xs text-stone-600 dark:text-stone-300">
                          {order.items.map((item, i) => (
                            <span key={i}>
                              {item.name} (x{item.quantity})
                              {i < order.items.length - 1 ? ', ' : ''}
                            </span>
                          ))}
                        </div>

                        <div className="flex items-center justify-between pt-1 border-t border-stone-200/60 dark:border-emerald-900/40 text-xs">
                          <span className="text-stone-500">Total: {formatCurrency(order.total)}</span>
                          <span className="text-[11px] text-stone-500">{order.paymentMethod}</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}

              {/* Tab 3: Saved Favorites */}
              {activeTab === 'favorites' && (
                <div className="space-y-3">
                  {favoriteProducts.length === 0 ? (
                    <div className="text-center py-8 text-stone-500 dark:text-stone-400 space-y-2">
                      <Heart className="w-10 h-10 mx-auto text-stone-300 dark:text-stone-600" />
                      <p className="text-xs font-medium">
                        {language === 'ta'
                          ? 'சேமித்த பொருட்கள் எதுவும் இல்லை.'
                          : 'No saved products yet. Click the heart icon on any product in the catalog to save it here!'}
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {favoriteProducts.map((prod) => (
                        <div
                          key={prod.id}
                          className="p-3 rounded-xl border border-stone-200 dark:border-emerald-900/60 bg-white dark:bg-[#142316] flex items-center justify-between gap-3 shadow-2xs"
                        >
                          <img
                            src={prod.image}
                            alt={prod.name}
                            className="w-12 h-12 rounded-lg object-cover shrink-0 cursor-pointer"
                            onClick={() => {
                              onSelectProduct?.(prod);
                              onClose();
                            }}
                          />
                          <div className="min-w-0 flex-1">
                            <p
                              className="text-xs font-bold text-stone-900 dark:text-emerald-100 truncate cursor-pointer hover:underline"
                              onClick={() => {
                                onSelectProduct?.(prod);
                                onClose();
                              }}
                            >
                              {prod.name}
                            </p>
                            <p className="text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                              {formatCurrency(prod.price)} / {prod.unit}
                            </p>
                          </div>
                          <div className="flex items-center gap-1">
                            {onAddToCart && (
                              <button
                                type="button"
                                onClick={() => onAddToCart(prod)}
                                className="p-1.5 rounded-lg bg-emerald-100 dark:bg-emerald-900/60 hover:bg-emerald-200 text-emerald-800 dark:text-emerald-200 transition-colors"
                                title="Add to Cart"
                              >
                                <ShoppingBag className="w-3.5 h-3.5" />
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={() => toggleFavorite(prod.id)}
                              className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors"
                              title="Remove from favorites"
                            >
                              <Heart className="w-3.5 h-3.5 fill-red-500" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-stone-50 dark:bg-[#081009] px-5 py-3 border-t border-stone-200 dark:border-emerald-950 flex items-center justify-between text-xs text-stone-500 dark:text-stone-400">
          <span>Google Identity & Firebase Cloud Firestore</span>
          <button
            onClick={onClose}
            className="px-3.5 py-1.5 rounded-lg hover:bg-stone-200 dark:hover:bg-stone-800 text-stone-700 dark:text-stone-300 font-semibold cursor-pointer"
          >
            {language === 'ta' ? 'மூடு' : 'Close'}
          </button>
        </div>
      </div>
    </div>
  );
};
