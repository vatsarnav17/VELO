
import React, { useState } from 'react';
import { X, ArrowRightLeft, CreditCard } from 'lucide-react';
import { Envelope } from '../types';
import { getIcon } from '../constants';

interface TransferModalProps {
    sourceEnvelope: Envelope;
    envelopes: Envelope[];
    onClose: () => void;
    onTransfer: (destId: string, amount: number, note: string) => void;
}

const TransferModal: React.FC<TransferModalProps> = ({ sourceEnvelope, envelopes, onClose, onTransfer }) => {
    const [amount, setAmount] = useState('');
    const [destId, setDestId] = useState('');
    const [note, setNote] = useState('');

    const otherEnvelopes = envelopes.filter(e => e.id !== sourceEnvelope.id);
    const amountNum = parseFloat(amount) || 0;
    const isValid = amountNum > 0 && amountNum <= sourceEnvelope.balance && destId !== '';

    const destinationEnvelope = envelopes.find(e => e.id === destId);

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/95 backdrop-blur-xl animate-in fade-in duration-300">
            <div className="w-full max-w-sm bg-zinc-950 border border-zinc-800 p-8 shadow-[0_0_50px_rgba(0,0,0,0.5)] max-h-[90dvh] overflow-y-auto no-scrollbar">
                <div className="flex justify-between items-center mb-8 border-b border-zinc-900 pb-4">
                    <div className="flex flex-col">
                        <h2 className="text-lg font-light tracking-widest text-white uppercase">Internal Transfer</h2>
                        <p className="text-[7px] text-zinc-600 font-bold tracking-[0.4em] mt-1 uppercase">Vault to Vault</p>
                    </div>
                    <button onClick={onClose} className="p-1.5 border border-zinc-800 text-zinc-500 hover:text-white transition-colors">
                        <X className="w-4 h-4" />
                    </button>
                </div>

                <div className="space-y-6">
                    {/* Source View */}
                    <div className="p-4 bg-zinc-900/30 border border-zinc-800">
                        <p className="text-[7px] text-zinc-600 font-bold uppercase tracking-widest mb-3">From Source</p>
                        <div className="flex items-center gap-3">
                            <div className="p-2 border border-zinc-800 bg-black/40 text-zinc-400" style={{ borderColor: `${sourceEnvelope.color}44` }}>
                                {getIcon(sourceEnvelope.icon, 'w-4 h-4')}
                            </div>
                            <div className="flex-1">
                                <p className="text-xs font-bold text-white uppercase tracking-wider">{sourceEnvelope.name}</p>
                                <p className="text-[9px] text-zinc-500">Available: ₹{sourceEnvelope.balance.toLocaleString()}</p>
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-center -my-3 relative z-10">
                        <div className="bg-blue-600 p-2 border border-blue-400/50 shadow-[0_0_15px_rgba(37,99,235,0.4)]">
                            <ArrowRightLeft className="w-4 h-4 text-white" />
                        </div>
                    </div>

                    {/* Destination Selection */}
                    <div className="space-y-2">
                        <label className="text-[7px] font-bold text-zinc-500 uppercase tracking-[0.3em] ml-1">Destination_Vault</label>
                        <div className="grid grid-cols-1 gap-2 max-h-32 overflow-y-auto no-scrollbar py-1">
                            {otherEnvelopes.map((env) => (
                                <button
                                    key={env.id}
                                    onClick={() => setDestId(env.id)}
                                    className={`p-3 text-left border transition-all flex items-center gap-3 ${destId === env.id
                                        ? 'bg-zinc-100 text-black border-white'
                                        : 'bg-zinc-900/50 border-zinc-800 text-zinc-500 hover:border-zinc-700'
                                        }`}
                                >
                                    <div className="p-1.5 border border-zinc-800/20 bg-black/10">
                                        {getIcon(env.icon, 'w-3 h-3')}
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-[9px] font-bold uppercase tracking-widest">{env.name}</p>
                                        <p className="text-[7px] opacity-70">Current Balance: ₹{env.balance.toLocaleString()}</p>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Amount Input */}
                    <div className="space-y-2">
                        <label className="text-[7px] font-bold text-zinc-500 uppercase tracking-[0.3em] ml-1">Transfer_Amount</label>
                        <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 text-xs">₹</span>
                            <input
                                type="number"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                placeholder="0.00"
                                className="w-full bg-zinc-900/50 border border-zinc-800 p-3 pl-7 text-sm text-white placeholder:text-zinc-700 outline-none focus:border-blue-500 transition-colors tracking-widest"
                            />
                        </div>
                        {amountNum > sourceEnvelope.balance && (
                            <p className="text-[7px] text-red-500 font-bold mt-1 ml-1 tracking-[0.2em] uppercase text-right italic">Insufficient balance in source vault!</p>
                        )}
                    </div>

                    {/* Note Input */}
                    <div className="space-y-2">
                        <label className="text-[7px] font-bold text-zinc-500 uppercase tracking-[0.3em] ml-1">REFERENCE NOTE</label>
                        <input
                            type="text"
                            value={note}
                            onChange={(e) => setNote(e.target.value)}
                            placeholder="REASON FOR TRANSFER..."
                            className="w-full bg-zinc-900/50 border border-zinc-800 p-3 text-[10px] text-white placeholder:text-zinc-700 outline-none focus:border-blue-500 transition-colors uppercase tracking-widest"
                        />
                    </div>

                    {/* Actions */}
                    <div className="pt-4 flex flex-col gap-3">
                        <button
                            onClick={() => onTransfer(destId, amountNum, note)}
                            disabled={!isValid}
                            className={`w-full py-3.5 text-[10px] font-bold uppercase tracking-[0.4em] flex items-center justify-center gap-2 transition-all border ${isValid
                                ? 'bg-blue-600 border-blue-400/50 text-white shadow-[0_0_20px_rgba(37,99,235,0.2)] active:scale-95'
                                : 'bg-zinc-900 border-zinc-800 text-zinc-600'
                                }`}
                        >
                            <ArrowRightLeft className="w-3.5 h-3.5" />
                            EXECUTE TRANSFER
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TransferModal;
