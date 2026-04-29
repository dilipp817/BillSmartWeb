// Standard API success response wrapper.
// `data` is omitted on error responses (NON_NULL Jackson config).
export interface ApiResponse<T> {
  success: true;
  data: T;
  message?: string;
}

// Standard API error response wrapper.
// `data` and `message` are omitted on error responses.
export interface ApiErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details: string | null;
  };
}

// Union for exhaustive handling at call sites when needed.
export type ApiResult<T> = ApiResponse<T> | ApiErrorResponse;
