'use client'

import { useState } from 'react'
import { useAccount } from 'wagmi'

interface ItemDetailProps {
  item: {
    id: string
    title: string
    category: string
    size: string
    format: string
    description: string
    sampleData?: string
    price?: string
  }
  role: 'buyer' | 'seller'
  onBack: () => void
}

type TransactionStatus =
  | 'pending_sts'
  | 'sts_successful'
  | 'awaiting_delivery'
  | 'delivery_sent'
  | 'payment_locked'
  | 'awaiting_verification'
  | 'completed'

export default function ItemDetail({ item, role, onBack }: ItemDetailProps) {
  const { address } = useAccount()
  const [showSample, setShowSample] = useState(false)
  const [showPricing, setShowPricing] = useState(false)
  const [transactionStatus, setTransactionStatus] = useState<TransactionStatus>('pending_sts')

  const handleBuy = async () => {
    // TODO: Implement STS key agreement
    setTransactionStatus('sts_successful')
  }

  const handleEncrypt = async () => {
    // TODO: Implement encryption logic
    setTransactionStatus('delivery_sent')
  }

  const handleLockPayment = async () => {
    // TODO: Implement payment locking
    setTransactionStatus('payment_locked')
  }

  const handleVerify = async () => {
    // TODO: Implement ZK proof verification
    setTransactionStatus('completed')
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <button
        onClick={onBack}
        className="mb-6 text-indigo-600 hover:text-indigo-500"
      >
        ← Back to list
      </button>

      <div className="bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">{item.title}</h1>
        
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div>
            <p className="text-sm text-gray-500">Category</p>
            <p className="font-medium">{item.category}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Size</p>
            <p className="font-medium">{item.size}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Format</p>
            <p className="font-medium">{item.format}</p>
          </div>
        </div>

        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-2">Description</h2>
          <p className="text-gray-600">{item.description}</p>
        </div>

        {item.sampleData && (
          <div className="mb-6">
            <h2 className="text-lg font-semibold mb-2">Sample Data</h2>
            <div className="relative">
              <pre className="bg-gray-50 p-4 rounded-lg overflow-x-auto">
                {showSample ? item.sampleData : '••••••••••••••••••••••••••••••••'}
              </pre>
              <button
                onClick={() => setShowSample(!showSample)}
                className="absolute top-2 right-2 text-sm text-indigo-600 hover:text-indigo-500"
              >
                {showSample ? 'Hide' : 'Show'} Sample
              </button>
            </div>
          </div>
        )}

        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-2">Pricing</h2>
          {showPricing ? (
            <p className="text-gray-600">{item.price}</p>
          ) : (
            <button
              onClick={() => setShowPricing(true)}
              className="text-indigo-600 hover:text-indigo-500"
            >
              Request detail for pricing
            </button>
          )}
        </div>

        {role === 'buyer' && (
          <div className="space-y-4">
            <button
              onClick={handleBuy}
              className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Buy Now
            </button>

            {transactionStatus === 'awaiting_delivery' && (
              <div className="text-center text-gray-600">
                Awaiting c and hz from the Seller
              </div>
            )}

            {transactionStatus === 'delivery_sent' && (
              <button
                onClick={handleLockPayment}
                className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
              >
                Lock Payment
              </button>
            )}

            {transactionStatus === 'awaiting_verification' && (
              <div className="text-center text-gray-600">
                Awaiting key reveal
              </div>
            )}
          </div>
        )}

        {role === 'seller' && (
          <div className="space-y-4">
            {transactionStatus === 'sts_successful' && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Encryption Menu</h3>
                <div className="space-y-2">
                  <input
                    type="text"
                    placeholder="Enter your key k"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-md">
                    <option value="aes">AES</option>
                    <option value="rsa">RSA</option>
                  </select>
                  <button
                    onClick={handleEncrypt}
                    className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700"
                  >
                    Encrypt
                  </button>
                </div>
              </div>
            )}

            {transactionStatus === 'payment_locked' && (
              <button
                onClick={handleVerify}
                className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700"
              >
                Generate ZK Proof and Verify
              </button>
            )}
          </div>
        )}

        <div className="mt-6 pt-6 border-t border-gray-200">
          <h3 className="text-lg font-semibold mb-2">Transaction Status</h3>
          <div className="text-gray-600">
            {transactionStatus === 'pending_sts' && 'Pending STS Key Agreement'}
            {transactionStatus === 'sts_successful' && 'STS Key Agreement Successful'}
            {transactionStatus === 'awaiting_delivery' && 'Awaiting delivery from Seller'}
            {transactionStatus === 'delivery_sent' && 'c and hz sent to Buyer'}
            {transactionStatus === 'payment_locked' && 'Payment locked and sent to Smart Contract'}
            {transactionStatus === 'awaiting_verification' && 'Awaiting verification'}
            {transactionStatus === 'completed' && 'Transaction completed'}
          </div>
        </div>
      </div>
    </div>
  )
} 