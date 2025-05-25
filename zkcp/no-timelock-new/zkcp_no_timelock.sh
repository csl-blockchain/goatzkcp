#!/bin/bash
set -e

# Helper functions
print_separator() {
    echo -e "\n========================================\n"
}

check_mempool() {
    local phase=$1
    echo -e "\n[*] Mempool status during $phase:"
    local mempool=$(bitcoin-cli -regtest getrawmempool true)
    if [ "$(echo $mempool | jq 'length')" -gt 0 ]; then
        echo "$mempool" | jq 'to_entries[] | {
            txid: .key,
            size: .value.size,
            fee: .value.fee,
            time: .value.time,
            "time in mempool": .value.time,
            descendantcount: .value.descendantcount
        }'
    else
        echo "    No transactions in mempool"
    fi
    print_separator
}

show_transaction_details() {
    local txid=$1
    local phase=$2
    echo "[*] Transaction details for $phase:"
    local tx_info=$(bitcoin-cli -regtest getrawtransaction $txid true)
    echo "$tx_info" | jq '{
        txid: .txid,
        size: .size,
        vsize: .vsize,
        fee: .fee,
        input_count: (.vin | length),
        output_count: (.vout | length),
        outputs: [.vout[] | {
            value: .value,
            type: .scriptPubKey.type,
            addresses: .scriptPubKey.addresses
        }]
    }'
    print_separator
}

# Main script starts here
echo -e "\n========== COMPLETE ZKCP (NO TIMELOCK) IMPLEMENTATION ==========\n"
echo -e "This script demonstrates a complete Zero-Knowledge Contingent Payment flow\n"

# Install required packages if not present
echo "[*] Checking required packages..."
if ! python3 -c "import bitcoin" &>/dev/null; then
    echo "[*] Installing python-bitcoinlib..."
    pip3 install python-bitcoinlib
fi

# 1. Start Bitcoin Daemon if not running
if ! bitcoin-cli -regtest getblockcount &>/dev/null; then
    echo "[*] Starting Bitcoin Daemon..."
    bitcoind -regtest -fallbackfee=0.0001 -daemon -deprecatedrpc=create_bdb
    sleep 3
fi

# 2. Create wallets if they don't exist
echo "[*] Setting up wallets..."
WALLETS=$(bitcoin-cli -regtest listwallets)
if ! echo $WALLETS | grep -q "sellerwallet"; then
    echo "    Creating seller wallet..."
    bitcoin-cli -regtest createwallet "sellerwallet" false false "" false false > /dev/null 2>&1
fi

if ! echo $WALLETS | grep -q "buyerwallet"; then
    echo "    Creating buyer wallet..."
    bitcoin-cli -regtest createwallet "buyerwallet" false false "" false false > /dev/null 2>&1
fi

# 3. Get addresses and show initial state
seller_address=$(bitcoin-cli -regtest -rpcwallet=sellerwallet getnewaddress) 
buyer_address=$(bitcoin-cli -regtest -rpcwallet=buyerwallet getnewaddress)
echo "[*] Addresses:"
echo "    Seller: $seller_address"
echo "    Buyer: $buyer_address"

print_separator

# 4. Fund the wallets and show balances
echo "[*] Initial wallet balances:"
echo "    Seller: $(bitcoin-cli -regtest -rpcwallet=sellerwallet getreceivedbyaddress $seller_address) BTC"
echo "    Buyer: $(bitcoin-cli -regtest -rpcwallet=buyerwallet getreceivedbyaddress $buyer_address) BTC"

echo "[*] Mining blocks to fund wallets..."
bitcoin-cli -regtest generatetoaddress 101 $seller_address > /dev/null 2>&1
bitcoin-cli -regtest generatetoaddress 101 $buyer_address > /dev/null 2>&1

echo "[*] Wallet balances after funding:"
echo "    Seller: $(bitcoin-cli -regtest -rpcwallet=sellerwallet getreceivedbyaddress $seller_address) BTC"
echo "    Buyer: $(bitcoin-cli -regtest -rpcwallet=buyerwallet getreceivedbyaddress $buyer_address) BTC"

print_separator

# 5. ZKCP Setup Phase
echo "========== ZKCP SETUP PHASE =========="
PRICE=7
REAL_K="HELLO"
HASH_K=$(python3 ../common/hash.py $REAL_K)
BLOCK_HEIGHT=$(bitcoin-cli -regtest getblockcount)

echo "[*] Parameters:"
echo "    Price: $PRICE BTC"
echo "    K: $REAL_K (encryption key)"
echo "    Y = SHA256(K): $HASH_K"
echo "    Current block height: $BLOCK_HEIGHT"

# Get public keys and generate redeem script
seller_pubkey=$(bitcoin-cli -regtest -rpcwallet=sellerwallet getaddressinfo $seller_address | jq -r .pubkey)
buyer_pubkey=$(bitcoin-cli -regtest -rpcwallet=buyerwallet getaddressinfo $buyer_address | jq -r .pubkey)
REDEEM_SCRIPT=$(python3 asm_no_timelock.py "$HASH_K" "$seller_pubkey" "$buyer_pubkey")
SCRIPT_INFO=$(bitcoin-cli -regtest decodescript "$REDEEM_SCRIPT")
P2SH_ADDRESS=$(echo "$SCRIPT_INFO" | jq -r .p2sh)

echo "[*] Contract details:"
echo "    Seller pubkey: $seller_pubkey"
echo "    Buyer pubkey: $buyer_pubkey"
echo "    P2SH Address: $P2SH_ADDRESS"

print_separator

# 6. Payment Setup Phase
echo "========== PAYMENT SETUP PHASE =========="
echo "[*] Buyer funding P2SH address..."
FUNDING_TXID=$(bitcoin-cli -regtest -rpcwallet=buyerwallet sendtoaddress "$P2SH_ADDRESS" $PRICE)
echo "[*] Funding transaction sent: $FUNDING_TXID"

# Show mempool after funding transaction
check_mempool "funding transaction"
show_transaction_details "$FUNDING_TXID" "funding transaction"

# Import scripts to wallets
echo "[*] Importing scripts to wallets..."
bitcoin-cli -regtest -rpcwallet=buyerwallet importaddress "$REDEEM_SCRIPT" "zkcp_redeem" false > /dev/null 2>&1
bitcoin-cli -regtest -rpcwallet=buyerwallet importaddress "$P2SH_ADDRESS" "zkcp_p2sh" false > /dev/null 2>&1
bitcoin-cli -regtest -rpcwallet=sellerwallet importaddress "$REDEEM_SCRIPT" "zkcp_redeem" false > /dev/null 2>&1
bitcoin-cli -regtest -rpcwallet=sellerwallet importaddress "$P2SH_ADDRESS" "zkcp_p2sh" false > /dev/null 2>&1

# Mine blocks and get UTXO details
echo "[*] Mining blocks to confirm funding..."
bitcoin-cli -regtest generatetoaddress 6 $buyer_address > /dev/null 2>&1

UTXO_TXID=$(bitcoin-cli -rpcwallet=buyerwallet -regtest listunspent 0 9999999 "[\"$P2SH_ADDRESS\"]" | jq -r .[0].txid)
VOUT=$(bitcoin-cli -rpcwallet=buyerwallet -regtest listunspent 0 9999999 "[\"$P2SH_ADDRESS\"]" | jq -r .[0].vout)
AMOUNT=$(bitcoin-cli -rpcwallet=buyerwallet -regtest listunspent 0 9999999 "[\"$P2SH_ADDRESS\"]" | jq -r .[0].amount)

echo "[*] P2SH UTXO details:"
echo "    TXID: $UTXO_TXID"
echo "    Output index: $VOUT"
echo "    Amount: $AMOUNT BTC"

print_separator

# 7. Payment Execution Phase
echo "========== PAYMENT EXECUTION PHASE =========="
echo "[*] Recording initial balances..."
SELLER_BALANCE_BEFORE=$(bitcoin-cli -regtest -rpcwallet=sellerwallet getbalance)
BUYER_BALANCE_BEFORE=$(bitcoin-cli -regtest -rpcwallet=buyerwallet getbalance)
P2SH_UNSPENT_BEFORE=$(bitcoin-cli -regtest -rpcwallet=buyerwallet listunspent 0 9999999 "[\"$P2SH_ADDRESS\"]" | jq -r '. | length')

echo "[*] Seller creating redemption transaction..."
python3 zkcp_no_timelock_tx.py "$REAL_K" "$REDEEM_SCRIPT" "$UTXO_TXID" "$VOUT" $AMOUNT

PREIMAGE_HEX="23062003"

RAW_TX=$(bitcoin-cli -regtest -rpcwallet=sellerwallet createrawtransaction "[]" "[{\"data\":\"$PREIMAGE_HEX\"}]")
FUNDED_TX=$(bitcoin-cli -regtest -rpcwallet=sellerwallet fundrawtransaction "$RAW_TX" | jq -r .hex)
SIGNED_TX=$(bitcoin-cli -regtest -rpcwallet=sellerwallet signrawtransactionwithwallet "$FUNDED_TX" | jq -r .hex)
TXID=$(bitcoin-cli -regtest sendrawtransaction "$SIGNED_TX")
echo "Broadcasted TXID with preimage: $TXID"

bitcoin-cli -regtest getrawtransaction "$TXID" true

# Show mempool after redemption transaction
check_mempool "redemption transaction"

# Mine confirmation blocks
# echo "[*] Mining confirmation blocks..."
# bitcoin-cli -regtest generatetoaddress 6 $seller_address > /dev/null 2>&1

print_separator

# 8. Verification Phase
echo "========== VERIFICATION PHASE =========="
echo "[*] Verifying K..."
COMPUTED_HASH=$(echo -n "$REAL_K" | sha256sum | awk '{print $1}')
echo "    Original hash: $HASH_K"
echo "    Computed hash: $COMPUTED_HASH"

if [ "$COMPUTED_HASH" = "$HASH_K" ]; then
    echo "[*] Hash verification successful!"
else 
    echo "[!] Hash verification failed!"
fi

# Final balance check
SELLER_BALANCE_AFTER=$(bitcoin-cli -regtest -rpcwallet=sellerwallet getbalance)
BUYER_BALANCE_AFTER=$(bitcoin-cli -regtest -rpcwallet=buyerwallet getbalance)
P2SH_UNSPENT_AFTER=$(bitcoin-cli -regtest -rpcwallet=buyerwallet listunspent 0 9999999 "[\"$P2SH_ADDRESS\"]" | jq -r '. | length')

SELLER_CHANGE=$(echo "$SELLER_BALANCE_AFTER - $SELLER_BALANCE_BEFORE" | bc)
BUYER_CHANGE=$(echo "$BUYER_BALANCE_AFTER - $BUYER_BALANCE_BEFORE" | bc)

echo "[*] Final balances:"
echo "    Seller: $SELLER_BALANCE_AFTER BTC (change: $SELLER_CHANGE BTC)"
echo "    Buyer: $BUYER_BALANCE_AFTER BTC (change: $BUYER_CHANGE BTC)"
echo "    P2SH UTXOs: $P2SH_UNSPENT_AFTER (was: $P2SH_UNSPENT_BEFORE)"

if [ "$P2SH_UNSPENT_BEFORE" -gt "$P2SH_UNSPENT_AFTER" ]; then
    echo "[*] Success: ZKCP completed successfully"
else
    echo "[!] Warning: P2SH funds may not have been spent properly"
fi

print_separator
echo "[*] ZKCP demonstration complete"
