
import React, { useState } from 'react';
import { X, Save, Trash2, ChevronDown } from 'lucide-react';
import { Envelope } from '../types';
import { CATEGORY_ICONS } from '../constants';

interface EnvelopeEditModalProps {
  envelope?: Envelope | null;
  onClose: () => void;
  onSave: (envelope: Partial<Envelope>) => void;
  onDelete?: (id: string) => void;
  maxAllowed: number;
}

const PRESET_COLORS = [
  '#3b82f6', // blue
  '#8b5cf6', // violet
  '#ec4899', // pink
  '#f59e0b', // amber
  '#10b981', // emerald
  '#ef4444', // red
  '#ffffff', // white
];

const EnvelopeEditModal: React.FC<EnvelopeEditModalProps> = ({ envelope, onClose, onSave, onDelete, maxAllowed }) => {
  const [name, setName] = useState(envelope?.name || '');
  const [totalBalance, setTotalBalance] = useState(envelope?.limit.toString() || '');
  const [selectedColor, setSelectedColor] = useState(envelope?.color || PRESET_COLORS[0]);
  const [category, setCategory] = useState(() => {
    if (!envelope) return 'Misc';
    const match = Object.keys(CATEGORY_ICONS).find(k => k.toUpperCase() === envelope.name.toUpperCase());
    return match || 'Misc';
  });

  const handleCategorySelect = (cat: string) => {
    setCategory(cat);
    const upperIcons = Object.keys(CATEGORY_ICONS).map(k => k.toUpperCase());
    if (!name || upperIcons.includes(name.toUpperCase())) {
      setName(cat.toUpperCase());
    }
  };

  const handleSave = () => {
    const amount = parseFloat(totalBalance);
    if (!name || isNaN(amount) || amount > maxAllowed) return;

    onSave({
      id: envelope?.id,
      name,
      balance: envelope ? envelope.balance : parseFloat(totalBalance),
      limit: parseFloat(totalBalance),
      color: selectedColor,
      icon: CATEGORY_ICONS[category] || 'Wallet'
    });
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/95 backdrop-blur-xl animate-in fade-in duration-200">
      <div className="w-full max-w-sm bg-zinc-950 border border-zinc-800 p-6 shadow-[0_0_50px_rgba(0,0,0,0.5)] max-h-[90dvh] overflow-y-auto no-scrollbar">
        <div className="flex justify-between items-center mb-6 border-b border-zinc-900 pb-4">
          <div className="flex flex-col">
            <h2 className="text-lg font-light tracking-widest text-white uppercase">{envelope ? 'Edit Vault' : 'New Vault'}</h2>
            <p className="text-[7px] text-zinc-600 font-bold tracking-[0.4em] mt-1 uppercase">Parameters</p>
          </div>
          <button onClick={onClose} className="p-1.5 border border-zinc-800 text-zinc-500 hover:text-white transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-5">
          {/* Category Dropdown */}
          <div className="space-y-2">
            <label className="text-[7px] font-bold text-zinc-500 uppercase tracking-[0.3em] ml-1">Type_Selection</label>
            <div className="grid grid-cols-3 gap-2">
              {Object.keys(CATEGORY_ICONS).map((cat) => (
                <button
                  key={cat}
                  onClick={() => handleCategorySelect(cat)}
                  className={`py-2 px-1 text-[8px] font-bold border transition-all uppercase tracking-widest ${category === cat
                    ? 'bg-zinc-100 text-black border-white'
                    : 'bg-zinc-900/50 border-zinc-800 text-zinc-500 hover:border-zinc-600'
                    }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Name Input */}
          <div className="space-y-2">
            <label className="text-[7px] font-bold text-zinc-500 uppercase tracking-[0.3em] ml-1">IDENTIFIER</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="E.G. HOUSING_01"
              className="w-full bg-zinc-900/50 border border-zinc-800 p-3 text-sm text-white placeholder:text-zinc-700 outline-none focus:border-blue-500 transition-colors uppercase tracking-wider"
            />
          </div>

          {/* Balance (Limit) Input */}
          <div className="space-y-2">
            <div className="flex justify-between items-center ml-1">
              <label className="text-[7px] font-bold text-zinc-500 uppercase tracking-[0.3em]">ALLOCATION</label>
              <span className="text-[7px] font-bold text-zinc-600">LIMIT: ₹{maxAllowed.toLocaleString()}</span>
            </div>
            <input
              type="number"
              value={totalBalance}
              onChange={(e) => setTotalBalance(e.target.value)}
              placeholder="0.00"
              className={`w-full bg-zinc-900/50 border p-3 text-sm text-white placeholder:text-zinc-700 outline-none transition-colors tracking-widest ${parseFloat(totalBalance) > maxAllowed ? 'border-red-500/50 text-red-400' : 'border-zinc-800 focus:border-blue-500'
                }`}
            />
            {parseFloat(totalBalance) > maxAllowed && (
              <p className="text-[7px] text-red-500 font-bold mt-1 ml-1 tracking-[0.2em] uppercase">Exceeds available liquidity!</p>
            )}
          </div>

          {/* Color Selector */}
          <div className="space-y-2">
            <label className="text-[7px] font-bold text-zinc-500 uppercase tracking-[0.3em] ml-1">THEME INDEX</label>
            <div className="grid grid-cols-7 gap-2">
              {PRESET_COLORS.map((color) => (
                <button
                  key={color}
                  onClick={() => setSelectedColor(color)}
                  className={`aspect-square border transition-all ${selectedColor === color ? 'border-white scale-110 shadow-[0_0_15px_rgba(255,255,255,0.2)]' : 'border-zinc-800 opacity-40 hover:opacity-100'
                    }`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="pt-4 flex flex-col gap-3">
            <button
              onClick={handleSave}
              disabled={!name || !totalBalance || parseFloat(totalBalance) > maxAllowed}
              className={`w-full py-3 text-[10px] font-bold uppercase tracking-[0.4em] flex items-center justify-center gap-2 transition-all border ${name && totalBalance && parseFloat(totalBalance) <= maxAllowed
                ? 'bg-blue-600 border-blue-400/50 text-white shadow-[0_0_20px_rgba(37,99,235,0.2)] active:scale-95'
                : 'bg-zinc-900 border-zinc-800 text-zinc-600'
                }`}
            >
              {envelope ? 'CONFIRM CHANGES' : 'CREATE VAULT'}
            </button>

            {envelope && onDelete && (
              <button
                onClick={() => onDelete(envelope.id)}
                className="w-full py-3 text-[9px] text-red-500 font-bold uppercase tracking-[0.4em] flex items-center justify-center gap-2 border border-red-500/20 hover:bg-red-500/5 active:scale-95 transition-all"
              >
                PURGE DATA
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnvelopeEditModal;
