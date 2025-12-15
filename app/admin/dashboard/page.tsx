"use client"
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import InventoryManagement from './InventoryManagement'
import PopularRewardsChart from './PopularRewardsChart'
import ActionHistory from './ActionHistory'

const basePath = process.env.NODE_ENV === 'production' ? '/reward-system' : ''

export default function AdminDashboard() {
  const router = useRouter()
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [showManageRewards, setShowManageRewards] = useState(false)
  const [showInventoryManagement, setShowInventoryManagement] = useState(false)
  const [showAnalytics, setShowAnalytics] = useState(false)
  const [showActionHistory, setShowActionHistory] = useState(false)
  const [rewardsList, setRewardsList] = useState<any[]>([])
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editValues, setEditValues] = useState({ name: '', points: '', category: '', quantity: '', variantType: '', variantOptions: '', galleries: {} as Record<string, string[]> })
  const [showAddCard, setShowAddCard] = useState(false)
  const [newReward, setNewReward] = useState({ name: '', points: '', category: 'Gadget', quantity: '', variantType: 'color', variantOptions: '', galleries: {} as Record<string, string[]> })
  const [editingGalleries, setEditingGalleries] = useState<Record<string, string[]>>({})
  const [newGalleries, setNewGalleries] = useState<Record<string, string[]>>({})
  const [activeTab, setActiveTab] = useState<'pending' | 'approved' | 'processing' | 'shipped' | 'delivered' | 'rejected'>('pending')
  
  // Category and Variant Type Management
  const [categories, setCategories] = useState(['Gadget', 'Car', 'Accessory', 'Merch', 'E-wallet'])
  const [variantTypes, setVariantTypes] = useState(['color', 'size', 'denomination'])
  const [showAddCategory, setShowAddCategory] = useState(false)
  const [showAddVariantType, setShowAddVariantType] = useState(false)
  const [newCategoryName, setNewCategoryName] = useState('')
  const [newVariantTypeName, setNewVariantTypeName] = useState('')
  
  // Reward Form Modal
  const [showRewardForm, setShowRewardForm] = useState(false)
  const [formMode, setFormMode] = useState<'add' | 'edit'>('add')
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'Gadget',
    variantType: 'color',
    points: '',
    quantity: '',
    tier: 'bronze',
    variants: [] as Array<{name: string, images: (string | File)[]}>
  })
  const [showRejectPopup, setShowRejectPopup] = useState(false)
  const [rejectReason, setRejectReason] = useState('')
  const [rejectingRequestId, setRejectingRequestId] = useState<string | null>(null)
  const [showErrorModal, setShowErrorModal] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [showVoiceVerifyModal, setShowVoiceVerifyModal] = useState(false)
  const [verifyingRequestId, setVerifyingRequestId] = useState<string | null>(null)
  const [verificationCode, setVerificationCode] = useState('')
  
  // Search and Filter States
  const [searchQuery, setSearchQuery] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)
  const [sortField, setSortField] = useState<'timestamp' | 'points' | 'name' | 'tier'>('timestamp')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc')
  
  // Sample data - replace with actual data from database
  const [requests, setRequests] = useState([
    // Pending requests
    { id: 'REQ-001', rewardName: 'Gaming Mouse', points: 150, username: 'user123', name: 'John Doe', phone: '+1234567890', address: '123 Main St, Manila', walletName: 'GCash', walletNumber: '0987654321', status: 'pending' as const, reason: '', variant: 'Black', timestamp: '2025-12-02 10:30 AM' },
    { id: 'REQ-002', rewardName: 'Keyboard', points: 200, username: 'gamer456', name: 'Jane Smith', phone: '+1234567891', address: '456 Oak Ave, Quezon City', walletName: 'PayMaya', walletNumber: '0987654322', status: 'pending' as const, reason: '', variant: 'Medium', timestamp: '2025-12-02 11:15 AM' },
    { id: 'REQ-003', rewardName: 'Headphones', points: 300, username: 'player789', name: 'Bob Johnson', phone: '+1234567892', address: '789 Pine Rd, Makati', walletName: 'GCash', walletNumber: '0987654323', status: 'pending' as const, reason: '', variant: 'White', timestamp: '2025-12-02 01:45 PM' },
    { id: 'REQ-004', rewardName: 'Hoodie', points: 250, username: 'streamer99', name: 'Alice Brown', phone: '+1234567893', address: '321 Elm St, Pasig', walletName: 'PayMaya', walletNumber: '0987654324', status: 'pending' as const, reason: '', variant: 'Large', timestamp: '2025-12-02 02:20 PM' },
    { id: 'REQ-039', rewardName: 'BMW M2 2025', points: 150000, username: 'richgamer1', name: 'Marcus Chen', phone: '+1234567830', address: '200 Luxury Ave, BGC', walletName: 'GCash', walletNumber: '0987654360', status: 'pending' as const, reason: '', variant: 'Black', timestamp: '2025-12-02 03:00 PM' },
    { id: 'REQ-040', rewardName: 'Gaming Chair', points: 450, username: 'sitter101', name: 'Nina Rodriguez', phone: '+1234567831', address: '201 Comfort St, Manila', walletName: 'PayMaya', walletNumber: '0987654361', status: 'pending' as const, reason: '', variant: 'Red', timestamp: '2025-12-02 03:30 PM' },
    { id: 'REQ-041', rewardName: 'Monitor 27"', points: 800, username: 'viewer202', name: 'Kevin Park', phone: '+1234567832', address: '202 Display Rd, Makati', walletName: 'GCash', walletNumber: '0987654362', status: 'pending' as const, reason: '', variant: '4K', timestamp: '2025-12-02 04:00 PM' },
    { id: 'REQ-042', rewardName: 'Mechanical Keyboard', points: 350, username: 'typer303', name: 'Sofia Martinez', phone: '+1234567833', address: '203 Click Ave, Pasig', walletName: 'PayMaya', walletNumber: '0987654363', status: 'pending' as const, reason: '', variant: 'Blue Switch', timestamp: '2025-12-02 04:30 PM' },
    { id: 'REQ-043', rewardName: 'Webcam Pro', points: 500, username: 'streamer404', name: 'Daniel Kim', phone: '+1234567834', address: '204 Stream Blvd, QC', walletName: 'GCash', walletNumber: '0987654364', status: 'pending' as const, reason: '', variant: '1080p', timestamp: '2025-12-02 05:00 PM' },
    { id: 'REQ-044', rewardName: 'Gaming Headset', points: 400, username: 'listener505', name: 'Emily Zhang', phone: '+1234567835', address: '205 Audio Lane, Taguig', walletName: 'PayMaya', walletNumber: '0987654365', status: 'pending' as const, reason: '', variant: 'RGB', timestamp: '2025-12-02 05:30 PM' },
    { id: 'REQ-045', rewardName: 'Mouse Pad XL', points: 100, username: 'slider606', name: 'James Wilson', phone: '+1234567836', address: '206 Glide St, Ortigas', walletName: 'GCash', walletNumber: '0987654366', status: 'pending' as const, reason: '', variant: 'Black', timestamp: '2025-12-02 06:00 PM' },
    { id: 'REQ-046', rewardName: 'USB Hub', points: 120, username: 'connect707', name: 'Maria Santos', phone: '+1234567837', address: '207 Port Ave, Manila', walletName: 'PayMaya', walletNumber: '0987654367', status: 'pending' as const, reason: '', variant: '7-Port', timestamp: '2025-12-02 06:30 PM' },
    { id: 'REQ-047', rewardName: 'LED Strip Lights', points: 80, username: 'glow808', name: 'Ryan Tan', phone: '+1234567838', address: '208 Light Rd, BGC', walletName: 'GCash', walletNumber: '0987654368', status: 'pending' as const, reason: '', variant: 'RGB', timestamp: '2025-12-02 07:00 PM' },
    { id: 'REQ-048', rewardName: 'Gaming Mouse', points: 150, username: 'clicker909', name: 'Jessica Lee', phone: '+1234567839', address: '209 Click Blvd, Makati', walletName: 'PayMaya', walletNumber: '0987654369', status: 'pending' as const, reason: '', variant: 'White', timestamp: '2025-12-02 07:30 PM' },
    { id: 'REQ-049', rewardName: 'Laptop Stand', points: 180, username: 'elevated010', name: 'Andrew Lim', phone: '+1234567840', address: '210 Height St, Pasig', walletName: 'GCash', walletNumber: '0987654370', status: 'pending' as const, reason: '', variant: 'Aluminum', timestamp: '2025-12-02 08:00 PM' },
    { id: 'REQ-050', rewardName: 'Microphone', points: 600, username: 'voice111', name: 'Samantha Cruz', phone: '+1234567841', address: '211 Sound Ave, QC', walletName: 'PayMaya', walletNumber: '0987654371', status: 'pending' as const, reason: '', variant: 'USB', timestamp: '2025-12-02 08:30 PM' },
    { id: 'REQ-051', rewardName: 'Stream Deck', points: 900, username: 'control212', name: 'Brandon Reyes', phone: '+1234567842', address: '212 Control Rd, Taguig', walletName: 'GCash', walletNumber: '0987654372', status: 'pending' as const, reason: '', variant: '15-Key', timestamp: '2025-12-02 09:00 PM' },
    { id: 'REQ-052', rewardName: 'Capture Card', points: 750, username: 'capture313', name: 'Victoria Ng', phone: '+1234567843', address: '213 Record Lane, Ortigas', walletName: 'PayMaya', walletNumber: '0987654373', status: 'pending' as const, reason: '', variant: '4K', timestamp: '2025-12-02 09:30 PM' },
    { id: 'REQ-053', rewardName: 'Ring Light', points: 200, username: 'bright414', name: 'Christopher Go', phone: '+1234567844', address: '214 Bright St, Manila', walletName: 'GCash', walletNumber: '0987654374', status: 'pending' as const, reason: '', variant: '18"', timestamp: '2025-12-02 10:00 PM' },
    { id: 'REQ-054', rewardName: 'Green Screen', points: 250, username: 'screen515', name: 'Amanda Sy', phone: '+1234567845', address: '215 Screen Ave, BGC', walletName: 'PayMaya', walletNumber: '0987654375', status: 'pending' as const, reason: '', variant: 'Collapsible', timestamp: '2025-12-02 10:30 PM' },
    { id: 'REQ-055', rewardName: 'Desk Mat', points: 90, username: 'desk616', name: 'Patrick Uy', phone: '+1234567846', address: '216 Desk Rd, Makati', walletName: 'GCash', walletNumber: '0987654376', status: 'pending' as const, reason: '', variant: 'XXL', timestamp: '2025-12-02 11:00 PM' },
    { id: 'REQ-056', rewardName: 'Cable Management', points: 60, username: 'tidy717', name: 'Michelle Tan', phone: '+1234567847', address: '217 Tidy Blvd, Pasig', walletName: 'PayMaya', walletNumber: '0987654377', status: 'pending' as const, reason: '', variant: 'Kit', timestamp: '2025-12-02 11:30 PM' },
    { id: 'REQ-057', rewardName: 'Wrist Rest', points: 70, username: 'comfort818', name: 'Nathan Chua', phone: '+1234567848', address: '218 Comfort Lane, QC', walletName: 'GCash', walletNumber: '0987654378', status: 'pending' as const, reason: '', variant: 'Memory Foam', timestamp: '2025-12-03 08:00 AM' },
    { id: 'REQ-058', rewardName: 'PS5 Controller', points: 400, username: 'console919', name: 'Rebecca Lim', phone: '+1234567849', address: '219 Console St, Taguig', walletName: 'PayMaya', walletNumber: '0987654379', status: 'pending' as const, reason: '', variant: 'White', timestamp: '2025-12-03 08:30 AM' },
    
    // Approved requests
    { id: 'REQ-005', rewardName: 'USB Cable', points: 80, username: 'techguy11', name: 'Mike Wilson', phone: '+1234567894', address: '555 Tech Blvd, BGC', walletName: 'GCash', walletNumber: '0987654325', status: 'approved' as const, reason: '', variant: 'White', timestamp: '2025-12-01 09:00 AM' },
    { id: 'REQ-006', rewardName: 'Phone Case', points: 50, username: 'designer22', name: 'Sarah Davis', phone: '+1234567895', address: '777 Design St, Taguig', walletName: 'PayMaya', walletNumber: '0987654326', status: 'approved' as const, reason: '', variant: 'Blue', timestamp: '2025-12-01 10:30 AM' },
    { id: 'REQ-007', rewardName: 'Webcam', points: 400, username: 'vlogger33', name: 'Tom Martinez', phone: '+1234567896', address: '888 Stream Ave, Ortigas', walletName: 'GCash', walletNumber: '0987654327', status: 'approved' as const, reason: '', variant: 'Black', timestamp: '2025-12-01 02:15 PM' },
    { id: 'REQ-008', rewardName: 'T-Shirt', points: 100, username: 'setupking', name: 'Emma Garcia', phone: '+1234567897', address: '999 Fashion Rd, Manila', walletName: 'PayMaya', walletNumber: '0987654328', status: 'approved' as const, reason: '', variant: 'Small', timestamp: '2025-12-01 03:45 PM' },
    { id: 'REQ-009', rewardName: 'Car Freshener', points: 75, username: 'progamer55', name: 'Chris Lee', phone: '+1234567898', address: '111 Auto Lane, QC', walletName: 'GCash', walletNumber: '0987654329', status: 'approved' as const, reason: '', variant: 'Vanilla', timestamp: '2025-12-01 04:30 PM' },
    { id: 'REQ-012', rewardName: 'Gaming Mouse', points: 150, username: 'player101', name: 'Mark Wilson', phone: '+1234567801', address: '222 Player St, Manila', walletName: 'GCash', walletNumber: '0987654332', status: 'approved' as const, reason: '', variant: 'Red', timestamp: '2025-11-30 09:15 AM' },
    { id: 'REQ-013', rewardName: 'Gaming Mouse', points: 150, username: 'gamer202', name: 'Rachel Green', phone: '+1234567802', address: '333 Gamer Ave, Taguig', walletName: 'PayMaya', walletNumber: '0987654333', status: 'approved' as const, reason: '', variant: 'Black', timestamp: '2025-11-30 10:45 AM' },
    { id: 'REQ-014', rewardName: 'Keyboard', points: 200, username: 'typist303', name: 'Ross Geller', phone: '+1234567803', address: '444 Type Rd, Makati', walletName: 'GCash', walletNumber: '0987654334', status: 'approved' as const, reason: '', variant: 'Large', timestamp: '2025-11-30 11:20 AM' },
    { id: 'REQ-015', rewardName: 'Phone Case', points: 50, username: 'mobile404', name: 'Monica Bing', phone: '+1234567804', address: '555 Mobile Blvd, Pasig', walletName: 'PayMaya', walletNumber: '0987654335', status: 'approved' as const, reason: '', variant: 'Red', timestamp: '2025-11-30 01:30 PM' },
    { id: 'REQ-016', rewardName: 'Headphones', points: 300, username: 'music505', name: 'Chandler Bing', phone: '+1234567805', address: '666 Music Lane, QC', walletName: 'GCash', walletNumber: '0987654336', status: 'approved' as const, reason: '', variant: 'Black', timestamp: '2025-11-30 02:15 PM' },
    { id: 'REQ-017', rewardName: 'T-Shirt', points: 100, username: 'fashion606', name: 'Joey Tribbiani', phone: '+1234567806', address: '777 Fashion St, BGC', walletName: 'PayMaya', walletNumber: '0987654337', status: 'approved' as const, reason: '', variant: 'Medium', timestamp: '2025-11-30 03:00 PM' },
    { id: 'REQ-018', rewardName: 'GCash Load', points: 500, username: 'cashback707', name: 'Phoebe Buffay', phone: '+1234567807', address: '888 Cash Ave, Manila', walletName: 'GCash', walletNumber: '0987654338', status: 'approved' as const, reason: '', variant: '500', timestamp: '2025-11-30 04:20 PM' },
    { id: 'REQ-019', rewardName: 'USB Cable', points: 80, username: 'cable808', name: 'Gunther Central', phone: '+1234567808', address: '999 Cable Rd, Ortigas', walletName: 'PayMaya', walletNumber: '0987654339', status: 'approved' as const, reason: '', variant: 'Black', timestamp: '2025-11-29 09:30 AM' },
    { id: 'REQ-020', rewardName: 'Hoodie', points: 250, username: 'warm909', name: 'Janice Hosenstein', phone: '+1234567809', address: '101 Warm St, Taguig', walletName: 'GCash', walletNumber: '0987654340', status: 'approved' as const, reason: '', variant: 'XL', timestamp: '2025-11-29 10:45 AM' },
    { id: 'REQ-021', rewardName: 'Gaming Mouse', points: 150, username: 'click010', name: 'Mike Hannigan', phone: '+1234567810', address: '102 Click Ave, Makati', walletName: 'PayMaya', walletNumber: '0987654341', status: 'approved' as const, reason: '', variant: 'White', timestamp: '2025-11-29 11:30 AM' },
    { id: 'REQ-022', rewardName: 'Phone Case', points: 50, username: 'protect111', name: 'Richard Burke', phone: '+1234567811', address: '103 Protect Blvd, Pasig', walletName: 'GCash', walletNumber: '0987654342', status: 'approved' as const, reason: '', variant: 'Black', timestamp: '2025-11-29 01:15 PM' },
    { id: 'REQ-023', rewardName: 'Car Freshener', points: 75, username: 'fresh212', name: 'Paolo Friend', phone: '+1234567812', address: '104 Fresh Lane, QC', walletName: 'PayMaya', walletNumber: '0987654343', status: 'approved' as const, reason: '', variant: 'Lavender', timestamp: '2025-11-29 02:45 PM' },
    { id: 'REQ-024', rewardName: 'Keyboard', points: 200, username: 'type313', name: 'Julie Friends', phone: '+1234567813', address: '105 Type St, Manila', walletName: 'GCash', walletNumber: '0987654344', status: 'approved' as const, reason: '', variant: 'Small', timestamp: '2025-11-29 03:30 PM' },
    { id: 'REQ-025', rewardName: 'T-Shirt', points: 100, username: 'wear414', name: 'Charlie Wheeler', phone: '+1234567814', address: '106 Wear Ave, BGC', walletName: 'PayMaya', walletNumber: '0987654345', status: 'approved' as const, reason: '', variant: 'Large', timestamp: '2025-11-29 04:00 PM' },
    { id: 'REQ-026', rewardName: 'Headphones', points: 300, username: 'audio515', name: 'Kathy Friends', phone: '+1234567815', address: '107 Audio Rd, Taguig', walletName: 'GCash', walletNumber: '0987654346', status: 'approved' as const, reason: '', variant: 'White', timestamp: '2025-11-28 09:00 AM' },
    { id: 'REQ-027', rewardName: 'GCash Load', points: 500, username: 'load616', name: 'Ursula Buffay', phone: '+1234567816', address: '108 Load Blvd, Ortigas', walletName: 'GCash', walletNumber: '0987654347', status: 'approved' as const, reason: '', variant: '1000', timestamp: '2025-11-28 10:30 AM' },
    { id: 'REQ-028', rewardName: 'USB Cable', points: 80, username: 'connect717', name: 'Frank Buffay', phone: '+1234567817', address: '109 Connect Lane, Makati', walletName: 'PayMaya', walletNumber: '0987654348', status: 'approved' as const, reason: '', variant: 'White', timestamp: '2025-11-28 11:45 AM' },
    { id: 'REQ-029', rewardName: 'Hoodie', points: 250, username: 'cozy818', name: 'Erica Bing', phone: '+1234567818', address: '110 Cozy St, Pasig', walletName: 'GCash', walletNumber: '0987654349', status: 'approved' as const, reason: '', variant: 'Medium', timestamp: '2025-11-28 01:20 PM' },
    { id: 'REQ-030', rewardName: 'Webcam', points: 400, username: 'stream919', name: 'Jack Bing', phone: '+1234567819', address: '111 Stream Ave, QC', walletName: 'PayMaya', walletNumber: '0987654350', status: 'approved' as const, reason: '', variant: 'Black', timestamp: '2025-11-28 02:50 PM' },
    { id: 'REQ-031', rewardName: 'Gaming Mouse', points: 150, username: 'game020', name: 'Ben Geller', phone: '+1234567820', address: '112 Game Rd, Manila', walletName: 'GCash', walletNumber: '0987654351', status: 'approved' as const, reason: '', variant: 'Red', timestamp: '2025-11-28 03:30 PM' },
    
    // Processing requests
    { id: 'REQ-032', rewardName: 'USB Cable', points: 80, username: 'process1', name: 'Alex Turner', phone: '+1234567821', address: '113 Process Blvd, BGC', walletName: 'GCash', walletNumber: '0987654352', status: 'processing' as const, reason: '', variant: 'Black', timestamp: '2025-12-02 09:00 AM' },
    { id: 'REQ-033', rewardName: 'Phone Case', points: 50, username: 'process2', name: 'Jamie Lee', phone: '+1234567822', address: '114 Process Lane, Taguig', walletName: 'PayMaya', walletNumber: '0987654353', status: 'processing' as const, reason: '', variant: 'Red', timestamp: '2025-12-02 10:30 AM' },
    
    // Shipped requests
    { id: 'REQ-034', rewardName: 'Keyboard', points: 200, username: 'ship1', name: 'Taylor Swift', phone: '+1234567823', address: '115 Ship St, Makati', walletName: 'GCash', walletNumber: '0987654354', status: 'shipped' as const, reason: '', variant: 'Large', timestamp: '2025-12-01 08:00 AM' },
    { id: 'REQ-035', rewardName: 'T-Shirt', points: 100, username: 'ship2', name: 'Chris Evans', phone: '+1234567824', address: '116 Ship Ave, Ortigas', walletName: 'PayMaya', walletNumber: '0987654355', status: 'shipped' as const, reason: '', variant: 'Medium', timestamp: '2025-12-01 11:00 AM' },
    { id: 'REQ-036', rewardName: 'Headphones', points: 300, username: 'ship3', name: 'Emma Stone', phone: '+1234567825', address: '117 Ship Rd, Pasig', walletName: 'GCash', walletNumber: '0987654356', status: 'shipped' as const, reason: '', variant: 'White', timestamp: '2025-12-01 02:00 PM' },
    
    // Delivered requests
    { id: 'REQ-037', rewardName: 'Gaming Mouse', points: 150, username: 'deliver1', name: 'Ryan Gosling', phone: '+1234567826', address: '118 Deliver Blvd, QC', walletName: 'GCash', walletNumber: '0987654357', status: 'delivered' as const, reason: '', variant: 'Black', timestamp: '2025-11-30 09:00 AM' },
    { id: 'REQ-038', rewardName: 'Hoodie', points: 250, username: 'deliver2', name: 'Scarlett Johansson', phone: '+1234567827', address: '119 Deliver Lane, Manila', walletName: 'PayMaya', walletNumber: '0987654358', status: 'delivered' as const, reason: '', variant: 'Large', timestamp: '2025-11-30 01:00 PM' },
    
    // Rejected requests
    { id: 'REQ-010', rewardName: 'GCash Load', points: 500, username: 'miner66', name: 'David Kim', phone: '+1234567899', address: '120 Miner St, BGC', walletName: 'GCash', walletNumber: '0987654330', status: 'rejected' as const, reason: 'Insufficient account activity', variant: '2000', timestamp: '2025-11-30 11:00 AM' },
    { id: 'REQ-011', rewardName: 'Keyboard', points: 200, username: 'student77', name: 'Lisa Wang', phone: '+1234567800', address: '121 Student Ave, Taguig', walletName: 'PayMaya', walletNumber: '0987654331', status: 'rejected' as const, reason: 'Duplicate request detected', variant: 'Medium', timestamp: '2025-11-30 03:20 PM' }
  ])
  
  // Filter and Sort Logic
  const getFilteredAndSortedRequests = () => {
    let filtered = requests.filter(r => r.status === activeTab)
    
    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(r => 
        r.id.toLowerCase().includes(query) ||
        r.username.toLowerCase().includes(query) ||
        r.name.toLowerCase().includes(query) ||
        r.phone.toLowerCase().includes(query) ||
        r.rewardName.toLowerCase().includes(query)
      )
    }
    
    // Date range filter
    if (dateFrom || dateTo) {
      filtered = filtered.filter(r => {
        const requestDate = new Date(r.timestamp)
        const fromDate = dateFrom ? new Date(dateFrom) : new Date('1900-01-01')
        const toDate = dateTo ? new Date(dateTo) : new Date('2100-12-31')
        return requestDate >= fromDate && requestDate <= toDate
      })
    }
    
    // Sorting
    filtered.sort((a, b) => {
      let aVal: any, bVal: any
      
      if (sortField === 'timestamp') {
        aVal = new Date(a.timestamp).getTime()
        bVal = new Date(b.timestamp).getTime()
      } else if (sortField === 'points') {
        aVal = a.points
        bVal = b.points
      } else if (sortField === 'name') {
        aVal = a.name.toLowerCase()
        bVal = b.name.toLowerCase()
      } else if (sortField === 'tier') {
        // Sort by tier: bronze < silver < gold < diamond < black-diamond
        const tierOrder: Record<string, number> = { 'bronze': 1, 'silver': 2, 'gold': 3, 'diamond': 4, 'black-diamond': 5 }
        const aTier = (a as any).tier?.toLowerCase() || 'bronze'
        const bTier = (b as any).tier?.toLowerCase() || 'bronze'
        aVal = tierOrder[aTier] || 0
        bVal = tierOrder[bTier] || 0
      }
      
      if (sortDirection === 'asc') {
        return aVal > bVal ? 1 : -1
      } else {
        return aVal < bVal ? 1 : -1
      }
    })
    
    return filtered
  }
  
  const filteredRequests = getFilteredAndSortedRequests()
  
  // Pagination
  const totalPages = Math.ceil(filteredRequests.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const paginatedRequests = filteredRequests.slice(startIndex, endIndex)
  
  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [searchQuery, dateFrom, dateTo, activeTab])
  
  const handleSort = (field: 'timestamp' | 'points' | 'name' | 'tier') => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('desc')
    }
  }
  
  const pendingCount = requests.filter(r => r.status === 'pending').length
  const approvedCount = requests.filter(r => r.status === 'approved').length
  const processingCount = requests.filter(r => r.status === 'processing').length
  const shippedCount = requests.filter(r => r.status === 'shipped').length
  const deliveredCount = requests.filter(r => r.status === 'delivered').length
  const rejectedCount = requests.filter(r => r.status === 'rejected').length

  useEffect(() => {
    const auth = sessionStorage.getItem('adminAuth')
    if (auth !== 'true') {
      router.push('/admin')
    } else {
      setIsAuthenticated(true)
      // Fetch claims and rewards from database
      fetchClaims()
      fetchRewards()
    }
  }, [router])

  const fetchClaims = async () => {
    try {
      const response = await fetch('/api/admin/claims')
      const result = await response.json()
      if (result.success && Array.isArray(result.data)) {
        setRequests(result.data)
      } else if (Array.isArray(result)) {
        setRequests(result)
      }
    } catch (error) {
      console.error('Error fetching claims:', error)
    }
  }

  const fetchRewards = async () => {
    try {
      const response = await fetch('/api/admin/rewards')
      const data = await response.json()
      if (Array.isArray(data)) {
        setRewardsList(data)
      }
    } catch (error) {
      console.error('Error fetching rewards:', error)
    }
  }

  const handleLogout = () => {
    sessionStorage.removeItem('adminAuth')
    router.push('/admin')
  }

  const handleDeleteReward = async (id: string | number) => {
    if (!confirm('Are you sure you want to delete this reward?')) return
    
    try {
      const response = await fetch(`/api/admin/rewards?id=${id}`, {
        method: 'DELETE'
      })
      
      if (response.ok) {
        setRewardsList(rewardsList.filter(reward => String(reward.id) !== String(id)))
      } else {
        const data = await response.json()
        setErrorMessage(data.error || 'Failed to delete reward')
        setShowErrorModal(true)
      }
    } catch (error) {
      console.error('Error deleting reward:', error)
      setErrorMessage('Error deleting reward')
      setShowErrorModal(true)
    }
  }

  const handleEditReward = (id: string | number) => {
    const reward = rewardsList.find(r => String(r.id) === String(id))
    if (reward) {
      setEditingId(String(id))
      const variants = (reward as any).variants || { type: 'color', options: [] }
      const galleries = (reward as any).galleries || {}
      setEditValues({ 
        name: reward.name, 
        points: reward.points.toString(), 
        category: (reward as any).category || 'Gadget', 
        quantity: ((reward as any).quantity || 0).toString(),
        variantType: variants.type || 'color',
        variantOptions: variants.options?.join(', ') || '',
        galleries: galleries
      })
      setEditingGalleries(JSON.parse(JSON.stringify(galleries)))
    }
  }

  const handleSaveEdit = async (id: string) => {
    try {
      const response = await fetch('/api/admin/rewards', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id,
          name: editValues.name,
          points: editValues.points,
          category: editValues.category,
          quantity: editValues.quantity,
          variantType: editValues.variantType,
          variantOptions: editValues.variantOptions,
          galleries: editingGalleries
        })
      })
      
      if (response.ok) {
        // Refresh rewards list from database to get updated galleries
        await fetchRewards()
        setEditingId(null)
        setEditValues({ name: '', points: '', category: '', quantity: '', variantType: '', variantOptions: '', galleries: {} })
        setEditingGalleries({})
      } else {
        alert('Failed to update reward')
      }
    } catch (error) {
      console.error('Error updating reward:', error)
      alert('Error updating reward')
    }
  }

  const handleCancelEdit = () => {
    setEditingId(null)
    setEditValues({ name: '', points: '', category: '', quantity: '', variantType: '', variantOptions: '', galleries: {} })
    setEditingGalleries({})
  }

  // New form handlers
  const handleOpenAddForm = () => {
    setFormMode('add')
    setFormData({
      name: '',
      description: '',
      category: categories[0] || 'Gadget',
      variantType: variantTypes[0] || 'color',
      points: '',
      quantity: '',
      tier: 'bronze',
      variants: []
    })
    setShowRewardForm(true)
  }

  const handleOpenEditForm = (reward: any) => {
    setFormMode('edit')
    setEditingId(reward.id)
    const variants = reward.variants?.options || []
    const galleries = reward.galleries || {}
    setFormData({
      name: reward.name,
      description: '', // Add description field to reward if needed
      category: reward.category,
      variantType: reward.variants?.type || 'color',
      points: reward.points.toString(),
      quantity: reward.quantity?.toString() || '0',
      tier: (reward as any).tier || 'bronze',
      variants: variants.map((v: string) => ({
        name: v,
        images: galleries[v] || ['', '', '', '']
      }))
    })
    setShowRewardForm(true)
  }

  const handleAddVariant = () => {
    setFormData({
      ...formData,
      variants: [...formData.variants, { name: '', images: ['', '', '', ''] }]
    })
  }

  const handleRemoveVariant = (index: number) => {
    setFormData({
      ...formData,
      variants: formData.variants.filter((_, i) => i !== index)
    })
  }

  const handleVariantChange = (index: number, field: 'name' | 'images', value: any) => {
    const updatedVariants = [...formData.variants]
    if (field === 'name') {
      updatedVariants[index].name = value
    } else {
      updatedVariants[index].images = value
    }
    setFormData({ ...formData, variants: updatedVariants })
  }

  const handleAddCategory = () => {
    if (newCategoryName.trim() && !categories.includes(newCategoryName.trim())) {
      setCategories([...categories, newCategoryName.trim()])
      setNewCategoryName('')
      setShowAddCategory(false)
    }
  }

  const handleAddVariantType = () => {
    if (newVariantTypeName.trim() && !variantTypes.includes(newVariantTypeName.trim())) {
      setVariantTypes([...variantTypes, newVariantTypeName.trim()])
      setNewVariantTypeName('')
      setShowAddVariantType(false)
    }
  }

  const handleSubmitRewardForm = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      // Upload files and get URLs
      const galleries: Record<string, string[]> = {}
      
      for (const variant of formData.variants) {
        if (!variant.name) continue
        
        const imageUrls: string[] = []
        for (const img of variant.images) {
          if (!img) {
            imageUrls.push('')
            continue
          }
          
          if (typeof img === 'string') {
            imageUrls.push(img) // Already a URL
          } else {
            // Upload file
            const uploadFormData = new FormData()
            uploadFormData.append('file', img)
            
            const uploadRes = await fetch('/api/upload', {
              method: 'POST',
              body: uploadFormData
            })
            
            if (!uploadRes.ok) throw new Error('Failed to upload image')
            const {url} = await uploadRes.json()
            imageUrls.push(url)
          }
        }
        
        galleries[variant.name] = imageUrls.filter(url => url.trim() !== '')
      }
      
      const variantOptions = formData.variants.map(v => v.name).join(', ')

      if (formMode === 'add') {
        const response = await fetch('/api/admin/rewards', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: formData.name,
            points: formData.points,
            category: formData.category,
            quantity: formData.quantity,
            variantType: formData.variantType,
            variantOptions,
            tier: formData.tier,
            galleries
          })
        })
        if (response.ok) {
          await fetchRewards()
          setShowRewardForm(false)
        } else {
          alert('Failed to add reward')
        }
      } else {
        const response = await fetch('/api/admin/rewards', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: editingId,
            name: formData.name,
            points: formData.points,
            category: formData.category,
            tier: formData.tier,
            quantity: formData.quantity,
            variantType: formData.variantType,
            variantOptions,
            galleries
          })
        })
        if (response.ok) {
          await fetchRewards()
          setShowRewardForm(false)
          setEditingId(null)
        } else {
          alert('Failed to update reward')
        }
      }
    } catch (error) {
      console.error('Error submitting reward:', error)
      alert('Error submitting reward')
    }
  }

  const handleAddReward = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const response = await fetch('/api/admin/rewards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newReward.name,
          points: newReward.points,
          category: newReward.category,
          quantity: newReward.quantity,
          variantType: newReward.variantType,
          variantOptions: newReward.variantOptions,
          galleries: newGalleries
        })
      })
      
      if (response.ok) {
        const data = await response.json()
        // Refresh rewards list from database
        await fetchRewards()
        setNewReward({ name: '', points: '', category: 'Gadget', quantity: '', variantType: 'color', variantOptions: '', galleries: {} })
        setNewGalleries({})
        setShowAddCard(false)
      } else {
        alert('Failed to add reward')
      }
    } catch (error) {
      console.error('Error adding reward:', error)
      alert('Error adding reward')
    }
  }

  const handleApprove = async (requestId: string) => {
    // Check if this is a high-value item (>100k points)
    const request = requests.find(r => r.id === requestId)
    if (request && request.points >= 100000) {
      // Show voice verification modal for high-value items
      setVerifyingRequestId(requestId)
      // Generate a random 6-digit verification code
      setVerificationCode(Math.floor(100000 + Math.random() * 900000).toString())
      setShowVoiceVerifyModal(true)
      return
    }
    
    // For non-high-value items, approve directly
    try {
      const response = await fetch('/api/admin/claims', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ claimId: requestId, status: 'approved' })
      })
      if (response.ok) {
        setRequests(requests.map(req => 
          req.id === requestId ? { ...req, status: 'approved' as const } : req
        ))
        // Refresh rewards list to update quantity
        await fetchRewards()
      } else {
        const data = await response.json()
        setErrorMessage(data.error || 'Failed to approve claim')
        setShowErrorModal(true)
      }
    } catch (error) {
      console.error('Error approving claim:', error)
      setErrorMessage('Error approving claim')
      setShowErrorModal(true)
    }
  }

  const handleVoiceVerifyConfirm = async () => {
    if (!verifyingRequestId) return
    
    try {
      const response = await fetch('/api/admin/claims', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          claimId: verifyingRequestId, 
          status: 'approved',
          voiceVerified: true 
        })
      })
      if (response.ok) {
        setRequests(requests.map(req => 
          req.id === verifyingRequestId ? { ...req, status: 'approved' as const } : req
        ))
        // Refresh rewards list to update quantity
        await fetchRewards()
        setShowVoiceVerifyModal(false)
        setVerifyingRequestId(null)
        setVerificationCode('')
      } else {
        const data = await response.json()
        setErrorMessage(data.error || 'Failed to approve claim')
        setShowErrorModal(true)
      }
    } catch (error) {
      console.error('Error approving claim:', error)
      setErrorMessage('Error approving claim')
      setShowErrorModal(true)
    }
  }

  const handleVoiceVerifyCancel = () => {
    setShowVoiceVerifyModal(false)
    setVerifyingRequestId(null)
    setVerificationCode('')
  }

  const handleQuickCall = (phoneNumber: string) => {
    // Open phone dialer with the number
    window.location.href = `tel:${phoneNumber}`
  }

  const handleRejectClick = (requestId: string) => {
    setRejectingRequestId(requestId)
    setShowRejectPopup(true)
  }

  const handleRejectSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (rejectingRequestId) {
      try {
        const response = await fetch('/api/admin/claims', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            claimId: rejectingRequestId, 
            status: 'rejected',
            rejectionReason: rejectReason 
          })
        })
        if (response.ok) {
          setRequests(requests.map(req => 
            req.id === rejectingRequestId ? { ...req, status: 'rejected' as const, reason: rejectReason } : req
          ))
        }
      } catch (error) {
        console.error('Error rejecting claim:', error)
      }
    }
    setShowRejectPopup(false)
    setRejectReason('')
    setRejectingRequestId(null)
  }

  const handleRejectCancel = () => {
    setShowRejectPopup(false)
    setRejectReason('')
    setRejectingRequestId(null)
  }

  const handleMoveToProcessing = async (requestId: string) => {
    try {
      const response = await fetch('/api/admin/claims', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ claimId: requestId, status: 'processing' })
      })
      if (response.ok) {
        setRequests(requests.map(req => 
          req.id === requestId ? { ...req, status: 'processing' as const } : req
        ))
      }
    } catch (error) {
      console.error('Error updating claim:', error)
    }
  }

  const handleMoveToShipped = async (requestId: string) => {
    try {
      const response = await fetch('/api/admin/claims', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ claimId: requestId, status: 'shipped' })
      })
      if (response.ok) {
        setRequests(requests.map(req => 
          req.id === requestId ? { ...req, status: 'shipped' as const } : req
        ))
      }
    } catch (error) {
      console.error('Error updating claim:', error)
    }
  }

  const handleMoveToDelivered = async (requestId: string) => {
    try {
      const response = await fetch('/api/admin/claims', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ claimId: requestId, status: 'delivered' })
      })
      if (response.ok) {
        setRequests(requests.map(req => 
          req.id === requestId ? { ...req, status: 'delivered' as const } : req
        ))
      }
    } catch (error) {
      console.error('Error updating claim:', error)
    }
  }

  if (!isAuthenticated) {
    return null
  }

  return (
    <div className="min-h-screen bg-[#181c23] text-white">
      {/* Header */}
      <div className="bg-[#23272f] border-b border-yellow-700 px-8 py-4 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <img src="/Time2Claim.png" alt="Time2Claim Logo" className="w-[140px]" />
          <span className="text-yellow-400 font-bold text-xl">Admin Dashboard</span>
        </div>
        <button
          onClick={handleLogout}
          className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-semibold transition"
        >
          Logout
        </button>
      </div>

      {/* Main Content */}
      <div className="p-8 max-w-[1600px] mx-auto">
        {/* Header Section */}
        <div className="mb-10">
          <h1 className="text-3xl font-bold text-white mb-2">Admin Dashboard</h1>
          <p className="text-gray-400">Manage rewards, inventory, and claim requests</p>
        </div>

        {/* Quick Actions - Simplified */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <button 
            onClick={() => setShowManageRewards(true)}
            className="bg-[#23272f] hover:bg-[#2a2e36] rounded-xl p-6 border border-yellow-700/30 hover:border-yellow-700/60 transition-all text-left group"
          >
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-yellow-400 font-semibold">Rewards</h3>
              <span className="text-2xl font-bold text-white">{rewardsList.length}</span>
            </div>
            <p className="text-gray-400 text-sm group-hover:text-gray-300 transition">Manage reward catalog</p>
          </button>
          
          <button 
            onClick={() => setShowInventoryManagement(true)}
            className="bg-[#23272f] hover:bg-[#2a2e36] rounded-xl p-6 border border-yellow-700/30 hover:border-yellow-700/60 transition-all text-left group"
          >
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-yellow-400 font-semibold">Inventory</h3>
              <span className="text-2xl font-bold text-white">Stock</span>
            </div>
            <p className="text-gray-400 text-sm group-hover:text-gray-300 transition">Track stock levels</p>
          </button>

          <button 
            onClick={() => setShowAnalytics(true)}
            className="bg-[#23272f] hover:bg-[#2a2e36] rounded-xl p-6 border border-yellow-700/30 hover:border-yellow-700/60 transition-all text-left group"
          >
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-yellow-400 font-semibold">Analytics</h3>
              <span className="text-2xl font-bold text-white">Charts</span>
            </div>
            <p className="text-gray-400 text-sm group-hover:text-gray-300 transition">View insights</p>
          </button>

          <button 
            onClick={() => setShowActionHistory(true)}
            className="bg-[#23272f] hover:bg-[#2a2e36] rounded-xl p-6 border border-yellow-700/30 hover:border-yellow-700/60 transition-all text-left group"
          >
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-yellow-400 font-semibold">Audit Logs</h3>
              <span className="text-2xl font-bold text-white">Logs</span>
            </div>
            <p className="text-gray-400 text-sm group-hover:text-gray-300 transition">View history</p>
          </button>
        </div>
        
        {/* Claim Requests Section */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-white mb-6">Claim Requests</h2>
          
          {/* Stats Grid - More compact */}
          <div className="grid grid-cols-3 md:grid-cols-6 gap-3 mb-6">
            <button 
              className={`rounded-lg p-4 border cursor-pointer transition text-left ${activeTab === 'pending' ? 'border-yellow-400 bg-yellow-700/20' : 'border-gray-700 hover:border-yellow-700/50'}`}
              onClick={() => setActiveTab('pending')}
            >
              <div className="text-xs text-gray-400 mb-1">Pending</div>
              <div className="text-2xl font-bold">{pendingCount}</div>
            </button>
            <button 
              className={`rounded-lg p-4 border cursor-pointer transition text-left ${activeTab === 'approved' ? 'border-green-400 bg-green-700/20' : 'border-gray-700 hover:border-green-700/50'}`}
              onClick={() => setActiveTab('approved')}
            >
              <div className={`text-xs mb-1 ${activeTab === 'approved' ? 'text-green-400' : 'text-gray-400'}`}>Approved</div>
              <div className="text-2xl font-bold">{approvedCount}</div>
            </button>
            <button 
              className={`rounded-lg p-4 border cursor-pointer transition text-left ${activeTab === 'processing' ? 'border-blue-400 bg-blue-700/20' : 'border-gray-700 hover:border-blue-700/50'}`}
              onClick={() => setActiveTab('processing')}
            >
              <div className={`text-xs mb-1 ${activeTab === 'processing' ? 'text-blue-400' : 'text-gray-400'}`}>Processing</div>
              <div className="text-2xl font-bold">{processingCount}</div>
            </button>
            <button 
              className={`rounded-lg p-4 border cursor-pointer transition text-left ${activeTab === 'shipped' ? 'border-purple-400 bg-purple-700/20' : 'border-gray-700 hover:border-purple-700/50'}`}
              onClick={() => setActiveTab('shipped')}
            >
              <div className={`text-xs mb-1 ${activeTab === 'shipped' ? 'text-purple-400' : 'text-gray-400'}`}>Shipped</div>
              <div className="text-2xl font-bold">{shippedCount}</div>
            </button>
            <button 
              className={`rounded-lg p-4 border cursor-pointer transition text-left ${activeTab === 'delivered' ? 'border-cyan-400 bg-cyan-700/20' : 'border-gray-700 hover:border-cyan-700/50'}`}
              onClick={() => setActiveTab('delivered')}
            >
              <div className={`text-xs mb-1 ${activeTab === 'delivered' ? 'text-cyan-400' : 'text-gray-400'}`}>Delivered</div>
              <div className="text-2xl font-bold">{deliveredCount}</div>
            </button>
            <button 
              className={`rounded-lg p-4 border cursor-pointer transition text-left ${activeTab === 'rejected' ? 'border-red-400 bg-red-700/20' : 'border-gray-700 hover:border-red-700/50'}`}
              onClick={() => setActiveTab('rejected')}
            >
              <div className={`text-xs mb-1 ${activeTab === 'rejected' ? 'text-red-400' : 'text-gray-400'}`}>Rejected</div>
              <div className="text-2xl font-bold">{rejectedCount}</div>
            </button>
          </div>
        </div>

        {/* Requests Table */}
        <div className="bg-[#23272f] rounded-xl border border-gray-700/50 overflow-hidden">
          <div className="bg-yellow-700 bg-opacity-20 px-6 py-4">
            <h2 className="text-2xl font-bold text-yellow-400">
              {activeTab === 'pending' && 'Pending Requests'}
              {activeTab === 'approved' && 'Approved Requests'}
              {activeTab === 'processing' && 'Processing Requests'}
              {activeTab === 'shipped' && 'Shipped Requests'}
              {activeTab === 'delivered' && 'Delivered Requests'}
              {activeTab === 'rejected' && 'Rejected Requests'}
            </h2>
          </div>
          
          {/* Search and Filter Bar */}
          <div className="px-6 py-4 bg-[#1a1d24] border-b border-gray-700">
            <div className="flex flex-wrap gap-4 items-end">
              {/* Search */}
              <div className="flex-1 min-w-[200px]">
                <label className="block text-sm font-semibold text-gray-300 mb-2">Search</label>
                <input
                  type="text"
                  placeholder="Search by ID, name, phone, reward..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-[#23272f] border border-gray-600 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:border-yellow-500 focus:outline-none"
                />
              </div>
              
              {/* Date From */}
              <div className="min-w-[150px]">
                <label className="block text-sm font-semibold text-gray-300 mb-2">From Date</label>
                <input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  className="w-full bg-[#23272f] border border-gray-600 rounded-lg px-4 py-2 text-white focus:border-yellow-500 focus:outline-none"
                />
              </div>
              
              {/* Date To */}
              <div className="min-w-[150px]">
                <label className="block text-sm font-semibold text-gray-300 mb-2">To Date</label>
                <input
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  className="w-full bg-[#23272f] border border-gray-600 rounded-lg px-4 py-2 text-white focus:border-yellow-500 focus:outline-none"
                />
              </div>
              
              {/* Items Per Page */}
              <div className="min-w-[120px]">
                <label className="block text-sm font-semibold text-gray-300 mb-2">Per Page</label>
                <select
                  value={itemsPerPage}
                  onChange={(e) => setItemsPerPage(Number(e.target.value))}
                  className="w-full bg-[#23272f] border border-gray-600 rounded-lg px-4 py-2 text-white focus:border-yellow-500 focus:outline-none"
                >
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                </select>
              </div>
              
              {/* Clear Filters */}
              <button
                onClick={() => {
                  setSearchQuery('')
                  setDateFrom('')
                  setDateTo('')
                }}
                className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg font-semibold transition"
              >
                Clear Filters
              </button>
            </div>
            
            {/* Results Info */}
            <div className="mt-3 text-sm text-gray-400">
              Showing {paginatedRequests.length > 0 ? startIndex + 1 : 0} - {Math.min(endIndex, filteredRequests.length)} of {filteredRequests.length} results
              {searchQuery && <span className="ml-2 text-yellow-400">(filtered by search)</span>}
              {(dateFrom || dateTo) && <span className="ml-2 text-yellow-400">(filtered by date)</span>}
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-yellow-700 bg-opacity-20">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-yellow-400">Request ID</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-yellow-400">Reward Name</th>
                  <th 
                    className="px-4 py-3 text-left text-sm font-semibold text-yellow-400 cursor-pointer hover:bg-yellow-700 hover:bg-opacity-30 transition"
                    onClick={() => handleSort('points')}
                  >
                    <div className="flex items-center gap-1">
                      Points
                      {sortField === 'points' && (
                        <span className="text-xs">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                      )}
                    </div>
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-yellow-400">Username</th>
                  <th 
                    className="px-4 py-3 text-left text-sm font-semibold text-yellow-400 cursor-pointer hover:bg-yellow-700 hover:bg-opacity-30 transition"
                    onClick={() => handleSort('name')}
                  >
                    <div className="flex items-center gap-1">
                      Name
                      {sortField === 'name' && (
                        <span className="text-xs">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                      )}
                    </div>
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-yellow-400">Phone Number</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-yellow-400">Address</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-yellow-400">Wallet Name</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-yellow-400">Wallet Number</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-yellow-400">Variant</th>
                  <th 
                    className="px-4 py-3 text-left text-sm font-semibold text-yellow-400 cursor-pointer hover:bg-yellow-700 hover:bg-opacity-30 transition"
                    onClick={() => handleSort('timestamp')}
                  >
                    <div className="flex items-center gap-1">
                      Timestamp
                      {sortField === 'timestamp' && (
                        <span className="text-xs">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                      )}
                    </div>
                  </th>
                  {(activeTab === 'pending' || activeTab === 'approved' || activeTab === 'processing' || activeTab === 'shipped') && <th className="px-4 py-3 text-left text-sm font-semibold text-yellow-400">Action</th>}
                  {activeTab === 'rejected' && <th className="px-4 py-3 text-left text-sm font-semibold text-yellow-400">Reason</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {/* Paginated and filtered data */}
                {paginatedRequests.map((request) => {
                  const isHighValue = request.points >= 100000
                  return (
                  <tr key={request.id} className="hover:bg-gray-800 transition">
                    <td className="px-4 py-3 text-sm">{request.id}</td>
                    <td className="px-4 py-3 text-sm">
                      <div className="flex flex-col gap-1">
                        <span>{request.rewardName}</span>
                        {isHighValue && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-orange-600 text-white text-xs font-medium rounded whitespace-nowrap w-fit">
                            Voice Verification Required
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm">{request.points.toLocaleString()}</td>
                    <td className="px-4 py-3 text-sm">{request.username}</td>
                    <td className="px-4 py-3 text-sm">{request.name}</td>
                    <td className="px-4 py-3 text-sm">
                      <div className="flex items-center gap-2">
                        <span>{request.phone}</span>
                        <button
                          onClick={() => handleQuickCall(request.phone)}
                          className="bg-green-600 hover:bg-green-700 text-white px-2 py-1 rounded text-xs font-semibold transition"
                          title="Quick Call"
                        >
                          Call
                        </button>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm">{(request as any).address || 'N/A'}</td>
                    <td className="px-4 py-3 text-sm">{request.walletName}</td>
                    <td className="px-4 py-3 text-sm">{request.walletNumber}</td>
                    <td className="px-4 py-3 text-sm">{(request as any).variant || 'N/A'}</td>
                    <td className="px-4 py-3 text-sm text-gray-300">{request.timestamp}</td>
                    {activeTab === 'pending' && (
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          <button 
                            className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-xs font-semibold transition"
                            onClick={() => handleApprove(request.id)}
                          >
                            Approve
                          </button>
                          <button 
                            className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-xs font-semibold transition"
                            onClick={() => handleRejectClick(request.id)}
                          >
                            Reject
                          </button>
                        </div>
                      </td>
                    )}
                    {activeTab === 'approved' && (
                      <td className="px-4 py-3">
                        <button 
                          className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-xs font-semibold transition"
                          onClick={() => handleMoveToProcessing(request.id)}
                        >
                          Move to Processing
                        </button>
                      </td>
                    )}
                    {activeTab === 'processing' && (
                      <td className="px-4 py-3">
                        <button 
                          className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-1 rounded text-xs font-semibold transition"
                          onClick={() => handleMoveToShipped(request.id)}
                        >
                          Move to Shipped
                        </button>
                      </td>
                    )}
                    {activeTab === 'shipped' && (
                      <td className="px-4 py-3">
                        <button 
                          className="bg-cyan-600 hover:bg-cyan-700 text-white px-3 py-1 rounded text-xs font-semibold transition"
                          onClick={() => handleMoveToDelivered(request.id)}
                        >
                          Move to Delivered
                        </button>
                      </td>
                    )}
                    {activeTab === 'rejected' && (
                      <td className="px-4 py-3 text-sm">{request.reason || 'No reason provided'}</td>
                    )}
                  </tr>
                )})}
                {/* Empty State */}
                {paginatedRequests.length === 0 && (
                  <tr>
                    <td colSpan={(activeTab === 'approved' || activeTab === 'processing' || activeTab === 'shipped' || activeTab === 'delivered') ? 12 : (activeTab === 'pending' || activeTab === 'rejected') ? 12 : 11} className="px-4 py-8 text-center text-gray-400">
                      {searchQuery || dateFrom || dateTo ? 'No results found matching your filters' : `No ${activeTab} requests found`}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          
          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="px-6 py-4 bg-[#1a1d24] border-t border-gray-700 flex justify-between items-center">
              <div className="text-sm text-gray-400">
                Page {currentPage} of {totalPages}
              </div>
              
              <div className="flex gap-2">
                <button
                  onClick={() => setCurrentPage(1)}
                  disabled={currentPage === 1}
                  className="px-3 py-1 bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 disabled:text-gray-600 disabled:cursor-not-allowed text-white rounded font-semibold transition text-sm"
                >
                  First
                </button>
                <button
                  onClick={() => setCurrentPage(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-3 py-1 bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 disabled:text-gray-600 disabled:cursor-not-allowed text-white rounded font-semibold transition text-sm"
                >
                  Previous
                </button>
                
                {/* Page Numbers */}
                <div className="flex gap-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum
                    if (totalPages <= 5) {
                      pageNum = i + 1
                    } else if (currentPage <= 3) {
                      pageNum = i + 1
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i
                    } else {
                      pageNum = currentPage - 2 + i
                    }
                    
                    return (
                      <button
                        key={pageNum}
                        onClick={() => setCurrentPage(pageNum)}
                        className={`px-3 py-1 rounded font-semibold transition text-sm ${
                          currentPage === pageNum
                            ? 'bg-yellow-600 text-white'
                            : 'bg-gray-700 hover:bg-gray-600 text-white'
                        }`}
                      >
                        {pageNum}
                      </button>
                    )
                  })}
                </div>
                
                <button
                  onClick={() => setCurrentPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 disabled:text-gray-600 disabled:cursor-not-allowed text-white rounded font-semibold transition text-sm"
                >
                  Next
                </button>
                <button
                  onClick={() => setCurrentPage(totalPages)}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 disabled:text-gray-600 disabled:cursor-not-allowed text-white rounded font-semibold transition text-sm"
                >
                  Last
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Manage Rewards Popup */}
      {showManageRewards && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black bg-opacity-80" onClick={() => setShowManageRewards(false)}>
          <div className="bg-[#23272f] rounded-2xl shadow-2xl p-8 max-w-6xl w-full max-h-[90vh] overflow-y-auto relative" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-3xl font-extrabold text-yellow-400">Manage Rewards</h2>
              <button className="text-gray-400 hover:text-yellow-300 text-2xl font-bold" onClick={() => setShowManageRewards(false)}>&times;</button>
            </div>
            
            <button 
              onClick={handleOpenAddForm}
              className="mb-6 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-bold shadow-lg transition flex items-center gap-2"
            >
              <span className="text-2xl">+</span> Add New Reward
            </button>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {/* Reward Cards */}
              {rewardsList.map((item) => {
                const galleries = (item as any).galleries || {}
                const firstVariant = (item as any).variants?.options?.[0] || ''
                const firstImage = galleries[firstVariant]?.[0] || ''
                
                return (
                <div key={item.id} className="flex flex-col items-center rounded-2xl p-6 shadow-2xl border-2 border-yellow-400" style={{background: 'linear-gradient(180deg, #FFB300 0%, #FF9800 100%)'}}>
                  {firstImage ? (
                    <div className="w-full h-32 mb-4 rounded-xl overflow-hidden shadow-inner border border-yellow-400">
                      <img 
                        src={firstImage} 
                        alt={item.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none'
                          e.currentTarget.parentElement!.innerHTML = '<div class="w-full h-full bg-yellow-200 flex items-center justify-center text-black font-bold text-sm">NO IMAGE</div>'
                        }}
                      />
                    </div>
                  ) : (
                    <div className="w-full h-32 bg-yellow-200 rounded-xl mb-4 flex items-center justify-center text-black font-bold text-sm shadow-inner border border-yellow-400">NO IMAGE</div>
                  )}
                  <div className="text-black font-extrabold text-xl mb-1 text-center">{item.name}</div>
                  <div className="text-black mb-1 text-center font-medium">Points: <span className="text-yellow-900 font-bold">{item.points}</span></div>
                  <div className="text-black mb-1 text-center text-sm">Category: <span className="text-yellow-900 font-semibold">{(item as any).category || 'N/A'}</span></div>
                  <div className="text-black mb-3 text-center text-sm">Quantity: <span className="text-yellow-900 font-semibold">{(item as any).quantity || 0}</span></div>
                  <div className="flex gap-2 w-full">
                    <button
                      type="button"
                      className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-bold shadow transition"
                      onClick={() => handleOpenEditForm(item)}
                    >
                      EDIT
                    </button>
                    <button
                      type="button"
                      className="flex-1 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-bold shadow transition"
                      onClick={() => handleDeleteReward(item.id)}
                    >
                      DELETE
                    </button>
                  </div>
                </div>
                )
              })}
            </div>
          </div>
        </div>
      )}

      {/* Inventory Management Modal */}
      {showInventoryManagement && (
        <InventoryManagement
          onClose={() => setShowInventoryManagement(false)}
          rewards={rewardsList}
          onRefresh={fetchRewards}
        />
      )}

      {/* New Reward Form Modal */}
      {showRewardForm && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black bg-opacity-90" onClick={() => setShowRewardForm(false)}>
          <div className="bg-[#1a1d24] rounded-2xl shadow-2xl p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto relative border-2 border-yellow-500" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-3xl font-extrabold text-yellow-400">{formMode === 'add' ? 'Add New Reward' : 'Edit Reward'}</h2>
              <button className="text-gray-400 hover:text-yellow-300 text-3xl font-bold" onClick={() => setShowRewardForm(false)}>&times;</button>
            </div>

            <form onSubmit={handleSubmitRewardForm} className="space-y-6">
              {/* Gallery Upload Section */}
              <div className="bg-[#23272f] p-6 rounded-lg border border-yellow-600">
                <h3 className="text-yellow-400 font-bold text-lg mb-4">Gallery Images (per variant)</h3>
                {formData.variants.length > 0 ? (
                  <div className="space-y-4">
                    {formData.variants.map((variant, vIndex) => (
                      <div key={vIndex} className="bg-[#2a2e36] p-4 rounded-lg border border-gray-600">
                        <div className="flex justify-between items-center mb-3">
                          <span className="text-white font-semibold">{variant.name || `Variant ${vIndex + 1}`}</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveVariant(vIndex)}
                            className="text-red-400 hover:text-red-300 text-sm"
                          >
                            Remove
                          </button>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          {variant.images.map((img, imgIndex) => {
                            const previewUrl = img ? (typeof img === 'string' ? img : URL.createObjectURL(img)) : ''
                            
                            return (
                              <div key={imgIndex}>
                                <label className="block text-gray-400 text-xs mb-1">Image {imgIndex + 1}</label>
                                <input
                                  type="file"
                                  accept="image/*"
                                  onChange={(e) => {
                                    const file = e.target.files?.[0]
                                    if (file) {
                                      const newImages = [...variant.images]
                                      newImages[imgIndex] = file
                                      handleVariantChange(vIndex, 'images', newImages)
                                    }
                                  }}
                                  className="w-full px-2 py-1 bg-[#1a1d24] text-white rounded border border-gray-600 focus:outline-none focus:border-yellow-500 text-xs file:mr-2 file:py-1 file:px-3 file:rounded file:border-0 file:text-xs file:font-semibold file:bg-yellow-600 file:text-white hover:file:bg-yellow-700"
                                />
                                {previewUrl && (
                                  <div className="relative mt-2">
                                    <img src={previewUrl} alt={`Preview ${imgIndex + 1}`} className="w-full h-20 object-cover rounded" onError={(e) => e.currentTarget.style.display = 'none'} />
                                    <button
                                      type="button"
                                      onClick={() => {
                                        const newImages = [...variant.images]
                                        newImages[imgIndex] = ''
                                        handleVariantChange(vIndex, 'images', newImages)
                                      }}
                                      className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-red-600"
                                    >
                                      ×
                                    </button>
                                  </div>
                                )}
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-400 text-sm">Add variants below to upload gallery images</p>
                )}
              </div>

              {/* Reward Name */}
              <div>
                <label className="block text-yellow-400 font-semibold mb-2">Reward Name *</label>
                <input
                  type="text"
                  placeholder="Enter reward name"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full px-4 py-3 bg-[#23272f] text-white rounded-lg border border-yellow-600 focus:outline-none focus:border-yellow-400"
                  required
                />
              </div>

              {/* Reward Description */}
              <div>
                <label className="block text-yellow-400 font-semibold mb-2">Reward Details</label>
                <textarea
                  placeholder="Enter reward description or details"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="w-full px-4 py-3 bg-[#23272f] text-white rounded-lg border border-yellow-600 focus:outline-none focus:border-yellow-400 min-h-[100px]"
                />
              </div>

              {/* Category with Add Function */}
              <div>
                <label className="block text-yellow-400 font-semibold mb-2">Category *</label>
                <div className="flex gap-2">
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({...formData, category: e.target.value})}
                    className="flex-1 px-4 py-3 bg-[#23272f] text-white rounded-lg border border-yellow-600 focus:outline-none focus:border-yellow-400"
                    required
                  >
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                  {!showAddCategory ? (
                    <button
                      type="button"
                      onClick={() => setShowAddCategory(true)}
                      className="px-4 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-bold transition"
                    >
                      + Add
                    </button>
                  ) : (
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="New category"
                        value={newCategoryName}
                        onChange={(e) => setNewCategoryName(e.target.value)}
                        className="px-3 py-2 bg-[#23272f] text-white rounded-lg border border-green-500 focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={handleAddCategory}
                        className="px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-bold"
                      >
                        ✓
                      </button>
                      <button
                        type="button"
                        onClick={() => { setShowAddCategory(false); setNewCategoryName(''); }}
                        className="px-3 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-bold"
                      >
                        ✕
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Variant Type with Add Function */}
              <div>
                <label className="block text-yellow-400 font-semibold mb-2">Variant Type *</label>
                <div className="flex gap-2">
                  <select
                    value={formData.variantType}
                    onChange={(e) => setFormData({...formData, variantType: e.target.value})}
                    className="flex-1 px-4 py-3 bg-[#23272f] text-white rounded-lg border border-yellow-600 focus:outline-none focus:border-yellow-400 capitalize"
                    required
                  >
                    {variantTypes.map(type => (
                      <option key={type} value={type} className="capitalize">{type}</option>
                    ))}
                  </select>
                  {!showAddVariantType ? (
                    <button
                      type="button"
                      onClick={() => setShowAddVariantType(true)}
                      className="px-4 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-bold transition"
                    >
                      + Add
                    </button>
                  ) : (
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="New variant type"
                        value={newVariantTypeName}
                        onChange={(e) => setNewVariantTypeName(e.target.value)}
                        className="px-3 py-2 bg-[#23272f] text-white rounded-lg border border-green-500 focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={handleAddVariantType}
                        className="px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-bold"
                      >
                        ✓
                      </button>
                      <button
                        type="button"
                        onClick={() => { setShowAddVariantType(false); setNewVariantTypeName(''); }}
                        className="px-3 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-bold"
                      >
                        ✕
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Variant Options - Shopify Style */}
              <div className="bg-[#23272f] p-6 rounded-lg border border-yellow-600">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-yellow-400 font-bold text-lg">Variant Options</h3>
                  <button
                    type="button"
                    onClick={handleAddVariant}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold transition text-sm"
                  >
                    + Add Variant
                  </button>
                </div>
                <div className="space-y-3">
                  {formData.variants.map((variant, index) => (
                    <div key={index} className="flex items-center gap-3 bg-[#2a2e36] p-3 rounded-lg">
                      <span className="text-gray-400 font-semibold min-w-[80px]">Option {index + 1}:</span>
                      <input
                        type="text"
                        placeholder={`e.g., ${formData.variantType === 'color' ? 'Black' : formData.variantType === 'size' ? 'Medium' : '100'}`}
                        value={variant.name}
                        onChange={(e) => handleVariantChange(index, 'name', e.target.value)}
                        className="flex-1 px-3 py-2 bg-[#1a1d24] text-white rounded border border-gray-600 focus:outline-none focus:border-yellow-500"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveVariant(index)}
                        className="px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded font-bold text-sm"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                  {formData.variants.length === 0 && (
                    <p className="text-gray-400 text-sm text-center py-4">No variants added yet. Click "Add Variant" to start.</p>
                  )}
                </div>
              </div>

              {/* Points and Quantity */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-yellow-400 font-semibold mb-2">Points *</label>
                  <input
                    type="number"
                    placeholder="Enter points required"
                    value={formData.points}
                    onChange={(e) => setFormData({...formData, points: e.target.value})}
                    className="w-full px-4 py-3 bg-[#23272f] text-white rounded-lg border border-yellow-600 focus:outline-none focus:border-yellow-400"
                    required
                  />
                </div>
                <div>
                  <label className="block text-yellow-400 font-semibold mb-2">Quantity *</label>
                  <input
                    type="number"
                    placeholder="Enter available quantity"
                    value={formData.quantity}
                    onChange={(e) => setFormData({...formData, quantity: e.target.value})}
                    className="w-full px-4 py-3 bg-[#23272f] text-white rounded-lg border border-yellow-600 focus:outline-none focus:border-yellow-400"
                    required
                  />
                </div>
              </div>

              {/* Tier Selection */}
              <div>
                <label className="block text-yellow-400 font-semibold mb-2">Prestige Tier *</label>
                <select
                  value={formData.tier}
                  onChange={(e) => setFormData({...formData, tier: e.target.value})}
                  className="w-full px-4 py-3 bg-[#23272f] text-white rounded-lg border border-yellow-600 focus:outline-none focus:border-yellow-400"
                  required
                >
                  <option value="bronze">Bronze - Entry Level</option>
                  <option value="silver">Silver - Mid Range</option>
                  <option value="gold">Gold - Premium</option>
                  <option value="diamond">Diamond - Luxury</option>
                  <option value="black-diamond">Black Diamond - Ultra Exclusive</option>
                </select>
                <p className="text-gray-400 text-xs mt-2">Select the prestige tier for this reward card</p>
              </div>

              {/* Submit Buttons */}
              <div className="flex gap-4 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white px-6 py-4 rounded-lg font-bold text-lg shadow-lg transition"
                >
                  {formMode === 'add' ? 'Create Reward' : 'Update Reward'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowRewardForm(false)}
                  className="flex-1 bg-gray-600 hover:bg-gray-700 text-white px-6 py-4 rounded-lg font-bold text-lg shadow-lg transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}


      
      {/* Reject Reason Popup */}
      {showRejectPopup && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black bg-opacity-80" onClick={handleRejectCancel}>
          <div className="bg-[#23272f] rounded-2xl shadow-2xl p-8 max-w-md w-full relative border-2 border-red-400" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-extrabold text-red-400">Reject Request</h2>
              <button className="text-gray-400 hover:text-red-300 text-2xl font-bold" onClick={handleRejectCancel}>&times;</button>
            </div>
            
            <form onSubmit={handleRejectSubmit}>
              <label className="block text-yellow-100 text-sm font-semibold mb-2">Reason for Rejection</label>
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                className="w-full px-4 py-3 bg-gray-900 text-yellow-100 rounded-lg border border-red-400 focus:outline-none focus:border-red-300 resize-none"
                rows={4}
                placeholder="Enter the reason for rejecting this request..."
                required
              />
              
              <div className="flex gap-3 mt-6">
                <button
                  type="submit"
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-bold shadow transition"
                >
                  Reject Request
                </button>
                <button
                  type="button"
                  className="flex-1 bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg font-bold shadow transition"
                  onClick={handleRejectCancel}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Voice Verification Modal - Compact */}
      {showVoiceVerifyModal && verifyingRequestId && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black bg-opacity-90 p-4" onClick={handleVoiceVerifyCancel}>
          <div className="bg-[#23272f] rounded-xl shadow-2xl p-6 max-w-md w-full mx-4 border border-orange-500/50" onClick={(e) => e.stopPropagation()}>
            <div className="flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-orange-400">Voice Verification</h2>
                <button className="text-gray-400 hover:text-orange-300 text-xl font-bold" onClick={handleVoiceVerifyCancel}>&times;</button>
              </div>
              
              {(() => {
                const request = requests.find(r => r.id === verifyingRequestId)
                if (!request) return null
                
                return (
                  <>
                    <div className="bg-[#1a1d24] border border-orange-700/30 rounded-lg p-4 mb-4">
                      <div className="space-y-2 text-sm">
                        <div><span className="text-gray-400">Reward:</span> <span className="text-white font-semibold">{request.rewardName}</span></div>
                        <div><span className="text-gray-400">Points:</span> <span className="text-orange-400 font-bold">{request.points.toLocaleString()}</span></div>
                        <div><span className="text-gray-400">User:</span> <span className="text-white">{request.name}</span></div>
                        <div><span className="text-gray-400">Phone:</span> <span className="text-white font-mono">{request.phone}</span></div>
                      </div>
                    </div>

                    <div className="bg-[#1a1d24] border border-yellow-700/30 rounded-lg p-3 mb-4 text-center">
                      <p className="text-yellow-300 font-semibold mb-2 text-sm">Verification Code:</p>
                      <p className="text-2xl font-bold text-orange-400 tracking-widest font-mono">{verificationCode}</p>
                      <p className="text-xs text-gray-400 mt-2">Ask user to read back this code</p>
                    </div>

                    <div className="flex gap-2 mb-2">
                      <button
                        onClick={() => handleQuickCall(request.phone)}
                        className="flex-1 bg-green-600 hover:bg-green-700 text-white px-4 py-2.5 rounded-lg font-semibold transition text-sm"
                      >
                        Call
                      </button>
                      <button
                        onClick={handleVoiceVerifyConfirm}
                        className="flex-1 bg-orange-600 hover:bg-orange-700 text-white px-4 py-2.5 rounded-lg font-semibold transition text-sm"
                      >
                        Verified
                      </button>
                    </div>

                    <button
                      onClick={handleVoiceVerifyCancel}
                      className="w-full bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg font-semibold transition text-sm"
                    >
                      Cancel
                    </button>
                  </>
                )
              })()}
            </div>
          </div>
        </div>
      )}

      {/* Error Modal */}
      {showErrorModal && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black bg-opacity-75" onClick={() => setShowErrorModal(false)}>
          <div className="bg-gradient-to-br from-red-900 via-gray-900 to-black rounded-2xl shadow-2xl p-8 max-w-md w-full mx-4 border-2 border-red-500" onClick={(e) => e.stopPropagation()}>
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center mb-4">
                <span className="text-4xl">⚠️</span>
              </div>
              <h2 className="text-2xl font-extrabold text-red-400 mb-4 text-center">Error</h2>
              <p className="text-yellow-100 text-center mb-6 leading-relaxed">{errorMessage}</p>
              <button
                onClick={() => setShowErrorModal(false)}
                className="bg-red-600 hover:bg-red-700 text-white px-8 py-3 rounded-lg font-bold shadow-lg transition w-full"
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Analytics Modal */}
      {showAnalytics && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75 p-4" onClick={() => setShowAnalytics(false)}>
          <div className="bg-[#181c23] rounded-lg w-full max-w-[95vw] max-h-[90vh] overflow-hidden border-2 border-yellow-700" onClick={(e) => e.stopPropagation()}>
            <div className="bg-yellow-700 bg-opacity-20 px-6 py-4 flex justify-between items-center border-b border-yellow-700">
              <h2 className="text-2xl font-bold text-yellow-400">Analytics Dashboard</h2>
              <button
                onClick={() => setShowAnalytics(false)}
                className="text-yellow-400 hover:text-yellow-300 text-3xl font-bold"
              >
                ×
              </button>
            </div>
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
              <PopularRewardsChart />
            </div>
          </div>
        </div>
      )}

      {/* Action History Modal */}
      {showActionHistory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75 p-4" onClick={() => setShowActionHistory(false)}>
          <div className="bg-[#181c23] rounded-lg w-full max-w-[95vw] max-h-[90vh] overflow-hidden border-2 border-yellow-700" onClick={(e) => e.stopPropagation()}>
            <div className="bg-yellow-700 bg-opacity-20 px-6 py-4 flex justify-between items-center border-b border-yellow-700">
              <h2 className="text-2xl font-bold text-yellow-400">Action History & Audit Logs</h2>
              <button
                onClick={() => setShowActionHistory(false)}
                className="text-yellow-400 hover:text-yellow-300 text-3xl font-bold"
              >
                ×
              </button>
            </div>
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
              <ActionHistory />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
