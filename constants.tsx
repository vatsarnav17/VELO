import React from 'react';
import { Wallet, Coffee, ShoppingBag, Zap, Car, ShieldCheck, Home, Utensils, ShoppingCart, Plane, Heart, Wrench, Globe, TrendingUp } from 'lucide-react';
import { Envelope, PaymentApp } from './types';

export const INITIAL_ENVELOPES: Envelope[] = [];

export const PAYMENT_APPS: PaymentApp[] = [
  { id: 'gpay', name: 'Google Pay', scheme: 'tez://', icon: 'https://cdn-icons-png.flaticon.com/512/6124/6124997.png' },
  { id: 'paytm', name: 'Paytm', scheme: 'paytmmp://', icon: 'https://cdn-icons-png.flaticon.com/512/825/825454.png' },
  { id: 'phonepe', name: 'PhonePe', scheme: 'phonepe://', icon: 'https://uxwing.com/wp-content/themes/uxwing/download/brands-and-social-media/phonepe-logo-icon.png' },
  { id: 'banking', name: 'Banking App', scheme: 'upi://', icon: 'https://cdn-icons-png.flaticon.com/512/2830/2830284.png' },
];


export const getIcon = (name: string, className?: string) => {
  switch (name) {
    case 'Wallet': return <Wallet className={className} />;
    case 'Coffee': return <Coffee className={className} />;
    case 'ShoppingBag': return <ShoppingBag className={className} />;
    case 'Zap': return <Zap className={className} />;
    case 'Car': return <Car className={className} />;
    case 'ShieldCheck': return <ShieldCheck className={className} />;
    case 'Home': return <Home className={className} />;
    case 'Utensils': return <Utensils className={className} />;
    case 'ShoppingCart': return <ShoppingCart className={className} />;
    case 'Plane': return <Plane className={className} />;
    case 'Heart': return <Heart className={className} />;
    case 'Wrench': return <Wrench className={className} />;
    case 'Globe': return <Globe className={className} />;
    case 'TrendingUp': return <TrendingUp className={className} />;
    default: return <Wallet className={className} />;
  }
};

export const CATEGORY_ICONS: Record<string, string> = {
  'Rent': 'Home',
  'Food': 'Utensils',
  'Shopping': 'ShoppingCart',
  'Travel': 'Plane',
  'Health': 'Heart',
  'Utilities': 'Zap',
  'Transport': 'Car',
  'Entertainment': 'Globe',
  'SIP': 'TrendingUp',
  'Misc': 'Wallet'
};
