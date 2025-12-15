const { createClient } = require('@supabase/supabase-js');

// Supabase credentials (kajiraw06's project)
const supabaseUrl = 'https://jbxgcdsgwrrmfuhcanjd.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpieGdjZHNnd3JybWZ1aGNhbmpkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUzOTQwMzksImV4cCI6MjA4MDk3MDAzOX0.CMjg15lIAe0XVy5e-ydkyd0PqNS5Z1LC1-S8GG52PyM';

const supabase = createClient(supabaseUrl, supabaseKey);

// Rewards data from rewardsData.ts
const rewards = [
  { id: 1, name: 'Gaming Mouse', points: 150, category: 'Gadget', quantity: 5, variants: { type: 'color', options: ['Black', 'White', 'Red'] }, image: 'https://placehold.co/400x300/000000/FFFFFF?text=Black+Mouse', 
    galleries: {
      'Black': ['https://placehold.co/400x300/000000/FFFFFF?text=Black+Mouse+1', 'https://placehold.co/400x300/1a1a1a/FFFFFF?text=Black+Mouse+2', 'https://placehold.co/400x300/0d0d0d/FFFFFF?text=Black+Mouse+3', 'https://placehold.co/400x300/262626/FFFFFF?text=Black+Mouse+4'],
      'White': ['https://placehold.co/400x300/FFFFFF/000000?text=White+Mouse+1', 'https://placehold.co/400x300/f5f5f5/000000?text=White+Mouse+2', 'https://placehold.co/400x300/e8e8e8/000000?text=White+Mouse+3', 'https://placehold.co/400x300/fafafa/000000?text=White+Mouse+4'],
      'Red': ['https://placehold.co/400x300/FF0000/FFFFFF?text=Red+Mouse+1', 'https://placehold.co/400x300/cc0000/FFFFFF?text=Red+Mouse+2', 'https://placehold.co/400x300/e60000/FFFFFF?text=Red+Mouse+3', 'https://placehold.co/400x300/ff3333/FFFFFF?text=Red+Mouse+4']
    } },
  { id: 2, name: 'Keyboard', points: 200, category: 'Gadget', quantity: 0, variants: { type: 'color', options: ['Black', 'White'] }, image: 'https://placehold.co/400x300/000000/FFFFFF?text=Black+Keyboard', 
    galleries: {
      'Black': ['https://placehold.co/400x300/000000/FFFFFF?text=Black+KB+1', 'https://placehold.co/400x300/1a1a1a/FFFFFF?text=Black+KB+2', 'https://placehold.co/400x300/0d0d0d/FFFFFF?text=Black+KB+3', 'https://placehold.co/400x300/262626/FFFFFF?text=Black+KB+4'],
      'White': ['https://placehold.co/400x300/FFFFFF/000000?text=White+KB+1', 'https://placehold.co/400x300/f5f5f5/000000?text=White+KB+2', 'https://placehold.co/400x300/e8e8e8/000000?text=White+KB+3', 'https://placehold.co/400x300/fafafa/000000?text=White+KB+4']
    } },
  { id: 3, name: 'Phone Case', points: 50, category: 'Accessory', quantity: 50, variants: { type: 'color', options: ['Clear', 'Black', 'Blue'] }, image: 'https://placehold.co/400x300/f0f0f0/000000?text=Clear+Case', 
    galleries: {
      'Clear': ['https://placehold.co/400x300/f0f0f0/000000?text=Clear+Case+1', 'https://placehold.co/400x300/e8e8e8/000000?text=Clear+Case+2', 'https://placehold.co/400x300/ffffff/000000?text=Clear+Case+3', 'https://placehold.co/400x300/fafafa/000000?text=Clear+Case+4'],
      'Black': ['https://placehold.co/400x300/000000/FFFFFF?text=Black+Case+1', 'https://placehold.co/400x300/1a1a1a/FFFFFF?text=Black+Case+2', 'https://placehold.co/400x300/0d0d0d/FFFFFF?text=Black+Case+3', 'https://placehold.co/400x300/262626/FFFFFF?text=Black+Case+4'],
      'Blue': ['https://placehold.co/400x300/0000FF/FFFFFF?text=Blue+Case+1', 'https://placehold.co/400x300/0066cc/FFFFFF?text=Blue+Case+2', 'https://placehold.co/400x300/3399ff/FFFFFF?text=Blue+Case+3', 'https://placehold.co/400x300/0080ff/FFFFFF?text=Blue+Case+4']
    } },
  { id: 4, name: 'Headphones', points: 300, category: 'Gadget', quantity: 10, variants: { type: 'color', options: ['Black', 'Silver'] }, image: 'https://placehold.co/400x300/000000/FFFFFF?text=Black+Headphones', 
    galleries: {
      'Black': ['https://placehold.co/400x300/000000/FFFFFF?text=Black+HP+1', 'https://placehold.co/400x300/1a1a1a/FFFFFF?text=Black+HP+2', 'https://placehold.co/400x300/0d0d0d/FFFFFF?text=Black+HP+3', 'https://placehold.co/400x300/262626/FFFFFF?text=Black+HP+4'],
      'Silver': ['https://placehold.co/400x300/C0C0C0/000000?text=Silver+HP+1', 'https://placehold.co/400x300/b8b8b8/000000?text=Silver+HP+2', 'https://placehold.co/400x300/d4d4d4/000000?text=Silver+HP+3', 'https://placehold.co/400x300/cccccc/000000?text=Silver+HP+4']
    } },
  { id: 5, name: 'T-Shirt', points: 100, category: 'Merch', quantity: 30, variants: { type: 'size', options: ['Small', 'Medium', 'Large', 'XL'] }, image: 'https://placehold.co/400x300/4169E1/FFFFFF?text=T-Shirt+Small', 
    galleries: {
      'Small': ['https://placehold.co/400x300/4169E1/FFFFFF?text=Small+S+1', 'https://placehold.co/400x300/4682B4/FFFFFF?text=Small+S+2', 'https://placehold.co/400x300/4876B8/FFFFFF?text=Small+S+3', 'https://placehold.co/400x300/5F9EFF/FFFFFF?text=Small+S+4'],
      'Medium': ['https://placehold.co/400x300/32CD32/FFFFFF?text=Medium+M+1', 'https://placehold.co/400x300/228B22/FFFFFF?text=Medium+M+2', 'https://placehold.co/400x300/2E8B57/FFFFFF?text=Medium+M+3', 'https://placehold.co/400x300/3CB371/FFFFFF?text=Medium+M+4'],
      'Large': ['https://placehold.co/400x300/FF8C00/FFFFFF?text=Large+L+1', 'https://placehold.co/400x300/FFA500/FFFFFF?text=Large+L+2', 'https://placehold.co/400x300/FF7F00/FFFFFF?text=Large+L+3', 'https://placehold.co/400x300/FF9F00/FFFFFF?text=Large+L+4'],
      'XL': ['https://placehold.co/400x300/DC143C/FFFFFF?text=XL+1', 'https://placehold.co/400x300/B22222/FFFFFF?text=XL+2', 'https://placehold.co/400x300/FF0000/FFFFFF?text=XL+3', 'https://placehold.co/400x300/CD5C5C/FFFFFF?text=XL+4']
    } },
  { id: 6, name: 'GCash', points: 1000, category: 'E-wallet', quantity: 100, variants: { type: 'denomination', options: ['1k', '5k', '10k', '25k', '50k'] }, image: '/gcash.png', 
    galleries: {
      '1k': ['/gcash.png', '/gcash.png', '/gcash.png', '/gcash.png'],
      '5k': ['/gcash.png', '/gcash.png', '/gcash.png', '/gcash.png'],
      '10k': ['/gcash.png', '/gcash.png', '/gcash.png', '/gcash.png'],
      '25k': ['/gcash.png', '/gcash.png', '/gcash.png', '/gcash.png'],
      '50k': ['/gcash.png', '/gcash.png', '/gcash.png', '/gcash.png']
    } },
  { id: 7, name: 'Car Freshener', points: 75, category: 'Car', quantity: 20, variants: { type: 'scent', options: ['Vanilla', 'Lavender', 'Ocean'] }, image: 'https://placehold.co/400x300/F3E5AB/000000?text=Vanilla+Scent', 
    galleries: {
      'Vanilla': ['https://placehold.co/400x300/F3E5AB/000000?text=Vanilla+1', 'https://placehold.co/400x300/FFE5B4/000000?text=Vanilla+2', 'https://placehold.co/400x300/FFDEAD/000000?text=Vanilla+3', 'https://placehold.co/400x300/F5DEB3/000000?text=Vanilla+4'],
      'Lavender': ['https://placehold.co/400x300/9B59B6/FFFFFF?text=Lavender+1', 'https://placehold.co/400x300/8E44AD/FFFFFF?text=Lavender+2', 'https://placehold.co/400x300/A569BD/FFFFFF?text=Lavender+3', 'https://placehold.co/400x300/AF7AC5/FFFFFF?text=Lavender+4'],
      'Ocean': ['https://placehold.co/400x300/0088CC/FFFFFF?text=Ocean+1', 'https://placehold.co/400x300/0099DD/FFFFFF?text=Ocean+2', 'https://placehold.co/400x300/00AAEE/FFFFFF?text=Ocean+3', 'https://placehold.co/400x300/00BBFF/FFFFFF?text=Ocean+4']
    } },
  { id: 8, name: 'USB Cable', points: 80, category: 'Accessory', quantity: 40, variants: { type: 'length', options: ['1m', '2m', '3m'] }, image: 'https://placehold.co/400x300/555555/FFFFFF?text=USB+Cable+1m', 
    galleries: {
      '1m': ['https://placehold.co/400x300/555555/FFFFFF?text=1+Meter+1', 'https://placehold.co/400x300/666666/FFFFFF?text=1+Meter+2', 'https://placehold.co/400x300/4A4A4A/FFFFFF?text=1+Meter+3', 'https://placehold.co/400x300/5A5A5A/FFFFFF?text=1+Meter+4'],
      '2m': ['https://placehold.co/400x300/FF9800/FFFFFF?text=2+Meter+1', 'https://placehold.co/400x300/FB8C00/FFFFFF?text=2+Meter+2', 'https://placehold.co/400x300/F57C00/FFFFFF?text=2+Meter+3', 'https://placehold.co/400x300/EF6C00/FFFFFF?text=2+Meter+4'],
      '3m': ['https://placehold.co/400x300/4CAF50/FFFFFF?text=3+Meter+1', 'https://placehold.co/400x300/43A047/FFFFFF?text=3+Meter+2', 'https://placehold.co/400x300/388E3C/FFFFFF?text=3+Meter+3', 'https://placehold.co/400x300/2E7D32/FFFFFF?text=3+Meter+4']
    } },
  { id: 9, name: 'Hoodie', points: 250, category: 'Merch', quantity: 12, variants: { type: 'color', options: ['Black', 'White', 'Red'] }, image: 'https://placehold.co/400x300/000000/FFFFFF?text=Black+Hoodie', 
    galleries: {
      'Black': ['https://placehold.co/400x300/000000/FFFFFF?text=Black+Hoodie+1', 'https://placehold.co/400x300/1a1a1a/FFFFFF?text=Black+Hoodie+2', 'https://placehold.co/400x300/0d0d0d/FFFFFF?text=Black+Hoodie+3', 'https://placehold.co/400x300/262626/FFFFFF?text=Black+Hoodie+4'],
      'White': ['https://placehold.co/400x300/FFFFFF/000000?text=White+Hoodie+1', 'https://placehold.co/400x300/f5f5f5/000000?text=White+Hoodie+2', 'https://placehold.co/400x300/e8e8e8/000000?text=White+Hoodie+3', 'https://placehold.co/400x300/fafafa/000000?text=White+Hoodie+4'],
      'Red': ['https://placehold.co/400x300/DC143C/FFFFFF?text=Red+Hoodie+1', 'https://placehold.co/400x300/B22222/FFFFFF?text=Red+Hoodie+2', 'https://placehold.co/400x300/FF0000/FFFFFF?text=Red+Hoodie+3', 'https://placehold.co/400x300/8B0000/FFFFFF?text=Red+Hoodie+4']
    } },
  { id: 10, name: 'Webcam', points: 400, category: 'Gadget', quantity: 8, variants: { type: 'resolution', options: ['720p', '1080p', '4K'] }, image: 'https://placehold.co/400x300/1976D2/FFFFFF?text=Webcam+720p', 
    galleries: {
      '720p': ['https://placehold.co/400x300/1976D2/FFFFFF?text=720p+HD+1', 'https://placehold.co/400x300/1E88E5/FFFFFF?text=720p+HD+2', 'https://placehold.co/400x300/1565C0/FFFFFF?text=720p+HD+3', 'https://placehold.co/400x300/2196F3/FFFFFF?text=720p+HD+4'],
      '1080p': ['https://placehold.co/400x300/7B1FA2/FFFFFF?text=1080p+Full+HD+1', 'https://placehold.co/400x300/8E24AA/FFFFFF?text=1080p+Full+HD+2', 'https://placehold.co/400x300/6A1B9A/FFFFFF?text=1080p+Full+HD+3', 'https://placehold.co/400x300/9C27B0/FFFFFF?text=1080p+Full+HD+4'],
      '4K': ['https://placehold.co/400x300/C62828/FFFFFF?text=4K+Ultra+HD+1', 'https://placehold.co/400x300/D32F2F/FFFFFF?text=4K+Ultra+HD+2', 'https://placehold.co/400x300/B71C1C/FFFFFF?text=4K+Ultra+HD+3', 'https://placehold.co/400x300/E53935/FFFFFF?text=4K+Ultra+HD+4']
    } },
  { id: 11, name: 'iPhone 16 Pro Max', points: 50000, category: 'Gadget', quantity: 3, variants: { type: 'color', options: ['Black Titanium', 'White Titanium', 'Natural Titanium', 'Desert Titanium'] }, image: '/iphone.png', 
    galleries: {
      'Black Titanium': ['/iphone.png', '/iphone.png', '/iphone.png', '/iphone.png'],
      'White Titanium': ['/iphone.png', '/iphone.png', '/iphone.png', '/iphone.png'],
      'Natural Titanium': ['/iphone.png', '/iphone.png', '/iphone.png', '/iphone.png'],
      'Desert Titanium': ['/iphone.png', '/iphone.png', '/iphone.png', '/iphone.png']
    } },
  { id: 12, name: 'BMW M2 2025', points: 500000, category: 'Car', quantity: 1, variants: { type: 'color', options: ['Alpine White', 'Black Sapphire', 'San Marino Blue'] }, image: '/Front-angled-bmw.png', 
    galleries: {
      'Alpine White': ['/Front-angled-bmw.png', '/sideviewbmw.png', '/back-profile-bmw.png', '/Top-down-bmw.png'],
      'Black Sapphire': ['/Front-angle-black-bmw.png', '/side-black-bmw.png', '/Rear-angled-bmwblack.png', '/Top-down-blackbmw.png'],
      'San Marino Blue': ['/frontview-blue.png', '/side-bmw-blue.png', '/bmw-blue-back.png', '/bmw-blue-top.png']
    } },
  { id: 13, name: 'Rolex Submariner', points: 100000, category: 'Accessory', quantity: 2, variants: { type: 'color', options: ['Black', 'Green', 'Blue'] }, image: 'https://placehold.co/400x300/000000/FFFFFF?text=Black+Rolex', 
    galleries: {
      'Black': ['https://placehold.co/400x300/000000/FFFFFF?text=Black+Rolex+1', 'https://placehold.co/400x300/1a1a1a/FFFFFF?text=Black+Rolex+2', 'https://placehold.co/400x300/0d0d0d/FFFFFF?text=Black+Rolex+3', 'https://placehold.co/400x300/262626/FFFFFF?text=Black+Rolex+4'],
      'Green': ['https://placehold.co/400x300/22C55E/FFFFFF?text=Green+Rolex+1', 'https://placehold.co/400x300/16A34A/FFFFFF?text=Green+Rolex+2', 'https://placehold.co/400x300/15803D/FFFFFF?text=Green+Rolex+3', 'https://placehold.co/400x300/14532D/FFFFFF?text=Green+Rolex+4'],
      'Blue': ['https://placehold.co/400x300/0000FF/FFFFFF?text=Blue+Rolex+1', 'https://placehold.co/400x300/0066CC/FFFFFF?text=Blue+Rolex+2', 'https://placehold.co/400x300/0044AA/FFFFFF?text=Blue+Rolex+3', 'https://placehold.co/400x300/0055BB/FFFFFF?text=Blue+Rolex+4']
    } },
  { id: 14, name: 'Vivo X100 Pro', points: 25000, category: 'Gadget', quantity: 5, variants: { type: 'color', options: ['Asteroid Black', 'Stardust Blue'] }, image: 'https://placehold.co/400x300/1A1A1A/FFFFFF?text=Asteroid+Black', 
    galleries: {
      'Asteroid Black': ['https://placehold.co/400x300/1A1A1A/FFFFFF?text=Asteroid+Black+1', 'https://placehold.co/400x300/0D0D0D/FFFFFF?text=Asteroid+Black+2', 'https://placehold.co/400x300/262626/FFFFFF?text=Asteroid+Black+3', 'https://placehold.co/400x300/1F1F1F/FFFFFF?text=Asteroid+Black+4'],
      'Stardust Blue': ['https://placehold.co/400x300/3B82F6/FFFFFF?text=Stardust+Blue+1', 'https://placehold.co/400x300/2563EB/FFFFFF?text=Stardust+Blue+2', 'https://placehold.co/400x300/1D4ED8/FFFFFF?text=Stardust+Blue+3', 'https://placehold.co/400x300/60A5FA/FFFFFF?text=Stardust+Blue+4']
    } },
  { id: 15, name: 'Yamaha Aerox 2025', points: 150000, category: 'Car', quantity: 2, variants: { type: 'color', options: ['Matte Black', 'Racing Blue', 'Matte Red'] }, image: '/aerox-black.png', 
    galleries: {
      'Matte Black': ['/aerox-black.png', '/aerox-black.png', '/aerox-black.png', '/aerox-black.png'],
      'Racing Blue': ['/blue-aerox.png', '/blue-aerox.png', '/blue-aerox.png', '/blue-aerox.png'],
      'Matte Red': ['/red-aerox.png', '/red-aerox.png', '/red-aerox.png', '/red-aerox.png']
    } },
  { id: 16, name: 'MacBook Pro 14"', points: 75000, category: 'Gadget', quantity: 2, variants: { type: 'color', options: ['Space Gray', 'Silver'] }, image: '/macbook.png', 
    galleries: {
      'Space Gray': ['/macbook.png', '/macbook.png', '/macbook.png', '/macbook.png'],
      'Silver': ['/macbook.png', '/macbook.png', '/macbook.png', '/macbook.png']
    } },
  { id: 17, name: 'iPad Pro 12.9"', points: 45000, category: 'Gadget', quantity: 4, variants: { type: 'color', options: ['Space Gray', 'Silver'] }, image: '/ipad.png', 
    galleries: {
      'Space Gray': ['/ipad.png', '/ipad.png', '/ipad.png', '/ipad.png'],
      'Silver': ['/ipad.png', '/ipad.png', '/ipad.png', '/ipad.png']
    } },
  { id: 18, name: 'AirPods Pro', points: 12000, category: 'Gadget', quantity: 10, variants: { type: 'color', options: ['White'] }, image: '/airpods.png', 
    galleries: {
      'White': ['/airpods.png', '/airpods.png', '/airpods.png', '/airpods.png']
    } },
  { id: 19, name: 'Apple Watch Ultra', points: 35000, category: 'Accessory', quantity: 3, variants: { type: 'color', options: ['Titanium', 'Black Titanium'] }, image: '/applewatch.png', 
    galleries: {
      'Titanium': ['/applewatch.png', '/applewatch.png', '/applewatch.png', '/applewatch.png'],
      'Black Titanium': ['/applewatch.png', '/applewatch.png', '/applewatch.png', '/applewatch.png']
    } },
  { id: 20, name: 'PlayStation 5', points: 25000, category: 'Gadget', quantity: 5, variants: { type: 'edition', options: ['Standard', 'Digital'] }, image: '/ps5.png', 
    galleries: {
      'Standard': ['/ps5.png', '/ps5.png', '/ps5.png', '/ps5.png'],
      'Digital': ['/ps5.png', '/ps5.png', '/ps5.png', '/ps5.png']
    } },
  { id: 21, name: 'Samsung Z Fold 5', points: 60000, category: 'Gadget', quantity: 2, variants: { type: 'color', options: ['Phantom Black', 'Cream', 'Icy Blue'] }, image: '/samsung-z-fold.png', 
    galleries: {
      'Phantom Black': ['/samsung-z-fold.png', '/samsung-z-fold.png', '/samsung-z-fold.png', '/samsung-z-fold.png'],
      'Cream': ['/samsung-z-fold.png', '/samsung-z-fold.png', '/samsung-z-fold.png', '/samsung-z-fold.png'],
      'Icy Blue': ['/samsung-z-fold.png', '/samsung-z-fold.png', '/samsung-z-fold.png', '/samsung-z-fold.png']
    } },
  { id: 22, name: 'ASUS ROG Laptop', points: 80000, category: 'Gadget', quantity: 2, variants: { type: 'spec', options: ['RTX 4060', 'RTX 4070', 'RTX 4080'] }, image: '/asus.png', 
    galleries: {
      'RTX 4060': ['/asus.png', '/asus.png', '/asus.png', '/asus.png'],
      'RTX 4070': ['/asus.png', '/asus.png', '/asus.png', '/asus.png'],
      'RTX 4080': ['/asus.png', '/asus.png', '/asus.png', '/asus.png']
    } },
  { id: 23, name: 'Lenovo ThinkPad', points: 55000, category: 'Gadget', quantity: 3, variants: { type: 'spec', options: ['i5 16GB', 'i7 32GB'] }, image: '/lenovo.png', 
    galleries: {
      'i5 16GB': ['/lenovo.png', '/lenovo.png', '/lenovo.png', '/lenovo.png'],
      'i7 32GB': ['/lenovo.png', '/lenovo.png', '/lenovo.png', '/lenovo.png']
    } },
  { id: 24, name: 'Smart TV 55"', points: 30000, category: 'Gadget', quantity: 4, variants: { type: 'brand', options: ['Samsung', 'LG', 'Sony'] }, image: '/tv.png', 
    galleries: {
      'Samsung': ['/tv.png', '/tv.png', '/tv.png', '/tv.png'],
      'LG': ['/tv.png', '/tv.png', '/tv.png', '/tv.png'],
      'Sony': ['/tv.png', '/tv.png', '/tv.png', '/tv.png']
    } },
  { id: 25, name: 'Refrigerator', points: 20000, category: 'Gadget', quantity: 3, variants: { type: 'size', options: ['Single Door', 'Double Door'] }, image: '/refrigerator.png', 
    galleries: {
      'Single Door': ['/refrigerator.png', '/refrigerator.png', '/refrigerator.png', '/refrigerator.png'],
      'Double Door': ['/refrigerator.png', '/refrigerator.png', '/refrigerator.png', '/refrigerator.png']
    } },
  { id: 26, name: 'Washing Machine', points: 15000, category: 'Gadget', quantity: 5, variants: { type: 'type', options: ['Top Load', 'Front Load'] }, image: '/washing.png', 
    galleries: {
      'Top Load': ['/washing.png', '/washing.png', '/washing.png', '/washing.png'],
      'Front Load': ['/washing.png', '/washing.png', '/washing.png', '/washing.png']
    } },
  { id: 27, name: 'Microwave Oven', points: 5000, category: 'Gadget', quantity: 10, variants: { type: 'size', options: ['20L', '25L', '30L'] }, image: '/microwave.png', 
    galleries: {
      '20L': ['/microwave.png', '/microwave.png', '/microwave.png', '/microwave.png'],
      '25L': ['/microwave.png', '/microwave.png', '/microwave.png', '/microwave.png'],
      '30L': ['/microwave.png', '/microwave.png', '/microwave.png', '/microwave.png']
    } },
  { id: 28, name: 'Rice Cooker', points: 3000, category: 'Gadget', quantity: 15, variants: { type: 'size', options: ['1.0L', '1.8L', '2.2L'] }, image: '/ricecooker.png', 
    galleries: {
      '1.0L': ['/ricecooker.png', '/ricecooker.png', '/ricecooker.png', '/ricecooker.png'],
      '1.8L': ['/ricecooker.png', '/ricecooker.png', '/ricecooker.png', '/ricecooker.png'],
      '2.2L': ['/ricecooker.png', '/ricecooker.png', '/ricecooker.png', '/ricecooker.png']
    } },
  { id: 29, name: 'Designer Bag', points: 40000, category: 'Accessory', quantity: 3, variants: { type: 'color', options: ['Black', 'Brown', 'Tan'] }, image: '/bag.png', 
    galleries: {
      'Black': ['/bag.png', '/bag.png', '/bag.png', '/bag.png'],
      'Brown': ['/bag.png', '/bag.png', '/bag.png', '/bag.png'],
      'Tan': ['/bag.png', '/bag.png', '/bag.png', '/bag.png']
    } },
  { id: 30, name: 'Vacation Package', points: 200000, category: 'Merch', quantity: 2, variants: { type: 'destination', options: ['Boracay', 'Palawan', 'Cebu'] }, image: '/vacation.png', 
    galleries: {
      'Boracay': ['/vacation.png', '/vacation.png', '/vacation.png', '/vacation.png'],
      'Palawan': ['/vacation.png', '/vacation.png', '/vacation.png', '/vacation.png'],
      'Cebu': ['/vacation.png', '/vacation.png', '/vacation.png', '/vacation.png']
    } },
];

// Helper function to determine tier
function getTier(points, itemName) {
  if (points >= 200000 || itemName.toLowerCase().includes('bmw') || itemName.toLowerCase().includes('mercedes')) {
    return 'black-diamond';
  }
  if (points >= 75000 || itemName.toLowerCase().includes('rolex')) {
    return 'diamond';
  }
  if (points >= 25000 || itemName.toLowerCase().includes('iphone') || itemName.toLowerCase().includes('macbook') || itemName.toLowerCase().includes('ipad')) {
    return 'gold';
  }
  if (points >= 500) {
    return 'silver';
  }
  return 'bronze';
}

async function clearDatabase() {
  console.log('🗑️  Clearing existing data...');
  
  // Delete in order due to foreign keys
  await supabase.from('reward_galleries').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  await supabase.from('reward_variants').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  await supabase.from('claims').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  await supabase.from('rewards').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  
  console.log('✅ Database cleared!\n');
}

async function seedRewards() {
  console.log('\n╔══════════════════════════════════════════════════════════════════╗');
  console.log('║           Seeding Rewards to Supabase Database                  ║');
  console.log('╚══════════════════════════════════════════════════════════════════╝\n');

  // Clear existing data first
  await clearDatabase();

  let successCount = 0;
  let errorCount = 0;

  for (const reward of rewards) {
    try {
      console.log(`📦 Adding: ${reward.name}...`);
      
      // 1. Insert the reward
      const tier = getTier(reward.points, reward.name);
      const { data: rewardData, error: rewardError } = await supabase
        .from('rewards')
        .insert({
          name: reward.name,
          points: reward.points,
          category: reward.category,
          quantity: reward.quantity,
          variant_type: reward.variants?.type || null,
          tier: tier
        })
        .select()
        .single();

      if (rewardError) {
        console.error(`   ❌ Error inserting reward: ${rewardError.message}`);
        errorCount++;
        continue;
      }

      const rewardId = rewardData.id;

      // 2. Insert variants if exists
      if (reward.variants && reward.variants.options) {
        for (const optionName of reward.variants.options) {
          const { data: variantData, error: variantError } = await supabase
            .from('reward_variants')
            .insert({
              reward_id: rewardId,
              option_name: optionName
            })
            .select()
            .single();

          if (variantError) {
            console.error(`   ❌ Error inserting variant ${optionName}: ${variantError.message}`);
            continue;
          }

          const variantId = variantData.id;

          // 3. Insert gallery images for this variant
          if (reward.galleries && reward.galleries[optionName]) {
            const galleryImages = reward.galleries[optionName];
            for (let i = 0; i < galleryImages.length && i < 4; i++) {
              const { error: galleryError } = await supabase
                .from('reward_galleries')
                .insert({
                  variant_id: variantId,
                  image_url: galleryImages[i],
                  image_order: i
                });

              if (galleryError) {
                console.error(`   ❌ Error inserting gallery image: ${galleryError.message}`);
              }
            }
          }
        }
      }

      console.log(`   ✅ ${reward.name} added successfully (Tier: ${tier})`);
      successCount++;
    } catch (error) {
      console.error(`   ❌ Error processing ${reward.name}:`, error.message);
      errorCount++;
    }
  }

  console.log('\n══════════════════════════════════════════════════════════════════');
  console.log(`✅ Successfully added: ${successCount} rewards`);
  console.log(`❌ Errors: ${errorCount}`);
  console.log('══════════════════════════════════════════════════════════════════\n');

  // Verify the data
  const { data: finalRewards, error } = await supabase
    .from('rewards')
    .select('id, name, points, category, tier')
    .order('points', { ascending: false });

  if (!error && finalRewards) {
    console.log('📊 Rewards in database:\n');
    finalRewards.forEach((r, i) => {
      console.log(`   ${i + 1}. ${r.name} - ${r.points.toLocaleString()} pts (${r.tier})`);
    });
  }
}

// Run the seeding
seedRewards().catch(console.error);
