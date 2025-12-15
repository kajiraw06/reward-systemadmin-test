"use client"
import { useEffect, useState } from 'react'

interface AuditLog {
  id: string
  action: string
  adminUser: string
  claimId: string
  rewardName: string
  userName: string
  details: string
  timestamp: string
}

export default function ActionHistory() {
  const [logs, setLogs] = useState<AuditLog[]>([])
  const [loading, setLoading] = useState(true)
  const [filterAction, setFilterAction] = useState('')
  const [filterAdmin, setFilterAdmin] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [limit, setLimit] = useState(50)
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(20)

  useEffect(() => {
    fetchLogs()
  }, [filterAction, filterAdmin, dateFrom, dateTo, limit])

  const fetchLogs = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      params.append('limit', limit.toString())
      if (filterAction) params.append('action', filterAction)
      if (filterAdmin) params.append('admin', filterAdmin)
      if (dateFrom) params.append('dateFrom', new Date(dateFrom).toISOString())
      if (dateTo) params.append('dateTo', new Date(dateTo).toISOString())

      const response = await fetch(`/api/admin/audit-logs?${params.toString()}`)
      const result = await response.json()
      
      if (result.success) {
        setLogs(result.data)
      }
    } catch (error) {
      console.error('Error fetching audit logs:', error)
    } finally {
      setLoading(false)
    }
  }

  const getActionColor = (action: string) => {
    switch (action.toLowerCase()) {
      case 'approved':
      case 'approve':
        return 'text-green-400'
      case 'rejected':
      case 'reject':
        return 'text-red-400'
      case 'processing':
        return 'text-blue-400'
      case 'shipped':
        return 'text-purple-400'
      case 'delivered':
        return 'text-cyan-400'
      case 'created':
      case 'added':
        return 'text-yellow-400'
      case 'updated':
      case 'edited':
        return 'text-orange-400'
      case 'deleted':
        return 'text-red-500'
      default:
        return 'text-gray-400'
    }
  }

  const getActionIcon = (action: string) => {
    // Icons removed - returning empty string
    return ''
  }

  // Pagination
  const totalPages = Math.ceil(logs.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const paginatedLogs = logs.slice(startIndex, endIndex)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-[#23272f] rounded-lg border border-yellow-700 p-6">
        <div className="flex flex-wrap gap-4 items-center justify-between">
          <h2 className="text-2xl font-bold text-yellow-400">Action History & Audit Logs</h2>
          <div className="flex gap-4 items-center">
            <button
              onClick={fetchLogs}
              className="bg-yellow-700 hover:bg-yellow-600 text-white px-4 py-2 rounded-lg font-semibold transition"
            >
              Refresh
            </button>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-[#23272f] rounded-lg border border-yellow-700 p-6">
        <h3 className="text-lg font-bold text-yellow-400 mb-4">Filters</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Action Filter */}
          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-2">Action Type</label>
            <select
              value={filterAction}
              onChange={(e) => setFilterAction(e.target.value)}
              className="w-full bg-[#181c23] border border-gray-600 rounded-lg px-4 py-2 text-white focus:border-yellow-500 focus:outline-none"
            >
              <option value="">All Actions</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
              <option value="processing">Processing</option>
              <option value="shipped">Shipped</option>
              <option value="delivered">Delivered</option>
              <option value="created">Created</option>
              <option value="updated">Updated</option>
              <option value="deleted">Deleted</option>
            </select>
          </div>

          {/* Admin Filter */}
          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-2">Admin User</label>
            <input
              type="text"
              value={filterAdmin}
              onChange={(e) => setFilterAdmin(e.target.value)}
              placeholder="Filter by admin..."
              className="w-full bg-[#181c23] border border-gray-600 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:border-yellow-500 focus:outline-none"
            />
          </div>

          {/* Date From */}
          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-2">From Date</label>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="w-full bg-[#181c23] border border-gray-600 rounded-lg px-4 py-2 text-white focus:border-yellow-500 focus:outline-none"
            />
          </div>

          {/* Date To */}
          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-2">To Date</label>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="w-full bg-[#181c23] border border-gray-600 rounded-lg px-4 py-2 text-white focus:border-yellow-500 focus:outline-none"
            />
          </div>
        </div>

        <div className="flex gap-4 mt-4">
          <button
            onClick={() => {
              setFilterAction('')
              setFilterAdmin('')
              setDateFrom('')
              setDateTo('')
            }}
            className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg font-semibold transition"
          >
            Clear Filters
          </button>
          
          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-300">Show:</label>
            <select
              value={limit}
              onChange={(e) => setLimit(Number(e.target.value))}
              className="bg-[#181c23] border border-gray-600 rounded-lg px-3 py-2 text-white focus:border-yellow-500 focus:outline-none"
            >
              <option value={50}>50 records</option>
              <option value={100}>100 records</option>
              <option value={200}>200 records</option>
              <option value={500}>500 records</option>
            </select>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-[#23272f] rounded-lg border border-yellow-700 p-4">
          <h3 className="text-yellow-400 font-semibold text-sm mb-1">Total Actions</h3>
          <p className="text-2xl font-bold">{logs.length}</p>
        </div>
        <div className="bg-[#23272f] rounded-lg border border-yellow-700 p-4">
          <h3 className="text-yellow-400 font-semibold text-sm mb-1">Approvals</h3>
          <p className="text-2xl font-bold text-green-400">
            {logs.filter(l => l.action.toLowerCase().includes('approve')).length}
          </p>
        </div>
        <div className="bg-[#23272f] rounded-lg border border-yellow-700 p-4">
          <h3 className="text-yellow-400 font-semibold text-sm mb-1">Rejections</h3>
          <p className="text-2xl font-bold text-red-400">
            {logs.filter(l => l.action.toLowerCase().includes('reject')).length}
          </p>
        </div>
        <div className="bg-[#23272f] rounded-lg border border-yellow-700 p-4">
          <h3 className="text-yellow-400 font-semibold text-sm mb-1">Other Actions</h3>
          <p className="text-2xl font-bold">
            {logs.filter(l => !l.action.toLowerCase().includes('approve') && !l.action.toLowerCase().includes('reject')).length}
          </p>
        </div>
      </div>

      {/* Logs Table */}
      <div className="bg-[#23272f] rounded-lg border border-yellow-700 overflow-hidden">
        <div className="bg-yellow-700 bg-opacity-20 px-6 py-4">
          <h3 className="text-xl font-bold text-yellow-400">Recent Actions</h3>
        </div>

        {loading ? (
          <div className="flex items-center justify-center p-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-400"></div>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-yellow-700 bg-opacity-20">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-yellow-400">Action</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-yellow-400">Admin User</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-yellow-400">Claim ID</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-yellow-400">Reward</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-yellow-400">User</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-yellow-400">Details</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-yellow-400">Timestamp</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700">
                  {paginatedLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-yellow-700 hover:bg-opacity-10 transition">
                      <td className="px-4 py-3">
                        <span className={`font-semibold ${getActionColor(log.action)}`}>
                          {log.action}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-white">{log.adminUser}</td>
                      <td className="px-4 py-3 text-gray-300 font-mono text-sm">{log.claimId}</td>
                      <td className="px-4 py-3 text-white">{log.rewardName}</td>
                      <td className="px-4 py-3 text-gray-300">{log.userName}</td>
                      <td className="px-4 py-3 text-gray-400 text-sm max-w-xs truncate">{log.details}</td>
                      <td className="px-4 py-3 text-gray-300 text-sm whitespace-nowrap">{log.timestamp}</td>
                    </tr>
                  ))}
                  {paginatedLogs.length === 0 && (
                    <tr>
                      <td colSpan={7} className="px-4 py-8 text-center text-gray-400">
                        No audit logs found. Actions will appear here once admins start making changes.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="px-6 py-4 border-t border-gray-700 flex items-center justify-between">
                <div className="text-sm text-gray-400">
                  Showing {startIndex + 1} - {Math.min(endIndex, logs.length)} of {logs.length} records
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="px-4 py-2 bg-yellow-700 hover:bg-yellow-600 disabled:bg-gray-700 disabled:cursor-not-allowed text-white rounded-lg font-semibold transition"
                  >
                    Previous
                  </button>
                  <span className="px-4 py-2 bg-[#181c23] text-white rounded-lg">
                    Page {currentPage} of {totalPages}
                  </span>
                  <button
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    className="px-4 py-2 bg-yellow-700 hover:bg-yellow-600 disabled:bg-gray-700 disabled:cursor-not-allowed text-white rounded-lg font-semibold transition"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
