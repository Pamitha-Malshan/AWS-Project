export interface Product {
  code: string;
  name: string;
  quantity: number;
  price: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: string[];
}
