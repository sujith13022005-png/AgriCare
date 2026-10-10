import React, { useEffect } from 'react';
import { Printer, X, CheckCircle2, Truck, Package, ShieldCheck } from 'lucide-react';
import { Order } from '../types';
import { formatCurrency, formatDate } from '../utils/formatters';

interface PrintOrderModalProps {
  order: Order | null;
  isOpen: boolean;
  onClose: () => void;
  autoPrint?: boolean;
}

export const PrintOrderModal: React.FC<PrintOrderModalProps> = ({
  order,
  isOpen,
  onClose,
  autoPrint = true,
}) => {
  useEffect(() => {
    if (isOpen && order && autoPrint) {
      // Small timeout allows DOM to fully mount the print container before opening dialog
      const timer = setTimeout(() => {
        window.print();
      }, 250);
      return () => clearTimeout(timer);
    }
  }, [isOpen, order, autoPrint]);

  if (!isOpen || !order) return null;

  const totalItemsCount = order.items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto print-modal-backdrop bg-black/60 dark:bg-black/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 transition-all">
      {/* Container - on screen it is an elegant preview dialog; in print it cleanly prints */}
      <div className="relative w-full max-w-3xl bg-white dark:bg-[#121c13] text-stone-900 dark:text-stone-100 rounded-2xl shadow-2xl border border-stone-200 dark:border-emerald-900/60 overflow-hidden flex flex-col my-auto max-h-[92vh]">
        
        {/* On-screen control bar (Hidden during print) */}
        <div className="no-print p-4 bg-emerald-900 text-white flex items-center justify-between gap-3 border-b border-emerald-800 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-800 flex items-center justify-center text-emerald-200">
              <Printer className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold flex items-center gap-2">
                <span>Print Order Manifest & Invoice</span>
                <span className="font-mono text-xs px-2 py-0.5 rounded bg-emerald-800/80 text-emerald-200 border border-emerald-700">
                  {order.id}
                </span>
              </h2>
              <p className="text-xs text-emerald-200/80">
                Customer: <strong className="text-white">{order.customerName}</strong> ({order.phone})
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => window.print()}
              className="px-3.5 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-emerald-950 font-bold text-xs flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer"
              title="Open browser print dialog to print or save as PDF"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / Save PDF</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-emerald-200 hover:text-white hover:bg-emerald-800 transition-colors cursor-pointer"
              title="Close preview"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* PRINTABLE RECEIPT CONTENT */}
        <div className="overflow-y-auto p-6 sm:p-8 bg-white text-stone-900 print:p-0 print:m-0" id="printable-order-receipt">
          
          {/* Header & Company Brand */}
          <div className="border-b-2 border-stone-800 pb-5 mb-5">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-7 h-7 rounded-lg bg-emerald-800 text-white flex items-center justify-center font-black text-sm">
                    🌾
                  </div>
                  <h1 className="text-xl font-black tracking-tight text-emerald-950 font-['Outfit',sans-serif]">
                    AgriCare Farm Supplies
                  </h1>
                </div>
                <p className="text-xs font-semibold text-emerald-800">
                  அக்ரிகேர் உழவர் சேவை & இடுபொருட்கள் மையம்
                </p>
                <p className="text-[11px] text-stone-600 mt-1 leading-relaxed">
                  Bhavani Main Road, Anthiyur Taluk, Erode District, Tamil Nadu - 638501<br />
                  Direct Helpline: +91 94432 10190 / +91 98427 45210 | Support: orders@agricare-anthiyur.com<br />
                  Govt Regd Agro License: <strong>TNAU/AGR/ERD/2024-8841</strong>
                </p>
              </div>

              {/* Invoice Meta Box */}
              <div className="text-right sm:min-w-[200px] border border-stone-300 rounded-lg p-3 bg-stone-50/80">
                <div className="text-[10px] font-bold uppercase tracking-wider text-stone-500">
                  Invoice & Dispatch Slip
                </div>
                <div className="text-base font-extrabold text-stone-900 font-mono">
                  {order.id}
                </div>
                <div className="text-xs text-stone-600 mt-1">
                  Date: <span className="font-semibold text-stone-800">{formatDate(order.createdAt)}</span>
                </div>
                <div className="text-xs text-stone-600 mt-0.5 flex items-center justify-end gap-1.5">
                  Status:
                  <span className="font-bold text-[11px] px-2 py-0.5 rounded bg-emerald-100 text-emerald-900 border border-emerald-200">
                    {order.status}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Customer & Shipping Summary Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6 text-xs">
            {/* Customer Details */}
            <div className="p-3.5 rounded-lg border border-stone-300 bg-stone-50/50">
              <h3 className="font-bold text-stone-900 text-xs uppercase tracking-wider border-b border-stone-200 pb-1.5 mb-2 flex items-center gap-1.5">
                <Package className="w-3.5 h-3.5 text-emerald-800" />
                <span>Customer & Farmer Details</span>
              </h3>
              <div className="space-y-1 text-stone-700">
                <p>
                  <strong className="text-stone-900">Farmer Name:</strong> {order.customerName}
                </p>
                <p>
                  <strong className="text-stone-900">Mobile Phone:</strong> {order.phone}
                </p>
                <p>
                  <strong className="text-stone-900">Village / Town:</strong> {order.villageCity}
                </p>
                <p>
                  <strong className="text-stone-900">Postal Pincode:</strong> {order.pincode}
                </p>
              </div>
            </div>

            {/* Shipping & Payment Destination */}
            <div className="p-3.5 rounded-lg border border-stone-300 bg-stone-50/50">
              <h3 className="font-bold text-stone-900 text-xs uppercase tracking-wider border-b border-stone-200 pb-1.5 mb-2 flex items-center gap-1.5">
                <Truck className="w-3.5 h-3.5 text-emerald-800" />
                <span>Dispatch & Shipping Info</span>
              </h3>
              <div className="space-y-1 text-stone-700">
                <p>
                  <strong className="text-stone-900">Delivery Address:</strong> {order.address}
                </p>
                <p>
                  <strong className="text-stone-900">Payment Mode:</strong>{' '}
                  <span className="font-semibold text-emerald-900">{order.paymentMethod}</span>
                  {order.upiId && <span className="text-stone-600 font-mono"> ({order.upiId})</span>}
                </p>
                {order.notes ? (
                  <p className="pt-1 text-[11px] text-amber-900 italic">
                    <strong className="not-italic text-stone-900">Farmer Notes:</strong> "{order.notes}"
                  </p>
                ) : (
                  <p className="pt-1 text-[11px] text-stone-500">
                    <strong className="text-stone-900">Delivery Type:</strong> Direct farm-gate dispatch
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Itemized Order Table */}
          <div className="mb-6">
            <h3 className="font-bold text-stone-900 text-xs uppercase tracking-wider mb-2 flex items-center justify-between">
              <span>Itemized Product Breakdown</span>
              <span className="text-[11px] font-medium text-stone-500 lowercase">
                ({totalItemsCount} total units)
              </span>
            </h3>

            <table className="w-full border-collapse text-xs">
              <thead>
                <tr className="bg-stone-100 border-t-2 border-b-2 border-stone-800 text-stone-900">
                  <th className="py-2 px-2 text-left font-bold w-8">#</th>
                  <th className="py-2 px-3 text-left font-bold">Product Name & Specifications</th>
                  <th className="py-2 px-3 text-left font-bold w-24">Pack Unit</th>
                  <th className="py-2 px-3 text-right font-bold w-20">Unit Price</th>
                  <th className="py-2 px-3 text-center font-bold w-16">Qty</th>
                  <th className="py-2 px-3 text-right font-bold w-24">Total Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-200">
                {order.items.map((item, index) => {
                  const itemTotal = item.price * item.quantity;
                  return (
                    <tr key={index} className="hover:bg-stone-50">
                      <td className="py-2.5 px-2 text-stone-500 font-mono text-center">
                        {index + 1}
                      </td>
                      <td className="py-2.5 px-3 font-semibold text-stone-900">
                        {item.name}
                      </td>
                      <td className="py-2.5 px-3 text-stone-600">
                        {item.unit || 'Standard'}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono text-stone-700">
                        {formatCurrency(item.price)}
                      </td>
                      <td className="py-2.5 px-3 text-center font-bold text-stone-900">
                        {item.quantity}
                      </td>
                      <td className="py-2.5 px-3 text-right font-bold text-stone-900 font-mono">
                        {formatCurrency(itemTotal)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Financial Calculation Summary */}
          <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-6 border-t border-stone-200 pt-4">
            <div className="text-[11px] text-stone-600 max-w-sm space-y-1">
              <p className="font-semibold text-stone-800">
                Payment Status: {order.paymentMethod === 'Cash on Delivery' ? 'To be collected upon farm delivery' : 'Verified & Paid online'}
              </p>
              <p>
                All rates inclusive of applicable state GST & agricultural exemptions.
              </p>
            </div>

            <div className="w-full sm:w-64 space-y-1.5 text-xs bg-stone-50 p-3 rounded-lg border border-stone-200">
              <div className="flex justify-between text-stone-700">
                <span>Subtotal ({totalItemsCount} items):</span>
                <span className="font-mono">{formatCurrency(order.subtotal)}</span>
              </div>

              <div className="flex justify-between text-stone-700">
                <span>Delivery & Handling:</span>
                <span className="font-semibold text-emerald-800">
                  {order.deliveryFee === 0 ? 'FREE (இலவசம்)' : formatCurrency(order.deliveryFee)}
                </span>
              </div>

              {order.discount > 0 && (
                <div className="flex justify-between text-emerald-800 font-medium">
                  <span>Farmer Subsidy Discount:</span>
                  <span className="font-mono">-{formatCurrency(order.discount)}</span>
                </div>
              )}

              <div className="border-t-2 border-stone-800 pt-2 flex justify-between items-center text-sm font-black text-stone-950 font-['Outfit',sans-serif]">
                <span>Grand Total:</span>
                <span className="text-base text-emerald-900">{formatCurrency(order.total)}</span>
              </div>
            </div>
          </div>

          {/* Verification Signatures & Stamp Block */}
          <div className="grid grid-cols-3 gap-4 pt-6 border-t border-stone-300 text-center text-[10px] text-stone-600 mb-6">
            <div className="space-y-6">
              <div className="h-9 border-b border-dashed border-stone-400"></div>
              <p className="font-semibold text-stone-800">Prepared & Checked By</p>
              <p>(Anthiyur Warehouse Depot)</p>
            </div>
            <div className="space-y-6">
              <div className="h-9 border-b border-dashed border-stone-400"></div>
              <p className="font-semibold text-stone-800">Dispatch Logistics Agent</p>
              <p>(Vehicle / Delivery Staff)</p>
            </div>
            <div className="space-y-6">
              <div className="h-9 border-b border-dashed border-stone-400"></div>
              <p className="font-semibold text-stone-800">Farmer / Customer Receiver</p>
              <p>(Signature & Date)</p>
            </div>
          </div>

          {/* Quality Assurance & Advisory Notice */}
          <div className="p-3 bg-stone-100 rounded-lg border border-stone-200 text-[10px] text-stone-600 flex items-start gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-800 shrink-0 mt-0.5" />
            <div className="leading-normal">
              <strong>Quality Guarantee:</strong> Certified agricultural seeds and input materials are inspected for high germination and efficacy. Please verify sealed packages upon delivery. For crop application advice, reach Anthiyur Agri Advisory at <strong>+91 94432 10190</strong>.
              <p className="mt-0.5 font-semibold text-emerald-900">
                நன்றி! உழவே தலைசிறந்தது! / Thank you for partnering with AgriCare Anthiyur.
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
