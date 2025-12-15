"use client"
import { useEffect, useState } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts'

interface RewardData {
  id: string
  name: string
  points: number
  category: string
  count: number
  totalPoints: number
}

interface ClaimsStats {
  total: number
  pending: number
  approved: number
  processing: number
  shipped: number
  delivered: number
  rejected: number
  totalPoints: number
  approvalRate: string
}

interface DailyData {
  date: string
  total: number
  approved: number
  rejected: number
  pending: number
}

type CategoryData = {
  [key: string]: string | number;
  name: string;
  value: number;
};

const COLORS = ['#eab308', '#f59e0b', '#fb923c', '#fbbf24', '#fcd34d', '#fde047', '#facc15', '#fde68a', '#fed7aa', '#fdba74']

export default function PopularRewardsChart() {
  const [popularRewards, setPopularRewards] = useState<RewardData[]>([])
  const [claimsStats, setClaimsStats] = useState<ClaimsStats | null>(null)
  const [dailyData, setDailyData] = useState<DailyData[]>([])
  const [categoryData, setCategoryData] = useState<CategoryData[]>([])
  const [loading, setLoading] = useState(true)
  const [timeRange, setTimeRange] = useState(30) // days
  const [limit, setLimit] = useState(10)

  useEffect(() => {
    fetchAnalytics()
  }, [timeRange, limit])

  const fetchAnalytics = async () => {
    setLoading(true)
    try {
      // Fetch popular rewards
      const rewardsRes = await fetch(`/api/admin/analytics?type=popular-rewards&limit=${limit}&days=${timeRange}`)
      const rewardsData = await rewardsRes.json()
      if (rewardsData.success) {
        setPopularRewards(rewardsData.data)
      }

      // Fetch claims stats
      const statsRes = await fetch(`/api/admin/analytics?type=claims-stats&days=${timeRange}`)
      const statsData = await statsRes.json()
      if (statsData.success) {
        setClaimsStats(statsData.data)
      }

      // Fetch daily claims
      const dailyRes = await fetch(`/api/admin/analytics?type=daily-claims&days=${timeRange}`)
      const dailyDataRes = await dailyRes.json()
      if (dailyDataRes.success) {
        setDailyData(dailyDataRes.data)
      }

      // Fetch category distribution
      const categoryRes = await fetch(`/api/admin/analytics?type=category-distribution&days=${timeRange}`)
      const categoryDataRes = await categoryRes.json()
      if (categoryDataRes.success) {
        setCategoryData(categoryDataRes.data)
      }
    } catch (error) {
      console.error('Error fetching analytics:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-400"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="bg-[#23272f] rounded-lg border border-yellow-700 p-6">
        <div className="flex flex-wrap gap-4 items-center justify-between">
          <h2 className="text-2xl font-bold text-yellow-400">Analytics Dashboard</h2>
          <div className="flex gap-4 items-center">
            <div>
              <label className="text-sm text-gray-300 mr-2">Time Range:</label>
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(Number(e.target.value))}
                className="bg-[#181c23] border border-gray-600 rounded-lg px-4 py-2 text-white focus:border-yellow-500 focus:outline-none"
              >
                <option value={7}>Last 7 Days</option>
                <option value={30}>Last 30 Days</option>
                <option value={90}>Last 90 Days</option>
                <option value={365}>Last Year</option>
              </select>
            </div>
            <div>
              <label className="text-sm text-gray-300 mr-2">Top:</label>
              <select
                value={limit}
                onChange={(e) => setLimit(Number(e.target.value))}
                className="bg-[#181c23] border border-gray-600 rounded-lg px-4 py-2 text-white focus:border-yellow-500 focus:outline-none"
              >
                <option value={5}>5 Rewards</option>
                <option value={10}>10 Rewards</option>
                <option value={15}>15 Rewards</option>
                <option value={20}>20 Rewards</option>
              </select>
            </div>
            <button
              onClick={fetchAnalytics}
              className="bg-yellow-700 hover:bg-yellow-600 text-white px-4 py-2 rounded-lg font-semibold transition"
            >
              Refresh
            </button>
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      {claimsStats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-[#23272f] rounded-lg border border-yellow-700 p-6">
            <h3 className="text-yellow-400 font-semibold text-sm mb-2">Total Claims</h3>
            <p className="text-3xl font-bold">{claimsStats.total}</p>
          </div>
          <div className="bg-[#23272f] rounded-lg border border-yellow-700 p-6">
            <h3 className="text-yellow-400 font-semibold text-sm mb-2">Approved</h3>
            <p className="text-3xl font-bold">{claimsStats.approved + claimsStats.processing + claimsStats.shipped + claimsStats.delivered}</p>
          </div>
          <div className="bg-[#23272f] rounded-lg border border-yellow-700 p-6">
            <h3 className="text-yellow-400 font-semibold text-sm mb-2">Approval Rate</h3>
            <p className="text-3xl font-bold">{claimsStats.approvalRate}%</p>
          </div>
          <div className="bg-[#23272f] rounded-lg border border-yellow-700 p-6">
            <h3 className="text-yellow-400 font-semibold text-sm mb-2">Total Points</h3>
            <p className="text-3xl font-bold">{claimsStats.totalPoints.toLocaleString()}</p>
          </div>
        </div>
      )}

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Popular Rewards Bar Chart */}
        <div className="bg-[#23272f] rounded-lg border border-yellow-700 p-6">
          <h3 className="text-xl font-bold text-yellow-400 mb-4">Most Popular Rewards (By Claims)</h3>
          {popularRewards.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={popularRewards}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis 
                  dataKey="name" 
                  stroke="#9ca3af" 
                  angle={-45}
                  textAnchor="end"
                  height={100}
                  interval={0}
                  tick={{ fontSize: 12 }}
                />
                <YAxis stroke="#9ca3af" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#23272f', border: '1px solid #eab308' }}
                  labelStyle={{ color: '#eab308' }}
                />
                <Legend />
                <Bar dataKey="count" fill="#eab308" name="Claims" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-gray-400 text-center py-12">No data available</p>
          )}
        </div>

        {/* Category Distribution Pie Chart */}
        <div className="bg-[#23272f] rounded-lg border border-yellow-700 p-6">
          <h3 className="text-xl font-bold text-yellow-400 mb-4">Claims by Category</h3>
          {categoryData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={categoryData as unknown as Record<string, unknown>[]}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${((percent ?? 0) * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#23272f', border: '1px solid #eab308' }}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-gray-400 text-center py-12">No data available</p>
          )}
        </div>

        {/* Daily Claims Line Chart */}
        <div className="bg-[#23272f] rounded-lg border border-yellow-700 p-6 lg:col-span-2">
          <h3 className="text-xl font-bold text-yellow-400 mb-4">Daily Claims Trend</h3>
          {dailyData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={dailyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis 
                  dataKey="date" 
                  stroke="#9ca3af"
                  tick={{ fontSize: 12 }}
                />
                <YAxis stroke="#9ca3af" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#23272f', border: '1px solid #eab308' }}
                  labelStyle={{ color: '#eab308' }}
                />
                <Legend />
                <Line type="monotone" dataKey="total" stroke="#eab308" name="Total Claims" strokeWidth={2} />
                <Line type="monotone" dataKey="approved" stroke="#fbbf24" name="Approved" strokeWidth={2} />
                <Line type="monotone" dataKey="rejected" stroke="#f97316" name="Rejected" strokeWidth={2} />
                <Line type="monotone" dataKey="pending" stroke="#fb923c" name="Pending" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-gray-400 text-center py-12">No data available</p>
          )}
        </div>

        {/* Top Rewards by Points Value */}
        <div className="bg-[#23272f] rounded-lg border border-yellow-700 p-6 lg:col-span-2">
          <h3 className="text-xl font-bold text-yellow-400 mb-4">Top Rewards by Total Points Value</h3>
          {popularRewards.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={popularRewards}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis 
                  dataKey="name" 
                  stroke="#9ca3af" 
                  angle={-45}
                  textAnchor="end"
                  height={100}
                  interval={0}
                  tick={{ fontSize: 12 }}
                />
                <YAxis stroke="#9ca3af" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#23272f', border: '1px solid #eab308' }}
                  labelStyle={{ color: '#eab308' }}
                />
                <Legend />
                <Bar dataKey="totalPoints" fill="#f59e0b" name="Total Points" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-gray-400 text-center py-12">No data available</p>
          )}
        </div>
      </div>

      {/* Detailed Table */}
      <div className="bg-[#23272f] rounded-lg border border-yellow-700 overflow-hidden">
        <div className="bg-yellow-700 bg-opacity-20 px-6 py-4">
          <h3 className="text-xl font-bold text-yellow-400">Detailed Rewards Statistics</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-yellow-700 bg-opacity-20">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold text-yellow-400">Rank</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-yellow-400">Reward Name</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-yellow-400">Category</th>
                <th className="px-4 py-3 text-right text-sm font-semibold text-yellow-400">Claims Count</th>
                <th className="px-4 py-3 text-right text-sm font-semibold text-yellow-400">Points Each</th>
                <th className="px-4 py-3 text-right text-sm font-semibold text-yellow-400">Total Points</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {popularRewards.map((reward, index) => (
                <tr key={reward.id} className="hover:bg-yellow-700 hover:bg-opacity-10 transition">
                  <td className="px-4 py-3 text-white font-semibold">#{index + 1}</td>
                  <td className="px-4 py-3 text-white">{reward.name}</td>
                  <td className="px-4 py-3 text-gray-300">{reward.category}</td>
                  <td className="px-4 py-3 text-right text-white font-semibold">{reward.count}</td>
                  <td className="px-4 py-3 text-right text-yellow-400">{reward.points.toLocaleString()}</td>
                  <td className="px-4 py-3 text-right text-yellow-400 font-bold">{reward.totalPoints.toLocaleString()}</td>
                </tr>
              ))}
              {popularRewards.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-gray-400">
                    No rewards data available for the selected time range
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
