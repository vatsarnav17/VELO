export interface Envelope {
  id: string;
  name: string;
  balance: number;
  limit: number;
  color: string;
  icon: string;
}

export interface Transaction {
  id: string;
  envelopeId: string;
  envelopeName?: string;
  amount: number;
  merchant: string;
  timestamp: number;
  type: 'debit' | 'credit' | 'transfer';
  status: 'pending' | 'completed';
  note?: string;
  sourceId?: string;
  destinationId?: string;
}

export interface PaymentApp {
  id: string;
  name: string;
  scheme: string;
  icon: string;
}


export enum AppScreen {
  DASHBOARD = 'dashboard',
  PAYMENT = 'payment',
  HISTORY = 'history',
  SETTINGS = 'settings'
}

