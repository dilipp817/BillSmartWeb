import { TableStatus } from "@/constants";

// Full table response — returned by GET /{id}, PUT /{id}, PATCH /{id}/status, GET /occupied, GET /status/{status}
export interface TableDto {
  id: number;
  restaurant_id: number;
  table_number: string;
  floor: number;
  capacity: number;
  status: TableStatus;
  current_order_id: number | null;
  last_occupied_at: string | null;
  created_at: string;
  updated_at: string;
  version: number;
}

// Lightweight shape returned by GET /available — only these four fields
export interface AvailableTableDto {
  id: number;
  table_number: string;
  capacity: number;
  status: TableStatus;
}

// Wrapper returned by GET / (list all tables)
export interface TableListResponse {
  tables: TableDto[];
  total: number;
  status: string;
}

// Request body for POST / (create) and PUT /{id} (update)
export interface CreateTableRequest {
  table_number: string;
  capacity: number;
  floor: number;
  status?: TableStatus;
}

// Alias — update uses the same shape as create
export type UpdateTableRequest = CreateTableRequest;
