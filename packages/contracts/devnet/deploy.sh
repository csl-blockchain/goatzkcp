#!/bin/bash

# Exit on error, but don't use 'set -e' yet to allow for better error reporting
# set -x  # Add debug output

# Check if we're in the right directory
if [ ! -f "./config.sh" ]; then
    echo "Error: config.sh not found. Make sure you're running this script from the devnet directory."
    echo "Current directory: $(pwd)"
    echo "Files in current directory: $(ls -la)"
    exit 1
fi

# Source configuration files with error handling
if ! source ./config.sh; then
    echo "Error: Failed to source config.sh"
    exit 1
fi

if ! source ./common/print.sh; then
    echo "Error: Failed to source common/print.sh"
    echo "Files in common directory: $(ls -la ./common)"
    exit 1
fi

# Define contract paths - check if they exist first
CONTRACTS_DIR="../src"
if [ ! -d "$CONTRACTS_DIR" ]; then
    CONTRACTS_DIR="./src"
    if [ ! -d "$CONTRACTS_DIR" ]; then
        echo "Error: Could not find contracts directory (src)"
        echo "Current directory: $(pwd)"
        echo "Parent directory contents: $(ls -la ..)"
        exit 1
    fi
fi

echo "Using contracts directory: $CONTRACTS_DIR"

# Check if contract files exist
if [ ! -f "$CONTRACTS_DIR/GoatZKCPFactory.sol" ]; then
    echo "Error: GoatZKCPFactory.sol not found in $CONTRACTS_DIR"
    echo "Files in $CONTRACTS_DIR: $(ls -la $CONTRACTS_DIR)"
    exit 1
fi

if [ ! -f "$CONTRACTS_DIR/Groth16Verifier.sol" ]; then
    echo "Error: Groth16Verifier.sol not found in $CONTRACTS_DIR"
    echo "Files in $CONTRACTS_DIR: $(ls -la $CONTRACTS_DIR)"
    exit 1
fi

if [ ! -f "$CONTRACTS_DIR/Groth16Core.sol" ]; then
    echo "Error: Groth16Core.sol not found in $CONTRACTS_DIR"
    echo "Files in $CONTRACTS_DIR: $(ls -la $CONTRACTS_DIR)"
    exit 1
fi

# Define contract paths
FACTORY_CONTRACT_PATH="$CONTRACTS_DIR/GoatZKCPFactory.sol:GoatZKCPFactory"
VERIFIER_CONTRACT_PATH="$CONTRACTS_DIR/Groth16Verifier.sol:Groth16Verifier"
LIBRARY_CONTRACT_PATH="$CONTRACTS_DIR/Groth16Core.sol:Groth16Core"
DEPLOY_FILE="out/deploy.txt"
ADDRESSES_FILE="out/addresses.json"

echo "Script started"

# Function to check if a contract is already deployed
check_deployment() {
    local contract_name=$1
    local file=$2
    
    if [ -f "$file" ]; then
        local address=$(grep "^$contract_name: " "$file" | cut -d' ' -f2)
        if [ -n "$address" ]; then
            echo "$address"
            return 0
        fi
    fi
    echo ""
    return 1
}

# Function to read JSON value
read_json_value() {
    local file=$1
    local key=$2
    
    if [ -f "$file" ]; then
        local value=$(grep -o "\"$key\": *\"[^\"]*\"" "$file" | grep -o "\"[^\"]*\"$" | tr -d '"')
        echo "$value"
    else
        echo ""
    fi
}

# Check if sforge is available
if ! command -v sforge &> /dev/null; then
    echo "Error: sforge command not found"
    echo "PATH: $PATH"
    exit 1
fi

prelude() {
    echo -e "${BLUE}Deploy GoatZKCPFactory and Groth16Verifier contracts to Seismic's devnet.${NC}"
    echo -e "This will deploy the core contracts for the GoatZKCP protocol."
    echo -ne "Press Enter to continue..."
    read -r
    echo "Prelude completed"
}

prelude

echo "After prelude"

# Use the dev wallet from config
address=$DEV_WALLET_ADDRESS
privkey=$DEV_WALLET_PRIVKEY

if [ -z "$address" ] || [ -z "$privkey" ]; then
    echo "Error: Wallet address or private key not set in config.sh"
    exit 1
fi

echo "Using wallet: $address"

# Create deploy directory if it doesn't exist
mkdir -p $(dirname "$DEPLOY_FILE")
echo "Created deploy directory"

# Check if all contracts are already deployed
echo "Checking for existing deployments in $DEPLOY_FILE"
verifier_address=$(check_deployment "Groth16Verifier" "$DEPLOY_FILE")
echo "Verifier address from file: '$verifier_address'"
library_address=$(check_deployment "Groth16Core" "$DEPLOY_FILE")
echo "Library address from file: '$library_address'"
factory_address=$(check_deployment "GoatZKCPFactory" "$DEPLOY_FILE")
echo "Factory address from file: '$factory_address'"

if [ -n "$verifier_address" ] && [ -n "$library_address" ] && [ -n "$factory_address" ]; then
    echo -e "${GREEN}All contracts are already deployed!${NC}"
    
    # Get transaction hashes from file
    verifier_tx=$(grep "^Groth16Verifier_tx: " "$DEPLOY_FILE" | cut -d' ' -f2)
    library_tx=$(grep "^Groth16Core_tx: " "$DEPLOY_FILE" | cut -d' ' -f2)
    factory_tx=$(grep "^GoatZKCPFactory_tx: " "$DEPLOY_FILE" | cut -d' ' -f2)
    
    echo -e "Verifier Address: ${GREEN}$verifier_address${NC}"
    echo -e "Verifier Link: ${GREEN}$EXPLORER_URL/address/$verifier_address${NC}"
    echo -e "Library Address: ${GREEN}$library_address${NC}"
    echo -e "Library Link: ${GREEN}$EXPLORER_URL/address/$library_address${NC}"
    echo -e "Factory Address: ${GREEN}$factory_address${NC}"
    echo -e "Factory Link: ${GREEN}$EXPLORER_URL/address/$factory_address${NC}"
    
    echo -e "\nDeployment details available in: ${GREEN}$DEPLOY_FILE${NC}"
    echo -e "JSON addresses available in: ${GREEN}$ADDRESSES_FILE${NC}"
    exit 0
fi

echo "Starting deployments"

# Now we can set -e after all the checks
set -e

# Deploy Groth16Verifier contract if not already deployed
if [ -z "$verifier_address" ]; then
    print_step "1" "Deploying Groth16Verifier contract"
    echo "Running sforge create for verifier..."
    verifier_output=$(sforge create \
        --rpc-url "$RPC_URL" \
        --private-key "$privkey" \
        --broadcast \
        "$VERIFIER_CONTRACT_PATH")
    print_success "Verifier deployed successfully."

    # Extract verifier contract address
    verifier_address=$(echo "$verifier_output" | grep "Deployed to:" | awk '{print $3}')
    verifier_tx=$(echo "$verifier_output" | grep "Transaction hash:" | awk '{print $3}')
    echo "Extracted verifier address: $verifier_address"
    echo "Groth16Verifier: $verifier_address" > "$DEPLOY_FILE"
    echo "Groth16Verifier_tx: $verifier_tx" >> "$DEPLOY_FILE"
    echo -e "Verifier Address: ${GREEN}$verifier_address${NC}"
    echo -e "Verifier Transaction: ${GREEN}$verifier_tx${NC}"
    echo -e "Verifier Link: ${GREEN}$EXPLORER_URL/address/$verifier_address${NC}"
else
    echo -e "${GREEN}Using existing Groth16Verifier at $verifier_address${NC}"
    # Get transaction hash from file if it exists
    verifier_tx=$(grep "^Groth16Verifier_tx: " "$DEPLOY_FILE" | cut -d' ' -f2 || echo "N/A")
fi

# Deploy Groth16Core library if not already deployed
if [ -z "$library_address" ]; then
    print_step "2" "Deploying Groth16Core library"
    echo "Running sforge create for library..."
    library_output=$(sforge create \
        --rpc-url "$RPC_URL" \
        --private-key "$privkey" \
        --broadcast \
        "$LIBRARY_CONTRACT_PATH")
    print_success "Groth16Core library deployed successfully."

    # Extract library contract address
    library_address=$(echo "$library_output" | grep "Deployed to:" | awk '{print $3}')
    library_tx=$(echo "$library_output" | grep "Transaction hash:" | awk '{print $3}')
    echo "Extracted library address: $library_address"
    echo "Groth16Core: $library_address" >> "$DEPLOY_FILE"
    echo "Groth16Core_tx: $library_tx" >> "$DEPLOY_FILE"
    echo -e "Library Address: ${GREEN}$library_address${NC}"
    echo -e "Library Transaction: ${GREEN}$library_tx${NC}"
    echo -e "Library Link: ${GREEN}$EXPLORER_URL/address/$library_address${NC}"
else
    echo -e "${GREEN}Using existing Groth16Core library at $library_address${NC}"
    # Get transaction hash from file if it exists
    library_tx=$(grep "^Groth16Core_tx: " "$DEPLOY_FILE" | cut -d' ' -f2 || echo "N/A")
fi

# Deploy GoatZKCPFactory contract with library linking if not already deployed
if [ -z "$factory_address" ]; then
    print_step "3" "Deploying GoatZKCPFactory contract"
    echo "Running sforge create for factory..."
    factory_output=$(sforge create \
        --rpc-url "$RPC_URL" \
        --private-key "$privkey" \
        --broadcast \
        --libraries "src/Groth16Core.sol:Groth16Core:$library_address" \
        "$FACTORY_CONTRACT_PATH")
    print_success "Factory deployed successfully."

    # Extract factory contract address
    factory_address=$(echo "$factory_output" | grep "Deployed to:" | awk '{print $3}')
    factory_tx=$(echo "$factory_output" | grep "Transaction hash:" | awk '{print $3}')
    echo "Extracted factory address: $factory_address"
    echo "GoatZKCPFactory: $factory_address" >> "$DEPLOY_FILE"
    echo "GoatZKCPFactory_tx: $factory_tx" >> "$DEPLOY_FILE"
    echo -e "Factory Address: ${GREEN}$factory_address${NC}"
    echo -e "Factory Transaction: ${GREEN}$factory_tx${NC}"
    echo -e "Factory Link: ${GREEN}$EXPLORER_URL/address/$factory_address${NC}"
    
    # Set the verifier address in the factory
    print_step "4" "Setting verifier address in factory"
    echo "Setting verifier address in factory..."
    set_verifier_output=$(sforge script \
        --rpc-url "$RPC_URL" \
        --private-key "$privkey" \
        --broadcast \
        --libraries "src/Groth16Core.sol:Groth16Core:$library_address" \
        --sig "setDefaultVerifier(address)" \
        "$factory_address" \
        "$verifier_address")
    print_success "Verifier address set in factory."
else
    echo -e "${GREEN}Using existing GoatZKCPFactory at $factory_address${NC}"
    # Get transaction hash from file if it exists
    factory_tx=$(grep "^GoatZKCPFactory_tx: " "$DEPLOY_FILE" | cut -d' ' -f2 || echo "N/A")
    
    echo -e "${BLUE}Note: If you need to set the verifier address in the factory, run:${NC}"
    echo -e "sforge script --rpc-url \"$RPC_URL\" --private-key \"$privkey\" --broadcast --libraries \"src/Groth16Core.sol:Groth16Core:$library_address\" --sig \"setDefaultVerifier(address)\" \"$factory_address\" \"$verifier_address\""
fi

echo "Creating JSON output file"
# Save addresses in JSON format for easy import in frontend
cat > "$ADDRESSES_FILE" << EOF
{
  "network": "seismic_devnet",
  "rpcUrl": "$RPC_URL",
  "explorerUrl": "$EXPLORER_URL",
  "contracts": {
    "Groth16Verifier": {
      "address": "$verifier_address",
      "transaction": "$verifier_tx"
    },
    "Groth16Core": {
      "address": "$library_address",
      "transaction": "$library_tx"
    },
    "GoatZKCPFactory": {
      "address": "$factory_address",
      "transaction": "$factory_tx"
    }
  },
  "deploymentTimestamp": "$(date -u +"%Y-%m-%dT%H:%M:%SZ")"
}
EOF

echo -e "\n"
print_success "Success! You've deployed the GoatZKCP protocol contracts on Seismic devnet."
echo -e "Factory Address: ${GREEN}$factory_address${NC}"
echo -e "Verifier Address: ${GREEN}$verifier_address${NC}"
echo -e "Library Address: ${GREEN}$library_address${NC}"
echo -e "Deployment details saved to: ${GREEN}$DEPLOY_FILE${NC}"
echo -e "JSON addresses saved to: ${GREEN}$ADDRESSES_FILE${NC}"
