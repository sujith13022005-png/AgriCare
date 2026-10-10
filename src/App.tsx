import React, { useState, useEffect, useMemo } from 'react';
import {
  Sprout,
  ShoppingBag,
  Bot,
  Layers,
  PhoneCall,
  ShieldCheck,
  Truck,
  Leaf,
  Sparkles,
  Volume2,
  VolumeX,
  Loader2,
  ArrowUp,
  LayoutDashboard,
  CheckCircle,
  Sun,
  Moon,
} from 'lucide-react';
import { Product, CartItem, Order } from './types';
import { INITIAL_PRODUCTS } from './data/initialProducts';
import { Navbar } from './components/Navbar';
import { HeroBanner } from './components/HeroBanner';
import { CategoryFilter } from './components/CategoryFilter';
import { ProductCard } from './components/ProductCard';
import { ProductDetailModal } from './components/ProductDetailModal';
import { CartDrawer } from './components/CartDrawer';
import { CheckoutModal } from './components/CheckoutModal';
import { OrderSuccessModal } from './components/OrderSuccessModal';
import { AdminDashboard } from './components/AdminDashboard';
import { AddProductModal } from './components/AddProductModal';
import { AgriChatbot } from './components/AgriChatbot';
import { SeasonalAgronomy } from './components/SeasonalAgronomy';
import { AdminLoginModal } from './components/AdminLoginModal';
import { AdminChangeCredentialsModal } from './components/AdminChangeCredentialsModal';
import { CropVideoGeneratorModal } from './components/CropVideoGeneratorModal';
import { UserProfileModal } from './components/UserProfileModal';
import { speakText, stopSpeaking, TTSState } from './utils/audio';
import agriFieldImage from './assets/images/agri_field_hero_1789982215111.jpg';
import { useLanguage } from './context/LanguageContext';
import { useFirebase } from './context/FirebaseContext';

export default function App() {
  const { language, t, getLocalizedProduct } = useLanguage();
  const {
    user,
    isAdminUser,
    products: fbProducts,
    orders: fbOrders,
    isLoadingProducts: isFbLoading,
    placeOrder: fbPlaceOrder,
    saveProduct: fbSaveProduct,
    updateProduct: fbUpdateProduct,
    deleteProduct: fbDeleteProduct,
    updateOrderStatus: fbUpdateOrderStatus,
    logout: fbLogout,
    purgeAndSeedProducts,
  } = useFirebase();

  // Main Products State (loaded from Firebase and API)
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);

  // Navigation & View State
  const [isAdmin, setIsAdmin] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [inStockOnly, setInStockOnly] = useState(false);
  const [sortBy, setSortBy] = useState('featured');

  // Admin Authentication & Session State
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('agricare_admin_session');
      if (saved) {
        const parsed = JSON.parse(saved);
        return Boolean(parsed.isLoggedIn);
      }
    } catch {}
    return false;
  });

  const [adminUsername, setAdminUsername] = useState<string>(() => {
    try {
      const saved = localStorage.getItem('agricare_admin_session');
      if (saved) {
        const parsed = JSON.parse(saved);
        return parsed.username || 'admin';
      }
    } catch {}
    return 'admin';
  });

  // Modals & Panels State
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isAdvisorOpen, setIsAdvisorOpen] = useState(false);
  const [advisorInitialPrompt, setAdvisorInitialPrompt] = useState<string>('');
  const [isAdminLoginModalOpen, setIsAdminLoginModalOpen] = useState(false);
  const [isChangeCredentialsModalOpen, setIsChangeCredentialsModalOpen] = useState(false);
  const [confirmedOrder, setConfirmedOrder] = useState<Order | null>(null);
  const [isVideoGeneratorOpen, setIsVideoGeneratorOpen] = useState(false);
  const [videoModalImage, setVideoModalImage] = useState<string | undefined>();
  const [videoModalPrompt, setVideoModalPrompt] = useState<string | undefined>();
  const [isUserProfileOpen, setIsUserProfileOpen] = useState(false);

  const handleOpenVideoGenerator = (imageUrl?: string, prompt?: string) => {
    setVideoModalImage(imageUrl);
    setVideoModalPrompt(prompt);
    setIsVideoGeneratorOpen(true);
  };

  const handleOpenAdvisorWithPrompt = (prompt?: string) => {
    if (prompt) {
      setAdvisorInitialPrompt(prompt);
    }
    setIsAdvisorOpen(true);
  };

  // Cart State with LocalStorage Persistence
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('agricare_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Audio / TTS State
  const [ttsState, setTtsState] = useState<TTSState>({
    isPlaying: false,
    isLoading: false,
    error: null,
  });
  const [activeSpeechText, setActiveSpeechText] = useState<string | null>(null);

  // Global Theme State ('light' | 'dark') for low-light farmer usability
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    try {
      const saved = localStorage.getItem('agricare_theme');
      if (saved === 'dark' || saved === 'light') return saved;
      return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    } catch {
      return 'light';
    }
  });

  useEffect(() => {
    try {
      const root = document.documentElement;
      if (theme === 'dark') {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
      localStorage.setItem('agricare_theme', theme);
    } catch (e) {
      console.error('Failed to persist theme:', e);
    }
  }, [theme]);

  const handleToggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  // Save Cart to LocalStorage
  useEffect(() => {
    try {
      localStorage.setItem('agricare_cart', JSON.stringify(cart));
    } catch (e) {
      console.error('Failed to persist cart:', e);
    }
  }, [cart]);

  // Load Products & Orders from Backend API & Sync with Firebase
  const fetchProductsAndOrders = async () => {
    try {
      setIsLoadingProducts(true);
      const [prodRes, orderRes] = await Promise.all([
        fetch('/api/products'),
        fetch('/api/orders'),
      ]);

      if (prodRes.ok) {
        const prodData = await prodRes.json();
        if (prodData.products && prodData.products.length > 0) {
          setProducts(prodData.products);
        }
      }

      if (orderRes.ok) {
        const orderData = await orderRes.json();
        if (orderData.orders && orderData.orders.length > 0) {
          setOrders(orderData.orders);
        }
      }
    } catch (err) {
      console.warn('API fetch fallback to initial data:', err);
    } finally {
      setIsLoadingProducts(false);
    }
  };

  useEffect(() => {
    fetchProductsAndOrders();
  }, []);

  // Sync real-time updates from Firebase Firestore
  useEffect(() => {
    if (fbProducts && fbProducts.length > 0) {
      setProducts(fbProducts);
      setIsLoadingProducts(false);
    }
  }, [fbProducts]);

  useEffect(() => {
    if (fbOrders && fbOrders.length > 0) {
      setOrders(fbOrders);
    }
  }, [fbOrders]);

  // Auto-detect Admin when Google User signs in
  useEffect(() => {
    if (user && (isAdminUser || user.email === 'sujith13022005@gmail.com')) {
      setIsAdminLoggedIn(true);
      setAdminUsername(user.displayName || user.email || 'Admin');
    }
  }, [user, isAdminUser]);

  // Cart Item Helpers
  const cartCount = useMemo(() => {
    return cart.reduce((sum, item) => sum + item.quantity, 0);
  }, [cart]);

  const cartTotal = useMemo(() => {
    return cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  }, [cart]);

  const getProductCartQuantity = (productId: string) => {
    const found = cart.find((i) => i.product.id === productId);
    return found ? found.quantity : 0;
  };

  const handleAddToCart = (product: Product, quantity = 1) => {
    if (product.stock <= 0) return;

    setCart((prev) => {
      const index = prev.findIndex((i) => i.product.id === product.id);
      if (index > -1) {
        const updated = [...prev];
        const newQty = Math.min(product.stock, updated[index].quantity + quantity);
        updated[index] = { ...updated[index], quantity: newQty };
        return updated;
      } else {
        return [...prev, { product, quantity: Math.min(product.stock, quantity) }];
      }
    });
  };

  const handleUpdateCartQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      handleRemoveCartItem(productId);
      return;
    }

    setCart((prev) =>
      prev.map((item) => {
        if (item.product.id === productId) {
          return { ...item, quantity: Math.min(item.product.stock, quantity) };
        }
        return item;
      })
    );
  };

  const handleRemoveCartItem = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
  };

  const handleOrderSuccess = async (order: Order) => {
    setConfirmedOrder(order);
    setCart([]); // Clear cart
    try {
      await fbPlaceOrder(order);
    } catch (e) {
      console.warn('Firebase order placement fallback:', e);
    }
    // Refresh catalog to reflect updated stock levels
    fetchProductsAndOrders();
  };

  // TTS Speech Trigger
  const handleToggleSpeech = (text: string) => {
    if (ttsState.isPlaying && activeSpeechText === text) {
      stopSpeaking();
      setActiveSpeechText(null);
      setTtsState({ isPlaying: false, isLoading: false, error: null });
      return;
    }

    setActiveSpeechText(text);
    speakText(text, (state) => {
      setTtsState(state);
      if (!state.isPlaying && !state.isLoading) {
        setActiveSpeechText(null);
      }
    });
  };

  // Admin Product Operations
  const handleAdminAddProduct = async (productData: Partial<Product>) => {
    try {
      const response = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(productData),
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to add product');
      }

      if (data.product) {
        try {
          await fbSaveProduct(data.product);
        } catch (fbErr) {
          console.warn('Firebase product save sync:', fbErr);
        }
      }
    } catch (err) {
      // Fallback: direct save to Firebase if server offline
      if (productData.id && productData.name) {
        await fbSaveProduct(productData as Product);
      } else {
        throw err;
      }
    }

    await fetchProductsAndOrders();
  };

  const handleAdminUpdateProduct = async (productId: string, updates: Partial<Product>) => {
    try {
      await fetch(`/api/products/${productId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
    } catch (e) {
      console.warn('API update fallback:', e);
    }

    try {
      await fbUpdateProduct(productId, updates);
    } catch (e) {
      console.warn('Firebase product update:', e);
    }

    await fetchProductsAndOrders();
  };

  const handleAdminDeleteProduct = async (productId: string) => {
    try {
      await fetch(`/api/products/${productId}`, {
        method: 'DELETE',
      });
    } catch (e) {
      console.warn('API delete fallback:', e);
    }

    try {
      await fbDeleteProduct(productId);
    } catch (e) {
      console.warn('Firebase product delete:', e);
    }

    await fetchProductsAndOrders();
  };

  const handleAdminUpdateOrderStatus = async (
    orderId: string,
    status: Order['status'],
    notes?: string
  ) => {
    try {
      await fbUpdateOrderStatus(orderId, status, notes);
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status, notes: notes ?? o.notes } : o))
      );
    } catch (err) {
      console.error('Failed to update order status in Firebase:', err);
    }
  };

  const handleAdminResetCatalog = async () => {
    try {
      const response = await fetch('/api/products/reset', {
        method: 'POST',
      });

      if (response.ok) {
        const data = await response.json();
        setProducts(data.products);
      }
      // Purge all existing Firestore products and re-seed 15 new products
      await purgeAndSeedProducts();
    } catch (err) {
      console.error('Reset catalog error:', err);
    }
  };

  // Admin Authentication Handlers
  const handleAdminToggleClick = () => {
    if (isAdmin) {
      setIsAdmin(false);
    } else {
      if (isAdminLoggedIn) {
        setIsAdmin(true);
      } else {
        setIsAdminLoginModalOpen(true);
      }
    }
  };

  const handleAdminLoginSuccess = (username: string) => {
    setIsAdminLoggedIn(true);
    setAdminUsername(username);
    setIsAdmin(true);
  };

  const handleAdminLogout = () => {
    setIsAdminLoggedIn(false);
    setIsAdmin(false);
    try {
      localStorage.removeItem('agricare_admin_session');
      fbLogout();
    } catch {}
  };

  const handleAdminCredentialsUpdated = (newUsername: string) => {
    setAdminUsername(newUsername);
  };

  // Category counts
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { All: products.length };
    for (const p of products) {
      counts[p.category] = (counts[p.category] || 0) + 1;
    }
    return counts;
  }, [products]);

  // Filter & Sort Products
  const filteredProducts = useMemo(() => {
    return products
      .filter((p) => {
        // Category filter
        if (selectedCategory !== 'All' && p.category !== selectedCategory) {
          return false;
        }

        // In-stock filter
        if (inStockOnly && p.stock <= 0) {
          return false;
        }

        // Search filter
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchTitle = p.name.toLowerCase().includes(q);
          const matchCategory = p.category.toLowerCase().includes(q);
          const matchDesc = p.shortDescription.toLowerCase().includes(q) || p.description.toLowerCase().includes(q);
          const matchCrop = p.cropCompatibility.some((c) => c.toLowerCase().includes(q));
          const matchComposition = p.composition.toLowerCase().includes(q);
          return matchTitle || matchCategory || matchDesc || matchCrop || matchComposition;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'price-asc') return a.price - b.price;
        if (sortBy === 'price-desc') return b.price - a.price;
        if (sortBy === 'rating') return b.rating - a.rating;
        // Default: featured first
        return (b.featured ? 1 : 0) - (a.featured ? 1 : 0);
      });
  }, [products, selectedCategory, inStockOnly, searchQuery, sortBy]);

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAF8] dark:bg-[#0c140d] text-[#1E2E20] dark:text-[#E2EAE3] transition-colors duration-200">
      {/* Top Navigation */}
      <Navbar
        cartCount={cartCount}
        cartTotal={cartTotal}
        onOpenCart={() => setIsCartOpen(true)}
        isAdmin={isAdmin}
        isAdminLoggedIn={isAdminLoggedIn}
        adminUsername={adminUsername}
        onToggleAdmin={handleAdminToggleClick}
        onAdminLogout={handleAdminLogout}
        onOpenChangeCredentials={() => setIsChangeCredentialsModalOpen(true)}
        onOpenAdvisor={() => setIsAdvisorOpen(true)}
        onOpenVideoGenerator={() => handleOpenVideoGenerator()}
        onOpenUserProfile={() => setIsUserProfileOpen(true)}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        activeCategory={selectedCategory}
        onSelectCategory={(cat) => {
          setSelectedCategory(cat);
          setIsAdmin(false);
        }}
        onSelectProduct={(p) => {
          setSelectedProduct(p);
          setIsAdmin(false);
        }}
        allProducts={products}
        categoryCounts={categoryCounts}
        theme={theme}
        onToggleTheme={handleToggleTheme}
      />

      {/* Main Content Area */}
      <main className="flex-1">
        {isAdmin ? (
          /* Admin Dashboard & Inventory Management */
          <AdminDashboard
            products={products}
            orders={orders}
            onOpenAddModal={() => setIsAddModalOpen(true)}
            onUpdateProduct={handleAdminUpdateProduct}
            onDeleteProduct={handleAdminDeleteProduct}
            onResetCatalog={handleAdminResetCatalog}
            onBackToStore={() => setIsAdmin(false)}
            adminUsername={adminUsername}
            onOpenChangeCredentials={() => setIsChangeCredentialsModalOpen(true)}
            onLogout={handleAdminLogout}
            onUpdateOrderStatus={handleAdminUpdateOrderStatus}
          />
        ) : (
          /* Customer Storefront View */
          <div className="space-y-6 pb-16">
            {/* Welcome Banner */}
            <HeroBanner
              onOpenAdvisor={() => setIsAdvisorOpen(true)}
              onSelectCategory={(cat) => setSelectedCategory(cat)}
              onOpenVideoGenerator={() => handleOpenVideoGenerator()}
            />

            {/* Seasonal Agronomy & Crop Advisory (Anthiyur & Erode Gemini AI Integration) */}
            <SeasonalAgronomy
              onAddToCart={handleAddToCart}
              onSelectProduct={(p) => setSelectedProduct(p)}
              onOpenAdvisor={handleOpenAdvisorWithPrompt}
            />

            {/* Category Filter Bar */}
            <CategoryFilter
              selectedCategory={selectedCategory}
              onSelectCategory={(cat) => setSelectedCategory(cat)}
              inStockOnly={inStockOnly}
              onToggleInStockOnly={() => setInStockOnly(!inStockOnly)}
              sortBy={sortBy}
              onSortChange={setSortBy}
              categoryCounts={categoryCounts}
            />

            {/* Catalog Grid Section */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-2">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-xl sm:text-2xl font-black text-emerald-950 dark:text-emerald-100 font-['Outfit',sans-serif]">
                    {selectedCategory === 'All'
                      ? t('allSupplies')
                      : selectedCategory === 'Seeds'
                      ? t('seeds')
                      : selectedCategory === 'Fertilizers'
                      ? t('fertilizers')
                      : selectedCategory === 'Pesticides'
                      ? t('pesticides')
                      : selectedCategory === 'Farm Tools'
                      ? t('farmTools')
                      : selectedCategory === 'Organic Nutrients'
                      ? t('organicNutrients')
                      : `${selectedCategory}`}
                  </h2>
                  <p className="text-xs text-emerald-700 dark:text-emerald-400/90 mt-0.5">
                    {language === 'ta'
                      ? `${filteredProducts.length} சரிபார்க்கப்பட்ட வேளாண் பொருட்கள் கிடைக்கின்றன`
                      : `Showing ${filteredProducts.length} verified farm products`}
                    {searchQuery ? ` matching "${searchQuery}"` : ''}
                  </p>
                </div>
              </div>

              {/* Grid */}
              {isLoadingProducts ? (
                <div className="py-20 flex flex-col items-center justify-center text-emerald-800 dark:text-emerald-300">
                  <Loader2 className="w-8 h-8 animate-spin text-emerald-600 dark:text-emerald-400 mb-3" />
                  <p className="text-xs font-semibold">
                    {language === 'ta' ? 'AgriCare பட்டியல் ஏற்றப்படுகிறது...' : 'Loading AgriCare Catalog...'}
                  </p>
                </div>
              ) : filteredProducts.length === 0 ? (
                <div className="py-20 px-4 text-center bg-white dark:bg-[#131f15] rounded-3xl border border-emerald-100 dark:border-emerald-900/60 max-w-lg mx-auto space-y-3 shadow-xs">
                  <div className="w-14 h-14 rounded-full bg-emerald-50 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-300 flex items-center justify-center mx-auto">
                    <Sprout className="w-7 h-7" />
                  </div>
                  <h3 className="text-base font-bold text-emerald-950 dark:text-emerald-100">{t('noProductsFound')}</h3>
                  <p className="text-xs text-emerald-700 dark:text-emerald-300/80 leading-relaxed">
                    {language === 'ta'
                      ? 'உங்கள் தேடலுக்குரிய பொருட்கள் எதுவும் கிடைக்கவில்லை. வேறு பிரிவை தேர்வு செய்யவும்.'
                      : "We couldn't find any products matching your filters. Try clearing your search or selecting a different category."}
                  </p>
                  <button
                    onClick={() => {
                      setSelectedCategory('All');
                      setSearchQuery('');
                      setInStockOnly(false);
                    }}
                    className="px-4 py-2 rounded-xl bg-emerald-800 hover:bg-emerald-900 dark:bg-emerald-700 dark:hover:bg-emerald-600 text-white text-xs font-bold transition-colors cursor-pointer"
                  >
                    {t('resetFilters')}
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                  {filteredProducts.map((product) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      cartQuantity={getProductCartQuantity(product.id)}
                      onAddToCart={handleAddToCart}
                      onUpdateCartQuantity={handleUpdateCartQuantity}
                      onViewDetails={(p) => setSelectedProduct(p)}
                      onSpeakInstructions={(p) => {
                        const locP = getLocalizedProduct(p);
                        const script = `${locP.name}. ${locP.category}. ${locP.unit}. ${locP.usageInstructions}.`;
                        handleToggleSpeech(script);
                      }}
                      searchQuery={searchQuery}
                    />
                  ))}
                </div>
              )}
            </section>

            {/* Farm Trust Guarantees */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
              <div className="relative overflow-hidden grid grid-cols-1 md:grid-cols-3 gap-4 p-6 sm:p-8 rounded-3xl text-white shadow-md border border-emerald-800/40">
                {/* Real Agricultural Field Background Image */}
                <div className="absolute inset-0 z-0">
                  <img
                    src={agriFieldImage}
                    alt="AgriCare Farm Field Background"
                    className="w-full h-full object-cover object-center filter brightness-75"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-emerald-950/95 via-emerald-900/90 to-emerald-950/95" />
                </div>

                <div className="relative z-10 flex items-start gap-4">
                  <div className="w-11 h-11 rounded-2xl bg-emerald-800/90 border border-emerald-600/30 flex items-center justify-center text-emerald-300 shrink-0">
                    <ShieldCheck className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold font-['Outfit',sans-serif]">
                      {language === 'ta' ? 'அங்கீகரிக்கப்பட்ட தயாரிப்புகள்' : 'Manufacturer Certified'}
                    </h4>
                    <p className="text-xs text-emerald-200 mt-1 leading-relaxed">
                      {language === 'ta'
                        ? 'ஒவ்வொரு விதை பாக்கெட்டும் மற்றும் உர மூட்டையும் தூய்மை மற்றும் முளைப்புத்திறன் சோதனை செய்யப்பட்டது.'
                        : 'Every packet of seed and nutrient sack is batch-tested for purity, moisture, and high germination.'}
                    </p>
                  </div>
                </div>

                <div className="relative z-10 flex items-start gap-4">
                  <div className="w-11 h-11 rounded-2xl bg-emerald-800/90 border border-emerald-600/30 flex items-center justify-center text-amber-300 shrink-0">
                    <Truck className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold font-['Outfit',sans-serif]">
                      {language === 'ta' ? 'விரைவான கிராமப்புற விநியோகம்' : 'Fast Rural Dispatch'}
                    </h4>
                    <p className="text-xs text-emerald-200 mt-1 leading-relaxed">
                      {language === 'ta'
                        ? 'விவசாயத் தோட்டங்களுக்கும் கிராம சேகரிப்பு மையங்களுக்கும் நேரடி போக்குவரத்து வசதி.'
                        : 'Direct transport to farms and village collection centers across 12,000+ agricultural PIN codes.'}
                    </p>
                  </div>
                </div>

                <div className="relative z-10 flex items-start gap-4">
                  <div className="w-11 h-11 rounded-2xl bg-emerald-800/90 border border-emerald-600/30 flex items-center justify-center text-green-300 shrink-0">
                    <Bot className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold font-['Outfit',sans-serif]">
                      {language === 'ta' ? 'AI விவசாய ஆலோசனைகள்' : 'AI Agronomy Support'}
                    </h4>
                    <p className="text-xs text-emerald-200 mt-1 leading-relaxed">
                      {language === 'ta'
                        ? 'Gemini AI தொழில்நுட்பம் மூலம் குரல் வழி மருந்தளவு மற்றும் நோய் தடுப்பு ஆலோசனைகள்.'
                        : 'Instant audio dosage advice and disease diagnosis with Gemini AI and precision expert agronomy.'}
                    </p>
                  </div>
                </div>
              </div>
            </section>
          </div>
        )}
      </main>

      {/* Desktop Floating AI Advisor Trigger Button */}
      {!isAdvisorOpen && (
        <button
          onClick={() => setIsAdvisorOpen(true)}
          className="fixed bottom-6 right-6 z-40 hidden sm:flex items-center gap-2.5 px-4 py-3 bg-gradient-to-r from-emerald-800 to-green-800 hover:from-emerald-700 hover:to-green-700 text-white rounded-2xl shadow-xl border border-emerald-600/60 transition-all hover:scale-105 active:scale-95 cursor-pointer group"
          title="Open AgriCare AI Advisor (Google Search Grounding & Voice Input)"
        >
          <div className="relative">
            <Bot className="w-5 h-5 text-emerald-200" />
            <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-emerald-300 animate-ping" />
          </div>
          <div className="text-left">
            <p className="text-xs font-bold leading-tight flex items-center gap-1.5">
              <span>AgriCare AI Advisor</span>
              <span className="px-1.5 py-0.2 rounded-full bg-emerald-950/80 text-amber-300 text-[9px] font-mono">
                Gemini
              </span>
            </p>
            <p className="text-[10px] text-emerald-200/80">Voice & Search Grounded</p>
          </div>
        </button>
      )}

      {/* Floating Active Voice Bar if TTS is playing */}
      {ttsState.isPlaying && (
        <div className="fixed bottom-18 sm:bottom-6 right-4 z-40 max-w-sm bg-emerald-950 text-white px-4 py-3 rounded-2xl shadow-2xl border border-emerald-700 flex items-center justify-between gap-3 animate-in slide-in-from-bottom duration-200">
          <div className="flex items-center gap-2.5">
            <div className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping" />
            <div className="min-w-0">
              <p className="text-xs font-bold text-white flex items-center gap-1.5">
                <Volume2 className="w-3.5 h-3.5 text-amber-400" />
                <span>Reading Usage Directions</span>
              </p>
              <p className="text-[10px] text-emerald-300">Gemini 3.1 Flash Voice</p>
            </div>
          </div>

          <button
            onClick={() => {
              stopSpeaking();
              setActiveSpeechText(null);
              setTtsState({ isPlaying: false, isLoading: false, error: null });
            }}
            className="px-2.5 py-1 rounded-lg bg-amber-400 text-emerald-950 text-xs font-bold hover:bg-amber-300 transition-colors cursor-pointer"
          >
            Stop
          </button>
        </div>
      )}

      {/* Mobile Sticky Bottom Action Bar */}
      <div className="sm:hidden fixed bottom-0 left-0 right-0 z-30 bg-white/95 dark:bg-[#0c140e]/95 backdrop-blur-md border-t border-emerald-100 dark:border-emerald-900/60 px-3 py-2 flex items-center justify-around text-xs shadow-lg transition-colors">
        <button
          onClick={() => {
            setIsAdmin(false);
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className={`flex flex-col items-center gap-1 py-1 px-1.5 rounded-lg cursor-pointer ${
            !isAdmin ? 'text-emerald-800 dark:text-emerald-300 font-bold' : 'text-stone-500 dark:text-stone-400'
          }`}
        >
          <Sprout className="w-4 h-4" />
          <span className="text-[10px]">{language === 'ta' ? 'பட்டியல்' : 'Catalog'}</span>
        </button>

        <button
          onClick={() => setIsAdvisorOpen(true)}
          className="flex flex-col items-center gap-1 py-1 px-1.5 rounded-lg text-emerald-800 dark:text-emerald-300 font-semibold cursor-pointer"
        >
          <Bot className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
          <span className="text-[10px]">{language === 'ta' ? 'AI ஆலோசகர்' : 'Agri AI'}</span>
        </button>

        <button
          onClick={() => setIsCartOpen(true)}
          className="relative flex flex-col items-center gap-1 py-1 px-1.5 rounded-lg text-emerald-800 dark:text-emerald-300 font-bold cursor-pointer"
        >
          <div className="relative">
            <ShoppingBag className="w-4 h-4" />
            {cartCount > 0 && (
              <span className="absolute -top-1.5 -right-2 bg-amber-500 text-amber-950 text-[9px] font-black w-3.5 h-3.5 rounded-full flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </div>
          <span className="text-[10px]">{t('cart')}</span>
        </button>

        {/* Quick Theme Toggle on Mobile */}
        <button
          onClick={handleToggleTheme}
          className="flex flex-col items-center gap-1 py-1 px-1.5 rounded-lg text-stone-600 dark:text-amber-300 cursor-pointer"
          title={theme === 'dark' ? 'Switch to daylight mode' : 'Switch to night mode'}
        >
          {theme === 'dark' ? (
            <Sun className="w-4 h-4 text-amber-400" />
          ) : (
            <Moon className="w-4 h-4 text-emerald-800" />
          )}
          <span className="text-[10px]">{theme === 'dark' ? 'Light' : 'Dark'}</span>
        </button>

        <button
          onClick={() => setIsAdmin(!isAdmin)}
          className={`flex flex-col items-center gap-1 py-1 px-1.5 rounded-lg cursor-pointer ${
            isAdmin ? 'text-amber-900 dark:text-amber-400 font-bold' : 'text-stone-500 dark:text-stone-400'
          }`}
        >
          <LayoutDashboard className="w-4 h-4" />
          <span className="text-[10px]">{t('admin')}</span>
        </button>
      </div>

      {/* Footer */}
      <footer className="bg-emerald-950 dark:bg-[#071008] text-emerald-200 dark:text-emerald-300 py-10 border-t border-emerald-900 dark:border-emerald-950 text-xs mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-700 flex items-center justify-center text-white">
                <Sprout className="w-4 h-4" />
              </div>
              <span className="text-base font-bold text-white font-['Outfit',sans-serif]">
                AgriCare Farm Supplies
              </span>
            </div>
            <p className="text-emerald-300/80 leading-relaxed">
              {language === 'ta'
                ? 'அதிக மகசூலுக்கான அசல் சான்றளிக்கப்பட்ட விதைகள், தாவர ஊட்டச்சத்துக்கள், மற்றும் விவசாயக் கருவிகளை விவசாயிகளுக்கு நேரடியாக வழங்குகிறது.'
                : 'Supplying farmers with genuine certified seeds, balanced plant nutrition, bio-protection, and precision equipment for maximum yield.'}
            </p>
          </div>

          <div>
            <h4 className="font-bold text-white uppercase tracking-wider text-[11px] mb-2.5">
              {language === 'ta' ? 'பிரிவுகள்' : 'Categories'}
            </h4>
            <ul className="space-y-1.5 text-emerald-300/90">
              <li>
                <button onClick={() => { setIsAdmin(false); setSelectedCategory('Seeds'); }} className="hover:text-white cursor-pointer">
                  {t('seeds')}
                </button>
              </li>
              <li>
                <button onClick={() => { setIsAdmin(false); setSelectedCategory('Fertilizers'); }} className="hover:text-white cursor-pointer">
                  {t('fertilizers')}
                </button>
              </li>
              <li>
                <button onClick={() => { setIsAdmin(false); setSelectedCategory('Pesticides'); }} className="hover:text-white cursor-pointer">
                  {t('pesticides')}
                </button>
              </li>
              <li>
                <button onClick={() => { setIsAdmin(false); setSelectedCategory('Farm Tools'); }} className="hover:text-white cursor-pointer">
                  {t('farmTools')}
                </button>
              </li>
              <li>
                <button onClick={() => { setIsAdmin(false); setSelectedCategory('Organic Nutrients'); }} className="hover:text-white cursor-pointer">
                  {t('organicNutrients')}
                </button>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-white uppercase tracking-wider text-[11px] mb-2.5">
              {language === 'ta' ? 'விவசாயி உதவி & விநியோகம்' : 'Farmer Support & Dispatch'}
            </h4>
            <ul className="space-y-1.5 text-emerald-300/90">
              <li className="flex items-center gap-1.5">
                <PhoneCall className="w-3.5 h-3.5 text-emerald-400" />
                <span>{language === 'ta' ? 'கிசான் உதவி எண்:' : 'Kisan Helpline:'} 1800-425-AGRI</span>
              </li>
              <li>{language === 'ta' ? 'வாட்ஸ்அப் ஆர்டர் உதவி:' : 'WhatsApp Order Help:'} +91 98765 43210</li>
              <li>{language === 'ta' ? 'உதவி நேரம்: திங்கள் - சனி (காலை 6:00 - இரவு 9:00)' : 'Support Hours: Mon - Sat (6:00 AM - 9:00 PM)'}</li>
              <li>{language === 'ta' ? 'கட்டணம்: நேரடி பணம் & UPI' : 'Payment: Cash on Delivery & Direct UPI'}</li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-white uppercase tracking-wider text-[11px] mb-2.5">
              {language === 'ta' ? 'நிர்வாக மேலாண்மை' : 'Owner Management'}
            </h4>
            <p className="text-emerald-300/80 mb-3">
              {language === 'ta'
                ? 'கடை உரிமையாளர்கள் விலைகளை மாற்றவும், இருப்பை கண்காணிக்கவும், வாடிக்கையாளர் ஆர்டர்களை நிர்வகிக்கவும் முடியும்.'
                : 'Shop owners can adjust catalog prices, monitor depleted stock, and view recent customer dispatches.'}
            </p>
            <button
              onClick={() => setIsAdmin(!isAdmin)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-800 hover:bg-emerald-700 text-white font-semibold transition-colors cursor-pointer"
            >
              <LayoutDashboard className="w-3.5 h-3.5" />
              <span>
                {isAdmin
                  ? language === 'ta'
                    ? 'நிர்வாகத்திலிருந்து வெளியேறு'
                    : 'Exit Admin Mode'
                  : language === 'ta'
                  ? 'நிர்வாக மையம்'
                  : 'Access Admin Hub'}
              </span>
            </button>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 mt-8 border-t border-emerald-900 text-center text-emerald-400 text-[11px]">
          {language === 'ta'
            ? '© 2026 AgriCare வேளாண் பொருட்கள். விவசாய வளர்ச்சி மற்றும் சிறந்த அறுவடைக்கான துணை.'
            : '© 2026 AgriCare Farm Supplies. Empowering sustainable agriculture and prosperous harvests.'}
        </div>
      </footer>

      {/* Product Detail Modal */}
      {selectedProduct && (
        <ProductDetailModal
          product={selectedProduct}
          isOpen={true}
          onClose={() => setSelectedProduct(null)}
          cartQuantity={getProductCartQuantity(selectedProduct.id)}
          onAddToCart={handleAddToCart}
          onUpdateCartQuantity={handleUpdateCartQuantity}
          isPlayingAudio={ttsState.isPlaying}
          isLoadingAudio={ttsState.isLoading}
          onToggleAudio={handleToggleSpeech}
          searchQuery={searchQuery}
        />
      )}

      {/* Cart Drawer */}
      {isCartOpen && (
        <CartDrawer
          isOpen={true}
          onClose={() => setIsCartOpen(false)}
          items={cart}
          onUpdateQuantity={handleUpdateCartQuantity}
          onRemoveItem={handleRemoveCartItem}
          onProceedToCheckout={() => {
            setIsCartOpen(false);
            setIsCheckoutOpen(true);
          }}
        />
      )}

      {/* Checkout Modal */}
      {isCheckoutOpen && (
        <CheckoutModal
          isOpen={true}
          onClose={() => setIsCheckoutOpen(false)}
          items={cart}
          onOrderSuccess={handleOrderSuccess}
        />
      )}

      {/* Order Success Modal */}
      {confirmedOrder && (
        <OrderSuccessModal
          isOpen={true}
          order={confirmedOrder}
          onClose={() => setConfirmedOrder(null)}
        />
      )}

      {/* Add Product Modal (Admin) */}
      {isAddModalOpen && (
        <AddProductModal
          isOpen={true}
          onClose={() => setIsAddModalOpen(false)}
          onAddProduct={handleAdminAddProduct}
        />
      )}

      {/* AgriCare AI Agronomist Chatbot */}
      {isAdvisorOpen && (
        <AgriChatbot
          isOpen={true}
          onClose={() => setIsAdvisorOpen(false)}
          onSpeakText={handleToggleSpeech}
          activePlayingText={activeSpeechText}
          isLoadingAudio={ttsState.isLoading}
          onAddToCart={handleAddToCart}
          onSelectProduct={(p) => setSelectedProduct(p)}
          allProducts={products}
          initialQuery={advisorInitialPrompt}
          onClearInitialQuery={() => setAdvisorInitialPrompt('')}
        />
      )}

      {/* Admin Login Modal */}
      {isAdminLoginModalOpen && (
        <AdminLoginModal
          isOpen={true}
          onClose={() => setIsAdminLoginModalOpen(false)}
          onLoginSuccess={handleAdminLoginSuccess}
          savedUsername={adminUsername}
        />
      )}

      {/* Admin Change Credentials Modal */}
      {isChangeCredentialsModalOpen && (
        <AdminChangeCredentialsModal
          isOpen={true}
          onClose={() => setIsChangeCredentialsModalOpen(false)}
          currentUsername={adminUsername}
          onCredentialsUpdated={handleAdminCredentialsUpdated}
        />
      )}

      {/* Veo Video Generator Modal (veo-3.1-fast-generate-preview) */}
      {isVideoGeneratorOpen && (
        <CropVideoGeneratorModal
          isOpen={true}
          onClose={() => {
            setIsVideoGeneratorOpen(false);
            setVideoModalImage(undefined);
            setVideoModalPrompt(undefined);
          }}
          initialImageUrl={videoModalImage}
          initialPrompt={videoModalPrompt}
        />
      )}

      {/* Farmer Account Profile & Firestore Persistence Modal */}
      {isUserProfileOpen && (
        <UserProfileModal
          isOpen={true}
          onClose={() => setIsUserProfileOpen(false)}
          onSelectProduct={(p) => {
            setSelectedProduct(p);
            setIsUserProfileOpen(false);
          }}
          onAddToCart={handleAddToCart}
        />
      )}
    </div>
  );
}
