import dotenv from 'dotenv'
import fs from 'fs'
import type { Abi } from 'viem'

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


export { readContractAddress, readContractABI }