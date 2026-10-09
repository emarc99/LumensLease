'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  WalletState,
  connectFreighterWallet,
  getOrCreateDemoWallet,
  fetchAccountBalance,
  isFreighterAvailable,
} from '../lib/stellar';

interface WalletContextType {
  walletState: WalletState;
  isConnecting: boolean;
  isFreighterInstalled: boolean;
  isTelemetryOpen: boolean;
  setIsTelemetryOpen: (open: boolean) => void;
  connectFreighter: () => Promise<void>;
  connectDemoWallet: () => Promise<void>;
  disconnect: () => void;
  refreshBalance: () => Promise<void>;
}

const defaultState: WalletState = {
  isConnected: false,
  publicKey: null,
  walletType: null,
  balanceXlm: '0',
  error: null,
};

const WalletContext = createContext<WalletContextType>({
  walletState: defaultState,
  isConnecting: false,
  isFreighterInstalled: false,
  isTelemetryOpen: false,
  setIsTelemetryOpen: () => {},
  connectFreighter: async () => {},
  connectDemoWallet: async () => {},
  disconnect: () => {},
  refreshBalance: async () => {},
});

export function WalletProvider({ children }: { children: React.ReactNode }) {
  const [walletState, setWalletState] = useState<WalletState>(defaultState);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isFreighterInstalled, setIsFreighterInstalled] = useState(false);
  const [isTelemetryOpen, setIsTelemetryOpen] = useState(false);

  useEffect(() => {
    // Check if Freighter extension exists
    isFreighterAvailable().then(avail => setIsFreighterInstalled(avail));

    // Auto-restore demo wallet if previous session exists
    if (typeof window !== 'undefined') {
      const savedSecret = localStorage.getItem('lumenslease_demo_keypair_secret');
      const savedType = localStorage.getItem('lumenslease_wallet_type');
      if (savedType === 'demo' && savedSecret) {
        getOrCreateDemoWallet().then(ws => setWalletState(ws));
      }
    }
  }, []);

  const connectFreighter = async () => {
    setIsConnecting(true);
    const res = await connectFreighterWallet();
    setWalletState(res);
    if (res.isConnected) {
      localStorage.setItem('lumenslease_wallet_type', 'freighter');
    }
    setIsConnecting(false);
  };

  const connectDemoWallet = async () => {
    setIsConnecting(true);
    const res = await getOrCreateDemoWallet();
    setWalletState(res);
    if (res.isConnected) {
      localStorage.setItem('lumenslease_wallet_type', 'demo');
    }
    setIsConnecting(false);
  };

  const disconnect = () => {
    setWalletState(defaultState);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('lumenslease_wallet_type');
    }
  };

  const refreshBalance = async () => {
    if (walletState.publicKey) {
      const bal = await fetchAccountBalance(walletState.publicKey);
      setWalletState(prev => ({ ...prev, balanceXlm: bal }));
    }
  };

  return (
    <WalletContext.Provider
      value={{
        walletState,
        isConnecting,
        isFreighterInstalled,
        isTelemetryOpen,
        setIsTelemetryOpen,
        connectFreighter,
        connectDemoWallet,
        disconnect,
        refreshBalance,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  return useContext(WalletContext);
}
