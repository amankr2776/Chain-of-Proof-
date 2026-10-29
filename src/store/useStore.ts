/**
 * Chain of Proof - Store Export Alias
 * Re-exports useAppStore as useStore and useAppStore for backwards compatibility.
 */

import { useAppStore } from './useAppStore';

export const useStore = useAppStore;
export { useAppStore };
export default useAppStore;
