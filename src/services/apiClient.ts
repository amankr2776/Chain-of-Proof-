/**
 * Chain of Proof - API Client Interceptor
 * Module 1: Automatically attaches 'X-Actor-Address' header with current role's wallet address
 * to every backend/network request for field-level RBAC enforcement.
 */

import { useAppStore } from '../store/useAppStore';
import { ROLE_CONFIGS } from '../data/initialMockData';

export async function apiFetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
  const currentRole = useAppStore.getState().currentRole;
  const roleConfig = ROLE_CONFIGS[currentRole];
  const walletAddress = roleConfig?.walletAddress || '0xANONYMOUS_UNVERIFIED_ACTOR';

  const headers = new Headers(init?.headers || {});
  headers.set('X-Actor-Address', walletAddress);
  headers.set('X-Actor-Role', currentRole);
  headers.set('Content-Type', 'application/json');

  const modifiedInit: RequestInit = {
    ...init,
    headers,
  };

  return fetch(input, modifiedInit);
}
