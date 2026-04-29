// Standard paginated response shape (Spring Data Page).
// Used for paginated list endpoints (foods, orders, etc.).
export interface PaginatedResponse<T> {
  content: T[];
  page: number;
  size: number;
  total_elements: number;
  total_pages: number;
}
