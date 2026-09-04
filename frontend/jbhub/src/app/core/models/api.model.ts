export interface ApiMeta {
  total:      number;
  page:       number;
  limit:      number;
  totalPages: number;
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
  meta?: ApiMeta;
}