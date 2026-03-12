export type Role = 'USER' | 'ADMIN';

export interface User {
  id: string;
  email: string;
  name: string;
  role: Role;
  addresses?: Address[];
  upiDetails?: UPIDetail[];
  cardDetails?: CardDetail[];
}

export interface Address {
  id: string;
  firstName: string;
  lastName: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  isDefault: boolean;
}

export interface UPIDetail {
  id: string;
  upiId: string;
  name: string;
  isDefault: boolean;
}

export interface CardDetail {
  id: string;
  last4: string;
  brand: string;
  expMonth: number;
  expYear: number;
  holderName: string;
  isDefault: boolean;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  category: string;
  subCategory?: string;
  company: string;
  stock: number;
  rating?: number;
  reviewCount?: number;
  createdAt: string;
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
  status: 'PENDING' | 'PAID' | 'CANCELLED';
  createdAt: string;
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

export type SortOption = 'latest' | 'price-low-high' | 'price-high-low' | 'top-rated' | 'most-popular';
