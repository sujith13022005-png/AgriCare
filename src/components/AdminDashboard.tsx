import React, { useState, useEffect } from 'react';
import {
  Plus,
  AlertTriangle,
  Package,
  CheckCircle2,
  TrendingDown,
  Trash2,
  Edit2,
  Search,
  RotateCcw,
  Store,
  DollarSign,
  ClipboardList,
  Layers,
  ArrowUpRight,
  ShieldCheck,
  Check,
  X,
  User,
  KeyRound,
  LogOut,
  Shield,
  ShieldAlert,
  BarChart3,
  Mail,
  Zap,
  Printer,
} from 'lucide-react';
import { Product, Order, LowStockEmailAlert, EmailAlertSettings } from '../types';
import { formatCurrency, formatDate } from '../utils/formatters';
import { useLanguage } from '../context/LanguageContext';
import { AdminAnalytics } from './AdminAnalytics';
import { LowStockAlertBanner } from './LowStockAlertBanner';
import { LowStockEmailModal } from './LowStockEmailModal';
import { LowStockAlertsTab } from './LowStockAlertsTab';
import { PrintOrderModal } from './PrintOrderModal';

interface AdminDashboardProps {
  products: Product[];
  orders: Order[];
  onOpenAddModal: () => void;
  onUpdateProduct: (productId: string, updates: Partial<Product>) => Promise<void>;
  onDeleteProduct: (productId: string) => Promise<void>;
  onResetCatalog: () => Promise<void>;
  onBackToStore: () => void;
  adminUsername?: string;
  onOpenChangeCredentials?: () => void;
  onLogout?: () => void;
  onUpdateOrderStatus?: (orderId: string, status: Order['status'], notes?: string) => Promise<void>;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  products,
  orders,
  onOpenAddModal,
  onUpdateProduct,
  onDeleteProduct,
  onResetCatalog,
  onBackToStore,
  adminUsername = 'admin',
  onOpenChangeCredentials,
  onLogout,
  onUpdateOrderStatus,
}) => {
  const { language, t, getLocalizedProduct } = useLanguage();
  const [adminTab, setAdminTab] = useState<'inventory' | 'orders' | 'alerts' | 'analytics' | 'security'>('inventory');
  const [filterMode, setFilterMode] = useState<'all' | 'low-stock' | 'out-of-stock'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [editingPriceId, setEditingPriceId] = useState<string | null>(null);
  const [tempPrice, setTempPrice] = useState<number>(0);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  // Email Alert Engine State (Automatically triggers at stock < 5)
  const [recipientEmail, setRecipientEmail] = useState<string>('sujith13022005@gmail.com');
  const [emailAlerts, setEmailAlerts] = useState<LowStockEmailAlert[]>([]);
  const [selectedAlert, setSelectedAlert] = useState<LowStockEmailAlert | null>(null);
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [isBulkRestocking, setIsBulkRestocking] = useState(false);

  // Visual Print Order State
  const [orderToPrint, setOrderToPrint] = useState<Order | null>(null);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);

  const handlePrintOrder = (order: Order) => {
    setOrderToPrint(order);
    setIsPrintModalOpen(true);
  };

  // Identify low inventory items (less than 5 units left, per user prompt)
  const lowStockThreshold = 5;
  const lowStockProducts = products.filter(
    (p) => p.stock < (p.lowStockThreshold || lowStockThreshold)
  );
  const outOfStockProducts = products.filter((p) => p.stock <= 0);

  // Fetch / sync server email alerts on load & when catalog updates
  useEffect(() => {
    let isMounted = true;
    const loadEmailAlerts = async () => {
      try {
        const res = await fetch('/api/admin/low-stock-alerts');
        if (!res.ok) return;
        const data = await res.json();
        if (isMounted) {
          if (data.settings?.recipientEmail) {
            setRecipientEmail(data.settings.recipientEmail);
          }
          if (Array.isArray(data.alerts)) {
            setEmailAlerts(data.alerts);
            if (data.alerts.length > 0 && !selectedAlert) {
              setSelectedAlert(data.alerts[0]);
            }
          }
        }
      } catch (err) {
        console.warn('Low stock email alert sync:', err);
      }
    };
    loadEmailAlerts();
    return () => {
      isMounted = false;
    };
  }, [products.length]);

  // Bulk proactive restock
  const handleBulkRestock = async (qty: number = 25) => {
    setIsBulkRestocking(true);
    try {
      // Call backend bulk restock API
      const res = await fetch('/api/admin/low-stock-alerts/bulk-restock', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ restockAmount: qty }),
      });
      const data = await res.json();
      if (data.alerts) {
        setEmailAlerts(data.alerts);
      }

      // Proactively update each low stock product in parent state & DB
      for (const p of lowStockProducts) {
        await onUpdateProduct(p.id, { stock: p.stock + qty });
      }

      setStatusMessage(`Proactively replenished all ${lowStockProducts.length} low-stock items with +${qty} units!`);
      setTimeout(() => setStatusMessage(null), 3500);
    } catch (e) {
      console.warn('Bulk restock error:', e);
    } finally {
      setIsBulkRestocking(false);
    }
  };

  // Resend or dispatch test email alert
  const handleResendAlert = async (targetEmail?: string) => {
    try {
      const emailToUse = targetEmail || recipientEmail;
      const res = await fetch('/api/admin/low-stock-alerts/trigger', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipientEmail: emailToUse,
          triggerType: 'manual_test',
        }),
      });
      const data = await res.json();
      if (data.alerts) {
        setEmailAlerts(data.alerts);
      }
      if (data.alert) {
        setSelectedAlert(data.alert);
      }
      setStatusMessage(`Alert dispatched to ${emailToUse}`);
      setTimeout(() => setStatusMessage(null), 3000);
    } catch (e) {
      console.error(e);
    }
  };

  // Simulate stock drop to 2 units for live testing
  const handleSimulateDrop = async () => {
    try {
      const res = await fetch('/api/admin/low-stock-alerts/simulate-drop', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dropTo: 2 }),
      });
      const data = await res.json();
      if (data.droppedProduct) {
        await onUpdateProduct(data.droppedProduct.id, { stock: data.droppedProduct.newStock });
      }
      if (data.alerts) {
        setEmailAlerts(data.alerts);
      }
      if (data.alert) {
        setSelectedAlert(data.alert);
        setIsEmailModalOpen(true);
      }
      setStatusMessage(data.message || 'Simulated stock drop to 2 units! Alert triggered.');
      setTimeout(() => setStatusMessage(null), 4000);
    } catch (e) {
      console.error(e);
    }
  };

  // Update recipient email
  const handleUpdateRecipientEmail = async (email: string) => {
    setRecipientEmail(email);
    try {
      await fetch('/api/admin/low-stock-alerts/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ recipientEmail: email }),
      });
    } catch (e) {
      console.error(e);
    }
  };

  // Restock product from alert modal or table
  const handleRestockProductFromModal = async (productId: string, quantity: number) => {
    const target = products.find((p) => p.id === productId);
    if (!target) return;
    const newStock = target.stock + quantity;
    await onUpdateProduct(productId, { stock: newStock });

    try {
      const res = await fetch('/api/admin/low-stock-alerts/restock', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId, quantity }),
      });
      const data = await res.json();
      if (data.alerts) {
        setEmailAlerts(data.alerts);
      }
    } catch (e) {
      console.warn('API restock sync:', e);
    }
  };

  // Filtered products for table
  const filteredProducts = products.filter((p) => {
    if (filterMode === 'low-stock') {
      if (p.stock > (p.lowStockThreshold || lowStockThreshold) || p.stock === 0) return false;
    } else if (filterMode === 'out-of-stock') {
      if (p.stock > 0) return false;
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        p.name.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.composition.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const totalRevenue = orders.reduce((sum, o) => sum + o.total, 0);

  const handleInlineStockChange = async (product: Product, delta: number) => {
    const newStock = Math.max(0, product.stock + delta);
    await onUpdateProduct(product.id, { stock: newStock });
    setStatusMessage(`Updated stock for "${product.name}" to ${newStock} units`);
    setTimeout(() => setStatusMessage(null), 3000);
  };

  const handleQuickRestock = async (product: Product, amount: number) => {
    const newStock = product.stock + amount;
    await onUpdateProduct(product.id, { stock: newStock });
    setStatusMessage(`Restocked +${amount} units for "${product.name}" (Total: ${newStock})`);
    setTimeout(() => setStatusMessage(null), 3000);
  };

  const handleSavePrice = async (product: Product) => {
    if (tempPrice > 0) {
      await onUpdateProduct(product.id, { price: tempPrice });
      setEditingPriceId(null);
      setStatusMessage(`Updated price for "${product.name}" to ${formatCurrency(tempPrice)}`);
      setTimeout(() => setStatusMessage(null), 3000);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 animate-in fade-in duration-200">
      {/* Top Header & Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-emerald-100 dark:border-emerald-900/60">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-900 dark:text-amber-200 border border-amber-300 dark:border-amber-800 text-xs font-bold">
              Store Owner Portal
            </span>
            <span className="text-xs text-emerald-700 dark:text-emerald-400 font-medium">Live Inventory & Order Desk</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-emerald-950 dark:text-emerald-100 font-['Outfit',sans-serif] mt-1">
            AgriCare Inventory & Admin Hub
          </h1>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Admin User Badge */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-[#152317] border border-emerald-200 dark:border-emerald-800 text-xs font-semibold text-emerald-950 dark:text-emerald-200">
            <User className="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-400" />
            <span>
              Admin: <strong className="text-emerald-900 dark:text-emerald-100 font-bold">{adminUsername}</strong>
            </span>
          </div>

          {/* Change Credentials Quick Button */}
          {onOpenChangeCredentials && (
            <button
              id="admin-change-credentials-header-btn"
              onClick={onOpenChangeCredentials}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white dark:bg-[#18281c] border border-stone-200 dark:border-emerald-800 hover:border-amber-300 text-stone-700 dark:text-emerald-300 hover:text-amber-900 dark:hover:text-amber-300 hover:bg-amber-50/50 dark:hover:bg-amber-950/30 text-xs font-semibold shadow-2xs transition-all cursor-pointer"
              title="Change admin username and password"
            >
              <KeyRound className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
              <span>Change Login</span>
            </button>
          )}

          <button
            onClick={onBackToStore}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white dark:bg-[#18281c] border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-[#203525] text-xs sm:text-sm font-semibold shadow-2xs transition-all cursor-pointer"
          >
            <Store className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>Customer View</span>
          </button>

          <button
            id="admin-add-product-button"
            onClick={onOpenAddModal}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-emerald-800 hover:bg-emerald-900 dark:bg-emerald-700 dark:hover:bg-emerald-600 text-white text-xs sm:text-sm font-bold shadow-xs transition-all active:scale-95 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Product</span>
          </button>

          {/* Sign Out Button */}
          {onLogout && (
            <button
              onClick={onLogout}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 text-red-700 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-950/60 text-xs font-semibold transition-all cursor-pointer"
              title="Sign out of admin session"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          )}
        </div>
      </div>

      {/* Temporary Success/Status Alert */}
      {statusMessage && (
        <div className="p-3 rounded-xl bg-emerald-100/90 dark:bg-emerald-950/70 border border-emerald-300 dark:border-emerald-800 text-emerald-950 dark:text-emerald-100 text-xs font-medium flex items-center justify-between animate-in fade-in duration-150">
          <span>{statusMessage}</span>
          <button onClick={() => setStatusMessage(null)} className="text-emerald-800 dark:text-emerald-300 hover:text-emerald-950 dark:hover:text-white">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* KPI Overview Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Catalog Items */}
        <div className="p-4 rounded-2xl bg-white dark:bg-[#101912] border border-emerald-100 dark:border-emerald-900/60 shadow-2xs space-y-1 transition-colors">
          <div className="flex items-center justify-between text-xs text-emerald-700 dark:text-emerald-400 font-medium">
            <span>Total Catalog</span>
            <Package className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          </div>
          <p className="text-2xl font-black text-emerald-950 dark:text-emerald-100 font-['Outfit',sans-serif]">
            {products.length}
          </p>
          <p className="text-[11px] text-emerald-700 dark:text-emerald-400">Across 5 farm categories</p>
        </div>

        {/* Low Stock Alerts (Highlighting items < 5 units left) */}
        <div
          id="admin-low-stock-kpi-card"
          onClick={() => {
            setAdminTab('alerts');
            if (lowStockProducts.length > 0) {
              setIsEmailModalOpen(true);
            }
          }}
          className={`p-4 rounded-2xl border transition-all cursor-pointer space-y-1 relative group ${
            lowStockProducts.length > 0
              ? 'bg-red-50/90 dark:bg-red-950/40 border-red-300 dark:border-red-700/60 shadow-xs hover:bg-red-100/70 dark:hover:bg-red-950/60'
              : 'bg-white dark:bg-[#101912] border-emerald-100 dark:border-emerald-900/60'
          }`}
        >
          <div className="flex items-center justify-between text-xs font-bold text-red-900 dark:text-red-200">
            <span className="flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-red-600" />
              <span>Low Stock Alert (&lt; 5 left)</span>
            </span>
            <AlertTriangle className="w-4 h-4 text-red-600 animate-bounce" />
          </div>
          <p className="text-2xl font-black text-red-950 dark:text-red-100 font-['Outfit',sans-serif]">
            {lowStockProducts.length}
          </p>
          <div className="flex items-center justify-between text-[11px] text-red-800 dark:text-red-300 font-medium">
            <span>{lowStockProducts.length > 0 ? 'Email Trigger Active' : 'All stocks healthy'}</span>
            <span className="text-[10px] underline font-bold group-hover:text-red-900 dark:group-hover:text-red-200">
              Open Alert →
            </span>
          </div>
        </div>

        {/* Out of Stock */}
        <div
          onClick={() => setFilterMode('out-of-stock')}
          className={`p-4 rounded-2xl border transition-all cursor-pointer space-y-1 ${
            outOfStockProducts.length > 0
              ? 'bg-red-50/90 dark:bg-red-950/40 border-red-300 dark:border-red-800/60 shadow-xs hover:bg-red-100/70 dark:hover:bg-red-950/60'
              : 'bg-white dark:bg-[#101912] border-emerald-100 dark:border-emerald-900/60'
          }`}
        >
          <div className="flex items-center justify-between text-xs font-bold text-red-900 dark:text-red-200">
            <span>Out of Stock</span>
            <TrendingDown className="w-4 h-4 text-red-600 dark:text-red-400" />
          </div>
          <p className="text-2xl font-black text-red-950 dark:text-red-100 font-['Outfit',sans-serif]">
            {outOfStockProducts.length}
          </p>
          <p className="text-[11px] text-red-800 dark:text-red-300 font-medium">
            {outOfStockProducts.length > 0 ? 'Temporarily unavailable' : 'Zero depleted items'}
          </p>
        </div>

        {/* Total Orders Placed */}
        <div
          onClick={() => setAdminTab('orders')}
          className="p-4 rounded-2xl bg-white dark:bg-[#101912] border border-emerald-100 dark:border-emerald-900/60 shadow-2xs space-y-1 cursor-pointer hover:bg-emerald-50/30 dark:hover:bg-emerald-950/30 transition-colors"
        >
          <div className="flex items-center justify-between text-xs text-emerald-700 dark:text-emerald-400 font-medium">
            <span>Farmer Orders</span>
            <ClipboardList className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          </div>
          <p className="text-2xl font-black text-emerald-950 dark:text-emerald-100 font-['Outfit',sans-serif]">
            {orders.length}
          </p>
          <p className="text-[11px] text-emerald-700 dark:text-emerald-400 font-semibold">
            {formatCurrency(totalRevenue)} total sales
          </p>
        </div>
      </div>

      {/* Visual Low Stock Email Alert Banner (Auto-triggers on inventory < 5 units) */}
      <LowStockAlertBanner
        lowStockCount={lowStockProducts.length}
        recipientEmail={recipientEmail}
        onOpenEmailModal={() => setIsEmailModalOpen(true)}
        onBulkRestock={handleBulkRestock}
        isRestocking={isBulkRestocking}
      />

      {/* Main Tab Switcher */}
      <div className="flex items-center justify-between border-b border-emerald-100 dark:border-emerald-900/60 pb-3 flex-wrap gap-3">
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setAdminTab('inventory')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
              adminTab === 'inventory'
                ? 'bg-emerald-800 dark:bg-emerald-700 text-white shadow-xs'
                : 'bg-emerald-50 dark:bg-[#152317] text-emerald-900 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-[#1f3322]'
            }`}
          >
            Inventory Management
          </button>
          <button
            onClick={() => setAdminTab('orders')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
              adminTab === 'orders'
                ? 'bg-emerald-800 dark:bg-emerald-700 text-white shadow-xs'
                : 'bg-emerald-50 dark:bg-[#152317] text-emerald-900 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-[#1f3322]'
            }`}
          >
            Customer Orders ({orders.length})
          </button>
          <button
            id="admin-alerts-tab-btn"
            onClick={() => setAdminTab('alerts')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              adminTab === 'alerts'
                ? 'bg-emerald-800 dark:bg-emerald-700 text-white shadow-xs'
                : 'bg-emerald-50 dark:bg-[#152317] text-emerald-900 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-[#1f3322]'
            }`}
          >
            <Mail className="w-3.5 h-3.5 text-red-500" />
            <span>Low Stock Alerts</span>
            {lowStockProducts.length > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-red-600 text-white text-[10px] font-extrabold animate-pulse">
                {lowStockProducts.length}
              </span>
            )}
          </button>
          <button
            id="admin-analytics-tab-btn"
            onClick={() => setAdminTab('analytics')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              adminTab === 'analytics'
                ? 'bg-emerald-800 dark:bg-emerald-700 text-white shadow-xs'
                : 'bg-emerald-50 dark:bg-[#152317] text-emerald-900 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-[#1f3322]'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400" />
            <span>{language === 'ta' ? 'விற்பனை பகுப்பாய்வு' : 'Analytics & Performance'}</span>
          </button>
          <button
            id="admin-security-tab-btn"
            onClick={() => setAdminTab('security')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              adminTab === 'security'
                ? 'bg-emerald-800 dark:bg-emerald-700 text-white shadow-xs'
                : 'bg-emerald-50 dark:bg-[#152317] text-emerald-900 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-[#1f3322]'
            }`}
          >
            <KeyRound className="w-3.5 h-3.5 text-amber-500" />
            <span>Admin Security & Login</span>
          </button>
        </div>

        {adminTab === 'inventory' && (
          <button
            onClick={() => {
              if (confirm('Reset catalog to default seed dataset? Any custom additions will be restored.')) {
                onResetCatalog();
              }
            }}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-stone-200 dark:border-emerald-800 text-stone-600 dark:text-emerald-400 hover:bg-stone-100 dark:hover:bg-[#152317] text-xs font-medium transition-colors cursor-pointer"
            title="Reset to initial products"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Demo Data</span>
          </button>
        )}
      </div>

      {/* INVENTORY TAB CONTENT */}
      {adminTab === 'inventory' && (
        <div className="space-y-4">
          {/* Low Stock Attention Notice Banner */}
          {lowStockProducts.length > 0 && (
            <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/15 via-amber-400/10 to-amber-50 dark:from-amber-950/40 dark:via-amber-900/20 dark:to-amber-950/30 border border-amber-300 dark:border-amber-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-amber-950 dark:text-amber-200">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-amber-500 text-amber-950 flex items-center justify-center font-bold shrink-0 shadow-xs">
                  <AlertTriangle className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="font-extrabold text-sm text-amber-950 dark:text-amber-100">
                    Restock Attention: {lowStockProducts.length} Products Have Under 5 Units Remaining
                  </p>
                  <p className="text-amber-800 dark:text-amber-300 mt-0.5">
                    Items highlighted in amber below are nearing stock exhaustion. Use one-click restock to replenish units.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setFilterMode(filterMode === 'low-stock' ? 'all' : 'low-stock')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all cursor-pointer ${
                    filterMode === 'low-stock'
                      ? 'bg-amber-600 text-white border-amber-700'
                      : 'bg-white dark:bg-[#152317] text-amber-900 dark:text-amber-300 border-amber-300 dark:border-amber-800 hover:bg-amber-100 dark:hover:bg-[#1f3322]'
                  }`}
                >
                  {filterMode === 'low-stock' ? 'Show All Products' : 'Filter Low Stock Only'}
                </button>
              </div>
            </div>
          )}

          {/* Table Filters & Search Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white dark:bg-[#101912] p-3 rounded-2xl border border-emerald-100 dark:border-emerald-900/60 transition-colors">
            {/* Filter Pills */}
            <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
              <button
                onClick={() => setFilterMode('all')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap cursor-pointer ${
                  filterMode === 'all'
                    ? 'bg-emerald-800 dark:bg-emerald-700 text-white'
                    : 'bg-emerald-50 dark:bg-[#152317] text-emerald-900 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-[#1f3322]'
                }`}
              >
                All Items ({products.length})
              </button>
              <button
                onClick={() => setFilterMode('low-stock')}
                className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap cursor-pointer ${
                  filterMode === 'low-stock'
                    ? 'bg-amber-500 text-amber-950 font-bold'
                    : 'bg-amber-50 dark:bg-amber-950/40 text-amber-900 dark:text-amber-300 hover:bg-amber-100 dark:hover:bg-amber-950/60 border border-amber-200 dark:border-amber-800'
                }`}
              >
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>Low Stock &lt; 5 ({lowStockProducts.length})</span>
              </button>
              <button
                onClick={() => setFilterMode('out-of-stock')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap cursor-pointer ${
                  filterMode === 'out-of-stock'
                    ? 'bg-red-600 text-white'
                    : 'bg-red-50 dark:bg-red-950/40 text-red-900 dark:text-red-300 hover:bg-red-100 dark:hover:bg-red-950/60 border border-red-200 dark:border-red-900/60'
                }`}
              >
                Depleted ({outOfStockProducts.length})
              </button>
            </div>

            {/* Table Search Input */}
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search inventory items..."
                className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-white dark:bg-[#152317] border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-950 dark:text-emerald-100 placeholder-stone-400 dark:placeholder-stone-500 focus:border-emerald-600 dark:focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/15 outline-hidden"
              />
            </div>
          </div>

          {/* Product Inventory Table */}
          <div className="bg-white dark:bg-[#101912] rounded-2xl border border-emerald-100 dark:border-emerald-900/60 shadow-2xs overflow-hidden transition-colors">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-emerald-50/80 dark:bg-[#142016] text-emerald-950 dark:text-emerald-200 font-bold uppercase tracking-wider text-[11px] border-b border-emerald-100 dark:border-emerald-900/60">
                  <tr>
                    <th className="py-3.5 px-4">Product Info</th>
                    <th className="py-3.5 px-4">Category</th>
                    <th className="py-3.5 px-4">Price / Unit</th>
                    <th className="py-3.5 px-4">Stock Level</th>
                    <th className="py-3.5 px-4">Inventory Status</th>
                    <th className="py-3.5 px-4 text-right">Quick Actions</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-emerald-100 dark:divide-emerald-900/40">
                  {filteredProducts.map((product) => {
                    const isZero = product.stock <= 0;
                    const isLow = product.stock > 0 && product.stock <= (product.lowStockThreshold || lowStockThreshold);
                    const locProduct = getLocalizedProduct(product);

                    // Requirement: "highlight products with low inventory (e.g., less than 5 units left) using a different background color or a warning icon to help with restocking."
                    let rowBgClass = 'bg-white dark:bg-[#101912] hover:bg-emerald-50/20 dark:hover:bg-emerald-950/20';
                    if (isZero) {
                      rowBgClass = 'bg-red-50/70 dark:bg-red-950/30 hover:bg-red-50/90 dark:hover:bg-red-950/50 border-l-4 border-l-red-500';
                    } else if (isLow) {
                      rowBgClass = 'bg-amber-50/80 dark:bg-amber-950/30 hover:bg-amber-100/70 dark:hover:bg-amber-950/50 border-l-4 border-l-amber-500';
                    }

                    return (
                      <tr
                        key={product.id}
                        id={`inventory-row-${product.id}`}
                        className={`transition-colors ${rowBgClass}`}
                      >
                        {/* Product info */}
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <img
                              src={product.image}
                              alt={locProduct.name}
                              className="w-12 h-12 rounded-xl object-cover border border-emerald-100 dark:border-emerald-800 shrink-0"
                            />
                            <div className="min-w-0">
                              <p className="font-bold text-emerald-950 dark:text-emerald-100 text-xs line-clamp-1" title={locProduct.name}>
                                {locProduct.name}
                              </p>
                              <p className="text-[11px] text-emerald-700/80 dark:text-emerald-400/80 font-mono truncate max-w-xs">
                                {locProduct.composition}
                              </p>
                            </div>
                          </div>
                        </td>

                        {/* Category */}
                        <td className="py-3 px-4">
                          <span className="inline-block px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-[#18281c] text-emerald-800 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800 font-semibold text-[11px]">
                            {locProduct.category}
                          </span>
                        </td>

                        {/* Price with inline edit */}
                        <td className="py-3 px-4">
                          {editingPriceId === product.id ? (
                            <div className="flex items-center gap-1.5">
                              <input
                                type="number"
                                value={tempPrice}
                                onChange={(e) => setTempPrice(Number(e.target.value))}
                                className="w-20 px-2 py-1 text-xs border border-emerald-400 dark:border-emerald-600 rounded-lg bg-white dark:bg-[#152317] text-emerald-950 dark:text-emerald-100"
                                autoFocus
                              />
                              <button
                                onClick={() => handleSavePrice(product)}
                                className="p-1 rounded bg-emerald-700 text-white hover:bg-emerald-800 cursor-pointer"
                                title="Save price"
                              >
                                <Check className="w-3 h-3" />
                              </button>
                              <button
                                onClick={() => setEditingPriceId(null)}
                                className="p-1 rounded bg-gray-200 dark:bg-stone-700 text-gray-700 dark:text-stone-300 hover:bg-gray-300 cursor-pointer"
                                title="Cancel"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2 group">
                              <div>
                                <span className="font-extrabold text-emerald-950 dark:text-emerald-100 text-sm font-['Outfit',sans-serif]">
                                  {formatCurrency(product.price)}
                                </span>
                                <span className="text-[11px] text-emerald-700/70 dark:text-emerald-400/70 block">
                                  {product.unit}
                                </span>
                              </div>
                              <button
                                onClick={() => {
                                  setEditingPriceId(product.id);
                                  setTempPrice(product.price);
                                }}
                                className="opacity-0 group-hover:opacity-100 p-1 rounded text-stone-400 hover:text-emerald-700 dark:hover:text-emerald-300 transition-opacity cursor-pointer"
                                title="Edit price"
                              >
                                <Edit2 className="w-3 h-3" />
                              </button>
                            </div>
                          )}
                        </td>

                        {/* Stock Level with Stepper */}
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleInlineStockChange(product, -1)}
                              disabled={product.stock <= 0}
                              className="w-6 h-6 rounded-md bg-white dark:bg-[#18281c] border border-stone-200 dark:border-emerald-800 text-stone-700 dark:text-emerald-300 flex items-center justify-center hover:bg-stone-100 dark:hover:bg-[#203525] transition-colors disabled:opacity-40 cursor-pointer"
                              title="Decrease stock by 1"
                            >
                              -
                            </button>
                            <span className="w-8 text-center font-extrabold text-sm text-emerald-950 dark:text-emerald-100">
                              {product.stock}
                            </span>
                            <button
                              onClick={() => handleInlineStockChange(product, 1)}
                              className="w-6 h-6 rounded-md bg-white dark:bg-[#18281c] border border-stone-200 dark:border-emerald-800 text-stone-700 dark:text-emerald-300 flex items-center justify-center hover:bg-stone-100 dark:hover:bg-[#203525] transition-colors cursor-pointer"
                              title="Increase stock by 1"
                            >
                              +
                            </button>
                          </div>
                        </td>

                        {/* Inventory Status with Warning Highlighting */}
                        <td className="py-3 px-4">
                          {isZero ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-red-100 dark:bg-red-950/60 text-red-900 dark:text-red-200 font-extrabold text-[11px] border border-red-300 dark:border-red-800">
                              <X className="w-3.5 h-3.5 text-red-600 dark:text-red-400" />
                              <span>OUT OF STOCK</span>
                            </span>
                          ) : isLow ? (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-200/80 dark:bg-amber-950/60 text-amber-950 dark:text-amber-200 font-extrabold text-[11px] border border-amber-400 dark:border-amber-700 shadow-2xs">
                              <AlertTriangle className="w-3.5 h-3.5 text-amber-900 dark:text-amber-300 animate-pulse" />
                              <span>LOW STOCK ({product.stock} left)</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-900 dark:text-emerald-200 font-bold text-[11px] border border-emerald-300 dark:border-emerald-800">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-400" />
                              <span>Optimal Stock</span>
                            </span>
                          )}
                        </td>

                        {/* Quick Actions (Quick Restock +10 / +50, Delete) */}
                        <td className="py-3 px-4 text-right">
                          <div className="inline-flex items-center gap-1.5">
                            <button
                              id={`quick-restock-10-${product.id}`}
                              onClick={() => handleQuickRestock(product, 10)}
                              className="px-2 py-1 rounded-md bg-emerald-100 dark:bg-emerald-900/60 text-emerald-900 dark:text-emerald-200 hover:bg-emerald-200 dark:hover:bg-emerald-800 text-[11px] font-bold transition-colors cursor-pointer"
                              title="Quick restock +10 units"
                            >
                              +10 Units
                            </button>

                            <button
                              onClick={() => handleQuickRestock(product, 50)}
                              className="px-2 py-1 rounded-md bg-emerald-800 dark:bg-emerald-700 text-white hover:bg-emerald-900 dark:hover:bg-emerald-600 text-[11px] font-bold transition-colors cursor-pointer"
                              title="Restock batch +50 units"
                            >
                              +50 Units
                            </button>

                            <button
                              onClick={() => {
                                if (confirm(`Remove "${product.name}" from catalog?`)) {
                                  onDeleteProduct(product.id);
                                }
                              }}
                              className="p-1.5 rounded-md text-stone-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors ml-1 cursor-pointer"
                              title="Delete product"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {filteredProducts.length === 0 && (
              <div className="p-8 text-center text-xs text-emerald-800 dark:text-emerald-300">
                No products match the selected criteria or search term.
              </div>
            )}
          </div>
        </div>
      )}

      {/* ORDERS TAB CONTENT */}
      {adminTab === 'orders' && (
        <div className="space-y-4">
          <div className="bg-white dark:bg-[#101912] rounded-2xl border border-emerald-100 dark:border-emerald-900/60 shadow-2xs overflow-hidden transition-colors">
            <div className="p-4 bg-emerald-50/60 dark:bg-[#142016] border-b border-emerald-100 dark:border-emerald-900/60 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-emerald-950 dark:text-emerald-100">Farmer Customer Orders</h3>
                <p className="text-xs text-emerald-700 dark:text-emerald-400">
                  Track pending dispatches, verify contact numbers, and manage fulfillment.
                </p>
              </div>
              <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-200 dark:bg-emerald-900/80 text-emerald-900 dark:text-emerald-200">
                {orders.length} Total Orders
              </span>
            </div>

            <div className="divide-y divide-emerald-100 dark:divide-emerald-900/40">
              {orders.map((order) => (
                <div key={order.id} className="p-4 sm:p-5 hover:bg-emerald-50/20 dark:hover:bg-emerald-950/20 transition-colors space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-xs bg-emerald-100 dark:bg-emerald-950/70 text-emerald-950 dark:text-emerald-200 px-2 py-0.5 rounded-md border border-emerald-200 dark:border-emerald-800">
                        {order.id}
                      </span>
                      <span className="text-xs font-bold text-emerald-950 dark:text-emerald-100">
                        {order.customerName}
                      </span>
                      <span className="text-xs text-emerald-700 dark:text-emerald-400 font-medium">
                        ({order.phone})
                      </span>
                    </div>

                    <div className="flex items-center gap-2.5 flex-wrap justify-end">
                      <span className="text-xs text-stone-500 dark:text-stone-400 font-medium">
                        {formatDate(order.createdAt)}
                      </span>
                      {onUpdateOrderStatus ? (
                        <select
                          value={order.status}
                          onChange={(e) =>
                            onUpdateOrderStatus(
                              order.id,
                              e.target.value as Order['status']
                            )
                          }
                          className={`px-2.5 py-1 rounded-lg text-xs font-bold border transition-colors cursor-pointer outline-hidden ${
                            order.status === 'Delivered'
                              ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-900 dark:text-emerald-200 border-emerald-300 dark:border-emerald-800'
                              : order.status === 'Dispatched'
                              ? 'bg-blue-100 dark:bg-blue-950/60 text-blue-900 dark:text-blue-200 border-blue-300 dark:border-blue-800'
                              : 'bg-amber-100 dark:bg-amber-950/60 text-amber-900 dark:text-amber-200 border-amber-300 dark:border-amber-800'
                          }`}
                        >
                          <option value="Received">Received</option>
                          <option value="Preparing">Preparing</option>
                          <option value="Dispatched">Dispatched</option>
                          <option value="Delivered">Delivered</option>
                        </select>
                      ) : (
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                            order.status === 'Delivered'
                              ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-900 dark:text-emerald-200 border border-emerald-300 dark:border-emerald-800'
                              : order.status === 'Dispatched'
                              ? 'bg-blue-100 dark:bg-blue-950/60 text-blue-900 dark:text-blue-200 border border-blue-300 dark:border-blue-800'
                              : 'bg-amber-100 dark:bg-amber-950/60 text-amber-900 dark:text-amber-200 border border-amber-300 dark:border-amber-800'
                          }`}
                        >
                          {order.status}
                        </span>
                      )}

                      {/* Print Order Button */}
                      <button
                        onClick={() => handlePrintOrder(order)}
                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/70 dark:hover:bg-emerald-900 text-emerald-900 dark:text-emerald-200 border border-emerald-200 dark:border-emerald-800 text-xs font-bold transition-all shadow-2xs hover:shadow-xs cursor-pointer group"
                        title="Print clean order invoice and shipping summary"
                      >
                        <Printer className="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-400 group-hover:scale-110 transition-transform" />
                        <span>Print Order</span>
                      </button>
                    </div>
                  </div>

                  {/* Destination and Notes */}
                  <div className="text-xs text-emerald-900 dark:text-emerald-200 bg-emerald-50/50 dark:bg-[#152317] p-2.5 rounded-xl border border-emerald-100 dark:border-emerald-900/60 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <span className="font-semibold text-emerald-950 dark:text-emerald-100">Destination: </span>
                      <span>{order.address}, {order.villageCity} {order.pincode}</span>
                      {order.notes && (
                        <p className="text-[11px] text-emerald-700 dark:text-emerald-400 italic mt-0.5">
                          Note: "{order.notes}"
                        </p>
                      )}
                    </div>
                    <div className="text-right sm:text-right">
                      <span className="text-stone-500 dark:text-stone-400">Payment: </span>
                      <span className="font-bold text-emerald-950 dark:text-emerald-100">{order.paymentMethod}</span>
                      {order.upiId && <span className="text-emerald-700 dark:text-emerald-400 text-[11px]"> ({order.upiId})</span>}
                    </div>
                  </div>

                  {/* Items list */}
                  <div className="flex flex-wrap gap-2 text-xs">
                    {order.items.map((item, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-stone-50 dark:bg-[#18281c] text-stone-800 dark:text-emerald-200 border border-stone-200 dark:border-emerald-800"
                      >
                        <span className="font-semibold">{item.name}</span>
                        <span className="text-stone-500 dark:text-stone-400">×{item.quantity}</span>
                        <span className="font-bold text-emerald-950 dark:text-emerald-100">
                          ({formatCurrency(item.price * item.quantity)})
                        </span>
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center justify-between pt-2 text-xs border-t border-emerald-100/60 dark:border-emerald-900/40">
                    <span className="text-stone-500 dark:text-stone-400">
                      Total items: {order.items.reduce((s, i) => s + i.quantity, 0)}
                    </span>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-black text-emerald-950 dark:text-emerald-100 font-['Outfit',sans-serif]">
                        Total: {formatCurrency(order.total)}
                      </span>
                      <button
                        onClick={() => handlePrintOrder(order)}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-stone-100 hover:bg-emerald-100 dark:bg-[#162518] dark:hover:bg-emerald-950/80 text-stone-700 hover:text-emerald-900 dark:text-stone-300 dark:hover:text-emerald-200 border border-stone-200 dark:border-emerald-800 text-xs font-bold transition-colors cursor-pointer"
                        title="Print order slip"
                      >
                        <Printer className="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-400" />
                        <span>Print Order</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}

              {orders.length === 0 && (
                <div className="p-8 text-center text-xs text-emerald-800 dark:text-emerald-300">
                  No orders recorded yet. Customer checkouts will appear here instantly.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* LOW STOCK ALERTS & EMAIL NOTIFICATION TAB */}
      {adminTab === 'alerts' && (
        <LowStockAlertsTab
          products={products}
          lowStockProducts={lowStockProducts}
          alerts={emailAlerts}
          recipientEmail={recipientEmail}
          onOpenEmailModal={(a) => {
            if (a) setSelectedAlert(a);
            setIsEmailModalOpen(true);
          }}
          onRestockProduct={handleRestockProductFromModal}
          onBulkRestock={handleBulkRestock}
          onResendAlert={handleResendAlert}
          onSimulateDrop={handleSimulateDrop}
          onUpdateRecipientEmail={handleUpdateRecipientEmail}
        />
      )}

      {/* ANALYTICS & COMMERCIAL INTELLIGENCE TAB */}
      {adminTab === 'analytics' && (
        <AdminAnalytics
          products={products}
          orders={orders}
          onRestockProduct={(product, amount) => handleQuickRestock(product, amount)}
        />
      )}

      {/* SECURITY & LOGIN SETTINGS TAB */}
      {adminTab === 'security' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-[#101912] rounded-3xl border border-emerald-100 dark:border-emerald-900/60 p-6 sm:p-8 shadow-xs space-y-6 transition-colors">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-stone-100 dark:border-emerald-900/60">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-800 to-green-900 text-amber-300 flex items-center justify-center shadow-md ring-4 ring-emerald-50 dark:ring-emerald-950">
                  <KeyRound className="w-7 h-7" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-950/60 text-emerald-900 dark:text-emerald-200">
                      Store Security
                    </span>
                    <span className="text-xs text-emerald-700 dark:text-emerald-400 font-semibold flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                      Session Active
                    </span>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-black text-emerald-950 dark:text-emerald-100 font-['Outfit',sans-serif] mt-1">
                    Admin Account & Access Credentials
                  </h2>
                  <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-400 mt-1">
                    Manage your administrator username, password, and session permissions.
                  </p>
                </div>
              </div>

              {onOpenChangeCredentials && (
                <button
                  id="admin-security-open-change-modal-btn"
                  onClick={onOpenChangeCredentials}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-800 hover:bg-emerald-900 dark:bg-emerald-700 dark:hover:bg-emerald-600 text-white text-sm font-bold shadow-sm transition-all active:scale-98 cursor-pointer self-start sm:self-auto"
                >
                  <KeyRound className="w-4 h-4 text-amber-300" />
                  <span>Update Username & Password</span>
                </button>
              )}
            </div>

            {/* Account Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-5 rounded-2xl bg-stone-50 dark:bg-[#152317] border border-stone-200/80 dark:border-emerald-800 space-y-2">
                <span className="text-xs font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400">
                  Active Username
                </span>
                <div className="flex items-center gap-2">
                  <User className="w-5 h-5 text-emerald-700 dark:text-emerald-400" />
                  <span className="text-xl font-black text-emerald-950 dark:text-emerald-100 font-mono">
                    {adminUsername}
                  </span>
                </div>
                <p className="text-[11px] text-stone-500 dark:text-stone-400">
                  Used for store inventory and order access
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-stone-50 dark:bg-[#152317] border border-stone-200/80 dark:border-emerald-800 space-y-2">
                <span className="text-xs font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400">
                  Access Level
                </span>
                <div className="flex items-center gap-2">
                  <Shield className="w-5 h-5 text-emerald-700 dark:text-emerald-400" />
                  <span className="text-lg font-bold text-emerald-950 dark:text-emerald-100">
                    Store Administrator
                  </span>
                </div>
                <p className="text-[11px] text-stone-500 dark:text-stone-400">
                  Full permissions: stock edit, pricing, and catalog
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-stone-50 dark:bg-[#152317] border border-stone-200/80 dark:border-emerald-800 space-y-2">
                <span className="text-xs font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400">
                  Session State
                </span>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                  <span className="text-lg font-bold text-emerald-950 dark:text-emerald-100">
                    Authenticated
                  </span>
                </div>
                <p className="text-[11px] text-stone-500 dark:text-stone-400">
                  Protected with backend authentication
                </p>
              </div>
            </div>

            {/* Quick Actions & Tips Box */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-2">
              {/* Change credentials helper card */}
              <div className="p-6 rounded-2xl bg-emerald-50/70 dark:bg-[#152317] border border-emerald-200/80 dark:border-emerald-800 space-y-3">
                <h3 className="text-base font-extrabold text-emerald-950 dark:text-emerald-100 flex items-center gap-2">
                  <KeyRound className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
                  <span>Change Password & Username</span>
                </h3>
                <p className="text-xs text-emerald-900 dark:text-emerald-200 leading-relaxed">
                  You can change both your username and password at any time. When you change your credentials,
                  they are immediately saved to the server and your browser session so you can log in with them next time.
                </p>
                <div className="pt-2">
                  <button
                    onClick={onOpenChangeCredentials}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white dark:bg-[#18281c] border border-emerald-300 dark:border-emerald-700 text-emerald-900 dark:text-emerald-200 hover:bg-emerald-100 dark:hover:bg-[#203525] text-xs font-bold shadow-2xs transition-all cursor-pointer"
                  >
                    <span>Open Credentials Dialog</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Security Best Practices */}
              <div className="p-6 rounded-2xl bg-stone-50 dark:bg-[#152317] border border-stone-200/80 dark:border-emerald-800 space-y-3">
                <h3 className="text-base font-extrabold text-stone-900 dark:text-stone-100 flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                  <span>Default Credentials Notice</span>
                </h3>
                <p className="text-xs text-stone-600 dark:text-stone-400 leading-relaxed">
                  Initial defaults are <strong>admin</strong> and <strong>admin123</strong>. If you ever forget your customized login, you can safely reset it using the "Reset Demo Data" or the emergency reset button inside the credentials dialog.
                </p>
                {onLogout && (
                  <div className="pt-2">
                    <button
                      onClick={onLogout}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-red-50 dark:bg-red-950/40 hover:bg-red-100 dark:hover:bg-red-950/60 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-900/60 text-xs font-bold transition-colors cursor-pointer"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Log Out of Admin Session</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Visual Low Stock Email Alert Modal */}
      <LowStockEmailModal
        isOpen={isEmailModalOpen}
        onClose={() => setIsEmailModalOpen(false)}
        alert={selectedAlert || emailAlerts[0] || null}
        lowStockProducts={lowStockProducts}
        onRestockProduct={handleRestockProductFromModal}
        onBulkRestock={handleBulkRestock}
        onResendAlert={handleResendAlert}
        onSimulateDrop={handleSimulateDrop}
        recipientEmail={recipientEmail}
        onUpdateRecipientEmail={handleUpdateRecipientEmail}
      />

      {/* Visual Print Order Modal & Browser Print Dialog */}
      <PrintOrderModal
        isOpen={isPrintModalOpen}
        onClose={() => setIsPrintModalOpen(false)}
        order={orderToPrint}
        autoPrint={true}
      />
    </div>
  );
};
