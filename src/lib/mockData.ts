import { Product } from '../types';

const id = (i: number) => `static-prod-${i}`;

export const MOCK_PRODUCTS: Product[] = [
  // --- ELECTRONICS (Includes Smartwatches now) ---
  {
    id: id(1),
    name: 'MacBook Pro M3 Max',
    description: 'The most powerful MacBook Pro ever. Blazing fast performance with the M3 Max chip.',
    price: 319900,
    imageUrl: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&q=80',
    category: 'Electronics',
    company: 'Apple',
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
    company: 'Apple',
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
    company: 'Sony',
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
    imageUrl: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=800&q=80',
    category: 'Clothes',
    subCategory: 'Men',
    company: 'Zara',
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
    company: 'H&M',
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
    imageUrl: 'https://images.unsplash.com/photo-1622290319146-7b63df48a635?w=800&q=80',
    category: 'Clothes',
    subCategory: 'Child',
    company: 'Gap Kids',
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
    company: 'IKEA',
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
    company: 'IKEA',
    stock: 12,
    rating: 3.8,
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
    company: 'Lululemon',
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
    company: 'Bowflex',
    stock: 12,
    rating: 4.6,
    reviewCount: 45,
    createdAt: new Date().toISOString()
  },

  // --- MORE ELECTRONICS ---
  {
    id: id(4),
    name: 'iPhone 15 Pro Titanium',
    description: 'Forged in titanium and featuring the groundbreaking A17 Pro chip.',
    price: 134900,
    imageUrl: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=800&q=80',
    category: 'Electronics',
    company: 'Apple',
    stock: 50,
    rating: 4.8,
    reviewCount: 320,
    createdAt: new Date().toISOString()
  },
  {
    id: id(5),
    name: 'Samsung 49" Odyssey G9 Gaming Monitor',
    description: 'Curved gaming monitor with dual QHD resolution and 240Hz refresh rate.',
    price: 125999,
    imageUrl: 'https://i.ibb.co/fVTKcgM1/61brom-Oif-BL-AC-UF350-350-QL80.png',
    category: 'Electronics',
    company: 'Samsung',
    stock: 5,
    rating: 4.9,
    reviewCount: 42,
    createdAt: new Date().toISOString()
  },
  {
    id: id(6),
    name: 'PlayStation 5 Console',
    description: 'Experience lightning-fast loading and stunning 4K graphics.',
    price: 54990,
    imageUrl: 'https://images.unsplash.com/photo-1606813907291-d86efa9b94db?w=800&q=80',
    category: 'Electronics',
    company: 'Sony',
    stock: 12,
    rating: 4.9,
    reviewCount: 950,
    createdAt: new Date().toISOString()
  },

  // --- SHOES ---
  {
    id: id(13),
    name: "Men's Classic White Sneakers",
    description: 'Minimalist white sneakers that go with almost any outfit.',
    price: 4999,
    imageUrl: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=800&q=80',
    category: 'Shoes',
    subCategory: 'Men',
    company: 'Nike',
    stock: 45,
    rating: 3.6,
    reviewCount: 112,
    createdAt: new Date().toISOString()
  },
  {
    id: id(15),
    name: "Women's Performance Running Shoes",
    description: 'Lightweight and highly breathable running shoes for daily miles.',
    price: 6499,
    imageUrl: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&q=80',
    category: 'Shoes',
    subCategory: 'Women',
    company: 'Nike',
    stock: 35,
    rating: 4.8,
    reviewCount: 180,
    createdAt: new Date().toISOString()
  },

  // --- MORE HOME & LIVING ---
  {
    id: id(22),
    name: 'Smart Coffee Maker',
    description: 'Brew the perfect cup of coffee from your smartphone.',
    price: 12999,
    imageUrl: 'https://images.unsplash.com/photo-1497935586351-b67a49e012bf?w=800&q=80',
    category: 'Home & Living',
    company: 'Breville',
    stock: 22,
    rating: 3.2,
    reviewCount: 135,
    createdAt: new Date().toISOString()
  },
  {
    id: id(23),
    name: 'Ceramic Tableware Set (16 Piece)',
    description: 'Elegant dinnerware set containing plates, bowls, and mugs.',
    price: 3499,
    imageUrl: 'https://images.unsplash.com/photo-1610701596007-11502861dcfa?w=800&q=80',
    category: 'Home & Living',
    company: 'Corelle',
    stock: 40,
    rating: 4.8,
    reviewCount: 65,
    createdAt: new Date().toISOString()
  },

  // --- MORE SPORTS ---
  {
    id: id(32),
    name: 'Pro Tennis Racket',
    description: 'Lightweight carbon fiber tennis racket for maximum power and control.',
    price: 11999,
    imageUrl: 'https://i.ibb.co/tMfBv2Vw/download-1.png',
    category: 'Sports',
    company: 'Wilson',
    stock: 15,
    rating: 4.5,
    reviewCount: 30,
    createdAt: new Date().toISOString()
  },
  {
    id: id(33),
    name: 'Camping Tent (4 Person)',
    description: 'Waterproof and easy to setup dome tent for outdoor adventures.',
    price: 5999,
    imageUrl: 'https://images.unsplash.com/photo-1537225228614-56cc3556d7ed?w=800&q=80',
    category: 'Sports',
    company: 'Coleman',
    stock: 25,
    rating: 3.9,
    reviewCount: 78,
    createdAt: new Date().toISOString()
  },

  // --- JEWELRY ---
  {
    id: id(40),
    name: '14K Gold Chain Necklace',
    description: 'Elegant and durable solid gold chain necklace suitable for everyday wear.',
    price: 12500,
    imageUrl: 'https://i.ibb.co/6RcwBrxX/download-3.png',
    category: 'Jewelry',
    company: 'Tanishq',
    stock: 12,
    rating: 4.9,
    reviewCount: 88,
    createdAt: new Date().toISOString()
  },
  {
    id: id(41),
    name: 'Diamond Engagement Ring',
    description: 'Stunning 1-carat diamond ring in a classic platinum setting.',
    price: 85000,
    imageUrl: 'https://i.ibb.co/7JRCpBWh/download.png',
    category: 'Jewelry',
    company: 'Tiffany & Co.',
    stock: 3,
    rating: 5.0,
    reviewCount: 14,
    createdAt: new Date().toISOString()
  },
  {
    id: id(42),
    name: 'Pearl Drop Earrings',
    description: 'Classic cultured pearl earrings with sterling silver backing.',
    price: 4500,
    imageUrl: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=800&q=80',
    category: 'Jewelry',
    company: 'Swarovski',
    stock: 30,
    rating: 4.6,
    reviewCount: 42,
    createdAt: new Date().toISOString()
  },

  // --- ADDITIONAL JEWELRY ---
  { id: id(43), name: '18K Gold Rope Chain', description: 'Thick and durable rope chain for men and women.', price: 45000, imageUrl: 'https://i.ibb.co/Gvfj2DK0/download-4.png', category: 'Jewelry', company: 'Tanishq', stock: 5, rating: 4.8, reviewCount: 12, createdAt: new Date().toISOString() },
  { id: id(44), name: '22K Gold Pendant Chain', description: 'Elegant gold chain with a minimalist pendant.', price: 32000, imageUrl: 'https://i.ibb.co/B5nkGHtr/download.png', category: 'Jewelry', company: 'Kalyan Jewellers', stock: 8, rating: 4.7, reviewCount: 20, createdAt: new Date().toISOString() },
  { id: id(45), name: '24K Gold Bangle Bracelet', description: 'Traditional pure gold bangle bracelet.', price: 55000, imageUrl: 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=800&q=80', category: 'Jewelry', company: 'Tanishq', stock: 2, rating: 5.0, reviewCount: 8, createdAt: new Date().toISOString() },
  { id: id(47), name: 'Silver Charm Bracelet', description: 'Customizable silver charm bracelet.', price: 3200, imageUrl: 'https://i.ibb.co/nMXJw5c3/download-1.png', category: 'Jewelry', company: 'Pandora', stock: 20, rating: 3.5, reviewCount: 30, createdAt: new Date().toISOString() },

  // --- ADDITIONAL CLOTHES: SHIRTS ---
  { id: id(48), name: "Men's Oxford Button-Down Shirt", description: 'Classic fit oxford shirt in light blue.', price: 1999, imageUrl: 'https://loremflickr.com/800/800/mens,button,shirt?lock=790', category: 'Clothes', subCategory: 'Men', company: 'Ralph Lauren', stock: 40, rating: 4.6, reviewCount: 85, createdAt: new Date().toISOString() },
  { id: id(49), name: "Men's Slim Fit Dress Shirt", description: 'Crisp white dress shirt for formal occasions.', price: 2499, imageUrl: 'https://images.unsplash.com/photo-1626497764746-6dc36546b388?w=800&q=80', category: 'Clothes', subCategory: 'Men', company: 'Calvin Klein', stock: 35, rating: 4.7, reviewCount: 60, createdAt: new Date().toISOString() },
  { id: id(51), name: "Men's Casual Flannel Shirt", description: 'Warm and comfortable plaid flannel shirt.', price: 1799, imageUrl: 'https://images.unsplash.com/photo-1598033129183-c4f50c736f10?w=800&q=80', category: 'Clothes', subCategory: 'Men', company: 'Levi\'s', stock: 50, rating: 4.5, reviewCount: 110, createdAt: new Date().toISOString() },
  { id: id(52), name: "Women's Denim Shirt", description: 'Versatile long-sleeve denim shirt.', price: 2199, imageUrl: 'https://images.unsplash.com/photo-1563630423918-b58f07336ac9?w=800&q=80', category: 'Clothes', subCategory: 'Women', company: 'Levi\'s', stock: 30, rating: 2.8, reviewCount: 35, createdAt: new Date().toISOString() },

  // --- ADDITIONAL CLOTHES: T-SHIRTS ---
  { id: id(53), name: "Men's Basic Crew Neck T-Shirt", description: 'Everyday essential cotton t-shirt in black.', price: 799, imageUrl: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&q=80', category: 'Clothes', subCategory: 'Men', company: 'Uniqlo', stock: 100, rating: 4.5, reviewCount: 240, createdAt: new Date().toISOString() },
  { id: id(54), name: "Women's V-Neck Cotton Tee", description: 'Soft and breathable v-neck t-shirt.', price: 899, imageUrl: 'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=800&q=80', category: 'Clothes', subCategory: 'Women', company: 'Uniqlo', stock: 80, rating: 4.6, reviewCount: 150, createdAt: new Date().toISOString() },
  { id: id(55), name: "Men's Graphic Print T-Shirt", description: 'Vintage inspired graphic tee.', price: 1299, imageUrl: 'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=800&q=80', category: 'Clothes', subCategory: 'Men', company: 'H&M', stock: 60, rating: 2.3, reviewCount: 88, createdAt: new Date().toISOString() },
  { id: id(56), name: "Women's Oversized T-Shirt", description: 'Trendy oversized fit t-shirt in pastel colors.', price: 1499, imageUrl: 'https://images.unsplash.com/photo-1529374255404-311a2a4f1fd9?w=800&q=80', category: 'Clothes', subCategory: 'Women', company: 'Zara', stock: 45, rating: 4.7, reviewCount: 65, createdAt: new Date().toISOString() },
  { id: id(57), name: "Men's Activewear Running Tee", description: 'Moisture-wicking performance t-shirt.', price: 1599, imageUrl: 'https://images.unsplash.com/photo-1581655353564-df123a1eb820?w=800&q=80', category: 'Clothes', subCategory: 'Men', company: 'Nike', stock: 70, rating: 4.8, reviewCount: 120, createdAt: new Date().toISOString() },

  // --- ADDITIONAL CLOTHES: PANTS ---
  { id: id(58), name: "Men's Slim Fit Chinos", description: 'Comfortable stretch chinos for everyday wear.', price: 2499, imageUrl: 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=800&q=80', category: 'Clothes', subCategory: 'Men', company: 'Dockers', stock: 55, rating: 4.6, reviewCount: 95, createdAt: new Date().toISOString() },
  { id: id(59), name: "Women's High-Waisted Jeans", description: 'Classic skinny fit high-waisted denim jeans.', price: 2999, imageUrl: 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=800&q=80', category: 'Clothes', subCategory: 'Women', company: 'Levi\'s', stock: 65, rating: 4.7, reviewCount: 140, createdAt: new Date().toISOString() },
  { id: id(60), name: "Men's Cargo Pants", description: 'Utility cargo pants with multiple pockets.', price: 2799, imageUrl: 'https://images.unsplash.com/photo-1517438322307-e67111335449?w=800&q=80', category: 'Clothes', subCategory: 'Men', company: 'Carhartt', stock: 40, rating: 4.5, reviewCount: 75, createdAt: new Date().toISOString() },
  { id: id(61), name: "Women's Wide-Leg Trousers", description: 'Elegant and flowing wide-leg trousers.', price: 3299, imageUrl: 'https://images.unsplash.com/photo-1584370848010-d7fe6bc767ec?w=800&q=80', category: 'Clothes', subCategory: 'Women', company: 'Zara', stock: 30, rating: 4.8, reviewCount: 50, createdAt: new Date().toISOString() },
  { id: id(62), name: "Men's Jogger Sweatpants", description: 'Cozy fleece-lined jogger sweatpants.', price: 1899, imageUrl: 'https://images.unsplash.com/photo-1506629082955-511b1aa562c8?w=800&q=80', category: 'Clothes', subCategory: 'Men', company: 'Adidas', stock: 80, rating: 4.6, reviewCount: 110, createdAt: new Date().toISOString() },

  // --- ADDITIONAL CLOTHES: NIGHTWEAR (GIRLS) ---
  { id: id(63), name: "Girls' Cotton Pajama Set", description: 'Soft and breathable 2-piece pajama set.', price: 1299, imageUrl: 'https://loremflickr.com/800/800/kids,pajamas?lock=58', category: 'Clothes', subCategory: 'Child', company: 'Carter\'s', stock: 45, rating: 4.7, reviewCount: 35, createdAt: new Date().toISOString() },
  { id: id(64), name: "Girls' Fleece Onesie", description: 'Warm and cozy animal themed onesie.', price: 1999, imageUrl: 'https://loremflickr.com/800/800/kids,onesie?lock=822', category: 'Clothes', subCategory: 'Child', company: 'Carter\'s', stock: 25, rating: 4.9, reviewCount: 60, createdAt: new Date().toISOString() },
  { id: id(65), name: "Girls' Nightgown", description: 'Lightweight flowing summer nightgown.', price: 999, imageUrl: 'https://loremflickr.com/800/800/kids,nightgown?lock=996', category: 'Clothes', subCategory: 'Child', company: 'Gap Kids', stock: 35, rating: 4.5, reviewCount: 22, createdAt: new Date().toISOString() },
  { id: id(66), name: "Girls' Flannel Sleep Pants", description: 'Plaid patterned warm sleep pants.', price: 899, imageUrl: 'https://loremflickr.com/800/800/flannel,pants?lock=387', category: 'Clothes', subCategory: 'Child', company: 'H&M', stock: 50, rating: 4.6, reviewCount: 40, createdAt: new Date().toISOString() },

  // --- ADDITIONAL CLOTHES: NIGHTWEAR (BOYS) ---
  { id: id(68), name: "Boys' Superhero Pajama Set", description: 'Action-packed 2-piece sleepwear set.', price: 1299, imageUrl: 'https://loremflickr.com/800/800/boys,pajamas?lock=743', category: 'Clothes', subCategory: 'Child', company: 'Carter\'s', stock: 55, rating: 4.8, reviewCount: 75, createdAt: new Date().toISOString() },
  { id: id(69), name: "Boys' Plaid Sleep Bottoms", description: 'Comfortable loose-fit sleep pants.', price: 999, imageUrl: 'https://loremflickr.com/800/800/plaid,pants?lock=188', category: 'Clothes', subCategory: 'Child', company: 'Gap Kids', stock: 40, rating: 4.5, reviewCount: 30, createdAt: new Date().toISOString() },
  { id: id(70), name: "Boys' Dinosaur Fleece Robe", description: 'Ultra-plush fleece robe with a hood.', price: 1799, imageUrl: 'https://loremflickr.com/800/800/kids,bathrobe?lock=993', category: 'Clothes', subCategory: 'Child', company: 'Carter\'s', stock: 20, rating: 4.9, reviewCount: 45, createdAt: new Date().toISOString() },
  { id: id(71), name: "Boys' Cotton Sleep Shorts", description: 'Breathable lightweight shorts for summer nights.', price: 799, imageUrl: 'https://loremflickr.com/800/800/boys,shorts?lock=916', category: 'Clothes', subCategory: 'Child', company: 'H&M', stock: 60, rating: 3.4, reviewCount: 25, createdAt: new Date().toISOString() },
  { id: id(72), name: "Boys' Thermal Onesie", description: 'Full body thermal sleeper.', price: 1899, imageUrl: 'https://loremflickr.com/800/800/boys,onesie?lock=110', category: 'Clothes', subCategory: 'Child', company: 'Gap Kids', stock: 30, rating: 4.7, reviewCount: 38, createdAt: new Date().toISOString() },

  // --- ELECTRONICS: SMART WATCHES ---
  { id: id(73), name: 'Samsung Galaxy Watch 6', description: 'Advanced health tracking and sleep coaching features.', price: 29999, imageUrl: 'https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=800&q=80', category: 'Electronics', company: 'Samsung', stock: 25, rating: 4.7, reviewCount: 156, createdAt: new Date().toISOString() },
  { id: id(74), name: 'Garmin Fenix 7 Pro', description: 'Ultimate multisport GPS smartwatch with solar charging.', price: 75000, imageUrl: 'https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=800&q=80', category: 'Electronics', company: 'Garmin', stock: 10, rating: 4.9, reviewCount: 82, createdAt: new Date().toISOString() },
  { id: id(75), name: 'Fitbit Versa 4', description: 'Fitness-focused smartwatch with built-in GPS.', price: 19999, imageUrl: 'https://images.unsplash.com/photo-1575311373937-040b8e1fd5b6?w=800&q=80', category: 'Electronics', company: 'Fitbit', stock: 40, rating: 4.5, reviewCount: 210, createdAt: new Date().toISOString() },
  { id: id(77), name: 'Fossil Gen 6 Smartwatch', description: 'WearOS smartwatch with a classic elegant design.', price: 22995, imageUrl: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80', category: 'Electronics', company: 'Fossil', stock: 15, rating: 3.1, reviewCount: 65, createdAt: new Date().toISOString() },

  // --- ADDITIONAL SPORTS EQUIPMENTS ---
  { id: id(83), name: 'Spalding NBA Basketball', description: 'Official indoor/outdoor basketball.', price: 2499, imageUrl: 'https://images.unsplash.com/photo-1519861531473-9200262188bf?w=800&q=80', category: 'Sports', company: 'Spalding', stock: 45, rating: 4.8, reviewCount: 215, createdAt: new Date().toISOString() },
  { id: id(84), name: 'Adidas Soccer Ball', description: 'Match-ready seamless soccer ball.', price: 1999, imageUrl: 'https://images.unsplash.com/photo-1614632537190-23e4146777db?w=800&q=80', category: 'Sports', company: 'Adidas', stock: 60, rating: 4.7, reviewCount: 180, createdAt: new Date().toISOString() },
  { id: id(85), name: 'Resistance Band Set', description: 'Set of 5 heavy-duty exercise resistance bands.', price: 1299, imageUrl: 'https://i.ibb.co/1wgWK34/download-2.png', category: 'Sports', company: 'Fit Simplify', stock: 100, rating: 4.5, reviewCount: 350, createdAt: new Date().toISOString() },
  { id: id(86), name: 'Everlast Boxing Gloves', description: 'Pro style training boxing gloves.', price: 3499, imageUrl: 'https://images.unsplash.com/photo-1583473848882-f9a5bc7fd2ee?w=800&q=80', category: 'Sports', company: 'Everlast', stock: 30, rating: 4.6, reviewCount: 142, createdAt: new Date().toISOString() },
  { id: id(87), name: 'Speed Jump Rope', description: 'Adjustable steel wire jump rope for cardio.', price: 599, imageUrl: 'https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?w=800&q=80', category: 'Sports', company: 'Under Armour', stock: 120, rating: 2.1, reviewCount: 290, createdAt: new Date().toISOString() },

  // --- ADDITIONAL ELECTRONICS (13 ITEMS) ---
  { id: id(88), name: 'AirPods Pro (2nd Gen)', description: 'Active Noise Cancellation and personalized spatial audio.', price: 24900, imageUrl: 'https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?w=800&q=80', category: 'Electronics', company: 'Apple', stock: 55, rating: 4.9, reviewCount: 850, createdAt: new Date().toISOString() },
  { id: id(89), name: 'Samsung Galaxy S24 Ultra', description: 'AI-powered flagship smartphone with titanium frame.', price: 129999, imageUrl: 'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=800&q=80', category: 'Electronics', company: 'Samsung', stock: 15, rating: 4.8, reviewCount: 120, createdAt: new Date().toISOString() },
  { id: id(90), name: 'Logitech MX Master 3S', description: 'Advanced wireless mouse designed for coders and creators.', price: 9999, imageUrl: 'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=800&q=80', category: 'Electronics', company: 'Logitech', stock: 35, rating: 4.9, reviewCount: 420, createdAt: new Date().toISOString() },
  { id: id(91), name: 'Keychron K2 Mechanical Keyboard', description: 'Wireless mechanical keyboard for Mac and Windows.', price: 8499, imageUrl: 'https://images.unsplash.com/photo-1595225476474-87563907a212?w=800&q=80', category: 'Electronics', company: 'Keychron', stock: 25, rating: 4.7, reviewCount: 280, createdAt: new Date().toISOString() },
  { id: id(92), name: 'Sony A7 IV Mirrorless Camera', description: 'Full-frame hybrid mirrorless camera.', price: 215000, imageUrl: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800&q=80', category: 'Electronics', company: 'Sony', stock: 5, rating: 4.9, reviewCount: 95, createdAt: new Date().toISOString() },
  { id: id(93), name: 'Bose QuietComfort Earbuds II', description: 'The world\'s best noise cancellation earbuds.', price: 26900, imageUrl: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=800&q=80', category: 'Electronics', company: 'Bose', stock: 40, rating: 4.8, reviewCount: 310, createdAt: new Date().toISOString() },
  { id: id(94), name: 'Apple iPad Air (M1)', description: 'Supercharged by the Apple M1 chip.', price: 54900, imageUrl: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=800&q=80', category: 'Electronics', company: 'Apple', stock: 20, rating: 4.9, reviewCount: 650, createdAt: new Date().toISOString() },
  { id: id(95), name: 'DJI Mini 3 Pro Drone', description: 'Lightweight and foldable drone with 4K HDR video.', price: 79999, imageUrl: 'https://images.unsplash.com/photo-1579829366248-204fe8413f31?w=800&q=80', category: 'Electronics', company: 'DJI', stock: 12, rating: 4.8, reviewCount: 145, createdAt: new Date().toISOString() },
  { id: id(96), name: 'Anker 737 PowerBank', description: '140W fast-charging 24,000mAh portable charger.', price: 12999, imageUrl: 'https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?w=800&q=80', category: 'Electronics', company: 'Anker', stock: 50, rating: 4.7, reviewCount: 220, createdAt: new Date().toISOString() },
  { id: id(97), name: 'Nintendo Switch OLED', description: 'Play at home or on the go with a vibrant 7-inch OLED screen.', price: 34990, imageUrl: 'https://images.unsplash.com/photo-1578303512597-81e6cc155b3e?w=800&q=80', category: 'Electronics', company: 'Nintendo', stock: 18, rating: 4.9, reviewCount: 890, createdAt: new Date().toISOString() },
  { id: id(99), name: 'Elgato Stream Deck MK.2', description: 'Studio controller with 15 macro keys.', price: 14999, imageUrl: 'https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?w=800&q=80', category: 'Electronics', company: 'Elgato', stock: 15, rating: 4.8, reviewCount: 180, createdAt: new Date().toISOString() },
  { id: id(100), name: 'Razer Blade 15 Gaming Laptop', description: 'Ultra-thin and powerful gaming laptop.', price: 215000, imageUrl: 'https://images.unsplash.com/photo-1593640408182-31c70c8268f5?w=800&q=80', category: 'Electronics', company: 'Razer', stock: 4, rating: 3.7, reviewCount: 75, createdAt: new Date().toISOString() },

  // --- ADDITIONAL HOME & LIVING (7 ITEMS) ---
  { id: id(102), name: 'Philips Hue White & Color Starter Kit', description: 'Smart LED lighting system.', price: 14999, imageUrl: 'https://i.ibb.co/M5KgLh9y/61-SHNW1c-Md-L.png', category: 'Home & Living', company: 'Philips', stock: 40, rating: 4.7, reviewCount: 260, createdAt: new Date().toISOString() },
  { id: id(103), name: 'Le Creuset Dutch Oven', description: 'Enameled cast iron signature round casserole.', price: 32000, imageUrl: 'https://i.ibb.co/00QCZBr/FAW-Le-Creuset7-0368283feb0948bfa07967d943d9a690.png', category: 'Home & Living', company: 'Le Creuset', stock: 12, rating: 5.0, reviewCount: 430, createdAt: new Date().toISOString() },
  { id: id(105), name: 'Linen Bed Sheet Set', description: '100% French flax linen ultra-soft sheets.', price: 12500, imageUrl: 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=800&q=80', category: 'Home & Living', company: 'Brooklinen', stock: 35, rating: 4.8, reviewCount: 150, createdAt: new Date().toISOString() },
  { id: id(106), name: 'Herman Miller Aeron Chair', description: 'The ultimate ergonomic office chair.', price: 125000, imageUrl: 'https://images.unsplash.com/photo-1505843490538-5133c6c7d0e1?w=800&q=80', category: 'Home & Living', company: 'Herman Miller', stock: 5, rating: 4.9, reviewCount: 210, createdAt: new Date().toISOString() },
  { id: id(107), name: 'Breville Smart Oven Air Fryer', description: 'Convection and air fry countertop oven.', price: 35999, imageUrl: 'https://i.ibb.co/d0s6h1Rk/air-fryer-vs-toaster-oven.png', category: 'Home & Living', company: 'Breville', stock: 15, rating: 4.8, reviewCount: 195, createdAt: new Date().toISOString() },

  // --- ADDITIONAL SHOES (9 ITEMS) ---
  { id: id(108), name: "Men's Leather Oxford Shoes", description: 'Classic formal leather oxfords.', price: 5499, imageUrl: 'https://images.unsplash.com/photo-1595341888016-a392ef81b7de?w=800&q=80', category: 'Shoes', subCategory: 'Men', company: 'Clarks', stock: 25, rating: 4.8, reviewCount: 65, createdAt: new Date().toISOString() },
  { id: id(109), name: "Women's Ankle Boots", description: 'Stylish suede ankle boots with block heel.', price: 4299, imageUrl: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=800&q=80', category: 'Shoes', subCategory: 'Women', company: 'Steve Madden', stock: 40, rating: 4.6, reviewCount: 88, createdAt: new Date().toISOString() },
  { id: id(110), name: "Men's Running Sneakers", description: 'Lightweight breathable mesh running shoes.', price: 3999, imageUrl: 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=800&q=80', category: 'Shoes', subCategory: 'Men', company: 'Adidas', stock: 65, rating: 4.7, reviewCount: 150, createdAt: new Date().toISOString() },
  { id: id(111), name: "Women's Canvas Sneakers", description: 'Casual low-top canvas sneakers.', price: 1999, imageUrl: 'https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?w=800&q=80', category: 'Shoes', subCategory: 'Women', company: 'Converse', stock: 55, rating: 4.5, reviewCount: 120, createdAt: new Date().toISOString() },
  { id: id(112), name: "Men's Chelsea Boots", description: 'Sleek leather Chelsea boots.', price: 6999, imageUrl: 'https://images.unsplash.com/photo-1638247025967-b4e38f787b76?w=800&q=80', category: 'Shoes', subCategory: 'Men', company: 'Dr. Martens', stock: 20, rating: 4.8, reviewCount: 50, createdAt: new Date().toISOString() },
  { id: id(113), name: "Women's Stiletto Heels", description: 'Elegant pointed-toe stiletto heels.', price: 3499, imageUrl: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=800&q=80', category: 'Shoes', subCategory: 'Women', company: 'Jimmy Choo', stock: 30, rating: 4.6, reviewCount: 75, createdAt: new Date().toISOString() },
  { id: id(114), name: "Boys' Sports Sneakers", description: 'Durable and comfortable athletic shoes.', price: 2499, imageUrl: 'https://images.unsplash.com/photo-1514989940723-e8e51635b782?w=800&q=80', category: 'Shoes', subCategory: 'Child', company: 'Nike', stock: 45, rating: 4.7, reviewCount: 65, createdAt: new Date().toISOString() },
  { id: id(115), name: "Girls' Light-Up Sneakers", description: 'Fun colorful sneakers with LED lights.', price: 2799, imageUrl: 'https://images.unsplash.com/photo-1560769629-975ec94e6a86?w=800&q=80', category: 'Shoes', subCategory: 'Child', company: 'Skechers', stock: 35, rating: 4.8, reviewCount: 90, createdAt: new Date().toISOString() },
  { id: id(116), name: "Men's Loafers", description: 'Comfortable slip-on leather loafers.', price: 4499, imageUrl: 'https://images.unsplash.com/photo-1533867617858-e7b97e060509?w=800&q=80', category: 'Shoes', subCategory: 'Men', company: 'Cole Haan', stock: 28, rating: 4.6, reviewCount: 55, createdAt: new Date().toISOString() },

  // --- SKIN CARE (10 ITEMS) ---
  { id: id(117), name: 'Hydrating Facial Cleanser', description: 'Gentle non-foaming cleanser for daily use.', price: 899, imageUrl: 'https://loremflickr.com/800/800/facial,cleanser?lock=736', category: 'Skin Care', company: 'CeraVe', stock: 80, rating: 4.7, reviewCount: 210, createdAt: new Date().toISOString() },
  { id: id(118), name: 'Vitamin C Serum', description: 'Brightening serum for a radiant complexion.', price: 1499, imageUrl: 'https://loremflickr.com/800/800/vitamin,c,serum?lock=110', category: 'Skin Care', company: 'The Ordinary', stock: 65, rating: 4.8, reviewCount: 340, createdAt: new Date().toISOString() },
  { id: id(119), name: 'Daily Moisturizer SPF 30', description: 'Lightweight hydrating lotion with sun protection.', price: 1299, imageUrl: 'https://loremflickr.com/800/800/moisturizer,cream?lock=636', category: 'Skin Care', company: 'Neutrogena', stock: 100, rating: 4.6, reviewCount: 180, createdAt: new Date().toISOString() },
  { id: id(120), name: 'Exfoliating Face Scrub', description: 'Deep cleansing scrub with natural exfoliants.', price: 799, imageUrl: 'https://loremflickr.com/800/800/face,scrub?lock=758', category: 'Skin Care', company: 'St. Ives', stock: 50, rating: 2.9, reviewCount: 125, createdAt: new Date().toISOString() },
  { id: id(121), name: 'Night Repair Cream', description: 'Intense overnight hydration and anti-aging cream.', price: 1999, imageUrl: 'https://loremflickr.com/800/800/face,skincare,cream?lock=123', category: 'Skin Care', company: 'Estée Lauder', stock: 40, rating: 4.9, reviewCount: 275, createdAt: new Date().toISOString() },
  { id: id(122), name: 'Hyaluronic Acid Gel', description: 'Instant plumping and deep hydration gel.', price: 1199, imageUrl: 'https://loremflickr.com/800/800/hyaluronic,serum?lock=758', category: 'Skin Care', company: 'The Ordinary', stock: 75, rating: 4.8, reviewCount: 195, createdAt: new Date().toISOString() },
  { id: id(123), name: 'Clay Face Mask', description: 'Pore-clearing natural clay mask.', price: 999, imageUrl: 'https://loremflickr.com/800/800/face,mask,skincare?lock=891', category: 'Skin Care', company: 'Innisfree', stock: 60, rating: 4.6, reviewCount: 150, createdAt: new Date().toISOString() },
  { id: id(124), name: 'Rose Water Toner', description: 'Refreshing and balancing facial toner.', price: 599, imageUrl: 'https://loremflickr.com/800/800/toner,skincare?lock=761', category: 'Skin Care', company: 'Thayers', stock: 90, rating: 4.7, reviewCount: 220, createdAt: new Date().toISOString() },
  { id: id(125), name: 'Under Eye Serum', description: 'Reduces dark circles and puffiness.', price: 1399, imageUrl: 'https://loremflickr.com/800/800/skincare,serum?lock=224', category: 'Skin Care', company: 'Kiehl\'s', stock: 35, rating: 3.3, reviewCount: 110, createdAt: new Date().toISOString() },
  { id: id(126), name: 'Soothing Aloe Vera Gel', description: 'Multi-purpose pure aloe vera for skin and hair.', price: 399, imageUrl: 'https://loremflickr.com/800/800/aloe,vera,gel?lock=402', category: 'Skin Care', company: 'Nature Republic', stock: 120, rating: 4.8, reviewCount: 380, createdAt: new Date().toISOString() }
];
