export type EntityId = string;

export interface ApiResponse<TData> {
  data: TData;
  message?: string;
}

export interface PaginatedResult<TItem> {
  items: TItem[];
  total: number;
  page: number;
  pageSize: number;
}

export type AsyncStatus = "idle" | "loading" | "success" | "error";
