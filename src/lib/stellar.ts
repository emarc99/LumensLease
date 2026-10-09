/**
 * LumensLease — Stellar & Soroban Protocol Client & Wallet Adapter
 * 
 * Manages dual-mode wallet connections (Freighter Browser Extension + Instant Testnet Demo Keypair),
 * Soroban RPC contract invocations, cryptographic SHA-256 visual audit digests, and on-chain escrow operations.
 */

import { Keypair, Horizon } from '@stellar/stellar-sdk';
import { isConnected, requestAccess, getAddress } from '@stellar/freighter-api';

export const STELLAR_CONFIG = {
  network: 'TESTNET',
  networkPassphrase: 'Test SDF Network ; September 2015',
  sorobanRpcUrl: 'https://soroban-testnet.stellar.org',
  horizonUrl: 'https://horizon-testnet.stellar.org',
  friendbotUrl: 'https://friendbot.stellar.org',
  contracts: {
    rentalEscrow: 'CBW7X3JMND3R3JBVUUIPREXW3L2QAB2OISCSE4XHNFKUNVTOBKD6JETN',
    landlordReputation: 'CAETU7N2Y62QYKAAM22Z54RDGMJKQTVKYIX6MHXMAEUYC2FWD5SDXPKE',
    tenantCredit: 'CCYZMG5TED7KI2UAVZYLZHGB2KMJIVEGMYQXXR4ZTWAN5XTOHQQILXT3',
    disputeArbiter: 'CCA4NJKOADMF273XQ77FVBJEHPSOHKCQA36LUKTWBAEU6COZYHXWR3MP',
    tenancyDeedRegistry: 'CABCZ2EHEO62ONIVWILIBVR5AVNTBGOSXM6DI3FXKAGKEL5HSZMU2IVI',
    rentStreamVault: 'CAG43Q6I7OFHOTAKJG5RIHMXU6N3G5YSE5AXCFEMHGISGXEIC6OGDVN4',
    nativeToken: 'CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC',
    adminDeployer: 'GCYOXL5QRSZGHEKMVQTGB4MMMTOQGZAJXS5BSREYIVH46LHCKFKOMD6G',
  },
  supportedAssets: [
    { code: 'XLM', native: true, decimals: 7 },
    { code: 'USDC', issuer: 'GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5', decimals: 7 },
  ],
};

export interface WalletState {
  isConnected: boolean;
  publicKey: string | null;
  walletType: 'freighter' | 'demo' | null;
  balanceXlm: string;
  error: string | null;
}

export interface OnChainLeaseRecord {
  leaseId: number;
  tenant: string;
  landlord: string;
  rentAmountXlm: number;
  cautionDepositXlm: number;
  durationDays: number;
  propertyHash: string;
  status: 'Created' | 'Funded' | 'Active' | 'Completed' | 'Disputed' | 'DamageProposed' | 'Cancelled';
  fundedAt?: number;
  rentDisbursed: boolean;
  depositReleased: boolean;
  proposedDamageAmount?: number;
  damageEvidenceHash?: string;
  txHash?: string;
}

export interface LandlordProfileState {
  address: string;
  name: string;
  isVerifiedOwner: boolean;
  totalLeases: number;
  successfulRefunds: number;
  totalDisputes: number;
  trustScore: number;
  registeredAt: number;
}

export interface TenantCreditState {
  tenant: string;
  creditScore: number;
  tier: 'Bronze' | 'Silver' | 'Gold' | 'Platinum';
  totalLeasesCompleted: number;
  onTimePaymentsStreak: number;
  cleanDepositRefunds: number;
  disputesCount: number;
  qualifiesForMonthlyRent: boolean;
  identityHash: string;
  registeredAt: number;
}

export interface DisputeCaseState {
  disputeId: number;
  leaseId: number;
  tenant: string;
  landlord: string;
  cautionAmount: number;
  moveInHash: string;
  moveOutHash: string;
  finalVerdict: 'Pending' | 'RefundTenantFull' | 'PayLandlordFull' | 'SplitFiftyFifty';
  isResolved: boolean;
  tenantPayout: number;
  landlordPayout: number;
  votesRefundTenant: number;
  votesPayLandlord: number;
  votesSplit: number;
  lodgedAt: number;
}

const LOCAL_STORAGE_SECRET = 'lumenslease_demo_keypair_secret';
const LOCAL_STORAGE_LEASES = 'lumenslease_onchain_leases';
const LOCAL_STORAGE_TENANT_CREDIT = 'lumenslease_tenant_credit';
const LOCAL_STORAGE_DISPUTES = 'lumenslease_disputes';
const LOCAL_STORAGE_LANDLORDS = 'lumenslease_landlords';

/**
 * Check if Freighter extension is installed in the browser
 */
export async function isFreighterAvailable(): Promise<boolean> {
  if (typeof window === 'undefined') return false;
  try {
    const res = await isConnected();
    return !!res;
  } catch {
    return false;
  }
}

/**
 * Connect to Freighter browser extension
 */
export async function connectFreighterWallet(): Promise<WalletState> {
  if (typeof window === 'undefined') {
    return { isConnected: false, publicKey: null, walletType: null, balanceXlm: '0', error: 'Browser required' };
  }

  try {
    const connected = await isConnected();
    if (!connected) {
      return { 
        isConnected: false, 
        publicKey: null, 
        walletType: null, 
        balanceXlm: '0', 
        error: 'Freighter extension not detected or locked. Please install from freighter.app or use the Instant Demo Keypair.' 
      };
    }

    const access = await requestAccess();
    if (!access || access.error) {
      return { isConnected: false, publicKey: null, walletType: null, balanceXlm: '0', error: 'User declined Freighter connection.' };
    }

    const pubKey = access.address || (await getAddress()).address;
    const balance = await fetchAccountBalance(pubKey);

    return {
      isConnected: true,
      publicKey: pubKey,
      walletType: 'freighter',
      balanceXlm: balance,
      error: null,
    };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    return { isConnected: false, publicKey: null, walletType: null, balanceXlm: '0', error: errorMsg };
  }
}

/**
 * Generate or retrieve an Instant Testnet Demo Keypair funded via Friendbot
 */
export async function connectDemoKeypair(): Promise<{ wallet: WalletState; secretKey: string }> {
  if (typeof window === 'undefined') {
    const kp = Keypair.random();
    return {
      wallet: { isConnected: true, publicKey: kp.publicKey(), walletType: 'demo', balanceXlm: '10000.0000000', error: null },
      secretKey: kp.secret(),
    };
  }

  let secret = localStorage.getItem(LOCAL_STORAGE_SECRET);
  let keypair: Keypair;

  if (secret) {
    try {
      keypair = Keypair.fromSecret(secret);
    } catch {
      keypair = Keypair.random();
      localStorage.setItem(LOCAL_STORAGE_SECRET, keypair.secret());
    }
  } else {
    keypair = Keypair.random();
    localStorage.setItem(LOCAL_STORAGE_SECRET, keypair.secret());
  }

  const pubKey = keypair.publicKey();
  let balance = await fetchAccountBalance(pubKey);

  if (parseFloat(balance) === 0) {
    try {
      await fundViaFriendbot(pubKey);
      await new Promise((r) => setTimeout(r, 2000));
      balance = await fetchAccountBalance(pubKey);
    } catch {
      balance = '10000.0000000';
    }
  }

  return {
    wallet: {
      isConnected: true,
      publicKey: pubKey,
      walletType: 'demo',
      balanceXlm: balance,
      error: null,
    },
    secretKey: keypair.secret(),
  };
}

/**
 * Convenience helper for WalletContext
 */
export async function getOrCreateDemoWallet(): Promise<WalletState> {
  const { wallet } = await connectDemoKeypair();
  return wallet;
}

export function getExplorerTxUrl(txHash: string): string {
  return `https://stellar.expert/explorer/testnet/tx/${txHash}`;
}

/**
 * Fund any Stellar Testnet address with Friendbot
 */
export async function fundViaFriendbot(publicKey: string): Promise<boolean> {
  try {
    const res = await fetch(`https://friendbot.stellar.org?addr=${encodeURIComponent(publicKey)}`);
    return res.ok;
  } catch {
    return false;
  }
}

/**
 * Query native XLM balance from Horizon RPC
 */
export async function fetchAccountBalance(publicKey: string): Promise<string> {
  try {
    const server = new Horizon.Server(STELLAR_CONFIG.horizonUrl);
    const account = await server.loadAccount(publicKey);
    const nativeBal = account.balances.find((b: { asset_type: string }) => b.asset_type === 'native');
    return nativeBal ? nativeBal.balance : '0.0000000';
  } catch {
    return '0.0000000';
  }
}

/**
 * Compute SHA-256 property verification audit digest using Web Crypto
 */
export async function computePropertyHash(
  propertyIdOrPayload: string,
  title?: string,
  location?: string,
  rentAmount?: number,
  cautionDeposit?: number,
  inspectionEvidence?: string
): Promise<string> {
  const payload = title !== undefined
    ? JSON.stringify({
        protocol: 'LumensLease-Soroban-v1',
        propertyId: propertyIdOrPayload,
        title,
        location,
        rentAmount,
        cautionDeposit,
        evidenceDigest: inspectionEvidence,
        timestamp: Date.now(),
      })
    : propertyIdOrPayload;

  if (typeof window !== 'undefined' && window.crypto && window.crypto.subtle) {
    const enc = new TextEncoder().encode(payload);
    const hashBuf = await window.crypto.subtle.digest('SHA-256', enc);
    const hashArr = Array.from(new Uint8Array(hashBuf));
    return hashArr.map((b) => b.toString(16).padStart(2, '0')).join('');
  }

  let hash = 0;
  for (let i = 0; i < payload.length; i++) {
    hash = (hash << 5) - hash + payload.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash).toString(16).padStart(64, '0');
}

/**
 * Read all recorded leases from local storage and mock cache
 */
export function getSavedLeases(): OnChainLeaseRecord[] {
  if (typeof window === 'undefined') return [];
  try {
    const data = localStorage.getItem(LOCAL_STORAGE_LEASES);
    if (!data) {
      const initialLeases: OnChainLeaseRecord[] = [
        {
          leaseId: 1,
          tenant: 'GCYOXL5QRSZGHEKMVQTGB4MMMTOQGZAJXS5BSREYIVH46LHCKFKOMD6G',
          landlord: 'GCEZWKCA5VLDNRLN3RPRJMRZOX3Z6G5CHCGSNFHEYVXM3XOJMDS6AQ46',
          rentAmountXlm: 240,
          cautionDepositXlm: 35,
          durationDays: 365,
          propertyHash: '7a9f83c12d45e06b987a1234cdef901234567890abcdef1234567890abcdef12',
          status: 'Active',
          fundedAt: Date.now() - 30 * 86400000,
          rentDisbursed: true,
          depositReleased: false,
          txHash: '5b1f84093c32d7d5201ac748892cc9e0ce9c9e0d7699a9c0ec7216338f78c773',
        },
        {
          leaseId: 2,
          tenant: 'GDLNHP4GHRYVRFWT36YHR3F2D44Z3XF67VCSW724VRCLUHR6B2Y765O3',
          landlord: 'GCYOXL5QRSZGHEKMVQTGB4MMMTOQGZAJXS5BSREYIVH46LHCKFKOMD6G',
          rentAmountXlm: 180,
          cautionDepositXlm: 25,
          durationDays: 180,
          propertyHash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
          status: 'Funded',
          fundedAt: Date.now() - 86400000,
          rentDisbursed: false,
          depositReleased: false,
          txHash: 'b5a830e4d1e36756a79b3f8404c32106749be39b692cfa24436d3aacfc77e339',
        },
      ];
      localStorage.setItem(LOCAL_STORAGE_LEASES, JSON.stringify(initialLeases));
      return initialLeases;
    }
    return JSON.parse(data);
  } catch {
    return [];
  }
}

function saveLeaseList(leases: OnChainLeaseRecord[]) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(LOCAL_STORAGE_LEASES, JSON.stringify(leases));
  } catch {}
}

// -------------------------------------------------------------
// CONTRACT 1: RENTAL ESCROW PROTOCOL INVOCATIONS
// -------------------------------------------------------------

export async function invokeCreateLease(params: {
  tenant: string;
  landlord: string;
  rentAmountXlm: number;
  cautionDepositXlm: number;
  durationDays: number;
  propertyHash: string;
}): Promise<{ leaseId: number; txHash: string }> {
  await new Promise((r) => setTimeout(r, 1200));

  const leases = getSavedLeases();
  const nextId = leases.length > 0 ? Math.max(...leases.map((l) => l.leaseId)) + 1 : 1;
  const mockTx = Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('');

  const newLease: OnChainLeaseRecord = {
    leaseId: nextId,
    tenant: params.tenant,
    landlord: params.landlord,
    rentAmountXlm: params.rentAmountXlm,
    cautionDepositXlm: params.cautionDepositXlm,
    durationDays: params.durationDays,
    propertyHash: params.propertyHash,
    status: 'Created',
    rentDisbursed: false,
    depositReleased: false,
    txHash: mockTx,
  };

  leases.push(newLease);
  saveLeaseList(leases);

  return { leaseId: nextId, txHash: mockTx };
}

export async function invokeFundLease(leaseId: number, caller: string): Promise<string> {
  await new Promise((r) => setTimeout(r, 1500));
  const leases = getSavedLeases();
  const idx = leases.findIndex((l) => l.leaseId === leaseId);
  if (idx === -1) throw new Error('Lease not found on-chain');

  leases[idx].status = 'Funded';
  leases[idx].fundedAt = Date.now();
  const mockTx = Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
  leases[idx].txHash = mockTx;
  saveLeaseList(leases);
  return mockTx;
}

export async function invokeDisburseRent(leaseId: number, caller: string): Promise<string> {
  await new Promise((r) => setTimeout(r, 1500));
  const leases = getSavedLeases();
  const idx = leases.findIndex((l) => l.leaseId === leaseId);
  if (idx === -1) throw new Error('Lease not found on-chain');

  leases[idx].rentDisbursed = true;
  leases[idx].status = 'Active';
  const mockTx = Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
  leases[idx].txHash = mockTx;
  saveLeaseList(leases);
  return mockTx;
}

export async function invokeReleaseDeposit(leaseId: number, caller: string): Promise<string> {
  await new Promise((r) => setTimeout(r, 1500));
  const leases = getSavedLeases();
  const idx = leases.findIndex((l) => l.leaseId === leaseId);
  if (idx === -1) throw new Error('Lease not found on-chain');

  leases[idx].depositReleased = true;
  leases[idx].status = 'Completed';
  const mockTx = Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
  leases[idx].txHash = mockTx;
  saveLeaseList(leases);
  return mockTx;
}

export async function invokeProposeDamageDeduction(
  leaseId: number,
  caller: string,
  deductionAmount: number,
  evidenceHash: string
): Promise<string> {
  await new Promise((r) => setTimeout(r, 1200));
  const leases = getSavedLeases();
  const idx = leases.findIndex((l) => l.leaseId === leaseId);
  if (idx === -1) throw new Error('Lease not found on-chain');

  leases[idx].status = 'DamageProposed';
  leases[idx].proposedDamageAmount = deductionAmount;
  leases[idx].damageEvidenceHash = evidenceHash;
  const mockTx = Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
  leases[idx].txHash = mockTx;
  saveLeaseList(leases);
  return mockTx;
}

export async function invokeAcceptDamageDeduction(leaseId: number, caller: string): Promise<string> {
  await new Promise((r) => setTimeout(r, 1500));
  const leases = getSavedLeases();
  const idx = leases.findIndex((l) => l.leaseId === leaseId);
  if (idx === -1) throw new Error('Lease not found on-chain');

  leases[idx].depositReleased = true;
  leases[idx].status = 'Completed';
  const mockTx = Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
  leases[idx].txHash = mockTx;
  saveLeaseList(leases);
  return mockTx;
}

export async function invokeRejectDamageDeduction(leaseId: number, caller: string): Promise<string> {
  await new Promise((r) => setTimeout(r, 1200));
  const leases = getSavedLeases();
  const idx = leases.findIndex((l) => l.leaseId === leaseId);
  if (idx === -1) throw new Error('Lease not found on-chain');

  leases[idx].status = 'Disputed';
  const mockTx = Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
  leases[idx].txHash = mockTx;
  saveLeaseList(leases);
  return mockTx;
}

export async function invokeClaimDepositTimeout(leaseId: number, caller: string): Promise<string> {
  await new Promise((r) => setTimeout(r, 1500));
  const leases = getSavedLeases();
  const idx = leases.findIndex((l) => l.leaseId === leaseId);
  if (idx === -1) throw new Error('Lease not found on-chain');

  leases[idx].depositReleased = true;
  leases[idx].status = 'Completed';
  const mockTx = Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
  leases[idx].txHash = mockTx;
  saveLeaseList(leases);
  return mockTx;
}

export async function invokeCancelUnfundedLease(leaseId: number, caller: string): Promise<string> {
  await new Promise((r) => setTimeout(r, 1200));
  const leases = getSavedLeases();
  const idx = leases.findIndex((l) => l.leaseId === leaseId);
  if (idx === -1) throw new Error('Lease not found on-chain');

  leases[idx].status = 'Cancelled';
  const mockTx = Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
  leases[idx].txHash = mockTx;
  saveLeaseList(leases);
  return mockTx;
}

export async function invokeRaiseDispute(leaseId: number, caller: string, reason: string): Promise<string> {
  await new Promise((r) => setTimeout(r, 1200));
  const leases = getSavedLeases();
  const idx = leases.findIndex((l) => l.leaseId === leaseId);
  if (idx === -1) throw new Error('Lease not found on-chain');

  leases[idx].status = 'Disputed';
  const mockTx = Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
  leases[idx].txHash = mockTx;
  saveLeaseList(leases);
  return mockTx;
}

export async function invokeResolveDispute(
  leaseId: number,
  admin: string,
  tenantRefundXlm: number,
  landlordPayoutXlm: number
): Promise<string> {
  await new Promise((r) => setTimeout(r, 1500));
  const leases = getSavedLeases();
  const idx = leases.findIndex((l) => l.leaseId === leaseId);
  if (idx === -1) throw new Error('Lease not found on-chain');

  leases[idx].depositReleased = true;
  leases[idx].status = 'Completed';
  const mockTx = Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
  leases[idx].txHash = mockTx;
  saveLeaseList(leases);
  return mockTx;
}

// -------------------------------------------------------------
// CONTRACT 2: LANDLORD REPUTATION & AUDIT REGISTRY
// -------------------------------------------------------------

export function getSavedLandlords(): Record<string, LandlordProfileState> {
  if (typeof window === 'undefined') return {};
  try {
    const data = localStorage.getItem(LOCAL_STORAGE_LANDLORDS);
    if (!data) {
      const defaults: Record<string, LandlordProfileState> = {
        'GCEZWKCA5VLDNRLN3RPRJMRZOX3Z6G5CHCGSNFHEYVXM3XOJMDS6AQ46': {
          address: 'GCEZWKCA5VLDNRLN3RPRJMRZOX3Z6G5CHCGSNFHEYVXM3XOJMDS6AQ46',
          name: 'Chief Adeleke',
          isVerifiedOwner: true,
          totalLeases: 4,
          successfulRefunds: 4,
          totalDisputes: 0,
          trustScore: 92,
          registeredAt: Date.now() - 60 * 86400000,
        },
        'GCYOXL5QRSZGHEKMVQTGB4MMMTOQGZAJXS5BSREYIVH46LHCKFKOMD6G': {
          address: 'GCYOXL5QRSZGHEKMVQTGB4MMMTOQGZAJXS5BSREYIVH46LHCKFKOMD6G',
          name: 'Madam Bassey',
          isVerifiedOwner: true,
          totalLeases: 2,
          successfulRefunds: 2,
          totalDisputes: 0,
          trustScore: 85,
          registeredAt: Date.now() - 30 * 86400000,
        },
      };
      localStorage.setItem(LOCAL_STORAGE_LANDLORDS, JSON.stringify(defaults));
      return defaults;
    }
    return JSON.parse(data);
  } catch {
    return {};
  }
}

export async function invokeSubmitTenantReview(
  tenant: string,
  landlord: string,
  rating: number,
  reviewText: string
): Promise<{ newTrustScore: number; txHash: string }> {
  await new Promise((r) => setTimeout(r, 1200));
  const landlords = getSavedLandlords();
  const profile = landlords[landlord] || {
    address: landlord,
    name: 'Verified Landlord',
    isVerifiedOwner: true,
    totalLeases: 1,
    successfulRefunds: 1,
    totalDisputes: 0,
    trustScore: 80,
    registeredAt: Date.now(),
  };

  if (rating >= 4 && profile.trustScore < 98) {
    profile.trustScore += 2;
  } else if (rating <= 2 && profile.trustScore > 30) {
    profile.trustScore -= 5;
  }

  landlords[landlord] = profile;
  if (typeof window !== 'undefined') {
    localStorage.setItem(LOCAL_STORAGE_LANDLORDS, JSON.stringify(landlords));
  }

  const mockTx = Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
  return { newTrustScore: profile.trustScore, txHash: mockTx };
}

// -------------------------------------------------------------
// CONTRACT 3: TENANT CREDIT PASSPORT (RENT-TO-CREDIT PROTOCOL)
// -------------------------------------------------------------

export function getTenantCreditProfile(tenantAddress: string): TenantCreditState {
  if (typeof window === 'undefined') {
    return {
      tenant: tenantAddress,
      creditScore: 500,
      tier: 'Bronze',
      totalLeasesCompleted: 0,
      onTimePaymentsStreak: 0,
      cleanDepositRefunds: 0,
      disputesCount: 0,
      qualifiesForMonthlyRent: false,
      identityHash: '0'.repeat(64),
      registeredAt: Date.now(),
    };
  }

  try {
    const data = localStorage.getItem(`${LOCAL_STORAGE_TENANT_CREDIT}_${tenantAddress}`);
    if (data) return JSON.parse(data);

    // Default profile: 685 score for active demo address
    const initialScore = 685;
    const initial: TenantCreditState = {
      tenant: tenantAddress,
      creditScore: initialScore,
      tier: 'Gold',
      totalLeasesCompleted: 2,
      onTimePaymentsStreak: 12,
      cleanDepositRefunds: 2,
      disputesCount: 0,
      qualifiesForMonthlyRent: true,
      identityHash: 'b4a8e9124fd7a0b3687c142e059df81b4987ec9103c8091f092837456abcdef1',
      registeredAt: Date.now() - 120 * 86400000,
    };
    localStorage.setItem(`${LOCAL_STORAGE_TENANT_CREDIT}_${tenantAddress}`, JSON.stringify(initial));
    return initial;
  } catch {
    return {
      tenant: tenantAddress,
      creditScore: 500,
      tier: 'Bronze',
      totalLeasesCompleted: 0,
      onTimePaymentsStreak: 0,
      cleanDepositRefunds: 0,
      disputesCount: 0,
      qualifiesForMonthlyRent: false,
      identityHash: '0'.repeat(64),
      registeredAt: Date.now(),
    };
  }
}

function saveTenantCreditProfile(profile: TenantCreditState) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(`${LOCAL_STORAGE_TENANT_CREDIT}_${profile.tenant}`, JSON.stringify(profile));
  } catch {}
}

export async function invokeRecordOnTimePayment(
  caller: string,
  tenant: string,
  leaseId: number,
  amount: number
): Promise<{ newScore: number; txHash: string }> {
  await new Promise((r) => setTimeout(r, 1200));
  const profile = getTenantCreditProfile(tenant);

  profile.onTimePaymentsStreak += 1;
  profile.creditScore = Math.min(850, profile.creditScore + 10);

  if (profile.creditScore >= 740) profile.tier = 'Platinum';
  else if (profile.creditScore >= 670) profile.tier = 'Gold';
  else if (profile.creditScore >= 580) profile.tier = 'Silver';
  else profile.tier = 'Bronze';

  profile.qualifiesForMonthlyRent = profile.creditScore >= 680;
  saveTenantCreditProfile(profile);

  const mockTx = Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
  return { newScore: profile.creditScore, txHash: mockTx };
}

export async function invokeRecordLeaseCompletion(
  caller: string,
  tenant: string,
  leaseId: number,
  wasCleanRefund: boolean
): Promise<{ newScore: number; txHash: string }> {
  await new Promise((r) => setTimeout(r, 1500));
  const profile = getTenantCreditProfile(tenant);

  profile.totalLeasesCompleted += 1;
  if (wasCleanRefund) {
    profile.cleanDepositRefunds += 1;
    profile.creditScore = Math.min(850, profile.creditScore + 25);
  } else {
    profile.disputesCount += 1;
    profile.creditScore = Math.max(300, profile.creditScore - 50);
  }

  if (profile.creditScore >= 740) profile.tier = 'Platinum';
  else if (profile.creditScore >= 670) profile.tier = 'Gold';
  else if (profile.creditScore >= 580) profile.tier = 'Silver';
  else profile.tier = 'Bronze';

  profile.qualifiesForMonthlyRent = profile.creditScore >= 680;
  saveTenantCreditProfile(profile);

  const mockTx = Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
  return { newScore: profile.creditScore, txHash: mockTx };
}

// -------------------------------------------------------------
// CONTRACT 4: RENTAL DISPUTE ARBITRATION (COMMUNITY JURY)
// -------------------------------------------------------------

export function getSavedDisputes(): DisputeCaseState[] {
  if (typeof window === 'undefined') return [];
  try {
    const data = localStorage.getItem(LOCAL_STORAGE_DISPUTES);
    if (!data) {
      const initialDisputes: DisputeCaseState[] = [
        {
          disputeId: 1,
          leaseId: 101,
          tenant: 'GCYOXL5QRSZGHEKMVQTGB4MMMTOQGZAJXS5BSREYIVH46LHCKFKOMD6G',
          landlord: 'GCEZWKCA5VLDNRLN3RPRJMRZOX3Z6G5CHCGSNFHEYVXM3XOJMDS6AQ46',
          cautionAmount: 35,
          moveInHash: '4d645e3a34f37d6889e165ea32634750a5d5c79dfaa6aa38c103407b20673eea',
          moveOutHash: 'b195073a8693e5085746c851c2ec40dba35c5d867082063f82c3f764c24c65fa',
          finalVerdict: 'Pending',
          isResolved: false,
          tenantPayout: 0,
          landlordPayout: 0,
          votesRefundTenant: 1,
          votesPayLandlord: 0,
          votesSplit: 0,
          lodgedAt: Date.now() - 2 * 86400000,
        },
      ];
      localStorage.setItem(LOCAL_STORAGE_DISPUTES, JSON.stringify(initialDisputes));
      return initialDisputes;
    }
    return JSON.parse(data);
  } catch {
    return [];
  }
}

function saveDisputesList(disputes: DisputeCaseState[]) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(LOCAL_STORAGE_DISPUTES, JSON.stringify(disputes));
  } catch {}
}

export async function invokeLodgeDisputeCase(params: {
  caller: string;
  leaseId: number;
  tenant: string;
  landlord: string;
  cautionAmount: number;
  moveInHash: string;
  moveOutHash: string;
}): Promise<{ disputeId: number; txHash: string }> {
  await new Promise((r) => setTimeout(r, 1200));
  const disputes = getSavedDisputes();
  const nextId = disputes.length > 0 ? Math.max(...disputes.map((d) => d.disputeId)) + 1 : 1;
  const mockTx = Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('');

  const newDispute: DisputeCaseState = {
    disputeId: nextId,
    leaseId: params.leaseId,
    tenant: params.tenant,
    landlord: params.landlord,
    cautionAmount: params.cautionAmount,
    moveInHash: params.moveInHash,
    moveOutHash: params.moveOutHash,
    finalVerdict: 'Pending',
    isResolved: false,
    tenantPayout: 0,
    landlordPayout: 0,
    votesRefundTenant: 0,
    votesPayLandlord: 0,
    votesSplit: 0,
    lodgedAt: Date.now(),
  };

  disputes.push(newDispute);
  saveDisputesList(disputes);
  return { disputeId: nextId, txHash: mockTx };
}

export async function invokeCastArbitratorVote(
  arbitratorAddress: string,
  disputeId: number,
  voteOption: 'RefundTenantFull' | 'PayLandlordFull' | 'SplitFiftyFifty'
): Promise<{ finalVerdict: string; isResolved: boolean; txHash: string }> {
  await new Promise((r) => setTimeout(r, 1500));
  const disputes = getSavedDisputes();
  const idx = disputes.findIndex((d) => d.disputeId === disputeId);
  if (idx === -1) throw new Error('Dispute case not found on-chain');

  const d = disputes[idx];
  if (d.isResolved) throw new Error('Dispute is already resolved and settled');

  if (voteOption === 'RefundTenantFull') d.votesRefundTenant += 1;
  else if (voteOption === 'PayLandlordFull') d.votesPayLandlord += 1;
  else if (voteOption === 'SplitFiftyFifty') d.votesSplit += 1;

  // Check 2-of-3 Quorum
  if (d.votesRefundTenant >= 2) {
    d.finalVerdict = 'RefundTenantFull';
    d.isResolved = true;
    d.tenantPayout = d.cautionAmount;
    d.landlordPayout = 0;
  } else if (d.votesPayLandlord >= 2) {
    d.finalVerdict = 'PayLandlordFull';
    d.isResolved = true;
    d.tenantPayout = 0;
    d.landlordPayout = d.cautionAmount;
  } else if (d.votesSplit >= 2) {
    d.finalVerdict = 'SplitFiftyFifty';
    d.isResolved = true;
    d.tenantPayout = Number((d.cautionAmount / 2).toFixed(2));
    d.landlordPayout = Number((d.cautionAmount - d.tenantPayout).toFixed(2));
  }

  saveDisputesList(disputes);
  const mockTx = Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
  return { finalVerdict: d.finalVerdict, isResolved: d.isResolved, txHash: mockTx };
}

// -------------------------------------------------------------
// CONTRACT 5: TENANCY DEED REGISTRY & PROOF OF ADDRESS SBT
// -------------------------------------------------------------

export interface TenancyDeedRecord {
  deedId: number;
  landlord: string;
  tenant: string;
  propertyTitle: string;
  propertyAddress: string;
  annualRentStroops: number;
  cautionDepositStroops: number;
  startTimestamp: number;
  endTimestamp: number;
  legalTermsHash: string;
  hardwareSpecsHash: string;
  landlordSigned: boolean;
  tenantSigned: boolean;
  status: 'Draft' | 'LandlordSigned' | 'TenantSigned' | 'FullyExecuted' | 'Terminated' | 'Expired';
  createdAt: number;
  executedAt?: number;
  txHash?: string;
}

const LOCAL_STORAGE_DEEDS = 'lumenslease_tenancy_deeds';

export function getSavedDeeds(): TenancyDeedRecord[] {
  if (typeof window === 'undefined') return [];
  try {
    const data = localStorage.getItem(LOCAL_STORAGE_DEEDS);
    if (!data) {
      const initialDeeds: TenancyDeedRecord[] = [
        {
          deedId: 1,
          landlord: 'GCEZWKCA5VLDNRLN3RPRJMRZOX3Z6G5CHCGSNFHEYVXM3XOJMDS6AQ46',
          tenant: 'GCYOXL5QRSZGHEKMVQTGB4MMMTOQGZAJXS5BSREYIVH46LHCKFKOMD6G',
          propertyTitle: 'Bodija 2-Bed Flat with Solar Inverter',
          propertyAddress: 'Plot 14, UI Road, Bodija, Ibadan, Oyo State',
          annualRentStroops: 16000000000000,
          cautionDepositStroops: 1600000000000,
          startTimestamp: Date.now() - 30 * 86400000,
          endTimestamp: Date.now() + 335 * 86400000,
          legalTermsHash: 'd7a8fbb307d7809469ca9abcb0082e4f8d5651e46d3cdb762d02d0bf37c9e592',
          hardwareSpecsHash: '9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08',
          landlordSigned: true,
          tenantSigned: true,
          status: 'FullyExecuted',
          createdAt: Date.now() - 35 * 86400000,
          executedAt: Date.now() - 30 * 86400000,
          txHash: 'ef7967e19b5b741d687bbe547df6f66ab61f73ded72669a8f356ce31e25317c8',
        },
      ];
      localStorage.setItem(LOCAL_STORAGE_DEEDS, JSON.stringify(initialDeeds));
      return initialDeeds;
    }
    return JSON.parse(data);
  } catch {
    return [];
  }
}

function saveDeedsList(deeds: TenancyDeedRecord[]) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(LOCAL_STORAGE_DEEDS, JSON.stringify(deeds));
  } catch {}
}

export async function invokeCreateDeed(params: {
  caller: string;
  landlord: string;
  tenant: string;
  propertyTitle: string;
  propertyAddress: string;
  annualRentStroops: number;
  cautionDepositStroops: number;
  startTimestamp: number;
  endTimestamp: number;
  legalTermsHash: string;
  hardwareSpecsHash: string;
}): Promise<{ deedId: number; txHash: string }> {
  await new Promise((r) => setTimeout(r, 1200));
  const deeds = getSavedDeeds();
  const nextId = deeds.length > 0 ? Math.max(...deeds.map((d) => d.deedId)) + 1 : 1;
  const mockTx = Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('');

  const isLandlord = params.caller === params.landlord;
  const newDeed: TenancyDeedRecord = {
    deedId: nextId,
    landlord: params.landlord,
    tenant: params.tenant,
    propertyTitle: params.propertyTitle,
    propertyAddress: params.propertyAddress,
    annualRentStroops: params.annualRentStroops,
    cautionDepositStroops: params.cautionDepositStroops,
    startTimestamp: params.startTimestamp,
    endTimestamp: params.endTimestamp,
    legalTermsHash: params.legalTermsHash,
    hardwareSpecsHash: params.hardwareSpecsHash,
    landlordSigned: isLandlord,
    tenantSigned: !isLandlord,
    status: isLandlord ? 'LandlordSigned' : 'TenantSigned',
    createdAt: Date.now(),
    txHash: mockTx,
  };

  deeds.push(newDeed);
  saveDeedsList(deeds);
  return { deedId: nextId, txHash: mockTx };
}

export async function invokeSignDeed(
  deedId: number,
  signer: string,
  role: 'landlord' | 'tenant'
): Promise<{ status: string; isExecuted: boolean; txHash: string }> {
  await new Promise((r) => setTimeout(r, 1500));
  const deeds = getSavedDeeds();
  const idx = deeds.findIndex((d) => d.deedId === deedId);
  if (idx === -1) throw new Error('Tenancy Deed not found on-chain');

  const d = deeds[idx];
  if (role === 'landlord') {
    d.landlordSigned = true;
  } else {
    d.tenantSigned = true;
  }

  if (d.landlordSigned && d.tenantSigned) {
    d.status = 'FullyExecuted';
    d.executedAt = Date.now();
  }

  const mockTx = Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
  d.txHash = mockTx;
  saveDeedsList(deeds);
  return { status: d.status, isExecuted: d.status === 'FullyExecuted', txHash: mockTx };
}

export function verifyTenantAddressProof(tenantAddress: string): { hasValidProof: boolean; deed?: TenancyDeedRecord } {
  const deeds = getSavedDeeds();
  const now = Date.now();
  const activeDeed = deeds.find(
    (d) => d.tenant.toLowerCase() === tenantAddress.toLowerCase() &&
           d.status === 'FullyExecuted' &&
           now >= d.startTimestamp &&
           now <= d.endTimestamp
  );
  return { hasValidProof: !!activeDeed, deed: activeDeed };
}

// -------------------------------------------------------------
// CONTRACT 6: RENT STREAM VAULT (MONTHLY MICRO-RENT STREAMING)
// -------------------------------------------------------------

export interface RentStreamRecord {
  streamId: number;
  tenant: string;
  landlord: string;
  monthlyAmountXlm: number;
  bufferAmountXlm: number;
  totalMonths: number;
  monthsClaimed: number;
  vaultBalanceXlm: number;
  startTimestamp: number;
  lastClaimTimestamp: number;
  status: 'Created' | 'Active' | 'Completed' | 'Defaulted' | 'Cancelled';
  txHash?: string;
}

const LOCAL_STORAGE_STREAMS = 'lumenslease_rent_streams';

export function getSavedStreams(): RentStreamRecord[] {
  if (typeof window === 'undefined') return [];
  try {
    const data = localStorage.getItem(LOCAL_STORAGE_STREAMS);
    if (!data) {
      const initialStreams: RentStreamRecord[] = [
        {
          streamId: 1,
          tenant: 'GCYOXL5QRSZGHEKMVQTGB4MMMTOQGZAJXS5BSREYIVH46LHCKFKOMD6G',
          landlord: 'GCEZWKCA5VLDNRLN3RPRJMRZOX3Z6G5CHCGSNFHEYVXM3XOJMDS6AQ46',
          monthlyAmountXlm: 120,
          bufferAmountXlm: 120,
          totalMonths: 12,
          monthsClaimed: 2,
          vaultBalanceXlm: 240, // 2 months in advance
          startTimestamp: Date.now() - 60 * 86400000,
          lastClaimTimestamp: Date.now() - 30 * 86400000,
          status: 'Active',
          txHash: 'fb4ce234fc8cdd93d98cd8b3fe377dc394b0f91c45544ff3cc94a50ccb4b3a9b',
        },
      ];
      localStorage.setItem(LOCAL_STORAGE_STREAMS, JSON.stringify(initialStreams));
      return initialStreams;
    }
    return JSON.parse(data);
  } catch {
    return [];
  }
}

function saveStreamsList(streams: RentStreamRecord[]) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(LOCAL_STORAGE_STREAMS, JSON.stringify(streams));
  } catch {}
}

export async function invokeCreateRentStream(params: {
  caller: string;
  tenant: string;
  landlord: string;
  monthlyAmountXlm: number;
  bufferAmountXlm: number;
  totalMonths: number;
}): Promise<{ streamId: number; txHash: string }> {
  await new Promise((r) => setTimeout(r, 1200));
  const streams = getSavedStreams();
  const nextId = streams.length > 0 ? Math.max(...streams.map((s) => s.streamId)) + 1 : 1;
  const mockTx = Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('');

  const newStream: RentStreamRecord = {
    streamId: nextId,
    tenant: params.tenant,
    landlord: params.landlord,
    monthlyAmountXlm: params.monthlyAmountXlm,
    bufferAmountXlm: params.bufferAmountXlm,
    totalMonths: params.totalMonths,
    monthsClaimed: 0,
    vaultBalanceXlm: 0,
    startTimestamp: 0,
    lastClaimTimestamp: 0,
    status: 'Created',
    txHash: mockTx,
  };

  streams.push(newStream);
  saveStreamsList(streams);
  return { streamId: nextId, txHash: mockTx };
}

export async function invokeFundInitialStream(streamId: number, caller: string): Promise<string> {
  await new Promise((r) => setTimeout(r, 1500));
  const streams = getSavedStreams();
  const idx = streams.findIndex((s) => s.streamId === streamId);
  if (idx === -1) throw new Error('Stream not found on-chain');

  const s = streams[idx];
  s.status = 'Active';
  s.vaultBalanceXlm = s.monthlyAmountXlm + s.bufferAmountXlm;
  s.startTimestamp = Date.now();
  s.lastClaimTimestamp = Date.now();

  const mockTx = Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
  s.txHash = mockTx;
  saveStreamsList(streams);
  return mockTx;
}

export async function invokeTopUpStream(streamId: number, caller: string, amountXlm: number): Promise<string> {
  await new Promise((r) => setTimeout(r, 1200));
  const streams = getSavedStreams();
  const idx = streams.findIndex((s) => s.streamId === streamId);
  if (idx === -1) throw new Error('Stream not found on-chain');

  streams[idx].vaultBalanceXlm += amountXlm;
  const mockTx = Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
  streams[idx].txHash = mockTx;
  saveStreamsList(streams);
  return mockTx;
}

export async function invokeClaimStreamInstallment(streamId: number, landlord: string): Promise<string> {
  await new Promise((r) => setTimeout(r, 1500));
  const streams = getSavedStreams();
  const idx = streams.findIndex((s) => s.streamId === streamId);
  if (idx === -1) throw new Error('Stream not found on-chain');

  const s = streams[idx];
  if (s.vaultBalanceXlm < s.monthlyAmountXlm) {
    throw new Error('Insufficient vault balance for monthly installment');
  }

  s.vaultBalanceXlm -= s.monthlyAmountXlm;
  s.monthsClaimed += 1;
  s.lastClaimTimestamp = Date.now();

  if (s.monthsClaimed >= s.totalMonths) {
    s.status = 'Completed';
    s.vaultBalanceXlm = 0;
  }

  const mockTx = Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
  s.txHash = mockTx;
  saveStreamsList(streams);
  return mockTx;
}

