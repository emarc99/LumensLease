/**
 * LumensLease — Stellar & Soroban Protocol Client
 * 
 * Manages connections to Stellar Testnet/Mainnet, Freighter Wallet integration,
 * and contract interface bindings for the LumensLease Caution Deposit & Rent Escrow.
 */

export const STELLAR_CONFIG = {
  network: 'TESTNET',
  networkPassphrase: 'Test SDF Network ; September 2015',
  sorobanRpcUrl: 'https://soroban-testnet.stellar.org',
  horizonUrl: 'https://horizon-testnet.stellar.org',
  contracts: {
    rentalEscrow: 'CBK6CZCHOUNZOPBYZCIVFUVUAVBGIBLUOY3KPB4RQL6ISMQQKJYZYYZE',
    usdcToken: 'CBIELILGBCNV64VUXTUTLPR3G75O3UXZ2C5S2S3VEXAMPLEUSDCID',
  },
  supportedAssets: [
    { code: 'USDC', issuer: 'GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5', decimals: 7 },
    { code: 'cNGN', issuer: 'GAWODFGQ74EXAMPLECNGNISSUERSTELLARTESTNETKEYEXAMPLE', decimals: 7 },
    { code: 'XLM', native: true, decimals: 7 },
  ],
};

export interface FreighterWalletState {
  isConnected: boolean;
  publicKey: string | null;
  error: string | null;
}

/**
 * Check if the Freighter browser extension is installed
 */
export function isFreighterInstalled(): boolean {
  if (typeof window === 'undefined') return false;
  return !!(window as any).freighter;
}

/**
 * Connect to Freighter Wallet and retrieve the user's Stellar public key
 */
export async function connectFreighter(): Promise<{ publicKey: string | null; error: string | null }> {
  if (typeof window === 'undefined') {
    return { publicKey: null, error: 'Browser environment required.' };
  }

  try {
    const freighter = (window as any).freighter;
    if (!freighter) {
      return { 
        publicKey: null, 
        error: 'Freighter Wallet extension is not installed. Please install from https://freighter.app' 
      };
    }

    // Request connection
    const isConnected = await freighter.isConnected();
    if (!isConnected) {
      return { publicKey: null, error: 'Freighter connection was declined.' };
    }

    const publicKey = await freighter.getPublicKey();
    return { publicKey, error: null };
  } catch (err: any) {
    return { publicKey: null, error: err?.message || 'Failed to connect to Freighter Wallet' };
  }
}

/**
 * Format raw stroops (or 7-decimal Soroban integer amounts) to human-readable units
 */
export function formatStroops(amount: number | string | bigint, decimals: number = 7): string {
  const num = Number(amount) / Math.pow(10, decimals);
  return num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 4 });
}

/**
 * Convert human units (e.g. 100 USDC) to 7-decimal Soroban i128 stroops
 */
export function toStroops(amount: number, decimals: number = 7): bigint {
  return BigInt(Math.round(amount * Math.pow(10, decimals)));
}
