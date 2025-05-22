import chalk from 'chalk'
import { createShieldedPublicClient, sanvil } from 'seismic-viem'
import { http } from 'viem'

/**
 * Monitors the mempool and blockchain for transactions
 */
async function monitorMempool() {
  const rpcUrl = process.env.RPC_URL || 'http://127.0.0.1:8545'
  const pollingInterval = 500 // 500 milliseconds - check more frequently
  
  console.log(chalk.blue(`Connecting to Seismic node at ${rpcUrl}`))
  
  // Create the client for querying
  const client = createShieldedPublicClient({
    transport: http(rpcUrl),
    chain: sanvil,
    pollingInterval,
  })
  
  console.log(chalk.green(`Mempool Monitor Started - Polling every ${pollingInterval/1000} seconds`))
  
  // Track seen transactions to avoid duplicates
  const seenTransactions = new Set<string>()
  
  // Function to get and display pending transactions
  async function checkMempool() {
    try {
      // Get pending transactions using the txpool_content RPC method
      // Using any type to bypass type checking for custom RPC methods
      const pendingTxs = await (client as any).transport.request({
        method: 'txpool_content',
      }) as any
      
      // Process the pending transactions
      if (pendingTxs && pendingTxs.pending) {
        let newTransactions = false
        
        for (const [address, transactions] of Object.entries(pendingTxs.pending)) {
          for (const [nonce, tx] of Object.entries(transactions as any)) {
            const transaction = tx as any
            
            // Create a unique ID for this transaction
            const txId = `${address}-${nonce}`
            
            // Only display new transactions
            if (!seenTransactions.has(txId)) {
              newTransactions = true
              seenTransactions.add(txId)
              
              console.log(chalk.yellow(`\n[${new Date().toISOString()}] New Pending Transaction:`))
              console.log(chalk.cyan(`From: ${address}`))
              console.log(`Nonce: ${nonce}`)
              console.log(`To: ${transaction.to}`)
              console.log(`Value: ${transaction.value} wei`)
              console.log(`Gas Price: ${transaction.gasPrice}`)
              console.log(`Gas: ${transaction.gas}`)
              
              // If this is a shielded transaction, show that
              // Check for custom transaction type
              if (transaction.type && transaction.type.toString() === '0x4a') {
                console.log(chalk.magenta(`Type: Shielded Transaction (0x4a)`))
                if (transaction.encryptionPubkey) {
                  console.log(`Encryption Pubkey: ${transaction.encryptionPubkey.substring(0, 22)}...`)
                }
              } else {
                console.log(`Type: ${transaction.type || 'Legacy'}`)
              }
              
              // Display a truncated version of the data
              if (transaction.input && transaction.input.length > 10) {
                console.log(`Data: ${transaction.input.substring(0, 66)}...`)
              } else {
                console.log(`Data: ${transaction.input}`)
              }
            }
          }
        }
        
        if (!newTransactions) {
          process.stdout.write('.')  // Show activity without spamming
        }
      }
    } catch (error: any) {
      console.error(chalk.red(`Error checking mempool: ${error.message}`))
    }
  }
  
  // Watch for new blocks
  let lastBlockNumber = await client.getBlockNumber()
  console.log(chalk.green(`Current block number: ${lastBlockNumber}`))
  
  client.watchBlockNumber({
    onBlockNumber: async (blockNumber) => {
      if (blockNumber > lastBlockNumber) {
        console.log(chalk.green(`\n[${new Date().toISOString()}] New block: ${blockNumber}`))
        
        // Get the block details
        try {
          const block = await client.getBlock({ 
            blockNumber,
            includeTransactions: true
          })
          
          console.log(`Transactions in block: ${block.transactions.length}`)
          
          // Display each transaction in the block
          for (const tx of block.transactions) {
            // Skip if it's just a hash
            if (typeof tx === 'string') continue
            
            console.log(chalk.cyan(`\nTransaction: ${tx.hash}`))
            console.log(`From: ${tx.from}`)
            console.log(`To: ${tx.to}`)
            console.log(`Value: ${tx.value} wei`)
            console.log(`Gas Price: ${tx.gasPrice}`)
            console.log(`Gas: ${tx.gas}`)
            
            // If this is a shielded transaction, show that
            // Check for custom transaction type
            const txType = tx.type?.toString()
            if (txType === '0x4a') {
              console.log(chalk.magenta(`Type: Shielded Transaction (0x4a)`))
            } else {
              console.log(`Type: ${tx.type || 'Legacy'}`)
            }
            
            // Remove from seen transactions if it was in our list
            const txId = `${tx.from}-${tx.nonce}`
            if (seenTransactions.has(txId)) {
              seenTransactions.delete(txId)
              console.log(chalk.green(`Transaction confirmed and removed from mempool`))
            }
          }
        } catch (error: any) {
          console.error(chalk.red(`Error getting block details: ${error.message}`))
        }
        
        lastBlockNumber = blockNumber
      }
    }
  })
  
  // Check mempool periodically
  setInterval(checkMempool, pollingInterval)
  
  // Initial check
  await checkMempool()
}

// Start monitoring
monitorMempool().catch(error => {
  console.error(chalk.red(`Fatal error: ${error.message}`))
  process.exit(1)
}) 