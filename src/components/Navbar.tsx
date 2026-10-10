import React from 'react';
import {
  Sprout,
  ShoppingBag,
  ShieldCheck,
  Bot,
  Search,
  X,
  PhoneCall,
  LayoutDashboard,
  Store,
  Lock,
  User,
  LogOut,
  Sun,
  Moon,
  Film,
} from 'lucide-react';
import { formatCurrency } from '../utils/formatters';
import { Product } from '../types';
import { SearchAutocomplete } from './SearchAutocomplete';
import { useLanguage } from '../context/LanguageContext';
import { LanguageSwitcher } from './LanguageSwitcher';
import { useFirebase } from '../context/FirebaseContext';

interface NavbarProps {
  cartCount: number;
  cartTotal: number;
  onOpenCart: () => void;
  isAdmin: boolean;
  onToggleAdmin: () => void;
  onOpenAdvisor: () => void;
  onOpenVideoGenerator?: () => void;
  onOpenUserProfile?: () => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  activeCategory: string;
  isAdminLoggedIn?: boolean;
  adminUsername?: string;
  onAdminLogout?: () => void;
  onOpenChangeCredentials?: () => void;
  onSelectCategory?: (category: string) => void;
  onSelectProduct?: (product: Product) => void;
  allProducts?: Product[];
  categoryCounts?: Record<string, number>;
  theme?: 'light' | 'dark';
  onToggleTheme?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  cartCount,
  cartTotal,
  onOpenCart,
  isAdmin,
  onToggleAdmin,
  onOpenAdvisor,
  onOpenVideoGenerator,
  onOpenUserProfile,
  searchQuery,
  onSearchChange,
  activeCategory,
  isAdminLoggedIn = false,
  adminUsername = 'admin',
  onAdminLogout,
  onOpenChangeCredentials,
  onSelectCategory = () => {},
  onSelectProduct,
  allProducts = [],
  categoryCounts = {},
  theme = 'light',
  onToggleTheme,
}) => {
  const { language, t } = useLanguage();
  const { user } = useFirebase();

  return (
    <header className="sticky top-0 z-40 bg-white/95 dark:bg-[#0c140e]/95 backdrop-blur-md border-b border-emerald-100 dark:border-emerald-900/60 shadow-xs transition-colors duration-200">
      {/* Top Banner for Farmer Helpline & Certified Guarantee */}
      <div className="bg-[#14532D] dark:bg-[#0a2f19] text-emerald-100 text-xs px-4 py-1.5 font-medium border-b border-emerald-900/40">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>
              {language === 'ta'
                ? 'கிசான் உதவி மையம்: 100% அசல் விதைகள் & சான்றளிக்கப்பட்ட இயற்கை உரங்கள்'
                : 'Kisan Suvidha: 100% Genuine Seeds & Certified Bio-Nutrients'}
            </span>
          </div>
          <div className="flex items-center gap-4 text-emerald-200 dark:text-emerald-300">
            <a
              href="tel:18004252474"
              className="flex items-center gap-1.5 hover:text-white transition-colors"
              title="Farmer Helpline"
            >
              <PhoneCall className="w-3.5 h-3.5 text-emerald-300" />
              <span>
                {language === 'ta' ? 'கட்டணமில்லா உதவி: 1800-425-AGRI' : 'Toll-Free Helpline: 1800-425-AGRI'}
              </span>
            </a>
            <span className="hidden sm:inline text-emerald-400/40">|</span>
            <span className="hidden sm:inline font-semibold text-amber-200">
              {language === 'ta' ? '📍 அந்தியூர் & ஈரோடு வட்டார விரைவு டெலிவரி • 100+ பொருட்கள்' : '📍 Anthiyur & Erode Hub • 100+ Products Ready for Delivery'}
            </span>
          </div>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex items-center justify-between gap-4">
          {/* Brand Identity */}
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-emerald-600 to-green-700 dark:from-emerald-500 dark:to-green-600 flex items-center justify-center text-white shadow-sm ring-2 ring-emerald-100 dark:ring-emerald-800">
              <Sprout className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-extrabold tracking-tight text-emerald-950 dark:text-emerald-100 font-['Outfit',sans-serif]">
                  {t('brandName')}
                </span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 hidden xs:inline">
                  {language === 'ta' ? 'விவசாய பொருட்கள்' : 'Farm Supplies'}
                </span>
              </div>
              <p className="text-[11px] text-emerald-700 dark:text-emerald-400/90 font-medium tracking-wide">
                {language === 'ta' ? 'விதைகள் • உரங்கள் • பயிர் பாதுகாப்பு' : 'Seeds • Fertilizers • Crop Care'}
              </p>
            </div>
          </div>

          {/* Search Bar (Desktop / Tablet) */}
          <div className="hidden md:flex flex-1 max-w-lg mx-4">
            <SearchAutocomplete
              idPrefix="desktop"
              searchQuery={searchQuery}
              onSearchChange={onSearchChange}
              onSelectCategory={onSelectCategory}
              onSelectProduct={onSelectProduct}
              allProducts={allProducts}
              categoryCounts={categoryCounts}
              activeCategory={activeCategory}
              placeholder={t('searchPlaceholder')}
            />
          </div>

          {/* Action CTAs */}
          <div className="flex items-center gap-2 sm:gap-2.5">
            {/* Language Switcher (English / Tamil) */}
            <LanguageSwitcher variant="navbar" />

            {/* Global Dark Mode / Low-Light Toggle for Farmers */}
            {onToggleTheme && (
              <button
                id="global-theme-toggle"
                onClick={onToggleTheme}
                className="relative inline-flex items-center gap-1.5 px-2.5 py-2 rounded-xl text-xs font-medium border transition-all cursor-pointer bg-stone-100 dark:bg-[#152317] hover:bg-stone-200 dark:hover:bg-[#1c3020] text-stone-700 dark:text-emerald-200 border-stone-200 dark:border-emerald-800/80 shadow-2xs"
                title={
                  theme === 'dark'
                    ? 'Switch to Light Mode (Daylight)'
                    : 'Switch to Low-Light / Night Mode (Protects vision during field work)'
                }
                aria-label={
                  theme === 'dark'
                    ? 'Active Dark Mode: Click to switch to Light Mode'
                    : 'Active Light Mode: Click to switch to Dark Mode for field work'
                }
              >
                {theme === 'dark' ? (
                  <>
                    <Sun className="w-4 h-4 text-amber-400 animate-spin-slow" />
                    <span className="hidden lg:inline font-bold text-amber-300">
                      {language === 'ta' ? 'பகல்' : 'Day'}
                    </span>
                  </>
                ) : (
                  <>
                    <Moon className="w-4 h-4 text-emerald-800" />
                    <span className="hidden lg:inline font-bold text-emerald-900">
                      {language === 'ta' ? 'இரவு' : 'Dark'}
                    </span>
                  </>
                )}
              </button>
            )}

            {/* Veo Video Generator Studio Button */}
            {onOpenVideoGenerator && (
              <button
                id="veo-video-generator-button"
                onClick={onOpenVideoGenerator}
                className="relative inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-50 dark:bg-[#152317] hover:bg-emerald-100/80 dark:hover:bg-[#1d3020] text-emerald-800 dark:text-emerald-200 text-xs sm:text-sm font-semibold border border-emerald-200/80 dark:border-emerald-800/80 shadow-2xs transition-all active:scale-95 cursor-pointer"
                title={
                  language === 'ta'
                    ? 'Veo AI மூலம் பயிர் புகைப்படங்களை வீடியோவாக மாற்றவும்'
                    : 'Animate crop photos into video with Google Veo (16:9 & 9:16)'
                }
              >
                <Film className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
                <span className="hidden md:inline">
                  {language === 'ta' ? 'வீடியோ அசைவூட்டு' : 'Crop Video'}
                </span>
                <span className="px-1.5 py-0.2 rounded text-[9px] font-black uppercase tracking-wider bg-amber-400 text-emerald-950">
                  Veo
                </span>
              </button>
            )}

            {/* AI Crop Advisor Button */}
            <button
              id="ai-advisor-button"
              onClick={onOpenAdvisor}
              className="relative inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white text-xs sm:text-sm font-semibold shadow-xs transition-all active:scale-95 cursor-pointer"
            >
              <Bot className="w-4 h-4 text-emerald-100" />
              <span className="hidden sm:inline">
                {language === 'ta' ? 'AI ஆலோசனை' : 'Ask AgriCare AI'}
              </span>
              <span className="sm:hidden">
                {language === 'ta' ? 'AI' : 'Agri AI'}
              </span>
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-200 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-300"></span>
              </span>
            </button>

            {/* Google User Profile Button */}
            {onOpenUserProfile && (
              <button
                id="user-profile-button"
                onClick={onOpenUserProfile}
                className="inline-flex items-center gap-2 px-2.5 py-1.5 rounded-xl border border-emerald-200/80 dark:border-emerald-800/80 bg-emerald-50/60 dark:bg-[#152317] hover:bg-emerald-100/70 dark:hover:bg-[#1c3020] text-emerald-900 dark:text-emerald-200 text-xs font-semibold transition-all active:scale-95 cursor-pointer"
                title={user ? `Signed in as ${user.displayName || user.email}` : 'Sign in with Google'}
              >
                {user?.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt={user.displayName || 'Farmer'}
                    className="w-5 h-5 rounded-full object-cover border border-emerald-500"
                  />
                ) : user ? (
                  <span className="w-5 h-5 rounded-full bg-emerald-700 text-white text-[10px] font-bold flex items-center justify-center">
                    {user.displayName?.[0] || 'U'}
                  </span>
                ) : (
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
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
                )}
                <span className="hidden xl:inline text-xs truncate max-w-[100px]">
                  {user ? user.displayName?.split(' ')[0] || 'Farmer' : (language === 'ta' ? 'உள்நுழை' : 'Sign In')}
                </span>
              </button>
            )}

            {/* Admin Toggle / Login Button */}
            <div className="flex items-center gap-1">
              <button
                id="admin-dashboard-toggle"
                onClick={onToggleAdmin}
                className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs sm:text-sm font-medium border transition-all cursor-pointer ${
                  isAdmin
                    ? 'bg-amber-100 dark:bg-amber-950/80 text-amber-950 dark:text-amber-200 border-amber-300 dark:border-amber-700 shadow-xs'
                    : isAdminLoggedIn
                    ? 'bg-emerald-100/80 dark:bg-emerald-950/70 text-emerald-900 dark:text-emerald-200 border-emerald-300 dark:border-emerald-700 hover:bg-emerald-200/70 dark:hover:bg-emerald-900/80'
                    : 'bg-emerald-50/70 dark:bg-[#152317] text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/80 hover:bg-emerald-100/80 dark:hover:bg-[#1c3020]'
                }`}
                title={
                  !isAdminLoggedIn
                    ? 'Store owner login with username & password'
                    : isAdmin
                    ? 'Return to customer store catalog'
                    : `Open admin portal (Signed in as ${adminUsername})`
                }
              >
                {!isAdminLoggedIn ? (
                  <>
                    <Lock className="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-400" />
                    <span className="hidden sm:inline font-semibold">
                      {language === 'ta' ? 'நிர்வாகி' : 'Admin Login'}
                    </span>
                    <span className="sm:hidden font-semibold">
                      {language === 'ta' ? 'உள்நுழை' : 'Login'}
                    </span>
                  </>
                ) : isAdmin ? (
                  <>
                    <Store className="w-3.5 h-3.5 text-amber-800 dark:text-amber-400" />
                    <span className="hidden md:inline font-semibold">
                      {language === 'ta' ? 'கடை முகப்பு' : 'Store Catalog'}
                    </span>
                  </>
                ) : (
                  <>
                    <LayoutDashboard className="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-400" />
                    <span className="hidden md:inline font-semibold">
                      {language === 'ta' ? `நிர்வாகம் (${adminUsername})` : `Admin (${adminUsername})`}
                    </span>
                    <span className="md:hidden font-semibold">
                      {language === 'ta' ? 'நிர்வாகம்' : 'Admin'}
                    </span>
                  </>
                )}
              </button>

              {/* Quick Logout Button when logged in */}
              {isAdminLoggedIn && onAdminLogout && (
                <button
                  onClick={onAdminLogout}
                  className="p-2 rounded-xl text-stone-500 dark:text-stone-400 hover:text-red-700 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 border border-transparent hover:border-red-200 dark:hover:border-red-800 transition-colors cursor-pointer"
                  title={`Sign out of admin (${adminUsername})`}
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Shopping Cart Button */}
            <button
              id="shopping-cart-button"
              onClick={onOpenCart}
              className="relative inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-emerald-800 hover:bg-emerald-900 dark:bg-emerald-700 dark:hover:bg-emerald-600 text-white text-xs sm:text-sm font-semibold shadow-xs transition-all active:scale-95 cursor-pointer"
              aria-label={`Cart with ${cartCount} items`}
            >
              <div className="relative">
                <ShoppingBag className="w-4 h-4" />
                {cartCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-amber-400 text-amber-950 text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center border-2 border-emerald-800 dark:border-emerald-700">
                    {cartCount}
                  </span>
                )}
              </div>
              <span className="hidden lg:inline">{formatCurrency(cartTotal)}</span>
            </button>
          </div>
        </div>

        {/* Mobile Search Bar */}
        <div className="mt-2.5 md:hidden">
          <SearchAutocomplete
            idPrefix="mobile"
            searchQuery={searchQuery}
            onSearchChange={onSearchChange}
            onSelectCategory={onSelectCategory}
            onSelectProduct={onSelectProduct}
            allProducts={allProducts}
            categoryCounts={categoryCounts}
            activeCategory={activeCategory}
            placeholder={t('searchPlaceholder')}
          />
        </div>
      </div>
    </header>
  );
};
