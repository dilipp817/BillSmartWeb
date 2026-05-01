import { TableStatus } from "@/constants";

/**
 * Valid manual status transitions for each table status (T-05).
 *
 * These are the transitions a staff/manager/admin user can trigger manually
 * from the operational table grid. The backend enforces its own rules too —
 * this map only drives which options are shown in the UI.
 *
 * Transition rationale:
 *  AVAILABLE    → RESERVED (call-ahead reservation), OCCUPIED (walk-in seated manually), MAINTENANCE (out of service)
 *  OCCUPIED     → CLEANING (customer left — needs clean), AVAILABLE (direct clear, e.g. wrong assignment)
 *  RESERVED     → AVAILABLE (reservation cancelled), OCCUPIED (reservation arrived)
 *  CLEANING     → AVAILABLE (cleaning done)
 *  MAINTENANCE  → AVAILABLE (fixed), CLEANING (fixed but needs clean)
 */
export const VALID_TRANSITIONS: Record<TableStatus, TableStatus[]> = {
  [TableStatus.AVAILABLE]: [TableStatus.RESERVED, TableStatus.OCCUPIED, TableStatus.MAINTENANCE],
  [TableStatus.OCCUPIED]: [TableStatus.CLEANING, TableStatus.AVAILABLE],
  [TableStatus.RESERVED]: [TableStatus.AVAILABLE, TableStatus.OCCUPIED],
  [TableStatus.CLEANING]: [TableStatus.AVAILABLE],
  [TableStatus.MAINTENANCE]: [TableStatus.AVAILABLE, TableStatus.CLEANING],
};

export const TABLE_STATUS_LABEL: Record<TableStatus, string> = {
  [TableStatus.AVAILABLE]: "Available",
  [TableStatus.OCCUPIED]: "Occupied",
  [TableStatus.RESERVED]: "Reserved",
  [TableStatus.CLEANING]: "Cleaning",
  [TableStatus.MAINTENANCE]: "Maintenance",
};

/**
 * Returns the valid target statuses a table can transition to from its current status.
 * Returns an empty array if no manual transitions are available.
 */
export function getValidTransitions(currentStatus: TableStatus): TableStatus[] {
  return VALID_TRANSITIONS[currentStatus] ?? [];
}
