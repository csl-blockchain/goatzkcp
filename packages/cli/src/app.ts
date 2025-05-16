import {
  type ShieldedContract,
  type ShieldedWalletClient,
  createShieldedWalletClient,
} from 'seismic-viem'
import { Abi, Address, Chain, http } from 'viem'
import { privateKeyToAccount } from 'viem/accounts'

import { getShieldedContractWithCheck } from '../lib/utils'

/**
 * The configuration for the app.
 */
interface AppConfig {
  participants: Array<{
    name: string
    privateKey: string
  }>
  wallet: {
    chain: Chain
    rpcUrl: string
  }
  contract: {
    abi: Abi
    address: Address
  }
}

/**
 * The main application class.
 */
export class App {
  private config: AppConfig
  private participantClients: Map<string, ShieldedWalletClient> = new Map()
  private participantContracts: Map<string, ShieldedContract> = new Map()

  constructor(config: AppConfig) {
    this.config = config
  }

  /**
   * Initialize the app.
   */
  async init() {
    for (const participant of this.config.participants) {
      const walletClient = await createShieldedWalletClient({
        chain: this.config.wallet.chain,
        transport: http(this.config.wallet.rpcUrl),
        account: privateKeyToAccount(participant.privateKey as `0x${string}`),
      })
      this.participantClients.set(participant.name, walletClient)

      const contract = await getShieldedContractWithCheck(
        walletClient,
        this.config.contract.abi,
        this.config.contract.address
      )
      this.participantContracts.set(participant.name, contract)
    }
  }

  /**
   * Get the shielded contract for a participant.
   * @param participantName - The name of the participant.
   * @returns The shielded contract for the participant.
   */
  private getParticipantContract(participantName: string): ShieldedContract {
    const contract = this.participantContracts.get(participantName)
    if (!contract) {
      throw new Error(
        `Shielded contract for participant ${participantName} not found`
      )
    }
    return contract
  }

  /**
   * Get the shielded wallet for a participant.
   * @param participantName - The name of the participant.
   * @returns The shielded wallet for the participant.
   */
  private getParticipantWallet(participantName: string): ShieldedWalletClient {
    const wallet = this.participantClients.get(participantName)
    if (!wallet) {
      throw new Error(
        `Shielded wallet for participant ${participantName} not found`
      )
    }
    return wallet
  }

  /**
   * Reset the walnut.
   * @param participantName - The name of the participant.
   */
  async reset(participantName: string) {
    console.log(`- Participant ${participantName} writing reset()`)
    const contract = this.getParticipantContract(participantName)
    await contract.write.reset([])
  }

  /**
   * Create a new exchange.
   * @param buyerName - The name of the buyer.
   */
  async createExchange(buyerName: string, sellerName: string, price: number) {
    console.log(
      `- Player ${buyerName} creating a new exchange with ${sellerName}`
    )
    const buyerContract = this.getParticipantContract(buyerName)
    const sellerWallet = await this.getParticipantWallet(sellerName).getAddresses()
    const judgeAddress = await buyerContract.write.createExchange([
      sellerWallet[0],
      price,
    ])
    console.log(
      `- Player ${buyerName} initialized exchange with the address ${judgeAddress}`
    )
  }

  /**
   * Get address of participant.
   * @param participantName - The name of the participant.
   */
  async getAddress(participantName: string) {
    const address = await this.getParticipantWallet(participantName).getAddresses()
    console.log(`- Participant ${participantName} has the address ${address[0]}`)
  }

  /**
   * Shake the walnut.
   * @param playerName - The name of the player.
   * @param numShakes - The number of shakes.
   */
  // async shake(playerName: string, numShakes: number) {
  //   console.log(`- Player ${playerName} writing shake()`)
  //   const contract = this.getPlayerContract(playerName)
  //   await contract.write.shake([numShakes])
  // }

  /**
   * Hit the walnut.
   * @param playerName - The name of the player.
   */
  // async hit(playerName: string) {
  //   console.log(`- Player ${playerName} writing hit()`)
  //   const contract = this.getPlayerContract(playerName)
  //   await contract.write.hit([])
  // }

  /**
   * Look at the walnut.
   * @param playerName - The name of the player.
   */
  // async look(playerName: string) {
  //   console.log(`- Player ${playerName} reading look()`)
  //   const contract = this.getPlayerContract(playerName)
  //   const result = await contract.read.look()
  //   console.log(`- Player ${playerName} sees number:`, result)
  // }
}
