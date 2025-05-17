import dotenv from 'dotenv'
import { ethers } from 'ethers'
import _ from 'lodash'
import { join } from 'path'

import {
  CHAIN_ID,
  CONTRACT_DIR,
  FACTORY_CONTRACT_NAME,
  GAS_LIMIT,
  JUDGE_CONTRACT_NAME,
  LOCK_CONTRACT_NAME,
  RPC_URL,
} from './constants'
import { readContractABI, readContractAddress } from './utils'

dotenv.config()

// Global variables for contract state
let provider
let accounts = []
let factoryContract
let factoryABI
let judgeABI
let lockABI

// Initialize function to set up provider and contracts
async function initialize() {
  console.log('Server is initializing...')
  console.log(`Connecting to network at ${RPC_URL}...`)

  try {
    // Connect to the network
    provider = new ethers.providers.JsonRpcProvider(RPC_URL)

    // Get all accounts
    accounts = await provider.listAccounts()
    console.log(`Found ${accounts.length} accounts`)

    // Read contract files
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

    // Read contract ABIs
    factoryABI = readContractABI(factoryAbiFile)
    judgeABI = readContractABI(judgeAbiFile)
    lockABI = readContractABI(lockAbiFile)

    // Initialize factory contract
    const factoryAddress = readContractAddress(
      factoryBroadcastFile,
      FACTORY_CONTRACT_NAME
    )
    factoryContract = new ethers.Contract(factoryAddress, factoryABI, provider)

    console.log('✅ Initialization complete')
    return true
  } catch (error) {
    console.error('Initialization failed:', error)
    return false
  }
}

// API Routes
const routes = {
  // Get all accounts
  'GET /accounts': async () => {
    return {
      status: 200,
      body: { accounts },
    }
  },

  // Create a new exchange
  'POST /exchange': async (request) => {
    try {
      const { buyerAddress, sellerAddress, price } = await request.json()

      if (!buyerAddress || !sellerAddress || price === undefined) {
        return {
          status: 400,
          body: {
            error:
              'Missing required parameters: buyerAddress, sellerAddress, or price',
          },
        }
      }

      const buyerSigner = provider.getSigner(buyerAddress)
      const factoryWithBuyer = factoryContract.connect(buyerSigner)

      const tx = await factoryWithBuyer.createExchange(sellerAddress, price, {
        gasLimit: GAS_LIMIT,
      })

      const receipt = await tx.wait()
      const event = receipt.events?.find((e) => e.event === 'ExchangeCreate')
      const judgeAddress = event?.args?.judge

      return {
        status: 200,
        body: {
          txHash: receipt.transactionHash,
          judgeAddress,
          buyerAddress,
          sellerAddress,
          price,
        },
      }
    } catch (error) {
      return {
        status: 500,
        body: { error: error.message },
      }
    }
  },

  // Initialize a judge contract
  'POST /judge/init': async (request) => {
    try {
      const { buyerAddress, judgeAddress, hashZ, price } = await request.json()

      if (!buyerAddress || !judgeAddress || !hashZ || price === undefined) {
        return {
          status: 400,
          body: { error: 'Missing required parameters' },
        }
      }

      const buyerSigner = provider.getSigner(buyerAddress)
      const judgeContract = new ethers.Contract(
        judgeAddress,
        judgeABI,
        buyerSigner
      )

      const tx = await judgeContract.init(hashZ, {
        value: ethers.utils.parseEther(price.toString()),
        gasLimit: GAS_LIMIT,
      })

      const receipt = await tx.wait()

      return {
        status: 200,
        body: {
          txHash: receipt.transactionHash,
          judgeAddress,
          buyerAddress,
          hashZ,
          price,
        },
      }
    } catch (error) {
      return {
        status: 500,
        body: { error: error.message },
      }
    }
  },

  // Verify proof for a judge contract
  'POST /judge/verify': async (request) => {
    try {
      const { sellerAddress, judgeAddress, proof, k } = await request.json()

      if (!sellerAddress || !judgeAddress || !proof || !k) {
        return {
          status: 400,
          body: { error: 'Missing required parameters' },
        }
      }

      const sellerSigner = provider.getSigner(sellerAddress)
      const judgeContract = new ethers.Contract(
        judgeAddress,
        judgeABI,
        sellerSigner
      )

      const tx = await judgeContract.verify(proof, k, {
        gasLimit: GAS_LIMIT,
      })

      const receipt = await tx.wait()

      return {
        status: 200,
        body: {
          txHash: receipt.transactionHash,
          judgeAddress,
          sellerAddress,
        },
      }
    } catch (error) {
      return {
        status: 500,
        body: { error: error.message },
      }
    }
  },

  // Get information about a judge contract
  'GET /judge/:address': async (request, params) => {
    try {
      const judgeAddress = params.address

      if (!judgeAddress) {
        return {
          status: 400,
          body: { error: 'Missing judge address' },
        }
      }

      const judgeContract = new ethers.Contract(
        judgeAddress,
        judgeABI,
        provider
      )

      const seller = await judgeContract.getSeller()
      const buyer = await judgeContract.getBuyer()
      const price = await judgeContract.getPrice()
      const state = await judgeContract.getStatus()

      return {
        status: 200,
        body: {
          address: judgeAddress,
          seller,
          buyer,
          price: ethers.utils.formatEther(price),
          state,
        },
      }
    } catch (error) {
      return {
        status: 500,
        body: { error: error.message },
      }
    }
  },
}

// Server setup with Bun
const server = {
  start: async function (port = 3000) {
    const initialized = await initialize()
    if (!initialized) {
      console.error('Failed to initialize server. Exiting.')
      process.exit(1)
    }

    Bun.serve({
      port,
      async fetch(request) {
        const url = new URL(request.url)
        const path = url.pathname
        const method = request.method
        const routeKey = `${method} ${path}`

        console.log(`${method} ${path}`)

        // Handle route with path parameters
        if (method === 'GET' && path.startsWith('/judge/')) {
          const address = path.split('/')[2]
          if (address) {
            const handler = routes['GET /judge/:address']
            const result = await handler(request, { address })
            return new Response(JSON.stringify(result.body), {
              status: result.status,
              headers: { 'Content-Type': 'application/json' },
            })
          }
        }

        // Handle exact route matches
        const handler = routes[routeKey]
        if (handler) {
          const result = await handler(request)
          return new Response(JSON.stringify(result.body), {
            status: result.status,
            headers: { 'Content-Type': 'application/json' },
          })
        }

        // Default route for homepage or unmatched routes
        if (path === '/') {
          return new Response(
            JSON.stringify({
              message: 'Ethereum Contract API',
              endpoints: Object.keys(routes),
            }),
            {
              status: 200,
              headers: { 'Content-Type': 'application/json' },
            }
          )
        }

        return new Response(JSON.stringify({ error: 'Not Found' }), {
          status: 404,
          headers: { 'Content-Type': 'application/json' },
        })
      },
    })

    console.log(`Server started on http://localhost:${port}`)
  },
}

// Export the server object
export default server

// If this file is run directly
if (import.meta.main) {
  server.start()
}
