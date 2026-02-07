
import React from 'react';
import { Settings2 } from 'lucide-react';
import { Envelope } from '../types';
import { getIcon } from '../constants';

interface EnvelopeCardProps {
  envelope: Envelope;
  onClick: (e: Envelope) => void;
  selected?: boolean;
}

const EnvelopeCard: React.FC<EnvelopeCardProps> = ({ envelope, onClick, selected }) => {
  return (
    <div
      onClick={() => onClick(envelope)}
      className={`relative p-3 px-4 transition-all duration-300 cursor-pointer overflow-hidden border group flex items-center gap-3 ${selected
        ? 'border-blue-500 bg-blue-500/5'
        : 'border-zinc-800 bg-zinc-900/40 hover:border-zinc-700 hover:bg-zinc-900/60'
        }`}
    >
      {/* Accent strip */}
      <div
        className="absolute top-0 left-0 w-0.5 h-full"
        style={{ backgroundColor: envelope.color }}
      ></div>

      <div className="p-1.5 border border-zinc-800 bg-black/40 text-zinc-400 shrink-0">
        {getIcon(envelope.icon, 'w-3.5 h-3.5')}
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-[8px] font-bold text-zinc-500 uppercase tracking-[0.2em] truncate mb-0.5">{envelope.name}</p>
        <div className="flex items-baseline gap-1">
          <span className="text-zinc-500 text-[8px] font-light">₹</span>
          <p className="text-sm font-medium text-white tracking-tight truncate">{Math.floor(envelope.balance).toLocaleString()}</p>
        </div>
      </div>
    </div>
  );
};

export default EnvelopeCard;
