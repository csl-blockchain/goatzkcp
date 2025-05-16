import dotenv from 'dotenv'
import fs from 'fs'
import { join } from 'path'
import type { Abi } from 'viem'

var _ = require('lodash');
const { ethers } = require('ethers')

dotenv.config()

// Functions
function readContractAddress(broadcastFile: string, contractName: string): `0x${string}` {
  const broadcast = JSON.parse(fs.readFileSync(broadcastFile, 'utf8'))
  if (!broadcast.transactions?.[0]?.contractAddress) {
    throw new Error('Invalid broadcast file format')
  }
  return _.find(broadcast.transactions, { contractName : contractName }).contractAddress
}

function readContractABI(abiFile: string): Abi {
  const abi = JSON.parse(fs.readFileSync(abiFile, 'utf8'))
  if (!abi.abi) {
    throw new Error('Invalid ABI file format')
  }
  return abi.abi
}

// Initialize Network Data
const CHAIN_ID = '31337'
const RPC_URL = 'http://127.0.0.1:8545'

// Initialize Contract Data
const FACTORY_CONTRACT_NAME = 'GoatZKCPFactory'
const JUDGE_CONTRACT_NAME = 'GoatZKCPJudge'
const LOCK_CONTRACT_NAME = 'Lock'
const CONTRACT_DIR = join(__dirname, '../../packages/contracts')

// Connect to the network
const provider = new ethers.providers.JsonRpcProvider(RPC_URL)
const signer = provider.getSigner()

// Connect to the contract
const factoryBroadcastFile = join(
  CONTRACT_DIR,
  'broadcast',
  `${FACTORY_CONTRACT_NAME}.s.sol`,
  CHAIN_ID,
  'run-latest.json'
)
const judgeBroadcastFile = join(
  CONTRACT_DIR,
  'broadcast',
  `${JUDGE_CONTRACT_NAME}.s.sol`,
  CHAIN_ID,
  'run-latest.json'
)
const lockBroadcastFile = join(
  CONTRACT_DIR,
  'broadcast',
  `${LOCK_CONTRACT_NAME}.s.sol`,
  CHAIN_ID,
  'run-latest.json'
)

const factoryAbiFile = join(
  CONTRACT_DIR,
  'out',
  `${FACTORY_CONTRACT_NAME}.sol`,
  `${FACTORY_CONTRACT_NAME}.json`
)
const judgeAbiFile = join(
  CONTRACT_DIR,
  'out',
  `${JUDGE_CONTRACT_NAME}.sol`,
  `${JUDGE_CONTRACT_NAME}.json`
)
const lockAbiFile = join(
  CONTRACT_DIR,
  'out',
  `${LOCK_CONTRACT_NAME}.sol`,
  `${LOCK_CONTRACT_NAME}.json`
)


/* ------ Scenario ------ */
// Initialize Participants Data
const SELLER = '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266' // Fill in addresses with the ones provided after running `sanvil`
const BUYER = '0x70997970C51812dc3A010C7d01b50e0d17dc79C8'
const PRICE = 10

// The Contract object
// https://ethereum.stackexchange.com/a/134733
const factoryContract = new ethers.Contract(
  readContractAddress(factoryBroadcastFile, FACTORY_CONTRACT_NAME),
  readContractABI(factoryAbiFile),
  provider
)

const factoryContractWithSigner = factoryContract.connect(signer)
const JUDGE_ADDRESS = await factoryContractWithSigner.createExchange(SELLER, PRICE)

const judgeContract = new ethers.Contract(
  JUDGE_ADDRESS,
  readContractABI(judgeAbiFile),
  provider
)

console.log(judgeContract.buyer)
console.log(judgeContract.seller)
console.log(judgeContract.checkPrice())