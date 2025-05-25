import { join } from 'path'

// Initialize Network Data
const CHAIN_ID = '31337'
const RPC_URL = 'http://127.0.0.1:8545'
const GAS_LIMIT = 3000000

// Initialize Contract Data
const FACTORY_CONTRACT_NAME = 'GoatZKCPFactory'
const JUDGE_CONTRACT_NAME = 'GoatZKCPJudge'
const LOCK_CONTRACT_NAME = 'Lock'
const VERIFIER_CONTRACT_NAME = 'Groth16Verifier'
const CONTRACT_DIR = join(__dirname, '../../../packages/contracts')

export { CHAIN_ID, RPC_URL, GAS_LIMIT, FACTORY_CONTRACT_NAME, JUDGE_CONTRACT_NAME, LOCK_CONTRACT_NAME, VERIFIER_CONTRACT_NAME, CONTRACT_DIR }