import { ethers } from 'ethers'

export const GOAT_ZKCP_ABI = [
  {
    inputs: [],
    name: 'initialize',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'lock',
    outputs: [],
    stateMutability: 'payable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'bytes',
        name: 'proof',
        type: 'bytes',
      },
      {
        internalType: 'bytes',
        name: 'key',
        type: 'bytes',
      },
    ],
    name: 'verify',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
]

export const GOAT_ZKCP_ADDRESS = '0x0000000000000000000000000000000000000000' // Replace with actual contract address

export const getGoatZKCPContract = (provider: ethers.providers.Provider) => {
  return new ethers.Contract(GOAT_ZKCP_ADDRESS, GOAT_ZKCP_ABI, provider)
} 