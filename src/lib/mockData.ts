import { Product } from '../types';

const id = (i: number) => `static-prod-${i}`;

export const MOCK_PRODUCTS: Product[] = [
  // --- ELECTRONICS (Includes Smartwatches now) ---
  {
    id: id(1),
    name: 'MacBook Pro M3 Max',
    description: 'The most powerful MacBook Pro ever. Blazing fast performance with the M3 Max chip.',
    price: 319900,
    imageUrl: 'https://i.ibb.co/j94pnF7G/download.jpg',
    category: 'Electronics',
    stock: 10,
    rating: 4.8,
    reviewCount: 124,
    createdAt: new Date().toISOString()
  },
  {
    id: id(2),
    name: 'Apple Watch Ultra 2',
    description: 'The most rugged and capable Apple Watch. Designed for endurance, exploration, and adventure.',
    price: 89900,
    imageUrl: 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=800&q=80',
    category: 'Electronics',
    stock: 25,
    rating: 4.9,
    reviewCount: 85,
    createdAt: new Date().toISOString()
  },
  {
    id: id(3),
    name: 'Sony WH-1000XM5',
    description: 'Industry-leading noise cancellation headphones.',
    price: 29990,
    imageUrl: 'https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?w=800&q=80',
    category: 'Electronics',
    stock: 45,
    rating: 4.7,
    reviewCount: 89,
    createdAt: new Date().toISOString()
  },
  
  // --- CLOTHES (Men, Women, Child) ---
  {
    id: id(10),
    name: "Men's Classic Leather Jacket",
    description: 'Genuine leather jacket with a timeless design.',
    price: 12999,
    imageUrl: 'https://i.ibb.co/rKgb4Bjt/download.jpg',
    category: 'Clothes',
    subCategory: 'Men',
    stock: 15,
    rating: 4.5,
    reviewCount: 42,
    createdAt: new Date().toISOString()
  },
  {
    id: id(11),
    name: "Women's Summer Floral Dress",
    description: 'Lightweight and comfortable floral dress for summer.',
    price: 2499,
    imageUrl: 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=800&q=80',
    category: 'Clothes',
    subCategory: 'Women',
    stock: 30,
    rating: 4.6,
    reviewCount: 55,
    createdAt: new Date().toISOString()
  },
  {
    id: id(12),
    name: "Child's Denim Overalls",
    description: 'Durable and cute denim overalls for kids.',
    price: 1499,
    imageUrl: 'https://i.ibb.co/Kx0zfmYj/download.jpg',
    category: 'Clothes',
    subCategory: 'Child',
    stock: 20,
    rating: 4.8,
    reviewCount: 12,
    createdAt: new Date().toISOString()
  },

  // --- HOME & LIVING (Includes Furniture) ---
  {
    id: id(20),
    name: 'Ergonomic Office Chair',
    description: 'Mesh back chair with lumbar support for long working hours.',
    price: 15999,
    imageUrl: 'https://images.unsplash.com/photo-1505843490538-5133c6c7d0e1?w=800&q=80',
    category: 'Home & Living',
    stock: 8,
    rating: 4.5,
    reviewCount: 45,
    createdAt: new Date().toISOString()
  },
  {
    id: id(21),
    name: 'Modern Floor Lamp',
    description: 'Minimalist floor lamp to brighten up your living room.',
    price: 4999,
    imageUrl: 'https://i.ibb.co/q3LQYwmk/download.jpg',
    category: 'Home & Living',
    stock: 12,
    rating: 4.3,
    reviewCount: 22,
    createdAt: new Date().toISOString()
  },

  // --- SPORTS ---
  {
    id: id(30),
    name: 'Pro Yoga Mat',
    description: 'Non-slip yoga mat with alignment lines.',
    price: 1499,
    imageUrl: 'https://i.ibb.co/rfX639RR/download.jpg',
    category: 'Sports',
    stock: 50,
    rating: 4.7,
    reviewCount: 230,
    createdAt: new Date().toISOString()
  },
  {
    id: id(31),
    name: 'Adjustable Dumbbells Set',
    description: 'Space-saving adjustable dumbbells 5kg-25kg.',
    price: 8999,
    imageUrl: 'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=800&q=80',
    category: 'Sports',
    stock: 12,
    rating: 4.6,
    reviewCount: 45,
    createdAt: new Date().toISOString()
  }
];
