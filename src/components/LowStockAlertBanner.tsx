import React from 'react';
import {
  AlertTriangle,
  Mail,
  Zap,
  Sparkles,
  ArrowRight,
  ShieldAlert,
} from 'lucide-react';
import { Product } from '../types';

interface LowStockAlertBannerProps {
  lowStockCount: number;
  recipientEmail: string;
  onOpenEmailModal: () => void;
  onBulkRestock: (quantity: number) => Promise<void>;
  isRestocking?: boolean;
}

export const LowStockAlertBanner: React.FC<LowStockAlertBannerProps> = ({
  lowStockCount,
  recipientEmail,
  onOpenEmailModal,
  onBulkRestock,
  isRestocking = false,
}) => {
  if (lowStockCount === 0) return null;

  return (
    <div className="relative overflow-hidden rounded-2xl border border-red-300 dark:border-red-900/80 bg-gradient-to-r from-red-50 via-amber-50/50 to-orange-50/40 dark:from-red-950/50 dark:via-amber-950/30 dark:to-[#1a1412] p-4 sm:p-5 shadow-xs animate-in fade-in slide-in-from-top-2 duration-300">
      {/* Decorative Glow */}
      <div className="absolute -right-10 -top-10 w-40 h-40 bg-red-400/10 rounded-full blur-2xl pointer-events-none" />

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
        <div className="flex items-start gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-red-600 text-white flex items-center justify-center shadow-sm flex-shrink-0 mt-0.5">
            <ShieldAlert className="w-5 h-5 animate-bounce" />
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2 py-0.5 rounded-full bg-red-600 text-white font-extrabold text-[10px] uppercase tracking-wider">
                Automated Trigger
              </span>
              <span className="text-xs font-bold text-red-950 dark:text-red-200">
                Critical Low Stock Alert (&lt; 5 Units)
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
              <span className="text-[11px] text-red-800 dark:text-red-300 font-medium">
                Sent to: <strong className="font-bold underline">{recipientEmail}</strong>
              </span>
            </div>

            <p className="text-xs text-red-900/90 dark:text-red-200/90 max-w-2xl leading-relaxed">
              <strong>{lowStockCount} product{lowStockCount !== 1 ? 's have' : ' has'} dropped below 5 units</strong>. 
              An automated notification email was triggered to notify store managers for proactive replenishment before farm stockouts occur.
            </p>
          </div>
        </div>

        {/* Quick Action Buttons */}
        <div className="flex items-center gap-2.5 flex-wrap sm:flex-nowrap flex-shrink-0">
          <button
            type="button"
            onClick={onOpenEmailModal}
            className="px-3.5 py-2 rounded-xl bg-white dark:bg-[#1f2c20] hover:bg-stone-100 dark:hover:bg-[#283b2a] text-red-950 dark:text-red-100 border border-red-200 dark:border-red-900 text-xs font-bold shadow-2xs transition-all flex items-center gap-2 cursor-pointer hover:scale-102 active:scale-98"
          >
            <Mail className="w-3.5 h-3.5 text-red-600" />
            <span>View Visual Email Alert</span>
          </button>

          <button
            type="button"
            onClick={() => onBulkRestock(25)}
            disabled={isRestocking}
            className="px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 active:bg-emerald-900 text-white text-xs font-bold shadow-md transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50 hover:scale-102 active:scale-98"
          >
            <Zap className="w-3.5 h-3.5 text-amber-300 fill-amber-300" />
            <span>{isRestocking ? 'Restocking All...' : 'Proactive Restock All (+25 Units)'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
