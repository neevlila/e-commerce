import { Product } from '../types';

// Updated categories as per user request
const CATEGORIES = [
  {
    name: 'Electronics',
    nouns: ['Laptop', 'Smartphone', 'Headphones', 'Smartwatch', 'Monitor', 'Keyboard', 'Mouse', 'Camera', 'Speaker', 'Tablet'],
    images: [
      'https://i.ibb.co/j94pnF7G/download.jpg', // Laptop
      'https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=800&q=80', // Watch
      'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80', // Headphones
      'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=800&q=80'  // Mouse
    ]
  },
  {
    name: 'Clothes',
    subCategories: ['Men', 'Women', 'Child'],
    nouns: ['T-Shirt', 'Jacket', 'Jeans', 'Hoodie', 'Sneakers', 'Dress', 'Shirt', 'Shorts', 'Coat', 'Sweater'],
    images: [
      'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=800&q=80', // Shirt
      'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&q=80', // Shoes
      'https://i.ibb.co/rKgb4Bjt/download.jpg', // Jacket
      'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=800&q=80'  // Clothes
    ]
  },
  {
    name: 'Home & Living',
    nouns: ['Office Chair', 'Desk Lamp', 'Sofa', 'Coffee Table', 'Bookshelf', 'Planter', 'Rug', 'Wall Clock', 'Cushion', 'Vase'],
    images: [
      'https://images.unsplash.com/photo-1505843490538-5133c6c7d0e1?w=800&q=80', // Chair
      'https://images.unsplash.com/photo-1507764923504-cd90bf7da772?w=800&q=80', // Lamp
      'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&q=80', // Chair 2
      'https://images.unsplash.com/photo-1517991104123-1d56a6e81ed9?w=800&q=80'  // Lamp 2
    ]
  },
  {
    name: 'Sports',
    nouns: ['Yoga Mat', 'Dumbbells', 'Tennis Racket', 'Football', 'Basketball', 'Gym Bag', 'Running Shoes', 'Water Bottle', 'Resistance Bands', 'Cycling Helmet'],
    images: [
      'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=800&q=80', // Gym
      'https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?w=800&q=80', // Dumbbells
      'https://i.ibb.co/rfX639RR/download.jpg', // Yoga
      'https://images.unsplash.com/photo-1605296867304-46d5465a13f1?w=800&q=80'  // Weights
    ]
  }
];

const BRANDS = ['Nova', 'TechPro', 'Luxe', 'Urban', 'Titan', 'Zenith', 'Aero', 'Vibe', 'Echo', 'Nexus'];
const ADJECTIVES = ['Premium', 'Ultra', 'Smart', 'Ergonomic', 'Comfortable', 'Pro', 'Sleek', 'Durable', 'Stylish', 'Modern'];

export const generateProducts = (count: number = 140): Omit<Product, 'id' | 'createdAt'>[] => {
  const products: Omit<Product, 'id' | 'createdAt'>[] = [];

  for (let i = 0; i < count; i++) {
    const categoryObj = CATEGORIES[Math.floor(Math.random() * CATEGORIES.length)];
    const adjective = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)];
    const brand = BRANDS[Math.floor(Math.random() * BRANDS.length)];
    const noun = categoryObj.nouns[Math.floor(Math.random() * categoryObj.nouns.length)];

    let subCategory: string | undefined = undefined;
    let name = `${brand} ${adjective} ${noun}`;

    // Handle Clothes Sub-categories
    if (categoryObj.name === 'Clothes') {
      const subs = ['Men', 'Women', 'Child'];
      subCategory = subs[Math.floor(Math.random() * subs.length)];
      name = `${subCategory}'s ${brand} ${noun}`;
    }

    // Handle Smartwatch -> Electronics
    if (noun === 'Smartwatch') {
      // Ensure it stays in Electronics, logic already handles it via categoryObj
    }

    // Random price
    const price = Math.floor(Math.random() * 49500) + 500;
    const stock = Math.floor(Math.random() * 100);
    const imageUrl = categoryObj.images[Math.floor(Math.random() * categoryObj.images.length)];

    products.push({
      name,
      description: `Experience the best in class with the ${name}. Designed for modern lifestyles, this ${categoryObj.name.toLowerCase()} item features premium build quality and exceptional performance.`,
      price,
      imageUrl,
      category: categoryObj.name,
      subCategory,
      company: brand,
      stock,
      rating: Number((Math.random() * 2 + 3).toFixed(1)),
      reviewCount: Math.floor(Math.random() * 50)
    });
  }

  return products;
};
