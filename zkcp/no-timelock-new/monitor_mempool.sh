#!/bin/bash

echo "Starting mempool monitor..."
echo "Waiting for transactions..."
echo -e "\n========================================\n"

# Keep track of transactions we've seen
SEEN_TXIDS=""

while true; do
    # Get raw mempool transactions
    MEMPOOL=$(bitcoin-cli -regtest getrawmempool)
    
    # If there are transactions in the mempool
    if [ "$(echo $MEMPOOL | jq '. | length')" -gt 0 ]; then
        # Loop through each transaction
        for txid in $(echo $MEMPOOL | jq -r '.[]'); do
            # Only process if we haven't seen this transaction before
            if [[ ! $SEEN_TXIDS =~ $txid ]]; then
                echo -e "\n[$(date '+%H:%M:%S')] New Transaction Detected!"
                echo "TXID: $txid"
                
                # Get and decode the raw transaction
                RAW_TX=$(bitcoin-cli -regtest getrawtransaction $txid)
                TX_INFO=$(bitcoin-cli -regtest decoderawtransaction $RAW_TX)
                
                # Display transaction details
                echo -e "\nTransaction Details:"
                echo "Version: $(echo $TX_INFO | jq -r .version)"
                echo "Size: $(echo $TX_INFO | jq -r .size) bytes"
                echo "vSize: $(echo $TX_INFO | jq -r .vsize) vBytes"
                
                # Show inputs
                echo -e "\nInputs:"
                echo $TX_INFO | jq -r '.vin[] | "  Previous TXID: \(.txid)\n  Output Index: \(.vout)"'
                
                # Show outputs
                echo -e "\nOutputs:"
                echo $TX_INFO | jq -r '.vout[] | "  Amount: \(.value) BTC\n  Type: \(.scriptPubKey.type)\n  Addresses: \(.scriptPubKey.addresses // [])"'
                
                # If it's a P2SH transaction, show more details
                if echo $TX_INFO | jq -r '.vout[].scriptPubKey.type' | grep -q "scripthash"; then
                    echo -e "\nP2SH Details Found!"
                    echo $TX_INFO | jq -r '.vout[] | select(.scriptPubKey.type=="scripthash") | "  Script: \(.scriptPubKey.hex)"'
                fi
                
                echo -e "\n========================================\n"
                
                # Mark this transaction as seen
                SEEN_TXIDS="$SEEN_TXIDS $txid"
            fi
        done
    fi
    
    sleep 0.5
done 