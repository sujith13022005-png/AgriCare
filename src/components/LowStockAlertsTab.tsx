import React, { useState } from 'react';
import {
  AlertTriangle,
  Mail,
  Zap,
  Sparkles,
  Package,
  Send,
  RotateCcw,
  CheckCircle2,
  Clock,
  Settings,
  ShieldAlert,
  ArrowUpRight,
  ExternalLink,
  Plus,
  RefreshCw,
  Check,
} from 'lucide-react';
import { Product, LowStockEmailAlert } from '../types';
import { formatCurrency } from '../utils/formatters';
import { useLanguage } from '../context/LanguageContext';

interface LowStockAlertsTabProps {
  products: Product[];
  lowStockProducts: Product[];
  alerts: LowStockEmailAlert[];
  recipientEmail: string;
  onOpenEmailModal: (alert?: LowStockEmailAlert) => void;
  onRestockProduct: (productId: string, quantity: number) => Promise<void>;
  onBulkRestock: (quantity: number) => Promise<void>;
  onResendAlert: (recipientEmail?: string) => Promise<void>;
  onSimulateDrop: () => Promise<void>;
  onUpdateRecipientEmail: (email: string) => Promise<void>;
}

export const LowStockAlertsTab: React.FC<LowStockAlertsTabProps> = ({
  products,
  lowStockProducts,
  alerts,
  recipientEmail,
  onOpenEmailModal,
  onRestockProduct,
  onBulkRestock,
  onResendAlert,
  onSimulateDrop,
  onUpdateRecipientEmail,
}) => {
  const { language } = useLanguage();
  const [customEmail, setCustomEmail] = useState(recipientEmail);
  const [isEditingEmail, setIsEditingEmail] = useState(false);
  const [restockingId, setRestockingId] = useState<string | null>(null);
  const [isBulkRestocking, setIsBulkRestocking] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [selectedAlertForPreview, setSelectedAlertForPreview] = useState<LowStockEmailAlert | null>(
    alerts[0] || null
  );

  const activeAlert = alerts[0] || null;

  const handleRestock = async (productId: string, qty: number) => {
    setRestockingId(productId);
    await onRestockProduct(productId, qty);
    setRestockingId(null);
    setStatusMessage(`Proactively replenished item (+${qty} units)`);
    setTimeout(() => setStatusMessage(null), 3000);
  };

  const handleBulk = async (qty: number = 25) => {
    setIsBulkRestocking(true);
    await onBulkRestock(qty);
    setIsBulkRestocking(false);
    setStatusMessage(`Proactively restocked all depleted products (+${qty} units each)`);
    setTimeout(() => setStatusMessage(null), 3500);
  };

  const handleSaveEmail = async () => {
    if (customEmail.trim() && customEmail.includes('@')) {
      await onUpdateRecipientEmail(customEmail.trim());
      setIsEditingEmail(false);
      setStatusMessage(`Alert destination saved: ${customEmail.trim()}`);
      setTimeout(() => setStatusMessage(null), 3000);
    }
  };

  const totalReplenishmentNeeded = lowStockProducts.reduce((sum, p) => sum + Math.max(20, 25 - p.stock), 0);

  return (
    <div className="space-y-6">
      {/* Top Banner Notice if items are low */}
      {statusMessage && (
        <div className="p-3.5 rounded-xl bg-emerald-100 dark:bg-emerald-950/80 border border-emerald-300 dark:border-emerald-800 text-emerald-950 dark:text-emerald-100 text-xs font-semibold flex items-center justify-between">
          <span className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            {statusMessage}
          </span>
          <button onClick={() => setStatusMessage(null)} className="text-emerald-700">
            ×
          </button>
        </div>
      )}

      {/* KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Critical Low Stock Items */}
        <div className="p-4 rounded-2xl bg-white dark:bg-[#101912] border border-red-200 dark:border-red-900/60 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-xs font-bold text-red-700 dark:text-red-400">
            <span>Critical Low Stock (&lt; 5)</span>
            <ShieldAlert className="w-4 h-4 text-red-600 animate-pulse" />
          </div>
          <p className="text-3xl font-black text-red-950 dark:text-red-100 font-['Outfit',sans-serif]">
            {lowStockProducts.length}
          </p>
          <p className="text-[11px] text-red-800 dark:text-red-300">
            {lowStockProducts.length > 0 ? 'Requires immediate restock' : 'All items at safe levels'}
          </p>
        </div>

        {/* Total Restock Units to Buffer */}
        <div className="p-4 rounded-2xl bg-white dark:bg-[#101912] border border-amber-200 dark:border-amber-900/60 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-xs font-bold text-amber-800 dark:text-amber-400">
            <span>Recommended Restock Buffer</span>
            <Package className="w-4 h-4 text-amber-600" />
          </div>
          <p className="text-3xl font-black text-amber-950 dark:text-amber-100 font-['Outfit',sans-serif]">
            +{totalReplenishmentNeeded} <span className="text-sm font-medium">units</span>
          </p>
          <p className="text-[11px] text-amber-800 dark:text-amber-300">
            Target safe inventory: 25-50 units / SKU
          </p>
        </div>

        {/* Automated Alert Recipient */}
        <div className="p-4 rounded-2xl bg-white dark:bg-[#101912] border border-emerald-100 dark:border-emerald-900/60 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-xs font-semibold text-emerald-800 dark:text-emerald-400">
            <span>Alert Email Destination</span>
            <Mail className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-sm font-bold text-emerald-950 dark:text-emerald-100 truncate mt-1">
            {recipientEmail}
          </p>
          <p className="text-[11px] text-emerald-700 dark:text-emerald-400">
            Auto-dispatched via internal relay
          </p>
        </div>

        {/* Trigger Rule */}
        <div className="p-4 rounded-2xl bg-white dark:bg-[#101912] border border-emerald-100 dark:border-emerald-900/60 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-xs font-semibold text-emerald-800 dark:text-emerald-400">
            <span>Auto-Trigger Rule</span>
            <Zap className="w-4 h-4 text-amber-500 fill-amber-500" />
          </div>
          <p className="text-2xl font-black text-emerald-950 dark:text-emerald-100 font-['Outfit',sans-serif]">
            &lt; 5 Units
          </p>
          <p className="text-[11px] text-emerald-700 dark:text-emerald-400">
            Instant alert on product inventory drop
          </p>
        </div>
      </div>

      {/* Main Section: Low Stock Restock Station */}
      <div className="bg-white dark:bg-[#101912] rounded-2xl border border-emerald-100 dark:border-emerald-900/60 p-5 sm:p-6 shadow-2xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-stone-100 dark:border-emerald-900/60">
          <div>
            <h3 className="text-lg font-bold text-emerald-950 dark:text-emerald-100 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-500" />
              <span>Proactive Inventory Restock Station</span>
            </h3>
            <p className="text-xs text-stone-500 dark:text-emerald-400 mt-0.5">
              Items flagged automatically when stock drops below 5 units. Restock proactively with 1-click.
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => onOpenEmailModal(activeAlert || undefined)}
              className="px-3.5 py-2 rounded-xl bg-red-50 dark:bg-red-950/40 hover:bg-red-100 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-900 text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Mail className="w-3.5 h-3.5" />
              <span>Open Visual Email Preview</span>
            </button>

            <button
              onClick={() => handleBulk(25)}
              disabled={isBulkRestocking || lowStockProducts.length === 0}
              className="px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>{isBulkRestocking ? 'Restocking All...' : 'Proactive Restock All (+25 Units)'}</span>
            </button>
          </div>
        </div>

        {/* Product Table */}
        {lowStockProducts.length === 0 ? (
          <div className="p-8 text-center rounded-2xl bg-emerald-50/50 dark:bg-[#142216] border border-emerald-200 dark:border-emerald-800/80 space-y-2">
            <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
            <h4 className="text-base font-bold text-emerald-950 dark:text-emerald-100">
              All 100 Products at Safe Inventory Levels!
            </h4>
            <p className="text-xs text-emerald-800 dark:text-emerald-300 max-w-md mx-auto">
              Every item in your Anthiyur catalog currently has 5 or more units in stock. The email alert will trigger automatically as soon as an order drops any item below 5 units.
            </p>
            <div className="pt-2">
              <button
                onClick={onSimulateDrop}
                className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold transition-colors inline-flex items-center gap-2 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Simulate Stock Drop (Test Auto-Trigger)</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="border border-stone-200 dark:border-emerald-900 rounded-xl overflow-hidden shadow-2xs">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-stone-50 dark:bg-[#162518] text-stone-600 dark:text-stone-300 font-bold border-b border-stone-200 dark:border-emerald-900 text-[11px]">
                  <th className="py-3 px-4">Depleted SKU</th>
                  <th className="py-3 px-2 text-center">Category</th>
                  <th className="py-3 px-2 text-center">Current Stock</th>
                  <th className="py-3 px-2 text-center">Buffer Status</th>
                  <th className="py-3 px-2 text-right">Price</th>
                  <th className="py-3 px-4 text-center">Proactive Restock Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 dark:divide-emerald-900/60">
                {lowStockProducts.map((p) => {
                  const isDepleted = p.stock === 0;
                  const isWorking = restockingId === p.id;

                  return (
                    <tr
                      key={p.id}
                      className="hover:bg-emerald-50/40 dark:hover:bg-emerald-950/30 transition-colors"
                    >
                      <td className="py-3 px-4">
                        <div className="font-bold text-stone-900 dark:text-stone-100 text-sm">
                          {p.name}
                        </div>
                        <div className="text-[11px] text-stone-500 dark:text-stone-400">
                          Unit: {p.unit} • Ref ID: {p.id}
                        </div>
                      </td>

                      <td className="py-3 px-2 text-center">
                        <span className="px-2 py-0.5 rounded-md bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 text-[10px] font-medium">
                          {p.category}
                        </span>
                      </td>

                      <td className="py-3 px-2 text-center">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full font-black text-xs ${
                            isDepleted
                              ? 'bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-300 border border-red-300 dark:border-red-800'
                              : 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800'
                          }`}
                        >
                          <AlertTriangle className="w-3 h-3" />
                          <span>{p.stock} units left</span>
                        </span>
                      </td>

                      <td className="py-3 px-2 text-center">
                        <span className="text-[11px] text-red-600 font-bold">
                          Below Safe Threshold (&lt; 5)
                        </span>
                      </td>

                      <td className="py-3 px-2 text-right font-bold text-stone-800 dark:text-stone-200">
                        {formatCurrency(p.price)}
                      </td>

                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleRestock(p.id, 10)}
                            disabled={isWorking}
                            className="px-2.5 py-1 rounded-lg bg-stone-100 dark:bg-stone-800 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 text-stone-800 dark:text-stone-200 text-xs font-bold transition-all cursor-pointer"
                            title="Restock +10 units"
                          >
                            +10
                          </button>
                          <button
                            type="button"
                            onClick={() => handleRestock(p.id, 25)}
                            disabled={isWorking}
                            className="px-3 py-1 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold shadow-2xs transition-all cursor-pointer flex items-center gap-1"
                            title="Restock +25 units"
                          >
                            <Plus className="w-3 h-3" />
                            <span>{isWorking ? '...' : '+25'}</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleRestock(p.id, 50)}
                            disabled={isWorking}
                            className="px-2.5 py-1 rounded-lg bg-stone-100 dark:bg-stone-800 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 text-stone-800 dark:text-stone-200 text-xs font-bold transition-all cursor-pointer"
                            title="Restock +50 units"
                          >
                            +50
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Section 2: Visual Email Preview Card & Dispatch History */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Interactive Visual Email Preview Card */}
        <div className="lg:col-span-2 bg-white dark:bg-[#101912] rounded-2xl border border-emerald-100 dark:border-emerald-900/60 p-5 sm:p-6 shadow-2xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-stone-100 dark:border-emerald-900/60">
            <div>
              <h4 className="text-sm font-bold text-emerald-950 dark:text-emerald-100 flex items-center gap-2">
                <Mail className="w-4 h-4 text-emerald-600" />
                <span>Visual Low Stock Email Notification</span>
              </h4>
              <p className="text-xs text-stone-500 dark:text-emerald-400">
                Exact visual replica of the email sent to <strong className="font-semibold">{recipientEmail}</strong>
              </p>
            </div>

            <button
              onClick={() => onOpenEmailModal(selectedAlertForPreview || undefined)}
              className="px-3 py-1.5 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-900 dark:text-emerald-200 font-bold text-xs flex items-center gap-1 hover:bg-emerald-200 transition-colors cursor-pointer"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Full Screen</span>
            </button>
          </div>

          {/* Render Visual Email Mini Frame */}
          <div className="rounded-xl border border-stone-200 dark:border-emerald-800/80 overflow-hidden bg-stone-50 dark:bg-[#0b120c] p-4 text-xs space-y-3">
            <div className="bg-emerald-900 text-white p-4 rounded-xl flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-300">
                  AgriCare Automated Stock Monitor
                </span>
                <h5 className="text-base font-black mt-0.5">Low Stock Replenishment Notice</h5>
                <p className="text-[11px] text-emerald-200">
                  Trigger condition: Inventory &lt; 5 Units
                </p>
              </div>
              <span className="px-2.5 py-1 rounded-lg bg-red-600 text-white font-extrabold text-[10px] uppercase">
                URGENT
              </span>
            </div>

            <div className="p-3 bg-white dark:bg-[#142016] rounded-xl border border-stone-200 dark:border-emerald-900 space-y-2">
              <div className="flex items-center justify-between text-[11px] text-stone-500 dark:text-stone-400">
                <span>To: <strong className="text-stone-800 dark:text-stone-200">{recipientEmail}</strong></span>
                <span>{selectedAlertForPreview ? new Date(selectedAlertForPreview.timestamp).toLocaleString() : 'Just now'}</span>
              </div>
              <p className="text-xs font-semibold text-stone-800 dark:text-stone-200">
                Subject: {selectedAlertForPreview?.subject || `🚨 [URGENT] AgriCare Stock Alert: ${lowStockProducts.length} Products Dropped Below 5 Units`}
              </p>
              <div className="p-2.5 rounded-lg bg-red-50 dark:bg-red-950/40 text-red-900 dark:text-red-300 text-[11px]">
                🚨 Automatic trigger fired: <strong>{lowStockProducts.length} items</strong> dropped below 5 units. Recommended restocking order of +25 units per SKU is suggested.
              </div>

              {/* Sample list preview */}
              <div className="space-y-1.5 pt-1">
                {lowStockProducts.slice(0, 3).map((p) => (
                  <div
                    key={p.id}
                    className="flex items-center justify-between p-2 rounded-lg bg-stone-50 dark:bg-stone-900/60 border border-stone-100 dark:border-emerald-900/40 text-[11px]"
                  >
                    <div>
                      <span className="font-bold text-stone-900 dark:text-stone-100">{p.name}</span>
                      <span className="text-stone-500 ml-1.5">({p.unit})</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded-full bg-red-100 text-red-800 font-bold text-[10px]">
                        {p.stock} units left
                      </span>
                      <button
                        onClick={() => handleRestock(p.id, 25)}
                        className="px-2 py-0.5 rounded bg-emerald-600 text-white font-bold text-[10px]"
                      >
                        Restock +25
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right Col: Alert Settings & Simulation Lab */}
        <div className="bg-white dark:bg-[#101912] rounded-2xl border border-emerald-100 dark:border-emerald-900/60 p-5 sm:p-6 shadow-2xs space-y-4">
          <h4 className="text-sm font-bold text-emerald-950 dark:text-emerald-100 flex items-center gap-2">
            <Settings className="w-4 h-4 text-emerald-600" />
            <span>Email Alert Configuration</span>
          </h4>

          {/* Change Recipient */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-stone-700 dark:text-stone-300">
              Notification Recipient
            </label>
            {isEditingEmail ? (
              <div className="space-y-2">
                <input
                  type="email"
                  value={customEmail}
                  onChange={(e) => setCustomEmail(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-emerald-500 dark:bg-stone-900 text-stone-900 dark:text-white"
                />
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleSaveEmail}
                    className="px-3 py-1.5 rounded-lg bg-emerald-700 text-white font-bold text-xs"
                  >
                    Save Email
                  </button>
                  <button
                    onClick={() => setIsEditingEmail(false)}
                    className="px-3 py-1.5 text-xs text-stone-500"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-stone-50 dark:bg-stone-900/60 border border-stone-200 dark:border-emerald-900 text-xs">
                <span className="font-bold text-stone-800 dark:text-stone-200 truncate">
                  {recipientEmail}
                </span>
                <button
                  onClick={() => setIsEditingEmail(true)}
                  className="text-emerald-700 dark:text-emerald-400 font-bold hover:underline cursor-pointer ml-2 flex-shrink-0"
                >
                  Edit
                </button>
              </div>
            )}
          </div>

          {/* Trigger Threshold */}
          <div className="p-3 rounded-xl bg-stone-50 dark:bg-[#142016] border border-stone-200 dark:border-emerald-900 text-xs space-y-1">
            <div className="flex items-center justify-between font-bold text-stone-900 dark:text-stone-100">
              <span>Alert Threshold</span>
              <span className="text-red-600">&lt; 5 Units</span>
            </div>
            <p className="text-[11px] text-stone-500 dark:text-stone-400">
              Trigger fires automatically whenever any catalog item drops to 0, 1, 2, 3, or 4 units.
            </p>
          </div>

          {/* Testing Actions */}
          <div className="pt-2 space-y-2">
            <button
              onClick={() => onResendAlert(recipientEmail)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-stone-100 dark:bg-stone-800 hover:bg-emerald-50 dark:hover:bg-emerald-950 text-stone-800 dark:text-stone-200 hover:text-emerald-800 font-bold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <Send className="w-3.5 h-3.5 text-emerald-600" />
              <span>Send Test Email Alert</span>
            </button>

            <button
              onClick={onSimulateDrop}
              className="w-full px-3.5 py-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 hover:bg-amber-100 text-amber-800 dark:text-amber-300 font-bold text-xs border border-amber-200 dark:border-amber-900 flex items-center justify-center gap-2 transition-colors cursor-pointer"
              title="Drops an item to 2 units to see the automatic trigger fire live"
            >
              <RotateCcw className="w-3.5 h-3.5 text-amber-600" />
              <span>Simulate Stock Drop (Live Demo)</span>
            </button>
          </div>
        </div>
      </div>

      {/* Section 3: Dispatched Email Alerts Log */}
      <div className="bg-white dark:bg-[#101912] rounded-2xl border border-emerald-100 dark:border-emerald-900/60 p-5 sm:p-6 shadow-2xs space-y-3">
        <h4 className="text-sm font-bold text-emerald-950 dark:text-emerald-100 flex items-center gap-2">
          <Clock className="w-4 h-4 text-emerald-600" />
          <span>Automated Email Alert Dispatch Log</span>
        </h4>

        {alerts.length === 0 ? (
          <p className="text-xs text-stone-500">No alerts triggered yet.</p>
        ) : (
          <div className="border border-stone-200 dark:border-emerald-900 rounded-xl overflow-hidden text-xs">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-stone-50 dark:bg-[#162518] text-stone-600 dark:text-stone-300 font-bold border-b border-stone-200 dark:border-emerald-900 text-[11px]">
                  <th className="py-2.5 px-3">Timestamp</th>
                  <th className="py-2.5 px-3">Subject</th>
                  <th className="py-2.5 px-2 text-center">Items Alerted</th>
                  <th className="py-2.5 px-3">Recipient</th>
                  <th className="py-2.5 px-2 text-center">Delivery Status</th>
                  <th className="py-2.5 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 dark:divide-emerald-900/60">
                {alerts.map((a) => (
                  <tr key={a.id} className="hover:bg-emerald-50/30 dark:hover:bg-emerald-950/20">
                    <td className="py-2.5 px-3 text-stone-600 dark:text-stone-400 font-mono text-[11px]">
                      {new Date(a.timestamp).toLocaleString()}
                    </td>
                    <td className="py-2.5 px-3 font-semibold text-stone-900 dark:text-stone-100 truncate max-w-xs">
                      {a.subject}
                    </td>
                    <td className="py-2.5 px-2 text-center">
                      <span className="px-2 py-0.5 rounded-full bg-red-100 dark:bg-red-950 text-red-800 dark:text-red-300 font-bold text-[10px]">
                        {a.triggeredCount} SKUs
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-stone-700 dark:text-stone-300">
                      {a.recipientEmail}
                    </td>
                    <td className="py-2.5 px-2 text-center">
                      <span className="px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-bold text-[10px] inline-flex items-center gap-1">
                        <Check className="w-3 h-3" />
                        Delivered
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      <button
                        onClick={() => {
                          setSelectedAlertForPreview(a);
                          onOpenEmailModal(a);
                        }}
                        className="text-emerald-700 dark:text-emerald-400 font-bold hover:underline text-[11px] cursor-pointer"
                      >
                        View Email
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
