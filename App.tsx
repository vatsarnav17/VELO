
import React, { useState, useEffect } from 'react';
import { Home, History, Settings, Plus, CreditCard, Sparkles, Pencil, ArrowUpRight, ArrowDownLeft, X } from 'lucide-react';
import { Envelope, Transaction, AppScreen } from './types';
import { INITIAL_ENVELOPES } from './constants';
import EnvelopeCard from './components/EnvelopeCard';
import PaymentSheet from './components/PaymentSheet';
import EnvelopeEditModal from './components/EnvelopeEditModal';
import EnvelopeDetailModal from './components/EnvelopeDetailModal';

const App: React.FC = () => {
  const [activeScreen, setActiveScreen] = useState<AppScreen>(AppScreen.DASHBOARD);
  const [totalCapital, setTotalCapital] = useState<number>(() => {
    const saved = localStorage.getItem('velo_v2_total_capital');
    return saved ? parseFloat(saved) : 0;
  });
  const [isEditingCapital, setIsEditingCapital] = useState(false);
  const [archives, setArchives] = useState<Record<string, any>>(() => {
    try {
      const saved = localStorage.getItem('velo_v2_archives');
      return saved ? JSON.parse(saved) : {};
    } catch (e) {
      return {};
    }
  });

  const [envelopes, setEnvelopes] = useState<Envelope[]>(() => {
    try {
      const saved = localStorage.getItem('velo_v2_envelopes');
      return (saved && JSON.parse(saved).length > 0) ? JSON.parse(saved) : INITIAL_ENVELOPES;
    } catch (e) {
      console.error('Error parsing envelopes:', e);
      return INITIAL_ENVELOPES;
    }
  });
  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    try {
      const saved = localStorage.getItem('velo_v2_transactions');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      console.error('Error parsing transactions:', e);
      return [];
    }
  });
  const [selectedEnvelope, setSelectedEnvelope] = useState<Envelope | null>(null);
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [editingEnvelope, setEditingEnvelope] = useState<Envelope | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isDetailViewOpen, setIsDetailViewOpen] = useState(false);
  const [isIncomeModalOpen, setIsIncomeModalOpen] = useState(false);

  // History Filters
  const [historySearch, setHistorySearch] = useState('');
  const [historyFilterEnvelope, setHistoryFilterEnvelope] = useState('ALL');
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);

  // Custom Modal States
  const [confirmModalState, setConfirmModalState] = useState<{ isOpen: boolean; message: string; onConfirm: () => void; }>({ isOpen: false, message: '', onConfirm: () => { } });
  const [inputModalState, setInputModalState] = useState<{ isOpen: boolean; title: string; placeholder: string; onConfirm: (val: string) => void; }>({ isOpen: false, title: '', placeholder: '', onConfirm: () => { } });
  const [alertMessage, setAlertMessage] = useState<string | null>(null);

  // Navbar Scroll Logic
  const [isNavbarVisible, setIsNavbarVisible] = useState(true);
  const lastScrollY = React.useRef(0);

  const handleScroll = (e: React.UIEvent<HTMLElement>) => {
    const currentScrollY = e.currentTarget.scrollTop;
    if (currentScrollY > lastScrollY.current && currentScrollY > 50) {
      setIsNavbarVisible(false); // Scrolling DOWN
    } else {
      setIsNavbarVisible(true); // Scrolling UP
    }
    lastScrollY.current = currentScrollY;
  };

  // Persistence
  useEffect(() => {
    localStorage.setItem('velo_v2_envelopes', JSON.stringify(envelopes));
    localStorage.setItem('velo_v2_total_capital', totalCapital.toString());
    localStorage.setItem('velo_v2_transactions', JSON.stringify(transactions));
    localStorage.setItem('velo_v2_archives', JSON.stringify(archives));
  }, [envelopes, totalCapital, transactions, archives]);

  const allocatedCapital = envelopes.reduce((acc, curr) => acc + curr.limit, 0);
  const unallocatedCapital = totalCapital - allocatedCapital;

  const totalCredit = transactions
    .filter(t => t.type === 'credit')
    .reduce((acc, curr) => acc + curr.amount, 0);

  const totalDebit = transactions
    .filter(t => t.type === 'debit')
    .reduce((acc, curr) => acc + curr.amount, 0);


  const handleEnvelopeClick = (env: Envelope) => {
    setSelectedEnvelope(env);
    setIsDetailViewOpen(true);
  };

  const handleEditEnvelope = (env: Envelope) => {
    setEditingEnvelope(env);
    setIsEditModalOpen(true);
  };

  const saveEnvelope = (data: Partial<Envelope>) => {
    const actionType = data.id ? 'RECONFIGURING' : 'INITIALIZING';
    const amountDesc = data.limit ? `TO ₹${data.limit.toLocaleString()}` : '';

    setConfirmModalState({
      isOpen: true,
      message: `ARE YOU SURE?\nACTION: ${actionType} ${data.name?.toUpperCase()}\nINSTRUCTION: YOU ARE SETTING THE NEW ALLOCATION LIMIT ${amountDesc}.`,
      onConfirm: () => {
        if (data.id) {
          setEnvelopes(prev => prev.map(e => e.id === data.id ? { ...e, ...data } as Envelope : e));
        } else {
          const newEnv: Envelope = {
            ...data,
            id: Math.random().toString(36).substr(2, 9),
            color: data.color || '#3b82f6'
          } as Envelope;
          setEnvelopes(prev => [...prev, newEnv]);
        }
        setIsEditModalOpen(false);
        setEditingEnvelope(null);
        setConfirmModalState(prev => ({ ...prev, isOpen: false }));
      }
    });
  };

  const deleteEnvelope = (id: string) => {
    const env = envelopes.find(e => e.id === id);
    if (!env) return;

    setConfirmModalState({
      isOpen: true,
      message: `ARE YOU SURE?\nACTION: DELETING ${env.name.toUpperCase()}\nINSTRUCTION: YOU ARE REMOVING ALL FUNDS ALLOCATED TO THIS UNIT. THIS DATA CANNOT BE RECOVERED.`,
      onConfirm: () => {
        setEnvelopes(prev => prev.filter(e => e.id !== id));
        setIsEditModalOpen(false);
        setEditingEnvelope(null);
        setConfirmModalState(prev => ({ ...prev, isOpen: false }));
      }
    });
  };

  const processPayment = (amount: number, note: string) => {
    if (!selectedEnvelope) return;

    // Adding a dummy payee address ensures stricter apps like Paytm 
    // recognize this as a valid UPI request and appear in the chooser.
    const upiLink = 'intent://pay?pa=paytm@upi#Intent;scheme=upi;end;';

    console.log(`[VELO] Dispatching Compatible Intent: ${upiLink}`);

    window.location.href = upiLink;

    setEnvelopes(prev => prev.map(e =>
      e.id === selectedEnvelope.id ? { ...e, balance: e.balance - amount, limit: e.limit - amount } : e
    ));
    setTotalCapital(prev => prev - amount);

    const newTransaction: Transaction = {
      id: Math.random().toString(36).substr(2, 9),
      envelopeId: selectedEnvelope.id,
      envelopeName: selectedEnvelope.name,
      amount: amount,
      merchant: 'MANUAL PAYMENT',
      timestamp: Date.now(),
      type: 'debit',
      status: 'completed',
      note: note
    };

    setTransactions(prev => [newTransaction, ...prev]);
    setIsPaymentOpen(false);
  };

  const recordIncome = (amount: number, source: string, note: string) => {
    setConfirmModalState({
      isOpen: true,
      message: `ARE YOU SURE?\nACTION: ADDING ₹${amount.toLocaleString()}\nINSTRUCTION: YOU ARE INCREASING YOUR TOTAL AVAILABLE ASSETS FROM SOURCE: ${source.toUpperCase()}.`,
      onConfirm: () => {
        const newTransaction: Transaction = {
          id: Math.random().toString(36).substr(2, 9),
          envelopeId: 'system',
          envelopeName: 'CASH_IN',
          amount: amount,
          merchant: source,
          timestamp: Date.now(),
          type: 'credit',
          status: 'completed',
          note: note
        };
        setTotalCapital(prev => prev + amount);
        setTransactions(prev => [newTransaction, ...prev]);
        setConfirmModalState(prev => ({ ...prev, isOpen: false }));
      }
    });
  };

  return (
    <div className="flex flex-col h-[100dvh] max-w-md mx-auto bg-black text-zinc-100 overflow-hidden border-x border-zinc-800/50 font-sans relative">
      <div className="absolute inset-0 opacity-20 pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>

      <header
        className={`px-5 py-4 flex justify-between items-center bg-black/80 backdrop-blur-xl border-b border-zinc-900 fixed top-0 z-40 w-full max-w-md transition-transform duration-300 ${isNavbarVisible ? 'translate-y-0' : '-translate-y-full'}`}
      >
        <div>
          <h1 className="text-xl font-black tracking-tighter text-white app-name">VELO</h1>
          <p className="text-[8px] text-zinc-500 font-bold uppercase tracking-[0.2em]">Private Vault</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => { setEditingEnvelope(null); setIsEditModalOpen(true); }}
            className="p-2 bg-blue-600 text-white hover:bg-blue-500 active:scale-95 transition-all shadow-[0_0_15px_rgba(37,99,235,0.3)] border border-blue-400/30"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto no-scrollbar px-6 pb-32 pt-24 relative z-10" onScroll={handleScroll}>
        {activeScreen === AppScreen.DASHBOARD ? (
          <>
            {/* Summary Card */}
            <section className="bg-zinc-900/40 p-4 px-5 border border-zinc-800/50 relative group mb-[5px]">
              {/* Clipping container for background elements */}
              <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:scale-110 transition-transform duration-1000">
                  <CreditCard className="w-16 h-16" />
                </div>
                <div className="absolute top-0 left-0 w-1 h-full bg-blue-600"></div>
              </div>

              <div className="flex justify-between items-center mb-4 relative z-10">
                <p className="text-[8px] text-zinc-500 font-bold uppercase tracking-[0.2em]">ALLOCATED FUNDS</p>
                {!isEditingCapital && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => setIsIncomeModalOpen(true)}
                      className="flex items-center gap-1.5 px-3 py-1 bg-emerald-500/10 border border-emerald-500/30 text-[8px] font-bold text-emerald-500 hover:bg-emerald-500/20 transition-all active:scale-95"
                    >
                      <Plus className="w-2.5 h-2.5" />
                      ADD FUNDS
                    </button>
                    <button
                      onClick={() => setIsEditingCapital(true)}
                      className="flex items-center gap-1.5 px-3 py-1 bg-zinc-800/80 border border-zinc-700/50 text-[8px] font-bold text-zinc-400 hover:text-white transition-all active:scale-95"
                    >
                      <Pencil className="w-2 h-2" />
                      MANAGE
                    </button>
                  </div>
                )}
              </div>

              <div className="mb-4 relative z-10">
                <div className="flex items-baseline gap-2">
                  <h2 className="text-3xl font-light tracking-tighter text-white">
                    <span className="text-xl font-light text-zinc-500 mr-2">₹</span>
                    {totalCapital.toLocaleString()}
                  </h2>
                </div>
              </div>
              <button
                onClick={() => setIsDetailsOpen(!isDetailsOpen)}
                className="w-full flex items-center justify-between text-[7px] text-zinc-600 font-bold uppercase tracking-[0.2em] pt-3 border-t border-zinc-900 hover:text-zinc-400 transition-colors relative z-10"
              >
                <span>{isDetailsOpen ? 'HIDE OVERVIEW' : 'VIEW BREAKDOWN'}</span>
                <Sparkles className={`w-2 h-2 transition-transform duration-300 ${isDetailsOpen ? 'rotate-180' : ''}`} />
              </button>

              <div
                className={`absolute top-[calc(100%-1px)] left-0 w-full bg-zinc-900 border-x border-b border-zinc-800/80 grid grid-cols-2 gap-4 shadow-[0_15px_30px_rgba(0,0,0,0.5)] z-[60] transition-all duration-500 ease-in-out origin-top overflow-hidden ${isDetailsOpen
                  ? 'opacity-100 translate-y-0 max-h-40 p-5'
                  : 'opacity-0 -translate-y-2 max-h-0 p-0 border-none'
                  }`}
              >
                <div className="absolute top-0 left-0 w-1 h-full bg-blue-600/30"></div>
                <div>
                  <p className="text-[7px] text-zinc-500 font-bold uppercase tracking-[0.15em] mb-0.5">VAULTED</p>
                  <p className="text-sm font-medium text-zinc-200">₹{allocatedCapital.toLocaleString()}</p>
                </div>
                <div className="text-right">
                  <p className="text-[7px] text-zinc-500 font-bold uppercase tracking-[0.15em] mb-0.5">LIQUID</p>
                  <p className={`text-sm font-medium ${unallocatedCapital < 0 ? 'text-red-500' : 'text-blue-500'}`}>₹{unallocatedCapital.toLocaleString()}</p>
                </div>
              </div>
            </section>

            {/* Action Quick Links */}
            <div className="grid grid-cols-2 gap-3 mb-10">
              <div className="flex items-center justify-between py-1.5 px-3 bg-emerald-500/10 border border-emerald-500/20 group">
                <div className="flex flex-col items-start text-left">
                  <span className="text-[7px] font-bold text-emerald-500 uppercase tracking-[0.2em]">CREDIT</span>
                  <span className="text-sm font-bold text-white tracking-widest uppercase -mt-1">₹{totalCredit.toLocaleString()}</span>
                </div>
                <ArrowUpRight className="w-3 h-3 text-emerald-500 transition-transform" />
              </div>
              <div className="flex items-center justify-between py-1.5 px-3 bg-red-500/10 border border-red-500/20 group">
                <div className="flex flex-col items-start text-left">
                  <span className="text-[7px] font-bold text-red-500 uppercase tracking-[0.2em]">DEBIT</span>
                  <span className="text-sm font-bold text-white tracking-widest uppercase -mt-1">₹{totalDebit.toLocaleString()}</span>
                </div>
                <ArrowDownLeft className="w-3 h-3 text-red-500 transition-transform" />
              </div>
            </div>


            {/* Envelopes Grid */}
            <section>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] ml-1">Allocation Units</h3>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {envelopes.map((env) => (
                  <EnvelopeCard
                    key={env.id}
                    envelope={env}
                    onClick={handleEnvelopeClick}
                  />
                ))}
              </div>
            </section>

          </>
        ) : activeScreen === AppScreen.HISTORY ? (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-xl font-light tracking-[0.2em] text-white uppercase">Vault History</h2>
              <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-[0.2em]">Live Stream</p>
            </div>

            {/* Filters */}
            <div className="grid grid-cols-2 gap-3 mb-6">
              <div className="space-y-1">
                <label className="text-[7px] font-bold text-zinc-600 uppercase tracking-widest ml-1">Value Amount</label>
                <input
                  type="text"
                  placeholder="SEARCH AMOUNT..."
                  value={historySearch}
                  onChange={(e) => setHistorySearch(e.target.value)}
                  className="w-full bg-zinc-900/50 border border-zinc-800 p-2.5 text-[10px] text-white placeholder:text-zinc-700 focus:border-blue-500 outline-none transition-all uppercase tracking-widest"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[7px] font-bold text-zinc-600 uppercase tracking-widest ml-1">Allocation Unit</label>
                <div className="relative">
                  <button
                    onClick={() => setIsFilterModalOpen(true)}
                    className="w-full bg-zinc-900/50 border border-zinc-800 p-2.5 text-[10px] text-white focus:border-blue-500 outline-none transition-all uppercase tracking-widest text-left flex justify-between items-center"
                  >
                    <span>
                      {historyFilterEnvelope === 'ALL' ? 'ALL UNITS' :
                        historyFilterEnvelope === 'system' ? 'INCOME ONLY' :
                          envelopes.find(e => e.id === historyFilterEnvelope)?.name.toUpperCase() || 'UNKNOWN'}
                    </span>
                    <ArrowDownLeft className="w-3 h-3 text-zinc-500 pointer-events-none rotate-[-45deg]" />
                  </button>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              {transactions.filter(t => {
                const matchesEnvelope = historyFilterEnvelope === 'ALL' || t.envelopeId === historyFilterEnvelope;
                const matchesSearch = historySearch === '' || t.amount.toString().includes(historySearch) || (t.note || '').toLowerCase().includes(historySearch.toLowerCase());
                return matchesEnvelope && matchesSearch;
              }).length === 0 ? (
                <div className="p-10 text-center border border-dashed border-zinc-800 bg-zinc-900/20">
                  <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest">No transaction logs found.</p>
                </div>
              ) : (
                transactions.filter(t => {
                  const matchesEnvelope = historyFilterEnvelope === 'ALL' || t.envelopeId === historyFilterEnvelope;
                  const matchesSearch = historySearch === '' || t.amount.toString().includes(historySearch) || (t.note || '').toLowerCase().includes(historySearch.toLowerCase());
                  return matchesEnvelope && matchesSearch;
                }).map((t) => (
                  <div key={t.id} className="p-4 bg-zinc-900/40 border border-zinc-800 flex justify-between items-center group hover:bg-zinc-900 transition-all">
                    <div className="flex items-center gap-4">
                      <div className={`p-2 border ${t.type === 'credit' ? 'border-emerald-500/30 bg-emerald-500/5 text-emerald-500' : 'border-red-500/30 bg-red-500/5 text-red-500'}`}>
                        {t.type === 'credit' ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownLeft className="w-4 h-4" />}
                      </div>
                      <div>
                        <div className="flex items-baseline gap-2">
                          <p className="text-xs font-bold text-white uppercase tracking-wider">
                            {t.type === 'credit' ? 'FUNDS ADDED' : (t.envelopeName || 'MANUAL DEBIT')}
                          </p>
                          {t.type === 'debit' && t.envelopeName && (
                            <span className="text-[7px] text-zinc-500 font-bold px-1.5 py-0.5 border border-zinc-800 bg-black/40 tracking-widest">VAULT EXIT</span>
                          )}
                        </div>
                        <p className="text-[9px] text-zinc-400 font-medium tracking-[0.05em] mt-0.5 line-clamp-1 italic italic">"{t.note}"</p>
                        <p className="text-[8px] text-zinc-600 font-bold uppercase tracking-widest mt-1">
                          {new Date(t.timestamp).toLocaleDateString()} AT {new Date(t.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                    <p className={`text-sm font-bold ${t.type === 'credit' ? 'text-emerald-500' : 'text-zinc-200'}`}>
                      {t.type === 'credit' ? '+' : '-'}₹{t.amount.toLocaleString()}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        ) : (
          <div className="p-10 text-center animate-in fade-in duration-500">
            <h2 className="text-xl font-light tracking-[0.2em] text-white uppercase mb-8">System Settings</h2>

            <div className="space-y-6">
              {/* Reset Data */}
              <div className="p-5 bg-zinc-900/30 border border-zinc-800 text-left">
                <p className="text-[9px] text-zinc-500 font-bold uppercase tracking-[0.15em] mb-2">DANGER ZONE</p>
                <button
                  onClick={() => {
                    setConfirmModalState({
                      isOpen: true,
                      message: "CRITICAL WARNING: THIS WILL WIPE ALL DATA INCLUDING ENVELOPES, TRANSACTIONS, AND SETTINGS. THIS CANNOT BE UNDONE. PROCEED?",
                      onConfirm: () => {
                        localStorage.clear();
                        window.location.reload();
                      }
                    });
                  }}
                  className="w-full py-3 bg-red-900/20 border border-red-900/50 text-red-500 font-bold uppercase tracking-widest text-[9px] hover:bg-red-900/40 transition-all"
                >
                  FACTORY RESET APP
                </button>
              </div>

              {/* Monthly Archives */}
              <div className="p-5 bg-zinc-900/30 border border-zinc-800 text-left">
                <p className="text-[9px] text-zinc-500 font-bold uppercase tracking-[0.15em] mb-2">MONTHLY ARCHIVES</p>

                <button
                  onClick={() => {
                    setInputModalState({
                      isOpen: true,
                      title: "ENTER ARCHIVE NAME",
                      placeholder: "E.G. OCT 2023",
                      onConfirm: (monthName) => {
                        if (monthName && monthName.trim() !== '') {
                          const newArchive = {
                            date: new Date().toISOString(),
                            envelopes,
                            transactions,
                            totalCapital
                          };
                          setArchives(prev => ({ ...prev, [monthName]: newArchive }));
                          setAlertMessage(`ARCHIVED CURRENT STATE AS "${monthName.toUpperCase()}"`);
                          setInputModalState(prev => ({ ...prev, isOpen: false }));
                        }
                      }
                    });
                  }}
                  className="w-full py-3 mb-4 bg-zinc-800 border border-zinc-700 text-zinc-300 font-bold uppercase tracking-widest text-[9px] hover:bg-zinc-700 hover:text-white transition-all flex items-center justify-center gap-2"
                >
                  <CreditCard className="w-3 h-3" />
                  ARCHIVE CURRENT STATE
                </button>

                <div className="space-y-2 max-h-40 overflow-y-auto no-scrollbar border-t border-zinc-800/50 pt-2">
                  {Object.keys(archives).length === 0 ? (
                    <p className="text-[8px] text-zinc-600 uppercase tracking-widest text-center py-2">NO ARCHIVES FOUND</p>
                  ) : (
                    Object.keys(archives).map(key => (
                      <div key={key} className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            setConfirmModalState({
                              isOpen: true,
                              message: `LOAD ARCHIVE "${key}"?\nWARNING: THIS WILL OVERWRITE YOUR CURRENT ACTIVE DATA WITH THIS SNAPSHOT.`,
                              onConfirm: () => {
                                const archive = archives[key];
                                setEnvelopes(archive.envelopes);
                                setTransactions(archive.transactions);
                                setTotalCapital(archive.totalCapital);
                                setAlertMessage("ARCHIVE LOADED SUCCESSFULLY.");
                                setConfirmModalState(prev => ({ ...prev, isOpen: false }));
                              }
                            });
                          }}
                          className="flex-1 py-2 px-3 bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-600 text-[8px] font-bold uppercase tracking-widest transition-all text-left"
                        >
                          LOAD: <span className="text-white">{key}</span>
                        </button>
                        <button
                          onClick={() => {
                            setConfirmModalState({
                              isOpen: true,
                              message: `DELETE ARCHIVE "${key}"?`,
                              onConfirm: () => {
                                const newArchives = { ...archives };
                                delete newArchives[key];
                                setArchives(newArchives);
                                setConfirmModalState(prev => ({ ...prev, isOpen: false }));
                              }
                            });
                          }}
                          className="p-2 bg-red-900/20 border border-red-900/30 text-red-500 hover:bg-red-900/40 text-[8px]"
                        >
                          X
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <p className="text-[8px] text-zinc-700 font-bold uppercase tracking-[0.4em] mt-8">System Parameters v2.1.0</p>
            </div>
          </div>
        )
        }
      </main >

      {/* Nav */}
      < nav
        className={`fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md bg-black/80 backdrop-blur-2xl border-t border-zinc-800 flex justify-around items-center z-50 h-20 transition-transform duration-300 ${isNavbarVisible ? 'translate-y-0' : 'translate-y-full'}`}
      >
        {
          [
            { id: AppScreen.DASHBOARD, icon: Home },
            { id: AppScreen.HISTORY, icon: History },
            { id: AppScreen.SETTINGS, icon: Settings }
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveScreen(item.id)}
              className={`flex-1 h-full flex flex-col items-center justify-center transition-all duration-300 ${activeScreen === item.id ? 'text-blue-500 border-t-2 border-blue-500 -mt-[2px] bg-blue-500/5' : 'text-zinc-600 hover:text-zinc-300'}`}
            >
              <item.icon className={`w-5 h-5 ${activeScreen === item.id ? 'drop-shadow-[0_0_8px_rgba(59,130,246,0.5)]' : ''}`} />
              <span className="text-[8px] font-bold uppercase tracking-[0.2em] mt-1.5">{item.id}</span>
            </button>
          ))
        }
      </nav >

      {/* Overlays */}
      {
        isDetailViewOpen && selectedEnvelope && (
          <EnvelopeDetailModal
            envelope={selectedEnvelope}
            onClose={() => setIsDetailViewOpen(false)}
            onEdit={(env) => {
              setIsDetailViewOpen(false);
              handleEditEnvelope(env);
            }}
            onPay={(env) => {
              setIsDetailViewOpen(false);
              setIsPaymentOpen(true);
            }}
          />
        )
      }

      {
        isPaymentOpen && selectedEnvelope && (
          <PaymentSheet
            envelope={selectedEnvelope}
            onClose={() => setIsPaymentOpen(false)}
            onPay={processPayment}
          />
        )
      }

      {
        isEditModalOpen && (
          <EnvelopeEditModal
            envelope={editingEnvelope}
            onClose={() => setIsEditModalOpen(false)}
            onSave={saveEnvelope}
            onDelete={deleteEnvelope}
            maxAllowed={unallocatedCapital + (editingEnvelope?.limit || 0)}
          />
        )
      }

      {
        isIncomeModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/95 backdrop-blur-xl animate-in fade-in duration-300">
            <div className="w-full max-w-xs bg-zinc-950 border border-zinc-800 p-8 shadow-[0_0_50px_rgba(0,0,0,0.5)] max-h-[90dvh] overflow-y-auto no-scrollbar">
              <h2 className="text-lg font-light tracking-widest text-emerald-500 uppercase mb-6">Record Income</h2>
              <div className="space-y-6">
                <div className="space-y-1">
                  <label className="text-[7px] font-bold text-zinc-600 uppercase tracking-widest ml-1">Amount Received</label>
                  <div className="relative">
                    <span className="absolute left-0 top-1/2 -translate-y-1/2 text-xl font-light text-zinc-600">₹</span>
                    <input
                      type="number"
                      placeholder="0"
                      className="w-full bg-transparent border-b border-zinc-800 py-3 pl-6 text-2xl font-black text-white outline-none focus:border-emerald-500 transition-colors"
                      id="income-amount"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[7px] font-bold text-zinc-600 uppercase tracking-widest ml-1">Source / Merchant</label>
                  <input
                    type="text"
                    placeholder="E.G. SALARY, DIVIDEND..."
                    className="w-full bg-transparent border-b border-zinc-800 py-2 text-[10px] font-bold text-white outline-none focus:border-emerald-500 transition-colors uppercase tracking-widest"
                    id="income-source"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[7px] font-bold text-zinc-600 uppercase tracking-widest ml-1">Reference Note</label>
                  <input
                    type="text"
                    placeholder="OPTIONAL DETAILS..."
                    className="w-full bg-transparent border-b border-zinc-800 py-2 text-[10px] font-bold text-white outline-none focus:border-emerald-500 transition-colors uppercase tracking-widest"
                    id="income-note"
                  />
                </div>

                <div className="flex flex-col gap-3 pt-4">
                  <button
                    onClick={() => {
                      const amount = parseFloat((document.getElementById('income-amount') as HTMLInputElement).value) || 0;
                      const source = (document.getElementById('income-source') as HTMLInputElement).value || 'OTHER';
                      const note = (document.getElementById('income-note') as HTMLInputElement).value || '';

                      if (amount > 0) {
                        recordIncome(amount, source, note);
                        setIsIncomeModalOpen(false);
                      }
                    }}
                    className="w-full py-4 bg-emerald-500 text-black font-black uppercase tracking-widest text-[10px] hover:bg-emerald-400 active:scale-95 transition-all"
                  >
                    Confirm Deposit
                  </button>
                  <button
                    onClick={() => setIsIncomeModalOpen(false)}
                    className="w-full py-4 bg-zinc-900 border border-zinc-800 text-zinc-500 font-bold uppercase tracking-widest text-[10px] hover:text-white transition-all shadow-none"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )
      }

      {
        isEditingCapital && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/95 backdrop-blur-xl animate-in fade-in duration-300">
            <div className="w-full max-w-xs bg-zinc-950 border border-zinc-800 p-8 shadow-[0_0_50px_rgba(0,0,0,0.5)] max-h-[90dvh] overflow-y-auto no-scrollbar">
              <h2 className="text-lg font-light tracking-widest text-white uppercase mb-6">Update Assets</h2>
              <div className="space-y-6">
                <div className="relative">
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 text-xl font-light text-zinc-600">₹</span>
                  <input
                    type="number"
                    className="w-full bg-transparent border-b border-zinc-800 py-3 pl-6 text-2xl font-black text-white outline-none focus:border-blue-500 transition-colors"
                    defaultValue={totalCapital}
                    id="capital-input"
                  />
                </div>
                <div className="flex flex-col gap-3 pt-4">
                  <button
                    onClick={() => {
                      const val = parseFloat((document.getElementById('capital-input') as HTMLInputElement).value) || 0;
                      const diff = val - totalCapital;
                      const action = diff >= 0 ? 'ADDING' : 'REMOVING';

                      setConfirmModalState({
                        isOpen: true,
                        message: `CONFIRM ASSET ADJUSTMENT?\n${action} ₹${Math.abs(diff).toLocaleString()}\nACTION: UPDATING TOTAL CAPITAL.`,
                        onConfirm: () => {
                          setTotalCapital(val);
                          setIsEditingCapital(false);
                          setConfirmModalState(prev => ({ ...prev, isOpen: false }));
                        }
                      });
                    }}
                    className="w-full py-4 bg-white text-black font-black uppercase tracking-widest text-[10px] hover:bg-zinc-200 active:scale-95 transition-all"
                  >
                    Confirm Changes
                  </button>
                  <button
                    onClick={() => setIsEditingCapital(false)}
                    className="w-full py-4 bg-zinc-900 border border-zinc-800 text-zinc-500 font-bold uppercase tracking-widest text-[10px] hover:text-white transition-all shadow-none"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )
      }
      {/* Custom Confirmation Modal */}
      {confirmModalState.isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/95 backdrop-blur-xl animate-in fade-in duration-200">
          <div className="w-full max-w-xs bg-zinc-950 border border-zinc-800 p-6 shadow-2xl">
            <h3 className="text-white text-md font-bold uppercase tracking-widest mb-4">Confirmation</h3>
            <p className="text-zinc-400 text-[10px] font-mono whitespace-pre-line leading-relaxed mb-6">{confirmModalState.message}</p>
            <div className="flex gap-2">
              <button onClick={() => confirmModalState.onConfirm()} className="flex-1 py-3 bg-blue-600 text-white font-bold text-[10px] uppercase tracking-widest hover:bg-blue-500">Confirm</button>
              <button onClick={() => setConfirmModalState(prev => ({ ...prev, isOpen: false }))} className="flex-1 py-3 bg-zinc-900 text-zinc-500 font-bold text-[10px] uppercase tracking-widest hover:text-white border border-zinc-800">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Custom Input Modal */}
      {inputModalState.isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/95 backdrop-blur-xl animate-in fade-in duration-200">
          <div className="w-full max-w-xs bg-zinc-950 border border-zinc-800 p-6 shadow-2xl">
            <h3 className="text-white text-md font-bold uppercase tracking-widest mb-4">{inputModalState.title}</h3>
            <input
              autoFocus
              type="text"
              id="custom-input_field"
              placeholder={inputModalState.placeholder}
              className="w-full bg-zinc-900 border border-zinc-800 p-3 text-white text-sm mb-6 outline-none focus:border-blue-500 uppercase"
            />
            <div className="flex gap-2">
              <button onClick={() => {
                const val = (document.getElementById('custom-input_field') as HTMLInputElement).value;
                inputModalState.onConfirm(val);
              }} className="flex-1 py-3 bg-blue-600 text-white font-bold text-[10px] uppercase tracking-widest hover:bg-blue-500">Enter</button>
              <button onClick={() => setInputModalState(prev => ({ ...prev, isOpen: false }))} className="flex-1 py-3 bg-zinc-900 text-zinc-500 font-bold text-[10px] uppercase tracking-widest hover:text-white border border-zinc-800">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Custom Filter Selection Modal */}
      {isFilterModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/95 backdrop-blur-xl animate-in fade-in duration-200">
          <div className="w-full max-w-xs bg-zinc-950 border border-zinc-800 p-6 shadow-2xl max-h-[80vh] overflow-y-auto no-scrollbar">
            <div className="flex justify-between items-center mb-6 border-b border-zinc-900 pb-4">
              <h3 className="text-white text-md font-bold uppercase tracking-widest">Select Filter</h3>
              <button onClick={() => setIsFilterModalOpen(false)}><X className="w-4 h-4 text-zinc-500" /></button>
            </div>

            <div className="space-y-2">
              <button
                onClick={() => { setHistoryFilterEnvelope('ALL'); setIsFilterModalOpen(false); }}
                className={`w-full p-4 text-left text-[10px] font-bold uppercase tracking-widest border transition-all ${historyFilterEnvelope === 'ALL' ? 'bg-blue-600 border-blue-500 text-white' : 'bg-zinc-900/50 border-zinc-800 text-zinc-400 hover:text-white'}`}
              >
                ALL UNITS
              </button>
              <button
                onClick={() => { setHistoryFilterEnvelope('system'); setIsFilterModalOpen(false); }}
                className={`w-full p-4 text-left text-[10px] font-bold uppercase tracking-widest border transition-all ${historyFilterEnvelope === 'system' ? 'bg-blue-600 border-blue-500 text-white' : 'bg-zinc-900/50 border-zinc-800 text-zinc-400 hover:text-white'}`}
              >
                INCOME ONLY
              </button>

              <div className="my-4 border-t border-zinc-900"></div>

              {envelopes.map(e => (
                <button
                  key={e.id}
                  onClick={() => { setHistoryFilterEnvelope(e.id); setIsFilterModalOpen(false); }}
                  className={`w-full p-4 text-left text-[10px] font-bold uppercase tracking-widest border transition-all ${historyFilterEnvelope === e.id ? 'bg-blue-600 border-blue-500 text-white' : 'bg-zinc-900/50 border-zinc-800 text-zinc-400 hover:text-white'}`}
                >
                  {e.name.toUpperCase()}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Alert Modal (Toast-like) */}
      {alertMessage && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-[110] w-[90%] max-w-sm bg-zinc-100 text-black p-4 shadow-xl animate-in slide-in-from-top-4 duration-300 flex justify-between items-center" onClick={() => setAlertMessage(null)}>
          <span className="text-[10px] font-bold uppercase tracking-widest">{alertMessage}</span>
          <button onClick={() => setAlertMessage(null)}><X className="w-4 h-4" /></button>
        </div>
      )}

    </div >
  );
};

export default App;
