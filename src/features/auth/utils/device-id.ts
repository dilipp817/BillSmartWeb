import { DEVICE_ID_KEY } from "@/constants";

/**
 * Returns a stable browser-local device identifier.
 *
 * On first call: generates a UUID v4, persists it to localStorage, and returns it.
 * On subsequent calls: returns the stored value.
 *
 * This is NOT a security token — it is only used by the backend for device
 * tracking / analytics. localStorage is appropriate here.
 */
export function getOrCreateDeviceId(): string {
  const existing = localStorage.getItem(DEVICE_ID_KEY);
  if (existing) return existing;

  const id = crypto.randomUUID();
  localStorage.setItem(DEVICE_ID_KEY, id);
  return id;
}
