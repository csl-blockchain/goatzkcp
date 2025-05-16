# GoatZKCP Marketplace

A zero-knowledge proof protocol for fair exchanges between two parties without the need for a trusted third party. This marketplace implements the GoatZKCP protocol, which is based on ZKCP and SmartZKCP.

## Features

- User authentication and role-based access (Buyer/Seller)
- Marketplace for digital goods and data
- Implementation of the GoatZKCP protocol:
  1. STS Key Agreement
  2. Delivery with encryption
  3. Payment locking
  4. ZK Proof verification
- Integration with blockchain and smart contracts
- Support for multiple encryption schemes
- Sample data preview functionality

## Project Structure

```
src/
├── app/                 # Next.js app directory
├── components/          # React components
│   ├── ItemList.tsx    # Marketplace item list
│   └── ItemDetail.tsx  # Item details and transaction flow
├── contracts/          # Smart contract interfaces
│   └── GoatZKCP.ts     # GoatZKCP contract ABI and utilities
├── hooks/              # Custom React hooks
│   ├── useGoatZKCP.ts  # GoatZKCP protocol management
│   ├── useSTSKeyAgreement.ts  # STS key agreement
│   ├── useEncryption.ts       # Encryption utilities
│   └── useZKProof.ts          # ZK proof generation and verification
└── types/              # TypeScript type definitions
```

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Configure environment variables:
   Create a `.env.local` file with the following variables:
   ```
   NEXT_PUBLIC_GOAT_ZKCP_ADDRESS=your_contract_address
   NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID=your_project_id
   ```

3. Run the development server:
   ```bash
   npm run dev
   ```

## Protocol Flow

1. **Key Generation**
   - Buyer and Seller run STS key agreement protocol
   - Shared key k' is generated

2. **Delivery**
   - Seller encrypts solution s with key k to get z
   - Seller hashes z to get hz
   - Seller double encrypts z with k' to get c
   - Seller sends c and hz to Buyer

3. **Lock**
   - Buyer decrypts c with k' to get z
   - Buyer verifies hz matches H(z)
   - Buyer locks payment v in PTLC smart contract

4. **Validation & Reveal**
   - Seller verifies Buyer's hash matches hz
   - Seller generates ZK proof for key k
   - Smart contract verifies proof
   - Contract sends k to Buyer and v to Seller

## Implementation Notes

- The project uses Next.js with TypeScript for type safety
- Tailwind CSS for styling
- RainbowKit for wallet integration
- Wagmi for blockchain interactions
- Empty function implementations are provided for:
  - STS key agreement
  - Encryption/decryption
  - Hashing
  - ZK proof generation and verification
  - Smart contract interactions

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a new Pull Request

