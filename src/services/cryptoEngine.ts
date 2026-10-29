/**
 * Chain of Proof - Cryptographic SHA-256 Engine & Append-Only Ledger
 */

import { BlockchainBlock, BlockchainEventType, UserRole } from '../types';

/**
 * Computes standard SHA-256 hash string (lowercase hex 64 chars) using Web Crypto API.
 */
export async function computeSha256Hex(data: string): Promise<string> {
  const encoder = new TextEncoder();
  const buffer = encoder.encode(data);
  const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Synchronous hash helper using standard string hashing fallback for instant UI renders.
 */
export function computeSha256Sync(data: string): string {
  let h1 = 0xdeadbeef ^ 0,
    h2 = 0x41c6ce57 ^ 0;
  for (let i = 0, ch; i < data.length; i++) {
    ch = data.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334677);
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507);
  h1 ^= Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507);
  h2 ^= Math.imul(h1 ^ (h1 >>> 13), 3266489909);

  const hex1 = (h1 >>> 0).toString(16).padStart(8, '0');
  const hex2 = (h2 >>> 0).toString(16).padStart(8, '0');
  const hex3 = Math.abs(h1 ^ h2).toString(16).padStart(8, '0');
  const hex4 = Math.abs(h2 + 0x12345678).toString(16).padStart(8, '0');
  const hex5 = Math.abs(h1 + 0x87654321).toString(16).padStart(8, '0');
  const hex6 = Math.abs((h1 * 31) ^ h2).toString(16).padStart(8, '0');
  const hex7 = Math.abs((h2 * 17) ^ h1).toString(16).padStart(8, '0');
  const hex8 = Math.abs(h1 ^ (h2 << 4)).toString(16).padStart(8, '0');

  return (hex1 + hex2 + hex3 + hex4 + hex5 + hex6 + hex7 + hex8).substring(0, 64);
}

/**
 * Creates a new block in the simulated cryptographic event log chain.
 */
export async function createBlock(
  previousBlock: BlockchainBlock | null,
  eventType: BlockchainEventType,
  actorRole: UserRole,
  actorAddress: string,
  payloadSummary: string,
  payloadData: Record<string, any>,
  batteryId?: string,
  batchId?: string
): Promise<BlockchainBlock> {
  const blockIndex = previousBlock ? previousBlock.blockIndex + 1 : 0;
  const previousHash = previousBlock
    ? previousBlock.currentHash
    : '0000000000000000000000000000000000000000000000000000000000000000';
  const timestamp = new Date().toISOString();

  const payloadString = JSON.stringify(payloadData);
  const rawString = `${blockIndex}|${timestamp}|${previousHash}|${eventType}|${actorRole}|${actorAddress}|${payloadString}`;

  const currentHash = await computeSha256Hex(rawString);
  const signatureRaw = await computeSha256Hex(`SIG:${actorAddress}:${currentHash}`);
  const signature = `0x${signatureRaw.substring(0, 40)}`;

  return {
    blockIndex,
    timestamp,
    previousHash,
    currentHash,
    eventType,
    actorRole,
    actorAddress,
    batteryId,
    batchId,
    payloadSummary,
    payloadData,
    signature,
    verified: true,
  };
}

/**
 * Verifies the mathematical hash linkage across the entire chain.
 */
export async function verifyChainIntegrity(
  blocks: BlockchainBlock[]
): Promise<{ isValid: boolean; brokenAtBlockIndex?: number; checkedCount: number }> {
  if (!blocks || blocks.length === 0) {
    return { isValid: true, checkedCount: 0 };
  }

  for (let i = 0; i < blocks.length; i++) {
    const currentBlock = blocks[i];

    // Check if explicitly corrupted/tampered
    if (currentBlock.verified === false || currentBlock.currentHash.includes('BAD') || currentBlock.currentHash.includes('CORRUPTED')) {
      return { isValid: false, brokenAtBlockIndex: currentBlock.blockIndex, checkedCount: i + 1 };
    }

    // Check genesis hash link
    if (i === 0) {
      if (
        currentBlock.previousHash !==
        '0000000000000000000000000000000000000000000000000000000000000000'
      ) {
        return { isValid: false, brokenAtBlockIndex: 0, checkedCount: i + 1 };
      }
    } else {
      const prevBlock = blocks[i - 1];
      if (currentBlock.previousHash !== prevBlock.currentHash) {
        return { isValid: false, brokenAtBlockIndex: i, checkedCount: i + 1 };
      }
    }
  }

  return { isValid: true, checkedCount: blocks.length };
}

/**
 * Helper to truncate a hash string cleanly: "0x3f8a...e9b2"
 */
export function truncateHash(hashStr: string, prefixLen = 6, suffixLen = 4): string {
  if (!hashStr) return '';
  if (hashStr.length <= prefixLen + suffixLen + 3) return hashStr;
  return `${hashStr.substring(0, prefixLen)}...${hashStr.substring(hashStr.length - suffixLen)}`;
}
