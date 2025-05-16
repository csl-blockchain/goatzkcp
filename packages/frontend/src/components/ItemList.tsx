'use client'

import { useState } from 'react'

interface Item {
  id: string
  title: string
  category: string
  size: string
  format: string
  sellerReputation: number
  isVerified: boolean
}

interface ItemListProps {
  items: Item[]
  onItemClick: (item: Item) => void
}

export default function ItemList({ items, onItemClick }: ItemListProps) {
  const [searchQuery, setSearchQuery] = useState('')

  const filteredItems = items.filter(item =>
    item.title.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="space-y-4">
      <div className="relative">
        <input
          type="text"
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
          placeholder="Search items..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filteredItems.map((item) => (
          <div
            key={item.id}
            className="bg-white rounded-lg shadow p-4 cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => onItemClick(item)}
          >
            <h3 className="text-lg font-semibold text-gray-900">{item.title}</h3>
            <div className="mt-2 space-y-1">
              <p className="text-sm text-gray-500">Category: {item.category}</p>
              <p className="text-sm text-gray-500">Size: {item.size}</p>
              <p className="text-sm text-gray-500">Format: {item.format}</p>
              <div className="flex items-center space-x-2">
                <p className="text-sm text-gray-500">
                  Seller Reputation: {item.sellerReputation}
                </p>
                {item.isVerified && (
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                    Verified
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
} 