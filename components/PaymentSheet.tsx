
import React, { useState } from 'react';
import { X, ChevronRight } from 'lucide-react';
import { Envelope } from '../types';

interface PaymentSheetProps {
  envelope: Envelope;
  onClose: () => void;
  onPay: (amount: number, note: string) => void;
}

const PaymentSheet: React.FC<PaymentSheetProps> = ({ envelope, onClose, onPay }) => {
  const [amount, setAmount] = useState<string>('');
  const [note, setNote] = useState<string>('');

  const handlePay = () => {
    if (!amount || !note) return;
    onPay(parseFloat(amount), note);
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end bg-black/90 backdrop-blur-xl animate-in fade-in duration-300">
      <div className="w-full bg-zinc-950 border-t border-zinc-800 p-8 pb-16 shadow-[0_-20px_50px_rgba(0,0,0,0.5)] animate-in slide-in-from-bottom duration-500 max-w-md mx-auto relative max-h-[90dvh] overflow-y-auto no-scrollbar">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-12 h-1 bg-zinc-800 mt-3"></div>

        <div className="flex justify-between items-start mb-12 mt-4">
          <div>
            <h2 className="text-xl font-light tracking-[0.2em] text-white uppercase">Initiate Payment</h2>
            <p className="text-[9px] text-zinc-500 font-bold uppercase tracking-[0.3em] mt-2">
              From: <span className="text-zinc-300">{envelope.name}</span> | Balance: <span className="text-zinc-300">₹{envelope.balance}</span>
            </p>
          </div>
          <button onClick={onClose} className="p-2 border border-zinc-800 text-zinc-500 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-10">
          <div className="relative group">
            <span className="absolute left-6 top-1/2 -translate-y-1/2 text-2xl font-light text-zinc-600 group-focus-within:text-blue-500 transition-colors">₹</span>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              className="w-full bg-zinc-900/50 border border-zinc-800 py-6 pl-14 pr-6 text-4xl font-light text-white placeholder:text-zinc-800 focus:border-blue-600 outline-none transition-all tracking-tighter"
            />
          </div>

          <div className="space-y-3">
            <label className="text-[9px] font-bold text-zinc-500 uppercase tracking-[0.3em] ml-1">Payment Note (Required)</label>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="e.g. Grocery Store, Rent, etc."
              className="w-full bg-zinc-900/50 border border-zinc-800 p-5 text-white placeholder:text-zinc-700 focus:border-blue-500 outline-none transition-all tracking-wider"
            />
          </div>

          <button
            onClick={handlePay}
            disabled={!amount || !note}
            className={`w-full py-6 flex items-center justify-center gap-3 font-bold uppercase tracking-[0.5em] transition-all border ${amount && note
              ? 'bg-white text-black border-white shadow-[0_0_30px_rgba(255,255,255,0.1)] active:scale-[0.98]'
              : 'bg-zinc-900 border-zinc-800 text-zinc-700'
              }`}
          >
            <span>CONFIRM PAYMENT</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentSheet;
