"use client"
import { useState, useEffect } from 'react'

interface InventoryManagementProps {
  onClose: () => void
  rewards: any[]
  onRefresh: () => void
}

export default function InventoryManagement({ onClose, rewards, onRefresh }: InventoryManagementProps) {
  const [activeTab, setActiveTab] = useState<'bulk' | 'alerts' | 'history'>('bulk')
  const [bulkUpdates, setBulkUpdates] = useState<Record<string, number>>({})
  const [lowStockItems, setLowStockItems] = useState<any[]>([])
  const [outOfStockItems, setOutOfStockItems] = useState<any[]>([])
  const [restockHistory, setRestockHistory] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedReward, setSelectedReward] = useState<string | null>(null)
  const [restockAmount, setRestockAmount] = useState('')
  const [restockNotes, setRestockNotes] = useState('')
  const [showRestockModal, setShowRestockModal] = useState(false)
  const [alertsSummary, setAlertsSummary] = useState<any>(null)
  const [csvFile, setCsvFile] = useState<File | null>(null)
  const [csvPreview, setCsvPreview] = useState<any[]>([])
  const [showCsvPreview, setShowCsvPreview] = useState(false)

  useEffect(() => {
    fetchInventoryData()
  }, [])

  const fetchInventoryData = async () => {
    try {
      const [alertsRes, historyRes] = await Promise.all([
        fetch('/api/admin/inventory?action=alerts-summary'),
        fetch('/api/admin/inventory?action=restock-history')
      ])

      const alertsResponse = await alertsRes.json()
      const historyResponse = await historyRes.json()

      // Handle wrapped response format {success: true, data: {...}}
      const alertsData = alertsResponse.data || alertsResponse
      const historyData = historyResponse.data || historyResponse

      if (Array.isArray(alertsData)) {
        setAlertsSummary(alertsData[0])
        setLowStockItems(alertsData[0]?.lowStock || [])
        setOutOfStockItems(alertsData[0]?.outOfStock || [])
      } else {
        setLowStockItems(alertsData.lowStock || [])
        setOutOfStockItems(alertsData.outOfStock || [])
        setAlertsSummary(alertsData)
      }

      if (Array.isArray(historyData)) {
        setRestockHistory(historyData)
      }
    } catch (error) {
      console.error('Error fetching inventory data:', error)
    }
  }

  const handleBulkUpdate = async () => {
    const updates = Object.entries(bulkUpdates).map(([id, quantity]) => ({
      id,
      quantity: parseInt(quantity.toString())
    }))

    if (updates.length === 0) {
      alert('No updates to apply')
      return
    }

    setLoading(true)
    try {
      const response = await fetch('/api/admin/inventory', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'bulk-update', updates })
      })

      const data = await response.json()
      
      if (response.ok) {
        alert(`Bulk update completed:\n✓ ${data.success} succeeded\n✗ ${data.failed} failed`)
        setBulkUpdates({})
        onRefresh()
        fetchInventoryData()
      } else {
        alert('Bulk update failed: ' + (data.error || 'Unknown error'))
      }
    } catch (error) {
      console.error('Error during bulk update:', error)
      alert('Error during bulk update')
    } finally {
      setLoading(false)
    }
  }

  const handleRestock = async () => {
    if (!selectedReward || !restockAmount) {
      alert('Please fill in all required fields')
      return
    }

    const quantity = parseInt(restockAmount)
    if (isNaN(quantity) || quantity <= 0) {
      alert('Invalid quantity')
      return
    }

    setLoading(true)
    try {
      const response = await fetch('/api/admin/inventory', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'restock',
          rewardId: selectedReward,
          quantity,
          notes: restockNotes,
          restockedBy: 'admin'
        })
      })

      const data = await response.json()

      if (response.ok) {
        alert(`✓ Restock successful!\n${data.reward}\nPrevious: ${data.previousQuantity}\nAdded: ${data.addedQuantity}\nNew: ${data.newQuantity}`)
        setShowRestockModal(false)
        setSelectedReward(null)
        setRestockAmount('')
        setRestockNotes('')
        onRefresh()
        fetchInventoryData()
      } else {
        alert('Restock failed: ' + (data.error || 'Unknown error'))
      }
    } catch (error) {
      console.error('Error during restock:', error)
      alert('Error during restock')
    } finally {
      setLoading(false)
    }
  }

  const handleCsvUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.name.endsWith('.csv')) {
      alert('Please upload a CSV file')
      return
    }

    setCsvFile(file)
    
    // Parse CSV for preview
    const text = await file.text()
    const lines = text.split('\n').filter(line => line.trim())
    const headers = lines[0].split(',').map(h => h.trim())
    
    // Validate headers
    const requiredHeaders = ['reward_id', 'quantity']
    const hasRequiredHeaders = requiredHeaders.every(h => 
      headers.some(header => header.toLowerCase() === h.toLowerCase())
    )
    
    if (!hasRequiredHeaders) {
      alert('CSV must contain "reward_id" and "quantity" columns')
      setCsvFile(null)
      return
    }
    
    // Parse data rows
    const preview: any[] = []
    for (let i = 1; i < Math.min(lines.length, 11); i++) { // Preview first 10 rows
      const values = lines[i].split(',').map(v => v.trim())
      const row: any = {}
      headers.forEach((header, index) => {
        row[header.toLowerCase()] = values[index]
      })
      
      // Find matching reward
      const reward = rewards.find(r => r.id === row.reward_id || r.name.toLowerCase() === row.reward_id?.toLowerCase())
      if (reward) {
        row.reward_name = reward.name
        row.current_quantity = reward.quantity
        row.new_quantity = parseInt(row.quantity)
        row.valid = !isNaN(row.new_quantity) && row.new_quantity >= 0
      } else {
        row.valid = false
        row.error = 'Reward not found'
      }
      
      preview.push(row)
    }
    
    setCsvPreview(preview)
    setShowCsvPreview(true)
  }

  const handleCsvImport = async () => {
    if (!csvFile) return
    
    setLoading(true)
    try {
      const text = await csvFile.text()
      const lines = text.split('\n').filter(line => line.trim())
      const headers = lines[0].split(',').map(h => h.trim().toLowerCase())
      
      const updates: any[] = []
      
      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',').map(v => v.trim())
        const row: any = {}
        headers.forEach((header, index) => {
          row[header] = values[index]
        })
        
        // Find reward by ID or name
        const reward = rewards.find(r => 
          r.id === row.reward_id || 
          r.name.toLowerCase() === row.reward_id?.toLowerCase()
        )
        
        if (reward && row.quantity) {
          const quantity = parseInt(row.quantity)
          if (!isNaN(quantity) && quantity >= 0) {
            updates.push({
              id: reward.id,
              quantity: quantity
            })
          }
        }
      }
      
      if (updates.length === 0) {
        alert('No valid updates found in CSV')
        setLoading(false)
        return
      }
      
      // Send bulk update
      const response = await fetch('/api/admin/inventory', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'bulk-update', updates })
      })

      const data = await response.json()
      
      if (response.ok) {
        alert(`CSV import completed:\n✓ ${data.success} succeeded\n✗ ${data.failed} failed\n\nTotal rows processed: ${updates.length}`)
        setCsvFile(null)
        setCsvPreview([])
        setShowCsvPreview(false)
        onRefresh()
        fetchInventoryData()
      } else {
        alert('CSV import failed: ' + (data.error || 'Unknown error'))
      }
    } catch (error) {
      console.error('Error importing CSV:', error)
      alert('Error importing CSV')
    } finally {
      setLoading(false)
    }
  }

  const downloadCsvTemplate = () => {
    const template = 'reward_id,quantity\n# Use either reward ID (UUID) or exact reward name\n# Example:\nae1d2f3g-4h5i-6j7k-8l9m-0n1o2p3q4r5s,100\niPhone 16 Pro Max,50'
    const blob = new Blob([template], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'inventory_update_template.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleToggleActive = async (rewardId: string, currentStatus: boolean) => {
    if (!confirm(`Are you sure you want to ${currentStatus ? 'deactivate' : 'activate'} this reward?`)) {
      return
    }

    try {
      const response = await fetch('/api/admin/inventory', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'toggle-active',
          rewardId,
          isActive: !currentStatus
        })
      })

      if (response.ok) {
        onRefresh()
        fetchInventoryData()
      }
    } catch (error) {
      console.error('Error toggling active status:', error)
    }
  }

  const getStockStatusColor = (quantity: number, threshold: number = 5) => {
    if (quantity === 0) return 'text-red-500'
    if (quantity <= threshold) return 'text-yellow-500'
    return 'text-green-500'
  }

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black bg-opacity-90" onClick={onClose}>
      <div 
        className="bg-[#1a1d24] rounded-2xl shadow-2xl p-8 max-w-7xl w-full max-h-[90vh] overflow-y-auto relative border-2 border-yellow-500" 
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-extrabold text-yellow-400">📦 Inventory Management</h2>
          <button className="text-gray-400 hover:text-yellow-300 text-3xl font-bold" onClick={onClose}>
            &times;
          </button>
        </div>

        {/* Alerts Summary Banner */}
        {alertsSummary && (alertsSummary.outOfStockCount > 0 || alertsSummary.lowStockCount > 0) && (
          <div className="mb-6 p-4 bg-red-900 bg-opacity-30 border-2 border-red-500 rounded-lg">
            <div className="flex items-center gap-4">
              <span className="text-3xl">⚠️</span>
              <div>
                <h3 className="text-red-400 font-bold text-lg">Inventory Alerts</h3>
                <p className="text-white">
                  {alertsSummary.outOfStockCount > 0 && (
                    <span className="text-red-300">🔴 {alertsSummary.outOfStockCount} out of stock</span>
                  )}
                  {alertsSummary.outOfStockCount > 0 && alertsSummary.lowStockCount > 0 && <span> • </span>}
                  {alertsSummary.lowStockCount > 0 && (
                    <span className="text-yellow-300">🟡 {alertsSummary.lowStockCount} low stock</span>
                  )}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-2 mb-6 border-b border-gray-700">
          <button
            onClick={() => setActiveTab('bulk')}
            className={`px-6 py-3 font-bold transition ${
              activeTab === 'bulk'
                ? 'text-yellow-400 border-b-2 border-yellow-400'
                : 'text-gray-400 hover:text-yellow-300'
            }`}
          >
            📊 Bulk Update
          </button>
          <button
            onClick={() => setActiveTab('alerts')}
            className={`px-6 py-3 font-bold transition relative ${
              activeTab === 'alerts'
                ? 'text-yellow-400 border-b-2 border-yellow-400'
                : 'text-gray-400 hover:text-yellow-300'
            }`}
          >
            🚨 Alerts
            {(alertsSummary?.outOfStockCount > 0 || alertsSummary?.lowStockCount > 0) && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {(alertsSummary?.outOfStockCount || 0) + (alertsSummary?.lowStockCount || 0)}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`px-6 py-3 font-bold transition ${
              activeTab === 'history'
                ? 'text-yellow-400 border-b-2 border-yellow-400'
                : 'text-gray-400 hover:text-yellow-300'
            }`}
          >
            📜 Restock History
          </button>
        </div>

        {/* Bulk Update Tab */}
        {activeTab === 'bulk' && (
          <div>
            <div className="mb-4 flex justify-between items-center">
              <p className="text-gray-300">Update quantities for multiple rewards at once</p>
              <div className="flex gap-2">
                <button
                  onClick={downloadCsvTemplate}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-bold text-sm"
                >
                  Download CSV Template
                </button>
                <label className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-bold text-sm cursor-pointer">
                  Upload CSV
                  <input
                    type="file"
                    accept=".csv"
                    onChange={handleCsvUpload}
                    className="hidden"
                  />
                </label>
                <button
                  onClick={handleBulkUpdate}
                  disabled={loading || Object.keys(bulkUpdates).length === 0}
                  className="bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white px-6 py-2 rounded-lg font-bold"
                >
                  {loading ? 'Updating...' : `Apply ${Object.keys(bulkUpdates).length} Updates`}
                </button>
              </div>
            </div>

            <div className="bg-[#23272f] rounded-lg overflow-hidden">
              <table className="w-full">
                <thead className="bg-yellow-700 bg-opacity-20">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-yellow-400">Reward</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-yellow-400">Category</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-yellow-400">Current Stock</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-yellow-400">Status</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-yellow-400">New Quantity</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-yellow-400">Quick Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700">
                  {rewards.map((reward) => {
                    const currentQty = reward.quantity || 0
                    const threshold = reward.low_stock_threshold || 5
                    
                    return (
                      <tr key={reward.id} className="hover:bg-gray-800 transition">
                        <td className="px-4 py-3 text-sm font-medium">{reward.name}</td>
                        <td className="px-4 py-3 text-sm">{reward.category}</td>
                        <td className={`px-4 py-3 text-sm font-bold ${getStockStatusColor(currentQty, threshold)}`}>
                          {currentQty}
                        </td>
                        <td className="px-4 py-3 text-sm">
                          {currentQty === 0 ? (
                            <span className="bg-red-600 text-white px-2 py-1 rounded text-xs">Out of Stock</span>
                          ) : currentQty <= threshold ? (
                            <span className="bg-yellow-600 text-white px-2 py-1 rounded text-xs">Low Stock</span>
                          ) : (
                            <span className="bg-green-600 text-white px-2 py-1 rounded text-xs">In Stock</span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <input
                            type="number"
                            min="0"
                            value={bulkUpdates[reward.id] ?? ''}
                            onChange={(e) => {
                              const value = e.target.value
                              if (value === '') {
                                const newUpdates = { ...bulkUpdates }
                                delete newUpdates[reward.id]
                                setBulkUpdates(newUpdates)
                              } else {
                                setBulkUpdates({ ...bulkUpdates, [reward.id]: parseInt(value) })
                              }
                            }}
                            placeholder={currentQty.toString()}
                            className="w-24 px-3 py-1 bg-gray-700 text-white rounded border border-gray-600 focus:border-yellow-400 focus:outline-none"
                          />
                        </td>
                        <td className="px-4 py-3">
                          <button
                            onClick={() => {
                              setSelectedReward(reward.id)
                              setShowRestockModal(true)
                            }}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-xs font-semibold"
                          >
                            + Restock
                          </button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Alerts Tab */}
        {activeTab === 'alerts' && (
          <div className="space-y-6">
            {/* Out of Stock */}
            <div>
              <h3 className="text-xl font-bold text-red-400 mb-3">🔴 Out of Stock ({outOfStockItems.length})</h3>
              {outOfStockItems.length === 0 ? (
                <div className="text-gray-400 text-center py-8">No out of stock items</div>
              ) : (
                <div className="bg-[#23272f] rounded-lg overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-red-900 bg-opacity-30">
                      <tr>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-red-400">Reward</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-red-400">Category</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-red-400">Tier</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-red-400">Last Updated</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-red-400">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-700">
                      {outOfStockItems.map((item) => (
                        <tr key={item.id} className="hover:bg-gray-800">
                          <td className="px-4 py-3 text-sm font-medium">{item.name}</td>
                          <td className="px-4 py-3 text-sm">{item.category}</td>
                          <td className="px-4 py-3 text-sm capitalize">{item.tier}</td>
                          <td className="px-4 py-3 text-sm text-gray-400">
                            {new Date(item.updated_at).toLocaleString()}
                          </td>
                          <td className="px-4 py-3">
                            <button
                              onClick={() => {
                                setSelectedReward(item.id)
                                setShowRestockModal(true)
                              }}
                              className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-xs font-semibold"
                            >
                              Restock Now
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Low Stock */}
            <div>
              <h3 className="text-xl font-bold text-yellow-400 mb-3">🟡 Low Stock ({lowStockItems.length})</h3>
              {lowStockItems.length === 0 ? (
                <div className="text-gray-400 text-center py-8">No low stock items</div>
              ) : (
                <div className="bg-[#23272f] rounded-lg overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-yellow-900 bg-opacity-30">
                      <tr>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-yellow-400">Reward</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-yellow-400">Category</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-yellow-400">Current Stock</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-yellow-400">Threshold</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-yellow-400">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-700">
                      {lowStockItems.map((item) => (
                        <tr key={item.id} className="hover:bg-gray-800">
                          <td className="px-4 py-3 text-sm font-medium">{item.name}</td>
                          <td className="px-4 py-3 text-sm">{item.category}</td>
                          <td className="px-4 py-3 text-sm font-bold text-yellow-500">{item.quantity}</td>
                          <td className="px-4 py-3 text-sm text-gray-400">{item.low_stock_threshold}</td>
                          <td className="px-4 py-3">
                            <button
                              onClick={() => {
                                setSelectedReward(item.id)
                                setShowRestockModal(true)
                              }}
                              className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-xs font-semibold"
                            >
                              Restock
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* History Tab */}
        {activeTab === 'history' && (
          <div>
            <div className="mb-4">
              <p className="text-gray-300">Track all restocking activities</p>
            </div>

            <div className="bg-[#23272f] rounded-lg overflow-hidden">
              <table className="w-full">
                <thead className="bg-yellow-700 bg-opacity-20">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-yellow-400">Date</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-yellow-400">Reward</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-yellow-400">Previous</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-yellow-400">Added</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-yellow-400">New Total</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-yellow-400">By</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-yellow-400">Notes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700">
                  {restockHistory.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-4 py-8 text-center text-gray-400">
                        No restock history found
                      </td>
                    </tr>
                  ) : (
                    restockHistory.map((entry) => (
                      <tr key={entry.id} className="hover:bg-gray-800">
                        <td className="px-4 py-3 text-sm text-gray-300">
                          {new Date(entry.created_at).toLocaleString()}
                        </td>
                        <td className="px-4 py-3 text-sm font-medium">{entry.reward?.name || 'Unknown'}</td>
                        <td className="px-4 py-3 text-sm text-gray-400">{entry.previous_quantity}</td>
                        <td className="px-4 py-3 text-sm text-green-400 font-bold">+{entry.added_quantity}</td>
                        <td className="px-4 py-3 text-sm font-bold">{entry.new_quantity}</td>
                        <td className="px-4 py-3 text-sm text-gray-400">{entry.restocked_by || 'System'}</td>
                        <td className="px-4 py-3 text-sm text-gray-400">{entry.notes || '-'}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Restock Modal */}
        {showRestockModal && (
          <div 
            className="fixed inset-0 z-[99999] flex items-center justify-center bg-black bg-opacity-90"
            onClick={() => setShowRestockModal(false)}
          >
            <div 
              className="bg-[#23272f] rounded-2xl p-8 max-w-md w-full border-2 border-yellow-500"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-2xl font-bold text-yellow-400 mb-4">📦 Restock Item</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-yellow-100 text-sm font-semibold mb-2">Reward</label>
                  <select
                    value={selectedReward || ''}
                    onChange={(e) => setSelectedReward(e.target.value)}
                    className="w-full px-4 py-2 bg-gray-700 text-white rounded border border-gray-600 focus:border-yellow-400 focus:outline-none"
                  >
                    <option value="">Select a reward</option>
                    {rewards.map((reward) => (
                      <option key={reward.id} value={reward.id}>
                        {reward.name} (Current: {reward.quantity})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-yellow-100 text-sm font-semibold mb-2">Quantity to Add *</label>
                  <input
                    type="number"
                    min="1"
                    value={restockAmount}
                    onChange={(e) => setRestockAmount(e.target.value)}
                    className="w-full px-4 py-2 bg-gray-700 text-white rounded border border-gray-600 focus:border-yellow-400 focus:outline-none"
                    placeholder="Enter quantity"
                  />
                </div>

                <div>
                  <label className="block text-yellow-100 text-sm font-semibold mb-2">Notes (optional)</label>
                  <textarea
                    value={restockNotes}
                    onChange={(e) => setRestockNotes(e.target.value)}
                    className="w-full px-4 py-2 bg-gray-700 text-white rounded border border-gray-600 focus:border-yellow-400 focus:outline-none"
                    placeholder="Add notes about this restock"
                    rows={3}
                  />
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={handleRestock}
                    disabled={loading}
                    className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white px-6 py-3 rounded-lg font-bold"
                  >
                    {loading ? 'Restocking...' : 'Confirm Restock'}
                  </button>
                  <button
                    onClick={() => {
                      setShowRestockModal(false)
                      setRestockAmount('')
                      setRestockNotes('')
                    }}
                    className="flex-1 bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg font-bold"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* CSV Preview Modal */}
      {showCsvPreview && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black bg-opacity-90 p-4" onClick={() => setShowCsvPreview(false)}>
          <div className="bg-[#23272f] rounded-2xl shadow-2xl p-6 max-w-4xl w-full max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-2xl font-extrabold text-yellow-400">CSV Preview</h3>
              <button className="text-gray-400 hover:text-yellow-300 text-2xl font-bold" onClick={() => setShowCsvPreview(false)}>&times;</button>
            </div>

            <p className="text-gray-300 mb-4">
              Review the changes before importing. Showing first 10 rows.
            </p>

            <div className="bg-[#1a1d24] rounded-lg overflow-hidden mb-4">
              <table className="w-full text-sm">
                <thead className="bg-yellow-700 bg-opacity-20">
                  <tr>
                    <th className="px-3 py-2 text-left text-yellow-400 font-semibold">Status</th>
                    <th className="px-3 py-2 text-left text-yellow-400 font-semibold">Reward</th>
                    <th className="px-3 py-2 text-left text-yellow-400 font-semibold">Current</th>
                    <th className="px-3 py-2 text-left text-yellow-400 font-semibold">New</th>
                    <th className="px-3 py-2 text-left text-yellow-400 font-semibold">Change</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700">
                  {csvPreview.map((row, index) => (
                    <tr key={index} className={row.valid ? 'hover:bg-gray-800' : 'bg-red-900 bg-opacity-20'}>
                      <td className="px-3 py-2">
                        {row.valid ? (
                          <span className="text-green-400">Valid</span>
                        ) : (
                          <span className="text-red-400" title={row.error}>Invalid</span>
                        )}
                      </td>
                      <td className="px-3 py-2 font-medium">
                        {row.reward_name || row.reward_id}
                        {!row.valid && <div className="text-xs text-red-400">{row.error}</div>}
                      </td>
                      <td className="px-3 py-2 text-gray-400">{row.current_quantity ?? 'N/A'}</td>
                      <td className="px-3 py-2 font-bold text-yellow-300">{row.new_quantity ?? row.quantity}</td>
                      <td className="px-3 py-2">
                        {row.valid && row.current_quantity !== undefined && (
                          <span className={row.new_quantity > row.current_quantity ? 'text-green-400' : row.new_quantity < row.current_quantity ? 'text-red-400' : 'text-gray-400'}>
                            {row.new_quantity > row.current_quantity ? '+' : ''}{row.new_quantity - row.current_quantity}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex gap-3 justify-end">
              <button
                onClick={() => {
                  setShowCsvPreview(false)
                  setCsvFile(null)
                  setCsvPreview([])
                }}
                className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 rounded-lg font-bold"
              >
                Cancel
              </button>
              <button
                onClick={handleCsvImport}
                disabled={loading || csvPreview.every(row => !row.valid)}
                className="bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white px-6 py-2 rounded-lg font-bold"
              >
                {loading ? 'Importing...' : `Import ${csvPreview.filter(row => row.valid).length} Updates`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
