# `cli-ethers`

To install dependencies:

```bash
bun install
```

To run:

```bash
bun run index.ts
```

### Notes

There is two main directories, `local` and `src`. You'll need to spin up a **local Ethereum** node to run the project inside the `local` folder. `src` will automatically connect to a pre-deployed contract on the **Seismic devnet**.

If you have trouble reading the smart contract, try deleting the `broadcast` and `out` folders in the `packages/contracts` directory and try rebuilding + redeploying the contract.

## **LOCAL**

### Example Output

```bash
❯ bun run src/index.ts
Mempool running...

Buyer address: 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266
Seller address: 0x70997970C51812dc3A010C7d01b50e0d17dc79C8

Initial buyer balance: 9999.9976568141029518
Initial seller balance: 10000.0

Factory address: 0xe7f1725e7734ce288f8367e1bb143e90bb3f0512
Judge address: 0xc946bE0559805FA48e7D3E2c5397eC4472a208dc

📡 MEMPOOL TRANSACTION DETECTED:
   Hash: 0xde4476da9cc5eef2f31b3808b76ece6e609f421b2782be8cc90398e93c983495
   From: 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266
   To: 0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512
   Value: 0.0 ETH
   Data: 0x433c817c00000000000000000000000070997970c51812dc3a010c7d01b50e0d17dc79c80000000000000000000000000000000000000000000000000000000000000050

Verifier address: 0x9fe46736679d2d9a65f0992f2272de9f3c7fa6e0

📡 MEMPOOL TRANSACTION DETECTED:
   Hash: 0x88a1a95a0dbc7ae6470f0a5ea1c7132b000003247bac3a2c46b5d27bb6adf014
   From: 0x70997970C51812dc3A010C7d01b50e0d17dc79C8
   To: 0xc946bE0559805FA48e7D3E2c5397eC4472a208dc
   Value: 0.0 ETH
   Data: 0x5437988d0000000000000000000000009fe46736679d2d9a65f0992f2272de9f3c7fa6e0

Judge status: uninitialized

----- Buyer initializes exchange -----
Init transaction mined: 0x5d11e8601cce5c565f6ea732e9f4b461ff03a04202bd36e679d1c0612a52527a

📡 MEMPOOL TRANSACTION DETECTED:
   Hash: 0x5d11e8601cce5c565f6ea732e9f4b461ff03a04202bd36e679d1c0612a52527a
   From: 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266
   To: 0xc946bE0559805FA48e7D3E2c5397eC4472a208dc
   Value: 80.0 ETH
   Data: 0x3b6631951234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef

Lock address: 0x3092251E143d5B35060426aB0400E88fCAb7E0Fe

----- Buyer creates Lock for payment -----
Buyer balance: 9919.996294436213976935
Seller balance: 9999.999969874577578963
Judge status: initialized

----- Check if we can obtain key prior to verify -----
Key still not revealed!


📡 MEMPOOL TRANSACTION DETECTED:
   Hash: 0x60bbac0513f50d67d61dd97a0ab658304d1e5f047348efeeed9f9c2a8a0c5a94
   From: 0x70997970C51812dc3A010C7d01b50e0d17dc79C8
   To: 0xc946bE0559805FA48e7D3E2c5397eC4472a208dc
   Value: 0.0 ETH
   Data: 0x5e37e84903704ee1383665cae109b3de9cc1ba0035a542a2cd6d88251aff58843afc1ff22db941c503ade2c1bb5d2c215e6ef5dbda0913f01aee4f7edcc2fe0e2b7c3947043926fb95a0289bfec5c7df3d93378503fcff17cb054b3fd30c184f6221edcb2fd17f632b4f6f1a2c43cb63529f5f6419a0da9d712dd9719c7d196d0ddbb9133060a91b8f21f8082d7257e5932f438a1cbc55b39bf714cd78f26cbda2828a87013b0517c14fcbbca2da8b80c20e5a47c89f2ffa6674d74c16c5aa74dcb615d22f46d99c56f65ab88e41de8ed2852d67962954f4fb6f943feeec327511b4483810d7f02bd6ab4acc2baf277ee3af34db8c1d29350820a54c3d0edfcf4f9d1109000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000010000000000000000000000000000000000000000000000000000000000000001

----- Seller sends K to smart contract and smart contract verifies: -----
Verify tx confirmed: 0x60bbac0513f50d67d61dd97a0ab658304d1e5f047348efeeed9f9c2a8a0c5a94
Judge status after verification: finished
Key revealed: 0x0000000000000000000000000000000000000000000000000000000000000001

----- FINAL -----
Final buyer balance: 9919.996294436213976935
Final seller balance: 10079.999813903746506097

finished
```


## **DEVNET**

### Example Output