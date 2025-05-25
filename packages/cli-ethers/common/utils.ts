import dotenv from 'dotenv'
import fs from 'fs'
import type { Abi } from 'viem'
const { ethers } = require('ethers')

var _ = require('lodash')

dotenv.config()

// Functions
function readContractAddress(
  broadcastFile: string,
  contractName: string
): `0x${string}` {
  const broadcast = JSON.parse(fs.readFileSync(broadcastFile, 'utf8'))
  if (!broadcast.transactions?.[0]?.contractAddress) {
    throw new Error('Invalid broadcast file format')
  }
  return _.find(broadcast.transactions, { contractName: contractName })
    .contractAddress
}

function readContractABI(abiFile: string): Abi {
  const abi = JSON.parse(fs.readFileSync(abiFile, 'utf8'))
  if (!abi.abi) {
    throw new Error('Invalid ABI file format')
  }
  return abi.abi
}

function checkMempool({ provider }: { provider: any }) {
  console.log('Mempool running...\n')
  provider.on('pending', async (txHash: any) => {
    try {
      const tx = await provider.getTransaction(txHash)
      if (tx && (tx.to || tx.from)) {
        // pendingTransactions.set(txHash, {
        //   from: tx.from,
        //   to: tx.to,
        //   value: tx.value.toString(),
        //   gasPrice: tx.gasPrice?.toString(),
        //   data: tx.data,
        //   timestamp: Date.now(),
        // })

        console.log(`\nMEMPOOL TRANSACTION DETECTED:`)
        console.log(`   Hash: ${txHash}`)
        console.log(`   From: ${tx.from}`)
        console.log(`   To: ${tx.to}`)
        console.log(`   Value: ${ethers.utils.formatEther(tx.value)} ETH`)
        console.log(`   Data: ${tx.data}\n`)
      }
    } catch (error) {
      // Ignore errors for demo purposes
    }
  })
}

export { readContractAddress, readContractABI, checkMempool }
