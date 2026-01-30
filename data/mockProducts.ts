// Mock product data for clothing store
// Replace with API calls when backend is ready

export interface Review {
    id: string;
    userName: string;
    rating: number;
    comment: string;
    date: string;
    avatar?: string;
}

export interface Product {
    id: string;
    name: string;
    description: string;
    price: number;
    originalPrice?: number;
    image: string;
    category: string;
    rating: number;
    reviews: number;
    inStock: boolean;
    badge?: 'new' | 'sale' | 'trending';
    sizes?: string[];
    colors?: { name: string; image: string }[];
    detailedReviews?: Review[];
}

export interface Category {
    id: string;
    name: string;
    icon: string;
    count: number;
}

const defaultSizes = ['S', 'M', 'L', 'XL', 'XXL'];
const kidsSizes = ['2-3Y', '4-5Y', '6-7Y', '8-9Y'];

const sampleReviews: Review[] = [
    {
        id: 'r1',
        userName: 'Rahul Sharma',
        rating: 5,
        comment: 'Perfect fit and the fabric is very comfortable. Great value for money!',
        date: '2 Days ago',
    },
    {
        id: 'r2',
        userName: 'Priya Patel',
        rating: 4,
        comment: 'Quality is good, but shipping took a bit longer than expected.',
        date: '1 week ago',
    }
];

export const mockProducts: Product[] = [
    {
        id: '1',
        name: 'Premium Cotton Slim Fit Shirt',
        description: 'High-quality 100% cotton shirt for men. Perfect for formal and casual wear. Features a modern slim fit design with reinforced stitching.',
        price: 1299,
        originalPrice: 2499,
        image: 'https://cdn.shopify.com/s/files/1/0420/7073/7058/files/4mss3730-02-m-64.jpg?v=1737612279',
        category: 'Men',
        rating: 4.8,
        reviews: 234,
        inStock: true,
        badge: 'sale',
        sizes: defaultSizes,
        colors: [
            { name: 'White', image: 'https://cdn.shopify.com/s/files/1/0420/7073/7058/files/4mss3730-02-m-64.jpg?v=1737612279' },
            { name: 'Blue', image: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=400&q=80' },
            { name: 'Black', image: 'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=400&q=80' }
        ],
        detailedReviews: sampleReviews,
    },
    {
        id: '2',
        name: 'Elegant Summer Floral Dress',
        description: 'Lightweight and breathable floral dress for women. Made from premium rayon for a soft flowy feel. Perfect for summer outings.',
        price: 1899,
        image: 'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=800&q=60',
        category: 'Women',
        rating: 4.5,
        reviews: 189,
        inStock: true,
        badge: 'trending',
        sizes: ['XS', 'S', 'M', 'L'],
        colors: [
            { name: 'Floral', image: 'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=800&q=60' },
            { name: 'Red', image: 'https://images.unsplash.com/photo-1572804013307-a9a11198527a?w=400&q=80' },
            { name: 'Yellow', image: 'https://images.unsplash.com/photo-1593030761757-71fae45fa0e7?w=400&q=80' }
        ],
        detailedReviews: sampleReviews,
    },
    {
        id: '3',
        name: 'Kids Red Cotton Polo',
        description: 'Vibrant red polo shirt for kids. 100% organic cotton, gentle on skin and durable for play.',
        price: 499,
        originalPrice: 899,
        image: 'https://cdn07.nnnow.com/web-images/large/styles/I400D7SXFJP/1753791158296/1.jpg',
        category: 'Kids',
        rating: 4.3,
        reviews: 156,
        inStock: true,
        badge: 'sale',
        sizes: kidsSizes,
        detailedReviews: sampleReviews,
    },
    {
        id: '4',
        name: 'Mens Classic Denim Jacket',
        description: 'Timeless denim jacket with a rugged finish. Features premium metal buttons and multiple functional pockets.',
        price: 2499,
        image: 'https://images.unsplash.com/photo-1551537482-f2075a1d41f2?w=800&q=60',
        category: 'Men',
        rating: 4.7,
        reviews: 312,
        inStock: true,
        badge: 'new',
        sizes: defaultSizes,
        colors: [
            { name: 'Blue', image: 'https://images.unsplash.com/photo-1551537482-f2075a1d41f2?w=800&q=60' },
            { name: 'Black', image: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=400&q=80' }
        ],
        detailedReviews: sampleReviews,
    },
    {
        id: '5',
        name: 'Womens High-Waist Skinny Jeans',
        description: 'Stretchable and comfortable skinny jeans. High-waisted design providing a flattering fit for all body types.',
        price: 1699,
        image: 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=800&q=60',
        category: 'Women',
        rating: 4.4,
        reviews: 98,
        inStock: true,
        sizes: ['26', '28', '30', '32', '34'],
        detailedReviews: sampleReviews,
    },
    {
        id: '6',
        name: 'Kids Hooded Sweatshirt',
        description: 'Warm and cozy hoodie for chilly days. Features a soft fleece lining and a spacious front pocket.',
        price: 999,
        originalPrice: 1499,
        image: 'https://static.vecteezy.com/system/resources/thumbnails/030/614/688/small/happy-mexican-kid-in-casual-clothing-against-a-neutral-background-ai-generative-photo.jpg',
        category: 'Kids',
        rating: 4.6,
        reviews: 267,
        inStock: true,
        badge: 'trending',
        sizes: kidsSizes,
        detailedReviews: sampleReviews,
    },
    {
        id: '7',
        name: 'Womens Oversized Linen Shirt',
        description: 'Casual linen shirt for a relaxed summer look. Breathable fabric that keeps you cool even on hot days.',
        price: 1499,
        image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSntiQACdgt0fKfXlEvmOKZPlMgwiW26pVIJA&s',
        category: 'Women',
        rating: 4.2,
        reviews: 445,
        inStock: true,
        sizes: ['S', 'M', 'L', 'XL'],
        detailedReviews: sampleReviews,
    },
    {
        id: '8',
        name: 'Mens Cargo Jogger Pants',
        description: 'Stylish and functional cargo pants with multiple pockets. Elasticated waistband and cuffs for maximum comfort.',
        price: 1599,
        originalPrice: 2199,
        image: 'https://encrypted-tbn3.gstatic.com/shopping?q=tbn:ANd9GcQu8jCNYF25xjRUrzs2BB0bSocwoYumuW7WOwkUK-R_tDOwpD7D15FVle_Gv5Z0D2XSvYZs_bIDQZpBrT78qm-qWzsMsr5AU9PK7MubVH-YYUubkjPHh8r9Jg',
        category: 'Men',
        rating: 4.5,
        reviews: 178,
        inStock: true,
        badge: 'sale',
        sizes: defaultSizes,
        detailedReviews: sampleReviews,
    },
];

export const mockCategories: Category[] = [
    { id: '1', name: 'Men', icon: 'man', count: 420 },
    { id: '2', name: 'Women', icon: 'woman', count: 540 },
    { id: '3', name: 'Kids', icon: 'happy', count: 289 },
];

export const mockBrands = [
    { id: '1', name: 'Nike', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a6/Logo_NIKE.svg/1024px-Logo_NIKE.svg.png' },
    { id: '2', name: 'Adidas', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/20/Adidas_Logo.svg/1024px-Adidas_Logo.svg.png' },
    { id: '3', name: 'Zara', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/fd/Zara_Logo.svg/1024px-Zara_Logo.svg.png' },
    { id: '4', name: 'H&M', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/53/H%26M-Logo.svg/1024px-H%26M-Logo.svg.png' },
    { id: '5', name: 'Asics', logo: 'https://logos-world.net/wp-content/uploads/2020/03/ASICS-Symbol.jpg' },
    { id: '6', name: 'Gucci', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c5/Gucci_logo.svg/512px-Gucci_logo.svg.png' },
];

export const mockStats = {
    totalProducts: 1245,
    totalOrders: 856,
    totalRevenue: 1250000,
    totalUsers: 2340,
    pendingOrders: 23,
    lowStock: 12,
};
