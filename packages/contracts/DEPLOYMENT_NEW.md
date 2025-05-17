## Prerequisites

### Rust and Cargo

1. Install Rust and Cargo

```bash
# install rust and cargo
curl https://sh.rustup.rs -sSf | sh
```

2. Download and execute the sfoundryup installation script

```bash
curl -L \
     -H "Accept: application/vnd.github.v3.raw" \
     "https://api.github.com/repos/SeismicSystems/seismic-foundry/contents/sfoundryup/install?ref=seismic" | bash
source ~/.zshenv  # or ~/.bashrc or ~/.zshrc
```

3. Install sforge, sanvil, ssolc. Expect this to take between 5-20 minutes depending on your machine.

```bash
sfoundryup
source ~/.zshenv  # or ~/.bashrc or ~/.zshrc
```

4. Remove old build artifacts in existing projects.

```bash
sforge clean  # run in your project's contract directory
```

### Agreed Verifier Smart Contract

As a seller, you'll first have to generate a verifier function that you publish so that the buyer can check whether or not the verifier is legit. You'll have to run the steps from the circom docs up until before the proof generation. Then you'll have to skip to the generate verifying commands using smart contracts that looks like this:

```bash
snarkjs zkey export solidityverifier multiplier2_0001.zkey verifier.sol
```

The inputs that you'll send to the judge smart contract for verification can be obtained by running:

```bash
snarkjs generatecall
```

### Build and Out

Prior to deploying the smart contracts, delete the `build/` and `out/` directories in case of any changes.

## Running the Smart Contracts

Open two terminals.

### The following commands will be ran on terminal 1

1. Open up a new terminal and run the local network
```bash
sanvil
```

### The following commands will be ran on terminal 2

1. Set the environment variables from `.env`

```bash
cd packages/contracts/
cp .env.example .env
```


2. Ensure the contracts has no syntax / solidity errors, run

Compile the Smart Contracts

```bash
sforge build
```

3. Ensure contract tests are passing. From this directory, run

Run the Tests (if exists)

```bash
sforge test
```

4. Set the environment variables, run

```bash
source .env
```


5. Deploy the smart contracts, run

Deploying GoatZKCPFactory

```bash
sforge script script/GoatZKCPFactory.s.sol:GoatZKCPFactoryScript \
      --rpc-url $RPC_URL \
      --broadcast
```

Deploying the Verifier

```bash
sforge script script/Groth16Verifier.s.sol:Groth16VerifierScript \
      --rpc-url $RPC_URL \
      --broadcast
```


## FAQ

1. Why don't you need to deploy the judge and the lock smart contract?

Because the factory will automatically create a judge once initialized and once the buyer calls `.createExchange()` on the judge contract, the lock will be created to store the payment.