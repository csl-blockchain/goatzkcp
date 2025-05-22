import chalk from 'chalk'
import fs from 'fs'
import { join } from 'path'
import { Abi, AbiFunction, AbiParameter } from 'viem'
import _ from 'lodash'

import { BaseTx } from './types'

/*
 * Read contract ABI from build file.
 */
async function readAbi(
  contractDir: string,
  contractName: string
): Promise<Abi> {
  const abiFile = join(
    contractDir,
    'out',
    `${contractName}.sol`,
    `${contractName}.json`
  )
  return JSON.parse(fs.readFileSync(abiFile, 'utf8')).abi
}

/*
 * Converts Ethereum calldata to human-readable format.
 */
function parseCalldata(calldata: string, abiFunc: AbiFunction) {
  let params = calldata.slice(10)
  const paramValues: string[] = []

  while (params.length > 0) {
    paramValues.push('0x' + params.slice(0, 64).replace(/^0+/, ''))
    params = params.slice(64)
  }

  const result: Record<string, string> = {}
  abiFunc.inputs.forEach((input: AbiParameter, i: number) => {
    result[input.name as string] = paramValues[i]
  })

  return result
}

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

/*
 * Displays either plaintext or shielded transaction details.
 */
function displayTransaction(
  tx: BaseTx,
  abiFunc?: AbiFunction,
  isEncrypted: boolean = false
) {
  const parsedData = abiFunc ? parseCalldata(tx.data, abiFunc) : null
  const actionDescription = isEncrypted ? 'Encrypting' : 'Generating'
  const dataColor = isEncrypted ? chalk.green : chalk.red

  console.log(`${actionDescription} transaction...`)
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log(`To:       ${tx.to}`)
  if (parsedData) {
    Object.entries(parsedData).forEach(([key, value]) => {
      const formattedKey = key.charAt(0).toUpperCase() + key.slice(1)
      console.log(`${formattedKey}:   ${dataColor(value)}`)
    })
  } else {
    console.log(`Data:     ${dataColor(tx.data.slice(0, 42) + '...')}`)
  }
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
}

/*
 * Print success message with a green checkmark.
 */
function printSuccess(message: string) {
  console.log(chalk.green('✅') + ` ${message}`)
}

/*
 * Print failure message with a red cross.
 */
function printFail(message: string) {
  console.log(chalk.red('❌') + ` ${message}`)
}

export { readContractAddress, displayTransaction, printFail, printSuccess, readAbi }
