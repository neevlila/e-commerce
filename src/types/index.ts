export type Role = 'USER' | 'ADMIN';

export interface User {
  id: string;
  email: string;
  name: string;
  role: Role;
}

export interface Review {
  id: string;
  userId: string;
  userName: string;
  productId: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  category: string;
  subCategory?: string; // Added for Clothes filtering
  company: string; // Brand / Company name
  stock: number;
  createdAt: string;
  rating?: number;
  reviewCount?: number;
}

export interface CartItem extends Product {
  quantity: number;
  size?: string;
}

export interface Order {
  id: string;
  userId: string;
  items: CartItem[];
  total: number;
  status: 'PENDING' | 'PAID' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
  createdAt: string;
}

export interface AuthResponse {
  user: User;
  session: any;
}
