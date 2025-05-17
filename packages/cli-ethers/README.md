# cli-ethers

To install dependencies:

```bash
bun install
```

To run:

```bash
bun run index.ts
```

### Notes

If you have trouble reading the smart contract, try deleting the `broadcast` and `out` folders in the `packages/contracts` directory and try rebuilding + redeploying the contract.

### Example Output

```bash
❯ bun run src/index.ts
[ "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266", "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
  "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC", "0x90F79bf6EB2c4f870365E785982E1f101E93b906",
  "0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65", "0x9965507D1a55bcC2695C58ba16FB37d819B0A4dc",
  "0x976EA74026E726554dB657fA54763abd0C3a0aa9", "0x14dC79964da2C08b23698B3D3cc7Ca32193d9955",
  "0x23618e81E3f5cdF7f54C3d65f7FBc0aBf5B21E8f", "0xa0Ee7A142d267C1f36714E4a8F75612F20a79720"
]
Initial buyer balance: 9999.99772419454426656
Initial seller balance: 10000.0

Judge address: 0x65AcBbc5aCE5fAEfc0518fa215e441770045e11b
Verifier address: 0x9fe46736679d2d9a65f0992f2272de9f3c7fa6e0

uninitialized

----- Buyer creates Lock for payment -----
Create exchange buyer balance: 9919.996411819931648554
Create exchange seller balance: 9999.999970567050317357

Init transaction mined: 0xacef4a55d5b8fdcf8ff6122771b0c38b3e3697298b2e1c6f63cf58b40765af38

initialized

Lock address: 0xF3CeDE41bdC03bfa3366f2661680055e0333C3A9
Seller address: 0x70997970C51812dc3A010C7d01b50e0d17dc79C8 

----- Seller sends K to smart contract and smart contract verifies: -----
Verify tx confirmed: 0x6ef3b3b581437ae59648d5cd335ea2bbd23b747443db137b5dcf01bb8468988c
Final buyer balance: 9919.996411819931648554
Final seller balance: 10079.999814819037419121

finished
```