import chalk from 'chalk'
import { join } from 'path'
import {
  createShieldedPublicClient,
  createShieldedWalletClient,
  getShieldedContract,
  sanvil,
} from 'seismic-viem'
import { http, toBytes, toHex } from 'viem'
import { privateKeyToAccount } from 'viem/accounts'
import _ from "lodash"
import { CONTRACT_DIR } from '../lib/constants'
import {
  displayTransaction,
  printFail,
  printSuccess,
  readAbi,
  readContractAddress,
} from '../lib/utils'

/*
 * Creates new exchange between buyer and seller
 */
async function createExchange(
  contract: any,
  walletClient: any,
  abi: any,
  sellerAddress: any,
  buyerAddress: any,
  verifierAddress: any,
  timestamp: any,
  price: number
) {
  console.log(chalk.blue(`\n\nCreating exchange`))
  const { plaintextTx, shieldedTx, txHash } =
    await contract.dwrite.createExchange([
      sellerAddress,
      verifierAddress,
      timestamp,
      price,
    ])
  displayTransaction(plaintextTx, _.find(abi, { name: "createExchange" }))
  displayTransaction(shieldedTx, undefined, true)
  await walletClient.waitForTransactionReceipt({
    hash: txHash,
  })
  printSuccess(`Transaction confirmed: ${chalk.green(`${txHash}`)}`)

  let judge
  try {
    judge = await contract.read.getJudge([
      sellerAddress,
      buyerAddress,
      timestamp,
    ])
  } catch (_) {
    judge = '???'
  }

  printSuccess(`Judge address: ${chalk.green(judge)}`)

  let verifier
  try {
    verifier = await contract.read.getVerifier([
      sellerAddress,
      buyerAddress,
      timestamp,
    ])
  } catch (_) {
    verifier = '???'
  }

  printSuccess(`Verifier address: ${chalk.green(verifier)}`)

  return judge
}

/*
 * Initializes the created exchange. Buyer locks payment.
 */
async function init(
  contract: any,
  walletClient: any,
  abi: any,
  hashZ: any,
  price: number
) {
  console.log(chalk.blue(`\n\nInitializing exchange`))
  const { plaintextTx, shieldedTx, txHash } = await contract.dwrite.init(
    [hashZ],
    {
      value: price,
    }
  )
  displayTransaction(plaintextTx, _.find(abi, { name: "init" }))
  displayTransaction(shieldedTx, undefined, true)
  await walletClient.waitForTransactionReceipt({
    hash: txHash,
  })
  printSuccess(`Transaction confirmed: ${chalk.green(`${txHash}`)}`)
}

/*
 * Gets the status of the judge
 */
async function getJudgeStatus(contract: any) {
  console.log(chalk.blue(`\n\nGetting judge contract status`))
  let status
  try {
    status = await contract.read.getStatus([])
  } catch (_) {
    status = '???'
  }
  printSuccess(`Judge status: ${chalk.green(status)}`)
}

/*
 * Gets the key
 */
async function getKey(contract: any) {
  console.log(chalk.blue(`\n\nGetting key`))
  let key
  try {
    key = await contract.read.getKey([])
  } catch (_) {
    key = '???'
  }
  printSuccess(`Key: ${chalk.green(key)}`)
}

/*
 * Verifies the proof
 */
async function verify(
  contract: any,
  walletClient: any,
  abi: any,
  pa: any,
  pb: any,
  pc: any,
  pubSignals: any,
  key: any
) {
  console.log(chalk.blue(`\n\nSending proof to contract`))
  const { plaintextTx, shieldedTx, txHash } = await contract.dwrite.verify(
    [pa, pb, pc, pubSignals, key],
    {
      gas: 5_000_000n,
    }
  )
  displayTransaction(plaintextTx, _.find(abi, { name: "verify" }))
  displayTransaction(shieldedTx, undefined, true)
  await walletClient.waitForTransactionReceipt({
    hash: txHash,
  })
  printSuccess(`Transaction confirmed: ${chalk.green(`${txHash}`)}`)
}

/*
 * Checks the seller and buyer address expected
 */
async function checkAddresses(
  contract: any,
  sellerAddress: any,
  buyerAddress: any
) {
  console.log(chalk.blue(`\n\nValidating addresses`))
  let seller
  try {
    seller = await contract.read.getSeller([])
  } catch (_) {
    seller = '???'
  }

  let buyer
  try {
    buyer = await contract.read.getBuyer([])
  } catch (_) {
    buyer = '???'
  }

  printSuccess(`Seller in judge: ${chalk.green(seller)}`)
  printSuccess(`Seller being passed: ${chalk.green(sellerAddress)}`)
  printSuccess(`Buyer in judge: ${chalk.green(buyer)}`)
  printSuccess(`Buyer being passed: ${chalk.green(buyerAddress)}`)
}

async function main() {
  const chainId = '31337'
  const rpcUrl = 'http://127.0.0.1:8545'

  const price = 80
  const timestamp = Math.floor(Date.now() / 1000)
  const hashZ =
    '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef' // replace with actual hash
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
  const keyBytes = toBytes(1, { size: 32 })
  const key = toHex(keyBytes)

  const factoryBroadcastFile = join(
    CONTRACT_DIR,
    'broadcast',
    `GoatZKCPFactory.s.sol`,
    chainId,
    'run-latest.json'
  )
  const verifierBroadcastFile = join(
    CONTRACT_DIR,
    'broadcast',
    `Groth16Verifier.s.sol`,
    chainId,
    'run-latest.json'
  )

  const privkeySeller =
    '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80'
  const privkeyBuyer =
    '0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d'

  const client = await createShieldedPublicClient({
    transport: http(rpcUrl),
    chain: sanvil,
  })

  const factoryAddr = readContractAddress(
    factoryBroadcastFile,
    'GoatZKCPFactory'
  )
  const verifierAddr = readContractAddress(
    verifierBroadcastFile,
    'Groth16Verifier'
  )

  const factoryAbi = await readAbi(CONTRACT_DIR, 'GoatZKCPFactory')
  const judgeAbi = await readAbi(CONTRACT_DIR, 'GoatZKCPJudge')

  const sellerWalletClient = await createShieldedWalletClient({
    chain: sanvil,
    transport: http(rpcUrl),
    account: privateKeyToAccount(privkeySeller),
  })
  const buyerWalletClient = await createShieldedWalletClient({
    chain: sanvil,
    transport: http(rpcUrl),
    account: privateKeyToAccount(privkeyBuyer),
  })

  const factoryContractByBuyer = getShieldedContract({
    abi: factoryAbi,
    address: factoryAddr,
    client: buyerWalletClient,
  })

  const judgeAddr = await createExchange(
    factoryContractByBuyer,
    buyerWalletClient,
    factoryAbi,
    sellerWalletClient.account.address,
    buyerWalletClient.account.address,
    verifierAddr,
    timestamp,
    80
  )

  const judgeContractByBuyer = getShieldedContract({
    abi: judgeAbi,
    address: judgeAddr,
    client: buyerWalletClient,
  })
  const judgeContractBySeller = getShieldedContract({
    abi: judgeAbi,
    address: judgeAddr,
    client: sellerWalletClient,
  })

  await checkAddresses(
    judgeContractByBuyer,
    sellerWalletClient.account.address,
    buyerWalletClient.account.address
  )

  await init(judgeContractByBuyer, buyerWalletClient, judgeAbi, hashZ, price)

  await getJudgeStatus(judgeContractByBuyer)

  await getKey(judgeContractByBuyer)

  await verify(
    judgeContractBySeller,
    sellerWalletClient,
    judgeAbi,
    pa,
    pb,
    pc,
    pubSignals,
    key
  )

  await getKey(judgeContractByBuyer)

  await getJudgeStatus(judgeContractByBuyer)

  console.log('\n')
  printSuccess('Success!')
}

main()
