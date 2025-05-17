import dotenv from 'dotenv'
import { join } from 'path'

import {
  CHAIN_ID,
  CONTRACT_DIR,
  FACTORY_CONTRACT_NAME,
  GAS_LIMIT,
  JUDGE_CONTRACT_NAME,
  LOCK_CONTRACT_NAME,
  VERIFIER_CONTRACT_NAME,
  RPC_URL,
} from './constants'
import { readContractABI, readContractAddress } from './utils'

const { ethers } = require('ethers')

var _ = require('lodash')

dotenv.config()

// Connect to the network
const provider = new ethers.providers.JsonRpcProvider(RPC_URL)

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
const verifierAbiFile = join(
  CONTRACT_DIR,
  'out',
  `${VERIFIER_CONTRACT_NAME}.sol`,
  `${VERIFIER_CONTRACT_NAME}.json`
)


/* ------ Scenario ------ */
// Initialize Participants Data
const ACCOUNTS = await provider.listAccounts()

console.log(ACCOUNTS)

const BUYER = ACCOUNTS[0]
const SELLER = ACCOUNTS[1]

const BUYER_SIGNER = provider.getSigner(BUYER)
const SELLER_SIGNER = provider.getSigner(SELLER)

let BUYER_BALANCE = await provider.getBalance(BUYER)
let SELLER_BALANCE = await provider.getBalance(SELLER)

console.log(`Initial buyer balance: ${ethers.utils.formatEther(BUYER_BALANCE)}`)
console.log(
  `Initial seller balance: ${ethers.utils.formatEther(SELLER_BALANCE)}\n`
)

const PRICE = 80

// The Contract object
// https://ethereum.stackexchange.com/a/134733
const factoryContract = new ethers.Contract(
  readContractAddress(factoryBroadcastFile, FACTORY_CONTRACT_NAME),
  readContractABI(factoryAbiFile),
  provider
)
const factoryContractWithBuyer = factoryContract.connect(BUYER_SIGNER)

// ----- Create Exchange -----
const tx_createExchange = await factoryContractWithBuyer.createExchange(
  SELLER,
  PRICE,
  {
    gasLimit: GAS_LIMIT,
  }
)
const receipt = await tx_createExchange.wait()
const event = receipt.events?.find((e: any) => e.event === 'ExchangeCreate')

const JUDGE_ADDRESS = event?.args?.judge
console.log(`Judge address: ${JUDGE_ADDRESS}`)

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

// ---- Seller Sets Verifier in Judge -----
const VERIFIER_ADDRESS = readContractAddress(verifierBroadcastFile, VERIFIER_CONTRACT_NAME)
await judgeContractWithSeller.setVerifier(VERIFIER_ADDRESS);
console.log(`Verifier address: ${VERIFIER_ADDRESS}\n`);

// ----- Seller Creates Hash and C and Sends it to Buyer -----
// _bytes32 Hash
const hashZ =
  '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef' // replace with actual hash

// ------ Buyer Independently Verifies Hz and Sends hz and Lock to Contract -----
// Call init with payable amount = PRICE (make sure to send in wei)
const tx_Init = await judgeContractWithBuyer.init(hashZ, {
  value: ethers.utils.parseEther(PRICE.toString()), // or ethers.utils.parseUnits(PRICE.toString(), "wei") depending on unit
  gasLimit: GAS_LIMIT,
})

BUYER_BALANCE = await provider.getBalance(BUYER)
SELLER_BALANCE = await provider.getBalance(SELLER)

console.log('----- Buyer creates Lock for payment -----')
console.log(
  `Create exchange buyer balance: ${ethers.utils.formatEther(BUYER_BALANCE)}`
)
console.log(
  `Create exchange seller balance: ${ethers.utils.formatEther(SELLER_BALANCE)}\n`
)

const receipt_Init = await tx_Init.wait()

console.log('Init transaction mined:', receipt_Init.transactionHash)

// You don't need a signer for reading data
const lockAddress = await judgeContractWithBuyer.getLockContract()
console.log('Lock address:', lockAddress)

// You don't need a signer for reading data
const sellerAddress = await judgeContractWithBuyer.getSeller()
console.log('Seller address:', sellerAddress, '\n')

// ----- Seller Checks Hz in Judge with getHz, if same Sends Proof to Verify and Unlock Contract -----
// Dummy proof bytes — just 128 zero bytes (size depends on your circuit)
// const dummyProof = ethers.utils.hexlify(new Uint8Array(128)) // or adjust size
const pa = ["0x2d424f535f3162416a7ea4cb4e234877a06ec85e1c4b726173bea8f31bebba23", "0x007216c4cdb1cb3e6ab41dfb3ee98c25b7c5a01fc975a9de75bf1e02b7694001"]
const pb = [["0x0ac4d88464a795b63c453560efb76b20b66c625d0f929763ae08468b1fe140bc", "0x1d6318b7a0b1601a6cd6c87729c27568ea41ee3357f51432b34441af04c6754f"],["0x2db4328dd056df6ad4d01bfc03990dc4010a41a03a5ab31d042cdcc5b41cb4ab", "0x2c5ef60033e243bcad674fba5bcb1b0bdb36b65fe14619e014dd54c359869d9c"]]
const pc = ["0x067878595861072901551214e6d85706322d9c59f54eb57caa45e7e90ea0795e", "0x236b2db1ea9a7620b6afbc80296f9e9a3832e47d60ebc9e4f0fc060af3ffe25b"]
const pubSignals = ["0x0000000000000000000000000000000000000000000000000000000000000000","0x0000000000000000000000000000000000000000000000000000000000000001"]

// Dummy k — random bytes32
const dummyK = ethers.utils.hexZeroPad('0x01', 32)

const tx_verify = await judgeContractWithSeller.verify(pa, pb, pc, pubSignals, dummyK, {
  gasLimit: GAS_LIMIT,
})
const receipt_verify = await tx_verify.wait()

console.log('----- Seller sends K to smart contract and smart contract verifies: -----')
console.log('Verify tx confirmed:', receipt_verify.transactionHash)

BUYER_BALANCE = await provider.getBalance(BUYER)
SELLER_BALANCE = await provider.getBalance(SELLER)

console.log(`Final buyer balance: ${ethers.utils.formatEther(BUYER_BALANCE)}`)
console.log(`Final seller balance: ${ethers.utils.formatEther(SELLER_BALANCE)}`)
