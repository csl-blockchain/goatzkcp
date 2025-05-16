import { useState } from 'react'
import { useContractWrite, useContractRead, useWaitForTransaction } from 'wagmi'
import { GOAT_ZKCP_ABI, GOAT_ZKCP_ADDRESS } from '../contracts/GoatZKCP'

export function useGoatZKCP() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const { write: initialize } = useContractWrite({
    address: GOAT_ZKCP_ADDRESS,
    abi: GOAT_ZKCP_ABI,
    functionName: 'initialize',
  })

  const { write: lock } = useContractWrite({
    address: GOAT_ZKCP_ADDRESS,
    abi: GOAT_ZKCP_ABI,
    functionName: 'lock',
  })

  const { write: verify } = useContractWrite({
    address: GOAT_ZKCP_ADDRESS,
    abi: GOAT_ZKCP_ABI,
    functionName: 'verify',
  })

  const handleInitialize = async () => {
    try {
      setIsLoading(true)
      setError(null)
      await initialize()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to initialize')
    } finally {
      setIsLoading(false)
    }
  }

  const handleLock = async (value: string) => {
    try {
      setIsLoading(true)
      setError(null)
      await lock({ value: ethers.utils.parseEther(value) })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to lock payment')
    } finally {
      setIsLoading(false)
    }
  }

  const handleVerify = async (proof: string, key: string) => {
    try {
      setIsLoading(true)
      setError(null)
      await verify({ args: [proof, key] })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to verify')
    } finally {
      setIsLoading(false)
    }
  }

  return {
    isLoading,
    error,
    handleInitialize,
    handleLock,
    handleVerify,
  }
} 