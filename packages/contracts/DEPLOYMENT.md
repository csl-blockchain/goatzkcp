# Smart Contract Deployment Guide

This guide explains how to deploy the SmartZKCP contracts to a devnet.

## Prerequisites

1. Install Foundry:
```bash
curl -L https://foundry.paradigm.xyz | bash
foundryup
```

2. Set up your environment variables:
Create a `.env` file with your private key:
```
PRIVKEY=your_private_key_here
```

## Understanding Contract Dependencies

The contracts have the following dependency structure:

- `SmartZKCPFactory` depends on `Ownable` and `SmartZKCPJudge`
- `SmartZKCPJudge` depends on `ISmartZKCPJudge`, `Config`, `ReentrancyGuard`, `Groth16Core`, and `Events`

## Deployment Process

Due to the dependencies between contracts, we only need to deploy the `SmartZKCPFactory` contract, which will be responsible for creating `SmartZKCPJudge` instances on-demand using the `createExchange` function.

### Deploy using Foundry

1. Load your environment variables:
```bash
source .env
```

2. Deploy to a local Anvil node:
```bash
# Start a local node
anvil

# In a new terminal, deploy the contracts
sforge script script/DeploySmartZKCPContracts.sol:DeploySmartZKCPContracts --rpc-url http://localhost:8545 --broadcast
```

3. Deploy to a public testnet (e.g., Sepolia):
```bash
sforge script script/DeploySmartZKCPContracts.sol:DeploySmartZKCPContracts --rpc-url $RPC_URL --broadcast --verify
```

## Using the Deployed Contracts

1. Once the `SmartZKCPFactory` is deployed, users can create exchanges using:
```solidity
// Where factory is the deployed SmartZKCPFactory contract
address judgeContract = factory.createExchange(sellerAddress, priceAmount);
```

2. Each call to `createExchange` will create a new `SmartZKCPJudge` contract instance that handles a specific exchange between a buyer and seller.

## Contract Interaction Flow

1. Buyer calls `factory.createExchange(sellerAddress, price)` to create a new judge contract
2. Buyer calls `judge.init(hashZ)` with payment to initiate the exchange
3. Seller calls `judge.verify(proof, k)` to provide proof and complete the exchange
4. If verification fails or times out, buyer can call `judge.refund()` 

# Call createExchange function - replace with actual values
```bash
cast send <FACTORY_ADDRESS> "createExchange(address,uint256)" <SELLER_ADDRESS> <PRICE> --private-key <YOUR_PRIVATE_KEY> --rpc-url <RPC_URL>
```

# Read judgesLength function
cast call <FACTORY_ADDRESS> "judgesLength()" --rpc-url <RPC_URL> 