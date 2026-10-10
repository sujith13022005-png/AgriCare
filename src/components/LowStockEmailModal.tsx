import React, { useState } from 'react';
import {
  X,
  Mail,
  Send,
  AlertTriangle,
  CheckCircle2,
  Package,
  Plus,
  ArrowRight,
  Copy,
  Check,
  RotateCcw,
  Settings,
  Bell,
  ExternalLink,
  ShieldAlert,
  Sparkles,
  Zap,
} from 'lucide-react';
import { Product, LowStockEmailAlert, LowStockAlertItem } from '../types';
import { formatCurrency } from '../utils/formatters';
import { useLanguage } from '../context/LanguageContext';

interface LowStockEmailModalProps {
  isOpen: boolean;
  onClose: () => void;
  alert: LowStockEmailAlert | null;
  lowStockProducts: Product[];
  onRestockProduct: (productId: string, quantity: number) => Promise<void>;
  onBulkRestock: (quantity: number) => Promise<void>;
  onResendAlert: (recipientEmail?: string) => Promise<void>;
  onSimulateDrop: () => Promise<void>;
  recipientEmail: string;
  onUpdateRecipientEmail: (email: string) => Promise<void>;
}

export const LowStockEmailModal: React.FC<LowStockEmailModalProps> = ({
  isOpen,
  onClose,
  alert,
  lowStockProducts,
  onRestockProduct,
  onBulkRestock,
  onResendAlert,
  onSimulateDrop,
  recipientEmail,
  onUpdateRecipientEmail,
}) => {
  const { language } = useLanguage();
  const [copied, setCopied] = useState(false);
  const [isRestockingAll, setIsRestockingAll] = useState(false);
  const [restockingId, setRestockingId] = useState<string | null>(null);
  const [isEditingEmail, setIsEditingEmail] = useState(false);
  const [customEmail, setCustomEmail] = useState(recipientEmail);
  const [isSending, setIsSending] = useState(false);
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleCopyEmailText = () => {
    if (!alert) return;
    const textContent = `
[AgriCare Farm Supplies] - CRITICAL LOW STOCK EMAIL ALERT
Subject: ${alert.subject}
To: ${recipientEmail}
Timestamp: ${alert.timestamp}

The following products have dropped below 5 units and require proactive restocking:
${alert.products.map((p) => `- ${p.name}: ${p.stock} left (Buffer: < 5) | Reorder: +${p.recommendedRestock} units`).join('\n')}

Anthiyur Central Depot • Automated Stock Monitor
    `.trim();

    navigator.clipboard.writeText(textContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRestockSingle = async (productId: string, qty: number) => {
    setRestockingId(productId);
    await onRestockProduct(productId, qty);
    setRestockingId(null);
    setActionNotice(`Proactively restocked +${qty} units!`);
    setTimeout(() => setActionNotice(null), 3000);
  };

  const handleRestockAll = async (qty: number = 25) => {
    setIsRestockingAll(true);
    await onBulkRestock(qty);
    setIsRestockingAll(false);
    setActionNotice(`Proactively restocked ALL depleted products with +${qty} units each!`);
    setTimeout(() => setActionNotice(null), 3500);
  };

  const handleSaveEmail = async () => {
    if (customEmail.trim() && customEmail.includes('@')) {
      await onUpdateRecipientEmail(customEmail.trim());
      setIsEditingEmail(false);
      setActionNotice(`Alert recipient updated to: ${customEmail.trim()}`);
      setTimeout(() => setActionNotice(null), 3000);
    }
  };

  const handleTriggerResend = async () => {
    setIsSending(true);
    await onResendAlert(recipientEmail);
    setIsSending(false);
    setActionNotice(`Alert re-dispatched to ${recipientEmail}!`);
    setTimeout(() => setActionNotice(null), 3000);
  };

  const currentCount = lowStockProducts.length;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl bg-white dark:bg-[#0e1610] rounded-3xl shadow-2xl border border-emerald-200 dark:border-emerald-800/80 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Top Window Bar (Email Client Frame) */}
        <div className="bg-emerald-950 text-white px-5 py-3.5 flex items-center justify-between border-b border-emerald-800/60">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-red-600/90 flex items-center justify-center text-white shadow-sm">
              <Mail className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-red-400 flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
                  Visual Email Alert
                </span>
                <span className="text-[11px] px-2 py-0.2 rounded-full bg-emerald-900 border border-emerald-700 text-emerald-200">
                  Auto-Dispatched
                </span>
              </div>
              <p className="text-xs font-medium text-emerald-200/90 truncate max-w-md">
                {alert?.subject || 'Urgent Low Stock Restock Notice (< 5 Units)'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyEmailText}
              className="px-2.5 py-1.5 rounded-lg bg-emerald-900/80 hover:bg-emerald-800 border border-emerald-700 text-emerald-200 text-xs font-medium transition-colors flex items-center gap-1.5 cursor-pointer"
              title="Copy email text"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span className="hidden sm:inline">{copied ? 'Copied!' : 'Copy'}</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg bg-emerald-900/60 hover:bg-red-600 text-emerald-300 hover:text-white transition-colors cursor-pointer"
              title="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Temporary Notice Bar */}
        {actionNotice && (
          <div className="px-5 py-2.5 bg-emerald-100 dark:bg-emerald-950 text-emerald-900 dark:text-emerald-200 text-xs font-semibold flex items-center justify-between border-b border-emerald-200 dark:border-emerald-800">
            <span className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              {actionNotice}
            </span>
            <button onClick={() => setActionNotice(null)} className="text-emerald-700 hover:text-emerald-900">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Email Envelope Header Meta */}
        <div className="bg-stone-50 dark:bg-[#142016] px-5 sm:px-7 py-3.5 border-b border-stone-200 dark:border-emerald-900/60 text-xs space-y-2">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="text-stone-500 dark:text-stone-400 font-semibold w-14">From:</span>
              <span className="font-bold text-stone-900 dark:text-stone-100">
                AgriCare Inventory Bot &lt;alerts@agricarefarmsupplies.in&gt;
              </span>
            </div>
            <div className="text-stone-500 dark:text-stone-400 text-[11px]">
              {alert ? new Date(alert.timestamp).toLocaleString() : new Date().toLocaleString()}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="text-stone-500 dark:text-stone-400 font-semibold w-14">To:</span>
              {isEditingEmail ? (
                <div className="flex items-center gap-2">
                  <input
                    type="email"
                    value={customEmail}
                    onChange={(e) => setCustomEmail(e.target.value)}
                    className="px-2.5 py-1 text-xs rounded-lg border border-emerald-500 dark:bg-stone-900 text-stone-900 dark:text-white"
                  />
                  <button
                    onClick={handleSaveEmail}
                    className="px-2.5 py-1 rounded-lg bg-emerald-700 text-white font-bold text-xs"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => setIsEditingEmail(false)}
                    className="px-2 py-1 text-xs text-stone-500"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <span className="font-bold text-emerald-800 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-950 px-2 py-0.5 rounded-md">
                    {recipientEmail}
                  </span>
                  <button
                    onClick={() => setIsEditingEmail(true)}
                    className="text-[11px] text-stone-500 hover:text-emerald-700 dark:hover:text-emerald-400 underline cursor-pointer"
                  >
                    Change
                  </button>
                </div>
              )}
            </div>

            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-red-700 dark:text-red-400 bg-red-100 dark:bg-red-950/80 px-2.5 py-0.5 rounded-full border border-red-200 dark:border-red-900">
                <ShieldAlert className="w-3 h-3" />
                Urgency: High (Stock &lt; 5)
              </span>
            </div>
          </div>
        </div>

        {/* Scrollable Visual Email Body Container */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-7 bg-[#f8faf8] dark:bg-[#0b120c] space-y-6">
          {/* Email Preview Card */}
          <div className="max-w-3xl mx-auto bg-white dark:bg-[#121c14] rounded-2xl border border-emerald-200 dark:border-emerald-800/80 shadow-md overflow-hidden">
            {/* Top Email Letterhead */}
            <div className="bg-gradient-to-r from-emerald-900 via-emerald-800 to-teal-900 p-5 sm:p-6 text-white relative overflow-hidden">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 relative z-10">
                <div>
                  <span className="px-2.5 py-0.5 rounded-md bg-white/20 text-[10px] font-bold uppercase tracking-wider text-emerald-200">
                    Automated Stock Replenishment Notice
                  </span>
                  <h3 className="text-xl sm:text-2xl font-black font-['Outfit',sans-serif] mt-1">
                    AgriCare Farm Supplies
                  </h3>
                  <p className="text-xs text-emerald-200 mt-0.5">
                    Anthiyur Depot • Automated Inventory Monitoring System
                  </p>
                </div>

                <div className="sm:text-right">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-red-600 text-white font-black text-xs uppercase tracking-wide shadow-md">
                    <AlertTriangle className="w-3.5 h-3.5 animate-bounce" />
                    Critical Alert
                  </span>
                  <p className="text-[10px] text-emerald-300 mt-1">
                    Triggered at Stock &lt; 5 Units
                  </p>
                </div>
              </div>
            </div>

            {/* Email Message Content */}
            <div className="p-5 sm:p-6 space-y-5">
              {/* Alert Callout */}
              <div className="p-4 rounded-xl bg-red-50 dark:bg-red-950/40 border-l-4 border-red-600 text-xs sm:text-sm space-y-1">
                <h4 className="font-bold text-red-950 dark:text-red-200 flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-red-600" />
                  <span>
                    Action Required: {currentCount} Product{currentCount !== 1 ? 's' : ''} Dropped Below 5 Units
                  </span>
                </h4>
                <p className="text-red-900/90 dark:text-red-300/90 leading-relaxed font-normal">
                  Store inventory has dropped beneath your minimum safe threshold of <strong>5 units</strong>. 
                  Proactive restocking is required to prevent lost sales and maintain farm supplies for Anthiyur & Bhavani growers.
                </p>
              </div>

              {/* Proactive 1-Click Restock All Banner */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-500/15 via-teal-500/10 to-amber-500/10 border border-emerald-300 dark:border-emerald-700/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-0.5">
                  <p className="text-xs font-bold text-emerald-950 dark:text-emerald-100 flex items-center gap-1.5">
                    <Zap className="w-4 h-4 text-amber-500 fill-amber-500" />
                    <span>Proactive 1-Click Restock Solution</span>
                  </p>
                  <p className="text-[11px] text-emerald-800 dark:text-emerald-300 font-normal">
                    Replenish all {currentCount} depleted items to safe buffer (+25 units each) with a single click.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => handleRestockAll(25)}
                  disabled={isRestockingAll || currentCount === 0}
                  className="px-4 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                  <span>
                    {isRestockingAll ? 'Restocking All...' : 'Proactive Restock All (+25 Units)'}
                  </span>
                </button>
              </div>

              {/* Table of Low Stock Items with Proactive Restock Buttons */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-stone-700 dark:text-emerald-300 mb-2.5 flex items-center justify-between">
                  <span>Depleted Products Requiring Immediate Restock</span>
                  <span className="text-[11px] font-normal text-stone-500">
                    Threshold: &lt; 5 Units
                  </span>
                </h4>

                <div className="border border-stone-200 dark:border-emerald-900 rounded-xl overflow-hidden shadow-2xs">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-stone-50 dark:bg-[#162518] text-stone-600 dark:text-stone-300 font-bold border-b border-stone-200 dark:border-emerald-900 text-[11px]">
                        <th className="py-2.5 px-3 sm:px-4">Product</th>
                        <th className="py-2.5 px-2 text-center">Category</th>
                        <th className="py-2.5 px-2 text-center">Current Stock</th>
                        <th className="py-2.5 px-2 text-right">Price</th>
                        <th className="py-2.5 px-3 sm:px-4 text-center">Proactive Restock Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-100 dark:divide-emerald-900/60">
                      {lowStockProducts.map((p) => {
                        const isDepleted = p.stock === 0;
                        const isCriticallyLow = p.stock < 5;
                        const isWorking = restockingId === p.id;

                        return (
                          <tr
                            key={p.id}
                            className="hover:bg-emerald-50/40 dark:hover:bg-emerald-950/30 transition-colors"
                          >
                            <td className="py-3 px-3 sm:px-4">
                              <div className="font-bold text-stone-900 dark:text-stone-100 text-xs sm:text-sm">
                                {p.name}
                              </div>
                              <div className="text-[11px] text-stone-500 dark:text-stone-400">
                                Pack: {p.unit}
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

                            <td className="py-3 px-2 text-right font-bold text-stone-800 dark:text-stone-200">
                              {formatCurrency(p.price)}
                            </td>

                            <td className="py-3 px-3 sm:px-4 text-center">
                              <div className="flex items-center justify-center gap-1.5">
                                <button
                                  type="button"
                                  onClick={() => handleRestockSingle(p.id, 10)}
                                  disabled={isWorking}
                                  className="px-2 py-1 rounded-lg bg-stone-100 dark:bg-stone-800 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 text-stone-700 dark:text-stone-200 hover:text-emerald-800 text-[11px] font-bold transition-all cursor-pointer"
                                  title="Restock +10 units"
                                >
                                  +10
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleRestockSingle(p.id, 25)}
                                  disabled={isWorking}
                                  className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold shadow-2xs transition-all cursor-pointer"
                                  title="Restock +25 units"
                                >
                                  {isWorking ? '...' : '+25'}
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleRestockSingle(p.id, 50)}
                                  disabled={isWorking}
                                  className="px-2 py-1 rounded-lg bg-stone-100 dark:bg-stone-800 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 text-stone-700 dark:text-stone-200 hover:text-emerald-800 text-[11px] font-bold transition-all cursor-pointer"
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
              </div>

              {/* Anthiyur Field Restock Guidance */}
              <div className="p-4 rounded-xl bg-emerald-50 dark:bg-[#152317] border border-emerald-200 dark:border-emerald-800/80 text-xs text-emerald-950 dark:text-emerald-200 space-y-1">
                <p className="font-bold flex items-center gap-1.5 text-emerald-900 dark:text-emerald-100">
                  <Package className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
                  <span>Anthiyur Depot Logistics & Supply Route</span>
                </p>
                <p className="text-emerald-800 dark:text-emerald-300 font-normal leading-relaxed text-[11px]">
                  Restocking requests are automatically queued for the Gobichettipalayam & Bhavani seed distribution corridor. Daily delivery dispatch departs Anthiyur Central Hub at 06:00 AM.
                </p>
              </div>
            </div>

            {/* Email Footer Notes */}
            <div className="bg-stone-50 dark:bg-[#142016] p-4 text-center border-t border-stone-200 dark:border-emerald-900 text-[11px] text-stone-500 dark:text-stone-400">
              <p>AgriCare Farm Supplies • Automated Inventory Notification Engine</p>
              <p className="mt-0.5">
                Delivered automatically to <strong>{recipientEmail}</strong> upon stock dropping below 5 units.
              </p>
            </div>
          </div>
        </div>

        {/* Modal Bottom Controls */}
        <div className="p-4 bg-white dark:bg-[#0e1610] border-t border-emerald-100 dark:border-emerald-900/80 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <button
              onClick={handleTriggerResend}
              disabled={isSending}
              className="px-3.5 py-2 rounded-xl bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-800 dark:text-stone-200 font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Send className="w-3.5 h-3.5 text-emerald-600" />
              <span>{isSending ? 'Sending...' : 'Resend Email Alert'}</span>
            </button>

            <button
              onClick={onSimulateDrop}
              className="px-3.5 py-2 rounded-xl bg-amber-50 dark:bg-amber-950/40 hover:bg-amber-100 text-amber-800 dark:text-amber-300 font-semibold border border-amber-200 dark:border-amber-800/80 flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Simulate stock drop to 2 units to test auto-trigger"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Simulate Stock Drop (Test Trigger)</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => handleRestockAll(25)}
              disabled={isRestockingAll || currentCount === 0}
              className="px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>Restock All ({currentCount})</span>
            </button>

            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-stone-200 dark:bg-stone-800 hover:bg-stone-300 text-stone-800 dark:text-stone-200 font-bold transition-colors cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
