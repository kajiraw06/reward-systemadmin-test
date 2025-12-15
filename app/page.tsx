
"use client"
import Image from 'next/image'
import { useState, useMemo, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import dynamic from 'next/dynamic'

const PointsRangeSlider = dynamic(() => import('./PointsRangeSlider'), { ssr: false })

const basePath = '' // Removed basePath for local development with API routes

const ITEMS_PER_PAGE = 8

// Default points range (will be updated when rewards are loaded)
let MIN_POINTS = 50
let MAX_POINTS = 500000

// Banner images for carousel
const bannerImages = [
  { src: '/Time2Claim.png', alt: 'Time2Claim banner' },
  { src: '/iphone17promax.png', alt: 'iPhone 17 Pro Max' },
  { src: '/bmw.png', alt: 'BMW M2 2025' },
]

export default function Home() {
  const [rewards, setRewards] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedReward, setSelectedReward] = useState<null | any>(null)
  const [selectedGalleryImage, setSelectedGalleryImage] = useState(0)
  const [selectedVariant, setSelectedVariant] = useState<string>('')
  const [categoryFilter, setCategoryFilter] = useState<string[]>([])
  const [tierFilter, setTierFilter] = useState<string[]>([])
  const [pointsRange, setPointsRange] = useState<[number, number]>([MIN_POINTS, MAX_POINTS])
  const [sortOrder, setSortOrder] = useState<'high-low' | 'low-high'>('high-low')
  const [selectedVariants, setSelectedVariants] = useState<Record<number, string>>({})
  const [currentPage, setCurrentPage] = useState(1)
  const [searchQuery, setSearchQuery] = useState('')
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [claimId, setClaimId] = useState('')
  const [showClaimsChecker, setShowClaimsChecker] = useState(false)
  const [checkClaimId, setCheckClaimId] = useState('')
  const [isChecking, setIsChecking] = useState(false)
  const [claimStatus, setClaimStatus] = useState<{status: string, color: string, message: string} | null>(null)
  const [carouselIndex, setCarouselIndex] = useState(0)

  // Preload tier background images
  useEffect(() => {
    const tiers = ['diamond', 'black-diamond'];
    tiers.forEach(tier => {
      const img = new window.Image();
      img.src = `/${tier}.png`;
    });
  }, []);

  // Fetch rewards from database
  useEffect(() => {
    const fetchRewards = async () => {
      try {
        const response = await fetch('/api/rewards')
        const result = await response.json()
        
        // Handle new API response format with success/data structure
        const data = result.success ? result.data : result
        
        setRewards(Array.isArray(data) ? data : [])
        
        // Update points range based on fetched rewards
        if (data && data.length > 0) {
          const points = data.map((r: any) => r.points)
          MIN_POINTS = Math.min(...points)
          MAX_POINTS = Math.max(...points)
          setPointsRange([MIN_POINTS, MAX_POINTS])
        }
        
        setLoading(false)
      } catch (error) {
        console.error('Error fetching rewards:', error)
        setRewards([])
        setLoading(false)
      }
    }

    fetchRewards()
  }, [])

  // Memoize filtered carousel rewards (diamond and black-diamond only)
  const carouselRewards = useMemo(() => {
    return rewards
      .filter((item: any) => {
        const tier = (item as any).tier || getTier(item.points, item.name);
        return tier === 'diamond' || tier === 'black-diamond';
      })
      .slice(0, 10);
  }, [rewards]);

  // Auto-advance carousel every 5 seconds (right to left movement)
  useEffect(() => {
    if (carouselRewards.length === 0) return;
    const interval = setInterval(() => {
      setCarouselIndex((prev) => (prev - 1 + carouselRewards.length) % carouselRewards.length)
    }, 5000)
    return () => clearInterval(interval)
  }, [carouselRewards.length])

  // Reset gallery image and variant when popup opens
  useEffect(() => {
    if (selectedReward) {
      setSelectedGalleryImage(0)
      const firstVariant = (selectedReward as any).variants?.options?.[0] || ''
      setSelectedVariant(firstVariant)
    }
  }, [selectedReward])

  // Tier system based on points
  const getTier = (points: number, itemName: string) => {
    // Black Diamond: Luxury Cars (BMW, Mercedes, etc.) - 200k+ points
    if (points >= 200000 || itemName.toLowerCase().includes('bmw') || itemName.toLowerCase().includes('mercedes') || itemName.toLowerCase().includes('porsche') || itemName.toLowerCase().includes('ferrari')) {
      return 'black-diamond'
    }
    // Diamond: Rolex, high-end watches - 75k-200k points
    if (points >= 75000 || itemName.toLowerCase().includes('rolex') || itemName.toLowerCase().includes('watch')) {
      return 'diamond'
    }
    // Gold: iPhone, MacBook - 25k-75k points
    if (points >= 25000 || itemName.toLowerCase().includes('iphone') || itemName.toLowerCase().includes('macbook')) {
      return 'gold'
    }
    // Silver: Mid-range gadgets, GCash - 500-25k points
    if (points >= 500) {
      return 'silver'
    }
    // Bronze: Smaller prizes - under 500 points
    return 'bronze'
  }

  const sortedRewards = useMemo(() => {
    let filtered = [...rewards]
    
    // Filter by search query (automatic, searches name and category)
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim()
      filtered = filtered.filter((r: any) => 
        r.name.toLowerCase().includes(query) || 
        r.category.toLowerCase().includes(query)
      )
    }
    
    // Filter by category (additive - if any selected, filter to those)
    if (categoryFilter.length > 0) {
      filtered = filtered.filter((r: any) => categoryFilter.includes(r.category))
    }
    
    // Filter by points range
    filtered = filtered.filter((r: any) => r.points >= pointsRange[0] && r.points <= pointsRange[1])
    
    // Filter by tier (additive - if any selected, filter to those)
    if (tierFilter.length > 0) {
      filtered = filtered.filter((r: any) => tierFilter.includes(getTier(r.points, r.name)))
    }
    
    // Sort by points
    if (sortOrder === 'high-low') {
      return filtered.sort((a, b) => b.points - a.points)
    } else if (sortOrder === 'low-high') {
      return filtered.sort((a, b) => a.points - b.points)
    }
    
    return filtered
  }, [rewards, searchQuery, categoryFilter, tierFilter, pointsRange, sortOrder])

  const getTierStyles = useMemo(() => (tier: string) => {
    switch (tier) {
      case 'black-diamond':
        return {
          borderColor: '#8b5cf6',
          animation: 'blackDiamondGlow 2s ease-in-out infinite',
          className: 'tier-black-diamond',
          textColor: 'text-purple-300',
          pointsColor: 'text-purple-400',
          buttonBg: 'bg-purple-600 hover:bg-purple-700 text-white',
          buttonColor: '#8b5cf6',
          buttonBorderColor: '#c084fc',
          tierLabel: 'BLACK DIAMOND',
          tierLabelBg: 'bg-gradient-to-r from-purple-900 to-black',
          bannerColor: '#8b5cf6',
          bannerGlow: '0 0 20px rgba(139, 92, 246, 0.7), 0 0 40px rgba(139, 92, 246, 0.4)'
        }
      case 'diamond':
        return {
          borderColor: '#6366f1',
          animation: 'diamondSparkle 2s ease-in-out infinite',
          className: 'tier-diamond',
          textColor: 'text-gray-800',
          pointsColor: 'text-purple-600',
          buttonBg: 'bg-gray-800 hover:bg-gray-900 text-white',
          buttonColor: '#6366f1',
          buttonBorderColor: '#818cf8',
          tierLabel: '💠 DIAMOND',
          tierLabelBg: 'bg-gradient-to-r from-indigo-600 to-purple-600',
          bannerColor: '#6366f1',
          bannerGlow: '0 0 20px rgba(99, 102, 241, 0.7), 0 0 40px rgba(99, 102, 241, 0.4)'
        }
      case 'gold':
        return {
          borderColor: '#ffd700',
          animation: 'goldGlow 2s ease-in-out infinite',
          className: 'tier-gold',
          textColor: 'text-yellow-900',
          pointsColor: 'text-yellow-800',
          buttonBg: 'bg-black hover:bg-gray-800 text-yellow-400',
          buttonColor: '#ffd700',
          buttonBorderColor: '#fde047',
          tierLabel: 'GOLD',
          tierLabelBg: 'bg-gradient-to-r from-yellow-500 to-yellow-600',
          bannerColor: '#ffd700',
          bannerGlow: '0 0 20px rgba(255, 215, 0, 0.7), 0 0 40px rgba(255, 215, 0, 0.4)'
        }
      case 'silver':
        return {
          borderColor: '#a8a8a8',
          animation: 'silverShine 3s ease-in-out infinite',
          className: 'tier-silver',
          textColor: 'text-gray-800',
          pointsColor: 'text-gray-700',
          buttonBg: 'bg-gray-700 hover:bg-gray-800 text-white',
          buttonColor: '#9ca3af',
          buttonBorderColor: '#d1d5db',
          tierLabel: 'SILVER',
          tierLabelBg: 'bg-gradient-to-r from-gray-400 to-gray-500',
          bannerColor: '#9ca3af',
          bannerGlow: '0 0 20px rgba(156, 163, 175, 0.8), 0 0 40px rgba(156, 163, 175, 0.5)'
        }
      default: // bronze
        return {
          borderColor: '#cd7f32',
          animation: 'bronzeMatte 3s ease-in-out infinite',
          className: 'tier-bronze',
          textColor: 'text-yellow-100',
          pointsColor: 'text-yellow-200',
          buttonBg: 'bg-yellow-900 hover:bg-yellow-800 text-yellow-100',
          buttonColor: '#cd7f32',
          buttonBorderColor: '#fb923c',
          tierLabel: 'BRONZE',
          tierLabelBg: 'bg-gradient-to-r from-amber-700 to-amber-800',
          bannerColor: '#cd7f32',
          bannerGlow: '0 0 20px rgba(205, 127, 50, 0.7), 0 0 40px rgba(205, 127, 50, 0.4)'
        }
    }
  }, [])

  // Reset to page 1 when filter changes
  const totalPages = Math.ceil(sortedRewards.length / ITEMS_PER_PAGE)
  const paginatedRewards = sortedRewards.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  )

  // Toggle category filter
  const toggleCategoryFilter = (category: string) => {
    setCategoryFilter(prev => 
      prev.includes(category) 
        ? prev.filter(c => c !== category)
        : [...prev, category]
    )
    setCurrentPage(1)
  }

  // Toggle tier filter
  const toggleTierFilter = (tier: string) => {
    setTierFilter(prev => 
      prev.includes(tier) 
        ? prev.filter(t => t !== tier)
        : [...prev, tier]
    )
    setCurrentPage(1)
  }

  // Clear all filters
  const clearAllFilters = () => {
    setCategoryFilter([])
    setTierFilter([])
    setPointsRange([MIN_POINTS, MAX_POINTS])
    setCurrentPage(1)
  }

  // Count active filters
  const activeFilterCount = categoryFilter.length + tierFilter.length + 
    (pointsRange[0] !== MIN_POINTS || pointsRange[1] !== MAX_POINTS ? 1 : 0)

  if (typeof window !== 'undefined') {
    (window as any).popupDebug = () => setSelectedReward(rewards[0])
  }

  // Categories and tiers for filters
  const categories = ['Accessory', 'Car', 'E-wallet', 'Gadget', 'Merch']
  const tiers = [
    { id: 'black-diamond', label: 'Black Diamond', color: 'from-purple-900 to-black' },
    { id: 'diamond', label: 'Diamond', color: 'from-indigo-600 to-purple-600' },
    { id: 'gold', label: 'Gold', color: 'from-yellow-500 to-yellow-600' },
    { id: 'silver', label: 'Silver', color: 'from-gray-400 to-gray-500' },
    { id: 'bronze', label: 'Bronze', color: 'from-amber-700 to-amber-800' },
  ]

  
  // Mobile filter drawer state
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false)

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col overflow-visible">
      {/* Header */}
      <header className="w-full bg-gray-800 px-4 sm:px-8 py-3 flex items-center justify-between shadow-lg">
        <div className="flex items-center gap-4">
          <img src="/Time2Claim.png" alt="Time2Claim Logo" className="w-24 sm:w-[140px]" />
        </div>
        <div className="flex items-center gap-2 sm:gap-6">
          {/* Claims Checker button */}
          <button 
            className="px-3 sm:px-4 py-2 text-white rounded-lg font-semibold text-sm transition border-2"
            style={{ background: 'linear-gradient(135deg, #FF7901 0%, #FFA323 100%)', borderColor: '#FFA323', boxShadow: 'none' }}
            onMouseEnter={e => { e.currentTarget.style.background = 'linear-gradient(135deg, #E66D01 0%, #E69320 100%)'; e.currentTarget.style.boxShadow = '0 0 12px #FFA323, 0 0 24px #FFA323'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'linear-gradient(135deg, #FF7901 0%, #FFA323 100%)'; e.currentTarget.style.boxShadow = 'none'; }}
            onClick={() => setShowClaimsChecker(true)}
          >
            Claims Checker
          </button>
          {/* Mobile filter button */}
          <button 
            className="md:hidden px-3 py-2 bg-yellow-500 text-black rounded-lg font-semibold text-sm"
            onClick={() => setMobileFiltersOpen(true)}
          >
            Filters {activeFilterCount > 0 && `(${activeFilterCount})`}
          </button>
        </div>
      </header>
      {/* Banner Section */}
      <div className="w-full bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 overflow-visible flex flex-col items-center relative pb-0">
        {/* Banner Image */}
        <div className="w-full relative">
          <div className="relative h-32 sm:h-48 md:h-64 overflow-hidden flex items-center justify-center">
            <img 
              src="/Bannertop.png" 
              alt="Banner" 
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </div>

      {/* Divider with Glow - Positioned between banner and carousel */}
      <div className="w-full flex justify-center relative z-20" style={{ marginTop: '-2px', marginBottom: '-2px' }}>
        <div 
          className="h-1 rounded-full"
          style={{
            width: '55%',
            backgroundColor: '#69E8F8',
            boxShadow: '0 0 10px #69E8F8, 0 0 20px #69E8F8, 0 0 30px #69E8F8'
          }}
        />
      </div>

      {/* Featured Rewards Carousel - Stacked Card Style */}
      <div className="w-full bg-gradient-to-b from-gray-800 to-gray-900 py-0 px-4 overflow-hidden">
        <div className="relative max-w-6xl mx-auto h-[500px] flex items-center justify-center">
          {carouselRewards.map((item: any, idx: number) => {
              const tier = (item as any).tier || getTier(item.points, item.name)
              const tierStyles = getTierStyles(tier)
              const availableStock = (item as any).available_stock ?? 999
              const isOutOfStock = availableStock === 0
              const isLastOne = availableStock === 1

              // Calculate position relative to center card
              const position = (idx - carouselIndex + carouselRewards.length) % carouselRewards.length
              const adjustedPos = position > carouselRewards.length / 2 ? position - carouselRewards.length : position

              // Only show 5 cards: -2, -1, 0, 1, 2
              if (adjustedPos < -2 || adjustedPos > 2) return null

              // Calculate scale and position based on distance from center
              let scale = 1
              let zIndex = 50
              let opacity = 1
              let translateX = 0

              if (adjustedPos === 0) {
                // Center card - large
                scale = 1
                zIndex = 50
                opacity = 1
                translateX = 0
              } else if (adjustedPos === -1 || adjustedPos === 1) {
                // Adjacent cards - medium
                scale = 0.75
                zIndex = 40
                opacity = 0.8
                translateX = adjustedPos * 250
              } else if (adjustedPos === -2 || adjustedPos === 2) {
                // Outer cards - small
                scale = 0.5
                zIndex = 30
                opacity = 0.5
                translateX = adjustedPos * 215
              }

              return (
                <motion.div
                key={item.id}
                className="absolute"
                initial={{ 
                  scale: 0.5,
                  opacity: 0,
                  y: 50,
                  rotateY: -30
                }}
                animate={{
                  scale,
                  x: translateX,
                  opacity,
                  zIndex,
                  y: 0,
                  rotateY: 0
                }}
                transition={{
                  duration: 1.2,
                  ease: [0.25, 0.46, 0.45, 0.94],
                  delay: idx * 0.08
                }}
                style={{ width: '280px', willChange: adjustedPos >= -1 && adjustedPos <= 1 ? 'transform, opacity' : 'auto' }}
              >
                <div className="relative group h-full">
                  {/* Stock Banners */}
                  {availableStock > 1 && availableStock <= 10 && (
                    <div className="absolute top-0 -right-5 text-white text-center py-1 px-3 rounded-xl font-bold text-sm z-10 pointer-events-none select-none"
                      style={{ 
                        transform: 'rotate(20deg)',
                        backgroundColor: tierStyles.bannerColor,
                        boxShadow: tierStyles.bannerGlow
                      }}>
                      Only {availableStock} Left!
                    </div>
                  )}
                  
                  {isLastOne && (
                    <div className="absolute top-0 -right-5 text-white text-center py-1 px-3 rounded-xl font-bold text-sm z-10 pointer-events-none select-none"
                      style={{ 
                        transform: 'rotate(20deg)',
                        backgroundColor: tierStyles.bannerColor,
                        boxShadow: tierStyles.bannerGlow
                      }}>
                      Last One!
                    </div>
                  )}
                  
                  {isOutOfStock && (
                    <div className="absolute inset-0 bg-black/80 rounded-2xl flex items-center justify-center z-50 select-none">
                      <div className="text-white font-extrabold text-2xl text-center">
                        OUT OF<br />STOCK
                      </div>
                    </div>
                  )}

                  <div className="transition-all duration-200 h-full" style={{aspectRatio: '1180/1756'}}>
                    <div 
                      className={`relative flex flex-col items-center justify-end shadow-2xl border-2 transition-all duration-200 w-full h-full overflow-hidden ${tierStyles.className}`}
                      style={{
                        borderRadius: '10px',
                        borderColor: tierStyles.borderColor,
                        backgroundImage: `url(/${tier}.png)`,
                        backgroundSize: '100% 100%',
                        backgroundPosition: 'center',
                        backgroundRepeat: 'no-repeat',
                        ...(adjustedPos === 0 ? {
                          boxShadow: `0 0 30px ${tierStyles.borderColor}ee, 0 0 60px ${tierStyles.borderColor}88, 0 0 90px ${tierStyles.borderColor}44`
                        } : {})
                      }}
                    >
                      {isLastOne && adjustedPos !== 0 && (
                        <div 
                          className="absolute inset-[-2px] border-2 rounded-[10px] pointer-events-none z-50"
                          style={{
                            borderColor: tierStyles.bannerColor,
                            boxShadow: tierStyles.bannerGlow,
                          }}
                        />
                      )}
                      
                      <div className="w-full flex-1 px-3 pt-10 pb-3 flex items-center justify-center overflow-hidden">
                        <img 
                          src={(item as any).image || `https://via.placeholder.com/300x200/333333/FFFFFF?text=${encodeURIComponent(item.name)}`}
                          alt={item.name}
                          className="w-full h-full object-cover rounded-xl"
                          loading="lazy"
                          decoding="async"
                        />
                      </div>
                      
                      <div className="px-3 pb-5 w-full flex flex-col gap-1 items-center">
                        <div className="pl-3 font-extrabold text-lg text-left w-full text-white drop-shadow-lg">{item.name}</div>
                        
                        <div className="mb-0 pl-3 pb-5 text-left w-full flex items-center gap-2 font-medium text-white">
                          <img src="/pts.png" alt="Points" className="w-6 h-6" />
                          <span className="font-bold text-lg text-yellow-300">{item.points.toLocaleString()}</span>
                        </div>
                        
                        <motion.button
                          type="button"
                          className={`px-3 py-1.5 rounded-lg font-bold shadow transition mt-auto text-sm border-2 ${
                            isOutOfStock ? 'bg-gray-600 text-gray-400 cursor-not-allowed' : ''
                          }`}
                          style={{
                            width: '60%',
                            borderColor: isOutOfStock ? 'rgba(255, 255, 255, 0.2)' : tierStyles.buttonBorderColor,
                            boxShadow: 'none',
                            ...(isOutOfStock ? {} : {
                              background: isLastOne 
                                ? `linear-gradient(180deg, ${tierStyles.bannerColor} 0%, ${tierStyles.bannerColor}aa 100%)`
                                : `linear-gradient(180deg, ${tierStyles.buttonColor} 0%, ${tierStyles.buttonColor}aa 100%)`,
                              color: 'white'
                            })
                          }}
                          onClick={() => !isOutOfStock && adjustedPos === 0 && setSelectedReward(item)}
                          disabled={isOutOfStock || adjustedPos !== 0}
                          whileHover={!isOutOfStock && adjustedPos === 0 ? { scale: 1.05 } : {}}
                          whileTap={!isOutOfStock && adjustedPos === 0 ? { scale: 0.95 } : {}}
                          transition={{ type: "spring", stiffness: 400, damping: 17 }}
                          onMouseEnter={e => {
                            if (!isOutOfStock && adjustedPos === 0) {
                              e.currentTarget.style.boxShadow = `0 0 12px ${tierStyles.buttonBorderColor}, 0 0 24px ${tierStyles.buttonBorderColor}`;
                            }
                          }}
                          onMouseLeave={e => {
                            if (!isOutOfStock && adjustedPos === 0) {
                              e.currentTarget.style.boxShadow = 'none';
                            }
                          }}
                        >
                          {isOutOfStock ? 'OUT OF STOCK' : 'CLAIM NOW'}
                        </motion.button>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>
      {/* Mobile Filter Drawer */}
      {mobileFiltersOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black/60" onClick={() => setMobileFiltersOpen(false)} />
          <div className="absolute right-0 top-0 h-full w-80 max-w-[85vw] bg-gray-800 p-4 overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-yellow-400">Filters</h3>
              <button onClick={() => setMobileFiltersOpen(false)} className="text-gray-400 text-2xl">&times;</button>
            </div>
            {activeFilterCount > 0 && (
              <button onClick={clearAllFilters} className="text-xs text-red-400 hover:text-red-300 underline mb-4">
                Clear All ({activeFilterCount})
              </button>
            )}
            {/* Mobile Points Range */}
            <div className="mb-5">
              <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Points Range</h4>
              <div className="flex gap-2">
                <input type="number" value={pointsRange[0]} onChange={(e) => { const val = Number(e.target.value); if (val >= MIN_POINTS && val <= pointsRange[1]) { setPointsRange([val, pointsRange[1]]); setCurrentPage(1) }}} className="w-1/2 px-2 py-1 text-xs bg-gray-900 border border-gray-700 rounded text-white" />
                <input type="number" value={pointsRange[1]} onChange={(e) => { const val = Number(e.target.value); if (val <= MAX_POINTS && val >= pointsRange[0]) { setPointsRange([pointsRange[0], val]); setCurrentPage(1) }}} className="w-1/2 px-2 py-1 text-xs bg-gray-900 border border-gray-700 rounded text-white" />
              </div>
            </div>
            {/* Mobile Category Filter */}
            <div className="mb-5">
              <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Category</h4>
              <div className="space-y-1">
                {categories.map(cat => (
                  <label key={cat} className={`flex items-center gap-3 cursor-pointer px-3 py-2 rounded-lg transition-all ${categoryFilter.includes(cat) ? 'bg-yellow-500/10 border border-yellow-500/30' : 'hover:bg-gray-700/50'}`}>
                    <input type="checkbox" checked={categoryFilter.includes(cat)} onChange={() => toggleCategoryFilter(cat)} className="w-4 h-4 rounded border-gray-600 bg-gray-900 text-yellow-500" />
                    <span className={`text-sm ${categoryFilter.includes(cat) ? 'text-yellow-400 font-medium' : 'text-gray-300'}`}>{cat}</span>
                  </label>
                ))}
              </div>
            </div>
            {/* Mobile Tier Filter */}
            <div className="mb-5">
              <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Prestige Tier</h4>
              <div className="space-y-1">
                {tiers.map(tier => (
                  <label key={tier.id} className={`flex items-center gap-3 cursor-pointer px-3 py-2 rounded-lg transition-all ${tierFilter.includes(tier.id) ? 'bg-yellow-500/10 border border-yellow-500/30' : 'hover:bg-gray-700/50'}`}>
                    <input type="checkbox" checked={tierFilter.includes(tier.id)} onChange={() => toggleTierFilter(tier.id)} className="w-4 h-4 rounded border-gray-600 bg-gray-900 text-yellow-500" />
                    <span className={`text-sm ${tierFilter.includes(tier.id) ? 'text-yellow-400 font-medium' : 'text-gray-300'}`}>{tier.label}</span>
                  </label>
                ))}
              </div>
            </div>
            <button onClick={() => setMobileFiltersOpen(false)} className="w-full bg-yellow-500 text-black py-2 rounded-lg font-bold mt-4">Apply Filters</button>
          </div>
        </div>
      )}

      <div className="flex flex-1 w-full overflow-visible">
        {/* Sidebar - Active Filters (Desktop) */}
        <aside className="hidden md:flex flex-col w-72 bg-gray-800 rounded-xl mx-8 my-0 p-6 shadow-lg">
          {/* Points Range Slider - Best UX */}
          <div className="mb-6">
            <PointsRangeSlider
              min={MIN_POINTS}
              max={MAX_POINTS}
              value={pointsRange}
              onChange={(val) => {
                setPointsRange(val)
                setCurrentPage(1)
              }}
            />
          </div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-yellow-400">Active Filters</h3>
            {activeFilterCount > 0 && (
              <button 
                onClick={clearAllFilters}
                className="text-xs text-red-400 hover:text-red-300 underline"
              >
                Clear All ({activeFilterCount})
              </button>
            )}
          </div>

          {/* Category Filter */}
          <div className="mb-5">
            <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Category</h4>
            <div className="space-y-1">
              {categories.map(cat => (
                <label key={cat} className={`flex items-center gap-3 cursor-pointer px-3 py-2 rounded-lg transition-all ${categoryFilter.includes(cat) ? 'bg-yellow-500/10 border border-yellow-500/30' : 'hover:bg-gray-700/50'}`}>
                  <input
                    type="checkbox"
                    checked={categoryFilter.includes(cat)}
                    onChange={() => toggleCategoryFilter(cat)}
                    className="w-4 h-4 rounded border-gray-600 bg-gray-900 text-yellow-500 focus:ring-yellow-500 focus:ring-offset-0 cursor-pointer"
                  />
                  <span className={`text-sm ${categoryFilter.includes(cat) ? 'text-yellow-400 font-medium' : 'text-gray-300'}`}>
                    {cat}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Prestige Tier Filter */}
          <div className="mb-4">
            <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Prestige Tier</h4>
            <div className="space-y-1">
              {tiers.map(tier => (
                <label key={tier.id} className={`flex items-center gap-3 cursor-pointer px-3 py-2 rounded-lg transition-all ${tierFilter.includes(tier.id) ? 'bg-yellow-500/10 border border-yellow-500/30' : 'hover:bg-gray-700/50'}`}>
                  <input
                    type="checkbox"
                    checked={tierFilter.includes(tier.id)}
                    onChange={() => toggleTierFilter(tier.id)}
                    className="w-4 h-4 rounded border-gray-600 bg-gray-900 text-yellow-500 focus:ring-yellow-500 focus:ring-offset-0 cursor-pointer"
                  />
                  <span className={`text-sm ${tierFilter.includes(tier.id) ? 'text-yellow-400 font-medium' : 'text-gray-300'}`}>
                    {tier.label}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Results count */}
          <div className="mt-auto pt-4 border-t border-gray-700/50">
            <p className="text-xs text-gray-500 text-center">
              {sortedRewards.length} of {rewards.length} rewards
            </p>
          </div>
        </aside>
        {/* Main Content */}
        <main className="flex-1 flex flex-col items-center px-3 sm:px-4 md:px-8 py-4 overflow-visible">
          <div className="w-full flex flex-col sm:flex-row gap-3 sm:gap-4 justify-between items-stretch sm:items-center mb-4 sm:mb-6">
            <input 
              type="text" 
              placeholder="Search rewards..." 
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value)
                setCurrentPage(1)
              }}
              className="w-full sm:w-64 md:w-80 lg:w-[400px] px-4 py-2 rounded-lg bg-gray-900 text-white border border-gray-700 focus:outline-none focus:border-yellow-500 text-sm sm:text-base" 
            />
            <div className="flex items-center justify-between sm:justify-end gap-2">
              <span className="text-gray-300 text-sm sm:text-lg font-medium">Sort:</span>
            <select 
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value as 'high-low' | 'low-high')}
              className="bg-gray-800 text-gray-200 rounded-lg px-2 sm:px-4 py-2 border border-gray-700 focus:outline-none cursor-pointer text-sm sm:text-base flex-1 sm:flex-none"
              style={{ minWidth: 140 }}
            >
              <option value="high-low">High to Low</option>
              <option value="low-high">Low to High</option>
            </select>
            </div>
          </div>
          {loading ? (
            <div className="flex items-center justify-center w-full py-20">
              <div className="text-center">
                <div className="w-16 h-16 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-gray-400 text-lg">Loading rewards...</p>
              </div>
            </div>
          ) : (
          <AnimatePresence mode="wait">
            <motion.div
              key={currentPage}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6 lg:gap-8 w-full max-w-7xl px-1 overflow-visible pt-8"
            >
          {paginatedRewards.map((item, index) => {
            const availableStock = item.quantity || 0
            const isLowStock = availableStock <= 10 && availableStock >= 2
            const isLastOne = availableStock === 1
            const isOutOfStock = availableStock === 0
            const tier = (item as any).tier || getTier(item.points, item.name)
            console.log('Card tier:', tier, 'for item:', item.name, 'background will be:', `/${tier}.png`)
            const tierStyles = getTierStyles(tier)
            
            return (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ 
                duration: 0.3,
                delay: index * 0.05,
                ease: "easeOut"
              }}
              className={`relative hover:scale-105 transition-all duration-200 h-full group ${(isLowStock || isLastOne) ? 'z-10 hover:z-30' : 'z-0 hover:z-30'} ${isOutOfStock ? 'cursor-not-allowed' : ''}`}
              style={{ overflow: 'visible' }}
            >
              {/* Low Stock Banner (2-10 items) - Plain overlay */}
              {isLowStock && (
                      <div className="absolute top-0 -right-7 text-white text-center py-1 px-3 rounded-xl font-bold text-xs shadow-lg z-10 group-hover:z-50 pointer-events-none select-none"
                      style={{ 
                        transform: 'rotate(20deg)',
                        backgroundColor: tierStyles.bannerColor,
                        boxShadow: tierStyles.bannerGlow
                      }}>
                        Only {availableStock} Left!
                      </div>
              )}
              
              {/* Last One Banner (1 item) - Animated overlay */}
              {isLastOne && (
                      <div className="absolute top-0 -right-5 text-white text-center py-1 px-3 rounded-xl font-bold text-sm z-10 group-hover:z-50 pointer-events-none select-none"
                      style={{ 
                        transform: 'rotate(20deg)',
                        backgroundColor: tierStyles.bannerColor,
                        boxShadow: tierStyles.bannerGlow
                      }}>
                        Last One!
                      </div>
              )}
              
              {/* Out of Stock Overlay (0 items) - Full card cover */}
              {isOutOfStock && (
                      <div className="absolute inset-0 bg-black/80 rounded-2xl flex items-center justify-center z-50 select-none">
                        <div className="text-white font-extrabold text-2xl text-center">
                          OUT OF<br />STOCK
                        </div>
                      </div>
              )}
              
              <div className="transition-all duration-200 h-full" style={{aspectRatio: '1180/1756'}}>
              <div 
                className={`relative flex flex-col items-center justify-end shadow-2xl border-2 transition-all duration-200 w-full h-full overflow-hidden ${tierStyles.className}`}
                style={{
                  borderRadius: '10px',
                  borderColor: tierStyles.borderColor,
                  animation: tierStyles.animation,
                  backgroundImage: `url(/${tier}.png)`,
                  backgroundSize: '100% 100%',
                  backgroundPosition: 'center',
                  backgroundRepeat: 'no-repeat',
                }}
              >
                {/* Animated border and glow layer for last one */}
                {isLastOne && (
                  <div 
                    className="absolute inset-[-2px] border-2 rounded-[10px] animate-pulse pointer-events-none z-50"
                    style={{
                      borderColor: tierStyles.bannerColor,
                      boxShadow: tierStyles.bannerGlow,
                    }}
                  />
                )}
              {/* Image - 100% width & height */}
              <div className="w-full h-48 rounded-t-xl px-3 py-3 flex items-center justify-center overflow-hidden">
                <img 
                  src={(item as any).image || `https://via.placeholder.com/300x200/333333/FFFFFF?text=${encodeURIComponent(item.name)}`}
                  alt={item.name}
                  className="w-full h-full object-cover rounded-xl"
                />
              </div>
              
              <div className="px-3 py-3 w-full flex flex-col gap-1 items-center">
              {/* Reward Name - Left aligned */}
              <div className="font-extrabold text-lg text-left w-full text-white drop-shadow-lg">{item.name}</div>
              
              {/* Points with token icon - Left aligned */}
              <div className="mb-0 text-left w-full flex items-center gap-2 font-medium text-white">
                <img src="/pts.png" alt="Points" className="w-6 h-6" />
                <span className="font-bold text-lg text-yellow-300">{item.points.toLocaleString()}</span>
              </div>
              
              {/* Claim Button */}
              <motion.button
                type="button"
                className={`px-3 py-1.5 rounded-lg font-bold shadow transition mt-auto text-sm border-2 ${
                  isOutOfStock
                    ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                    : ''
                }`}
                style={{
                  width: '60%',
                  borderColor: isOutOfStock ? 'rgba(255, 255, 255, 0.2)' : tierStyles.buttonBorderColor,
                  boxShadow: 'none',
                  ...(isOutOfStock ? {} : {
                    background: isLastOne 
                      ? `linear-gradient(180deg, ${tierStyles.bannerColor} 0%, ${tierStyles.bannerColor}aa 100%)`
                      : `linear-gradient(180deg, ${tierStyles.buttonColor} 0%, ${tierStyles.buttonColor}aa 100%)`,
                    color: 'white'
                  })
                }}
                onClick={() => !isOutOfStock && setSelectedReward(item)}
                disabled={isOutOfStock}
                whileHover={!isOutOfStock ? { scale: 1.05 } : {}}
                whileTap={!isOutOfStock ? { scale: 0.95 } : {}}
                transition={{ type: "spring", stiffness: 400, damping: 17 }}
                onMouseEnter={e => {
                  if (!isOutOfStock) {
                    e.currentTarget.style.boxShadow = `0 0 12px ${tierStyles.buttonBorderColor}, 0 0 24px ${tierStyles.buttonBorderColor}`;
                  }
                }}
                onMouseLeave={e => {
                  if (!isOutOfStock) {
                    e.currentTarget.style.boxShadow = 'none';
                  }
                }}
              >
                {isOutOfStock ? 'OUT OF STOCK' : 'CLAIM NOW'}
              </motion.button>
              </div>
              </div>
              </div>
            </motion.div>
            )
          })}
            </motion.div>
          </AnimatePresence>
          )}
        
        {/* Pagination Controls */}
        {!loading && totalPages > 1 && (
          <div className="flex items-center justify-center gap-1 sm:gap-2 mt-6 sm:mt-8 mb-4 flex-wrap px-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className={`px-2 sm:px-4 py-2 rounded-lg font-bold transition text-xs sm:text-base ${
                currentPage === 1 
                  ? 'bg-gray-700 text-gray-500 cursor-not-allowed' 
                  : 'bg-yellow-600 text-black hover:bg-yellow-500'
              }`}
            >
              Prev
            </button>
            
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => {
              // On mobile, show limited page numbers
              const showPage = totalPages <= 5 || page === 1 || page === totalPages || Math.abs(page - currentPage) <= 1
              if (!showPage) {
                if (page === 2 || page === totalPages - 1) return <span key={page} className="text-gray-500 px-1">...</span>
                return null
              }
              return (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg font-bold transition text-xs sm:text-base ${
                    currentPage === page 
                      ? 'bg-yellow-400 text-black' 
                      : 'bg-gray-700 text-yellow-400 hover:bg-gray-600'
                  }`}
                >
                  {page}
                </button>
              )
            })}
            
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className={`px-2 sm:px-4 py-2 rounded-lg font-bold transition text-xs sm:text-base ${
                currentPage === totalPages 
                  ? 'bg-gray-700 text-gray-500 cursor-not-allowed' 
                  : 'bg-yellow-600 text-black hover:bg-yellow-500'
              }`}
            >
              Next
            </button>
          </div>
        )}
        
        {/* Page Info */}
        {!loading && totalPages > 1 && (
          <div className="text-gray-400 text-sm text-center mb-4">
            Showing {((currentPage - 1) * ITEMS_PER_PAGE) + 1}-{Math.min(currentPage * ITEMS_PER_PAGE, sortedRewards.length)} of {sortedRewards.length} rewards
          </div>
        )}
        
        {/* Claims Checker Modal */}
        {showClaimsChecker && (
          <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black bg-opacity-80 p-4 animate-fadeIn" onClick={() => {
            setShowClaimsChecker(false);
            setCheckClaimId('');
            setClaimStatus(null);
            setIsChecking(false);
          }}>
            <div className="shadow-2xl p-8 max-w-lg w-full animate-scaleIn relative overflow-hidden" style={{ 
              borderRadius: '20px',
              background: 'linear-gradient(#1F2937, #1F2937) padding-box, linear-gradient(135deg, #FF7901, #FFA323) border-box',
              border: '2px solid transparent'
            }} onClick={(e) => e.stopPropagation()}>
              {/* Close button */}
              <button 
                className="absolute -top-1 right-0 text-gray-400 hover:text-white text-3xl font-bold w-12 h-12 flex items-center justify-center"
                onClick={() => {
                  setShowClaimsChecker(false);
                  setCheckClaimId('');
                  setClaimStatus(null);
                  setIsChecking(false);
                }}
              >
                &times;
              </button>
              
              {/* Header */}
              <div className="text-center mb-6">
                <h2 className="text-3xl font-extrabold mb-2" style={{ background: 'linear-gradient(135deg, #FF7901, #FFA323)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>Claims Checker</h2>
                <p className="text-gray-300 text-sm">Please enter your Request ID so you can see the status of your request</p>
              </div>
              
              {/* Input Field with Loading Animation */}
              <div className="mb-6">
                <div className="relative">
                  <input
                    type="text"
                    value={checkClaimId}
                    onChange={(e) => setCheckClaimId(e.target.value.toUpperCase())}
                    placeholder="Enter Request ID (e.g., CLM-XY7K4M9B2)"
                    className="w-full px-4 py-3 pr-12 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none transition"
                    // style removed: focusBorderColor is not a valid CSS property
                    onFocus={(e) => e.currentTarget.style.borderColor = '#FF7901'}
                    onBlur={(e) => e.currentTarget.style.borderColor = '#4B5563'}
                    disabled={isChecking}
                  />
                  {isChecking && (
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                      <div className="w-6 h-6 border-3 border-t-transparent rounded-full animate-spin" style={{ borderColor: '#FF7901', borderTopColor: 'transparent' }}></div>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Check Claim Button */}
              <button
                onClick={async () => {
                  if (!checkClaimId.trim()) return;
                  setIsChecking(true);
                  setClaimStatus(null);
                  
                  try {
                    const response = await fetch(`/api/claims?claimId=${checkClaimId}`);
                    const data = await response.json();
                    
                    if (response.ok) {
                      // Capitalize first letter for display
                      const displayStatus = data.status.charAt(0).toUpperCase() + data.status.slice(1);
                      
                      const statusColors: Record<string, string> = {
                        'pending': 'yellow',
                        'processing': 'blue',
                        'approved': 'green',
                        'shipped': 'purple',
                        'delivered': 'emerald',
                        'rejected': 'red'
                      };
                      
                      const statusMessages: Record<string, string> = {
                        'pending': 'Your claim is being reviewed by our team.',
                        'processing': 'Your reward is currently being processed.',
                        'approved': 'Your claim has been approved! Preparing for shipment.',
                        'shipped': 'Your reward has been shipped! Track your delivery.',
                        'delivered': 'Your reward has been delivered successfully!',
                        'rejected': 'Your claim was rejected. Please contact support for details.'
                      };
                      
                      setClaimStatus({
                        status: displayStatus,
                        color: statusColors[data.status.toLowerCase()] || 'gray',
                        message: statusMessages[data.status.toLowerCase()] || 'Status unknown.'
                      });
                    } else {
                      setClaimStatus({
                        status: 'Not Found',
                        color: 'red',
                        message: data.error || 'Claim not found. Please check your Request ID.'
                      });
                    }
                  } catch (error) {
                    console.error('Error checking claim:', error);
                    setClaimStatus({
                      status: 'Error',
                      color: 'red',
                      message: 'Failed to check claim status. Please try again.'
                    });
                  } finally {
                    setIsChecking(false);
                  }
                }}
                disabled={!checkClaimId.trim() || isChecking}
                className={`w-full py-3 rounded-lg font-bold text-lg transition shadow-lg border-2 ${
                  !checkClaimId.trim() || isChecking
                    ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                    : 'text-white'
                }`}
                style={!checkClaimId.trim() || isChecking ? {} : { background: 'linear-gradient(135deg, #FF7901 0%, #FFA323 100%)', borderColor: '#FFA323', boxShadow: 'none' }}
                onMouseEnter={(e) => {
                  if (!(!checkClaimId.trim() || isChecking)) {
                    e.currentTarget.style.background = 'linear-gradient(135deg, #E66D01 0%, #E69320 100%)';
                    e.currentTarget.style.boxShadow = '0 0 12px #FFA323, 0 0 24px #FFA323';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!(!checkClaimId.trim() || isChecking)) {
                    e.currentTarget.style.background = 'linear-gradient(135deg, #FF7901 0%, #FFA323 100%)';
                    e.currentTarget.style.boxShadow = 'none';
                  }
                }}
              >
                {isChecking ? 'Checking...' : 'Check Claim'}
              </button>
              
              {/* Result Field */}
              {claimStatus && (
                <div className={`mt-6 p-4 rounded-lg border-2 animate-scaleIn bg-${claimStatus.color}-900/30 border-${claimStatus.color}-500`}>
                  <div className="flex items-center gap-3 mb-2">
                    <div className={`w-3 h-3 rounded-full bg-${claimStatus.color}-500 animate-pulse`}></div>
                    <h3 className={`text-xl font-bold text-${claimStatus.color}-400`}>
                      Status: {claimStatus.status}
                    </h3>
                  </div>
                  <p className="text-gray-300 text-sm">{claimStatus.message}</p>
                  <p className="text-gray-500 text-xs mt-2">Request ID: {checkClaimId}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Success Modal */}
        <AnimatePresence>
        {showSuccessModal && (
          <motion.div 
            className="fixed inset-0 z-[10000] flex items-center justify-center bg-black bg-opacity-90 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <motion.div 
              className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl shadow-2xl p-8 max-w-md w-full text-center border-2 border-yellow-500"
              initial={{ scale: 0.8, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.8, opacity: 0, y: 20 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
            >
              {/* Success Icon */}
              <div className="mb-6 flex justify-center">
                <div className="w-20 h-20 bg-yellow-500 rounded-full flex items-center justify-center animate-bounce">
                  <svg className="w-12 h-12 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              </div>
              
              {/* Success Message */}
              <h2 className="text-2xl font-extrabold text-yellow-400 mb-4">
                Claim Request Received!
              </h2>
              
              <p className="text-gray-300 mb-6 leading-relaxed">
                We have received your claim request.
              </p>
              
              {/* Claim ID */}
              <div className="bg-gray-900 rounded-lg p-4 mb-6 border border-gray-700">
                <p className="text-sm text-gray-400 mb-1">Your Claim ID:</p>
                <p className="text-xl font-bold text-yellow-300 tracking-wider">{claimId}</p>
              </div>
              
              <p className="text-gray-400 text-sm mb-6">
                Please wait patiently for it to be processed. Thank you!
              </p>
              
              <p className="text-yellow-500 text-sm font-semibold mb-6">
                You can check it in our claims status checker.
              </p>
              
              {/* Close Button */}
              <motion.button
                onClick={() => {
                  setShowSuccessModal(false);
                  setSelectedReward(null);
                }}
                className="w-full bg-yellow-500 text-black px-6 py-3 rounded-lg font-bold text-lg hover:bg-yellow-400 transition shadow-lg"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                transition={{ type: "spring", stiffness: 400, damping: 17 }}
              >
                Got it!
              </motion.button>
            </motion.div>
          </motion.div>
        )}
        </AnimatePresence>

        {/* Popup Card */}
        <AnimatePresence>
        {selectedReward && !showSuccessModal && (
          <motion.div 
            id="popup-card" 
            className="fixed inset-0 z-[9999] flex items-center justify-center bg-black bg-opacity-80 p-4" 
            onClick={() => setSelectedReward(null)}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <motion.div 
              className="rounded-2xl shadow-2xl p-8 max-w-4xl w-full text-yellow-100 relative max-h-[90vh] overflow-y-auto" 
              style={{ background: 'linear-gradient(135deg, #0A1F30 0%, #0B3151 100%)' }}
              onClick={(e) => e.stopPropagation()}
              initial={{ scale: 0.9, opacity: 0, y: 30 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 30 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
            >
              <button className="absolute top-0 right-3 text-gray-400 hover:text-yellow-300 text-3xl font-bold z-10" onClick={() => setSelectedReward(null)}>&times;</button>
              
              {/* First Row - 2 Columns */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                {/* Column 1: Image and Gallery */}
                <div className="flex flex-col gap-2 h-full">
                  {/* Main Display Image */}
                  <div className="h-64 bg-gray-900 rounded-xl flex items-center justify-center overflow-hidden border-2 border-yellow-700 relative">
                    <img 
                      src={
                        (selectedReward as any).galleries && selectedVariant && (selectedReward as any).galleries[selectedVariant]
                          ? (selectedReward as any).galleries[selectedVariant][selectedGalleryImage]
                          : ((selectedReward as any).image || `https://via.placeholder.com/400x400/333333/FFFFFF?text=${encodeURIComponent(selectedReward.name)}`)
                      }
                      alt={`${selectedReward.name} - ${selectedVariant} - Image ${selectedGalleryImage + 1}`}
                      className="w-full h-full object-contain"
                    />
                  </div>
                  {/* Gallery Thumbnails */}
                  <div className="grid grid-cols-4 gap-1.5 max-w-xs justify-center mx-auto">
                    {[0, 1, 2, 3].map((idx) => (
                      <div 
                        key={idx} 
                        className={`aspect-square bg-gray-700 rounded border cursor-pointer transition flex items-center justify-center overflow-hidden relative ${
                          selectedGalleryImage === idx 
                            ? 'border-yellow-500 ring-1 ring-yellow-500' 
                            : 'border-gray-600 hover:border-yellow-400'
                        }`}
                        onClick={() => setSelectedGalleryImage(idx)}
                      >
                        <img 
                          src={
                            (selectedReward as any).galleries && selectedVariant && (selectedReward as any).galleries[selectedVariant]
                              ? (selectedReward as any).galleries[selectedVariant][idx]
                              : ((selectedReward as any).image || `https://via.placeholder.com/100x100/555555/FFFFFF?text=${idx + 1}`)
                          }
                          alt={`Gallery ${idx + 1}`}
                          className="w-full h-full object-cover"
                        />
                        {selectedGalleryImage === idx && (
                          <div className="absolute inset-0 bg-yellow-500/20 pointer-events-none" />
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Column 2: Reward Details */}
                <div className="flex flex-col gap-2 h-full">
                  {/* Reward Name */}
                  <h2 className="font-extrabold text-2xl text-yellow-200">{selectedReward.name}</h2>
                  
                  {/* Extra Detail */}
                  <p className="text-xs text-gray-400">Premium quality reward from our exclusive collection. Limited availability.</p>
                  
                  {/* Variant Options */}
                  {(selectedReward as any).variants && (
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-gray-300 uppercase">
                        Select {(selectedReward as any).variants.type}:
                      </label>
                      
                      {(selectedReward as any).variants.type === 'color' ? (
                        /* Colored circle buttons for color variants */
                        <div className="flex flex-wrap gap-1">
                          {(selectedReward as any).variants.options.map((option: string) => {
                            const colorMap: { [key: string]: string } = {
                              'Black': '#000000',
                              'White': '#FFFFFF',
                              'Red': '#FF0000',
                              'Blue': '#0000FF',
                              'Silver': '#C0C0C0',
                              'Clear': '#F0F0F0',
                              'Black Titanium': '#2C2C2C',
                              'White Titanium': '#E8E8E8',
                              'Natural Titanium': '#B8956A',
                              'Desert Titanium': '#D4A373',
                              'Alpine White': '#F5F5F5',
                              'Black Sapphire': '#1C1C1C',
                              'San Marino Blue': '#2B4F81',
                              'Green': '#22C55E',
                              'Asteroid Black': '#1A1A1A',
                              'Stardust Blue': '#3B82F6',
                              'Matte Black': '#1A1A1A',
                              'Racing Blue': '#0066CC',
                              'Matte Red': '#B22222'
                            }
                            const bgColor = colorMap[option] || '#808080'
                            return (
                              <button
                                key={option}
                                type="button"
                                onClick={() => {
                                  setSelectedVariant(option)
                                  setSelectedGalleryImage(0)
                                }}
                                className={`relative w-6 h-6 rounded-full border-2 transition-all hover:scale-110 ${
                                  selectedVariant === option
                                    ? 'border-yellow-400 ring-2 ring-yellow-400/50'
                                    : 'border-gray-600 hover:border-gray-400'
                                }`}
                                style={{ backgroundColor: bgColor }}
                                title={option}
                              >
                                {option === 'White' || option === 'Clear' || option.includes('White') ? (
                                  <div className="absolute inset-0 rounded-full border border-gray-300" />
                                ) : null}
                              </button>
                            )
                          })}
                        </div>
                      ) : (
                        /* Text buttons for non-color variants */
                        <div className="flex flex-wrap gap-2">
                          {(selectedReward as any).variants.options.map((option: string) => (
                            <button
                              key={option}
                              type="button"
                              onClick={() => {
                                setSelectedVariant(option)
                                setSelectedGalleryImage(0)
                              }}
                              className={`px-4 py-2 rounded-lg font-semibold text-sm transition ${
                                selectedVariant === option
                                  ? 'bg-yellow-500 text-black'
                                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600 border border-gray-600'
                              }`}
                            >
                              {option}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                  
                  {/* Points */}
                  <div className="flex items-center gap-2 text-xl font-bold">
                    <span className="text-2xl">🪙</span>
                    <span className="text-yellow-300">{selectedReward.points.toLocaleString()} Points</span>
                  </div>
                  
                  {/* Claiming Steps */}
                  <div className="bg-gray-900 rounded-lg p-3 border border-gray-700">
                    <h3 className="font-bold text-sm text-yellow-400 mb-2">📋 Claiming Process:</h3>
                    <ol className="text-xs text-gray-300 space-y-1 list-decimal list-inside">
                      <li>Fill out the claim form below</li>
                      <li>Wait for admin approval (24-48 hours)</li>
                      <li>Receive confirmation via email/SMS</li>
                      <li>Claim your reward or receive delivery</li>
                    </ol>
                  </div>
                </div>
              </div>

              {/* Second Row - Claim Form */}
              <div className="border-t border-gray-700 pt-4">
                <h3 className="font-bold text-lg text-yellow-300 mb-3">Complete Your Claim</h3>
                <form className="grid grid-cols-1 md:grid-cols-2 gap-3" onSubmit={async (e) => { 
                  e.preventDefault(); 
                  
                  const formData = new FormData(e.currentTarget);
                  const claimData = {
                    rewardId: selectedReward.id,
                    variantOption: selectedVariant,
                    username: formData.get('username'),
                    fullName: formData.get('fullName'),
                    phoneNumber: formData.get('phoneNumber'),
                    deliveryAddress: formData.get('deliveryAddress'),
                    ewalletName: formData.get('ewalletName'),
                    ewalletAccount: formData.get('ewalletAccount')
                  };
                  
                  try {
                    const response = await fetch('/api/claims', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify(claimData)
                    });
                    
                    const data = await response.json();
                    
                    if (response.ok) {
                      setClaimId(data.claimId);
                      setShowSuccessModal(true);
                    } else {
                      alert('Error submitting claim: ' + data.error);
                    }
                  } catch (error) {
                    console.error('Error submitting claim:', error);
                    alert('Failed to submit claim. Please try again.');
                  }
                }}>
                  {/* E-wallet Category Fields Only */}
                  {(selectedReward as any).category === 'E-wallet' ? (
                    <>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:col-span-2">
                        <input 
                          type="text" 
                          name="username"
                          placeholder="Username" 
                          className="border border-gray-600 rounded-lg px-3 py-2 bg-gray-700 text-yellow-100 focus:outline-none focus:border-yellow-500 text-sm w-full" 
                          required 
                        />
                        <input 
                          type="text" 
                          name="fullName"
                          placeholder="Full Name" 
                          className="border border-gray-600 rounded-lg px-3 py-2 bg-gray-700 text-yellow-100 focus:outline-none focus:border-yellow-500 text-sm w-full" 
                          required 
                        />
                        <input 
                          type="email" 
                          name="email"
                          placeholder="Email" 
                          className="border border-gray-600 rounded-lg px-3 py-2 bg-gray-700 text-yellow-100 focus:outline-none focus:border-yellow-500 text-sm w-full" 
                          required 
                        />
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:col-span-2">
                        <input 
                          type="text" 
                          name="ewalletName"
                          placeholder="E-wallet Name (GCash/Maya)" 
                          className="border border-gray-600 rounded-lg px-3 py-2 bg-gray-700 text-yellow-100 focus:outline-none focus:border-yellow-500 text-sm w-full" 
                          required 
                        />
                        <input 
                          type="text" 
                          name="ewalletAccount"
                          placeholder="E-wallet Account Number" 
                          className="border border-gray-600 rounded-lg px-3 py-2 bg-gray-700 text-yellow-100 focus:outline-none focus:border-yellow-500 text-sm w-full" 
                          required 
                        />
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:col-span-2">
                        <input 
                          type="text" 
                          name="username"
                          placeholder="Username" 
                          className="border border-gray-600 rounded-lg px-3 py-2 bg-gray-700 text-yellow-100 focus:outline-none focus:border-yellow-500 text-sm w-full" 
                          required 
                        />
                        <input 
                          type="text" 
                          name="fullName"
                          placeholder="Full Name" 
                          className="border border-gray-600 rounded-lg px-3 py-2 bg-gray-700 text-yellow-100 focus:outline-none focus:border-yellow-500 text-sm w-full" 
                          required 
                        />
                        <input 
                          type="email" 
                          name="email"
                          placeholder="Email" 
                          className="border border-gray-600 rounded-lg px-3 py-2 bg-gray-700 text-yellow-100 focus:outline-none focus:border-yellow-500 text-sm w-full" 
                          required 
                        />
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:col-span-2">
                        <input 
                          type="tel" 
                          name="phoneNumber"
                          placeholder="Phone Number" 
                          className="border border-gray-600 rounded-lg px-3 py-2 bg-gray-700 text-yellow-100 focus:outline-none focus:border-yellow-500 text-sm w-full" 
                          required 
                        />
                        <input 
                          type="text"
                          name="deliveryAddress"
                          placeholder="Complete Delivery Address" 
                          className="border border-gray-600 rounded-lg px-3 py-2 bg-gray-700 text-yellow-100 focus:outline-none focus:border-yellow-500 text-sm w-full" 
                          required 
                        />
                      </div>
                    </>
                  )}
                  
                  {/* Submit Button */}
                  <motion.button 
                    type="submit" 
                    className="md:col-span-2 text-white px-4 py-2 rounded-lg font-bold text-base shadow-lg transition mt-1 mx-auto block border-2" 
                    style={{ width: '40%', background: 'linear-gradient(180deg, #FF7901 0%, #FFA323 100%)', borderColor: '#FFA323', boxShadow: 'none' }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    transition={{ type: "spring", stiffness: 400, damping: 17 }}
                    onMouseEnter={e => { e.currentTarget.style.background = 'linear-gradient(180deg, #E66D01 0%, #E69320 100%)'; e.currentTarget.style.boxShadow = '0 0 12px #FFA323, 0 0 24px #FFA323'; }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'linear-gradient(180deg, #FF7901 0%, #FFA323 100%)'; e.currentTarget.style.boxShadow = 'none'; }}
                  >
                    Confirm Claim
                  </motion.button>
                </form>
              </div>
            </motion.div>
          </motion.div>
        )}
        </AnimatePresence>
      </main>
      </div>
    </div>
  );
}
