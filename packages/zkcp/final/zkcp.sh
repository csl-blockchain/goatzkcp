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

echo -e "\n========== ZKCP EXPERIMENT ==========\n"
echo -e "This script demonstrates the reveal phase in the Zero-Knowledge Contingent Payment flow\n"

# 1. Start Bitcoin Daemon if not running
if ! bitcoin-cli -regtest getblockcount &>/dev/null; then
    echo "[*] Starting Bitcoin Daemon..."
    bitcoind -regtest -fallbackfee=0.0001 -daemon -deprecatedrpc=create_bdb
    sleep 3
fi

# 2. Create wallets if they don't exist
WALLETS=$(bitcoin-cli -regtest listwallets)
if ! echo $WALLETS | grep -q "sellerwallet"; then
    echo "[*] Creating seller wallet..."
    bitcoin-cli -regtest createwallet "sellerwallet" false false "" false false > /dev/null 2>&1
fi

if ! echo $WALLETS | grep -q "buyerwallet"; then
    echo "[*] Creating buyer wallet..."
    bitcoin-cli -regtest createwallet "buyerwallet" false false "" false false > /dev/null 2>&1
fi

# 3. Get addresses
seller_address=$(bitcoin-cli -regtest -rpcwallet=sellerwallet getnewaddress) 
buyer_address=$(bitcoin-cli -regtest -rpcwallet=buyerwallet getnewaddress)
echo "[*] Seller address: $seller_address"
echo "[*] Buyer address: $buyer_address"

# 4. Fund the wallets if needed
echo "[*] Initial wallet balances:"
echo "    Seller: $(bitcoin-cli -regtest -rpcwallet=sellerwallet getreceivedbyaddress $seller_address) BTC"
echo "    Buyer: $(bitcoin-cli -regtest -rpcwallet=buyerwallet getreceivedbyaddress $buyer_address) BTC"

echo "[*] Mining blocks to fund seller wallet..."
bitcoin-cli -regtest generatetoaddress 101 $seller_address > /dev/null 2>&1

echo "[*] Mining blocks to fund buyer wallet..."
bitcoin-cli -regtest generatetoaddress 101 $buyer_address > /dev/null 2>&1

echo "[*] Wallet balances after funding:"
echo "    Seller: $(bitcoin-cli -regtest -rpcwallet=sellerwallet getreceivedbyaddress $seller_address) BTC"
echo "    Buyer: $(bitcoin-cli -regtest -rpcwallet=buyerwallet getreceivedbyaddress $buyer_address) BTC"

# Setup parameters
REAL_K=23062003

echo "[*] Seller computes parameters:"
echo "    K: $REAL_K (encryption key)"
echo "    Y = SHA256(K): $HASH_K"

RAW_TX=$(bitcoin-cli -regtest -rpcwallet=sellerwallet createrawtransaction "[]" "[{\"data\":\"$REAL_K\"}]")
FUNDED_TX=$(bitcoin-cli -regtest -rpcwallet=sellerwallet fundrawtransaction "$RAW_TX" | jq -r .hex)
SIGNED_TX=$(bitcoin-cli -regtest -rpcwallet=sellerwallet signrawtransactionwithwallet "$FUNDED_TX" | jq -r .hex)
TXID=$(bitcoin-cli -regtest sendrawtransaction "$SIGNED_TX")

echo -e "\nBroadcasted TXID with key: $TXID"

echo -e "\nRaw transaction: $TXID\n"

bitcoin-cli -regtest getrawtransaction "$TXID" true

# Show mempool after redemption transaction
check_mempool "redemption transaction"

echo -e "\n[*] Reveal phase of ZKCP demonstration complete"
