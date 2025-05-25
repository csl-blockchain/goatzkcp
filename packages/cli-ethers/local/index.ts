import dotenv from 'dotenv'
import { join } from 'path'

import {
  checkMempool,
  readContractABI,
  readContractAddress,
} from '../common/utils'
import {
  CHAIN_ID,
  CONTRACT_DIR,
  FACTORY_CONTRACT_NAME,
  GAS_LIMIT,
  JUDGE_CONTRACT_NAME,
  LOCK_CONTRACT_NAME,
  RPC_URL,
  VERIFIER_CONTRACT_NAME,
} from './constants'

const { ethers } = require('ethers')

var _ = require('lodash')

dotenv.config()

/* ----- CONTRACT DATA ----- */

// Contract Definitions
const factoryBroadcastFile = join(
  CONTRACT_DIR,
  'broadcast',
  `${FACTORY_CONTRACT_NAME}.s.sol`,
  CHAIN_ID,
  'run-latest.json'
)
const verifierBroadcastFile = join(
  CONTRACT_DIR,
  'broadcast',
  `${VERIFIER_CONTRACT_NAME}.s.sol`,
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

// Connect to the network
const provider = new ethers.providers.WebSocketProvider(RPC_URL)

checkMempool({ provider })

/* ------ SCENARIO DATA ------ */

// Initialize Participants Data
const ACCOUNTS = await provider.listAccounts()
const PRICE = 80

const BUYER = ACCOUNTS[0]
const SELLER = ACCOUNTS[1]

console.log(`Buyer address: ${BUYER}`)
console.log(`Seller address: ${SELLER}\n`)

const BUYER_SIGNER = provider.getSigner(BUYER)
const SELLER_SIGNER = provider.getSigner(SELLER)

let BUYER_BALANCE = await provider.getBalance(BUYER)
let SELLER_BALANCE = await provider.getBalance(SELLER)

// console.log(`List of accounts: ${ACCOUNTS}`)
console.log(`Initial buyer balance: ${ethers.utils.formatEther(BUYER_BALANCE)}`)
console.log(
  `Initial seller balance: ${ethers.utils.formatEther(SELLER_BALANCE)}\n`
)

/* ----- CONTRACT SETUP ----- */

// Factory Contract - Initialization
// https://ethereum.stackexchange.com/a/134733
const FACTORY_ADDRESS = readContractAddress(
  factoryBroadcastFile,
  FACTORY_CONTRACT_NAME
)
const factoryContract = new ethers.Contract(
  FACTORY_ADDRESS,
  readContractABI(factoryAbiFile),
  provider
)
const factoryContractWithBuyer = factoryContract.connect(BUYER_SIGNER)
console.log(`Factory address: ${FACTORY_ADDRESS}`)

// Verifier Contract - Initialization
const VERIFIER = readContractAddress(
  verifierBroadcastFile,
  VERIFIER_CONTRACT_NAME
)
console.log(`Verifier address: ${VERIFIER}`)

// Factory Contract - Create Ex change
const tx_createExchange = await factoryContractWithBuyer.createExchange(
  SELLER,
  VERIFIER,
  PRICE,
  {
    gasLimit: GAS_LIMIT,
  }
)
const receipt_createExchange = await tx_createExchange.wait()
const event_createExchange = receipt_createExchange.events?.find(
  (e: any) => e.event === 'ExchangeCreate'
)
const JUDGE_ADDRESS = event_createExchange?.args?.judge
console.log(`Judge address: ${JUDGE_ADDRESS}`)

// Judge Contract - Initialization
const judgeContractWithBuyer = new ethers.Contract(
  JUDGE_ADDRESS,
  readContractABI(judgeAbiFile),
  BUYER_SIGNER
)
const judgeContractWithSeller = new ethers.Contract(
  JUDGE_ADDRESS,
  readContractABI(judgeAbiFile),
  SELLER_SIGNER
)
const JUDGE_SIGNER = provider.getSigner(JUDGE_ADDRESS)




/* ----- SCENARIO START ----- */

// Judge Contract - Check Status (Ensure it is uninitialized)
let judgeStatus = await judgeContractWithBuyer.getStatus()
console.log(`Judge status: ${judgeStatus}\n`)

// 1. Seller creates hz and c and sends it to the Buyer through conventional methods of communication
//    Hash is of type _bytes32
const hashZ = '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef' // replace with actual hash

// 2. Buyer independently verifies hz, then sends hz and the payment to the Judge which in turn will create a Lock contract to lock the payment

// Judge Contract - Init (w/ payable amount = PRICE (make sure to send in wei))
const tx_Init = await judgeContractWithBuyer.init(hashZ, {
  value: ethers.utils.parseEther(PRICE.toString()), // or ethers.utils.parseUnits(PRICE.toString(), "wei") depending on unit
  gasLimit: GAS_LIMIT,
})
const receipt_Init = await tx_Init.wait()
console.log('----- Buyer initializes exchange -----')
console.log(`Init transaction mined: ${receipt_Init.transactionHash}`)

// Check is Lock contract created
const lockAddress = await judgeContractWithBuyer.getLockContract() // You don't need a signer for reading data
console.log('Lock address:', lockAddress)

// Lock Contract - Initialization
const lockContract = new ethers.Contract(
  lockAddress,
  readContractABI(lockAbiFile),
  provider
)
const lockContractWithJudge = lockContract.connect(JUDGE_SIGNER)

// Check Balances
BUYER_BALANCE = await provider.getBalance(BUYER)
SELLER_BALANCE = await provider.getBalance(SELLER)

console.log('\n----- Buyer creates Lock for payment -----')
console.log(`Buyer balance: ${ethers.utils.formatEther(BUYER_BALANCE)}`)
console.log(`Seller balance: ${ethers.utils.formatEther(SELLER_BALANCE)}`)

// Judge Contract - Check Status (Ensure it is initialized)
judgeStatus = await judgeContractWithBuyer.getStatus()
console.log(`Judge status: ${judgeStatus}\n`)

// 3. Seller checks hz in the Judge contract with getHz, if it is the same, then the seller sends the proof parameters to the verify method and unlock the contract

// Proof bytes — just 128 zero bytes (size depends on your circuit)
const pa = [
  '0x03704ee1383665cae109b3de9cc1ba0035a542a2cd6d88251aff58843afc1ff2',
  '0x2db941c503ade2c1bb5d2c215e6ef5dbda0913f01aee4f7edcc2fe0e2b7c3947',
]
const pb = [
  [
    '0x043926fb95a0289bfec5c7df3d93378503fcff17cb054b3fd30c184f6221edcb',
    '0x2fd17f632b4f6f1a2c43cb63529f5f6419a0da9d712dd9719c7d196d0ddbb913',
  ],
  [
    '0x3060a91b8f21f8082d7257e5932f438a1cbc55b39bf714cd78f26cbda2828a87',
    '0x013b0517c14fcbbca2da8b80c20e5a47c89f2ffa6674d74c16c5aa74dcb615d2',
  ],
]
const pc = [
  '0x2f46d99c56f65ab88e41de8ed2852d67962954f4fb6f943feeec327511b44838',
  '0x10d7f02bd6ab4acc2baf277ee3af34db8c1d29350820a54c3d0edfcf4f9d1109',
]
const pubSignals = [
  '0x0000000000000000000000000000000000000000000000000000000000000000',
  '0x0000000000000000000000000000000000000000000000000000000000000001',
]

// Dummy K — random bytes32
const dummyK = ethers.utils.hexZeroPad('0x01', 32)

console.log('----- Check if we can obtain key prior to verify -----')
// Check if the key is revealed in the Lock contract PRIOR to VERIFY
try {
  // Try to call getKey in a try-catch to see the detailed error
  const revealedKey = await lockContractWithJudge.getKey()
  console.log(`Key revealed: ${revealedKey}`)
} catch (error: any) {
  console.error('Key still not revealed!\n')
}

// Judge Contract - Verify
const tx_verify = await judgeContractWithSeller.verify(
  pa,
  pb,
  pc,
  pubSignals,
  dummyK,
  {
    gasLimit: GAS_LIMIT,
  }
)
const receipt_verify = await tx_verify.wait()
console.log(
  '----- Seller sends K to smart contract and smart contract verifies: -----'
)
console.log('Verify tx confirmed:', receipt_verify.transactionHash)
judgeStatus = await judgeContractWithBuyer.getStatus()
console.log('Judge status after verification:', judgeStatus)

// Check if the key is revealed in the Lock contract AFTER VERIFY
try {
  // Try to call getKey in a try-catch to see the detailed error
  const revealedKey = await lockContractWithJudge.getKey()
  console.log(`Key revealed: ${revealedKey}`)
} catch (error: any) {
  console.error('\nError getting key:', error.message)
}

// Check Balances
BUYER_BALANCE = await provider.getBalance(BUYER)
SELLER_BALANCE = await provider.getBalance(SELLER)

console.log('\n----- FINAL -----')
console.log(`Final buyer balance: ${ethers.utils.formatEther(BUYER_BALANCE)}`)
console.log(
  `Final seller balance: ${ethers.utils.formatEther(SELLER_BALANCE)}\n`
)

// Judge Contract - Check Status (Ensure it is finished)
judgeStatus = await judgeContractWithBuyer.getStatus()
console.log(judgeStatus)

// End of script
