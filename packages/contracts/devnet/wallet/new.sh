#!/bin/bash

set -e

source ./config.sh
source ./common/print.sh
source ./wallet/wallet.sh

dev_wallet
address=$DEV_WALLET_ADDRESS
privkey=$DEV_WALLET_PRIVKEY

# Output to console
echo "Address: $address"
echo "Private Key: $privkey"

# Output to file
output_file="wallet_output.txt"
echo "Address: $address" > "$output_file"
echo "Private Key: $privkey" >> "$output_file"