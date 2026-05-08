export enum OrderStatus {
  PENDING = "PENDING",
  IN_PROGRESS = "IN_PROGRESS",
  HOLD = "HOLD",
  COMPLETED = "COMPLETED",
  DELIVERED = "DELIVERED",
  CANCELLED = "CANCELLED",
}

export enum OrderItemStatus {
  PENDING = "PENDING",
  IN_PROGRESS = "IN_PROGRESS",
  READY = "READY",
  SERVED = "SERVED",
  CANCELLED = "CANCELLED",
}

export enum OrderType {
  DINE_IN = "DINE_IN",
  TAKEAWAY = "TAKEAWAY",
  DELIVERY = "DELIVERY",
}

export enum TableStatus {
  AVAILABLE = "AVAILABLE",
  OCCUPIED = "OCCUPIED",
  RESERVED = "RESERVED",
  CLEANING = "CLEANING",
  MAINTENANCE = "MAINTENANCE",
}

export enum BillStatus {
  ISSUED = "ISSUED",
  PARTIAL = "PARTIAL",
  PAID = "PAID",
  CANCELLED = "CANCELLED",
}

export enum PaymentStatus {
  PENDING = "PENDING",
  SUCCESS = "SUCCESS",
  FAILED = "FAILED",
  REFUNDED = "REFUNDED",
}

export enum PaymentMethod {
  CASH = "CASH",
  CARD = "CARD",
  UPI = "UPI",
  WALLET = "WALLET",
}

export enum UserRole {
  STAFF = "staff",
  MANAGER = "manager",
  ADMIN = "admin",
}

export enum OfflineSyncStatus {
  PENDING = "PENDING",
  SYNCING = "SYNCING",
  SYNCED = "SYNCED",
  FAILED = "FAILED",
}

export enum Flavor {
  SMART_POS = "smartPos",
  JEVNAR_SWEETS = "jevnarSweets",
}

export enum AppEnv {
  DEV = "dev",
  UAT = "uat",
  PROD = "prod",
}
