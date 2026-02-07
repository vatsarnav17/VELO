
import React from 'react';
import { X, Pencil, CreditCard } from 'lucide-react';
import { Envelope } from '../types';
import { getIcon } from '../constants';

interface EnvelopeDetailModalProps {
    envelope: Envelope;
    onClose: () => void;
    onEdit: (e: Envelope) => void;
    onPay: (e: Envelope) => void;
}

const EnvelopeDetailModal: React.FC<EnvelopeDetailModalProps> = ({ envelope, onClose, onEdit, onPay }) => {
    const percentage = Math.min((envelope.balance / envelope.limit) * 100, 100);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/95 backdrop-blur-xl animate-in fade-in duration-300">
            <div className="w-full max-w-sm bg-zinc-950 border border-zinc-800 p-8 shadow-[0_0_50px_rgba(0,0,0,0.5)] relative max-h-[90dvh] overflow-y-auto no-scrollbar">
                <div className="flex justify-between items-start mb-8">
                    <div className="flex items-center gap-4">
                        <div className="p-3 border border-zinc-800 bg-black/40 text-zinc-400" style={{ borderColor: `${envelope.color}44` }}>
                            {getIcon(envelope.icon, 'w-6 h-6')}
                        </div>
                        <div>
                            <h2 className="text-xl font-light tracking-widest text-white uppercase">{envelope.name}</h2>
                            <p className="text-[8px] text-zinc-500 font-bold tracking-[0.4em] mt-1 uppercase">Vault Details</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 border border-zinc-800 text-zinc-500 hover:text-white transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="space-y-10">
                    <div className="space-y-2">
                        <div className="flex justify-between items-baseline mb-4">
                            <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-[0.2em]">Current Balance</p>
                            <p className="text-3xl font-light text-white tracking-tighter">₹{Math.floor(envelope.balance).toLocaleString()}</p>
                        </div>

                        <div className="h-1.5 w-full bg-zinc-900 border border-zinc-800 overflow-hidden relative">
                            <div
                                className="absolute top-0 left-0 h-full transition-all duration-1000 ease-out"
                                style={{
                                    width: `${percentage}%`,
                                    backgroundColor: envelope.color,
                                    boxShadow: `0 0 15px ${envelope.color}66`
                                }}
                            />
                        </div>

                        <div className="flex justify-between text-[10px] text-zinc-600 font-bold uppercase tracking-[0.15em] pt-2">
                            <span className={percentage < 15 ? 'text-red-500 animate-pulse' : ''}>{percentage.toFixed(2)}% Available</span>
                            <span>Limit ₹{envelope.limit.toLocaleString()}</span>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 pt-4">
                        <button
                            onClick={() => onPay(envelope)}
                            className="py-3.5 bg-blue-600 text-white font-bold uppercase tracking-[0.2em] text-[9px] flex items-center justify-center gap-2 border border-blue-400/50 hover:bg-blue-500 active:scale-95 transition-all shadow-[0_5px_15px_rgba(37,99,235,0.2)]"
                        >
                            <CreditCard className="w-3.5 h-3.5" />
                            <span className="truncate">Make Payment</span>
                        </button>
                        <button
                            onClick={() => onEdit(envelope)}
                            className="py-3.5 bg-zinc-900 border border-zinc-800 text-zinc-400 font-bold uppercase tracking-[0.2em] text-[9px] flex items-center justify-center gap-2 hover:text-white hover:border-zinc-700 active:scale-95 transition-all"
                        >
                            <Pencil className="w-3.5 h-3.5" />
                            <span className="truncate">Edit Vault</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EnvelopeDetailModal;
