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
// function displayTransaction(
//   tx: BaseTx,
//   abiFunc?: AbiFunction,
//   isEncrypted: boolean = false
// ) {
//   const parsedData = abiFunc ? parseCalldata(tx.data, abiFunc) : null
//   const actionDescription = isEncrypted ? 'shielded' : 'un-shielded'
//   const dataColor = (isEncrypted && !abiFunc) ? chalk.green : chalk.red

//   console.log(`Displaying ${abiFunc ? "parsed ": " "}${actionDescription} transaction...`)
//   console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
//   console.log(`To:       ${tx.to}`)
//   if (parsedData) {
//     Object.entries(parsedData).forEach(([key, value]) => {
//       const formattedKey = key.charAt(0).toUpperCase() + key.slice(1)
//       console.log(`${formattedKey}:   ${dataColor(value)}`)
//     })
//   } else {
//     console.log(`Data:     ${dataColor(tx.data)}`)
//   }
//   console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
// }


function hexToBigInt(hex: string) {
  return BigInt(`0x${hex}`)
}

function displayTransaction(
  tx: BaseTx,
  abiFunc?: AbiFunction,
  isEncrypted: boolean = false
) {
  const actionDescription = isEncrypted ? 'shielded' : 'un-shielded'
  const dataColor = isEncrypted && !abiFunc ? chalk.green : chalk.red

  console.log(`Displaying ${abiFunc ? "parsed " : ""}${actionDescription} transaction...`)
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log(`To:       ${tx.to}`)

  if (abiFunc && abiFunc.name === "verify") {
    const calldata = tx.data.startsWith('0x') ? tx.data.slice(2) : tx.data
    const selector = calldata.slice(0, 8)
    const argsData = calldata.slice(8)
    const words = argsData.match(/.{64}/g)

    if (!words) {
      console.error(chalk.yellow("⚠️ Could not parse calldata into 32-byte words."))
      return
    }

    // console.log(chalk.blue(`Selector: 0x${selector}`))
    // console.log(chalk.cyan(`Found ${words.length} 32-byte words.`))

    // Log all 32-byte words
    // words.forEach((word, i) => {
    //   console.log(`Word[${i}]: 0x${word}`)
    // })

    if (words.length === 11) {
      const _pA = [hexToBigInt(words[0]), hexToBigInt(words[1])]
      const _pB = [
        [hexToBigInt(words[2]), hexToBigInt(words[3])],
        [hexToBigInt(words[4]), hexToBigInt(words[5])]
      ]
      const _pC = [hexToBigInt(words[6]), hexToBigInt(words[7])]
      const _pubSignals = [hexToBigInt(words[8]), hexToBigInt(words[9])]
      const k = `0x${words[10]}`

      console.log(`_pA: ${dataColor(JSON.stringify(_pA.map(bn => '0x' + bn.toString())))}`)
      console.log(`_pB: ${dataColor(JSON.stringify(_pB.map(bn => '0x' + bn.toString())))}`)
      console.log(`_pC: ${dataColor(JSON.stringify(_pC.map(bn => '0x' + bn.toString())))}`)
      console.log(`_pubSignals: ${dataColor(JSON.stringify(_pubSignals.map(bn => '0x' + bn.toString())))}`)
      console.log(`k:          ${dataColor(k)}`)
    } else {
      console.warn(chalk.yellow("⚠️ Unexpected word count. Please check if the ABI matches."))
    }
  } else {
    console.log(`Data:     ${dataColor(tx.data)}`)
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
